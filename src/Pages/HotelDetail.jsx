import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";
import { Bell } from "lucide-react";

import {
    Card,
    CardContent,
    Typography,
    Box,
    Button,
    Chip,
    Modal,
    useMediaQuery,
    Divider,
    CircularProgress,
    IconButton,
} from "@mui/material";

import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import WifiIcon from "@mui/icons-material/Wifi";
import LocalParkingIcon from "@mui/icons-material/LocalParking";
import RestaurantIcon from "@mui/icons-material/Restaurant";
import PoolIcon from "@mui/icons-material/Pool";
import FitnessCenterIcon from "@mui/icons-material/FitnessCenter";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import LocalBarIcon from "@mui/icons-material/LocalBar";
import SpaIcon from "@mui/icons-material/Spa";
import RoomServiceIcon from "@mui/icons-material/RoomService";
import LocalLaundryServiceIcon from "@mui/icons-material/LocalLaundryService";
import TvIcon from "@mui/icons-material/Tv";
import KitchenIcon from "@mui/icons-material/Kitchen";
import CheckIcon from "@mui/icons-material/Check";

const amenityIconMap = {
    "Wifi": <WifiIcon sx={{ color: "#667eeaff" }} />,
    "Parking": <LocalParkingIcon sx={{ color: "#667eeaff" }} />,
    "Restaurant": <RestaurantIcon sx={{ color: "#667eeaff" }} />,
    "Pool": <PoolIcon sx={{ color: "#667eeaff" }} />,
    "Gym": <FitnessCenterIcon sx={{ color: "#667eeaff" }} />,
    "AC": <AcUnitIcon sx={{ color: "#667eeaff" }} />,
    "Bar": <LocalBarIcon sx={{ color: "#667eeaff" }} />,
    "Spa": <SpaIcon sx={{ color: "#667eeaff" }} />,
    "Room Service": <RoomServiceIcon sx={{ color: "#667eeaff" }} />,
    "Laundry": <LocalLaundryServiceIcon sx={{ color: "#667eeaff" }} />,
    "TV": <TvIcon sx={{ color: "#667eeaff" }} />,
    "Kitchen": <KitchenIcon sx={{ color: "#667eeaff" }} />,
};

