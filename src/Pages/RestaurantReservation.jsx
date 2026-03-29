import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import NotificationDropdown from "../Component/NotificationDropdown";
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
    ChevronsRight,
    Users,
    Calendar, 
    Tag
} from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";

const S = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#fcfcfd",
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

export default function RestaurantReservation() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { reservationDate, reservationTime, numberOfGuests, restaurant: passedRestaurant } = location.state || {};

    const [restaurant, setRestaurant] = useState(passedRestaurant || null);
    const [loading, setLoading] = useState(!passedRestaurant);

    const [date, setDate] = useState(reservationDate || "");
    const [time, setTime] = useState(reservationTime || "");
    const [guests, setGuests] = useState(numberOfGuests || 2);
    const [specialRequests, setSpecialRequests] = useState("");
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [newResvId, setNewResvId] = useState(null);
    const [resvDetails, setResvDetails] = useState(null);
    const [availability, setAvailability] = useState({});

    const isMobile = useMediaQuery("(max-width:768px)");

    const subtotal = restaurant ? (Number(restaurant.average_cost_for_two) || 0) * Math.ceil(guests / 2) : 0;
    const convenienceFee = subtotal * 0.05; // 5% of subtotal
    const totalCost = subtotal + convenienceFee;

    useEffect(() => {
        if (!restaurant) {
            AxiosInstance.get(`api/restaurants/${id}/`)
                .then(res => { setRestaurant(res.data); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [id, restaurant]);

    useEffect(() => {
        if (date && restaurant) {
            AxiosInstance.get(`api/restaurants/${id}/availability/?date=${date}`)
                .then(res => setAvailability(res.data))
                .catch(() => {});
        }
    }, [date, restaurant, id]);

    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#6366f1" }} />
            <Typography style={{ fontFamily: "'Poppins', sans-serif", color: "#6366f1", fontWeight: 500 }}>Loading Restaurant...</Typography>
        </div>
    );
    if (!restaurant) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>Restaurant not found</Typography>
            <Button variant="contained" onClick={() => navigate("/")} style={{ borderRadius: "12px", textTransform: "none", fontFamily: "'Poppins', sans-serif" }}>Go Back Home</Button>
        </div>
    );

    const handleReservation = async () => {
        if (!date || !time) { setError("Please select reservation date and time."); setShowErrorModal(true); return; }
        const today = new Date().toISOString().split("T")[0];
        if (date < today) { setError("Reservation date cannot be in the past."); setShowErrorModal(true); return; }

        setIsReserving(true);
        setError(null);

        try {
            const resResponse = await AxiosInstance.post("api/reservations/", { restaurant: restaurant.id, reservation_date: date, reservation_time: time, number_of_guests: guests, special_requests: specialRequests });
            const reservationId = resResponse.data.id;
            const orderRes = await AxiosInstance.post("api/razorpay/order/", { amount: totalCost, booking_type: 'restaurant', booking_id: reservationId });
            const order = orderRes.data;

            const options = {
                key: import.meta.env.VITE_RAZR_KEY_ID || "",
                amount: order.amount,
                currency: order.currency,
                name: "ServNex Restaurants",
                description: `Table Reservation for ${restaurant.name}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await AxiosInstance.post("api/razorpay/verify/", { razorpay_order_id: response.razorpay_order_id, razorpay_payment_id: response.razorpay_payment_id, razorpay_signature: response.razorpay_signature });
                        setNewResvId(reservationId);
                        setResvDetails(resResponse.data);
                        toast.success("Payment Successful! Reservation Confirmed.");
                        setShowSuccessModal(true);
                    } catch (err) { toast.error("Payment verification failed. Please contact support."); }
                },
                theme: { color: "#6366f1" }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', function (response) { toast.error(`Payment failed: ${response.error.description}`); });
            rzp.open();

        } catch (err) {
            let msg = "Reservation failed. Please try again.";
            if (err.response && err.response.data) {
                const data = err.response.data;
                if (data.non_field_errors) msg = data.non_field_errors[0];
                else if (data.detail) msg = data.detail;
            }
            setError(msg);
            setShowErrorModal(true);
        } finally { setIsReserving(false); }
    };

    const handleDownloadReceipt = () => {
        if (!resvDetails) return;
        const printWindow = window.open('', '_blank');
        const content = `<html><head><title>Reservation Receipt - ${restaurant.name}</title><style>body { font-family: 'Poppins', sans-serif; padding: 40px; color: #333; }.header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }.details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.item { margin-bottom: 15px; }.label { font-weight: bold; color: #666; font-size: 0.9rem; text-transform: uppercase; }.val { font-size: 1.1rem; margin-top: 5px; }.total { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: right; }.price { font-size: 2rem; color: #6366f1; font-weight: bold; }</style></head><body><div class="header"><h1>ServNex Restaurants</h1><p>Table Reservation Confirmation</p></div><div class="details"><div class="item"><div class="label">Restaurant</div><div class="val">${restaurant.name}</div></div><div class="item"><div class="label">Reservation ID</div><div class="val">#SNX-RES-${resvDetails.id}</div></div><div class="item"><div class="label">Date</div><div class="val">${date}</div></div><div class="item"><div class="label">Time</div><div class="val">${time}</div></div><div class="item"><div class="label">Guests</div><div class="val">${guests}</div></div><div class="item"><div class="label">Location</div><div class="val">${restaurant.area}, ${restaurant.city}</div></div></div><div class="total"><div class="label">Amount Paid</div><div class="price">₹${totalCost.toLocaleString()}</div></div><p style="margin-top: 50px; font-size: 0.8rem; color: #888;">Thank you for booking with ServNex. Please present this receipt at the restaurant.</p></body></html>`;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={S.page}>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <style>{`
                .counter-btn:hover { background: #6366f1 !important; color: white !important; border-color: #6366f1 !important; transform: scale(1.05); }
                .booking-input:focus { border-color: #6366f1 !important; background: white !important; }
                .premium-btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 3.5em; border-radius: 30em; font-size: 15px; font-family: inherit; text-decoration: none; border: none; position: relative; overflow: hidden; cursor: pointer; color: #1e293b; background: white; box-shadow: 4px 4px 10px #e2e8f0, -4px -4px 10px #ffffff; transition: all 0.3s ease; font-weight: 500; }
                .premium-btn::before { content: ''; position: absolute; inset: 0; border-radius: 30em; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0; }
                .premium-btn:hover::before { transform: scaleX(1); }
                .premium-btn:hover { color: white; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
                .premium-btn span { position: relative; z-index: 1; transition: color 0.3s ease; display: flex; align-items: center; gap: 8px; }
                .premium-btn:hover span { color: white; }
                @keyframes scaleUp { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale { animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
            `}</style>

            <header style={S.header}>
                <Link to="/" style={S.logoWrap}>
                    <img src="/logo.jpeg" alt="ServNex Logo" style={S.logoImg} />
                    <span style={S.logoText}>ServNex</span>
                </Link>
                <NotificationDropdown />

            </header>

            <div style={S.body}>
                <div style={isMobile ? { display: "flex", flexDirection: "column" } : S.mainGrid}>
                    {/* Left Column */}
                    <div>
                        <div style={S.heroSection}>
                            <img src={restaurant.image} style={S.heroImg} alt={restaurant.name} />
                            <div style={S.heroOverlay}>
                                <div style={{ color: "rgba(255,255,255,0.8)", fontSize: "0.9rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "8px" }}>
                                    {restaurant.cuisine_type}
                                </div>
                                <h1 style={{ color: "#fff", margin: 0, fontSize: "2.5rem" }}>{restaurant.name}</h1>
                                <div style={{ color: "rgba(255,255,255,0.9)", marginTop: "8px", display: "flex", alignItems: "center", gap: "8px" }}>
                                    <MapPin size={16} /> {restaurant.area}, {restaurant.city}
                                </div>
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Calendar size={20} color="#6366f1" /> Reservation Details</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                <div><span style={S.formLabel}>Date</span><input type="date" style={S.input} className="booking-input" value={date} min={new Date().toLocaleDateString('en-CA')} onChange={e => setDate(e.target.value)} /></div>
                                <div><span style={S.formLabel}>Time</span><input type="time" style={S.input} className="booking-input" value={time} onChange={e => setTime(e.target.value)} /></div>
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Users size={20} color="#6366f1" /> Guests</div>
                            <div style={{ textAlign: "center", padding: "20px", background: "#f8fafc", borderRadius: "16px", border: "1px solid #f1f5f9" }}>
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "20px", marginTop: "12px" }}>
                                    <button className="counter-btn" style={{...S.counterBtn, width: 44, height: 44}} disabled={guests <= 1} onClick={() => setGuests(guests - 1)}><Minus size={16} /></button>
                                    <span style={{ fontSize: "1.5rem", fontWeight: 600, minWidth: "80px", textAlign: "center" }}>{guests} {guests > 1 ? 'Guests' : 'Guest'}</span>
                                    <button className="counter-btn" style={{...S.counterBtn, width: 44, height: 44}} onClick={() => setGuests(guests + 1)}><Plus size={16} /></button>
                                </div>
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Info size={20} color="#6366f1" /> Special Requests</div>
                            <textarea
                                style={{...S.input, height: "120px"}}
                                className="booking-input"
                                placeholder="Any dietary restrictions, special occasions, seating preferences, etc."
                                value={specialRequests}
                                onChange={e => setSpecialRequests(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div style={S.sidebar}>
                        <div style={S.summaryCard}>
                            <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "24px", color: "#0f172a" }}>Booking Summary</h3>
                            
                            <div style={{ background: "#f8fafc", borderRadius: "16px", padding: "20px", marginBottom: "24px" }}>
                                <div style={{ display: "flex", gap: "12px", marginBottom: "16px" }}>
                                    <img src={restaurant.image} style={{ width: "80px", height: "60px", borderRadius: "10px", objectFit: "cover" }} alt="Restaurant" />
                                    <div>
                                        <div style={{ fontWeight: 600, fontSize: "0.95rem" }}>{restaurant.name}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>{restaurant.cuisine_type}</div>
                                    </div>
                                </div>
                                <Divider sx={{ my: 2, opacity: 0.05 }} />
                                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                                    <div style={{ background: "#fff", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                        <div style={S.formLabel}>Date</div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{date || "Not selected"}</div>
                                    </div>
                                    <div style={{ background: "#fff", padding: "12px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                        <div style={S.formLabel}>Time</div>
                                        <div style={{ fontSize: "0.85rem", fontWeight: 600 }}>{time || "Not selected"}</div>
                                    </div>
                                </div>
                            </div>

                            <div style={{ borderTop: "1px dashed #e2e8f0", paddingTop: "24px" }}>
                                <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Subtotal ({guests} Guests)</span>
                                    <span style={{ fontWeight: 600 }}>₹{subtotal.toLocaleString()}</span>
                                </div>
                                <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Convenience Fee (5%)</span>
                                    <span style={{ fontWeight: 600 }}>₹{convenienceFee.toLocaleString()}</span>
                                </div>
                                <Divider sx={{ my: 2, opacity: 0.05 }} />
                                <div style={{ ...S.priceRow, marginBottom: 0 }}>
                                    <span style={{ fontWeight: 600, fontSize: "1.1rem" }}>Total</span>
                                    <span style={{ fontSize: "1.75rem", fontWeight: 700, color: "#6366f1" }}>₹{totalCost.toLocaleString()}</span>
                                </div>
                            </div>

                            <div style={{ marginTop: "32px" }}>
                                <button className="premium-btn" onClick={handleReservation} disabled={isReserving}>
                                    <span>{isReserving ? "Processing..." : "Confirm Reservation"}</span>
                                </button>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginTop: "24px", color: "#94a3b8" }}>
                                <ShieldCheck size={16} />
                                <span style={{ fontSize: "0.75rem", fontWeight: 500 }}>Secure 256-bit SSL encrypted payment</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <Modal open={showErrorModal} onClose={() => setShowErrorModal(false)}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 440 }, bgcolor: '#fff', p: 5, borderRadius: "24px", textAlign: 'center', outline: 'none' }}>
                    <AnimatedCross /><Typography variant="h5" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif", color: "#ef4444", mt: 2 }}>Reservation Failed</Typography>
                    <Typography sx={{ mt: 2, color: '#64748b', fontFamily: "'Poppins', sans-serif" }}>{error}</Typography>
                    <button className="premium-btn" onClick={() => setShowErrorModal(false)} style={{ marginTop: "32px", width: "auto", padding: "0 2.5em" }}>
                        <span className="d-flex align-items-center gap-1">Adjust Details <ChevronsRight size={18} /></span>
                    </button>
                </Box>
            </Modal>

            <Modal open={showSuccessModal} onClose={() => navigate("/my-bookings")}>
                <Box sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: { xs: '90%', sm: 500 }, bgcolor: '#fff', p: 5, borderRadius: "24px", textAlign: 'center', outline: 'none' }}>
                    <AnimatedCheck /><Typography variant="h4" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif", color: "#10b981", mb: 1 }}>Confirmed!</Typography>
                    <Typography sx={{ color: '#64748b', fontSize: '1rem', mb: 3, fontFamily: "'Poppins', sans-serif" }}>Your table at <strong>{restaurant?.name}</strong> is reserved.</Typography>
                    {resvDetails && (
                        <Box sx={{ background: "#f8fafc", p: 2.5, borderRadius: "16px", mb: 3, textAlign: "left" }}>
                            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                                <div>
                                    <Typography variant="body2" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif" }}>ID: #SNX-RES-${resvDetails.id}</Typography>
                                    <Typography variant="body2" fontWeight="600" sx={{ fontFamily: "'Poppins', sans-serif" }}>Paid: ₹{totalCost.toLocaleString()}</Typography>
                                </div>
                                <IconButton onClick={handleDownloadReceipt}><Download size={20} /></IconButton>
                            </div>
                        </Box>
                    )}
                    <button className="premium-btn" onClick={() => navigate("/my-bookings")}>
                        <span className="d-flex align-items-center gap-1">Go to My Bookings <ChevronsRight size={18} /></span>
                    </button>
                </Box>
            </Modal>
        </div>
    );
}