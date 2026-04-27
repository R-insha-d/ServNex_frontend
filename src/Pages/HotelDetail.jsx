import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";
import { Bell } from "lucide-react";
import NotificationDropdown from "../Component/NotificationDropdown";
import Header from "../Component/Header";

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
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";

const amenityIconMap = {
    "Wifi": <WifiIcon sx={{ fontSize: "1.25rem" }} />,
    "Parking": <LocalParkingIcon sx={{ fontSize: "1.25rem" }} />,
    "Restaurant": <RestaurantIcon sx={{ fontSize: "1.25rem" }} />,
    "Pool": <PoolIcon sx={{ fontSize: "1.25rem" }} />,
    "Gym": <FitnessCenterIcon sx={{ fontSize: "1.25rem" }} />,
    "AC": <AcUnitIcon sx={{ fontSize: "1.25rem" }} />,
    "Bar": <LocalBarIcon sx={{ fontSize: "1.25rem" }} />,
    "Spa": <SpaIcon sx={{ fontSize: "1.25rem" }} />,
    "Room Service": <RoomServiceIcon sx={{ fontSize: "1.25rem" }} />,
    "Laundry": <LocalLaundryServiceIcon sx={{ fontSize: "1.25rem" }} />,
    "TV": <TvIcon sx={{ fontSize: "1.25rem" }} />,
    "Kitchen": <KitchenIcon sx={{ fontSize: "1.25rem" }} />,
};

/* ─── inline styles (no extra CSS file needed) ─── */
const S = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#6365f127",
        fontFamily: "'Poppins', sans-serif",
        color: "#1a1a1a",

    },

    /* ── Header ── */
    header: {
        background: "rgba(255, 255, 255, 0.9)",
        backdropFilter: "blur(20px)",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 30px rgba(0, 0, 0, 0.03)",
        borderBottom: "1px solid rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease",
    },

    logoWrap: {
        fontSize: "24px",
        fontWeight: 600,
        letterSpacing: "0.5px",
        textDecoration: "none",
        display: "flex",
        alignItems: "center",
        gap: "12px",
        color: "#0f172a",
    },

    logoText: {
        color: "#5c5be5",
        fontWeight: 600,
        fontSize: "24px",
        letterSpacing: "0.5px",
    },

    logoImg: {
        height: "40px",
        width: "40px",
        borderRadius: "10px",
        objectFit: "cover",
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
    },

    bellBtn: {
        width: "44px",
        height: "44px",
        borderRadius: "14px",
        backgroundColor: "#fff",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#4b5563",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        border: "1px solid #eef2f6",
        boxShadow: "0 2px 8px rgba(0,0,0,0.04)",
    },

    /* ── Hero carousel ── */
    heroWrap: {
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000",
        borderRadius: "0 0 24px 24px",
    },
    heroOverlay: {
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)",
        zIndex: 1,
        pointerEvents: "none",
    },
    heroTitle: {
        position: "absolute",
        bottom: "60px",
        left: "60px",
        zIndex: 2,
        color: "#fff",
    },
    heroBrand: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "clamp(2.5rem, 6vw, 4.5rem)",
        fontWeight: 600,
        lineHeight: 1.1,
        letterSpacing: "-0.02em",
        marginBottom: "12px",
        textShadow: "0 4px 20px rgba(0,0,0,0.2)",
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

    /* ── Info bar ── */
    infoBar: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "60px",
        padding: "24px 40px",
        backgroundColor: "#fff",
        borderRadius: "16px",
        margin: "-30px 60px 0",
        position: "relative",
        zIndex: 10,
        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.04)",
        border: "1px solid rgba(0,0,0,0.02)",
        flexWrap: "wrap",
    },
    infoSep: {
        width: "1px",
        height: "24px",
        backgroundColor: "#f1f5f9",
    },
    infoItem: {
        display: "flex",
        alignItems: "center",
        gap: "16px",
        fontSize: "0.95rem",
        color: "#64748b",
        fontWeight: 400,
    },
    infoIcon: {
        fontSize: "1.25rem",
        color: "#6366f1",
    },

    /* ── Luxury Section ── */
    luxurySection: {
        backgroundColor: "transparent",
        width: "100%",
        padding: "80px 0",
    },
    body: {
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "0 40px",
    },
    twoCol: {
        display: "grid",
        gridTemplateColumns: "1.2fr 0.8fr",
        gap: "80px",
        alignItems: "flex-start",
    },
    luxuryLeftPanel: {
        display: "flex",
        flexDirection: "column",
        gap: "32px",
    },
    sectionTitle: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 600,
        color: "#0f172a",
        lineHeight: 1.2,
        letterSpacing: "-0.02em",
    },
    descText: {
        fontSize: "1rem",
        color: "#64748b",
        lineHeight: 1.7,
        margin: 0,
        fontWeight: 400,
    },
    mapCard: {
        width: "100%",
        borderRadius: "24px",
        overflow: "hidden",
        boxShadow: "0 20px 40px rgba(0, 0, 0, 0.05)",
        border: "4px solid #fff",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    },

    /* ── Rooms ── */
    roomsTitle: {
        fontFamily: "'Poppins', sans-serif",
        fontSize: "clamp(2rem, 4vw, 3rem)",
        fontWeight: 600,
        color: "#0f172a",
        marginBottom: "48px",
        textAlign: "center",
        letterSpacing: "-0.02em",
    },
    roomCard: {
        borderRadius: "24px",
        overflow: "hidden",
        backgroundColor: "#fff",
        border: "1px solid #f1f5f9",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.02)",
    },
    roomImg: {
        height: "260px",
        width: "100%",
        objectFit: "cover",
    },
    roomBody: {
        padding: "24px",
        flexGrow: 1,
        display: "flex",
        flexDirection: "column",
        gap: "20px",
    },
    roomName: {
        fontSize: "1.5rem",
        fontWeight: 600,
        color: "#0f172a",
        letterSpacing: "-0.01em",
    },
    roomDesc: {
        fontSize: "0.95rem",
        color: "#64748b",
        lineHeight: 1.6,
        margin: 0,
        fontWeight: 400,
    },

    /* ── Buttons ── */
    bookBtn: {
        width: "100%",
        padding: "14px 24px",
        borderRadius: "12px",
        border: "none",
        background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
        color: "#fff",
        fontWeight: 500,
        fontSize: "0.95rem",
        cursor: "pointer",
        transition: "all 0.3s ease",
        boxShadow: "0 8px 16px rgba(99, 102, 241, 0.15)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
    },

    /* ── Modal ── */
    modal: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%,-50%)",
        backgroundColor: "#fff",
        padding: "32px",
        borderRadius: "20px",
        textAlign: "center",
        width: "min(480px, 90vw)",
        boxShadow: "0 15px 35px rgba(0,0,0,0.03)",
        outline: "none",
    },
    modalTitle: {
        fontSize: "1.5rem",
        fontWeight: 600,
        color: "#0f172a",
        marginBottom: "20px",
        letterSpacing: "-0.01em",
    },
    dateLabel: {
        fontSize: "0.8rem",
        color: "#94a3b8",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.04em",
        marginBottom: "6px",
        display: "block",
    },
};

