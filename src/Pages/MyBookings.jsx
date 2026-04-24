import React, { useEffect, useState } from "react";
import AxiosInstance from "../Component/AxiosInstance";
import NotificationDropdown from "../Component/NotificationDropdown";
import Header from "../Component/Header";
import { Link } from "react-router-dom";
import { AppBar, Toolbar, Typography, Chip, Box, Card, CardContent, Button, Tabs, Tab, Modal, IconButton } from "@mui/material";
import { Bell, Calendar, MapPin, Utensils, Hotel, Download, X, Star, DoorClosed, Scissors, Clock } from "lucide-react";
import { toast } from 'react-toastify';

export default function MyBookings() {
    const [bookings, setBookings] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [salonQueues, setSalonQueues] = useState([]);
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
            AxiosInstance.get("api/my-reservations/"),
            AxiosInstance.get("api/queue/")
        ]).then(([bookingsRes, reservationsRes, salonRes]) => {
            const bData = bookingsRes.data;
            const rData = reservationsRes.data;
            const sData = salonRes.data;
            setBookings(Array.isArray(bData) ? bData : (bData.results || []));
            setReservations(Array.isArray(rData) ? rData : (rData.results || []));
            setSalonQueues(Array.isArray(sData) ? sData : (sData.results || []));
            setLoading(false);
        }).catch(err => {
            console.error("Error fetching data:", err);
            setLoading(false);
        });
    }, []);

    const handleTabChange = (event, newValue) => setActiveTab(newValue);

    const openReviewPopup = (item) => {
        setReviewPopup(item);
        setReviewRating(item.review_data ? item.review_data.rating : 5);
        setReviewComment(item.review_data ? item.review_data.comment || "" : "");
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
                    : reviewPopup.salon
                    ? `api/salon-reviews/${reviewPopup.review_data.id}/`
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
                } else if (reviewPopup.salon) {
                    await AxiosInstance.post("api/salon-reviews/", {
                        salon: reviewPopup.salon,
                        queue_entry: reviewPopup.id,
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
                    b.id === reviewPopup.id ? { ...b, has_review: true, review_data: { ...b.review_data, rating: reviewRating, comment: reviewComment, created_at: b.review_data?.created_at || new Date().toISOString() } } : b
                ));
            } else if (reviewPopup.salon) {
                setSalonQueues(prev => prev.map(s =>
                    s.id === reviewPopup.id ? { ...s, has_review: true, review_data: { ...s.review_data, rating: reviewRating, comment: reviewComment, created_at: s.review_data?.created_at || new Date().toISOString() } } : s
                ));
            } else {
                setReservations(prev => prev.map(r =>
                    r.id === reviewPopup.id ? { ...r, has_review: true, review_data: { ...r.review_data, rating: reviewRating, comment: reviewComment, created_at: r.review_data?.created_at || new Date().toISOString() } } : r
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
        } else if (item.salon_name) {
            detailsHtml = `
                <div class="item"><div class="label">Salon</div><div class="val">${item.salon_name}</div></div>
                <div class="item"><div class="label">Ticket ID</div><div class="val">#SNX-SLN-${item.id}</div></div>
                <div class="item"><div class="label">Joined At</div><div class="val">${new Date(item.joined_at).toLocaleString()}</div></div>
                <div class="item"><div class="label">Service</div><div class="val">${item.service_name}</div></div>
                <div class="item"><div class="label">Location</div><div class="val">${item.salon_area || ""}, ${item.salon_city || ""}</div></div>
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

    const handleCancelBooking = async (id, isHotel) => {
        if (!window.confirm(`Are you sure you want to cancel this ${isHotel ? 'booking' : 'reservation'}? Your payment will be refunded within 24 hours.`)) return;

        try {
            if (isHotel) {
                await AxiosInstance.post(`api/bookings/${id}/cancel_booking/`);
                setBookings(prev => prev.map(b => b.id === id ? { ...b, status: 'cancelled' } : b));
                if (detailsModal && detailsModal.id === id && isHotel) {
                    setDetailsModal(prev => ({ ...prev, status: 'cancelled' }));
                }
            } else {
                await AxiosInstance.patch(`api/reservations/${id}/`, { status: "cancelled" });
                setReservations(prev => prev.map(r => r.id === id ? { ...r, status: 'cancelled' } : r));
                if (detailsModal && detailsModal.id === id && !isHotel) {
                    setDetailsModal(prev => ({ ...prev, status: 'cancelled' }));
                }
            }
            toast.success("Cancellation successful. You will receive a confirmation email shortly.");
        } catch (error) {
            console.error("Cancellation error:", error);
            toast.error("Failed to cancel. Please contact support.");
        }
    };

    const getImageUrl = (url) => {
        if (!url) return "";
        if (url.startsWith("http")) return url;
        return (AxiosInstance.defaults.baseURL || "http://127.0.0.1:8000") + url;
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
        const s = status?.toLowerCase() || "";
        if (s === "your table is ready" || s === "confirmed" || s === "paid" || s === "success") return "success";
        if (s === "completed" || s === "visited") return "info";
        if (s === "table pending" || s === "pending") return "warning";
        if (s === "cancelled" || s === "failed" || s === "payment failed") return "error";
        return "primary";
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

            <Header />

            <style>{`
                .lux-booking-card {
                    border-radius: 20px !important;
                    border: 1px solid rgba(0,0,0,0.05) !important;
                    box-shadow: 0 10px 30px rgba(0,0,0,0.04) !important;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    overflow: hidden;
                    background: #ffffff;
                }
                .lux-booking-card:hover {
                    box-shadow: 0 20px 40px rgba(99,102,241,0.1) !important;
                    transform: translateY(-4px);
                    border-color: rgba(99,102,241,0.2) !important;
                }
                .lux-warning-box {
                    background: linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%);
                    border: 1px solid rgba(244, 63, 94, 0.2);
                    border-radius: 12px;
                    padding: 14px 16px;
                    margin-bottom: 16px;
                }
                .lux-details-box {
                    background: rgba(248, 250, 252, 0.8);
                    border: 1px solid rgba(226, 232, 240, 0.8);
                    border-radius: 14px;
                    padding: 16px;
                    margin-bottom: 20px;
                }
                .lux-card-btn {
                    border-radius: 12px !important;
                    padding: 10px 0 !important;
                    font-weight: 700 !important;
                    letter-spacing: 0.5px !important;
                    text-transform: none !important;
                    transition: all 0.2s ease !important;
                    border-width: 1.5px !important;
                }
                .lux-card-btn:hover {
                    transform: scale(1.02);
                }
                .lux-link {
                    color: #6366f1;
                    font-size: 0.85rem;
                    font-weight: 700;
                    transition: all 0.2s;
                }
                .lux-link:hover {
                    color: #4f46e5;
                    text-decoration: underline !important;
                }
            `}</style>

            <div className="container py-5 my-bookings-page">
                <h2 className="mb-4 fw-bold" style={{ color: "#1e293b" }}>My Bookings</h2>

                <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
                    <Tabs value={activeTab} onChange={handleTabChange}>
                        <Tab icon={<Hotel size={18} />} iconPosition="start" label="Hotels" sx={{ textTransform: "none", fontWeight: 600 }} />
                        <Tab icon={<Utensils size={18} />} iconPosition="start" label="Restaurants" sx={{ textTransform: "none", fontWeight: 600 }} />
                        <Tab icon={<Scissors size={18} />} iconPosition="start" label="Salons" sx={{ textTransform: "none", fontWeight: 600 }} />
                    </Tabs>
                </Box>

                {/* ── HOTEL BOOKINGS ── */}
                {activeTab === 0 && (
                    bookings.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No hotel bookings yet!</h4>
                            <Link to="/hotel" className="btn btn-primary mt-3">Explore Hotels</Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {
                                bookings.map(booking => {
                                    const hotel = booking.hotel_details || {};
                                    return (
                                        <div key={booking.id} className="col-md-6 col-lg-4">
                                            <Card className="lux-booking-card">
                                                <div className="position-relative">
                                                    <img src={hotel.image || "https://via.placeholder.com/300?text=Hotel"} alt={hotel.name} className="w-100" style={{ height: 160, objectFit: "cover" }} />
                                                    <div className="position-absolute top-0 end-0 m-2">
                                                        <Chip
                                                            label={booking.payment_status !== 'paid' ? 'PAYMENT FAILED' : booking.status === 'pending' ? 'CONFIRMED' : booking.status.toUpperCase()}
                                                            color={getStatusChipColor(booking.payment_status !== 'paid' ? 'payment failed' : booking.status)}
                                                            size="small"
                                                        />

                                                    </div>
                                                </div>
                                                <CardContent>
                                                    <Typography variant="h6" fontWeight="bold">{hotel.name || "Hotel #" + booking.hotel}</Typography>
                                                    <div className="text-muted small mb-3">
                                                        <MapPin size={16} className="me-1" />
                                                        {hotel.area ? hotel.area + ", " + hotel.city : "Location unavailable"}
                                                    </div>
                                                    {booking.room_type && <div className="mb-2"><Chip label={booking.room_type + " Room"} color="primary" variant="outlined" size="small" /></div>}

                                                    {booking.payment_status !== "paid" && (
                                                        <div className="lux-warning-box">
                                                            <Typography variant="caption" color="#e11d48" fontWeight="700" sx={{ display: "block", mb: 0.5, fontSize: "0.85rem" }}>
                                                                ⚠️ Payment was not completed.
                                                            </Typography>
                                                            <Link to={`/hotel/${booking.hotel}`} style={{ fontSize: "0.85rem", color: "#e11d48", fontWeight: 800, textDecoration: "underline" }}>
                                                                Retry Booking
                                                            </Link>
                                                        </div>
                                                    )}

                                                    <Box display="flex" flexDirection="column" gap={1.5} className="lux-details-box">
                                                        <div className="d-flex align-items-center gap-3 fw-medium text-dark"><Calendar size={18} className="text-primary opacity-75" /> Check-in: {booking.check_in}</div>
                                                        <div className="d-flex align-items-center gap-3 fw-medium text-dark"><Calendar size={18} className="text-primary opacity-75" /> Check-out: {booking.check_out}</div>
                                                        <div className="d-flex align-items-center gap-3 fw-medium text-dark"><DoorClosed size={18} className="text-primary opacity-75" /> Rooms: {booking.rooms_booked}</div>
                                                        <div className="d-flex align-items-center gap-3 fw-medium text-dark"><Calendar size={18} className="text-primary opacity-75" /> Time: {new Date(booking.created_at).toLocaleString()}</div>
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
                                                        className="lux-card-btn"
                                                        onClick={() => setDetailsModal(booking)}
                                                        sx={{ mt: 2, borderColor: "#6366f1", color: "#6366f1" }}
                                                    >
                                                        Booking Details
                                                    </Button>

                                                    {(booking.status === "confirmed" || booking.status === "paid") && (
                                                        <Button
                                                            variant="outlined"
                                                            color="error"
                                                            fullWidth
                                                            className="lux-card-btn"
                                                            onClick={() => handleCancelBooking(booking.id, true)}
                                                            sx={{ mt: 1.5 }}
                                                        >
                                                            Cancel Booking
                                                        </Button>
                                                    )}

                                                    <Link to={"/hotel/" + booking.hotel} className="text-decoration-none d-block text-center mt-3">
                                                        <span className="lux-link">View Property Again</span>
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
                                    <Card className="h-100 lux-booking-card">
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
                                                    label={reservation.payment_status !== 'paid' ? "Payment Failed" : reservation.status === "completed" ? "Completed" : reservation.status}
                                                    color={getStatusChipColor(reservation.payment_status !== 'paid' ? "payment failed" : reservation.status)}
                                                    size="small"
                                                />
                                            </div>

                                            {reservation.payment_status !== "paid" && (
                                                <div className="lux-warning-box">
                                                    <Typography variant="caption" color="#e11d48" fontWeight="700" sx={{ display: "block", mb: 0.5, fontSize: "0.85rem" }}>
                                                        ⚠️ Payment was not completed.
                                                    </Typography>
                                                    <Link to={`/restaurant/${reservation.restaurant}`} style={{ fontSize: "0.85rem", color: "#e11d48", fontWeight: 800, textDecoration: "underline" }}>
                                                        Retry Reservation
                                                    </Link>
                                                </div>
                                            )}

                                            <Box display="flex" flexDirection="column" gap={1.5} className="lux-details-box">
                                                <div className="d-flex align-items-center gap-3 fw-medium text-dark">
                                                    <Calendar size={18} className="text-primary opacity-75" /> Date: {reservation.reservation_date}
                                                </div>
                                                <div className="d-flex align-items-center gap-3 fw-medium text-dark">
                                                    <Calendar size={18} className="text-primary opacity-75" /> Time: {reservation.reservation_time}
                                                </div>
                                                <div className="d-flex align-items-center gap-3 fw-medium text-dark">
                                                    <Calendar size={18} className="text-primary opacity-75" /> Booked On: {new Date(reservation.created_at).toLocaleString()}
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
                                                className="lux-card-btn"
                                                onClick={() => setDetailsModal(reservation)}
                                                sx={{ mt: 2, borderColor: "#6366f1", color: "#6366f1" }}
                                            >
                                                Reservation Details
                                            </Button>

                                            {(reservation.payment_status === "paid" && (reservation.status === "Your Table Is Ready" || reservation.status === "Table Pending")) && (
                                                <Button
                                                    variant="outlined"
                                                    color="error"
                                                    fullWidth
                                                    className="lux-card-btn"
                                                    onClick={() => handleCancelBooking(reservation.id, false)}
                                                    sx={{ mt: 1.5 }}
                                                >
                                                    Cancel Reservation
                                                </Button>
                                            )}

                                            <Link to={"/restaurant/" + reservation.restaurant} className="text-decoration-none d-block text-center mt-3">
                                                <span className="lux-link">View Restaurant Again</span>
                                            </Link>
                                        </CardContent>
                                    </Card>
                                </div>
                            ))}
                        </div>
                    )
                )}

                {/* ── SALON QUEUES ── */}
                {activeTab === 2 && (
                    salonQueues.length === 0 ? (
                        <div className="text-center py-5">
                            <h4 className="text-muted">No salon visits yet!</h4>
                            <Link to="/salon" className="btn btn-primary mt-3">Explore Salons</Link>
                        </div>
                    ) : (
                        <div className="row g-4">
                            {salonQueues.map(q => (
                                <div key={q.id} className="col-md-6 col-lg-4">
                                    <Card className="h-100 lux-booking-card">
                                        <div className="position-relative">
                                            <img
                                                src={getImageUrl(q.salon_image) || "https://via.placeholder.com/300?text=Salon"}
                                                alt={q.salon_name}
                                                className="w-100"
                                                style={{ height: 160, objectFit: "cover" }}
                                            />
                                            <div className="position-absolute top-0 end-0 m-2">
                                                <Chip
                                                    label={q.status === 'in_progress' ? 'SERVING' : q.status === 'pending' ? 'WAITING' : q.status.toUpperCase()}
                                                    color={q.status === 'completed' ? 'info' : q.status === 'in_progress' ? 'success' : 'warning'}
                                                    size="small"
                                                />
                                            </div>
                                        </div>
                                        <CardContent>
                                            <Typography variant="h6" fontWeight="bold">{q.salon_name}</Typography>
                                            <div className="text-muted small mb-3">
                                                <MapPin size={16} className="me-1" />
                                                {q.salon_area}, {q.salon_city}
                                            </div>
                                            <div className="mb-3">
                                                <Chip icon={<Scissors size={14} />} label={q.service_name} variant="outlined" size="small" />
                                            </div>

                                            <Box display="flex" flexDirection="column" gap={1.5} className="lux-details-box">
                                                <div className="d-flex align-items-center gap-3 fw-medium text-dark">
                                                    <Clock size={18} className="text-primary opacity-75" /> Joined: {new Date(q.joined_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                                </div>
                                                {q.status === 'pending' && (
                                                    <div className="d-flex align-items-center gap-3 fw-medium text-warning">
                                                        <Clock size={18} /> Est. Wait: {q.estimated_wait_time} mins
                                                    </div>
                                                )}
                                            </Box>

                                            {/* Review UI */}
                                            {q.review_data && (
                                                <div style={{ background: "#f0f9ff", border: "1px solid #bae6fd", borderRadius: "10px", padding: "8px 12px", marginBottom: "12px" }}>
                                                    <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                                                        {Array.from({ length: 5 }, (_, i) => (
                                                            <span key={i} style={{ color: i < q.review_data.rating ? "#f59e0b" : "#d1d5db", fontSize: "0.9rem" }}>&#9733;</span>
                                                        ))}
                                                    </div>
                                                    {q.review_data.comment && <p style={{ fontSize: "0.8rem", color: "#0369a1", margin: "4px 0 0 0" }}>"{q.review_data.comment}"</p>}
                                                </div>
                                            )}

                                            {q.status === "completed" && (
                                                <button
                                                    onClick={() => openReviewPopup(q)}
                                                    style={{ width: "100%", padding: "10px", borderRadius: "12px", border: "none", background: q.has_review ? "#f0fdf4" : "#6366f1", color: q.has_review ? "#16a34a" : "white", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", marginBottom: "12px" }}
                                                >
                                                    {q.has_review ? "⭐ Edit Review" : "⭐ Rate Visit"}
                                                </button>
                                            )}

                                            <Button
                                                variant="outlined"
                                                fullWidth
                                                className="lux-card-btn"
                                                onClick={() => setDetailsModal(q)}
                                                sx={{ borderColor: "#6366f1", color: "#6366f1" }}
                                            >
                                                Queue Ticket
                                            </Button>
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
                            <Typography variant="h5" fontWeight="700" sx={{ color: detailsModal?.hotel ? "#667eea" : detailsModal?.salon_name ? "#6366f1" : "#3a86ff" }}>
                                {detailsModal?.hotel ? "Booking Summary" : detailsModal?.salon_name ? "Queue Ticket" : "Reservation Summary"}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                #{detailsModal?.hotel ? "SNX-HTL" : detailsModal?.salon_name ? "SNX-SLN" : "SNX-RES"}-{detailsModal?.id}
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
                                    {detailsModal?.hotel ? "Hotel Name" : detailsModal?.salon_name ? "Salon Name" : "Restaurant Name"}
                                </Typography>
                                <Typography variant="body1" fontWeight="600">
                                    {detailsModal?.hotel_details?.name || detailsModal?.salon_name || detailsModal?.restaurant_name}
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
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                        <Typography
                                            variant="body2"
                                            fontWeight="600"
                                            color={detailsModal?.payment_status !== 'paid' ? "error.main" : (detailsModal?.status === "cancelled" ? "error.main" : "success.main")}
                                        >
                                            {detailsModal?.payment_status !== 'paid' ? "Payment Failed" : detailsModal?.status}
                                        </Typography>
                                    </div>
                                </>
                            ) : detailsModal?.salon_name ? (
                                <>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Joined At</Typography>
                                        <Typography variant="body2" fontWeight="600">{new Date(detailsModal.joined_at).toLocaleString()}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Service</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal.service_name}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Status</Typography>
                                        <Typography variant="body2" fontWeight="600" color="primary.main">{detailsModal.status.toUpperCase()}</Typography>
                                    </div>
                                    <div>
                                        <Typography variant="caption" color="text.secondary">Wait Time</Typography>
                                        <Typography variant="body2" fontWeight="600">{detailsModal.estimated_wait_time} mins</Typography>
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
                                        <Typography
                                            variant="body2"
                                            fontWeight="600"
                                            color={detailsModal?.payment_status !== 'paid' ? "error.main" : (detailsModal?.status === "cancelled" ? "error.main" : "success.main")}
                                        >
                                            {detailsModal?.payment_status !== 'paid' ? "Payment Failed" : detailsModal?.status}
                                        </Typography>
                                    </div>
                                </>
                            )}
                        </div>
                    </Box>

                    <Button
                        fullWidth
                        variant="contained"
                        disabled={detailsModal?.payment_status !== 'paid'}
                        startIcon={<Download size={18} />}
                        onClick={() => handleDownloadReceipt(detailsModal)}
                        sx={{
                            py: 1.5, borderRadius: "12px", textTransform: "none", fontWeight: 700,
                            bgcolor: detailsModal?.hotel ? "#667eea" : "#3a86ff",
                            "&:hover": { bgcolor: detailsModal?.hotel ? "#5a6fd6" : "#2d75e0" },
                            "&.Mui-disabled": { bgcolor: "#e2e8f0", color: "#94a3b8" }
                        }}
                    >
                        {detailsModal?.payment_status !== 'paid' ? "Payment Required" : "Download PDF Receipt"}
                    </Button>
                </Box>
            </Modal>
        </div>
    );
}
