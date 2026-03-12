import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { FaPlus, FaMinus } from "react-icons/fa";
import { AppBar, Toolbar, Typography } from "@mui/material";
import { Bell } from "lucide-react";
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
    const [isReserving, setIsReserving] = useState(false);

    const tablesNeeded = Math.ceil(guests / 4);

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
            const totalCost = Number(restaurant.average_cost_for_two) * (guests / 2);

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
                        toast.success("Payment Successful! Reservation Confirmed.");
                        navigate("/my-bookings");
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
                        </p>

                        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                            <button
                                onClick={() => setShowPopup(false)}
                                style={{
                                    background: "#ef4444",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "12px",
                                    padding: "10px 28px",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    fontSize: "0.9rem",
                                }}
                            >
                                Try Another Date
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
                                        onClick={() => setGuests(Math.max(4, guests - 2))}
                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                    ><FaMinus size={12} /></button>
                                    <span className="fw-bold fs-5" style={{ minWidth: '80px' }}>{guests} {guests === 1 ? 'Guest' : 'Guests'}</span>
                                    <button className="btn btn-outline-success btn-sm rounded-circle"
                                        onClick={() => setGuests(Math.min(10, guests + 2))}
                                        style={{ width: '32px', height: '32px', padding: 0 }}
                                    ><FaPlus size={12} /></button>
                                </div>
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
                        <div className="card border-0 shadow-sm rounded-4 p-3 bg-light mb-4">
                            <div className="d-flex justify-content-between align-items-center">
                                <div>
                                    <h5 className="fw-bold mb-1">Estimated Cost</h5>
                                    <small className="text-muted">
                                        Average for {guests} {guests === 1 ? 'guest' : 'guests'}
                                    </small>
                                </div>
                                <h3 className="fw-bold text-primary mb-0">
                                    ₹{(Number(restaurant.average_cost_for_two) * (guests / 2)).toLocaleString()}
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