/* ─── BookNow button with Landing.jsx style ─── */
function BookBtn({ onClick }) {
    return (
        <button
            onClick={onClick}
            className="premium-btn"
        >
            <span>Check Live Status </span>
        </button>
    );
}

/* ─── Check-availability gradient button with Landing.jsx style ─── */
function GradBtn({ onClick, children, fullWidth }) {
    return (
        <button
            onClick={onClick}
            className="premium-btn"
            style={{ width: fullWidth ? "100%" : "auto", padding: "0 2.5em" }}
        >
            <span>{children} </span>
        </button>
    );
}

/* ─── IOS Wheel Picker Popup Components ─── */
const WheelColumn = ({ items, value, onChange, disabledItems = [], flex = 1 }) => {
    const scrollRef = React.useRef(null);
    const [activeIndex, setActiveIndex] = useState(items.indexOf(value) !== -1 ? items.indexOf(value) : 0);
    const scrollTimeout = React.useRef(null);
    const isScrollingRef = React.useRef(false);

    useEffect(() => {
        const index = items.indexOf(value);
        if (index !== -1 && scrollRef.current && activeIndex !== index && !isScrollingRef.current) {
            scrollRef.current.scrollTop = index * 40;
            setActiveIndex(index);
        }
    }, [value, items]);

    const handleScroll = (e) => {
        isScrollingRef.current = true;
        const scrollTop = e.target.scrollTop;
        const index = Math.round(scrollTop / 40);

        if (index !== activeIndex && index >= 0 && index < items.length) {
            setActiveIndex(index);
            if (!disabledItems.includes(items[index])) {
                onChange(items[index]);
            }
        }

        if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
        scrollTimeout.current = setTimeout(() => {
            isScrollingRef.current = false;
            const finalIndex = Math.round(scrollRef.current.scrollTop / 40);
            if (disabledItems.includes(items[finalIndex])) {
                let validIndex = items.findIndex(item => !disabledItems.includes(item));
                if (validIndex !== -1) {
                    scrollRef.current.scrollTo({ top: validIndex * 40, behavior: 'smooth' });
                    setActiveIndex(validIndex);
                    onChange(items[validIndex]);
                }
            }
        }, 150);
    };

    return (
        <div className="ios-wheel-column" ref={scrollRef} onScroll={handleScroll} style={{ flex }}>
            <div style={{ height: '80px', flexShrink: 0 }} />
            {items.map((item, idx) => (
                <div
                    key={idx}
                    className={`ios-wheel-item ${idx === activeIndex ? 'active' : ''} ${disabledItems.includes(item) ? 'disabled' : ''}`}
                    onClick={() => {
                        if (!disabledItems.includes(item)) {
                            scrollRef.current.scrollTo({ top: idx * 40, behavior: 'smooth' });
                            setActiveIndex(idx);
                            onChange(item);
                        }
                    }}
                    style={{ cursor: disabledItems.includes(item) ? 'not-allowed' : 'pointer' }}
                >
                    {item}
                </div>
            ))}
            <div style={{ height: '80px', flexShrink: 0 }} />
        </div>
    );
};

