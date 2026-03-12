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

    useEffect(() => {
        if (!isMobile || images.length === 0) return;
        const interval = setInterval(() => {
            setActiveIndex(prev => (prev + 1) % images.length);
        }, 3000);
        return () => clearInterval(interval);
    }, [isMobile, images.length]);

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
        <div className="d-flex justify-content-center align-items-center vh-100">
            <CircularProgress /><Typography ml={2}>Loading Restaurant...</Typography>
        </div>
    );

    if (error || !restaurant) return (
        <div className="container mt-5 text-center">
            <Typography variant="h5" color="error" gutterBottom>Error Loading Restaurant</Typography>
            <Typography color="textSecondary" paragraph>{error || "Restaurant not found"}</Typography>
            <Button variant="contained" onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
    );

    return (
        <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh" }}>
             {/* CUSTOM HEADER (Image design) */}
            <header className="hotel-custom-header">

                <Link to="/" className="header-logo"
                    style={{
                        textDecoration: "none",
                        display: "flex",
                        alignItems: "center",
                        gap: "12px",
                    }}>
                    <img
                        src="/logo.jpeg"
                        alt="ServNex Logo"
                        style={{
                            height: "40px",
                            width: "40px",
                            borderRadius: "10px",
                            objectFit: "cover",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                        }} />
                    ServNex
                </Link>
                <div className="notification-bell-circle">
                    <Bell size={20} />
                    <div className="bell-overlay">Bell</div>
                </div>
            </header>


            <div className="container my-4">
                <Card className="shadow-lg rounded-4 overflow-hidden border-0">

                    {isMobile ? (
                        <Box sx={{ position: "relative", height: 260, overflow: "hidden" }}>
                            <img src={images[activeIndex] || "https://via.placeholder.com/400"} alt="restaurant"
                                className="w-100 h-100" style={{ objectFit: "cover", transition: "0.5s" }} />
                            <Box sx={{ position: "absolute", bottom: 10, width: "100%", display: "flex", justifyContent: "center", gap: 1 }}>
                                {images.map((_, i) => (
                                    <Box key={i} sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: i === activeIndex ? "white" : "rgba(255,255,255,0.5)" }} />
                                ))}
                            </Box>
                        </Box>
                    ) : (
                        <div className="row g-1">
                            {images.map((img, i) => (
                                <div key={i} className="col-md-4">
                                    <img src={img} className="img-fluid rounded" style={{ height: "300px", width: "100%", objectFit: "cover" }} alt="restaurant" />
                                </div>
                            ))}
                        </div>
                    )}

                    <CardContent className="p-4">
                        <div className="d-flex justify-content-between align-items-start">
                            <Typography variant="h4" fontWeight="bold">{restaurant.name}</Typography>
                            <Chip label={restaurant.badge || "Restaurant"} color="primary" size="small" />
                        </div>
                        <Box className="d-flex align-items-center gap-1 mt-2 text-muted">
                            <LocationOnIcon fontSize="small" />{restaurant.area}, {restaurant.city}
                        </Box>
                        <div className="d-flex align-items-center gap-2 mt-2 mb-3">
                            {restaurant.rating && (
                                <div className="d-flex align-items-center gap-1">
                                    <StarIcon sx={{ color: "#f4c430" }} />
                                    <span className="fw-bold">{restaurant.rating}</span>
                                </div>
                            )}
                            <Chip icon={<UtensilsCrossed />} label={restaurant.cuisine_type} size="small" variant="outlined" />
                            <Chip label={restaurant.price_range || ""} size="small" variant="outlined" />
                        </div>
                        <Divider />
                        <Typography variant="body1" color="text.secondary" my={3} sx={{ lineHeight: 1.8 }}>
                            {restaurant.description}
                        </Typography>
                        <Typography variant="h5" color="primary" fontWeight="bold">
                            ₹{Number(restaurant.average_cost_for_two).toLocaleString()} <span className="fs-6 text-muted fw-normal">For Table</span>
                        </Typography>
                    </CardContent>

                    <CardContent className="bg-light p-4">
                        <Typography variant="h6" fontWeight="bold" gutterBottom>Restaurant Information</Typography>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                            <Typography variant="body2" color="text.secondary"><strong>Cuisine:</strong> {restaurant.cuisine_type}</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Type:</strong> {restaurant.badge}</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Price Range:</strong> {restaurant.price_range}</Typography>
                            <Typography variant="body2" color="text.secondary"><strong>Total Tables:</strong> {restaurant.total_tables}</Typography>
                        </Box>
                    </CardContent>

                    <CardContent className="p-4">
                        {restaurant.total_tables < 5 && restaurant.total_tables > 0 && (
                            <div className="mb-2"><Chip label="Limited Tables Available!" color="warning" size="small" /></div>
                        )}
                        <Button fullWidth variant="contained" size="large"
                            sx={{ borderRadius: "12px", py: 1.5, fontSize: '1.2rem', textTransform: 'none' }}
                            onClick={handleOpenModal}>
                            Reserve a Table
                        </Button>
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