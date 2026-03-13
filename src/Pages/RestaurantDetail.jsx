import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";
import {
    AppBar, Toolbar, Card, CardContent, Typography, Box,
    Button, Chip, Modal, useMediaQuery, Divider, CircularProgress, IconButton
} from "@mui/material";

import { Bell, Calendar, MapPin, Utensils, Hotel } from "lucide-react";
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
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

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
            const res = await AxiosInstance.post("api/reviews/", {
                reservation: eligibleResvId,
                rating: reviewRating,
                comment: reviewComment
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
        heroWrap: { position: "relative", overflow: "hidden", backgroundColor: "#1a1308" },
        heroOverlay: {
            position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
            background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 100%)",
            zIndex: 1, pointerEvents: "none"
        },
        heroTitle: { position: "absolute", bottom: "80px", left: "80px", zIndex: 2, color: "#fff", fontFamily: "'Playfair Display', serif" },
        heroBrand: { fontSize: "clamp(3.5rem, 8vw, 6rem)", fontWeight: 400, lineHeight: 0.8, letterSpacing: "-0.02em", marginBottom: "10px", textShadow: "0 4px 20px rgba(0,0,0,0.3)", position: "relative" },
        heroSubtitle: { fontSize: "clamp(1.2rem, 3vw, 2rem)", fontWeight: 500, opacity: 0.9, letterSpacing: "0.03em" },
        infoBar: {
            display: "flex", alignItems: "center", justifyContent: "center", gap: "40px",
            padding: "20px 30px", backgroundColor: "#fff", borderBottom: "1px solid rgba(139, 105, 20, 0.1)",
            flexWrap: "wrap",
        },
        infoSep: { width: "2px", height: "24px", backgroundColor: "#667eeaff", opacity: 0.6 },
        infoItem: {
            display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem",
            color: "#000", fontFamily: "'Playfair Display', serif", fontWeight: 500, letterSpacing: "0.05em",
        },
        infoIcon: { fontSize: "1.3rem", color: "#667eeaff" },
        luxurySection: { backgroundColor: "#FFFFFF", width: "100%", minHeight: "60vh", padding: "80px 0 100px", position: "relative" },
        body: { maxWidth: "1400px", margin: "0 auto", padding: "0 48px" },
        twoCol: { display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "48px", alignItems: "flex-start", minHeight: "400px" },
        luxuryLeftPanel: { padding: "40px 48px 40px 0", display: "flex", flexDirection: "column", justifyContent: "flex-start", alignItems: "flex-start", maxWidth: "560px" },
        luxuryRightPanel: { display: "flex", alignItems: "center", justifyContent: "flex-end" },
        sectionTitle: { fontFamily: "'Poppins', sans-serif", fontSize: "clamp(2.1rem, 6vw, 1.5rem)", fontWeight: 400, color: "#282828", marginBottom: "32px", lineHeight: 0.5, letterSpacing: "-0.02em" },
        descText: { fontFamily: "'Inter', 'Roboto', 'Open Sans', sans-serif", fontSize: "1.05rem", color: "#555555", lineHeight: 1.8, marginBottom: "0", maxWidth: "540px" },
        mapCard: {
            width: "100%", maxWidth: "700px", borderRadius: "32px", overflow: "hidden",
            boxShadow: "0 25px 60px rgba(0, 0, 0, 0.12), 0 10px 20px rgba(0, 0, 0, 0.05)",
            border: "8px solid rgba(255, 255, 255, 0.6)", background: "#fff", transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        },
        heroDots: { position: "absolute", bottom: "35px", width: "100%", display: "flex", justifyContent: "center", gap: "12px", zIndex: 2 },
        bookBtn: {
            width: "auto",
            minWidth: "280px",
            padding: "18px 40px",
            borderRadius: "50px",
            border: "1.5px solid rgba(102, 126, 234, 0.4)",
            background: "rgba(255, 255, 255, 0.9)",
            color: "#667eea",
            fontFamily: "'Lato', sans-serif",
            fontWeight: 800,
            fontSize: "1rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            cursor: "pointer",
            transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
            boxShadow: "0 12px 30px -10px rgba(102, 126, 234, 0.4), 0 4px 10px -2px rgba(102, 126, 234, 0.1)",
            backdropFilter: "blur(10px)",
        },
    };

    return (
        <div style={{ minHeight: "100vh", fontFamily: "'Cormorant Garamond', 'Georgia', serif" }}>
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
                    .reveal { opacity: 0; transform: translateY(30px); transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1); }
                    .reveal.active { opacity: 1; transform: translateY(0); }
                    .map-card-hover:hover { transform: translateY(-10px) scale(1.02); box-shadow: 0 40px 80px rgba(102, 126, 234, 0.15); }
                    
                    .premium-card {
                        border: 1px solid #ffffff;
                        border-radius: 28px;
                        box-shadow: 0 20px 40px rgba(0, 0, 0, 0); /* Soft large shadow from image */
                    }
                    .info-tag {
                        background: linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%);
                        backdrop-filter: blur(10px);
                        padding: 6px 16px;
                        font-size: 0.85rem;
                        color: #555;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        border-radius: 50px;
                    }
                    .price-main {
                        color: #1e63d0;
                        font-weight: 700;
                        font-size: 1.6rem;
                    }
                    .reservation-btn {
                        background: linear-gradient(135deg, #3a86ff 0%, #1e63d0 100%);
                        color: white !important;
                        border-radius: 12px;
                        padding: 14px;
                        font-weight: 600;
                        font-size: 1.1rem;
                        text-transform: none;
                        box-shadow: 0 8px 16px rgba(30, 99, 208, 0.2);
                        transition: all 0.3s ease;
                        border: none;
                        width: 100%;
                    }
                    .reservation-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 12px 20px rgba(30, 99, 208, 0.3);
                        opacity: 0.9;
                    }
                    .info-grid-item {
                        padding: 12px 0;
                        border-bottom: 1px solid #f0f0f0;
                    }

                    /* Ported from HotelDetail.jsx for premium buttons */
                    .smooth-grad-btn {
                        position: relative;
                        overflow: hidden;
                        z-index: 1;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        text-decoration: none;
                    }
                    .smooth-grad-btn::before {
                        content: "";
                        position: absolute;
                        top: 0; left: 0; right: 0; bottom: 0;
                        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                        z-index: -1;
                        opacity: 0;
                        transition: opacity 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .smooth-grad-btn:hover {
                        color: #fff !important;
                        transform: translateY(-5px) scale(1.02);
                        box-shadow: 0 25px 50px -12px rgba(102, 126, 234, 0.5) !important;
                        border-color: transparent !important;
                    }
                    .smooth-grad-btn:hover::before {
                        opacity: 1;
                    }
                `}
            </style>

            {/* CUSTOM HEADER */}
            <header className="hotel-custom-header">
                <Link to="/" className="header-logo" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: "12px" }}>
                    <img src="/logo.jpeg" alt="ServNex Logo" style={{ height: "40px", width: "40px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" }} />
                    ServNex
                </Link>
                <div className="notification-bell-circle">
                    <Bell size={20} />
                    <div className="bell-overlay">Bell</div>
                </div>
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
                <div style={{
                    ...S.heroTitle,
                    bottom: isMobile ? "80px" : "70px",
                    left: isMobile ? "24px" : "50px",
                    textAlign: isMobile ? "left" : "inherit"
                }}>
                    <div style={{
                        ...S.heroBrand,
                        fontSize: isMobile ? "3.2rem" : S.heroBrand.fontSize
                    }}>
                        {restaurant.name}
                    </div>
                    <div style={{
                        ...S.heroSubtitle,
                        fontSize: isMobile ? "1.2rem" : S.heroSubtitle.fontSize
                    }}>
                        {restaurant.area}
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
                style={{ ...S.infoBar, gap: isMobile ? "20px" : S.infoBar.gap, padding: isMobile ? "20px 1.5rem" : S.infoBar.padding }}
            >
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.85rem" : S.infoItem.fontSize }}>
                    <LocationOnIcon style={{ ...S.infoIcon, fontSize: isMobile ? "1.1rem" : S.infoIcon.fontSize }} />
                    {restaurant.area}, {restaurant.city}
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.85rem" : S.infoItem.fontSize }}>
                    <StarIcon style={{ ...S.infoIcon, color: "#f4c430", fontSize: isMobile ? "1.1rem" : S.infoIcon.fontSize }} />
                    <strong>{restaurant.average_rating || restaurant.rating || "4.8"}</strong>&nbsp;
                    <span style={{ fontWeight: 400, color: "#667eeaff" }}>({restaurant.reviews_count || "876"} reviews)</span>
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.85rem" : S.infoItem.fontSize, textAlign: "center", width: isMobile ? "100%" : "auto" }}>
                    <span style={{ fontSize: isMobile ? "1.2rem" : "1.4rem" }}>🍽️</span>
                    Experience Gastronomy – Where every meal is a celebration.
                </div>
            </div>

            {/* ── Luxury Section ── */}
            <section
                style={{
                    ...S.luxurySection,
                    padding: isMobile ? "64px 0 80px" : "100px 0 120px",
                    borderTop: "1px solid rgba(102, 126, 234, 0.1)",
                    borderBottom: "1px solid rgba(102, 126, 234, 0.1)",
                }}>
                <div style={{ ...S.body, padding: isMobile ? "0 24px" : "0 48px", maxWidth: isMobile ? "100%" : "1250px" }}>
                    <div style={isMobile
                        ? { display: "flex", flexDirection: "column", gap: "40px" }
                        : { ...S.twoCol, gridTemplateColumns: "1.15fr 0.85fr", gap: "48px" }
                    }>
                        <div style={isMobile
                            ? { padding: "24px 0", textAlign: "center" }
                            : { ...S.luxuryLeftPanel, textAlign: "left" }
                        }>
                            <div data-reveal-id="luxury-title" className={`reveal ${revealed['luxury-title'] ? 'active' : ''}`}>
                                <h2 style={{ ...S.sectionTitle, textAlign: "left", fontSize: isMobile ? "2.5rem" : S.sectionTitle.fontSize }}>
                                    About Us
                                </h2>
                            </div>
                            <p
                                data-reveal-id="luxury-desc"
                                className={`reveal ${revealed['luxury-desc'] ? 'active' : ''}`}
                                style={{ ...S.descText, margin: isMobile ? "0 auto 16px" : "0 0 16px", textAlign: isMobile ? "justify" : "left" }}
                            >
                                {restaurant.description}
                            </p>

                            {Array.isArray(restaurant.nearby_attractions) && restaurant.nearby_attractions.length > 0 && (
                                <div style={{ marginTop: "24px", width: "100%" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", color: "#667eeaff", marginBottom: "8px" }}>
                                        Nearby Places
                                    </div>
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                        {restaurant.nearby_attractions.map((place, idx) => (
                                            <li key={place.id || idx} style={{ display: "flex", justifyContent: "space-between", fontSize: "0.95rem", marginBottom: "6px" }}>
                                                <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: "70%" }}>
                                                    {place.name}
                                                </span>
                                                <span style={{ color: "#555", marginLeft: "12px" }}>
                                                    {parseFloat(place.distance_km).toFixed(2)} km
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div
                            data-reveal-id="luxury-map"
                            style={isMobile
                                ? { display: "flex", justifyContent: "center", width: "100%" }
                                : S.luxuryRightPanel
                            } className={`reveal ${revealed['luxury-map'] ? 'active' : ''}`}>
                            <div className="map-card-hover" style={{ ...S.mapCard, maxWidth: "100%", width: "100%" }}>
                                <iframe
                                    height={isMobile ? "350" : "500"}
                                    width="100%"
                                    style={{ display: "block", border: 0 }}
                                    loading="lazy"
                                    src={`https://www.google.com/maps?q=${restaurant.area || 'Restaurant'}&output=embed`}
                                    title="map"
                                />
                            </div>
                        </div>
                    </div>
                    {/* ── REVIEWS SECTION ── */}
                    <div
                        data-reveal-id="reviews"
                        className={`reveal ${revealed['reviews'] ? 'active' : ''}`}
                        style={{ marginTop: "60px", padding: "30px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #eee", boxShadow: "0 4px 25px rgba(0,0,0,0.03)" }}
                    >
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" }}>
                            <div>
                                <h3 style={{ fontSize: "1.6rem", fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: "#2c1810", marginBottom: "5px" }}>
                                    Guest Reviews
                                </h3>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <StarIcon key={s} sx={{ color: s <= (restaurant?.average_rating || 0) ? "#f59e0b" : "#d1d5db", fontSize: 20 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontWeight: 600, color: "#2c1810" }}>{restaurant?.average_rating || "New"}</span>
                                    <span style={{ color: "#888", fontSize: "0.9rem" }}>({reviews?.length || 0} reviews)</span>
                                </div>
                            </div>
                            <Button
                                variant="outlined"
                                onClick={handleWriteReviewClick}
                                sx={{ borderRadius: "10px", textTransform: "none", color: "#667eea", borderColor: "#667eea" }}
                            >
                                Write a Review
                            </Button>
                        </div>

                        {!Array.isArray(reviews) || reviews.length === 0 ? (
                            <div style={{ textAlign: "center", padding: "40px 0", color: "#888" }}>
                                <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💬</div>
                                <p>No reviews yet for this restaurant. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                {reviews.map((rev, idx) => (
                                    <div key={rev.id || idx} style={{ borderBottom: idx === reviews.length - 1 ? "none" : "1px solid #f0f0f0", paddingBottom: "25px" }}>
                                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "10px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                                <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "#667eaf", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.1rem" }}>
                                                    {(rev.user_name || "G")[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div style={{ fontWeight: 600, color: "#2c1810" }}>{rev.user_name || "Verified Guest"}</div>
                                                    <div style={{ fontSize: "0.8rem", color: "#888" }}>
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
                                            <p style={{ color: "#444", lineHeight: 1.6, fontSize: "0.95rem", margin: 0, paddingLeft: "52px" }}>
                                                "{rev.comment}"
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <div className="container my-5 px-lg-5">
                <Card className="premium-card overflow-hidden">
                    <CardContent className="p-5">
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            {restaurant.total_tables > 0 && (
                                <Box sx={{
                                    background: restaurant.total_tables < 3 ? "rgba(255, 152, 0, 0.1)" : "rgba(76, 175, 80, 0.1)",
                                    color: restaurant.total_tables < 3 ? "#ef6c00" : "#2e7d32",
                                    padding: "10px 24px",
                                    borderRadius: "50px",
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 1.5,
                                    fontFamily: "'Poppins', sans-serif",
                                    fontWeight: 700,
                                    fontSize: "0.85rem",
                                    letterSpacing: "0.1em",
                                    border: `1px solid ${restaurant.total_tables < 3 ? "rgba(255, 152, 0, 0.2)" : "rgba(76, 175, 80, 0.2)"}`,
                                    backdropFilter: "blur(10px)",
                                    animation: "pulse 2s infinite ease-in-out"
                                }}>
                                    <span style={{
                                        width: "8px",
                                        height: "8px",
                                        borderRadius: "50%",
                                        background: restaurant.total_tables < 3 ? "#ef6c00" : "#2e7d32",
                                        boxShadow: `0 0 10px ${restaurant.total_tables < 3 ? "#ef6c00" : "#2e7d32"}`
                                    }}></span>
                                    HURRY! ONLY {restaurant.total_tables} {restaurant.total_tables === 1 ? 'TABLE' : 'TABLES'} LEFT.
                                </Box>
                            )}

                            <div className="smooth-grad-btn"
                                style={{
                                    ...S.bookBtn,
                                    width: "auto",
                                    padding: "6px 15px",
                                    marginTop: 0,
                                    fontSize: "0.85rem",
                                    maxHeight: "36px",
                                    backdropFilter: "blur(10px)",
                                    textTransform: "uppercase",
                                    letterSpacing: "0.1em",
                                }}>
                                <Utensils size={14} className="me-2" />
                                {restaurant.cuisine_type}
                            </div>
                        </div>

                        <Divider sx={{ mb: 4 }} />

                        <div className="mb-4">
                            <span className="price-main">₹{Number(restaurant.average_cost_for_two).toLocaleString()}</span>
                            <span style={{ color: "#636e72", marginLeft: "10px", fontSize: "1.1rem" }}>For Slot</span>
                            <div>
                                <p style={{ color: "#636e72", fontSize: "0.9rem", width: "fit-content", backgroundColor: "rgba(76, 175, 80, 0.1)", padding: "5px 16px", borderRadius: "50px", marginBottom: "8px" }}>This amount will be deducted from your bill</p>
                                <p style={{ color: "#ef6c00", fontSize: "0.9rem", width: "fit-content", backgroundColor: "rgba(255, 152, 0, 0.1)", padding: "5px 16px", borderRadius: "50px" }}>No Refund for cancellation</p>
                            </div>
                        </div>

                        {/* Features Section */}
                        <Box sx={{
                            background: "rgba(255, 255, 255, 0.6)",
                            backdropFilter: "blur(20px)",
                            borderRadius: "32px",
                            p: { xs: 3, md: 5 },
                            mb: 4,
                            border: "1px solid rgba(102, 126, 234, 0.15)",
                            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.05)"
                        }}>
                            <Typography variant="h5" sx={{
                                fontFamily: "'Poppins', sans-serif",
                                fontWeight: 600,
                                color: "#2d3436",
                                mb: 4,
                                display: "flex",
                                alignItems: "center",
                                gap: 1.5
                            }}>
                                <span style={{ width: "8px", height: "32px", background: "linear-gradient(to bottom, #667eea, #764ba2)", borderRadius: "4px" }}></span>
                                Features
                            </Typography>

                            <Box sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" },
                                gap: 3
                            }}>
                                {[
                                    { name: "Home Delivery", icon: <Bike size={22} /> },
                                    { name: "Air Condition", icon: <Wind size={22} /> },
                                    { name: "Take-away", icon: <ShoppingBag size={22} /> },
                                    { name: "Live Music", icon: <Music size={22} /> },
                                    { name: "Wheelchair Accessible", icon: <Accessibility size={22} /> },
                                    { name: "Live Sports Screening", icon: <Monitor size={22} /> },
                                    { name: "Kids Allowed", icon: <Baby size={22} /> },
                                    { name: "5-star dining", icon: <Star size={22} /> },
                                    { name: "Buffet", icon: <Soup size={22} /> },
                                    { name: "Thali", icon: <Disc size={22} /> },
                                    { name: "Luxury Dining", icon: <Crown size={22} /> },
                                    { name: "New Year Specials", icon: <PartyPopper size={22} /> }
                                ].map((feature, idx) => (
                                    <Box
                                        key={idx}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 2,
                                            p: 2,
                                            borderRadius: "16px",
                                            transition: "all 0.3s ease",
                                            "&:hover": {
                                                background: "rgba(102, 126, 234, 0.08)",
                                                transform: "translateY(-3px)"
                                            }
                                        }}
                                    >
                                        <Box sx={{
                                            color: "#667eea",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            background: "rgba(102, 126, 234, 0.1)",
                                            p: 1,
                                            borderRadius: "12px"
                                        }}>
                                            {feature.icon}
                                        </Box>
                                        <Typography variant="body2" sx={{ fontWeight: 500, color: "#444", fontSize: "0.95rem" }}>
                                            {feature.name}
                                        </Typography>
                                    </Box>
                                ))}
                            </Box>
                        </Box>

                        {/* Reservation Box */}
                        <Box sx={{
                            background: "rgba(255, 255, 255, 0.6)",
                            backdropFilter: "blur(20px)", borderRadius: "16px", p: 3
                        }}>
                            {restaurant.total_tables < 5 && restaurant.total_tables > 0 && (
                                <div className="text-center mb-3">
                                    <Chip label="Limited Tables Available!" color="warning" size="small" sx={{ fontWeight: 600 }} />
                                </div>
                            )}
                            <div className="d-flex justify-content-center">
                                <button
                                    className="smooth-grad-btn"
                                    style={{ ...S.bookBtn, marginTop: 0 }}
                                    onClick={handleOpenModal}
                                >
                                    Reserve a Table
                                </button>
                            </div>
                        </Box>
                    </CardContent>
                </Card>
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
                        </Box>
                        <Box>
                            <Typography variant="subtitle2" color="text.secondary" mb={1}>Type of Table</Typography>
                            <select className="form-select form-select-lg" value={numberOfGuests} onChange={(e) => setNumberOfGuests(parseInt(e.target.value))}>
                                {[4, 6, 8, 10].map(num => <option key={num} value={num}>{num} Guest Table</option>)}
                            </select>
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
                            width: "100%", height: "120px", padding: "15px", borderRadius: "15px",
                            border: "1px solid #ddd", fontFamily: "inherit", fontSize: "0.95rem",
                            resize: "none", outline: "none", marginBottom: "20px"
                        }}
                    />

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