import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import { AppBar, Toolbar, Typography, IconButton } from "@mui/material";
import StarIcon from "@mui/icons-material/Star";
import { Bell, Download } from "lucide-react";
import Button from "@mui/material/Button";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";


export default function RestaurantReservation() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { reservationDate, reservationTime, numberOfGuests, restaurant: passedRestaurant } = location.state || {};

    const [restaurant, setRestaurant] = useState(passedRestaurant || null);
    const [loading, setLoading] = useState(!passedRestaurant);

    const [date, setDate] = useState(reservationDate || "");
    const [time, setTime] = useState(reservationTime || "");
    const [guests, setGuests] = useState(numberOfGuests || 4);
    const [specialRequests, setSpecialRequests] = useState("");
    const [error, setError] = useState(null);
    const [showPopup, setShowPopup] = useState(false);
    const [showSuccessPopup, setShowSuccessPopup] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [newResvId, setNewResvId] = useState(null);
    const [resvDetails, setResvDetails] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [availability, setAvailability] = useState({});

    const tablesNeeded = Math.ceil(guests / 4);
    const subtotal = restaurant ? (Number(restaurant.average_cost_for_two) || 0) * (guests / 2) : 0;
    const convenienceFee = guests * 15;
    const totalCost = subtotal + convenienceFee;

    useEffect(() => {
        if (!restaurant) {
            AxiosInstance
                .get(`api/restaurants/${id}/`)
                .then((res) => {
                    setRestaurant(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching restaurant:", err);
                    setLoading(false);
                });
        }
    }, [id, restaurant]);

    useEffect(() => {
        if (date && restaurant) {
            AxiosInstance.get(`api/restaurants/${id}/availability/?date=${date}`)
                .then(res => setAvailability(res.data))
                .catch(err => console.error("Error fetching availability:", err));
        }
    }, [date, restaurant, id]);

    if (loading) return <div className="text-center mt-5">Loading...</div>;
    if (!restaurant) return <div className="p-5">Restaurant not found</div>;

    const handleReservation = async () => {
        if (!date || !time) {
            setError("Please select reservation date and time.");
            setShowPopup(true);
            return;
        }

        setIsReserving(true);
        setError(null);

        try {
            // totalCost is pre-calculated at component level

            // 1. Create Reservation
            const resResponse = await AxiosInstance.post(
                "api/reservations/",
                {
                    restaurant: restaurant.id,
                    reservation_date: date,
                    reservation_time: time,
                    number_of_guests: guests,
                    special_requests: specialRequests
                }
            );
            const reservationId = resResponse.data.id;

            // 2. Create Razorpay Order
            const orderRes = await AxiosInstance.post("api/razorpay/order/", {
                amount: totalCost,
                booking_type: 'restaurant',
                booking_id: reservationId
            });
            const order = orderRes.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZR_KEY_ID || "",
                amount: order.amount,
                currency: order.currency,
                name: "ServNex Restaurants",
                description: `Table Reservation for ${restaurant.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        await AxiosInstance.post("api/razorpay/verify/", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setNewResvId(reservationId);
                        setResvDetails(resResponse.data);
                        toast.success("Payment Successful! Reservation Confirmed.");
                        setShowSuccessPopup(true);
                    } catch (err) {
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: ""
                },
                theme: {
                    color: "#0f62c5"
                }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.non_field_errors) {
                    setError(data.non_field_errors[0]);
                } else if (data.detail) {
                    setError(data.detail);
                } else {
                    setError("Reservation failed. Please try again.");
                }
            } else {
                setError("Reservation failed. Please try again.");
            }
            setShowPopup(true);
        } finally {
            setIsReserving(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!newResvId) return;
        setIsSubmittingReview(true);
        try {
            await AxiosInstance.post("api/reviews/", {
                reservation: newResvId,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success("Thank you for your review!");
            navigate(`/restaurant/${id}`);
        } catch (err) {
            toast.error("Failed to submit review.");
            navigate(`/restaurant/${id}`);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (!resvDetails) return;
        
        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Reservation Receipt - ${restaurant.name}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid #3a86ff; padding-bottom: 20px; margin-bottom: 30px; }
                        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .item { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #666; font-size: 0.9rem; text-transform: uppercase; }
                        .val { font-size: 1.1rem; margin-top: 5px; }
                        .total { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: right; }
                        .price { font-size: 2rem; color: #3a86ff; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ServNex Restaurants</h1>
                        <p>Table Reservation Confirmation</p>
                    </div>
                    <div class="details">
                        <div class="item"><div class="label">Restaurant</div><div class="val">${restaurant.name}</div></div>
                        <div class="item"><div class="label">Reservation ID</div><div class="val">#SNX-RES-${resvDetails.id}</div></div>
                        <div class="item"><div class="label">Date</div><div class="val">${date}</div></div>
                        <div class="item"><div class="label">Time</div><div class="val">${time}</div></div>
                        <div class="item"><div class="label">Guests</div><div class="val">${guests}</div></div>
                        <div class="item"><div class="label">Location</div><div class="val">${restaurant.area}, ${restaurant.city}</div></div>
                    </div>
                    <div class="total">
                        <div class="label">Amount Paid</div>
                        <div class="price">₹${(Number(restaurant.average_cost_for_two) * (guests / 2)).toLocaleString()}</div>
                    </div>
                    <p style="margin-top: 50px; font-size: 0.8rem; color: #888;">Thank you for booking with ServNex. Please present this receipt at the restaurant.</p>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <>
            {/* POPUP MODAL */}
            {showPopup && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => setShowPopup(false)}
                        style={{
                            position: "fixed", top: 0, left: 0,
                            width: "100%", height: "100%",
                            background: "rgba(0,0,0,0.5)",
                            zIndex: 9998,
                            backdropFilter: "blur(3px)",
                        }}
                    />
                    {/* Modal */}
                    <div
                        style={{
                            position: "fixed",
                            top: "50%", left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 9999,
                            background: "white",
                            borderRadius: "20px",
                            padding: "40px 32px",
                            maxWidth: "380px",
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
                        }}
                    >
                        {/* Icon */}
                        <div style={{
                            width: 72, height: 72,
                            borderRadius: "50%",
                            background: "#fff1f1",
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 16px",
                            fontSize: "2rem",
                        }}>
                            🪑
                        </div>

                        <h5 style={{ color: "#b91c1c", fontWeight: 700, marginBottom: 8 }}>
                            Table Not Available
                        </h5>

                        <p style={{ color: "#6b7280", fontSize: "0.92rem", marginBottom: 24 }}>
                            {error || "Sorry, we couldn't complete your reservation."}
                            <br />
                            <span className="fw-bold text-dark mt-2 d-block">
                                Suggestion: Try a different table capacity or date.
                            </span>
                        </p>

                        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
                            <button
                                onClick={() => {
                                    setShowPopup(false);
                                    document.querySelector('.bg-light.p-3.rounded-4')?.scrollIntoView({ behavior: 'smooth' });
                                }}
                                style={{
                                    background: "#3b82f6",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "12px",
                                    padding: "10px 28px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Try Another Table
                            </button>
                            <button
                                onClick={() => navigate(-1)}
                                style={{
                                    background: "#f3f4f6",
                                    color: "#374151",
                                    border: "none",
                                    borderRadius: "12px",
                                    padding: "10px 28px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Go Back
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* SUCCESS POPUP MODAL */}
            {showSuccessPopup && (
                <>
                    {/* Backdrop */}
                    <div
                        onClick={() => navigate("/my-bookings")}
                        style={{
                            position: "fixed", top: 0, left: 0,
                            width: "100%", height: "100%",
                            background: "rgba(0,0,0,0.5)",
                            zIndex: 9998,
                            backdropFilter: "blur(5px)",
                        }}
                    />
                    {/* Modal */}
                    <div
                        style={{
                            position: "fixed",
                            top: "50%", left: "50%",
                            transform: "translate(-50%, -50%)",
                            zIndex: 9999,
                            background: "white",
                            borderRadius: "24px",
                            padding: "48px 32px",
                            maxWidth: "440px",
                            width: "90%",
                            textAlign: "center",
                            boxShadow: "0 30px 80px rgba(0,0,0,0.4)",
                        }}
                    >
                        {/* Success Icon */}
                        <div style={{
                            width: 80, height: 80,
                            borderRadius: "50%",
                            background: "#f0fdf4",
                            display: "flex", alignItems: "center",
                            justifyContent: "center",
                            margin: "0 auto 24px",
                            fontSize: "2.5rem",
                            border: "2px solid #22c55e",
                        }}>
                            ✅
                        </div>

                        <h3 style={{ color: "#166534", fontWeight: 800, marginBottom: 12, fontFamily: "'Poppins', sans-serif" }}>
                            Reservation Confirmed!
                        </h3>

                        <p style={{ color: "#4b5563", fontSize: "1rem", lineHeight: 1.6, marginBottom: 24 }}>
                            Your table at <strong>{restaurant?.name}</strong> is booked successfully. We look forward to serving you!
                        </p>

                        {resvDetails && (
                            <div style={{ 
                                background: "#f8fafc", 
                                padding: "16px", 
                                borderRadius: "16px", 
                                marginBottom: "24px", 
                                textAlign: "left",
                                border: "1px solid #e2e8f0"
                            }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                    <p style={{ margin: 0, fontWeight: 700, fontSize: "0.75rem", color: "#64748b", textTransform: "uppercase" }}>Reservation Summary</p>
                                    <Button 
                                        size="small" 
                                        startIcon={<Download size={14} />}
                                        onClick={handleDownloadReceipt}
                                        sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: "8px" }}
                                    >
                                        Receipt
                                    </Button>
                                </div>
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Booking ID</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem" }}>#SNX-${resvDetails.id}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Date & Time</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem" }}>{date} at {time}</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Guests</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem" }}>{guests} Persons</p>
                                    </div>
                                    <div>
                                        <p style={{ margin: 0, fontSize: "0.7rem", color: "#64748b" }}>Total Paid</p>
                                        <p style={{ margin: 0, fontWeight: 600, fontSize: "0.85rem", color: "#166534" }}>₹{(Number(restaurant.average_cost_for_two) * (guests / 2)).toLocaleString()}</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        <div style={{ background: "#f8fafc", padding: "20px", borderRadius: "16px", marginBottom: "32px", border: "1px dashed #cbd5e1" }}>
                            <p style={{ margin: "0 0 12px 0", fontWeight: 700, fontSize: "0.85rem", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Rate Your Booking Experience
                            </p>
                            <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
                                {[1, 2, 3, 4, 5].map(s => (
                                    <IconButton 
                                        key={s} 
                                        onClick={() => setReviewRating(s)}
                                        sx={{ p: 0.5 }}
                                    >
                                        <StarIcon 
                                            sx={{ 
                                                color: s <= reviewRating ? "#fbbf24" : "#e5e7eb", 
                                                fontSize: 32 
                                            }} 
                                        />
                                    </IconButton>
                                ))}
                            </div>
                            <textarea
                                placeholder="Your thoughts..."
                                value={reviewComment}
                                onChange={e => setReviewComment(e.target.value)}
                                style={{
                                    width: "100%", padding: "10px", borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "0.9rem", resize: "none", height: "80px", outline: "none"
                                }}
                            />
                        </div>

                        <button
                            onClick={handleReviewSubmit}
                            disabled={isSubmittingReview}
                            style={{
                                width: "100%",
                                background: "linear-gradient(135deg, #3a86ff 0%, #1e63d0 100%)",
                                color: "white",
                                border: "none",
                                borderRadius: "14px",
                                padding: "16px",
                                fontWeight: 700,
                                cursor: "pointer",
                                fontSize: "1rem",
                                boxShadow: "0 10px 20px rgba(30,99,208,0.2)",
                                transition: "all 0.3s ease",
                            }}
                        >
                            {isSubmittingReview ? "Submitting..." : "Submit Review & Go to Dashboard"}
                        </button>
                        <button 
                            onClick={() => navigate("/my-bookings")}
                            style={{ background: "none", border: "none", color: "#64748b", marginTop: 15, fontSize: "0.9rem", cursor: "pointer", fontWeight: 600 }}
                        >
                            Skip for now
                        </button>
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

            <div className="container my-5">
                <div className="card shadow-lg rounded-4 overflow-hidden mt-4">

                    {/* IMAGE */}
                    <div className="row g-0">
                        <div className="col-12" style={{ height: '300px', overflow: 'hidden' }}>
                            <img src={restaurant.image} className="w-100 h-100" style={{ objectFit: 'cover' }} alt={restaurant.name} />
                        </div>
                    </div>

                    {/* DETAILS */}
                    <div className="card-body p-4">
                        <h3 className="fw-bold">{restaurant.name}</h3>
                        <p className="text-muted">{restaurant.area}, {restaurant.city}</p>
                        <p className="text-muted"><strong>Cuisine:</strong> {restaurant.cuisine_type}</p>

                        <hr />

                        <div className="row mb-4">
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Reservation Date</label>
                                <input
                                    type="date"
                                    className="form-control"
                                    value={date}
                                    onChange={e => setDate(e.target.value)}
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div className="col-md-6">
                                <label className="form-label fw-bold">Reservation Time</label>
                                <input
                                    type="time"
                                    className="form-control"
                                    value={time}
                                    onChange={e => setTime(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* GUESTS */}
                        <div className="row mb-4 text-center bg-light p-3 rounded-4 g-3">
                            <div className="col-md-12 border-end">
                                <h6 className="fw-bold">Type of table</h6>
                                <div className="d-flex justify-content-center align-items-center gap-3">
                                    <button className="btn btn-outline-danger btn-sm rounded-circle"
                                        onClick={() => setGuests(Math.max(1, guests - 2))}
                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                    ><FaMinus size={12} /></button>
                                    <span className="fw-bold fs-5" style={{ minWidth: '80px' }}>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                                    <button className="btn btn-outline-success btn-sm rounded-circle"
                                        onClick={() => setGuests(Math.min(10, guests + 2))}
                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                    ><FaPlus size={12} /></button>
                                </div>
                                {availability[guests] === 0 && (
                                    <div className="text-danger small fw-bold mt-2 text-center">
                                        ⚠️ This table type is full for the selected date.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* SPECIAL REQUESTS */}
                        <div className="mb-4">
                            <label className="form-label fw-bold">Special Requests (Optional)</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                placeholder="Any dietary restrictions, special occasions, seating preferences, etc."
                                value={specialRequests}
                                onChange={e => setSpecialRequests(e.target.value)}
                            />
                        </div>

                        {/* TOTAL COST */}
                        <div className="card border-0 shadow-sm rounded-4 p-4 bg-light mb-4">
                            <h6 className="fw-bold mb-3 text-uppercase" style={{ fontSize: "0.8rem", color: "#64748b", letterSpacing: "0.05em" }}>Price Summary</h6>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Dining for {guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                                <span className="fw-semibold">₹{subtotal.toLocaleString()}</span>
                            </div>
                            <div className="d-flex justify-content-between mb-2">
                                <span className="text-muted">Convenience Fee</span>
                                <span className="fw-semibold">₹{convenienceFee.toLocaleString()}</span>
                            </div>
                            <hr className="my-3" style={{ opacity: 0.1 }} />
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold mb-0">Total Estimated Cost</h5>
                                    <small className="text-muted">Incl. of all taxes</small>
                                </div>
                                <h3 className="fw-bold text-primary mb-0">
                                    ₹{totalCost.toLocaleString()}
                                </h3>
                            </div>
                        </div>

                        {/* FOOTER */}
                        <div className="mt-5 d-grid">
                            <button
                                className="btn btn-primary btn-lg rounded-3"
                                onClick={handleReservation}
                                disabled={isReserving}
                            >
                                {isReserving ? "Confirming..." : "Confirm Reservation"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}