/* ─── inline styles (no extra CSS file needed) ─── */
const S = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#fdfaf6",
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        color: "#2c1810",
    },

    /* ── Header ── */
    header: {
        background: "white",
        height: "70px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 2px 10px rgba(0, 0, 0, 0.03)",
        transition: "padding 0.3s ease",
    },

    logoWrap: {
        fontSize: "24px",
        fontWeight: 600,
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        WebkitTextFillColor: "transparent",
        letterSpacing: "0.5px",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },

    logoImg: {
        height: "40px",
        width: "40px",
        borderRadius: "10px",
        objectFit: "cover",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },

    bellBtn: {
        width: "42px",
        height: "42px",
        borderRadius: "50%",
        border: "1.5px solid #4f46e5",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4f46e5",
        cursor: "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        overflow: "hidden",
    },

    bellOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backdropFilter: "blur(5px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white",
        fontSize: "10px",
        fontWeight: 600,
        opacity: 0,
        transition: "opacity 0.3s ease",
        borderRadius: "50%",
    },

    /* ── Hero carousel ── */
    heroWrap: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#1a1308",
    },
    heroOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.4) 60%, rgba(0,0,0,0.6) 100%)",
        zIndex: 1,
        pointerEvents: "none",
    },
    heroTitle: {
        position: "absolute",
        bottom: "80px",
        left: "80px",
        zIndex: 2,
        color: "#fff",
        fontFamily: "'Playfair Display', serif",
    },
    heroBrand: {
        fontSize: "clamp(3.5rem, 8vw, 6rem)",
        fontWeight: 400,
        lineHeight: 0.8,
        letterSpacing: "-0.02em",
        marginBottom: "10px",
        textShadow: "0 4px 20px rgba(0,0,0,0.3)",
        position: "relative",
    },
    heroSubtitle: {
        fontSize: "clamp(1.2rem, 3vw, 2rem)",
        fontWeight: 500,
        opacity: 0.9,
        letterSpacing: "0.03em",
    },
    heroDots: {
        position: "absolute",
        bottom: "35px",
        width: "100%",
        display: "flex",
        justifyContent: "center",
        gap: "12px",
        zIndex: 2,
    },

    /* ── Info bar ── */
    infoBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "40px",
        padding: "20px 30px",
        backgroundColor: "#fff",
        borderBottom: "1px solid rgba(139, 105, 20, 0.1)",
        flexWrap: "wrap",
    },
    infoSep: {
        width: "2px",
        height: "24px",
        backgroundColor: "#667eeaff",
        opacity: 0.6,
    },
    infoItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "0.95rem",
        color: "#000",
        fontFamily: "'Playfair Display', serif",
        fontWeight: 500,
        letterSpacing: "0.05em",
    },
    infoIcon: {
        fontSize: "1.3rem",
        color: "#667eeaff",
    },

    /* ── Luxury Section: after carousel (pale cream, two-column) ── */
    luxurySection: {
        backgroundColor: "#FFFFFF",
        width: "100%",
        minHeight: "60vh",
        padding: "80px 0 100px",
        position: "relative",
    },
    body: {
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 48px",
    },
    twoCol: {
        display: "grid",
        gridTemplateColumns: "0.9fr 1.1fr", // give more space to map column on large screens
        gap: "48px",
        alignItems: "flex-start", // align both columns from the top
        minHeight: "400px",
    },
    luxuryLeftPanel: {
        padding: "40px 48px 40px 0",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-start", // start at top instead of vertical centering
        alignItems: "flex-start",
        maxWidth: "560px",
    },
    luxuryRightPanel: {
        display: "flex",
        alignItems: "center",
        justifyContent: "flex-end",
    },
    sectionTitle: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "clamp(2.1rem, 6vw, 1.5rem)",
        fontWeight: 400,
        color: "#282828",
        marginBottom: "32px",
        lineHeight: 0.5,
        letterSpacing: "-0.02em",
    },
    descText: {
        fontFamily: "'Inter', 'Roboto', 'Open Sans', sans-serif",
        fontSize: "1.05rem",
        color: "#555555",
        lineHeight: 1.8,
        marginBottom: "0",
        maxWidth: "540px",
    },
    featureRow: {
        display: "flex",
        flexWrap: "wrap",
        alignItems: "flex-start",
        justifyContent: "center",
        gap: "20px",
        marginTop: "60px",
    },
    featureItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        transition: "transform 0.5s cubic-bezier(0.2, 1, 0.3, 1)",
        cursor: "default",
        flex: 1,
    },
    featureIconWrap: {
        width: "85px",
        height: "85px",
        borderRadius: "50%",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 12px 30px rgba(139, 105, 20, 0.08)",
        fontSize: "2rem",
        border: "1px solid #667eea8f",
        marginBottom: "24px",
        transition: "all 0.6s cubic-bezier(0.2, 1, 0.3, 1)",
        position: "relative",
    },
    featureDivider: {
        width: "1px",
        height: "100px",
        background: "linear-gradient(to bottom, transparent, #667eea8f, transparent)",
        margin: "0 10px",
    },
    mapCard: {
        width: "100%",
        maxWidth: "700px",
        borderRadius: "32px",
        overflow: "hidden",
        boxShadow: "0 25px 60px rgba(0, 0, 0, 0.12), 0 10px 20px rgba(0, 0, 0, 0.05)",
        border: "8px solid rgba(255, 255, 255, 0.6)",
        background: "#fff",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    verticalLine: {
        width: "2px",
        height: "60px",
        background: "linear-gradient(to bottom, #667eea, transparent)",
        marginBottom: "24px",
    },
    mapWrap: {
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 25px 50px rgba(0,0,0,0.1)",
    },

    /* ── Rooms ── */
    roomsTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: "clamp(2.2rem, 4vw, 3.2rem)",
        fontWeight: 500,
        color: "#2c1810",
        marginBottom: "80px",
        textAlign: "center",
    },
    roomCard: {
        borderRadius: "28px",
        overflow: "hidden",
        backgroundColor: "#fff",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.1), 0 20px 50px -20px rgba(0,0,0,0.05)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    roomImg: {
        height: "220px",
        width: "100%",
        objectFit: "cover",
        display: "block",
    },
    roomBody: {
        padding: "24px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
    },
    roomName: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.5rem",
        fontWeight: 700,
        color: "#2c1810",
        marginBottom: "10px",
    },
    roomDesc: {
        fontFamily: "'Lato', sans-serif",
        fontSize: "0.95rem",
        color: "#7a6a4a",
        lineHeight: 1.6,
        marginBottom: "18px",
        flexGrow: 1,
    },

    /* ── Book Now btn ── */
    bookBtn: {
        width: "100%",
        padding: "14px",
        borderRadius: "50px",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        background: "#fff",
        color: "#667eea",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        fontSize: "0.95rem",
        letterSpacing: "0.08em",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        marginTop: "15px",
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.05)",
    },

    /* ── Modal ── */
    modal: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        backgroundColor: "#fff",
        padding: "40px",
        borderRadius: "24px",
        textAlign: "center",
        width: "min(400px, 90vw)",
        boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
        outline: "none",
    },
    modalTitle: {
        fontFamily: "'Cormorant Garamond', serif",
        fontSize: "1.8rem",
        fontWeight: 700,
        color: "#2c1810",
        marginBottom: "28px",
    },
    dateLabel: {
        fontFamily: "'Lato', sans-serif",
        fontSize: "0.85rem",
        color: "#667eeaff",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "10px",
        display: "block",
    },
};

