import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import NotificationDropdown from "../Component/NotificationDropdown";
import { toast } from "react-toastify";
import {
    AppBar, Toolbar, Card, CardContent, Typography, Box,
    Button, Chip, Modal, useMediaQuery, Divider, CircularProgress, IconButton
} from "@mui/material";

import {
    Bell, Calendar, MapPin, Utensils, Hotel,
    Bike, Wind, ShoppingBag, Music, Accessibility, Monitor,
    Baby, Star, Soup, Disc, Crown, PartyPopper, Sparkles
} from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import UtensilsCrossed from "@mui/icons-material/Restaurant";

const getInitTime = () => {
    const now = new Date();
    const currentHour24 = now.getHours();
    const currentMinute = now.getMinutes();
    const initHour = currentHour24 % 12 || 12;
    const initPeriod = currentHour24 >= 12 ? "PM" : "AM";
    const initMinute = String(currentMinute).padStart(2, "0");
    return { initHour, initPeriod, initMinute };
};

const format12h = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    let hours = parseInt(h);
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${period}`;
};

export default function RestaurantDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isTablet = useMediaQuery("(max-width:1024px)");

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [reviews, setReviews] = useState([]);

    const [open, setOpen] = useState(false);
    const [reservationDate, setReservationDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [numberOfGuests, setNumberOfGuests] = useState(4);
    const [timeHour, setTimeHour] = useState(() => String(getInitTime().initHour).padStart(2, "0"));
    const [timeMinute, setTimeMinute] = useState(() => String(new Date().getMinutes()).padStart(2, "0"));
    const [timePeriod, setTimePeriod] = useState(() => getInitTime().initPeriod);

    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [eligibleResvId, setEligibleResvId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewImages, setReviewImages] = useState([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [availability, setAvailability] = useState({});

    useEffect(() => {
        setLoading(true);
        const fetchRestaurant = AxiosInstance.get(`api/restaurants/${id}/`);
        const fetchReviews = AxiosInstance.get(`api/restaurants/${id}/reviews/`);
        
        Promise.all([fetchRestaurant, fetchReviews])
            .then(([res1, res2]) => {
                setRestaurant(res1.data);
                setReviews(Array.isArray(res2.data) ? res2.data : []);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Failed to load restaurant data");
                setLoading(false);
            });
    }, [id]);

    const images = restaurant ? [
        restaurant.image, restaurant.menu_image, restaurant.interior_image
    ].filter(Boolean) : [];

    /* ── Carousel Logic ── */
    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    const [revealed, setRevealed] = useState({});
    useEffect(() => {
        if (loading) return;
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("data-reveal-id");
                    if (id) setRevealed(prev => ({ ...prev, [id]: true }));
                }
            });
        }, { threshold: 0.1 });
        const elements = document.querySelectorAll("[data-reveal-id]");
        elements.forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [loading]);

    const handleOpenModal = () => setOpen(true);
    const handleClose = () => setOpen(false);

    useEffect(() => {
        if (open && reservationDate && restaurant) {
            AxiosInstance.get(`api/restaurants/${id}/availability/?date=${reservationDate}`)
                .then(res => setAvailability(res.data))
                .catch(err => console.error("Error fetching availability:", err));
        }
    }, [open, reservationDate, restaurant, id]);

    const handleWriteReviewClick = async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            toast.error("Please login to write a review");
            navigate("/auth");
            return;
        }
        try {
            const res = await AxiosInstance.get(`api/eligible-reservation/?restaurant_id=${id}`);
            if (res.data.id) {
                setEligibleResvId(res.data.id);
                setReviewModalOpen(true);
            } else {
                toast.info("A confirmed reservation is required to leave a review.");
            }
        } catch (err) {
            toast.error("Error checking eligibility.");
        }
    };

    const handleReviewSubmit = async () => {
        if (!eligibleResvId) return;
        setIsSubmittingReview(true);
        try {
            const formData = new FormData();
            formData.append("reservation", eligibleResvId);
            formData.append("rating", reviewRating);
            formData.append("comment", reviewComment);
            if (reviewImages) {
                for (let i = 0; i < reviewImages.length; i++) {
                    formData.append("images", reviewImages[i]);
                }
            }

            const res = await AxiosInstance.post("api/reviews/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });
            toast.success("Thank you for your review!");
            setReviewModalOpen(false);
            
            // Real-time update
            const newReview = { ...res.data, user_name: "You", created_at: new Date().toISOString() };
            const updatedReviews = [newReview, ...reviews];
            setReviews(updatedReviews);
            
            const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = (sum / updatedReviews.length).toFixed(1);
            setRestaurant(prev => ({ ...prev, average_rating: avg, reviews_count: updatedReviews.length }));
            
            setReviewRating(5);
            setReviewComment("");
            setReviewImages([]);
        } catch (err) {
            toast.error("Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleReservation = () => {
        if (!reservationDate) { alert("Please select a date"); return; }
        
        let hour = parseInt(timeHour);
        if (timePeriod === "AM" && hour === 12) hour = 0;
        if (timePeriod === "PM" && hour !== 12) hour += 12;
        const formattedTime = `${String(hour).padStart(2, "0")}:${timeMinute}`;
        
        // --- Added Operating Hours Validation ---
        if (restaurant.opening_time && restaurant.closing_time) {
            const resvTimeVal = hour * 60 + parseInt(timeMinute);
            const [oH, oM] = restaurant.opening_time.split(":");
            const openVal = parseInt(oH) * 60 + parseInt(oM);
            const [cH, cM] = restaurant.closing_time.split(":");
            const closeVal = parseInt(cH) * 60 + parseInt(cM);

            if (resvTimeVal < openVal || resvTimeVal > closeVal) {
                toast.error(`Restaurant is only open from ${format12h(restaurant.opening_time)} to ${format12h(restaurant.closing_time)}`);
                return;
            }
        }

        if (!restaurant.is_open) {
            toast.error("This restaurant is currently closed and not accepting reservations.");
            return;
        }
        // ----------------------------------------

        const selected = new Date(`${reservationDate}T${formattedTime}`);
        if (selected < new Date(new Date().setSeconds(0, 0))) {
            alert("❌ Cannot book a past date or time! Please select a future time.");
            return;
        }
        navigate(`/reservation/${id}`, {
            state: { restaurant, reservationDate, reservationTime: formattedTime, numberOfGuests }
        });
    };

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#667eeaff" }} />
            <Typography style={{ fontFamily: "'Cormorant Garamond', serif", color: "#667eeaff" }}>
                Loading Restaurant…
            </Typography>
        </div>
    );

    if (error || !restaurant) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom>{error || "Restaurant not found"}</Typography>
            <Button variant="contained" onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
    );

    const heroHeight = isMobile ? 300 : 560;

    const S = {
        heroWrap: { 
            position: "relative", 
            overflow: "hidden", 
            backgroundColor: "#000",
            borderRadius: "0 0 24px 24px",
        },
        heroOverlay: {
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)",
            zIndex: 1, pointerEvents: "none"
        },
        heroTitle: { 
            position: "absolute", 
            bottom: isMobile ? "60px" : "80px", 
            left: isMobile ? "24px" : "80px", 
            zIndex: 2, 
            color: "#fff", 
            fontFamily: "'Poppins', sans-serif" 
        },
        heroBrand: { 
            fontSize: "clamp(2.5rem, 6vw, 4.5rem)", 
            fontWeight: 600, 
            lineHeight: 1.1, 
            letterSpacing: "-0.02em", 
            marginBottom: "12px", 
            textShadow: "0 4px 20px rgba(0,0,0,0.2)" 
        },
        heroSubtitle: { 
            fontSize: "clamp(0.9rem, 1.5vw, 1.1rem)", 
            fontWeight: 400, 
            opacity: 0.9, 
            letterSpacing: "0.03em",
            textTransform: "uppercase",
            display: "flex",
            alignItems: "center",
            gap: "10px",
        },
        heroDots: {
            position: "absolute",
            bottom: "50px",
            width: "100%",
            display: "flex",
            justifyContent: "center",
            gap: "8px",
            zIndex: 2,
        },
        infoBar: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: isMobile ? "24px" : "60px",
            padding: isMobile ? "24px" : "24px 40px",
            backgroundColor: "#fff",
            borderRadius: "16px",
            margin: isMobile ? "24px 24px 0" : "-30px 60px 0",
            position: "relative",
            zIndex: 10,
            boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
            border: "1px solid rgba(0,0,0,0.02)",
            flexWrap: "wrap",
        },
        infoSep: { width: "1px", height: "24px", backgroundColor: "#f1f5f9" },
        infoItem: {
            display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem",
            color: "#64748b", fontFamily: "'Poppins', sans-serif", fontWeight: 500,
        },
        infoIcon: { fontSize: "1.25rem", color: "#6366f1" },
        body: { maxWidth: "1350px", margin: "0 auto", padding: "0 24px" },
    };


    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Cormorant Garamond', 'Georgia', serif",backgroundColor:"#6365f127" }}>
            <link
                href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=Lato:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            <style>
                {`
                    @keyframes pulse {
                        0% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.8; transform: scale(0.98); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                    .reveal { opacity: 0; transform: translateY(20px); transition: all 0.6s cubic-bezier(0.2, 1, 0.3, 1); }
                    .reveal.active { opacity: 1; transform: translateY(0); }
                    
                    .detail-layout-container {
                        display: grid;
                        grid-template-columns: 1fr 380px;
                        gap: 40px;
                        margin-top: 40px;
                        align-items: flex-start;
                    }
                    
                    @media (max-width: 1024px) {
                        .detail-layout-container {
                            grid-template-columns: 1fr;
                            gap: 30px;
                        }
                    }

                    .main-content-area {
                        display: flex;
                        flex-direction: column;
                        gap: 30px;
                    }

                    .sidebar-area {
                        position: sticky;
                        top: 40px;
                    }

                    .section-card {
                        background: #ffffff;
                        padding: 40px;
                        border-radius: 24px;
                        border: 1px solid #f0f0f0;
                        box-shadow: 0 4px 25px rgba(0,0,0,0.02);
                    }

                    .section-title {
                        font-family: 'Playfair Display', serif;
                        font-size: 1.8rem;
                        font-weight: 700;
                        color: #1a1a1a;
                        margin-bottom: 24px;
                        position: relative;
                    }
                    
                    .section-title::after {
                        content: "";
                        position: absolute;
                        bottom: -10px;
                        left: 0;
                        width: 40px;
                        height: 3px;
                        background: #667eea;
                        border-radius: 2px;
                    }

                    .price-slot-card {
                        background: linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%);
                        border-radius: 20px;
                        padding: 24px;
                    }

                    .feature-pill {
                        background: #f8fafc;
                        border: 1px solid #e2e8f0;
                        padding: 12px 16px;
                        border-radius: 14px;
                        display: flex;
                        align-items: center;
                        gap: 12px;
                        transition: all 0.3s ease;
                    }
                    .feature-pill:hover {
                        background: #fff;
                        box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05);
                        transform: translateY(-2px);
                    }

                    .reservation-sidebar-card {
                        background: #fff;
                        border-radius: 28px;
                        border: 1px solid #eee;
                        padding: 32px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.04);
                    }

                    .review-item {
                        padding: 24px 0;
                        border-bottom: 1px solid #f1f1f1;
                    }
                    .review-item:last-child {
                        border-bottom: none;
                    }
                `}
            </style>


            {/* CUSTOM HEADER */}
            <header className="hotel-custom-header">
                <Link to="/" className="header-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/logo.jpeg" alt="ServNex Logo" style={{ height: "40px", width: "40px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                    ServNex
                </Link>
                <NotificationDropdown />
            </header>

            {/* ── Hero Carousel ── */}
            <div
                data-reveal-id="hero"
                className={`reveal ${revealed['hero'] ? 'active' : ''}`}
                style={{ ...S.heroWrap, height: heroHeight }}
            >
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img || "https://via.placeholder.com/1200x600?text=Restaurant"}
                        alt="restaurant"
                        style={{
                            position: "absolute",
                            top: 0, left: 0,
                            width: "100%", height: "100%",
                            objectFit: "cover",
                            opacity: index === activeIndex ? 1 : 0,
                            transition: "opacity 1.2s ease-in-out",
                        }}
                    />
                ))}
                <div style={S.heroOverlay} />

                {/* Restaurant name on image */}
                <div style={S.heroTitle}>
                    <div style={S.heroBrand}>
                        {restaurant.name}
                    </div>
                    <div style={S.heroSubtitle}>
                        <LocationOnIcon sx={{ fontSize: "1.2rem", opacity: 0.8 }} />
                         {restaurant.city}
                    </div>
                </div>

                {/* Carousel dots */}
                <div style={S.heroDots}>
                    {images.map((_, i) => (
                        <div
                            key={i}
                            onClick={() => setActiveIndex(i)}
                            style={{
                                width: i === activeIndex ? 30 : 8,
                                height: 8,
                                borderRadius: "8px",
                                backgroundColor: i === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                                cursor: "pointer",
                                transition: "all 0.4s ease",
                            }}
                        />
                    ))}
                </div>
            </div>

            {/* ── Info bar ── */}
            <div
                data-reveal-id="info-bar"
                className={`reveal ${revealed['info-bar'] ? 'active' : ''}`}
                style={S.infoBar}
            >
                <div style={S.infoItem}>
                    <LocationOnIcon style={S.infoIcon} />
                    <span style={{ fontWeight: 500 }}>{restaurant.area.slice(0, 25)}, {restaurant.city}</span>
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={S.infoItem}>
                    <StarIcon style={{ ...S.infoIcon, color: "#f59e0b" }} />
                    <span style={{ fontWeight: 700, color: "#1e293b" }}>{restaurant.average_rating || "4.5"}
                    <span style={{ fontSize: "0.85rem", color: "#94a3b8", marginLeft: "4px" }}>({restaurant.reviews_count || "0"} reviews)</span>
                    </span>
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={S.infoItem}>
                    <Chip 
                        label={restaurant.is_open ? "OPEN NOW" : "CLOSED NOW"} 
                        size="small"
                        sx={{ 
                            bgcolor: restaurant.is_open ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                            color: restaurant.is_open ? "#10b981" : "#ef4444",
                            fontWeight: 700, 
                            fontSize: "0.7rem",
                            borderRadius: "6px",
                            height: "24px"
                        }} 
                    />
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={S.infoItem}>
                    <Sparkles size={20} style={{ color: "#f59e0b" }} />
                    <span style={{ fontStyle: "italic", color: "#64748b", marginLeft: "8px" }}>Redefining Luxury & Comfort</span>
                </div>
            </div>

            {/* ── Main content layout ── */}
            <div style={{ ...S.body, paddingBottom: "100px" }}>
                <div className="detail-layout-container">
                    
                    {/* LEFT COLUMN: MAIN CONTENT */}
                    <div className="main-content-area">
                        
                        {/* About Section */}
                        <div className="section-card reveal active" data-reveal-id="about">
                            <h2 className="section-title">Experience & Ambience</h2>
                            <p style={{ 
                                fontFamily: "'Inter', sans-serif", 
                                fontSize: "1.05rem", 
                                color: "#444", 
                                lineHeight: "1.8", 
                                marginBottom: "24px" 
                            }}>
                                {restaurant.description}
                            </p>
                            
                            {Array.isArray(restaurant.nearby_attractions) && restaurant.nearby_attractions.length > 0 && (
                                <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #f0f0f0" }}>
                                    <Typography variant="overline" sx={{ color: "#667eea", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Nearby Attractions
                                    </Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
                                        {restaurant.nearby_attractions.map((place, idx) => (
                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f9f9f9", padding: "12px 16px", borderRadius: "12px" }}>
                                                <span style={{ fontSize: "0.95rem", fontWeight: 500, color: "#333" }}>{place.name}</span>
                                                <span style={{ fontSize: "0.85rem", color: "#666" }}>{parseFloat(place.distance_km).toFixed(1)} km</span>
                                            </div>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </div>

                        {/* Map Section */}
                        <div className="section-card reveal active" data-reveal-id="location" style={{ padding: "8px", overflow: "hidden" }}>
                            <iframe
                                height="400"
                                width="100%"
                                style={{ display: "block", border: 0, borderRadius: "16px" }}
                                loading="lazy"
                                src={`https://www.google.com/maps?q=${restaurant.area || 'Restaurant'}&output=embed`}
                                title="map"
                            />
                        </div>

                        {/* Features Section */}
                        <div className="section-card reveal active" data-reveal-id="features">
                            <h2 className="section-title">Amenities & Features</h2>
                            <Box sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
                                gap: 2
                            }}>
                                {[
                                    { name: "Home Delivery", icon: <Bike size={20} /> },
                                    { name: "Air Condition", icon: <Wind size={20} /> },
                                    { name: "Take-away", icon: <ShoppingBag size={20} /> },
                                    { name: "Live Music", icon: <Music size={20} /> },
                                    { name: "Wheelchair Accessible", icon: <Accessibility size={20} /> },
                                    { name: "Live Sports Screening", icon: <Monitor size={20} /> },
                                    { name: "Kids Allowed", icon: <Baby size={20} /> },
                                    { name: "5-star dining", icon: <Star size={20} /> },
                                    { name: "Buffet", icon: <Soup size={20} /> },
                                    { name: "Thali", icon: <Disc size={20} /> },
                                    { name: "Luxury Dining", icon: <Crown size={20} /> },
                                    { name: "New Year Specials", icon: <PartyPopper size={20} /> }
                                ].map((feature, idx) => (
                                    <div key={idx} className="feature-pill">
                                        <div style={{ color: "#667eea" }}>{feature.icon}</div>
                                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#444" }}>{feature.name}</span>
                                    </div>
                                ))}
                            </Box>
                        </div>

                        {/* Reviews Section */}
                        <div className="section-card reveal active" data-reveal-id="reviews">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px" }}>
                                <h2 className="section-title" style={{ marginBottom: 0 }}>Guest Reviews</h2>
                                <Button
                                    variant="outlined"
                                    onClick={handleWriteReviewClick}
                                    sx={{ borderRadius: "50px", px: 3, textTransform: "none", color: "#667eea", borderColor: "#667eea" }}
                                >
                                    Write a Review
                                </Button>
                            </div>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4, p: 3, background: "#fcfcff", borderRadius: "16px", border: "1px solid #edf2f7" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#1a1a1a", lineHeight: 1 }}>{restaurant?.average_rating || "N/A"}</div>
                                    <div style={{ fontSize: "0.85rem", color: "#666", marginTop: "4px" }}>out of 5</div>
                                </div>
                                <div style={{ width: "2px", height: "40px", background: "#e2e8f0" }}></div>
                                <div>
                                    <div style={{ display: "flex", gap: "2px", mb: 0.5 }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <StarIcon key={s} sx={{ color: s <= (parseFloat(restaurant?.average_rating) || 0) ? "#f59e0b" : "#d1d5db", fontSize: 20 }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#666", fontWeight: 500 }}>Based on {restaurant.reviews_count || reviews.length || 0} verified guest reviews</div>
                                </div>
                            </Box>

                            {!Array.isArray(reviews) || reviews.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                                    <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💬</div>
                                    <p>No reviews yet for this restaurant. Be the first to share your experience!</p>
                                </div>
                            ) : (
                                <div>
                                    {reviews.map((rev, idx) => (
                                        <div key={rev.id || idx} className="review-item">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                    <div style={{ width: "44px", height: "44px", borderRadius: "50%", background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.2rem", boxShadow: "0 4px 10px rgba(102,126,234,0.3)" }}>
                                                        {(rev.user_name || "G")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "#1a1a1a" }}>{rev.user_name || "Verified Guest"}</div>
                                                        <div style={{ fontSize: "0.8rem", color: "#718096" }}>
                                                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <StarIcon key={i} sx={{ color: i < rev.rating ? "#f59e0b" : "#d1d5db", fontSize: 16 }} />
                                                    ))}
                                                </div>
                                            </div>
                                            {rev.comment && (
                                                <p style={{ color: "#4a5568", lineHeight: 1.7, fontSize: "0.98rem", margin: "0 0 16px 56px" }}>
                                                    "{rev.comment}"
                                                </p>
                                            )}
                                            {rev.images && rev.images.length > 0 && (
                                                <div style={{ display: "flex", gap: "12px", marginLeft: "56px", flexWrap: "wrap" }}>
                                                    {rev.images.map((img, i) => (
                                                        <img
                                                            key={i}
                                                            src={img.image.startsWith("http") ? img.image : (AxiosInstance.defaults.baseURL || "http://127.0.0.1:8000") + img.image}
                                                            alt="review"
                                                            style={{ width: "100px", height: "100px", objectFit: "cover", borderRadius: "12px", cursor: "pointer", border: "1px solid #edf2f7", transition: "transform 0.2s" }}
                                                            onClick={() => window.open(img.image.startsWith("http") ? img.image : (AxiosInstance.defaults.baseURL || "http://127.0.0.1:8000") + img.image, '_blank')}
                                                            onMouseOver={(e) => e.currentTarget.style.transform = "scale(1.05)"}
                                                            onMouseOut={(e) => e.currentTarget.style.transform = "scale(1)"}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* RIGHT COLUMN: SIDEBAR */}
                    <aside className="sidebar-area">
                        <div className="reservation-sidebar-card">
                            <Box sx={{ mb: 3 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <Typography variant="h6" fontWeight="700" color="#1a1a1a">Reservation</Typography>
                                    <Chip 
                                        icon={<Utensils size={14} />} 
                                        label={restaurant.cuisine_type} 
                                        size="small" 
                                        sx={{ bgcolor: "rgba(102, 126, 234, 0.1)", color: "#667eea", fontWeight: 600 }} 
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#2d3748" }}>₹{Number(restaurant.average_cost_for_two).toLocaleString()}</span>
                                    <span style={{ fontSize: "0.9rem", color: "#718096" }}>/ slot</span>
                                </div>
                            </Box>

                            <Box sx={{ mb: 3, p: 2, background: "#fff9f2", borderRadius: "16px", border: "1px dashed #fbd38d" }}>
                                {restaurant.total_tables > 0 ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ed8936", animation: "pulse 2s infinite" }}></div>
                                        <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#c05621", letterSpacing: "0.02em" }}>
                                            HURRY! ONLY {restaurant.total_tables} TABLES LEFT
                                        </span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: "0.85rem", fontWeight: 700, color: "#e53e3e" }}>REGISTRATION CLOSED FOR NOW</span>
                                )}
                            </Box>

                            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#48bb78", marginTop: "6px" }}></div>
                                    <Typography variant="body2" color="#4a5568">Amount will be deducted from your final bill.</Typography>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f56565", marginTop: "6px" }}></div>
                                    <Typography variant="body2" color="#4a5568">No refund for cancellations.</Typography>
                                </div>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={handleOpenModal}
                                disabled={!restaurant.is_open}
                                sx={{
                                    py: 2,
                                    borderRadius: "16px",
                                    fontSize: "1.05rem",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    background: restaurant.is_open 
                                        ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                        : "#9ca3af",
                                    boxShadow: restaurant.is_open 
                                        ? "0 10px 20px rgba(102, 126, 234, 0.3)"
                                        : "none",
                                    transition: "all 0.3s ease",
                                    "&:hover": {
                                        transform: restaurant.is_open ? "translateY(-2px)" : "none",
                                        boxShadow: restaurant.is_open 
                                            ? "0 15px 30px rgba(102, 126, 234, 0.4)"
                                            : "none",
                                        background: restaurant.is_open 
                                            ? "linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                                            : "#9ca3af",
                                    }
                                }}
                            >
                                {restaurant.is_open ? "Reserve a Table" : "Currently Closed"}
                            </Button>
                        </div>

                        {/* Additional Sidebar Info */}
                        <Box sx={{ mt: 3, textAlign: "center", p: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1 }}>
                                <NotificationsIcon sx={{ fontSize: 16 }} />
                                Standard ServNex Booking Policy Applies
                            </Typography>
                        </Box>
                    </aside>
                </div>
            </div>


            <Modal open={open} onClose={handleClose}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)", bgcolor: "white",
                    p: 4, borderRadius: "20px", textAlign: "center",
                    width: 360, boxShadow: 24, outline: 'none'
                }}>
                    <Typography variant="h5" fontWeight="bold" mb={3}>Reserve a Table</Typography>
                    <Box display="flex" flexDirection="column" gap={3} textAlign="left">
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Reservation Date</Typography>
                            <input type="date" className="form-control form-control-lg"
                                value={reservationDate}
                                onChange={(e) => setReservationDate(e.target.value)}
                                min={new Date().toISOString().split('T')[0]} />
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Reservation Time</Typography>
                            <div className="d-flex gap-2">
                                <select className="form-select form-select-lg" value={timeHour} onChange={(e) => setTimeHour(e.target.value)}>
                                    {Array.from({ length: 12 }, (_, i) => {
                                        const h = String(i + 1).padStart(2, "0");
                                        return <option key={h} value={h}>{h}</option>;
                                    })}
                                </select>
                                <select className="form-select form-select-lg" value={timeMinute} onChange={(e) => setTimeMinute(e.target.value)}>
                                    {Array.from({ length: 60 }, (_, i) => {
                                        const m = String(i).padStart(2, "0");
                                        return <option key={m} value={m}>{m}</option>;
                                    })}
                                </select>
                                <select className="form-select form-select-lg" value={timePeriod} onChange={(e) => setTimePeriod(e.target.value)}>
                                    <option value="AM">AM</option>
                                    <option value="PM">PM</option>
                                </select>
                            </div>
                            {restaurant.opening_time && (
                                <Typography variant="caption" sx={{ mt: 1, display: 'block', color: "#667eea", fontWeight: 600 }}>
                                    🕒 Hours: {format12h(restaurant.opening_time)} - {format12h(restaurant.closing_time)}
                                </Typography>
                            )}
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Guest Count / Table Capacity</Typography>
                            <select className="form-select form-select-lg" value={numberOfGuests} onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}>
                                <option value={4}>4 Guests {availability[4] === 0 ? "(Full)" : `(${availability[4]} available)`}</option>
                                <option value={6}>6 Guests {availability[6] === 0 ? "(Full)" : `(${availability[6]} available)`}</option>
                                <option value={8}>8 Guests {availability[8] === 0 ? "(Full)" : `(${availability[8]} available)`}</option>
                                <option value={10}>10 Guests {availability[10] === 0 ? "(Full)" : `(${availability[10]} available)`}</option>
                            </select>
                            {availability[numberOfGuests] === 0 && (
                                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block', fontWeight: 600 }}>
                                    ⚠️ This table type is currently full for the selected date.
                                </Typography>
                            )}
                        </Box>
                    </Box>
                    <Box mt={4}>
                        <Button fullWidth variant="contained" size="large" onClick={handleReservation}
                            sx={{ borderRadius: 3, py: 1.5, fontWeight: "bold" }}>
                            Continue to Reservation
                        </Button>
                    </Box>
                </Box>
            </Modal>

            {/* Review Modal */}
            <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 450 }, bgcolor: 'white', borderRadius: "24px", p: 4, outline: "none",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.2)"
                }}>
                    <Typography variant="h5" fontWeight="700" mb={1} sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        Rate Your Experience
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3}>
                        How was your dining experience at {restaurant?.name}?
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <IconButton key={s} onClick={() => setReviewRating(s)}>
                                <StarIcon sx={{ fontSize: 40, color: s <= reviewRating ? "#f59e0b" : "#d1d5db" }} />
                            </IconButton>
                        ))}
                    </Box>

                    <textarea
                        placeholder="Write your review here..."
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        style={{
                            width: "100%", height: "100px", padding: "15px", borderRadius: "15px",
                            border: "1px solid #ddd", fontFamily: "inherit", fontSize: "0.95rem",
                            resize: "none", outline: "none", marginBottom: "15px"
                        }}
                    />

                    <Box mb={3} textAlign="left">
                        <Typography variant="body2" fontWeight="600" mb={1} color="text.secondary">Attach Photos (Optional)</Typography>
                        <input
                            type="file"
                            multiple
                            accept="image/*"
                            onChange={(e) => setReviewImages(e.target.files)}
                            style={{
                                display: "block", width: "100%", padding: "10px",
                                border: "1px dashed #ccc", borderRadius: "10px",
                                background: "#f9fafb", cursor: "pointer"
                            }}
                        />
                        {reviewImages && reviewImages.length > 0 && (
                            <Typography variant="caption" color="primary" sx={{ display: "block", mt: 1 }}>
                                {reviewImages.length} file(s) selected
                            </Typography>
                        )}
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleReviewSubmit}
                        disabled={isSubmittingReview}
                        sx={{
                            py: 1.5, borderRadius: "50px", textTransform: "none", fontWeight: 700,
                            background: "linear-gradient(135deg, #1e63d0 0%, #3a86ff 100%)",
                            boxShadow: "0 10px 20px rgba(30,99,208,0.3)",
                            "&:hover": { transform: "translateY(-2px)" }
                        }}
                    >
                        {isSubmittingReview ? "Submitting..." : "Post Review"}
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}