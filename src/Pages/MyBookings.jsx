import React, { useEffect, useState } from "react";
import AxiosInstance from "../Component/AxiosInstance";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Chip, Box, Card, CardContent, Button, Tabs, Tab, Modal, IconButton } from "@mui/material";
import { Bell, Calendar, MapPin, Utensils, Hotel, Download, X, Star } from "lucide-react";

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [menuImage, setMenuImage] = useState(null);

    // Review popup state
    const [reviewPopup, setReviewPopup] = useState(null); // holds reservation object
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewLoading, setReviewLoading] = useState(false);
    const [reviewError, setReviewError] = useState("");
    
    // Details Modal state
    const [detailsModal, setDetailsModal] = useState(null); // holds booking/reservation object

    useEffect(() => {
        setLoading(true);
        Promise.all([
            AxiosInstance.get("api/bookings/"),
            AxiosInstance.get("api/my-reservations/")
        ]).then(([bookingsRes, reservationsRes]) => {
            setBookings(bookingsRes.data);
            setReservations(reservationsRes.data);
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching bookings:", err);
            setLoading(false);
        });
    }, []);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const openReviewPopup = (reservation) => {
        setReviewPopup(reservation);
        setReviewRating(reservation.review_data ? reservation.review_data.rating : 5);
        setReviewComment(reservation.review_data ? reservation.review_data.comment || "" : "");
        setReviewError("");
    };

    const handleSubmitReview = async () => {
        if (!reviewRating) { setReviewError("Please select a rating."); return; }
        setReviewLoading(true);
        setReviewError("");
        try {
            const isEditing = reviewPopup.has_review && reviewPopup.review_data?.id;

            if (isEditing) {
                // UPDATE existing review
                const apiUrl = reviewPopup.hotel 
                    ? `api/hotel-reviews/${reviewPopup.review_data.id}/` 
                    : `api/reviews/${reviewPopup.review_data.id}/`;
                
                await AxiosInstance.patch(apiUrl, {
                    rating: reviewRating,
                    comment: reviewComment,
                });
            } else {
                // CREATE new review
                if (reviewPopup.hotel) {
                    await AxiosInstance.post("api/hotel-reviews/", {
                        booking: reviewPopup.id,
                        rating: reviewRating,
                        comment: reviewComment,
                    });
                } else {
                    await AxiosInstance.post("api/reviews/", {
                        reservation: reviewPopup.id,
                        rating: reviewRating,
                        comment: reviewComment,
                    });
                }
            }

            // Update local state
            if (reviewPopup.hotel) {
                setBookings(prev => prev.map(b =>
                    b.id === reviewPopup.id
                        ? {
                            ...b,
                            has_review: true,
                            review_data: {
                                ...b.review_data,
                                rating: reviewRating,
                                comment: reviewComment,
                                created_at: b.review_data?.created_at || new Date().toISOString()
                            }
                        }
                        : b
                ));
            } else {
                setReservations(prev => prev.map(r =>
                    r.id === reviewPopup.id
                        ? {
                            ...r,
                            has_review: true,
                            review_data: {
                                ...r.review_data,
                                rating: reviewRating,
                                comment: reviewComment,
                                created_at: r.review_data?.created_at || new Date().toISOString()
                            }
                        }
                        : r
                ));
            }
            setReviewPopup(null);
        } catch (err) {
            const data = err.response?.data;
            if (data?.non_field_errors) setReviewError(data.non_field_errors[0]);
            else setReviewError("Failed to submit review. Please try again.");
        } finally {
            setReviewLoading(false);
        }
    };

    const handleDownloadReceipt = (item) => {
        const isHotel = !!item.hotel;
        const printWindow = window.open('', '_blank');
        
        let detailsHtml = "";
        if (isHotel) {
            const h = item.hotel_details || {};
            detailsHtml = `
                <div class="item"><div class="label">Hotel</div><div class="val">${h.name || "ServNex Hotel"}</div></div>
                <div class="item"><div class="label">Booking ID</div><div class="val">#SNX-HTL-${item.id}</div></div>
                <div class="item"><div class="label">Check In</div><div class="val">${item.check_in}</div></div>
                <div class="item"><div class="label">Check Out</div><div class="val">${item.check_out}</div></div>
                <div class="item"><div class="label">Room Type</div><div class="val">${item.room_type || "Standard"}</div></div>
                <div class="item"><div class="label">Total Rooms</div><div class="val">${item.rooms_booked || 1}</div></div>
            `;
        } else {
            detailsHtml = `
                <div class="item"><div class="label">Restaurant</div><div class="val">${item.restaurant_name}</div></div>
                <div class="item"><div class="label">Reservation ID</div><div class="val">#SNX-RES-${item.id}</div></div>
                <div class="item"><div class="label">Date</div><div class="val">${item.reservation_date}</div></div>
                <div class="item"><div class="label">Time</div><div class="val">${item.reservation_time}</div></div>
                <div class="item"><div class="label">Guests</div><div class="val">${item.number_of_guests}</div></div>
                <div class="item"><div class="label">Location</div><div class="val">${item.restaurant_area || ""}, ${item.restaurant_city || ""}</div></div>
            `;
        }

        const content = `
            <html>
                <head>
                    <title>Receipt - ${isHotel ? "Hotel Booking" : "Restaurant Reservation"}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid ${isHotel ? "#667eea" : "#3a86ff"}; padding-bottom: 20px; margin-bottom: 30px; }
                        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .item { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #666; font-size: 0.9rem; text-transform: uppercase; }
                        .val { font-size: 1.1rem; margin-top: 5px; }
                        .footer { margin-top: 50px; font-size: 0.8rem; color: #888; border-top: 1px solid #eee; pt: 20px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ServNex ${isHotel ? "Hotels" : "Restaurants"}</h1>
                        <p>Official Confirmation Receipt</p>
                    </div>
                    <div class="details">
                        ${detailsHtml}
                    </div>
                    <div class="footer">
                        <p>Thank you for choosing ServNex. This is an electronically generated confirmation for your reference.</p>
                        <p>Status: ${item.status.toUpperCase()}</p>
                    </div>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return "http://127.0.0.1:8000" + url;
    };

    const renderStars = (rating, interactive = false, onSelect = null) => {
        return Array.from({ length: 5 }, (_, i) => (
            <span
                key={i}
                onClick={() => interactive && onSelect && onSelect(i + 1)}
                style={{
                    fontSize: interactive ? "2rem" : "1rem",
                    color: i < rating ? "#f59e0b" : "#d1d5db",
                    cursor: interactive ? "pointer" : "default",
                    transition: "transform 0.1s",
                }}
            >&#9733;</span>
        ));
    };

    const getStatusChipColor = (status) => {
        if (status === "Your Table Is Ready") return "success";
        if (status === "completed") return "default";
        if (status === "cancelled") return "error";
        return "warning";
    };

    if (loading) return <div className="text-center mt-5">Loading your trips...</div>;

    return (
        <div className="min-vh-100 bg-light">

            {/* ── MENU IMAGE POPUP ── */}
            {menuImage && (
                <>
                    <div onClick={() => setMenuImage(null)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.7)", zIndex: 9998, backdropFilter: "blur(4px)" }} />
                    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999, background: "white", borderRadius: "20px", padding: "20px", maxWidth: "800px", width: "95%", boxShadow: "0 20px 60px rgba(0,0,0,0.4)" }}>
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="fw-bold mb-0">📋 Restaurant Menu</h6>
                            <button onClick={() => setMenuImage(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontWeight: 700, fontSize: "1rem", color: "#374151" }}>✕</button>
                        </div>
                        <div style={{ overflow: "auto", maxHeight: "80vh" }}>
                            <img src={menuImage} alt="Menu" style={{ width: "100%", borderRadius: "12px", objectFit: "contain" }} />
                        </div>
                    </div>
                </>
            )}

            {/* ── REVIEW POPUP ── */}
            {reviewPopup && (
                <>
                    <div onClick={() => setReviewPopup(null)} style={{ position: "fixed", top: 0, left: 0, width: "100%", height: "100%", background: "rgba(0,0,0,0.6)", zIndex: 9998, backdropFilter: "blur(4px)" }} />
                    <div style={{ position: "fixed", top: "50%", left: "50%", transform: "translate(-50%, -50%)", zIndex: 9999, background: "white", borderRadius: "20px", padding: "32px", maxWidth: "420px", width: "92%", boxShadow: "0 20px 60px rgba(0,0,0,0.35)" }}>
                        {/* Header */}
                        <div className="d-flex justify-content-between align-items-center mb-3">
                            <div>
                                <h6 className="fw-bold mb-0">⭐ Leave a Review</h6>
                                <small className="text-muted">{reviewPopup.hotel ? reviewPopup.hotel_details?.name : reviewPopup.restaurant_name}</small>
                            </div>
                            <button onClick={() => setReviewPopup(null)} style={{ background: "#f3f4f6", border: "none", borderRadius: "50%", width: 32, height: 32, cursor: "pointer", fontWeight: 700, color: "#374151" }}>✕</button>
                        </div>

                        {/* Star selector */}
                        <div className="text-center mb-3">
                            <p className="text-muted small mb-1">Tap a star to rate</p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "6px" }}>
                                {renderStars(reviewRating, true, setReviewRating)}
                            </div>
                            <small className="text-muted mt-1 d-block">
                                {["", "Poor", "Fair", "Good", "Very Good", "Excellent"][reviewRating]}
                            </small>
                        </div>

                        {/* Comment box */}
                        <textarea
                            className="form-control mb-3"
                            rows="3"
                            placeholder="Share your experience... (optional)"
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            style={{ borderRadius: "10px", fontSize: "0.9rem" }}
                        />

                        {reviewError && <div className="alert alert-danger py-2 small mb-3">{reviewError}</div>}

                        <div className="d-flex gap-2">
                            <button
                                onClick={handleSubmitReview}
                                disabled={reviewLoading}
                                style={{ flex: 1, background: "#7c2d12", color: "white", border: "none", borderRadius: "12px", padding: "10px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
                            >
                                {reviewLoading ? "Submitting..." : "Submit Review"}
                            </button>
                            <button
                                onClick={() => setReviewPopup(null)}
                                style={{ flex: 1, background: "#f3f4f6", color: "#374151", border: "none", borderRadius: "12px", padding: "10px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

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


            <div className="container py-5">
                <h2 className="mb-4 fw-bold">My Bookings</h2>

                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab icon={<Hotel size={18} />} iconPosition="start" label="Hotels" sx={{ textTransform: "none", fontWeight: 600 }} />
                        <Tab icon={<Utensils size={18} />} iconPosition="start" label="Restaurants" sx={{ textTransform: "none", fontWeight: 600 }} />
                    </Tabs>
                </Box>

                {/* ── HOTEL BOOKINGS ── */}
                {activeTab === 0 && (
                    bookings.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No hotel bookings yet!</h4>
                            <Link to="/" className="btn btn-primary mt-3">Explore Hotels</Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {bookings.map(booking => {
                                const hotel = booking.hotel_details || {};
                                return (
                                    <div key={booking.id} className="col-md-6 col-lg-4">
                                        <Card className="shadow-sm rounded-4 border-0">
                                            <div className="position-relative">
                                                <img src={hotel.image || "https://via.placeholder.com/300?text=Hotel"} alt={hotel.name} className="w-100" style={{ height: 160, objectFit: "cover" }} />
                                                <div className="position-absolute top-0 end-0 m-2">
                                                    <Chip label={booking.status} color={booking.status === "confirmed" ? "success" : "default"} size="small" />
                                                </div>
                                            </div>
                                            <CardContent>
                                                <Typography variant="h6" fontWeight="bold">{hotel.name || "Hotel #" + booking.hotel}</Typography>
                                                <div className="text-muted small mb-3">
                                                    <MapPin size={16} className="me-1" />
                                                    {hotel.area ? hotel.area + ", " + hotel.city : "Location unavailable"}
                                                </div>
                                                {booking.room_type && <div className="mb-2"><Chip label={booking.room_type + " Room"} color="primary" variant="outlined" size="small" /></div>}
                                                <Box display="flex" flexDirection="column" gap={1} bgcolor="#f8f9fa" p={2} borderRadius={2}>
                                                    <div className="d-flex align-items-center gap-2"><Calendar size={18} className="text-primary" /> Check-in: {booking.check_in}</div>
                                                    <div className="d-flex align-items-center gap-2"><Calendar size={18} className="text-primary" /> Check-out: {booking.check_out}</div>
                                                </Box>

                                                {/* Show existing review if any */}
                                                {booking.review_data && (
                                                    <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "8px 12px", marginTop: "12px" }}>
                                                        <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                                            {Array.from({ length: 5 }, (_, i) => (
                                                                <span key={i} style={{ color: i < booking.review_data.rating ? "#f59e0b" : "#d1d5db", fontSize: "0.9rem" }}>&#9733;</span>
                                                            ))}
                                                            <small className="text-muted ms-1">Your review</small>
                                                        </div>
                                                        {booking.review_data.comment && (
                                                            <p style={{ fontSize: "0.8rem", color: "#0369a1", margin: 0 }}>"{booking.review_data.comment}"</p>
                                                        )}
                                                    </div>
                                                )}

                                                {/* Review Button - only for completed bookings */}
                                                {booking.status === "completed" && (
                                                    <button
                                                        onClick={() => openReviewPopup(booking)}
                                                        style={{
                                                            width: "100%",
                                                            marginTop: "16px",
                                                            padding: "8px",
                                                            borderRadius: "10px",
                                                            border: "none",
                                                            background: booking.has_review ? "#f0fdf4" : "#2563eb",
                                                            color: booking.has_review ? "#16a34a" : "white",
                                                            fontWeight: 600,
                                                            fontSize: "0.85rem",
                                                            cursor: "pointer",
                                                        }}
                                                    >
                                                        {booking.has_review ? "⭐ Edit Your Review" : "⭐ Write a Review"}
                                                    </button>
                                                )}

                                                <Button 
                                                    variant="outlined" 
                                                    fullWidth 
                                                    onClick={() => setDetailsModal(booking)}
                                                    sx={{ mt: 2, borderRadius: 3, textTransform: "none", borderColor: "#667eea", color: "#667eea" }}
                                                >
                                                    Booking Details
                                                </Button>
                                                <Link to={"/hotel/" + booking.hotel} className="text-decoration-none d-block text-center mt-2">
                                                    <small style={{ color: "#667eea", fontSize: "0.75rem", fontWeight: 600 }}>View Property Again</small>
                                                </Link>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    )
                )}

                {/* ── RESTAURANT RESERVATIONS ── */}
                {activeTab === 1 && (
                    reservations.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No restaurant reservations yet!</h4>
                            <Link to="/restaurant" className="btn btn-primary mt-3">Explore Restaurants</Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {reservations.map(reservation => (
                                <div key={reservation.id} className="col-md-6 col-lg-4">
                                    <Card className="h-100 shadow-sm rounded-4 border-0">
                                        <div className="position-relative">
                                            <img
                                                src={getImageUrl(reservation.restaurant_image) || "https://via.placeholder.com/300?text=Restaurant"}
                                                alt={reservation.restaurant_name}
                                                className="w-100"
                                                style={{ height: 160, objectFit: "cover" }}
                                            />
                                            {/* completed badge on image */}
                                            {reservation.status === "completed" && (
                                                <div style={{ position: "absolute", top: 8, left: 8, background: "#16a34a", color: "white", borderRadius: "8px", padding: "2px 10px", fontSize: "0.75rem", fontWeight: 600 }}>
                                                    ✓ Visited
                                                </div>
                                            )}
                                        </div>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="bold">{reservation.restaurant_name}</Typography>
                                            <div className="d-flex align-items-center justify-content-between mb-2">
                                                <span className="text-muted small">
                                                    <Utensils size={14} className="me-1" />
                                                    {reservation.number_of_guests} {reservation.number_of_guests === 1 ? "Guest" : "Guests"}
                                                </span>
                                                <Chip
                                                    label={reservation.status === "completed" ? "Completed" : reservation.status}
                                                    color={getStatusChipColor(reservation.status)}
                                                    size="small"
                                                />
                                            </div>

                                            <Box display="flex" flexDirection="column" gap={1} bgcolor="#f8f9fa" p={2} borderRadius={2} mb={1.5}>
                                                <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                                                    <Calendar size={16} className="text-primary" /> {reservation.reservation_date}
                                                </div>
                                                <div className="d-flex align-items-center gap-2 text-dark fw-medium">
                                                    <Calendar size={16} className="text-primary" /> {reservation.reservation_time}
                                                </div>
                                            </Box>

                                            {/* Show existing review if any */}
                                            {reservation.review_data && (
                                                <div style={{ background: "#fffbeb", border: "1px solid #fde68a", borderRadius: "10px", padding: "8px 12px", marginBottom: "8px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 2 }}>
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <span key={i} style={{ color: i < reservation.review_data.rating ? "#f59e0b" : "#d1d5db", fontSize: "0.9rem" }}>&#9733;</span>
                                                        ))}
                                                        <small className="text-muted ms-1">Your review</small>
                                                    </div>
                                                    {reservation.review_data.comment && (
                                                        <p style={{ fontSize: "0.8rem", color: "#78350f", margin: 0 }}>"{reservation.review_data.comment}"</p>
                                                    )}
                                                </div>
                                            )}

                                            {/* View Menu button */}
                                            {reservation.menu_image && (
                                                <button
                                                    onClick={() => setMenuImage(getImageUrl(reservation.menu_image))}
                                                    style={{ width: "100%", marginBottom: "8px", padding: "7px", borderRadius: "10px", border: "1px solid #ea580c", background: "#fff7ed", color: "#ea580c", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer" }}
                                                >
                                                    📋 View Menu
                                                </button>
                                            )}

                                            {/* Write Review button — only for completed reservations */}
                                            {reservation.status === "completed" && (
                                                <button
                                                    onClick={() => openReviewPopup(reservation)}
                                                    style={{
                                                        width: "100%",
                                                        marginBottom: "8px",
                                                        padding: "7px",
                                                        borderRadius: "10px",
                                                        border: "none",
                                                        background: reservation.has_review ? "#f0fdf4" : "#7c2d12",
                                                        color: reservation.has_review ? "#16a34a" : "white",
                                                        fontWeight: 600,
                                                        fontSize: "0.85rem",
                                                        cursor: "pointer",
                                                    }}
                                                >
                                                    {reservation.has_review ? "⭐ Edit Your Review" : "⭐ Write a Review"}
                                                </button>
                                            )}

                                            <Button 
                                                variant="outlined" 
                                                fullWidth 
                                                onClick={() => setDetailsModal(reservation)}
                                                sx={{ mt: 2, borderRadius: 3, textTransform: "none", borderColor: "#3a86ff", color: "#3a86ff", fontSize: "0.85rem" }}
                                            >
                                                Reservation Details
                                            </Button>
                                            <Link to={"/restaurant/" + reservation.restaurant} className="text-decoration-none d-block text-center mt-2">
                                                <small style={{ color: "#3a86ff", fontSize: "0.75rem", fontWeight: 600 }}>View Restaurant Again</small>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )
                )}
            </div>

            {/* ── DETAILS MODAL ── */}
            <Modal open={!!detailsModal} onClose={() => setDetailsModal(null)}>
                <Box sx={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 450 }, bgcolor: 'white', borderRadius: "24px", p: 4, outline: "none",
                    boxShadow: "0 25px 50px rgba(0,0,0,0.2)"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px" }}>
                        <div>
                            <Typography variant="h5" fontWeight="700" sx={{ color: detailsModal?.hotel ? "#667eea" : "#3a86ff" }}>
                                {detailsModal?.hotel ? "Booking Summary" : "Reservation Summary"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                #{detailsModal?.hotel ? "SNX-HTL" : "SNX-RES"}-{detailsModal?.id}
                            </Typography>
                        </div>
                        <IconButton onClick={() => setDetailsModal(null)} size="small" sx={{ bgcolor: "#F5F5F5" }}>
                            <X size={18} />
                        </IconButton>
                    </div>

                    <Box sx={{ background: "#f8fafc", p: 2.5, borderRadius: "16px", border: "1px solid #e2e8f0", mb: 3 }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                            <div style={{ gridColumn: "span 2" }}>
                                <Typography variant="caption" color="text.secondary" sx={{ textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 700 }}>
                                    {detailsModal?.hotel ? "Hotel Name" : "Restaurant Name"}
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {detailsModal?.hotel_details?.name || detailsModal?.restaurant_name}
                                </Typography>
                            </div>
                            
                            {detailsModal?.hotel ? (
                                <>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Check-In</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal.check_in}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Check-Out</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal.check_out}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Room Type</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal.room_type || "Standard"}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Rooms</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal.rooms_booked || 1}</Typography>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Date</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal?.reservation_date}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Time</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal?.reservation_time}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Guests</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal?.number_of_guests} Persons</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                        <Typography variant="body2" fontWeight="600" color="success.main">{detailsModal?.status}</Typography>
                                    </div>
                                </>
                            )}
                        </div>
                    </Box>

                    <Button 
                        fullWidth 
                        variant="contained" 
                        startIcon={<Download size={18} />}
                        onClick={() => handleDownloadReceipt(detailsModal)}
                        sx={{ 
                            py: 1.5, borderRadius: "12px", textTransform: "none", fontWeight: 700,
                            bgcolor: detailsModal?.hotel ? "#667eea" : "#3a86ff",
                            "&:hover": { bgcolor: detailsModal?.hotel ? "#5a6fd6" : "#2d75e0" }
                        }}
                    >
                        Download PDF Receipt
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}