import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
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
import { 
    XCircle, 
    AlertCircle, 
    Bell, 
    MapPin, 
    ArrowRight, 
    Search, 
    Filter, 
    Globe, 
    Minus, 
    Plus, 
    Download, 
    CheckCircle2, 
    ShieldCheck, 
    Zap, 
    Clock, 
    CreditCard,
    Info,
    ChevronRight,
    ChevronsRight
} from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";
import NotificationDropdown from "../Component/NotificationDropdown";

/* ─── inline styles ─── */
const S = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#6365f127",
        backgroundImage: "radial-gradient(at 0% 0%, rgba(99, 102, 241, 0.03) 0px, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.03) 0px, transparent 50%)",
        fontFamily: "'Poppins', sans-serif",
        color: "#0f172a",
    },
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
    body: {
        maxWidth: "1300px",
        margin: "0 auto",
        padding: "40px 24px",
    },
    mainGrid: {
        display: "grid",
        gridTemplateColumns: "1fr 400px",
        gap: "40px",
        alignItems: "flex-start",
    },
    sectionCard: {
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "32px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 10px 30px rgba(0,0,0,0.02)",
        marginBottom: "32px",
    },
    sectionTitle: {
        fontSize: "1.25rem",
        fontWeight: 600,
        color: "#0f172a",
        marginBottom: "24px",
        display: "flex",
        alignItems: "center",
        gap: "12px",
    },
    heroSection: {
        position: "relative",
        borderRadius: "32px",
        overflow: "hidden",
        height: "400px",
        marginBottom: "40px",
        boxShadow: "0 20px 50px rgba(0,0,0,0.08)",
    },
    heroImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover",
    },
    heroOverlay: {
        position: "absolute",
        top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to top, rgba(15, 23, 42, 0.8), transparent)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        padding: "40px",
    },
    formLabel: {
        fontSize: "0.8rem",
        color: "#64748b",
        fontWeight: 500,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        marginBottom: "10px",
        display: "block",
    },
    input: {
        width: "100%",
        padding: "14px 20px",
        borderRadius: "12px",
        border: "1px solid #f1f5f9",
        backgroundColor: "#f8fafc",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "0.95rem",
        color: "#0f172a",
        outline: "none",
        transition: "all 0.3s ease",
    },
    sidebar: {
        position: "sticky",
        top: "120px",
    },
    summaryCard: {
        backgroundColor: "#fff",
        borderRadius: "24px",
        padding: "32px",
        border: "1px solid #f1f5f9",
        boxShadow: "0 20px 40px rgba(0,0,0,0.04)",
    },
    priceRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px",
    },
    highlightItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        fontSize: "0.9rem",
        color: "#475569",
        marginBottom: "12px",
    },
    highlightIcon: {
        color: "#10b981",
        flexShrink: 0,
    }
};


const StepIndicator = ({ currentStep, isMobile }) => {
    const steps = ["Details", "Summary", "Payment"];
    return (
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center", 
            gap: isMobile ? "8px" : "24px", 
            marginBottom: isMobile ? "32px" : "48px",
            background: "#fff",
            padding: isMobile ? "12px 16px" : "20px 32px",
            borderRadius: "20px",
            border: "1px solid #f1f5f9",
            width: isMobile ? "calc(100% - 16px)" : "fit-content",
            margin: "0 auto 48px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.02)"
        }}>
            {steps.map((step, i) => (
                <React.Fragment key={step}>
                    <div style={{ display: "flex", alignItems: "center", gap: isMobile ? "6px" : "12px" }}>
                        <div style={{
                            width: isMobile ? "28px" : "32px", 
                            height: isMobile ? "28px" : "32px", 
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontSize: isMobile ? "0.75rem" : "0.85rem", 
                            fontWeight: 700,
                            background: i <= currentStep ? "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)" : "#f8fafc",
                            color: i <= currentStep ? "#fff" : "#94a3b8",
                            boxShadow: i <= currentStep ? "0 4px 10px rgba(99, 102, 241, 0.2)" : "none",
                            transition: "all 0.3s ease",
                            flexShrink: 0
                        }}>
                            {i < currentStep ? <CheckCircle2 size={isMobile ? 14 : 16} /> : i + 1}
                        </div>
                        <span style={{ 
                            fontSize: isMobile ? "0.8rem" : "0.9rem", 
                            fontWeight: i <= currentStep ? 600 : 400, 
                            color: i <= currentStep ? "#0f172a" : "#94a3b8",
                            letterSpacing: "0.02em",
                            display: isMobile && i !== currentStep ? "none" : "block"
                        }}>{step}</span>
                    </div>
                    {i < steps.length - 1 && (
                        <div style={{ 
                            width: isMobile ? "15px" : "40px", 
                            height: "2px", 
                            background: i < currentStep ? "#6366f1" : "#f1f5f9", 
                            borderRadius: "2px",
                            flexShrink: 0
                        }} />
                    )}
                </React.Fragment>
            ))}
        </div>
    );
};

