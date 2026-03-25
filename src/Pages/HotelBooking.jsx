import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom"; // [NEW] useLocation, useNavigate
import {
    AppBar,
    Toolbar,
    Typography,
    Chip,
    IconButton,
    Modal,
    Box,
    Button,
    useMediaQuery,
    CircularProgress,
    Divider,
} from "@mui/material";
import { XCircle, AlertCircle, Bell, MapPin, ArrowRight, Search, Filter, Globe, Minus, Plus, Download } from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";

/* ─── inline styles (no extra CSS file needed) ─── */
const S = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#fdfaf6",
        fontFamily: "'Cormorant Garamond', 'Georgia', serif",
        color: "#2c1810",
    },
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
    body: {
        width: "100%",
    },
    bookingCard: {
        backgroundColor: "#fff",
        borderRadius: "0 0 28px 28px",
        overflow: "hidden",
        boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
        display: "flex",
        flexDirection: "column",
        border: "1px solid rgba(0,0,0,0.03)",
    },

    heroImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    heroOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.4), transparent)",
    },
    cardContent: {
        padding: "40px",
    },
    hotelName: {
        fontFamily: "'Playfair Display', serif",
        fontSize: "2.4rem",
        fontWeight: 600,
        color: "#2c1810",
        marginBottom: "8px",
    },
    roomType: {
        fontSize: "1.1rem",
        color: "#667eeaff",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.1em",
        marginBottom: "16px",
    },
    location: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        color: "#667eeaff",
        fontSize: "0.95rem",
        marginBottom: "32px",
    },
    formLabel: {
        fontFamily: "'Lato', sans-serif",
        fontSize: "0.85rem",
        color: "#667eeaff",
        fontWeight: 600,
        letterSpacing: "0.06em",
        textTransform: "uppercase",
        marginBottom: "10px",
        display: "block",
    },
    input: {
        width: "100%",
        padding: "16px 20px",
        borderRadius: "14px",
        border: "1.5px solid rgba(102, 126, 234, 0.15)",
        backgroundColor: "#fff",
        fontFamily: "'Lato', sans-serif",
        fontSize: "1rem",
        color: "#2c1810",
        outline: "none",
        transition: "all 0.3s ease",
        boxShadow: "0 2px 6px rgba(102, 126, 234, 0.02)",
    },
    counterBox: {
        backgroundColor: "#fff",
        padding: "28px",
        borderRadius: "24px",
        border: "1px solid rgba(102, 126, 234, 0.12)",
        boxShadow: "0 10px 30px rgba(102, 126, 234, 0.05)",
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
    },
    counterTitle: {
        fontFamily: "'Playfair Display', serif",
        fontSize: "1.1rem",
        fontWeight: 600,
        marginBottom: "20px",
        color: "#2c1810",
        textAlign: "center",
    },
    counterBtn: {
        width: "44px",
        height: "44px",
        borderRadius: "50%",
        border: "1.5px solid rgba(102, 126, 234, 0.2)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#fff",
        color: "#667eea",
        cursor: "pointer",
        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        flexShrink: 0,
        padding: 0,
        boxShadow: "0 4px 12px rgba(102, 126, 234, 0.08)",
        outline: "none",
    },
    summaryCard: {
        marginTop: "40px",
        padding: "32px",
        borderRadius: "24px",
        backgroundColor: "#fff",
        border: "1px solid #667eea8f",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        background: "linear-gradient(to right, #ffffff, rgba(102, 126, 234, 0.03))",
    },
    bookBtn: {
        width: "fit-content",
        padding: "20px 60px 20px 60px",
        whiteSpace: "nowrap",
        borderRadius: "50px",
        border: "1px solid rgba(102, 126, 234, 0.3)",
        background: "#fff",
        color: "#667eea",
        fontFamily: "'Lato', sans-serif",
        fontWeight: 700,
        fontSize: "1rem",
        letterSpacing: "0.1em",
        cursor: "pointer",
        transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
        marginTop: "40px",
        boxShadow: "0 8px 24px rgba(102, 126, 234, 0.1)",
    },
};