/* ─── BookNow button with hover gradient ─── */
function BookBtn({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="smooth-grad-btn"
            style={{
                ...S.bookBtn,
            }}
        >
            Check Live Status
        </button>
    );
}

/* ─── Check-availability gradient button ─── */
function GradBtn({ onClick, children, fullWidth }) {
    return (
        <button
            onClick={onClick}
            className="smooth-grad-btn"
            style={{
                ...S.bookBtn,
                width: fullWidth ? "100%" : "auto",
                padding: "16px 32px",
            }}
        >
            {children}
        </button>
    );
}

/* ─── Notification Bell with overlay ─── */
function NotificationBell() {
    const [hovered, setHovered] = useState(false);
    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...S.bellBtn,
                transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
        >
            <Bell size={20} />
            <div style={{
                ...S.bellOverlay,
                opacity: hovered ? 1 : 0
            }}>
                Bell
            </div>
        </div>
    );
}

export default function HotelDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isTablet = useMediaQuery("(max-width:1024px)");

    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [revealed, setRevealed] = useState({});

    /* ─── Animated Icons ─── */
    const AnimatedCheck = () => (
        <div className="animate-scale" style={{ marginBottom: "20px" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#2e7d32" strokeWidth="4" />
                <path d="M25 40L35 50L55 30" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
            </svg>
        </div>
    );

    const AnimatedCross = () => (
        <div className="animate-scale" style={{ marginBottom: "20px" }}>
            <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
                <circle cx="40" cy="40" r="38" stroke="#c62828" strokeWidth="4" />
                <path d="M30 30L50 50M50 30L30 50" stroke="#c62828" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
            </svg>
        </div>
    );

    const [open, setOpen] = useState(false);
    const [checkStatus, setCheckStatus] = useState("input");
    const [checkIn, setCheckIn] = useState("");
    const [checkOut, setCheckOut] = useState("");
    const [reviews, setReviews] = useState([]);
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [eligibleBooking, setEligibleBooking] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);

    /* ── Fetch ── */
    useEffect(() => {
        setLoading(true);
        const fetchHotel = AxiosInstance.get(`api/hotels/${id}/`);
        const fetchRooms = AxiosInstance.get(`api/rooms/?hotel=${id}`);
        const fetchReviews = AxiosInstance.get(`api/hotel-reviews/?hotel=${id}`);

        Promise.all([fetchHotel, fetchRooms, fetchReviews])
            .then(([hotelRes, roomRes, reviewsRes]) => {
                setHotel(hotelRes.data);
                setRooms(roomRes.data);
                setReviews(reviewsRes.data);
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Failed to load hotel data");
                setLoading(false);
            });
    }, [id]);

    /* ── Carousel ── */
    const images = hotel
        ? [hotel.image, hotel.room_image1, hotel.room_image2].filter(Boolean)
        : [];
    const [activeIndex, setActiveIndex] = useState(0);
    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    /* ── Scroll Reveal ── */
    useEffect(() => {
        if (loading) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const id = entry.target.getAttribute("data-reveal-id");
                    if (id) {
                        setRevealed(prev => ({ ...prev, [id]: true }));
                    }
                }
            });
        }, { threshold: 0.1 });

        const elements = document.querySelectorAll("[data-reveal-id]");
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [loading]);

    /* ── Modal handlers ── */
    const handleOpenModal = room => {
        setSelectedRoom(room);
        setOpen(true);
        setCheckStatus("input");
    };
    const handleClose = () => {
        setOpen(false);
        setCheckStatus("input");
        setSelectedRoom(null);
    };
    const performCheck = async () => {
        if (!checkIn || !checkOut) { toast.warning("Please select dates"); return; }
        const today = new Date().toISOString().split("T")[0];
        if (checkIn < today) { toast.error("Check-in date cannot be in the past."); return; }
        if (checkIn >= checkOut) { toast.error("Check-out date must be after check-in date."); return; }

        setCheckStatus("checking");

        // Artificial delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            let url = `api/bookings/check_availability/?hotel_id=${id}&check_in=${checkIn}&check_out=${checkOut}`;
            if (selectedRoom) url += `&room_id=${selectedRoom.id}`;
            const res = await AxiosInstance.get(url);
            if (res.data.available) {
                setCheckStatus("available");
                setTimeout(() => {
                    navigate(`/booking/${id}`, { state: { hotel, room: selectedRoom, checkIn, checkOut } });
                }, 2000);
            } else {
                setCheckStatus("full");
            }
        } catch {
            setCheckStatus("full");
        }
    };

    const handleWriteReviewClick = async () => {
        const token = localStorage.getItem("access");
        if (!token) {
            toast.error("Please login to write a review");
            navigate("/auth");
            return;
        }

        try {
            const res = await AxiosInstance.get(`api/bookings/eligible_for_review/?hotel_id=${id}`);
            if (res.data.id) {
                setEligibleBooking(res.data);
                setReviewModalOpen(true);
            } else {
                toast.info("A confirmed booking is required to leave a review.");
            }
        } catch (err) {
            toast.error("Error checking eligibility.");
        }
    };

    const handleReviewSubmit = async () => {
        if (!eligibleBooking) return;
        setIsSubmittingReview(true);
        try {
            const res = await AxiosInstance.post("api/hotel-reviews/", {
                booking: eligibleBooking.id,
                rating: reviewRating,
                comment: reviewComment
            });

            toast.success("Review submitted successfully!");
            setReviewModalOpen(false);

            // REAL TIME UPDATE
            const newReview = {
                ...res.data,
                user_name: "You",
                created_at: new Date().toISOString()
            };

            const updatedReviews = [newReview, ...(Array.isArray(reviews) ? reviews : [])];
            setReviews(updatedReviews);

            const sum = updatedReviews.reduce((acc, r) => acc + r.rating, 0);
            const avg = (sum / updatedReviews.length).toFixed(1);

            setHotel(prev => ({
                ...prev,
                average_rating: avg,
                reviews_count: updatedReviews.length
            }));

            setReviewRating(5);
            setReviewComment("");
        } catch (err) {
            toast.error(err.response?.data?.non_field_errors?.[0] || "Submission failed");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    /* ── Loading / Error ── */
    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#667eeaff" }} />
            <Typography style={{ fontFamily: "'Cormorant Garamond', serif", color: "#667eeaff" }}>
                Loading Hotel…
            </Typography>
        </div>
    );
    if (error || !hotel) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom>{error || "Hotel not found"}</Typography>
            <Button variant="contained" onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
    );

    const heroHeight = isMobile ? 300 : 560;

    return (
        <div style={S.page}>
            {/* ── Google Fonts ── */}
            <link
                href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=Lato:wght@400;600;700&display=swap"
                rel="stylesheet"
            />

            <style>
                {`
                    .luxury-feature-item:hover {
                        transform: translateY(-8px);
                    }
                    .luxury-feature-item:hover .icon-wrap {
                        box-shadow: 0 20px 45px rgba(139, 105, 20, 0.15);
                        border-color: #667eeaff;
                        transform: scale(1.05);
                    }

                    /* Ultra-smooth Gradient Button */
                    .smooth-grad-btn {
                        position: relative;
                        overflow: hidden;
                        z-index: 1;
                        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
                        border: 1px solid rgba(102, 126, 234, 0.3);
                        background: #fff;
                        color: #667eea;
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
                        transform: translateY(-3px) scale(1.02);
                        box-shadow: 0 12px 24px rgba(102, 126, 234, 0.25);
                        border-color: transparent;
                    }

                    .smooth-grad-btn:hover::before {
                        opacity: 1;
                    }
                    .smooth-grad-btn:hover::before {
                        opacity: 1;
                    }

                    /* Icon Animations */
                    @keyframes drawPath {
                        from { stroke-dashoffset: 80; }
                        to { stroke-dashoffset: 0; }
                    }
                    @keyframes scaleUp {
                        from { transform: scale(0); opacity: 0; }
                        to { transform: scale(1); opacity: 1; }
                    }
                    .animate-draw {
                        stroke-dasharray: 80;
                        stroke-dashoffset: 80;
                        animation: drawPath 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
                    }
                    .animate-scale {
                        animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards;
                    }

                    .reveal {
                        opacity: 0;
                        transform: translateY(30px);
                        transition: all 0.8s cubic-bezier(0.2, 1, 0.3, 1);
                    }
                    .reveal.active {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .map-card-hover:hover {
                        transform: translateY(-10px) scale(1.02);
                        box-shadow: 0 40px 80px rgba(102, 126, 234, 0.15);
                    }
                `}
            </style>
            {/* ── Header ── */}
            <header style={S.header}>
                <Link to="/" style={S.logoWrap}>
                    <img src="/logo.jpeg" alt="ServNex Logo" style={S.logoImg} />
                    ServNex
                </Link>
                <NotificationBell />
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
                        src={img || "https://via.placeholder.com/1200x600?text=Hotel"}
                        alt="hotel"
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

                {/* Hotel name on image - TAJ STYLE */}
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
                        {hotel.name}
                    </div>
                    <div style={{
                        ...S.heroSubtitle,
                        fontSize: isMobile ? "1.2rem" : S.heroSubtitle.fontSize
                    }}>
                        {hotel.area}
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
                    {hotel.area}, {hotel.city}
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.85rem" : S.infoItem.fontSize }}>
                    <StarIcon style={{ ...S.infoIcon, color: "#f4c430", fontSize: isMobile ? "1.1rem" : S.infoIcon.fontSize }} />
                    <strong>{hotel.average_rating || "4.8"}</strong>&nbsp;
                    <span style={{ fontWeight: 400, color: "#667eeaff" }}>({hotel.reviews_count || "876"} reviews)</span>
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.85rem" : S.infoItem.fontSize, textAlign: "center", width: isMobile ? "100%" : "auto" }}>
                    <span style={{ fontSize: isMobile ? "1.2rem" : "1.4rem" }}>🏰</span>
                    Experience Tajness – Where luxury is a soulful indulgence.
                </div>
            </div>

            {/* ── Luxury Section: after carousel — pale cream, two-column, text + map ── */}
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
                        {/* Left: text block — descriptor, heading (name on own line), paragraph */}
                        <div style={isMobile
                            ? { padding: "24px 0", textAlign: "center" }
                            : { ...S.luxuryLeftPanel, textAlign: "left" }
                        }>
                            <div
                                data-reveal-id="luxury-title"
                                className={`reveal ${revealed['luxury-title'] ? 'active' : ''}`}
                            >

                                <div style={{
                                    fontFamily: "'Inter', 'Roboto', 'Open Sans', sans-serif",
                                    color: "#667eeaff",
                                    letterSpacing: "0.2em",
                                    fontSize: "0.8rem",
                                    fontWeight: 600,
                                    textTransform: "uppercase",
                                    marginBottom: "16px",
                                }}>
                                </div>

                                <h2 style={{ ...S.sectionTitle, textAlign: isMobile ? "left" : "left", fontSize: isMobile ? "2.5rem" : S.sectionTitle.fontSize }}>
                                    {hotel.name} </h2>
                            </div>
                            <p
                                data-reveal-id="luxury-desc"
                                className={`reveal ${revealed['luxury-desc'] ? 'active' : ''}`}
                                style={{ ...S.descText, margin: isMobile ? "0 auto 16px" : S.descText.margin, textAlign: isMobile ? "justify" : "left" }}
                            >
                                {hotel.description}
                            </p>

                            {Array.isArray(hotel.nearby_attractions) && hotel.nearby_attractions.length > 0 && (
                                <div style={{ marginTop: "24px" }}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: 600, letterSpacing: "0.08em", color: "#667eeaff", marginBottom: "8px" }}>
                                        Nearby Places
                                    </div>
                                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                                        {hotel.nearby_attractions.map((place, idx) => (
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


                        {/* Right: map card — rounded corners, subtle shadow */}
                        <div
                            data-reveal-id="luxury-map"
                            style={isMobile
                                ? { display: "flex", justifyContent: "center", width: "100%" }
                                : S.luxuryRightPanel
                            } className={`reveal ${revealed['luxury-map'] ? 'active' : ''}`}>
                            <div
                                className="map-card-hover"
                                style={{
                                    ...S.mapCard,
                                    maxWidth: "100%",
                                    width: "100%",
                                }}>
                                <iframe
                                    height={isMobile ? "350" : isTablet ? "450" : "580"}
                                    width={isMobile ? "100%" : "620px"}
                                    style={{ display: "block", border: 0 }}
                                    loading="lazy"
                                    src={`https://www.google.com/maps?q=${hotel.area || 'Taj Hotel'}&output=embed`}
                                    title="map"
                                />
                            </div>
                        </div>
                    </div>

                    <div
                        style={{ marginTop: "40px", padding: "30px", backgroundColor: "#fff", borderRadius: "20px", border: "1px solid #eee", boxShadow: "0 4px 20px rgba(0,0,0,0.03)" }}
                    >
                        <div style={{ fontSize: "1.4rem", fontWeight: 700, fontFamily: "'Poppins', sans-serif", color: "#2c1810", marginBottom: "25px", display: "flex", alignItems: "center", gap: "10px" }}>
                            Property Facilities
                        </div>

                        {(Array.isArray(hotel.amenities) && hotel.amenities.length > 0) || (typeof hotel.amenities === "string" && hotel.amenities.length > 2) ? (
                            <div style={{
                                display: "grid",
                                gridTemplateColumns: isMobile ? "1fr 1fr" : isTablet ? "repeat(3, 1fr)" : "repeat(4, 1fr)",
                                gap: "20px"
                            }}>
                                {(Array.isArray(hotel.amenities)
                                    ? hotel.amenities
                                    : hotel.amenities.split(",").map(a => a.trim()).filter(Boolean)
                                ).map((amenity, idx) => (
                                    <div key={idx} style={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "10px",
                                        fontSize: "0.95rem",
                                        color: "#444",
                                        fontWeight: 500,
                                        padding: "10px 15px",
                                        backgroundColor: "#fcfcfc",
                                        borderRadius: "10px",
                                        border: "1px solid #f0f0f0"
                                    }}>
                                        <span style={{ display: "flex", alignItems: "center" }}>
                                            {amenityIconMap[amenity] || <CheckIcon sx={{ color: "#667eeaff", fontSize: 18 }} />}
                                        </span>
                                        {amenity}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div style={{ color: "#888", fontStyle: "italic", fontSize: "0.9rem" }}>
                                Selected facilities will appear here once updated in the dashboard.
                            </div>
                        )}
                    </div>

                    {/* ── REVIEWS SECTION ── */}
                    <div
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
                                            <StarIcon key={s} sx={{ color: s <= (hotel?.average_rating || 0) ? "#f59e0b" : "#d1d5db", fontSize: 20 }} />
                                        ))}
                                    </div>
                                    <span style={{ fontWeight: 600, color: "#2c1810" }}>{hotel?.average_rating || "New"}</span>
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
                                <p>No reviews yet for this property. Be the first to share your experience!</p>
                            </div>
                        ) : (
                            <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                                {Array.isArray(reviews) && reviews.map((rev, idx) => (
                                    <div key={rev.id || idx} style={{ borderBottom: (reviews && idx === reviews.length - 1) ? "none" : "1px solid #f0f0f0", paddingBottom: "25px" }}>
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

            {/* ── Available Rooms Section ── */}
            <section
                data-reveal-id="rooms"
                className={`reveal ${revealed['rooms'] ? 'active' : ''}`}
                style={{ ...S.luxurySection, backgroundColor: "#FFFFFF", padding: "80px 0 100px" }}
            >
                <div style={{ ...S.body, paddingBottom: "100px" }}>
                    <h2 style={S.roomsTitle}>Available Rooms</h2>

                    {rooms.length > 0 ? (
                        <div style={{
                            display: "grid",
                            gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(3, 1fr)",
                            gap: isMobile ? "24px" : "32px",
                        }}>
                            {rooms.map(room => (
                                <RoomCard
                                    key={room.id}
                                    room={room}
                                    onBook={() => handleOpenModal(room)}
                                />
                            ))}
                        </div>
                    ) : (
                        <p style={{ ...S.descText, textAlign: "center", fontStyle: "italic" }}>
                            No specific rooms listed. Please contact the hotel directly.
                        </p>
                    )}
                </div>
            </section>

            {/* ── Booking Modal ── */}
            <Modal open={open} onClose={handleClose}>
                <div style={S.modal}>
                    {checkStatus === "input" && (
                        <>
                            <div style={S.modalTitle}>Select Dates</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: "20px", textAlign: "left" }}>
                                <div>
                                    <span style={S.dateLabel}>Check-in Date</span>
                                    <input
                                        type="date"
                                        className="form-control form-control-lg"
                                        value={checkIn}
                                        min={new Date().toISOString().split("T")[0]}
                                        onChange={e => setCheckIn(e.target.value)}
                                        style={{ borderRadius: "10px", borderColor: "#667eea8f", fontFamily: "'Lato', sans-serif" }}
                                    />
                                </div>
                                <div>
                                    <span style={S.dateLabel}>Check-out Date</span>
                                    <input
                                        type="date"
                                        className="form-control form-control-lg"
                                        value={checkOut}
                                        min={checkIn || new Date().toISOString().split("T")[0]}
                                        onChange={e => setCheckOut(e.target.value)}
                                        style={{ borderRadius: "10px", borderColor: "#667eea8f", fontFamily: "'Lato', sans-serif" }}
                                    />
                                </div>
                            </div>
                            <div style={{ marginTop: "28px" }}>
                                <GradBtn onClick={performCheck} fullWidth>Check Availability</GradBtn>
                            </div>
                        </>
                    )}

                    {checkStatus === "checking" && (
                        <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                            <CircularProgress style={{ color: "#667eea" }} size={50} thickness={4} />
                            <div style={{ ...S.modalTitle, margin: 0 }}>Checking Availability…</div>
                        </div>
                    )}

                    {checkStatus === "available" && (
                        <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <AnimatedCheck />
                            <div style={{ ...S.modalTitle, color: "#2e7d32" }}>Rooms are Available</div>
                            <p style={{ color: "#8a7a5a", fontFamily: "'Lato', sans-serif" }}>Preparing your booking experience…</p>
                        </div>
                    )}

                    {checkStatus === "full" && (
                        <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <AnimatedCross />
                            <div style={{ ...S.modalTitle, color: "#c62828" }}>Rooms are not Available check later</div>
                            <div style={{ marginTop: "24px", width: "100%" }}>
                                <GradBtn onClick={() => setCheckStatus("input")} fullWidth>
                                    TRY DIFFERENT DATES
                                </GradBtn>
                            </div>
                        </div>
                    )}
                </div>
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
                        How was your stay at {hotel?.name}? {eligibleBooking?.room_type && `(${eligibleBooking.room_type})`}
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
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            boxShadow: "0 10px 20px rgba(102,126,234,0.3)",
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

/* ─── Room Card component ─── */
function RoomCard({ room, onBook }) {
    const isMobile = useMediaQuery("(max-width:768px)");
    const [hovered, setHovered] = useState(false);

    const iconMap = {
        wifi: <WifiIcon sx={{ fontSize: "1rem" }} />,
        internet: <WifiIcon sx={{ fontSize: "1rem" }} />,
        ac: <AcUnitIcon sx={{ fontSize: "1rem" }} />,
        air: <AcUnitIcon sx={{ fontSize: "1rem" }} />,
        parking: <LocalParkingIcon sx={{ fontSize: "1rem" }} />,
        pool: <PoolIcon sx={{ fontSize: "1rem" }} />,
        swimming: <PoolIcon sx={{ fontSize: "1rem" }} />,
        gym: <FitnessCenterIcon sx={{ fontSize: "1rem" }} />,
        fitness: <FitnessCenterIcon sx={{ fontSize: "1rem" }} />,
        breakfast: <RestaurantIcon sx={{ fontSize: "1rem" }} />,
        food: <RestaurantIcon sx={{ fontSize: "1rem" }} />,
        restaurant: <RestaurantIcon sx={{ fontSize: "1rem" }} />,
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...S.roomCard,
                ...S.roomCard,
                boxShadow: hovered
                    ? "0 30px 60px -12px rgba(102, 126, 234, 0.15), 0 18px 36px -18px rgba(0, 0, 0, 0.2)"
                    : S.roomCard.boxShadow,
                transform: hovered ? "translateY(-10px)" : "translateY(0)",
            }}
        >
            <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                    src={room.image || "https://via.placeholder.com/400x220?text=Premium+Room"}
                    alt={room.room_type}
                    style={{
                        ...S.roomImg,
                        transition: "transform 0.6s ease",
                        transform: hovered ? "scale(1.08)" : "scale(1)",
                    }}
                />
            </div>
            <div style={S.roomBody}>
                <div style={S.roomName}>{room.room_type}</div>
                <div style={S.roomDesc}>
                    {room.description
                        ? room.description.substring(0, 110) + "…"
                        : "Experience ultimate comfort in our beautifully appointed rooms with city views."}
                </div>

                {/* Price + Adults */}
                <div style={{
                    display: "flex",
                    gap: isMobile ? "8px" : "12px",
                    marginBottom: "18px",
                    flexDirection: isMobile ? "column" : "row"
                }}>
                    <div style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "8px 16px",
                        borderRadius: "50px",
                        border: "1px solid #667eea8f",
                        fontSize: "0.85rem",
                        color: "#5a4a2a",
                        fontFamily: "'Lato', sans-serif",
                        background: "linear-gradient( #667eea17)",
                        whiteSpace: "nowrap"
                    }}>
                        Start Price : ₹{room.price}
                    </div>
                    <div style={{
                        flex: 1,
                        textAlign: "center",
                        padding: "8px 16px",
                        borderRadius: "50px",
                        border: "1px solid #667eea8f",
                        fontSize: "0.85rem",
                        color: "#5a4a2a",
                        fontFamily: "'Lato', sans-serif",
                        background: "linear-gradient( #667eea17)"
                    }}>
                        Adults : {room.adults}
                    </div>
                </div>

                <div style={{ marginTop: "auto" }}>
                    <BookBtn onClick={onBook} />
                </div>
            </div>
        </div>
    );
}