const AnimatedCheck = () => (
    <div className="animate-scale" style={{ marginBottom: "20px" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#10b981" strokeWidth="4" />
            <path d="M25 40L35 50L55 30" stroke="#10b981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
        </svg>
    </div>
);

const AnimatedCross = () => (
    <div className="animate-scale" style={{ marginBottom: "20px" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#ef4444" strokeWidth="4" />
            <path d="M30 30L50 50M50 30L30 50" stroke="#ef4444" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="animate-draw" />
        </svg>
    </div>
);

/* ─── IOS Wheel Picker Popup Components ─── */
const WheelColumn = ({ items, value, onChange, disabledItems = [], flex = 1 }) => {
    const scrollRef = React.useRef(null);
    const [activeIndex, setActiveIndex] = useState(items.indexOf(value) !== -1 ? items.indexOf(value) : 0);
    const scrollTimeout = React.useRef(null);

    useEffect(() => {
        const index = items.indexOf(value);
        if (index !== -1 && scrollRef.current && activeIndex !== index) {
            scrollRef.current.scrollTop = index * 40;
            setActiveIndex(index);
        }
    }, [value, items]);

    const handleScroll = (e) => {
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
                <div key={idx} className={`ios-wheel-item ${idx === activeIndex ? 'active' : ''} ${disabledItems.includes(item) ? 'disabled' : ''}`}>
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
    const dateObj = value && value.includes("T") ? new Date(value) : defaultDate;
    
    const dates = [];
    const dateValues = [];
    const disabledDates = [];
    
    const minDate = minDateRaw ? new Date(minDateRaw) : new Date();
    const startDate = new Date(minDate);
    startDate.setHours(0,0,0,0);
    
    const todayLabel = new Date();
    todayLabel.setHours(0,0,0,0);

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

    const hours = Array.from({ length: 12 }, (_, i) => (i + 1).toString());
    const minutes = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));
    const periods = ["AM", "PM"];

    let currentDateVal = `${dateObj.getFullYear()}-${(dateObj.getMonth() + 1).toString().padStart(2, '0')}-${dateObj.getDate().toString().padStart(2, '0')}`;
    if (!dateValues.includes(currentDateVal)) currentDateVal = dateValues[0]; // fallback
    
    const currentHour24 = dateObj.getHours();
    const currentHour12 = (currentHour24 % 12 || 12).toString();
    const currentMinute = (Math.round(dateObj.getMinutes() / 5) * 5 % 60).toString().padStart(2, '0');
    const currentPeriod = currentHour24 >= 12 ? "PM" : "AM";

    const updateValue = (newPart) => {
        const parts = {
            date: currentDateVal,
            hour: currentHour12,
            min: currentMinute,
            period: currentPeriod,
            ...newPart
        };
        let h = parseInt(parts.hour);
        if (parts.period === "PM" && h < 12) h += 12;
        if (parts.period === "AM" && h === 12) h = 0;
        const newStr = `${parts.date}T${h.toString().padStart(2, '0')}:${parts.min}`;
        onChange(newStr);
    };

    useEffect(() => {
        if (isOpen && !value) {
            updateValue({});
        }
    }, [isOpen]);

    const displayStr = value ? new Date(value).toLocaleString('en-US', {
        weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit', hour12: true
    }) : 'Select Date & Time';

    return (
        <div style={{ position: "relative" }}>
            <span style={S.formLabel}>{label}</span>
            <div 
                className="booking-input" 
                onClick={() => setIsOpen(!isOpen)}
                style={{ ...S.input, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "space-between", height: "54px", boxSizing: "border-box" }}
            >
                {displayStr}
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
            </div>

            {isOpen && (
                <div style={{
                    position: "absolute", top: "100%", left: 0, right: 0, zIndex: 100,
                    background: "#fff", borderRadius: "16px", marginTop: "8px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.15)", border: "1px solid #e2e8f0", overflow: "hidden"
                }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                        <span style={{ fontSize: "0.85rem", fontWeight: 600, color: "#64748b" }}>Select Date & Time</span>
                        <button onClick={(e) => { e.stopPropagation(); setIsOpen(false); }} style={{ color: "#6366f1", fontWeight: 600, border: "none", background: "none", cursor: "pointer", fontSize: "1rem" }}>Done</button>
                    </div>
                    <div className="ios-datepicker-container" style={{ margin: 0, borderRadius: 0, gap: 0 }}>
                        <div className="ios-wheel-view">
                            <div className="ios-wheel-highlight" />
                            <div className="ios-wheel-gradient-top" />
                            <div className="ios-wheel-gradient-bottom" />
                            <WheelColumn flex={1.8} items={dates} value={dates[dateValues.indexOf(currentDateVal)] || dates[dates.findIndex(d => !disabledDates.includes(d))]} onChange={(val) => updateValue({ date: dateValues[dates.indexOf(val)] })} disabledItems={disabledDates} />
                            <WheelColumn flex={0.7} items={hours} value={currentHour12} onChange={(val) => updateValue({ hour: val })} />
                            <WheelColumn flex={0.7} items={minutes} value={currentMinute} onChange={(val) => updateValue({ min: val })} />
                            <WheelColumn flex={0.7} items={periods} value={currentPeriod} onChange={(val) => updateValue({ period: val })} />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default function HotelBooking() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { checkIn, checkOut, hotel: passedHotel, room } = location.state || {};

    const [hotel, setHotel] = useState(passedHotel || null);
    const [loading, setLoading] = useState(!passedHotel);
    const [startDate, setStartDate] = useState(checkIn || "");
    const [endDate, setEndDate] = useState(checkOut || "");
    const [guests, setGuests] = useState(2);
    const [roomsBooked, setRoomsBooked] = useState(1);
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [remainingRooms, setRemainingRooms] = useState(null);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
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

    const isMobile = useMediaQuery("(max-width:768px)");
    const isTablet = useMediaQuery("(max-width:1024px)");

    const updateGuests = (val) => {
        const newVal = Math.max(1, val);
        setGuests(newVal);
        const autoRooms = Math.ceil(newVal / 2);
        const maxR = remainingRooms != null ? Math.min(newVal, remainingRooms) : newVal;
        setRoomsBooked(Math.min(autoRooms, maxR));
    };

    const maxRooms = remainingRooms != null ? Math.min(guests, remainingRooms) : guests;

    const updateRooms = (val) => {
        const newVal = Math.max(1, val);
        if (newVal < Math.ceil(guests / 2)) return;
        if (newVal > maxRooms) return;
        setRoomsBooked(newVal);
    };

    useEffect(() => {
        if (!hotel) {
            AxiosInstance.get(`api/hotels/${id}/`).then((res) => {
                setHotel(res.data);
                setLoading(false);
            }).catch(() => setLoading(false));
        }
    }, [id, hotel]);

    useEffect(() => {
        if (startDate && endDate && hotel) {
            const fetchAvailability = async () => {
                try {
                    let url = `api/bookings/check_availability/?hotel_id=${hotel.id}&check_in=${startDate.split("T")[0]}&check_out=${endDate.split("T")[0]}&rooms_booked=${roomsBooked}`;
                    if (room) url += `&room_id=${room.id}`;
                    const res = await AxiosInstance.get(url);
                    if (res.data) setRemainingRooms(res.data.remaining_rooms);
                } catch (err) { setRemainingRooms(null); }
            };
            fetchAvailability();
        }
    }, [startDate, endDate, roomsBooked, hotel, room]);

    useEffect(() => {
        if (startDate && endDate && hotel) {
            const fetchPricePreview = async () => {
                try {
                    const payload = { hotel: hotel.id, check_in: startDate.split("T")[0], check_out: endDate.split("T")[0], rooms_booked: roomsBooked, coupon_code: couponCode };
                    if (room) payload.room = room.id;
                    const res = await AxiosInstance.post("api/bookings/price_preview/", payload);
                    setPriceDetails(res.data);
                } catch (err) {}
            };
            const timer = setTimeout(fetchPricePreview, 500);
            return () => clearTimeout(timer);
        }
    }, [startDate, endDate, roomsBooked, hotel, room, couponCode]);

    useEffect(() => {
        if (id) {
            const fetchAvailableCoupons = async () => {
                try {
                    let url = `api/coupons/?hotel=${id}`;
                    if (startDate) url += `&check_in=${startDate.split("T")[0]}`;
                    const res = await AxiosInstance.get(url);
                    const data = res.data;
                    setAvailableCoupons(Array.isArray(data) ? data : (data.results || []));
                } catch (error) {}
            };
            fetchAvailableCoupons();
        }
    }, [id, startDate]);

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#6366f1" }} />
            <Typography style={{ fontFamily: "'Poppins', sans-serif", color: "#6366f1", fontWeight: 500 }}>Preparing Booking…</Typography>
        </div>
    );
    if (!hotel) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Hotel not found</Typography>
            <Button variant="contained" onClick={() => navigate("/")} style={{ borderRadius: "12px", textTransform: "none", fontFamily: "'Poppins', sans-serif" }}>Go Back Home</Button>
        </div>
    );

    const handleBooking = async () => {
        if (!startDate || !endDate) { setError("Please select Check-in and Check-out dates."); return; }
        const today = new Date().toISOString().split("T")[0];
        const sdDate = startDate.split("T")[0];
        const edDate = endDate.split("T")[0];
        if (sdDate < today) { setError("Check-in date cannot be in the past."); return; }
        if (sdDate >= edDate) { setError("Check-out date must be after check-in date."); return; }
        setIsBooking(true);
        setError(null);
        try {
            const payload = { hotel: hotel.id, check_in: sdDate, check_out: edDate, number_of_guests: guests, rooms_booked: roomsBooked, coupon_code: couponCode };
            if (room) payload.room = room.id;
            const bookingRes = await AxiosInstance.post("api/bookings/", payload);
            const bookingId = bookingRes.data.id;
            const orderRes = await AxiosInstance.post("api/razorpay/order/", { amount: Math.round(Number(priceDetails.final_price) * 1.02), booking_type: 'hotel', booking_id: bookingId });
            const order = orderRes.data;
            const options = {
                key: import.meta.env.VITE_RAZR_KEY_ID || "",
                amount: order.amount,
                currency: order.currency,
                name: "ServNex Hotels",
                description: `Booking for ${hotel.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await AxiosInstance.post("api/razorpay/verify/", { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
                        setNewBookingId(bookingId);
                        setBookingDetails(bookingRes.data);
                        toast.success("Payment Successful! Booking Confirmed.");
                        setShowSuccessModal(true);
                    } catch (err) { toast.error("Payment verification failed. Please contact support."); }
                },
                theme: { color: "#6366f1" }
            };
            const rzp = new window.Razorpay({ ...options, modal: { ondismiss: async function () { try { await AxiosInstance.post("api/razorpay/failure/", { razorpay_order_id: order.id, error_description: "Payment was cancelled by the user." }); } catch (err) {} } } });
            rzp.on('payment.failed', async function (response) { toast.error(`Payment failed: ${response.error.description}`); try { await AxiosInstance.post("api/razorpay/failure/", { razorpay_order_id: order.id, error_description: response.error.description }); } catch (err) {} });
            rzp.open();
        } catch (err) {
            let msg = "Booking failed. Please try again.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (typeof data === 'string') msg = data;
                else if (data.non_field_errors) msg = data.non_field_errors[0];
                else if (data.detail) msg = data.detail;
            }
            setError(msg);
            setShowErrorModal(true);
        } finally { setIsBooking(false); }
    };

    const handleReviewSubmit = async () => {
        if (!newBookingId) return;
        setIsSubmittingReview(true);
        try {
            await AxiosInstance.post("api/hotel-reviews/", { booking: newBookingId, rating: reviewRating, comment: reviewComment });
            toast.success("Thank you for your review!");
            navigate(`/hotel/${id}`);
        } catch (err) { toast.error("Failed to submit review."); navigate(`/hotel/${id}`); }
        finally { setIsSubmittingReview(false); }
    };

    const handleDownloadReceipt = () => {
        if (!bookingDetails) return;
        const printWindow = window.open('', '_blank');
        const content = `<html><head><title>Booking Receipt - ${hotel.name}</title><style>body { font-family: 'Poppins', sans-serif; padding: 40px; color: #333; }.header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }.details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.item { margin-bottom: 15px; }.label { font-weight: bold; color: #666; font-size: 0.9rem; text-transform: uppercase; }.val { font-size: 1.1rem; margin-top: 5px; }.total { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: right; }.price { font-size: 2rem; color: #6366f1; font-weight: bold; }</style></head><body><div class="header"><h1>ServNex Hotels</h1><p>Booking Confirmation Receipt</p></div><div class="details"><div class="item"><div class="label">Hotel</div><div class="val">${hotel.name}</div></div><div class="item"><div class="label">Booking ID</div><div class="val">#SNX-HTL-${bookingDetails.id}</div></div><div class="item"><div class="label">Check In</div><div class="val">${startDate.split("T")[0]}</div></div><div class="item"><div class="label">Check Out</div><div class="val">${endDate.split("T")[0]}</div></div><div class="item"><div class="label">Guests</div><div class="val">${guests}</div></div><div class="item"><div class="label">Room Type</div><div class="val">${room ? room.room_type : 'Standard'}</div></div></div><div class="total"><div class="label">Total Amount Paid</div><div class="price">₹${Math.round(Number(priceDetails.final_price) * 1.02).toLocaleString()}</div></div><p style="margin-top: 50px; font-size: 0.8rem; color: #888;">Thank you for choosing ServNex. This is an electronically generated confirmation.</p></body></html>`;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    const totalCost = Math.round(Number(priceDetails.final_price) * 1.02);

    return (
        <div style={S.page}>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <style>{`
                .counter-btn:hover { background: #6366f1 !important; color: white !important; border-color: #6366f1 !important; transform: scale(1.05); }
                .counter-box:hover { border-color: #6366f133; }
                .booking-input:focus { border-color: #6366f1 !important; background: white !important; }
                .premium-btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 3.5em; border-radius: 30em; font-size: 15px; font-family: inherit; text-decoration: none; border: none; position: relative; overflow: hidden; cursor: pointer; color: #1e293b; background: white; box-shadow: 4px 4px 10px #e2e8f0, -4px -4px 10px #ffffff; transition: all 0.3s ease; font-weight: 500; }
                .premium-btn::before { content: ''; position: absolute; inset: 0; border-radius: 30em; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0; }
                .premium-btn:hover::before { transform: scaleX(1); }
                .premium-btn:hover { color: white; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
                .premium-btn span { position: relative; z-index: 1; transition: color 0.3s ease; display: flex; align-items: center; gap: 8px; }
                .premium-btn:hover span { color: white; }
                @keyframes scaleUp { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale { animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }

                /* iOS Picker Styles */
                .ios-wheel-item { height: 40px; min-height: 40px; display: flex; align-items: center; justify-content: center; scroll-snap-align: center; font-family: 'Poppins', sans-serif; font-size: 16px; color: #64748b; transition: all 0.2s ease; white-space: nowrap; padding: 0 4px; }
                .ios-wheel-item.disabled { color: #94a3b8; opacity: 0.5; }
                .ios-wheel-item.active { color: #0f172a; font-weight: 600; font-size: 19px; transform: scale(1.05); }
                .ios-datepicker-container { display: flex; flex-direction: column; background: #fff; padding: 0; overflow: hidden; }
                .ios-wheel-view { display: flex; height: 200px; position: relative; background: #fff; overflow: hidden; }
                .ios-wheel-column { flex: 1; height: 100%; overflow-y: scroll; scroll-snap-type: y mandatory; scrollbar-width: none; -ms-overflow-style: none; display: flex; flex-direction: column; }
                .ios-wheel-column::-webkit-scrollbar { display: none; }
                .ios-wheel-highlight { position: absolute; top: 80px; left: 10px; right: 10px; height: 40px; border-top: 1px solid #e2e8f0; border-bottom: 1px solid #e2e8f0; pointer-events: none; background: rgba(99, 102, 241, 0.03); }
                .ios-wheel-gradient-top { position: absolute; top: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to bottom, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%); pointer-events: none; z-index: 2; }
                .ios-wheel-gradient-bottom { position: absolute; bottom: 0; left: 0; right: 0; height: 80px; background: linear-gradient(to top, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.5) 50%, rgba(255,255,255,0) 100%); pointer-events: none; z-index: 2; }
            `}</style>

            <header style={S.header}>
                <Link to="/" style={S.logoWrap}>
                    <img src="/logo.jpeg" alt="ServNex Logo" style={S.logoImg} />
                    <span style={S.logoText}>ServNex</span>
                </Link>
                <NotificationDropdown />
            </header>

            <div style={S.body}>
                <StepIndicator currentStep={0} isMobile={isMobile} />

                <div style={isMobile ? { display: "flex", flexDirection: "column" } : S.mainGrid}>
                    {/* Left Column: Main Info */}
                    <div>
                        <div style={S.heroSection}>
                            <img src={room ? room.image : (hotel.image || hotel.room_image1)} style={S.heroImg} alt="Hero" />
                            <div style={S.heroOverlay}>
                                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                                    {room ? room.room_type : "Premium Suite"}
                                </div>
                                <h1 style={{ ...S.hotelName, color: "#fff", margin: 0 }}>{hotel.name}</h1>
                                <div style={{ ...S.location, color: "rgba(255,255,255,0.9)", marginBottom: 0, marginTop: "8px" }}>
                                    <MapPin size={16} /> {hotel.area}, {hotel.city}
                                </div>
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Clock size={20} color="#6366f1" /> Stay Duration</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                <IOSDateTimePickerPopup 
                                    label="Check-In" 
                                    value={startDate} 
                                    onChange={(newIn) => {
                                        setStartDate(newIn);
                                        const d = new Date(newIn);
                                        d.setDate(d.getDate() + 1);
                                        const nextDay = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}T12:00`;
                                        if (!endDate || endDate <= newIn) setEndDate(nextDay);
                                    }} 
                                />
                                <IOSDateTimePickerPopup 
                                    label="Check-Out" 
                                    value={endDate} 
                                    onChange={setEndDate} 
                                    minDateRaw={startDate ? startDate.split("T")[0] : null} 
                                />
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Zap size={20} color="#6366f1" /> Guests & Rooms</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: isMobile ? "16px" : "24px" }}>
                                <div style={{ textAlign: "center", padding: isMobile ? "16px" : "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ ...S.formLabel, textAlign: "center", fontSize: isMobile ? "0.75rem" : "0.8rem" }}>Number of Guests</div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? "12px" : "20px", marginTop: "12px" }}>
                                        <button className="counter-btn" style={S.counterBtn} disabled={guests <= 1} onClick={() => updateGuests(guests - 1)}><Minus size={isMobile ? 14 : 16} /></button>
                                        <span style={{ fontSize: isMobile ? "1.1rem" : "1.2rem", fontWeight: 600, minWidth: isMobile ? "40px" : "80px", textAlign: "center" }}>{guests}</span>
                                        <button className="counter-btn" style={S.counterBtn} onClick={() => updateGuests(guests + 1)}><Plus size={isMobile ? 14 : 16} /></button>
                                    </div>
                                </div>
                                <div style={{ textAlign: "center", padding: isMobile ? "16px" : "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                                    <div style={{ ...S.formLabel, textAlign: "center", fontSize: isMobile ? "0.75rem" : "0.8rem" }}>Number of Rooms</div>
                                    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: isMobile ? "12px" : "20px", marginTop: "12px" }}>
                                        <button className="counter-btn" style={S.counterBtn} disabled={roomsBooked <= 1} onClick={() => updateRooms(roomsBooked - 1)}><Minus size={isMobile ? 14 : 16} /></button>
                                        <span style={{ fontSize: isMobile ? "1.1rem" : "1.2rem", fontWeight: 600, minWidth: isMobile ? "40px" : "80px", textAlign: "center" }}>{roomsBooked}</span>
                                        <button className="counter-btn" style={S.counterBtn} disabled={roomsBooked >= maxRooms} onClick={() => updateRooms(roomsBooked + 1)}><Plus size={isMobile ? 14 : 16} /></button>
                                    </div>
                                </div>
                            </div>
                            <div style={{ textAlign: "center", marginTop: "20px" }}>
                                <Chip label={remainingRooms > 0 ? `Hurry! Only ${remainingRooms} rooms left.` : 'Checking real-time availability...'} sx={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: isMobile ? "0.7rem" : "0.75rem", bgcolor: remainingRooms < 3 ? "rgba(239, 68, 68, 0.08)" : "rgba(16, 185, 129, 0.08)", color: remainingRooms < 3 ? "#ef4444" : "#10b981", borderRadius: "8px" }} />
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><ShieldCheck size={20} color="#6366f1" /> Property Highlights</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "16px" }}>
                                <div style={S.highlightItem}><CheckCircle2 size={18} style={S.highlightIcon} /> Free Cancellation before 24h</div>
                                <div style={S.highlightItem}><CheckCircle2 size={18} style={S.highlightIcon} /> Instant Confirmation</div>
                                <div style={S.highlightItem}><CheckCircle2 size={18} style={S.highlightIcon} /> Best Price Guaranteed</div>
                                <div style={S.highlightItem}><CheckCircle2 size={18} style={S.highlightIcon} /> No Booking Fees</div>
                                <div style={S.highlightItem}><CheckCircle2 size={18} style={S.highlightIcon} /> Secure Payment Gateway</div>
                                <div style={S.highlightItem}><CheckCircle2 size={18} style={S.highlightIcon} /> 24/7 Guest Support</div>
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Info size={20} color="#6366f1" /> Cancellation Policy</div>
                            <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.6, margin: 0 }}>
                                We understand that plans can change. You can cancel your reservation free of charge up to 24 hours before your scheduled check-in time. 
                                Cancellations made within 24 hours of check-in will be charged for the first night of the stay. 
                                For special events or non-refundable rates, different policies may apply.
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Sticky Sidebar */}
                    <div style={S.sidebar}>
                        <div style={S.summaryCard}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "24px", color: "#0f172a" }}>Booking Summary</h3>
                            
                            <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                                    <img src={room ? room.image : hotel.image} style={{ width: "80px", height: "60px", borderRadius: "10px", objectFit: "cover" }} alt="Small" />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{hotel.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{room ? room.room_type : "Standard Room"}</div>
                                    </div>
                                </div>
                                <Divider sx={{ my: 2, opacity: 0.05 }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div style={{ background: "#fff", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                        <div style={S.formLabel}>Check-In</div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{startDate ? startDate.split("T")[0] : "Not selected"}</div>
                                    </div>
                                    <div style={{ background: "#fff", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                        <div style={S.formLabel}>Check-Out</div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{endDate ? endDate.split("T")[0] : "Not selected"}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ marginBottom: "24px" }}>
                                <div style={S.formLabel}>Promo Code</div>
                                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                    <input 
                                        type="text" 
                                        placeholder="Enter code" 
                                        style={{ 
                                            ...S.input, 
                                            width: "auto",
                                            padding: "0 16px", 
                                            height: "50px", 
                                            flex: 1,
                                            boxSizing: "border-box",
                                            margin: 0
                                        }} 
                                        value={couponCode} 
                                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())} 
                                    />
                                    <button 
                                        style={{ 
                                            height: "50px",
                                            width: "auto",
                                            flex: 1,
                                            padding: "0 16px",
                                            borderRadius: "12px", 
                                            background: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)", 
                                            color: "#fff", 
                                            border: "none", 
                                            fontSize: "0.85rem", 
                                            fontWeight: 700,
                                            letterSpacing: "0.05em",
                                            cursor: "pointer",
                                            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                                            boxShadow: "0 4px 15px rgba(99, 102, 241, 0.25)",
                                            display: "flex",
                                            alignItems: "center",
                                            justifyContent: "center",
                                            boxSizing: "border-box",
                                            margin: 0
                                        }}
                                        onMouseOver={(e) => {
                                            e.currentTarget.style.transform = "translateY(-2px)";
                                            e.currentTarget.style.boxShadow = "0 8px 20px rgba(99, 102, 241, 0.35)";
                                        }}
                                        onMouseOut={(e) => {
                                            e.currentTarget.style.transform = "translateY(0)";
                                            e.currentTarget.style.boxShadow = "0 4px 15px rgba(99, 102, 241, 0.25)";
                                        }}
                                    >
                                        APPLY
                                    </button>
                                </div>
                            </div>

                            <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "24px" }}>
                                <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Total Rooms</span>
                                    <span style={{ fontWeight: 600 }}>{roomsBooked}</span>
                                </div>
                                <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Base Price</span>
                                    <span style={{ fontWeight: 600 }}>₹{Number(priceDetails.total_original_price).toLocaleString()}</span>
                                </div>
                                {priceDetails.discount_amount > 0 && (
                                    <div style={S.priceRow}>
                                        <span style={{ color: "#10b981", fontSize: "0.95rem" }}>Discount</span>
                                        <span style={{ fontWeight: 600, color: "#10b981" }}>- ₹{Number(priceDetails.discount_amount).toLocaleString()}</span>
                                    </div>
                                )}
                                <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Convenience Fee (2%)</span>
                                    <span style={{ fontWeight: 600 }}>₹{Math.round(Number(priceDetails.final_price) * 0.02).toLocaleString()}</span>
                                </div>
                                <Divider sx={{ my: 2, opacity: 0.05 }} />
                                <div style={{ ...S.priceRow, marginBottom: 0 }}>
                                    <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>Total</span>
                                    <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "#6366f1" }}>₹{totalCost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "32px" }}>
                                <button className="premium-btn" onClick={handleBooking} disabled={isBooking}>
                                    <span>{isBooking ? "Processing..." : "Confirm Reservation "}</span>
                                </button>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px", color: "#94a3b8" }}>
                                <ShieldCheck size={16} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Secure 256-bit SSL encrypted payment</span>
                            </div>
                        </div>

                            <div style={{ display: "flex", justifyContent: "center", gap: "20px", opacity: 0.5, marginTop: "24px" }}>
                                <CreditCard size={24} />
                                <ShieldCheck size={24} />
                                <Zap size={24} />
                            </div>
                    </div>
                </div>
            </div>

            {/* Modals remain same but with Poppins */}
            <Modal open={showErrorModal} onClose={() => setShowErrorModal(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 440 }, bgcolor: '#fff', p: 5, borderRadius: "24px", textAlign: 'center', outline: 'none' }}>
                    <AnimatedCross /><Typography variant="h5" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif", color: "#ef4444", mt: 2 }}>Selection Unavailable</Typography>
                    <Typography sx={{ mt: 2, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>{error}</Typography>
                    <button className="premium-btn" onClick={() => setShowErrorModal(false)} style={{ marginTop: "32px", width: "auto", padding: "0 2.5em" }}>
                        <span className="d-flex align-items-center gap-1">Adjust Selection <ChevronsRight size={18} /></span>
                    </button>
                </Box>
            </Modal>

            <Modal open={showSuccessModal} onClose={() => navigate("/my-bookings")}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 500 }, bgcolor: '#fff', p: 5, borderRadius: "24px", textAlign: 'center', outline: 'none' }}>
                    <AnimatedCheck /><Typography variant="h4" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif", color: "#10b981", mb: 1 }}>Confirmed!</Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '1rem', mb: 3, fontFamily: "'Poppins', sans-serif" }}>Your stay at <strong>{hotel?.name}</strong> is reserved.</Typography>
                    {bookingDetails && (
                        <Box sx={{ background: "#f8fafc", p: 2.5, borderRadius: "16px", mb: 3, textAlign: "left" }}>
                            <Typography variant="body2" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif" }}>ID: #SNX-${bookingDetails.id}</Typography>
                            <Typography variant="body2" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif" }}>Paid: ₹{totalCost.toLocaleString()}</Typography>
                        </Box>
                    )}
                        <button className="premium-btn" onClick={() => navigate('/my-bookings')} >
                            <span className="d-flex align-items-center gap-1">
                                Go to My Bookings
                                <ChevronsRight size={18} />
                            </span>
                        </button>
                </Box>
            </Modal>
        </div>
    );
}