const IOSDateTimePickerPopup = ({ label, value, onChange, minDateRaw }) => {
    const [isOpen, setIsOpen] = useState(false);

    // Default value if not set
    const defaultDate = new Date();
    defaultDate.setMinutes(0); // Optional rounding
    const dateObj = value ? new Date(value.includes("T") ? value : value + "T00:00:00") : defaultDate;

    const dates = [];
    const dateValues = [];
    const disabledDates = [];

    const minDate = minDateRaw ? new Date(minDateRaw) : new Date();
    const startDate = new Date(minDate);
    startDate.setHours(0, 0, 0, 0);

    const todayLabel = new Date();
    todayLabel.setHours(0, 0, 0, 0);

    for (let i = -60; i < 90; i++) {
        const d = new Date(startDate);
        d.setDate(startDate.getDate() + i);
        const ymd = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
        dateValues.push(ymd);

        let dLabel = d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
        if (d.getTime() === todayLabel.getTime() && !minDateRaw) {
            dLabel = "Today";
        }

        dates.push(dLabel);

        if (d.getTime() < startDate.getTime()) {
            disabledDates.push(dLabel);
        }
    }

    let currentDateVal = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
    if (!dateValues.includes(currentDateVal)) currentDateVal = dateValues[0]; // fallback

    const updateValue = (newPart) => {
        const parts = {
            date: currentDateVal,
            ...newPart
        };
        onChange(parts.date);
    };

    // Ensure state defaults on open if empty
    useEffect(() => {
        if (isOpen && !value) {
            updateValue({});
        }
    }, [isOpen]);

    const displayStr = value ? new Date(value.includes("T") ? value : value + "T00:00:00").toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric'
    }) : 'Select Date';

    return (
        <div style={{ position: "relative", marginBottom: "16px" }}>
            <span style={S.dateLabel}>{label}</span>
            <div
                className="form-control form-control-lg"
                onClick={() => setIsOpen(!isOpen)}
                style={{ borderRadius: "10px", borderColor: "#f1f5f9", fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem", cursor: "pointer", display: "flex", alignItems: "center", background: "#fff", height: "48px" }}
            >
                {displayStr}
            </div>

            {isOpen && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                    background: "#fff", borderRadius: "16px", marginTop: "8px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0", overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Select Date</span>
                        <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ color: "#6366f1", fontWeight: 600, border: "none", background: "none", cursor: "pointer", fontSize: "1rem" }}>Done</button>
                    </div>
                    <div className="ios-datepicker-container" style={{ margin: 0, borderRadius: 0, gap: 0 }}>
                        <div className="ios-wheel-view">
                            <div className="ios-wheel-highlight" />
                            <div className="ios-wheel-gradient-top" />
                            <div className="ios-wheel-gradient-bottom" />
                            <WheelColumn flex={1.8} items={dates} value={dates[dateValues.indexOf(currentDateVal)] || dates[dates.findIndex(d => !disabledDates.includes(d))]} onChange={(val) => updateValue({ date: dateValues[dates.indexOf(val)] })} disabledItems={disabledDates} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};



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
    const [reviewImages, setReviewImages] = useState([]);

    /* ── Fetch ── */
    useEffect(() => {
        setLoading(true);
        const fetchHotel = AxiosInstance.get(`api/hotels/${id}/`);
        const fetchRooms = AxiosInstance.get(`api/rooms/?hotel=${id}`);
        const fetchReviews = AxiosInstance.get(`api/hotel-reviews/?hotel=${id}`);

        Promise.all([fetchHotel, fetchRooms, fetchReviews])
            .then(([hotelRes, roomRes, reviewsRes]) => {
                setHotel(hotelRes.data);
                const rData = roomRes.data;
                setRooms(Array.isArray(rData) ? rData : (rData.results || []));
                const revData = reviewsRes.data;
                setReviews(Array.isArray(revData) ? revData : (revData.results || []));
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

        // Exact original functionality mapping: use only date prefix
        const checkInDate = checkIn.split("T")[0];
        const checkOutDate = checkOut.split("T")[0];

        if (checkInDate < today) { toast.error("Check-in date cannot be in the past."); return; }
        if (checkInDate >= checkOutDate) { toast.error("Check-out date must be after check-in date."); return; }

        setCheckStatus("checking");

        // Artificial delay for premium feel
        await new Promise(resolve => setTimeout(resolve, 3000));

        try {
            let url = `api/bookings/check_availability/?hotel_id=${id}&check_in=${checkInDate}&check_out=${checkOutDate}`;
            if (selectedRoom) url += `&room_id=${selectedRoom.id}`;
            const res = await AxiosInstance.get(url);
            if (res.data.available) {
                setCheckStatus("available");
                setTimeout(() => {
                    navigate(`/booking/${id}`, { state: { hotel, room: selectedRoom, checkIn: checkInDate, checkOut: checkOutDate } });
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
            const formData = new FormData();
            formData.append("booking", eligibleBooking.id);
            formData.append("rating", reviewRating);
            formData.append("comment", reviewComment);
            reviewImages.forEach((img) => {
                formData.append("images", img);
            });

            const res = await AxiosInstance.post("api/hotel-reviews/", formData, {
                headers: { "Content-Type": "multipart/form-data" }
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
            setReviewImages([]);
        } catch (err) {
            toast.error(err.response?.data?.non_field_errors?.[0] || "Submission failed");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    /* ── Loading / Error ── */
    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#6366f1" }} />
            <Typography style={{ fontFamily: "'Poppins', sans-serif", color: "#6366f1", fontWeight: 500 }}>
                Loading Hotel…
            </Typography>
        </div>
    );
    if (error || !hotel) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>{error || "Hotel not found"}</Typography>
            <Button variant="contained" onClick={() => navigate("/")} style={{ borderRadius: "12px", textTransform: "none", fontFamily: "'Poppins', sans-serif" }}>Go Back Home</Button>
        </div>
    );

    const heroHeight = isMobile ? 300 : 560;

    return (
        <div style={S.page}>
            {/* ── Google Fonts ── */}
            <link
                href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap"
                rel="stylesheet"
            />

            <style>
                {`
                    @keyframes slideUp {
                        from { opacity: 0; transform: translateY(30px); }
                        to { opacity: 1; transform: translateY(0); }
                    }

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
                        top: 100px;
                    }

                    .section-card {
                        background: #ffffff;
                        padding: 40px;
                        border-radius: 24px;
                        border: 1px solid #f0f0f0;
                        box-shadow: 0 4px 25px rgba(0,0,0,0.02);
                    }

                    .section-title {
                        font-family: 'Poppins', sans-serif;
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
                        background: #6366f1;
                        border-radius: 2px;
                    }

                    .reservation-sidebar-card {
                        background: #fff;
                        border-radius: 28px;
                        border: 1px solid #eee;
                        padding: 32px;
                        box-shadow: 0 20px 40px rgba(0,0,0,0.04);
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

                    .review-item {
                        padding: 24px 0;
                        border-bottom: 1px solid #f1f1f1;
                    }
                    .review-item:last-child {
                        border-bottom: none;
                    }

                    .luxury-feature-card {
                        background: #fff;
                        padding: 20px;
                        border-radius: 16px;
                        border: 1px solid #f1f5f9;
                        transition: all 0.3s ease;
                        display: flex;
                        flex-direction: column;
                        gap: 12px;
                    }

                    .luxury-feature-card:hover {
                        transform: translateY(-4px);
                        box-shadow: 0 12px 24px rgba(0, 0, 0, 0.03);
                        border-color: #6366f133;
                    }

                    .facility-icon-wrap {
                        width: 40px;
                        height: 40px;
                        border-radius: 10px;
                        background: #f8fafc;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: #6366f1;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    }

                    .luxury-feature-card:hover .facility-icon-wrap {
                        background: #6366f1;
                        color: #fff;
                        transform: scale(1.1);
                    }

                    .review-card {
                        background: #fff;
                        padding: 32px;
                        border-radius: 20px;
                        border: 1px solid #f1f5f9;
                        transition: all 0.3s ease;
                        position: relative;
                        overflow: hidden;
                    }

                    .review-card::before {
                        content: '"';
                        position: absolute;
                        top: 10px;
                        right: 30px;
                        font-size: 6rem;
                        font-family: 'Poppins', sans-serif;
                        color: #f1f5f9;
                        line-height: 1;
                        z-index: 0;
                        font-weight: 700;
                        opacity: 0.5;
                    }

                    .review-content {
                        position: relative;
                        z-index: 1;
                    }

                    /* Reveal animations */
                    .reveal {
                        opacity: 0;
                        transform: translateY(20px);
                        transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
                    }
                    .reveal.active {
                        opacity: 1;
                        transform: translateY(0);
                    }
                    
                    .map-card-hover:hover {
                        transform: scale(1.01);
                        box-shadow: 0 30px 60px rgba(0,0,0,0.08);
                    }

                    /* ================= EXPLORE BUTTON STYLE FROM LANDING ================= */
                    .premium-btn {
                        display: inline-flex;
                        align-items: center;
                        justify-content: center;
                        width: 100%;
                        height: 3.5em;
                        border-radius: 30em;
                        font-size: 15px;
                        font-family: inherit;
                        text-decoration: none;
                        border: none;
                        position: relative;
                        overflow: hidden;
                        cursor: pointer;
                        color: #1e293b;
                        background: white;
                        box-shadow: 4px 4px 10px #e2e8f0,
                                    -4px -4px 10px #ffffff;
                        transition: all 0.3s ease;
                        font-weight: 500;
                    }

                    .premium-btn::before {
                        content: '';
                        position: absolute;
                        inset: 0;
                        border-radius: 30em;
                        background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
                        transform: scaleX(0);
                        transform-origin: left;
                        transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                        z-index: 0;
                    }

                    .premium-btn:hover::before {
                        transform: scaleX(1);
                    }

                    .premium-btn:hover {
                        color: white;
                        transform: translateY(-2px);
                        box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2);
                    }

                    .premium-btn span {
                        position: relative;
                        z-index: 1;
                        transition: color 0.3s ease;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                    }

                    .premium-btn:hover span {
                        color: white;
                    }

                    /* iOS Picker Styles */
                    .ios-datepicker-container {
                        display: flex;
                        flex-direction: column;
                        background: #fff;
                        padding: 0;
                        overflow: hidden;
                    }

                    .ios-wheel-view {
                        display: flex;
                        height: 200px;
                        position: relative;
                        background: #fff;
                        overflow: hidden;
                    }

                    .ios-wheel-column {
                        flex: 1;
                        height: 100%;
                        overflow-y: scroll;
                        scroll-snap-type: y mandatory;
                        scrollbar-width: none;
                        -ms-overflow-style: none;
                        display: flex;
                        flex-direction: column;
                    }

                    .ios-wheel-column::-webkit-scrollbar {
                        display: none;
                    }

                    .ios-wheel-item {
                        height: 40px;
                        min-height: 40px;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        scroll-snap-align: center;
                        font-family: 'Poppins', sans-serif;
                        font-size: 16px;
                        color: #64748b; /* Darker slate for better visibility */
                        transition: all 0.2s ease;
                        white-space: nowrap;
                        padding: 0 4px;
                    }

                    .ios-wheel-item.disabled {
                        color: #94a3b8; /* Keep it visible but clearly disabled */
                        opacity: 0.5;
                    }

                    .ios-wheel-item.active {
                        color: #0f172a;
                        font-weight: 600;
                        font-size: 19px;
                        transform: scale(1.05);
                    }

                    .ios-wheel-highlight {
                        position: absolute;
                        top: 80px;
                        left: 10px;
                        right: 10px;
                        height: 40px;
                        border-top: 1px solid #e2e8f0;
                        border-bottom: 1px solid #e2e8f0;
                        pointer-events: none;
                        background: rgba(99, 102, 241, 0.03);
                    }

                    .ios-wheel-gradient-top {
                        position: absolute;
                        top: 0;
                        left: 0;
                        right: 0;
                        height: 80px;
                        background: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
                        pointer-events: none;
                        z-index: 2;
                    }

                    .ios-wheel-gradient-bottom {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 80px;
                        background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%);
                        pointer-events: none;
                        z-index: 2;
                    }

                    .ios-label {
                        font-size: 0.75rem;
                        font-weight: 600;
                        color: #6366f1;
                        text-transform: uppercase;
                        letter-spacing: 0.05em;
                        margin-bottom: 8px;
                        display: block;
                    }
                `}
            </style>
            {/* ── Header ── */}
            <Header />

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

                <div style={{
                    ...S.heroTitle,
                    bottom: isMobile ? "60px" : "80px",
                    left: isMobile ? "24px" : "80px",
                }}>
                    <div style={{
                        ...S.heroBrand,
                        fontSize: isMobile ? "3rem" : S.heroBrand.fontSize
                    }}>
                        {hotel.name}
                    </div>
                    <div style={{
                        ...S.heroSubtitle,
                        fontSize: isMobile ? "1rem" : S.heroSubtitle.fontSize
                    }}>
                        {hotel.area.slice(0, 35)}...
                    </div>
                </div>

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
                style={{
                    ...S.infoBar,
                    margin: isMobile ? "24px" : S.infoBar.margin,
                    padding: isMobile ? "24px" : S.infoBar.padding,
                    gap: isMobile ? "24px" : S.infoBar.gap
                }}
            >
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.9rem" : S.infoItem.fontSize }}>
                    <LocationOnIcon style={{ ...S.infoIcon, fontSize: "1.2rem" }} />
                    {hotel.area.slice(0, 25)}...  &nbsp;, {hotel.city}
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <a href='#review' style={{textDecoration:"none"}}>
                <div style={{ ...S.infoItem, fontSize: isMobile ? "0.9rem" : S.infoItem.fontSize }}>
                    <StarIcon style={{ ...S.infoIcon, color: "#f59e0b", fontSize: "1.2rem" }} />
                    <strong>{hotel.average_rating || "0.0"}</strong>
                    <span style={{ fontWeight: 400, color: "#94a3b8" }}>({hotel.reviews_count || "0"} reviews)</span>
                </div>
                </a>
                {!isMobile && <div style={S.infoSep} />}
                <div style={{
                    ...S.infoItem,
                    fontSize: isMobile ? "0.9rem" : S.infoItem.fontSize,
                    textAlign: isMobile ? "center" : "left",
                    width: isMobile ? "100%" : "auto"
                }}>
                    <span style={{ fontStyle: "italic", color: "#64748b" }}>Crafted for Those Who Expect the Best</span>
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
                                fontFamily: "'Poppins', sans-serif",
                                fontSize: "1rem",
                                color: "#475569",
                                lineHeight: "1.8",
                                marginBottom: "24px"
                            }}>
                                {hotel.description}
                            </p>

                            {Array.isArray(hotel.nearby_attractions) && hotel.nearby_attractions.length > 0 && (
                                <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #f0f0f0" }}>
                                    <Typography variant="overline" sx={{ color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Nearby Attractions
                                    </Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
                                        {hotel.nearby_attractions.map((place, idx) => (
                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                                <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#334155" }}>{place.name}</span>
                                                <span style={{ fontSize: "0.8rem", color: "#64748b", background: "#fff", padding: "2px 8px", borderRadius: "6px" }}>{parseFloat(place.distance_km).toFixed(1)} km</span>
                                            </div>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </div>

                        {/* Available Rooms Section */}
                        <div className="section-card reveal active" data-reveal-id="rooms" id="rooms">
                            <h2 className="section-title">Available Accommodations</h2>
                            {rooms.length > 0 ? (
                                <div style={{
                                    display: "grid",
                                    gridTemplateColumns: isMobile ? "1fr" : isTablet ? "repeat(2, 1fr)" : "repeat(2, 1fr)",
                                    gap: "24px",
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
                                <div style={{ textAlign: "center", padding: "40px", color: "#94a3b8", fontStyle: "italic" }}>
                                    No rooms currently available. Please contact us for details.
                                </div>
                            )}
                        </div>

                        {/* Map Section */}
                        <div className="section-card reveal active" data-reveal-id="location" style={{ padding: "8px", overflow: "hidden" }}>
                            <iframe
                                height="450"
                                width="100%"
                                style={{ display: "block", border: 0, borderRadius: "16px" }}
                                loading="lazy"
                                src={`https://www.google.com/maps?q=${hotel.area || hotel.name}&output=embed`}
                                title="map"
                            />
                        </div>

                        {/* Amenities Section */}
                        <div className="section-card reveal active" data-reveal-id="features">
                            <h2 className="section-title">World-Class Amenities</h2>
                            <Box sx={{
                                display: "grid",
                                gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" },
                                gap: 2
                            }}>
                                {(Array.isArray(hotel.amenities)
                                    ? hotel.amenities
                                    : (hotel.amenities || "").split(",").map(a => a.trim()).filter(Boolean)
                                ).map((amenity, idx) => (
                                    <div key={idx} className="feature-pill">
                                        <div style={{ color: "#6366f1" }}>
                                            {amenityIconMap[amenity] || <CheckIcon sx={{ fontSize: "1.1rem" }} />}
                                        </div>
                                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#334155" }}>{amenity}</span>
                                    </div>
                                ))}
                            </Box>
                        </div>

                        {/* Reviews Section */}
                        <div className="section-card reveal active" data-reveal-id="reviews" id="review">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }}>
                                <h2 className="section-title" style={{ marginBottom: 0 }}>Guest Voices</h2>
                                <Button
                                    variant="outlined"
                                    onClick={handleWriteReviewClick}
                                    sx={{ borderRadius: "50px", px: 3, textTransform: "none", color: "#6366f1", borderColor: "#6366f1", fontWeight: 600, "&:hover": { borderColor: "#4f46e5", bgcolor: "#f5f3ff" } }}
                                >
                                    Share Your Experience
                                </Button>
                            </div>

                            <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4, p: 3, background: "#f8fafc", borderRadius: "20px", border: "1px solid #f1f5f9" }}>
                                <div style={{ textAlign: "center" }}>
                                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{hotel?.average_rating || "N/A"}</div>
                                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>out of 5</div>
                                </div>
                                <div style={{ width: "2px", height: "40px", background: "#e2e8f0" }}></div>
                                <div>
                                    <div style={{ display: "flex", gap: "2px", mb: 0.5 }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <StarIcon key={s} sx={{ color: s <= (parseFloat(hotel?.average_rating) || 0) ? "#f59e0b" : "#e2e8f0", fontSize: 20 }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>Based on {reviews.length || 0} verified guest experiences</div>
                                </div>
                            </Box>

                            {!Array.isArray(reviews) || reviews.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💬</div>
                                    <p style={{ fontWeight: 500 }}>No reviews yet. Be the first to share your journey!</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {reviews.map((rev, idx) => (
                                        <div key={rev.id || idx} className="review-item">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.2rem", boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)" }}>
                                                        {(rev.user_name || "G")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>{rev.user_name || "Verified Guest"}</div>
                                                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : "Recently"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1px" }}>
                                                    {Array.from({ length: 5 }, (_, i) => (
                                                        <StarIcon key={i} sx={{ color: i < rev.rating ? "#f59e0b" : "#e2e8f0", fontSize: 16 }} />
                                                    ))}
                                                </div>
                                            </div>
                                            {rev.comment && (
                                                <p style={{ color: "#334155", lineHeight: 1.7, fontSize: "0.95rem", marginLeft: "62px", marginBottom: "16px", fontStyle: "italic" }}>
                                                    "{rev.comment}"
                                                </p>
                                            )}
                                            {Array.isArray(rev.images) && rev.images.length > 0 && (
                                                <div style={{ display: "flex", gap: "12px", marginLeft: "62px", flexWrap: "wrap" }}>
                                                    {rev.images.map((img, i) => (
                                                        <img
                                                            key={i}
                                                            src={img.image}
                                                            alt="review"
                                                            style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "12px", cursor: "pointer", border: "2px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s" }}
                                                            onClick={() => window.open(img.image, '_blank')}
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
                                    <Typography variant="h6" fontWeight="700" color="#0f172a">Booking</Typography>
                                    <Chip
                                        icon={<CheckIcon style={{ fontSize: 14 }} />}
                                        label="Premium Stay"
                                        size="small"
                                        sx={{ bgcolor: "rgba(99, 102, 241, 0.1)", color: "#6366f1", fontWeight: 600 }}
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                                    <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>Rooms from</span>
                                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b" }}>₹{rooms.length > 0 ? Math.min(...rooms.map(r => r.price)).toLocaleString() : "---"}</span>
                                    <span style={{ fontSize: "0.9rem", color: "#64748b" }}>/ night</span>
                                </div>
                            </Box>

                            <Box sx={{ mb: 3, p: 2, background: "#fff9f2", borderRadius: "16px", border: "1px dashed #fbd38d" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                    <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ed8936", animation: "pulse 2s infinite" }}></div>
                                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#c05621", letterSpacing: "0.02em" }}>
                                        HIGH DEMAND FOR THESE DATES
                                    </span>
                                </div>
                            </Box>

                            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", marginTop: "6px" }}></div>
                                    <Typography variant="body2" color="#475569">Instant confirmation on all rooms.</Typography>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", marginTop: "6px" }}></div>
                                    <Typography variant="body2" color="#475569">ServNex Verified Luxury Property.</Typography>
                                </div>
                            </Box>

                            <Button
                                fullWidth
                                variant="contained"
                                onClick={() => {
                                    const el = document.getElementById("rooms");
                                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                                }}
                                sx={{
                                    py: 2,
                                    borderRadius: "16px",
                                    fontSize: "1rem",
                                    fontWeight: 700,
                                    textTransform: "none",
                                    background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                                    boxShadow: "0 10px 20px rgba(99, 102, 241, 0.2)",
                                    transition: "all 0.3s ease",
                                    fontFamily: "'Poppins', sans-serif",
                                    "&:hover": {
                                        transform: "translateY(-2px)",
                                        boxShadow: "0 15px 30px rgba(99, 102, 241, 0.3)",
                                    }
                                }}
                            >
                                Check Available Rooms
                            </Button>
                        </div>

                        {/* Additional Sidebar Info */}
                        <Box sx={{ mt: 3, textAlign: "center", p: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, fontFamily: "'Poppins', sans-serif" }}>
                                <NotificationsIcon sx={{ fontSize: 16 }} />
                                Standard ServNex Booking Policy Applies
                            </Typography>
                        </Box>
                    </aside>
                </div>
            </div>

            {/* ── Booking Modal ── */}
            <Modal open={open} onClose={handleClose}>
                <div style={S.modal}>
                    {checkStatus === "input" && (
                        <>
                            <div style={S.modalTitle}>Select Dates</div>
                            <div style={{ display: "flex", flexDirection: "column", textAlign: "left" }}>
                                <IOSDateTimePickerPopup
                                    label="Check-in Date"
                                    value={checkIn}
                                    onChange={(newIn) => {
                                        setCheckIn(newIn);
                                        // Handle check-out auto-update
                                        const d = new Date(newIn.includes("T") ? newIn : newIn + "T00:00:00");
                                        d.setDate(d.getDate() + 1);
                                        const nextDay = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
                                        if (!checkOut || checkOut <= newIn) {
                                            setCheckOut(nextDay);
                                        }
                                    }}
                                />
                                <IOSDateTimePickerPopup
                                    label="Check-out Date"
                                    value={checkOut}
                                    onChange={setCheckOut}
                                    minDateRaw={checkIn}
                                />
                            </div>
                            <div style={{ marginTop: "28px" }}>
                                <GradBtn onClick={performCheck} fullWidth>Check Availability</GradBtn>
                            </div>
                        </>
                    )}

                    {checkStatus === "checking" && (
                        <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                            <CircularProgress style={{ color: "#6366f1" }} size={40} thickness={3} />
                            <div style={{ ...S.modalTitle, margin: 0, fontSize: "1.5rem" }}>Checking Availability…</div>
                        </div>
                    )}

                    {checkStatus === "available" && (
                        <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <AnimatedCheck />
                            <div style={{ ...S.modalTitle, color: "#10b981", fontSize: "1.5rem" }}>Rooms are Available</div>
                            <p style={{ color: "#64748b", fontFamily: "'Poppins', sans-serif", fontSize: "0.95rem" }}>Preparing your booking experience…</p>
                        </div>
                    )}

                    {checkStatus === "full" && (
                        <div style={{ padding: "32px 0", display: "flex", flexDirection: "column", alignItems: "center" }}>
                            <AnimatedCross />
                            <div style={{ ...S.modalTitle, color: "#ef4444", fontSize: "1.5rem" }}>Rooms not available</div>
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
                    width: { xs: '90%', sm: 420 }, bgcolor: 'white', borderRadius: "20px", p: 4, outline: "none",
                    boxShadow: "0 20px 50px rgba(0,0,0,0.1)"
                }}>
                    <Typography variant="h6" fontWeight="600" mb={1} sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        Rate Your Experience
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontFamily: "'Poppins', sans-serif" }}>
                        How was your stay at {hotel?.name}? {eligibleBooking?.room_type && `(${eligibleBooking.room_type})`}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
                        {[1, 2, 3, 4, 5].map(s => (
                            <IconButton key={s} onClick={() => setReviewRating(s)}>
                                <StarIcon sx={{ fontSize: 32, color: s <= reviewRating ? "#f59e0b" : "#e2e8f0" }} />
                            </IconButton>
                        ))}
                    </Box>

                    <textarea
                        placeholder="Write your review here..."
                        value={reviewComment}
                        onChange={(e) => {
                            const val = e.target.value;
                            if (val.length <= 1000 && /^[a-zA-Z0-9\s,\.]*$/.test(val)) {
                                setReviewComment(val);
                            }
                        }}
                        style={{
                            width: "100%", height: "100px", padding: "12px", borderRadius: "12px",
                            border: "1px solid #f1f5f9", fontFamily: "'Poppins', sans-serif", fontSize: "0.9rem",
                            resize: "none", outline: "none", marginBottom: "16px", color: "#334155"
                        }}
                    />
                    <div style={{
                        textAlign: "right",
                        fontSize: "0.75rem",
                        color: reviewComment.length >= 1000 ? "#ef4444" :
                            reviewComment.length >= 800 ? "#f97316" : "#94a3b8",  // red at 500, orange at 400
                        marginTop: "-12px",
                        marginBottom: "16px"
                    }}>
                        {reviewComment.length} / 1000   {/* ← was /100, fix to match your actual limit */}
                    </div>

                    <div style={{ marginBottom: "20px", textAlign: "left" }}>
                        <label style={{ fontSize: "0.8rem", fontWeight: 500, color: "#6366f1", display: "block", marginBottom: "8px" }}>
                            Add Photo (Optional)
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => {
                                const file = e.target.files[0];
                                setReviewImages(file ? [file] : []);
                            }}
                            style={{ fontSize: "0.75rem", width: "100%", color: "#64748b" }}
                        />
                        {reviewImages.length > 0 && (
                            <div style={{ display: "flex", gap: "5px", marginTop: "10px", flexWrap: "wrap" }}>
                                {reviewImages.map((img, i) => (
                                    <div key={i} style={{ fontSize: "0.7rem", padding: "2px 8px", background: "#f8fafc", borderRadius: "20px", color: "#64748b" }}>
                                        {img.name}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <Button
                        fullWidth
                        variant="contained"
                        onClick={handleReviewSubmit}
                        disabled={isSubmittingReview}
                        sx={{
                            py: 1.2, borderRadius: "12px", textTransform: "none", fontWeight: 500,
                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
                            boxShadow: "0 4px 12px rgba(99, 102, 241, 0.2)",
                            fontFamily: "'Poppins', sans-serif",
                            "&:hover": { transform: "translateY(-1px)" }
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
        wifi: <WifiIcon sx={{ fontSize: "0.9rem" }} />,
        internet: <WifiIcon sx={{ fontSize: "0.9rem" }} />,
        ac: <AcUnitIcon sx={{ fontSize: "0.9rem" }} />,
        air: <AcUnitIcon sx={{ fontSize: "0.9rem" }} />,
        parking: <LocalParkingIcon sx={{ fontSize: "0.9rem" }} />,
        pool: <PoolIcon sx={{ fontSize: "0.9rem" }} />,
        swimming: <PoolIcon sx={{ fontSize: "0.9rem" }} />,
        gym: <FitnessCenterIcon sx={{ fontSize: "0.9rem" }} />,
        fitness: <FitnessCenterIcon sx={{ fontSize: "0.9rem" }} />,
        breakfast: <RestaurantIcon sx={{ fontSize: "0.9rem" }} />,
        food: <RestaurantIcon sx={{ fontSize: "0.9rem" }} />,
        restaurant: <RestaurantIcon sx={{ fontSize: "0.9rem" }} />,
    };

    return (
        <div
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
            style={{
                ...S.roomCard,
                boxShadow: hovered
                    ? "0 20px 40px rgba(0, 0, 0, 0.04)"
                    : S.roomCard.boxShadow,
                transform: hovered ? "translateY(-6px)" : "translateY(0)",
            }}
        >
            <div style={{ position: "relative", overflow: "hidden" }}>
                <img
                    src={room.image || "https://via.placeholder.com/400x220?text=Premium+Room"}
                    alt={room.room_type}
                    style={{
                        ...S.roomImg,
                        transition: "transform 0.6s ease",
                        transform: hovered ? "scale(1.05)" : "scale(1)",
                    }}
                />
            </div>
            <div style={S.roomBody}>
                <div style={S.roomName}>{room.room_type}</div>
                <div style={S.roomDesc}>
                    {room.description
                        ? room.description.substring(0, 100) + "…"
                        : "Experience ultimate comfort in our beautifully appointed rooms with city views."}
                </div>

                {/* Price + Adults + Bed Type */}
                <div style={{
                    display: "flex",
                    justifyContent: "center",
                    gap: isMobile ? "8px" : "10px",
                    marginBottom: "16px",
                    flexWrap: "wrap",
                    flexDirection: isMobile ? "row" : "row"
                }}>

                    <div style={{
                        width: "48%",
                        textAlign: "center",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontFamily: "'Poppins', sans-serif",
                        background: "#f8fafc",
                        fontWeight: 400
                    }}>
                        Capacity : {room.adults}
                    </div>
                    {room.bed_type && (
                        <div style={{
                            width: "48%",
                            textAlign: "center",
                            padding: "6px 10px",
                            borderRadius: "8px",
                            border: "1px solid #f1f5f9",
                            fontSize: "0.8rem",
                            color: "#64748b",
                            fontFamily: "'Poppins', sans-serif",
                            background: "#f8fafc",
                            fontWeight: 400
                        }}>
                            Bed : {room.bed_type}
                        </div>
                    )}

                    <div style={{
                        width: "48%",
                        textAlign: "center",
                        padding: "6px 10px",
                        borderRadius: "8px",
                        border: "1px solid #f1f5f9",
                        fontSize: "0.8rem",
                        color: "#64748b",
                        fontFamily: "'Poppins', sans-serif",
                        background: "#f8fafc",
                        whiteSpace: "nowrap",
                        fontWeight: 400
                    }}>
                        Price : ₹{Math.round(room.price)}
                    </div>

                </div>

                <div style={{ marginTop: "auto" }}>
                    <BookBtn onClick={onBook} />
                </div>
            </div>
        </div>
    );
}