import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
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

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);

    const [open, setOpen] = useState(false);
    const [reservationDate, setReservationDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [numberOfGuests, setNumberOfGuests] = useState(4);
    const [timeHour, setTimeHour] = useState(() => String(getInitTime().initHour).padStart(2, "0"));
    const [timeMinute, setTimeMinute] = useState(() => String(new Date().getMinutes()).padStart(2, "0"));
    const [timePeriod, setTimePeriod] = useState(() => getInitTime().initPeriod);

    useEffect(() => {
        setLoading(true);
        axios.get(`http://127.0.0.1:8000/api/restaurants/${id}/`)
            .then(res => { setRestaurant(res.data); setLoading(false); })
            .catch(err => { setError(err.message || "Failed to load restaurant"); setLoading(false); });
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
            width: "50%",
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
            boxShadow: "0 4px 12px rgba(102, 126, 234, 0.05)",
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
                        transform: translateY(-3px) scale(1.02);
                        box-shadow: 0 12px 24px rgba(102, 126, 234, 0.25) !important;
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
                    <strong>{restaurant.rating || "4.8"}</strong>&nbsp;
                    <span style={{ fontWeight: 400, color: "#667eeaff" }}>(876 reviews)</span>
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
                                    {restaurant.name}
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
                </div>
            </section>

            <div className="container my-5 px-lg-5">
                <Card className="premium-card overflow-hidden">
                    <CardContent className="p-5">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                            <div>
                                <h1 style={{ fontSize: "2.4rem", fontWeight: 700, color: "#2d3436", marginBottom: "8px" }}>
                                    {restaurant.name}
                                </h1>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "#636e72", mb: 2 }}>
                                    <MapPin size={18} />
                                    <Typography variant="body1">{restaurant.area}, {restaurant.city}</Typography>
                                </Box>
                            </div>
                            <div
                                className="smooth-grad-btn"
                                style={{
                                    ...S.bookBtn,
                                    width: "auto",
                                    padding: "6px 20px",
                                    marginTop: 0,
                                    fontSize: "0.85rem",
                                    maxHeight: "36px",
                                    background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
                                    backdropFilter: "blur(10px)",
                                }}
                            >
                                {restaurant.badge || "Restaurant"}
                            </div>
                        </div>

                        <div className="d-flex align-items-center gap-3 mb-4">
                            <div className="info-tag">
                                <Utensils size={14} />
                                {restaurant.cuisine_type}
                            </div>
                            <div className="info-tag">
                                {restaurant.price_range || "₹₹₹"}
                            </div>
                        </div>

                        <Divider sx={{ mb: 4 }} />

                        <div className="mb-4">
                            <span className="price-main">₹{Number(restaurant.average_cost_for_two).toLocaleString()}</span>
                            <span style={{ color: "#636e72", marginLeft: "10px", fontSize: "1.1rem" }}>For Table</span>
                        </div>

                        {/* Restaurant Information Grid */}
                        <Box sx={{
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
                            backdropFilter: "blur(10px)", borderRadius: "20px", p: 4, mb: 4
                        }}>
                            <Typography variant="h6" fontWeight="700" color="#2d3436" gutterBottom mb={3}>
                                Restaurant Information
                            </Typography>
                            <Box sx={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 3 }}>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: "1px solid #e0e0e0" }}>
                                    <Utensils size={20} color="#1e63d0" />
                                    <Typography variant="body1" color="#2d3436"><strong>Cuisine:</strong> {restaurant.cuisine_type}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: "1px solid #e0e0e0" }}>
                                    <span style={{ fontSize: "1.2rem", color: "#1e63d0" }}>₹</span>
                                    <Typography variant="body1" color="#2d3436"><strong>Price Range:</strong> {restaurant.price_range || "₹₹₹"}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: "1px solid #e0e0e0" }}>
                                    <Hotel size={20} color="#1e63d0" />
                                    <Typography variant="body1" color="#2d3436"><strong>Total Tables:</strong> {restaurant.total_tables}</Typography>
                                </Box>
                                <Box sx={{ display: "flex", alignItems: "center", gap: 2, pb: 2, borderBottom: "1px solid #e0e0e0" }}>
                                    <Bell size={20} color="#1e63d0" />
                                    <Typography variant="body1" color="#2d3436"><strong>Total Tables:</strong> {restaurant.total_tables}</Typography>
                                </Box>
                            </Box>
                        </Box>

                        {/* Reservation Box */}
                        <Box sx={{
                            background: "linear-gradient(135deg, rgba(102, 126, 234, 0.15) 0%, rgba(118, 75, 162, 0.15) 100%)",
                            backdropFilter: "blur(10px)", borderRadius: "16px", p: 3
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
        </div>
    );
}