/* ─── Components ─── */
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
            <div style={{ ...S.bellOverlay, opacity: hovered ? 1 : 0 }}>Bell</div>
        </div>
    );
}

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

export default function HotelBooking() {
    const { id } = useParams();
    const location = useLocation(); // [NEW] To get dates passed from Details page
    const navigate = useNavigate();

    // Retrieve state passed from previous page
    const { checkIn, checkOut, hotel: passedHotel, room } = location.state || {}; // [NEW] Get room

    const [hotel, setHotel] = useState(passedHotel || null);
    const [loading, setLoading] = useState(!passedHotel);

    // [NEW] Local state for user dates and booking info
    const [startDate, setStartDate] = useState(checkIn || "");
    const [endDate, setEndDate] = useState(checkOut || "");
    const [guests, setGuests] = useState(2);
    const [roomsBooked, setRoomsBooked] = useState(1); // Renamed from rooms
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false); // [NEW] Modal control
    const [isBooking, setIsBooking] = useState(false); // Loading state for button
    const [remainingRooms, setRemainingRooms] = useState(null); // [NEW] Store remaining rooms count
    const [showSuccessModal, setShowSuccessModal] = useState(false); // [NEW] Success Modal control
    const [newBookingId, setNewBookingId] = useState(null);
    const [bookingDetails, setBookingDetails] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [couponCode, setCouponCode] = useState("");
    const [availableCoupons, setAvailableCoupons] = useState([]);
    const [priceDetails, setPriceDetails] = useState({
        total_original_price: 0,
        discount_amount: 0,
        final_price: 0,
        applied_discount_reason: null
    });

    // Reactive logic: Auto-calculate rooms when guests change
    const updateGuests = (val) => {
        const newVal = Math.max(1, val);
        setGuests(newVal);
        setRoomsBooked(Math.ceil(newVal / 2));
    };

    const updateRooms = (val) => {
        const newVal = Math.max(1, val);
        // Only allow decrease if it still fits guests
        if (newVal < Math.ceil(guests / 2)) return;
        setRoomsBooked(newVal);
    };

    // Fetch hotel if not passed
    useEffect(() => {
        if (!hotel) {
            AxiosInstance
                .get(`api/hotels/${id}/`)
                .then((res) => {
                    setHotel(res.data);
                    setLoading(false);
                })
                .catch((err) => {
                    console.error("Error fetching hotel:", err);
                    setLoading(false);
                });
        }
    }, [id, hotel]);

    // [NEW] Check availability and remaining rooms whenever dates change
    useEffect(() => {
        if (startDate && endDate && hotel) {
            const fetchAvailability = async () => {
                try {
                    let url = `api/bookings/check_availability/?hotel_id=${hotel.id}&check_in=${startDate}&check_out=${endDate}&rooms_booked=${roomsBooked}`;
                    if (room) {
                        url += `&room_id=${room.id}`;
                    }
                    const res = await AxiosInstance.get(url);
                    if (res.data) {
                        setRemainingRooms(res.data.remaining_rooms);
                    }
                } catch (err) {
                    console.error("Error checking availability:", err);
                    setRemainingRooms(null);
                }
            };
            fetchAvailability();
        }
    }, [startDate, endDate, roomsBooked, hotel, room]);

    useEffect(() => {
        if (startDate && endDate && hotel) {
            const fetchPricePreview = async () => {
                try {
                    const payload = {
                        hotel: hotel.id,
                        check_in: startDate,
                        check_out: endDate,
                        rooms_booked: roomsBooked,
                        coupon_code: couponCode // Optional
                    };
                    if (room) payload.room = room.id;

                    const res = await AxiosInstance.post("api/bookings/price_preview/", payload);
                    setPriceDetails(res.data);
                } catch (err) {
                    console.error("Error fetching price preview:", err);
                    // Reset or show error if needed
                }
            };
            
            // Debounce or only fetch when needed
            const timer = setTimeout(fetchPricePreview, 500);
            return () => clearTimeout(timer);
        }
    }, [startDate, endDate, roomsBooked, hotel, room, couponCode]);

    useEffect(() => {
        if (id) {
            const fetchAvailableCoupons = async () => {
                try {
                    let url = `api/coupons/?hotel=${id}`;
                    if (startDate) {
                        url += `&check_in=${startDate}`;
                    }
                    const res = await AxiosInstance.get(url);
                    setAvailableCoupons(res.data);
                } catch (error) {

                    console.error("Error fetching coupons:", error);
                }
            };
            fetchAvailableCoupons();
        }
    }, [id, startDate]);


    const isMobile = useMediaQuery("(max-width:768px)");
    const isTablet = useMediaQuery("(max-width:1024px)");

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#667eeaff" }} />
            <Typography style={{ fontFamily: "'Cormorant Garamond', serif", color: "#667eeaff" }}>
                Preparing Booking…
            </Typography>
        </div>
    );
    if (!hotel) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom>Hotel not found</Typography>
            <Button variant="contained" onClick={() => navigate("/")}>Go Back Home</Button>
        </div>
    );

    // [NEW] Calculate Nights
    const calculateNights = () => {
        if (!startDate || !endDate) return 0;
        const start = new Date(startDate);
        const end = new Date(endDate);
        const timeDiff = end - start;
        const days = Math.round(timeDiff / (1000 * 3600 * 24));
        return days > 0 ? days : 0;
    };

    const nights = calculateNights();
    const pricePerNight = room ? Number(room.price) : Number(hotel.price); // Use room price if available
    const subtotal = pricePerNight * (nights === 0 ? 1 : nights) * roomsBooked;
    const tax = Math.round(subtotal * 0.12);
    const totalCost = subtotal + tax;

    // [NEW] Handle Booking Submission with Razorpay
    const handleBooking = async () => {
        if (!startDate || !endDate) {
            setError("Please select Check-in and Check-out dates.");
            return;
        }

        const today = new Date().toISOString().split("T")[0];
        if (startDate < today) {
            setError("Check-in date cannot be in the past.");
            return;
        }
        if (startDate >= endDate) {
            setError("Check-out date must be after check-in date.");
            return;
        }

        setIsBooking(true);
        setError(null);

        try {
            const payload = {
                hotel: hotel.id,
                check_in: startDate,
                check_out: endDate,
                number_of_guests: guests,
                rooms_booked: roomsBooked,
                coupon_code: couponCode // Send coupon code on final booking
            };


            if (room) {
                payload.room = room.id;
            }

            // 1. Create the booking (status will be pending/confirmed)
            const bookingRes = await AxiosInstance.post("api/bookings/", payload);
            const bookingId = bookingRes.data.id;

            // 2. Create Razorpay Order
            const orderRes = await AxiosInstance.post("api/razorpay/order/", {
                amount: Math.round(Number(priceDetails.final_price) * 1.12),
                booking_type: 'hotel',
                booking_id: bookingId
            });

            const order = orderRes.data;

            // 3. Open Razorpay Checkout
            const options = {
                key: import.meta.env.VITE_RAZR_KEY_ID || "", // We might need this via API if not in env
                amount: order.amount,
                currency: order.currency,
                name: "ServNex Hotels",
                description: `Booking for ${hotel.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        // 4. Verify Payment
                        await AxiosInstance.post("api/razorpay/verify/", {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature
                        });
                        setNewBookingId(bookingId); // Store ID for review
                        setBookingDetails(bookingRes.data);
                        toast.success("Payment Successful! Booking Confirmed.");
                        setShowSuccessModal(true);
                    } catch (err) {
                        toast.error("Payment verification failed. Please contact support.");
                    }
                },
                prefill: {
                    name: "", // Can add user details here
                    email: "",
                    contact: ""
                },
                theme: {
                    color: "#0f62c5"
                }
            };

            const rzp = new window.Razorpay({
                ...options,
                modal: {
                    ondismiss: async function () {
                        // If user closes modal without paying, fail the payment to release the room
                        try {
                            await AxiosInstance.post(`api/bookings/${bookingId}/fail_payment/`);
                        } catch (err) {
                            console.error("Failed to sync modal dismissal:", err);
                        }
                    }
                }
            });

            rzp.on('payment.failed', async function (response) {
                toast.error(`Payment failed: ${response.error.description}`);
                try {
                    await AxiosInstance.post(`api/bookings/${bookingId}/fail_payment/`);
                } catch (err) {
                    console.error("Failed to sync payment failure:", err);
                }
            });
            rzp.open();

        } catch (err) {
            console.error(err);
            let msg = "Booking failed. Please try again.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === 'string') msg = data;
                else if (data.non_field_errors) msg = data.non_field_errors[0];
                else if (data.detail) msg = data.detail;
                else if (typeof data === 'object') {
                    const firstKey = Object.keys(data)[0];
                    const firstVal = data[firstKey];
                    msg = Array.isArray(firstVal) ? firstVal[0] : JSON.stringify(firstVal);
                }
            }
            setError(msg);
            setShowErrorModal(true);
        } finally {
            setIsBooking(false);
        }
    };

    const handleReviewSubmit = async () => {
        if (!newBookingId) return;
        setIsSubmittingReview(true);
        try {
            await AxiosInstance.post("api/hotel-reviews/", {
                booking: newBookingId,
                rating: reviewRating,
                comment: reviewComment
            });
            toast.success("Thank you for your review!");
            navigate(`/hotel/${id}`);
        } catch (err) {
            toast.error("Failed to submit review.");
            navigate(`/hotel/${id}`);
        } finally {
            setIsSubmittingReview(false);
        }
    };

    const handleDownloadReceipt = () => {
        if (!bookingDetails) return;

        const printWindow = window.open('', '_blank');
        const content = `
            <html>
                <head>
                    <title>Booking Receipt - ${hotel.name}</title>
                    <style>
                        body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #333; }
                        .header { border-bottom: 2px solid #667eea; padding-bottom: 20px; margin-bottom: 30px; }
                        .details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
                        .item { margin-bottom: 15px; }
                        .label { font-weight: bold; color: #666; font-size: 0.9rem; text-transform: uppercase; }
                        .val { font-size: 1.1rem; margin-top: 5px; }
                        .total { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: right; }
                        .price { font-size: 2rem; color: #667eea; font-weight: bold; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>ServNex Hotels</h1>
                        <p>Booking Confirmation Reciept</p>
                    </div>
                    <div class="details">
                        <div class="item"><div class="label">Hotel</div><div class="val">${hotel.name}</div></div>
                        <div class="item"><div class="label">Booking ID</div><div class="val">#SNX-HTL-${bookingDetails.id}</div></div>
                        <div class="item"><div class="label">Check In</div><div class="val">${checkIn}</div></div>
                        <div class="item"><div class="label">Check Out</div><div class="val">${checkOut}</div></div>
                        <div class="item"><div class="label">Guests</div><div class="val">${guests}</div></div>
                        <div class="item"><div class="label">Room Type</div><div class="val">${room ? room.room_type : 'Standard'}</div></div>
                    </div>
                    <div class="total">
                        <div class="label">Total Amount Paid</div>
                        <div class="price">₹${Math.round(Number(priceDetails.final_price) * 1.12).toLocaleString()}</div>
                    </div>
                    <p style="margin-top: 50px; font-size: 0.8rem; color: #888;">Thank you for choosing ServNex. This is an electronically generated confirmation.</p>
                </body>
            </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={S.page}>
            <link
                href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,700;0,900;1,400;1,700&family=Lato:wght@400;600;700&display=swap"
                rel="stylesheet"
            />
            <style>
                {`
                    .servnex-btn:hover {
                        transform: translateY(-3px);
                        box-shadow: 0 12px 24px rgba(102, 126, 234, 0.25);
                    }
                    .counter-btn:hover {
                        background: #667eea !important;
                        color: white !important;
                        border-color: #667eea !important;
                        transform: scale(1.1) translateY(-2px);
                        box-shadow: 0 8px 16px rgba(102, 126, 234, 0.3) !important;
                    }
                    .counter-box:hover {
                        transform: translateY(-5px);
                        box-shadow: 0 15px 40px rgba(102, 126, 234, 0.1);
                    }
                    .booking-input:focus {
                        border-color: #667eea !important;
                        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.1) !important;
                    }
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

            <div style={{
                ...S.body,
                padding: isMobile ? "0px" : "0",
                maxWidth: isMobile ? "100%" : "100%"
            }}>
                <div style={{
                    ...S.bookingCard,
                    borderRadius: isMobile ? "0px" : "0 0 28px 28px",
                    border: isMobile ? "none" : S.bookingCard.border
                }}>
                    {/* Hero Section */}
                    <div style={{ height: isMobile ? 300 : isTablet ? 400 : 500, position: "relative" }}>
                        <img
                            src={room ? room.image : (hotel.image || hotel.room_image1)}
                            style={S.heroImg}
                            alt="Hotel Hero"
                        />
                        <div style={S.heroOverlay}></div>
                    </div>

                    <div style={{
                        ...S.cardContent,
                        padding: isMobile ? "30px 20px" : isTablet ? "40px 60px" : "60px 150px"
                    }}>
                        <div style={S.roomType}>{room ? room.room_type : "Premium Suite"}</div>
                        <h1 style={S.hotelName}>{hotel.name}</h1>
                        <div style={S.location}>
                            <MapPin size={16} color="#667eea" />
                            {hotel.area}, {hotel.city}
                        </div>

                        <Divider sx={{ mb: 4, opacity: 0.1 }} />

                        {/* Dates Section */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px", marginBottom: "40px" }}>
                            <div>
                                <span style={S.formLabel}>Check-In Date</span>
                                <input
                                    type="date"
                                    style={S.input}
                                    className="booking-input"
                                    value={startDate}
                                    min={new Date().toLocaleDateString('en-CA')}
                                    onChange={e => {
                                        const newIn = e.target.value;
                                        setStartDate(newIn);
                                        const nextDay = new Date(new Date(newIn).getTime() + 86400000).toISOString().split("T")[0];
                                        if (!endDate || endDate <= newIn) {
                                            setEndDate(nextDay);
                                        }
                                    }}
                                />
                            </div>
                            <div>
                                <span style={S.formLabel}>Check-Out Date</span>
                                <input
                                    type="date"
                                    style={S.input}
                                    className="booking-input"
                                    value={endDate}
                                    min={startDate ? new Date(new Date(startDate).getTime() + 86400000).toISOString().split("T")[0] : new Date().toLocaleDateString('en-CA')}
                                    onChange={e => setEndDate(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Guest/Room Counter */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                            <div style={S.counterBox} className="counter-box">
                                <div style={S.counterTitle}>Number of Guests</div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                                    <button className="counter-btn" style={S.counterBtn} onClick={() => updateGuests(guests - 1)}>
                                        <Minus size={16} strokeWidth={3} />
                                    </button>
                                    <span style={{ fontSize: "1.3rem", fontWeight: 700, minWidth: "100px", textAlign: "center", color: "#2c1810" }}>
                                        {guests} {guests === 1 ? 'Guest' : 'Guests'}
                                    </span>
                                    <button className="counter-btn" style={S.counterBtn} onClick={() => updateGuests(guests + 1)}>
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>

                            <div style={S.counterBox} className="counter-box">
                                <div style={S.counterTitle}>Number of Rooms</div>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px" }}>
                                    <button className="counter-btn" style={S.counterBtn} onClick={() => updateRooms(roomsBooked - 1)}>
                                        <Minus size={16} strokeWidth={3} />
                                    </button>
                                    <span style={{ fontSize: "1.3rem", fontWeight: 700, minWidth: "100px", textAlign: "center", color: "#2c1810" }}>
                                        {roomsBooked} {roomsBooked === 1 ? 'Room' : 'Rooms'}
                                    </span>
                                    <button className="counter-btn" style={S.counterBtn} onClick={() => updateRooms(roomsBooked + 1)}>
                                        <Plus size={16} strokeWidth={3} />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Availability Info */}
                            <div style={{ textAlign: "center", marginTop: "24px" }}>
                                <Chip
                                    label={remainingRooms > 0 ? `Hurry! Only ${remainingRooms} rooms left.` : 'No rooms available for these dates.'}
                                    sx={{
                                        fontFamily: "'Lato', sans-serif",
                                        fontSize: "0.8rem",
                                        fontWeight: 700,
                                        letterSpacing: "0.05em",
                                        textTransform: "uppercase",
                                        backgroundColor: remainingRooms < 3 ? "rgba(198, 40, 40, 0.08)" : "rgba(46, 125, 50, 0.08)",
                                        color: remainingRooms < 3 ? "#c62828" : "#2e7d32",
                                        border: "none",
                                        padding: "12px 4px",
                                        height: "auto",
                                        "& .MuiChip-label": { px: 2 },
                                        boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
                                    }}
                                />
                            </div>

                        {/* [NEW] Coupon/Promo Code Section */}
                        <div style={{ marginTop: "40px" }}>
                            <span style={S.formLabel}>Have a Promo Code?</span>
                            <div style={{ display: "flex", gap: "12px" }}>
                                <input
                                    type="text"
                                    placeholder="Enter code (e.g. WELCOME10)"
                                    style={{ ...S.input, flex: 1, textTransform: "uppercase" }}
                                    value={couponCode}
                                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                />
                            </div>
                            {availableCoupons.length > 0 && (
                                <div style={{ marginTop: "12px", display: "flex", flexWrap: "wrap", gap: "8px" }}>
                                    {availableCoupons.map((c) => (
                                        <button
                                            key={c.id}
                                            type="button"
                                            onClick={() => {
                                                setCouponCode(c.code);
                                                toast.success(`Coupon ${c.code} selected!`);
                                            }}
                                            style={{
                                                background: couponCode === c.code ? "#667eea" : "rgba(102, 126, 234, 0.05)",
                                                border: `1.5px solid ${couponCode === c.code ? "#667eea" : "rgba(102, 126, 234, 0.2)"}`,
                                                color: couponCode === c.code ? "#fff" : "#667eea",
                                                padding: "6px 16px",
                                                borderRadius: "100px",
                                                fontSize: "0.8rem",
                                                fontWeight: 700,
                                                cursor: "pointer",
                                                transition: "all 0.3s ease",
                                                boxShadow: couponCode === c.code ? "0 4px 12px rgba(102, 126, 234, 0.2)" : "none"
                                            }}
                                        >
                                            {c.code}
                                        </button>
                                    ))}
                                </div>
                            )}
                            {priceDetails.applied_discount_reason && priceDetails.discount_amount > 0 && (
                                <Typography style={{ 
                                    fontSize: "0.85rem", 
                                    color: "#2e7d32", 
                                    marginTop: "8px", 
                                    fontWeight: 600,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "4px"
                                }}>
                                    <AlertCircle size={14} /> Applied: {priceDetails.applied_discount_reason}
                                </Typography>
                            )}
                        </div>

                        <div style={{
                            ...S.summaryCard,
                            flexDirection: "column",
                            alignItems: "stretch",
                            gap: "16px",
                            textAlign: "left"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#2c1810", fontSize: "1rem", fontWeight: 700 }}>
                                <span>Total Rooms Selected</span>
                                <span>{roomsBooked} {roomsBooked === 1 ? 'Room' : 'Rooms'}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#7a6a4a", fontSize: "0.95rem" }}>
                                <span>Room Subtotal</span>
                                <span>₹{Number(priceDetails.total_original_price).toLocaleString()}</span>
                            </div>
                            {priceDetails.discount_amount > 0 && (
                                <div style={{ display: "flex", justifyContent: "space-between", color: "#2e7d32", fontSize: "0.95rem", fontWeight: 600 }}>
                                    <span>Special Discount</span>
                                    <span>- ₹{Number(priceDetails.discount_amount).toLocaleString()}</span>
                                </div>
                            )}
                            <div style={{ display: "flex", justifyContent: "space-between", color: "#7a6a4a", fontSize: "0.95rem" }}>
                                <span>Taxes & Service Fees (12%)</span>
                                <span>₹{Math.round(Number(priceDetails.final_price) * 0.12).toLocaleString()}</span>
                            </div>
                            <Divider sx={{ my: 1, opacity: 0.1 }} />
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <span style={{ fontWeight: 700, fontSize: "1.2rem", color: "#2c1810" }}>Total Investment</span>
                                <span style={{
                                    fontSize: isMobile ? "1.8rem" : "2.2rem",
                                    fontWeight: 700,
                                    color: "#667eea"
                                }}>
                                    ₹{Math.round(Number(priceDetails.final_price) * 1.12).toLocaleString()}
                                </span>
                            </div>
                        </div>

                        {/* Final Action */}
                        <div className="mt-5 d-flex justify-content-center">
                            <button
                                className="smooth-grad-btn"
                                style={S.bookBtn}
                                onClick={handleBooking}
                                disabled={isBooking}
                            >
                                {isBooking ? "PROCESSING RESERVATION..." : "CONFIRM LUXURY STAY"}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Error Popup Modal */}
            <Modal
                open={showErrorModal}
                onClose={() => setShowErrorModal(false)}
                aria-labelledby="error-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 440 },
                    bgcolor: 'background.paper',
                    boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
                    p: 5,
                    borderRadius: "24px",
                    textAlign: 'center',
                    outline: 'none',
                    border: "none"
                }}>
                    <AnimatedCross />
                    <Typography id="error-modal-title" variant="h5" component="h2" fontWeight="bold" sx={{ fontFamily: "'Playfair Display', serif", color: "#c62828", mt: 2 }}>
                        Selection Unavailable
                    </Typography>
                    <Typography sx={{ mt: 2, color: '#7a6a4a', fontSize: '1rem', fontFamily: "'Lato', sans-serif" }}>
                        {error}
                    </Typography>
                    <button
                        className="smooth-grad-btn"
                        onClick={() => setShowErrorModal(false)}
                        style={{
                            ...S.bookBtn,
                            marginTop: "32px",
                            padding: "14px 28px",
                            width: "auto"
                        }}
                    >
                        ADJUST RESERVATION
                    </button>
                </Box>
            </Modal>
            {/* Success Popup Modal */}
            <Modal
                open={showSuccessModal}
                onClose={() => navigate("/my-bookings")}
                aria-labelledby="success-modal-title"
            >
                <Box sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: { xs: '90%', sm: 500 },
                    bgcolor: 'background.paper',
                    boxShadow: "0 30px 80px rgba(0,0,0,0.2)",
                    p: 5,
                    borderRadius: "24px",
                    textAlign: 'center',
                    outline: 'none',
                    border: "none"
                }}>
                    <AnimatedCheck />
                    <Typography id="success-modal-title" variant="h4" component="h2" fontWeight="bold" sx={{ fontFamily: "'Playfair Display', serif", color: "#2e7d32", mb: 1 }}>
                        Booking Confirmed!
                    </Typography>
                    <Typography sx={{ color: '#7a6a4a', fontSize: '1.1rem', mb: 3, fontFamily: "'Lato', sans-serif" }}>
                        Your stay at <strong>{hotel?.name}</strong> has been successfully reserved.
                    </Typography>

                    {bookingDetails && (
                        <Box sx={{
                            background: "#f8fafc",
                            p: 2,
                            borderRadius: "16px",
                            mb: 3,
                            textAlign: "left",
                            border: "1px solid #e2e8f0"
                        }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                                <Typography variant="subtitle2" fontWeight="700" color="#64748b">BOOKING DETAILS</Typography>
                                <Button
                                    size="small"
                                    startIcon={<Download size={14} />}
                                    onClick={handleDownloadReceipt}
                                    sx={{ textTransform: "none", fontSize: "0.75rem", borderRadius: "8px" }}
                                >
                                    Download Receipt
                                </Button>
                            </div>
                            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                                <div>
                                    <Typography variant="caption" color="text.secondary">Order ID</Typography>
                                    <Typography variant="body2" fontWeight="600">#SNX-${bookingDetails.id}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="text.secondary">Total Paid</Typography>
                                    <Typography variant="body2" fontWeight="600" color="#2e7d32">₹{totalCost.toLocaleString()}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="text.secondary">Check-in</Typography>
                                    <Typography variant="body2" fontWeight="600">{checkIn}</Typography>
                                </div>
                                <div>
                                    <Typography variant="caption" color="text.secondary">Check-out</Typography>
                                    <Typography variant="body2" fontWeight="600">{checkOut}</Typography>
                                </div>
                            </div>
                        </Box>
                    )}

                    <Box sx={{ background: "#fdf8f3", p: 3, borderRadius: "16px", mb: 4 }}>
                        <Typography variant="subtitle2" fontWeight="700" color="#8b6914" mb={1} sx={{ textTransform: "uppercase", letterSpacing: "0.1em" }}>
                            Rate Your Booking Experience
                        </Typography>
                        <div style={{ display: "flex", justifyContent: "center", gap: "8px", marginBottom: "16px" }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <IconButton key={s} onClick={() => setReviewRating(s)} sx={{ p: 0.5 }}>
                                    <StarIcon sx={{ color: s <= reviewRating ? "#f59e0b" : "#d1d5db", fontSize: 32 }} />
                                </IconButton>
                            ))}
                        </div>
                        <textarea
                            placeholder="Tell us about your experience..."
                            value={reviewComment}
                            onChange={(e) => setReviewComment(e.target.value)}
                            style={{
                                width: "100%",
                                padding: "12px",
                                borderRadius: "12px",
                                border: "1px solid #e0e0e0",
                                fontFamily: "'Lato', sans-serif",
                                fontSize: "0.9rem",
                                minHeight: "80px",
                                resize: "none",
                                outline: "none",
                                backgroundColor: "white"
                            }}
                        />
                    </Box>

                    <Button
                        className="smooth-grad-btn"
                        onClick={handleReviewSubmit}
                        disabled={isSubmittingReview}
                        fullWidth
                        sx={{
                            borderRadius: "50px",
                            py: 2,
                            fontWeight: 700,
                            letterSpacing: "0.1em",
                            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                            color: "white",
                            boxShadow: "0 10px 20px rgba(102,126,234,0.15)",
                            textTransform: "none",
                            fontSize: "1rem",
                            "&:hover": { transform: "translateY(-3px)", boxShadow: "0 15px 30px rgba(102,126,234,0.3)" }
                        }}
                    >
                        {isSubmittingReview ? "SUBMITTING..." : "SUBMIT & GO TO DASHBOARD"}
                    </Button>
                    <Button
                        onClick={() => navigate("/my-bookings")}
                        sx={{ mt: 2, color: "#7a6a4a", textTransform: "none", fontWeight: 600 }}
                    >
                        Skip for now
                    </Button>
                </Box>
            </Modal>
        </div>

    );
}