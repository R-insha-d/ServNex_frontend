import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import NotificationDropdown from "../Component/NotificationDropdown";
import Header from "../Component/Header";
import { toast } from "react-toastify";
import { IoClose } from "react-icons/io5";
import {
    Box, Button, Chip, Modal, Typography,
    CircularProgress, IconButton, useMediaQuery
} from "@mui/material";

import {
    Bike, Wind, ShoppingBag, Music, Accessibility, Monitor,
    Baby, Star, Soup, Disc, Crown, PartyPopper, Sparkles, Utensils,
    ChevronLeft, ChevronRight, ChevronDown, Check, X, Users, Calendar, Clock
} from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import NotificationsIcon from "@mui/icons-material/Notifications";
import CheckIcon from "@mui/icons-material/Check";
import AccessTimeIcon from "@mui/icons-material/AccessTime";


/* ─── Helpers (unchanged) ─── */
const getInitTime = () => {
    const now = new Date();
    const currentHour24 = now.getHours();
    const currentMinute = now.getMinutes();
    const initHour = currentHour24 % 12 || 12;
    const initPeriod = currentHour24 >= 12 ? "PM" : "AM";
    const initMinute = String(currentMinute).padStart(2, "0");
    return { initHour, initPeriod, initMinute };
};

const format12h = (time24) => {
    if (!time24) return "";
    const [h, m] = time24.split(":");
    let hours = parseInt(h);
    const period = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    return `${hours}:${m} ${period}`;
};

/* ─── Inline Styles ─── */
const S = {
    page: {
        minHeight: "100vh",
        backgroundColor: "#6365f127",
        fontFamily: "'Poppins', sans-serif",
        color: "#1a1a1a",
    },
    header: {
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(20px)",
        height: "80px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 2rem",
        position: "sticky",
        top: 0,
        zIndex: 1000,
        boxShadow: "0 4px 30px rgba(0,0,0,0.03)",
        borderBottom: "1px solid rgba(0,0,0,0.05)",
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
    logoText: { color: "#5c5be5", fontWeight: 600, fontSize: "24px", letterSpacing: "0.5px" },
    logoImg: { height: "40px", width: "40px", borderRadius: "10px", objectFit: "cover", boxShadow: "0 2px 8px rgba(0,0,0,0.1)" },
    heroWrap: { position: "relative", overflow: "hidden", backgroundColor: "#000", borderRadius: "0 0 24px 24px" },
    heroOverlay: {
        position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
        background: "linear-gradient(to bottom, rgba(0,0,0,0.02) 0%, rgba(0,0,0,0.1) 50%, rgba(0,0,0,0.6) 100%)",
        zIndex: 1, pointerEvents: "none",
    },
    heroDots: { position: "absolute", bottom: "50px", width: "100%", display: "flex", justifyContent: "center", gap: "8px", zIndex: 2 },
    infoBar: {
        display: "flex", alignItems: "center", justifyContent: "center", gap: "60px",
        padding: "24px 40px", backgroundColor: "#fff", borderRadius: "16px",
        margin: "-30px 60px 0", position: "relative", zIndex: 10,
        boxShadow: "0 10px 30px rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.02)", flexWrap: "wrap",
    },
    infoSep: { width: "1px", height: "24px", backgroundColor: "#f1f5f9" },
    infoItem: { display: "flex", alignItems: "center", gap: "12px", fontSize: "0.95rem", color: "#64748b", fontWeight: 400 },
    infoIcon: { fontSize: "1.25rem", color: "#6366f1" },
    body: { maxWidth: "1300px", margin: "0 auto", padding: "0 40px" },
    fieldLabel: {
        display: "block",
        fontSize: "0.72rem",
        fontWeight: 600,
        color: "#6366f1",
        textTransform: "uppercase",
        letterSpacing: "0.07em",
        marginBottom: "8px",
    },
    fieldInput: {
        width: "100%",
        height: "48px",
        borderRadius: "12px",
        border: "1.5px solid #e2e8f0",
        padding: "0 16px",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "0.95rem",
        color: "#0f172a",
        background: "#f8fafc",
        outline: "none",
        boxSizing: "border-box",
        appearance: "none",
        WebkitAppearance: "none",
        transition: "border-color 0.2s, background 0.2s",
    },
};

/* ─── Premium gradient button ─── */
function GradBtn({ onClick, children, fullWidth, disabled }) {
    return (
        <button
            onClick={onClick}
            disabled={disabled}
            className="premium-btn"
            style={{
                width: fullWidth ? "100%" : "auto",
                padding: "0 2.5em",
                opacity: disabled ? 0.55 : 1,
                cursor: disabled ? "not-allowed" : "pointer",
            }}
        >
            <span>{children}</span>
        </button>
    );
}

/* ─── Animated Check ─── */
const AnimatedCheck = () => (
    <div className="animate-scale" style={{ marginBottom: "20px" }}>
        <svg width="80" height="80" viewBox="0 0 80 80" fill="none">
            <circle cx="40" cy="40" r="38" stroke="#2e7d32" strokeWidth="4" />
            <path d="M25 40L35 50L55 30" stroke="#2e7d32" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    </div>
);

/* ══════════════════════════════════════════════════════════════
   CUSTOM DROPDOWN — replaces native <select>
══════════════════════════════════════════════════════════════ */
function CustomDropdown({ value, onChange, options, icon, placeholder, compact = false }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const selected = options.find(o => String(o.value) === String(value));

    return (
        <div ref={ref} style={{ position: "relative", flex: compact ? "0 0 auto" : 1 }}>
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                style={{
                    width: "100%",
                    height: compact ? "44px" : "50px",
                    borderRadius: "14px",
                    border: open ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                    background: open ? "#fff" : "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: compact ? "0 12px" : "0 14px",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: compact ? "1rem" : "0.92rem",
                    fontWeight: 600,
                    color: "#0f172a",
                    transition: "all 0.2s ease",
                    boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                    outline: "none",
                    minWidth: compact ? "72px" : "auto",
                    justifyContent: "space-between",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1, minWidth: 0 }}>
                    {icon && <span style={{ color: "#6366f1", flexShrink: 0, display: "flex" }}>{icon}</span>}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {selected ? selected.label : placeholder || "Select"}
                    </span>
                </span>
                <span style={{
                    color: "#94a3b8", flexShrink: 0, display: "flex",
                    transition: "transform 0.2s",
                    transform: open ? "rotate(180deg)" : "rotate(0deg)",
                }}>
                    <ChevronDown size={15} />
                </span>
            </button>

            {open && (
                <div
                    className="custom-scroll"
                    style={{
                        position: "absolute",
                        top: "calc(100% + 6px)",
                        left: 0,
                        minWidth: "100%",
                        background: "#fff",
                        borderRadius: "16px",
                        border: "1.5px solid #e2e8f0",
                        boxShadow: "0 20px 40px rgba(0,0,0,0.1), 0 4px 12px rgba(99,102,241,0.08)",
                        zIndex: 9999,
                        overflow: "hidden",
                        overflowY: "auto",
                        animation: "dropIn 0.18s cubic-bezier(0.4,0,0.2,1)",
                        maxHeight: "220px",
                        padding: "6px",
                    }}
                >
                    {options.map((opt) => {
                        const isSelected = String(opt.value) === String(value);
                        const isDisabled = opt.disabled === true;
                        return (
                            <button
                                key={opt.value}
                                type="button"
                                disabled={isDisabled}
                                onClick={() => { if (!isDisabled) { onChange(opt.value); setOpen(false); } }}
                                style={{
                                    width: "100%",
                                    padding: compact ? "9px 12px" : "10px 14px",
                                    borderRadius: "10px",
                                    background: isSelected ? "linear-gradient(135deg,#6366f1,#8b5cf6)" : "transparent",
                                    color: isDisabled ? "#cbd5e1" : (isSelected ? "#fff" : "#334155"),
                                    border: "none",
                                    cursor: isDisabled ? "not-allowed" : "pointer",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: compact ? "0.95rem" : "0.88rem",
                                    fontWeight: isSelected ? 600 : 400,
                                    textAlign: "left",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "space-between",
                                    gap: "8px",
                                    transition: "background 0.15s",
                                    whiteSpace: "nowrap",
                                    opacity: isDisabled ? 0.7 : 1,
                                }}
                                onMouseEnter={e => { if (!isSelected && !isDisabled) e.currentTarget.style.background = "#f5f3ff"; }}
                                onMouseLeave={e => { if (!isSelected && !isDisabled) e.currentTarget.style.background = "transparent"; }}
                            >
                                <span>{opt.label}</span>
                                {isSelected && <Check size={13} />}
                                {isDisabled && <X size={13} color="#ef4444" />}
                            </button>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   CUSTOM MINI CALENDAR DATE PICKER
   value: "YYYY-MM-DD" string, onChange(val), min: "YYYY-MM-DD"
══════════════════════════════════════════════════════════════ */
const MONTH_NAMES = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const DAY_NAMES = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function CustomDatePicker({ value, onChange, min }) {
    const todayStr = min || new Date().toISOString().split("T")[0];

    const parseLocalDate = (str) => {
        if (!str) return new Date();
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
    };

    const [viewYear, setViewYear] = useState(() => parseLocalDate(value || todayStr).getFullYear());
    const [viewMonth, setViewMonth] = useState(() => parseLocalDate(value || todayStr).getMonth());
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const prevMonth = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };
    const nextMonth = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const toStr = (d) => `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const isPast = (d) => toStr(d) < todayStr;
    const isSelected = (d) => toStr(d) === value;
    const isToday = (d) => {
        const t = new Date();
        return t.getFullYear() === viewYear && t.getMonth() === viewMonth && t.getDate() === d;
    };

    const selectDay = (d) => {
        const str = toStr(d);
        if (str >= todayStr) { onChange(str); setOpen(false); }
    };

    const displayVal = value
        ? parseLocalDate(value).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
        : "Select date";

    return (
        <div ref={ref} style={{ position: "relative" }}>
            <button
                type="button"
                onClick={() => setOpen(p => !p)}
                style={{
                    width: "100%",
                    height: "50px",
                    borderRadius: "14px",
                    border: open ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                    background: open ? "#fff" : "#f8fafc",
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "0 16px",
                    cursor: "pointer",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "0.95rem",
                    fontWeight: 600,
                    color: value ? "#0f172a" : "#94a3b8",
                    transition: "all 0.2s ease",
                    boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.1)" : "none",
                    outline: "none",
                    justifyContent: "space-between",
                }}
            >
                <span style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Calendar size={16} color="#6366f1" />
                    {displayVal}
                </span>
                <ChevronDown
                    size={15}
                    color="#94a3b8"
                    style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
                />
            </button>

            {open && (
                <div style={{
                    position: "absolute",
                    top: "calc(100% + 8px)",
                    left: 0,
                    width: "100%",
                    minWidth: "300px",
                    background: "#fff",
                    borderRadius: "20px",
                    border: "1.5px solid #e2e8f0",
                    boxShadow: "0 24px 48px rgba(0,0,0,0.12), 0 4px 12px rgba(99,102,241,0.08)",
                    zIndex: 9999,
                    padding: "16px",
                    animation: "dropIn 0.18s cubic-bezier(0.4,0,0.2,1)",
                    overflow: "hidden",
                    boxSizing: "border-box",
                }}>
                    {/* Month nav */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px" }}>
                        <button
                            type="button"
                            onClick={prevMonth}
                            style={{ border: "none", background: "#f1f5f9", borderRadius: "8px", flex: "0 0 32px", width: "32px", height: "32px", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e0e7ff"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
                        >
                            <ChevronLeft size={18} color="#64748b" />
                        </button>
                        <span style={{ fontWeight: 700, fontSize: "0.9rem", color: "#0f172a" }}>
                            {MONTH_NAMES[viewMonth]} {viewYear}
                        </span>
                        <button
                            type="button"
                            onClick={nextMonth}
                            style={{ border: "none", background: "#f1f5f9", borderRadius: "8px", flex: "0 0 32px", width: "32px", height: "32px", padding: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "background 0.15s" }}
                            onMouseEnter={e => e.currentTarget.style.background = "#e0e7ff"}
                            onMouseLeave={e => e.currentTarget.style.background = "#f1f5f9"}
                        >
                            <ChevronRight size={18} color="#64748b" />
                        </button>
                    </div>

                    {/* Scrollable grid area */}
                    <div className="no-scrollbar" style={{ width: "100%", overflowX: "auto", overflowY: "hidden" }}>
                        <div style={{ minWidth: "260px" }}>
                            {/* Day name headers */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px", marginBottom: "6px" }}>
                                {DAY_NAMES.map(d => (
                                    <div key={d} style={{ textAlign: "center", fontSize: "0.68rem", fontWeight: 700, color: "#94a3b8", padding: "4px 0", textTransform: "uppercase", letterSpacing: "0.04em" }}>{d}</div>
                                ))}
                            </div>

                            {/* Day cells */}
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "2px" }}>
                                {cells.map((d, i) => {
                                    if (!d) return <div key={`e-${i}`} />;
                                    const past = isPast(d);
                                    const sel = isSelected(d);
                                    const tod = isToday(d);
                                    return (
                                        <button
                                            key={d}
                                            type="button"
                                            disabled={past}
                                            onClick={() => selectDay(d)}
                                            style={{
                                                border: "none",
                                                borderRadius: "10px",
                                                height: "34px",
                                                width: "100%",
                                                cursor: past ? "not-allowed" : "pointer",
                                                fontFamily: "'Poppins', sans-serif",
                                                fontSize: "0.82rem",
                                                fontWeight: sel ? 700 : tod ? 600 : 400,
                                                background: sel
                                                    ? "linear-gradient(135deg,#6366f1,#8b5cf6)"
                                                    : tod ? "#f5f3ff" : "transparent",
                                                color: sel ? "#fff" : past ? "#d1d5db" : tod ? "#6366f1" : "#334155",
                                                outline: "none",
                                                transition: "all 0.15s",
                                                boxShadow: sel ? "0 4px 10px rgba(99,102,241,0.25)" : "none",
                                            }}
                                            onMouseEnter={e => { if (!past && !sel) e.currentTarget.style.background = "#f5f3ff"; }}
                                            onMouseLeave={e => { if (!past && !sel) e.currentTarget.style.background = tod ? "#f5f3ff" : "transparent"; }}
                                        >
                                            {d}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <button
                            type="button"
                            onClick={() => { onChange(""); setOpen(false); }}
                            style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#94a3b8" }}
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const t = new Date();
                                const str = t.toISOString().split("T")[0];
                                if (str >= todayStr) {
                                    onChange(str);
                                    setViewYear(t.getFullYear());
                                    setViewMonth(t.getMonth());
                                    setOpen(false);
                                }
                            }}
                            style={{ border: "none", background: "none", cursor: "pointer", fontFamily: "'Poppins',sans-serif", fontSize: "0.8rem", fontWeight: 600, color: "#6366f1" }}
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════════ */
export default function RestaurantDetail() {

    /* ── Menu modal state (unchanged) ── */
    const [menuOpen, setMenuOpen] = useState(false);

    const { id } = useParams();
    const navigate = useNavigate();
    const isMobile = useMediaQuery("(max-width:768px)");
    const isTablet = useMediaQuery("(max-width:1024px)");

    const [restaurant, setRestaurant] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [reviews, setReviews] = useState([]);
    const [revealed, setRevealed] = useState({});

    /* ── Reservation modal state (unchanged) ── */
    const [open, setOpen] = useState(false);
    const [reservationDate, setReservationDate] = useState(() => new Date().toISOString().split("T")[0]);
    const [tableCapacity, setTableCapacity] = useState(2);
    const [timeHour, setTimeHour] = useState(() => String(getInitTime().initHour).padStart(2, "0"));
    const [timeMinute, setTimeMinute] = useState(() => String(new Date().getMinutes()).padStart(2, "0"));
    const [timePeriod, setTimePeriod] = useState(() => getInitTime().initPeriod);
    const [availability, setAvailability] = useState({});

    /* ── Review modal state (unchanged) ── */
    const [reviewModalOpen, setReviewModalOpen] = useState(false);
    const [eligibleResvId, setEligibleResvId] = useState(null);
    const [reviewRating, setReviewRating] = useState(5);
    const [reviewComment, setReviewComment] = useState("");
    const [reviewImages, setReviewImages] = useState([]);
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);



    /* ── Fetch (unchanged) ── */
    useEffect(() => {
        setLoading(true);
        Promise.all([
            AxiosInstance.get(`api/restaurants/${id}/`),
            AxiosInstance.get(`api/restaurants/${id}/reviews/`),
        ])
            .then(([res1, res2]) => {
                setRestaurant(res1.data);
                const revData = res2.data;
                setReviews(Array.isArray(revData) ? revData : (revData.results || []));
                setLoading(false);
            })
            .catch(err => {
                setError(err.message || "Failed to load restaurant data");
                setLoading(false);
            });
    }, [id]);

    /* ── Carousel (unchanged) ── */
    const images = restaurant
        ? [restaurant.image, restaurant.extra_image, restaurant.interior_image].filter(Boolean)
        : [];

    useEffect(() => {
        if (images.length === 0) return;
        const interval = setInterval(() => setActiveIndex(prev => (prev + 1) % images.length), 3000);
        return () => clearInterval(interval);
    }, [images.length]);

    /* ── Scroll reveal (unchanged) ── */
    useEffect(() => {
        if (loading) return;
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const rid = entry.target.getAttribute("data-reveal-id");
                    if (rid) setRevealed(prev => ({ ...prev, [rid]: true }));
                }
            });
        }, { threshold: 0.1 });
        document.querySelectorAll("[data-reveal-id]").forEach(el => observer.observe(el));
        return () => observer.disconnect();
    }, [loading]);

    /* ── Availability fetch (unchanged) ── */
    useEffect(() => {
        if (open && reservationDate && restaurant) {
            AxiosInstance.get(`api/restaurants/${id}/availability/?date=${reservationDate}`)
                .then(res => setAvailability(res.data))
                .catch(err => console.error("Error fetching availability:", err));
        }
    }, [open, reservationDate, restaurant, id]);

    /* ── Handlers (unchanged logic) ── */
    const handleOpenModal = () => setOpen(true);
    const handleClose = () => setOpen(false);

    const handleWriteReviewClick = async () => {
        const token = localStorage.getItem("access");
        if (!token) { toast.error("Please login to write a review"); navigate("/auth"); return; }
        try {
            const res = await AxiosInstance.get(`api/eligible-reservation/?restaurant_id=${id}`);
            if (res.data.id) { setEligibleResvId(res.data.id); setReviewModalOpen(true); }
            else toast.info("A confirmed reservation is required to leave a review.");
        } catch { toast.error("Error checking eligibility."); }
    };

    const handleReviewSubmit = async () => {
        if (!eligibleResvId) return;
        setIsSubmittingReview(true);
        try {
            const formData = new FormData();
            formData.append("reservation", eligibleResvId);
            formData.append("rating", reviewRating);
            formData.append("comment", reviewComment);
            if (reviewImages) {
                for (let i = 0; i < reviewImages.length; i++) formData.append("images", reviewImages[i]);
            }
            const res = await AxiosInstance.post("api/reviews/", formData, { headers: { "Content-Type": "multipart/form-data" } });
            toast.success("Thank you for your review!");
            setReviewModalOpen(false);
            const newReview = { ...res.data, user_name: "You", created_at: new Date().toISOString() };
            const updatedReviews = [newReview, ...reviews];
            setReviews(updatedReviews);
            const avg = (updatedReviews.reduce((acc, r) => acc + r.rating, 0) / updatedReviews.length).toFixed(1);
            setRestaurant(prev => ({ ...prev, average_rating: avg, reviews_count: updatedReviews.length }));
            setReviewRating(5); setReviewComment(""); setReviewImages([]);
        } catch { toast.error("Failed to submit review."); }
        finally { setIsSubmittingReview(false); }
    };

    const handleReservation = () => {
        if (!reservationDate) { toast.error("Please select a date"); return; }
        let hour = parseInt(timeHour);
        if (timePeriod === "AM" && hour === 12) hour = 0;
        if (timePeriod === "PM" && hour !== 12) hour += 12;
        const formattedTime = `${String(hour).padStart(2, "0")}:${timeMinute}`;

        if (restaurant.opening_time && restaurant.closing_time) {
            const resvTimeVal = hour * 60 + parseInt(timeMinute);
            const [oH, oM] = restaurant.opening_time.split(":");
            const openVal = parseInt(oH) * 60 + parseInt(oM);
            const [cH, cM] = restaurant.closing_time.split(":");
            const closeVal = parseInt(cH) * 60 + parseInt(cM);
            if (resvTimeVal < openVal || resvTimeVal > closeVal) {
                toast.error(`Restaurant is only open from ${format12h(restaurant.opening_time)} to ${format12h(restaurant.closing_time)}`);
                return;
            }
        }
        if (!restaurant.is_open) { toast.error("This restaurant is currently closed and not accepting reservations."); return; }
        const selected = new Date(`${reservationDate}T${formattedTime}`);
        if (selected < new Date(new Date().getTime() - 1 * 60 * 1000)) {
            toast.error("❌ Booking is only available for future dates and times.");
            return;
        }

        if (availability[tableCapacity] === 0) {
            toast.error("⚠️ This table size is currently fully booked for the selected date.");
            return;
        }

        navigate(`/reservation/${id}`, { state: { restaurant, reservationDate, reservationTime: formattedTime, tableCapacity } });
    };

    /* ── Loading / Error ── */
    if (loading) return (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", gap: "16px" }}>
            <CircularProgress style={{ color: "#6366f1" }} />
            <Typography style={{ fontFamily: "'Poppins', sans-serif", color: "#6366f1", fontWeight: 500 }}>Loading Restaurant…</Typography>
        </div>
    );
    if (error || !restaurant) return (
        <div style={{ textAlign: "center", padding: "80px 24px" }}>
            <Typography variant="h5" color="error" gutterBottom style={{ fontFamily: "'Poppins', sans-serif", fontWeight: 600 }}>{error || "Restaurant not found"}</Typography>
            <Button variant="contained" onClick={() => navigate("/")} style={{ borderRadius: "12px", textTransform: "none", fontFamily: "'Poppins', sans-serif" }}>Go Back Home</Button>
        </div>
    );

    const heroHeight = isMobile ? 300 : 560;

    /* Build dropdown option arrays with past-time blocking */
    const isToday = reservationDate === new Date().toLocaleDateString('en-CA');
    const nowLocal = new Date();
    const currentH24 = nowLocal.getHours();

    const hourOptions = Array.from({ length: 12 }, (_, i) => {
        const h = i + 1;
        const hStr = String(h).padStart(2, "0");
        let disabled = false;
        if (isToday) {
            const h24 = timePeriod === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
            if (h24 < currentH24) disabled = true;
        }
        return { value: hStr, label: hStr, disabled };
    });

    const minuteOptions = Array.from({ length: 12 }, (_, i) => {
        const m = i * 5;
        const mStr = String(m).padStart(2, "0");
        let disabled = false;
        if (isToday) {
            const h = parseInt(timeHour);
            const h24 = timePeriod === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
            if (h24 === currentH24 && m < nowLocal.getMinutes()) disabled = true;
            if (h24 < currentH24) disabled = true;
        }
        return { value: mStr, label: mStr, disabled };
    });

    const periodOptions = [
        { value: "AM", label: "AM" },
        { value: "PM", label: "PM" },
    ].map(p => {
        let disabled = false;
        if (isToday) {
            if (p.value === "AM" && currentH24 >= 12) disabled = true;
        }
        return { ...p, disabled };
    });
    const tableOptions = [2, 4, 6, 8, 10].map(n => ({
        value: n,
        label: `${n}-Seater Table${availability[n] !== undefined
            ? ` (${availability[n] === 0 ? "Full" : `${availability[n]} available`})`
            : ""}`,
        disabled: availability[n] === 0,
    }));

    return (
        <div style={S.page}>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />

            <style>{`
                @keyframes slideUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
                @keyframes pulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:.8; transform:scale(.98); } }
                @keyframes dropIn { from { opacity:0; transform:translateY(-8px) scale(0.97); } to { opacity:1; transform:translateY(0) scale(1); } }
                @keyframes modalIn { from { opacity:0; transform:translate(-50%,-46%) scale(0.96); } to { opacity:1; transform:translate(-50%,-50%) scale(1); } }

                .reveal { opacity:0; transform:translateY(20px); transition:all 0.8s cubic-bezier(0.4,0,0.2,1); }
                .reveal.active { opacity:1; transform:translateY(0); }

                .detail-layout-container { display:grid; grid-template-columns:1fr 380px; gap:40px; margin-top:40px; align-items:flex-start; }
                @media(max-width:1024px){ .detail-layout-container{ grid-template-columns:1fr; gap:30px; } }

                .main-content-area { display:flex; flex-direction:column; gap:30px; }
                .sidebar-area { position:sticky; top:100px; }

                .section-card { background:#fff; padding:40px; border-radius:24px; border:1px solid #f0f0f0; box-shadow:0 4px 25px rgba(0,0,0,0.02); }

                .section-title {
                    font-family:'Poppins',sans-serif; font-size:1.8rem; font-weight:700;
                    color:#0f172a; margin-bottom:24px; position:relative; letter-spacing:-0.01em;
                }
                .section-title::after {
                    content:""; position:absolute; bottom:-10px; left:0;
                    width:40px; height:3px; background:#6366f1; border-radius:2px;
                }

                .reservation-sidebar-card { background:#fff; border-radius:28px; border:1px solid #eee; padding:32px; box-shadow:0 20px 40px rgba(0,0,0,0.04); }

                .feature-pill { background:#f8fafc; border:1px solid #e2e8f0; padding:12px 16px; border-radius:14px; display:flex; align-items:center; gap:12px; transition:all 0.3s ease; }
                .feature-pill:hover { background:#fff; box-shadow:0 10px 15px -3px rgba(0,0,0,0.05); transform:translateY(-2px); }

                .review-item { padding:24px 0; border-bottom:1px solid #f1f1f1; }
                .review-item:last-child { border-bottom:none; }

                .premium-btn {
                    display:inline-flex; align-items:center; justify-content:center;
                    width:100%; height:3.5em; border-radius:30em; font-size:15px;
                    font-family:inherit; border:none; position:relative; overflow:hidden;
                    cursor:pointer; color:#1e293b; background:white;
                    box-shadow:4px 4px 10px #e2e8f0,-4px -4px 10px #ffffff;
                    transition:all 0.3s ease; font-weight:500;
                }
                .premium-btn::before {
                    content:''; position:absolute; inset:0; border-radius:30em;
                    background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                    transform:scaleX(0); transform-origin:left;
                    transition:transform 0.5s cubic-bezier(0.4,0,0.2,1); z-index:0;
                }
                .premium-btn:hover::before { transform:scaleX(1); }
                .premium-btn:hover { color:white; transform:translateY(-2px); box-shadow:0 10px 20px rgba(99,102,241,0.2); }
                .premium-btn span { position:relative; z-index:1; transition:color 0.3s ease; display:flex; align-items:center; gap:8px; }
                .premium-btn:hover span { color:white; }

                .reserve-main-btn {
                    width:100%; padding:16px; border-radius:16px; border:none;
                    background:linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%);
                    color:#fff; font-family:'Poppins',sans-serif; font-size:1rem;
                    font-weight:600; cursor:pointer; letter-spacing:0.01em;
                    box-shadow:0 10px 20px rgba(99,102,241,0.2);
                    transition:all 0.3s ease;
                }
                .reserve-main-btn:hover { transform:translateY(-2px); box-shadow:0 15px 30px rgba(99,102,241,0.3); }
                .reserve-main-btn:disabled { background:#9ca3af; box-shadow:none; cursor:not-allowed; transform:none; }

                .custom-scroll::-webkit-scrollbar { width:4px; }
                .custom-scroll::-webkit-scrollbar-track { background:transparent; }
                .custom-scroll::-webkit-scrollbar-thumb { background:#e2e8f0; border-radius:4px; }
                .custom-scroll::-webkit-scrollbar-thumb:hover { background:#c7d2fe; }

                .no-scrollbar::-webkit-scrollbar { display: none; }
                .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
            `}</style>

            {/* ── Header ── */}
            <Header />

            {/* ── Hero Carousel ── */}
            <div
                data-reveal-id="hero"
                className={`reveal ${revealed["hero"] ? "active" : ""}`}
                style={{ ...S.heroWrap, height: heroHeight }}
            >
                {images.map((img, index) => (
                    <img
                        key={index}
                        src={img || "https://via.placeholder.com/1200x600?text=Restaurant"}
                        alt="restaurant"
                        style={{
                            position: "absolute", top: 0, left: 0,
                            width: "100%", height: "100%", objectFit: "cover",
                            opacity: index === activeIndex ? 1 : 0,
                            transition: "opacity 1.2s ease-in-out",
                        }}
                    />
                ))}
                <div style={S.heroOverlay} />
                <div style={{
                    position: "absolute",
                    bottom: isMobile ? "60px" : "80px",
                    left: isMobile ? "24px" : "80px",
                    zIndex: 2, color: "#fff",
                }}>
                    <div style={{
                        fontFamily: "'Poppins', sans-serif",
                        fontSize: isMobile ? "3rem" : "clamp(2.5rem,6vw,4.5rem)",
                        fontWeight: 600, lineHeight: 1.1, letterSpacing: "-0.02em",
                        marginBottom: "12px", textShadow: "0 4px 20px rgba(0,0,0,0.2)",
                    }}>
                        {restaurant.name}
                    </div>
                    <div style={{
                        fontSize: "clamp(0.9rem,1.5vw,1.1rem)", fontWeight: 400,
                        opacity: 0.9, letterSpacing: "0.03em", textTransform: "uppercase",
                        display: "flex", alignItems: "center", gap: "10px",
                    }}>
                        <LocationOnIcon sx={{ fontSize: "1.2rem", opacity: 0.8 }} />
                        {restaurant.city}
                    </div>
                </div>
                <div style={S.heroDots}>
                    {images.map((_, i) => (
                        <div key={i} onClick={() => setActiveIndex(i)} style={{
                            width: i === activeIndex ? 30 : 8, height: 8, borderRadius: "8px",
                            backgroundColor: i === activeIndex ? "#fff" : "rgba(255,255,255,0.4)",
                            cursor: "pointer", transition: "all 0.4s ease",
                        }} />
                    ))}
                </div>
            </div>

            {/* ── Info bar ── */}
            <div
                data-reveal-id="info-bar"
                className={`reveal ${revealed["info-bar"] ? "active" : ""}`}
                style={{
                    ...S.infoBar,
                    margin: isMobile ? "24px 24px 0" : S.infoBar.margin,
                    padding: isMobile ? "24px" : S.infoBar.padding,
                    gap: isMobile ? "24px" : S.infoBar.gap,
                }}
            >
                <div style={S.infoItem}>
                    <LocationOnIcon style={S.infoIcon} />
                    <span>{restaurant.area?.slice(0, 25)}, {restaurant.city}</span>
                </div>
                {!isMobile && <div style={S.infoSep} />}
                <a href='#reviews' style={{ textDecoration: "none" }}>
                    <div style={S.infoItem}>
                        <StarIcon style={{ ...S.infoIcon, color: "#f59e0b" }} />
                        <strong style={{ color: "#0f172a" }}>{restaurant.average_rating || "4.5"}</strong>
                        <span style={{ color: "#94a3b8" }}>({restaurant.reviews_count || "0"} reviews)</span>
                    </div>
                </a>
                {!isMobile && <div style={S.infoSep} />}
                <div style={S.infoItem}>
                    <Chip
                        label={restaurant.is_open ? "OPEN NOW" : "CLOSED NOW"}
                        size="small"
                        sx={{
                            bgcolor: restaurant.is_open ? "rgba(16,185,129,0.1)" : "rgba(239,68,68,0.1)",
                            color: restaurant.is_open ? "#10b981" : "#ef4444",
                            fontWeight: 700, fontSize: "0.7rem", borderRadius: "6px", height: "24px",
                        }}
                    />
                </div>
                {!isMobile && <div />}

            </div>

            {/* ── Main body ── */}
            <div style={{ ...S.body, paddingBottom: "100px" }}>
                <div className="detail-layout-container">

                    {/* LEFT: MAIN CONTENT */}
                    <div className="main-content-area">

                        {/* About */}
                        <div className="section-card reveal active" data-reveal-id="about">
                            <h2 className="section-title">Experience & Ambience</h2>
                            <p style={{ fontFamily: "'Poppins',sans-serif", fontSize: "1rem", color: "#475569", lineHeight: "1.8", marginBottom: "24px" }}>
                                {restaurant.description}
                            </p>
                            {Array.isArray(restaurant.nearby_attractions) && restaurant.nearby_attractions.length > 0 && (
                                <Box sx={{ mt: 4, pt: 3, borderTop: "1px solid #f0f0f0" }}>
                                    <Typography variant="overline" sx={{ color: "#6366f1", fontWeight: 700, letterSpacing: "0.1em" }}>
                                        Nearby Attractions
                                    </Typography>
                                    <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2, mt: 2 }}>
                                        {restaurant.nearby_attractions.map((place, idx) => (
                                            <div key={idx} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#f8fafc", padding: "12px 16px", borderRadius: "12px", border: "1px solid #f1f5f9" }}>
                                                <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#334155" }}>{place.name}</span>
                                                <span style={{ fontSize: "0.8rem", color: "#64748b", background: "#fff", padding: "2px 8px", borderRadius: "6px" }}>{parseFloat(place.distance_km).toFixed(1)} km</span>
                                            </div>
                                        ))}
                                    </Box>
                                </Box>
                            )}
                        </div>

                        {/* Map */}
                        <div className="section-card reveal active" data-reveal-id="location" style={{ padding: "8px", overflow: "hidden" }}>
                            <iframe
                                height="400" width="100%"
                                style={{ display: "block", border: 0, borderRadius: "16px" }}
                                loading="lazy"
                                src={`https://www.google.com/maps?q=${restaurant.area || "Restaurant"}&output=embed`}
                                title="map"
                            />
                        </div>

                        {/* Amenities */}
                        <div className="section-card reveal active" data-reveal-id="features">
                            <h2 className="section-title">Amenities & Features</h2>
                            <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr" }, alignItems: "start", whiteSpace: "nowrap", gap: 2 }}>
                                {[
                                    { name: "Home Delivery", icon: <Bike size={20} /> },
                                    { name: "Air Condition", icon: <Wind size={20} /> },
                                    { name: "Take-away", icon: <ShoppingBag size={20} /> },
                                    { name: "Live Music", icon: <Music size={20} /> },
                                    { name: "Wheelchair Accessible", icon: <Accessibility size={20} /> },
                                    { name: "Live Sports Screening", icon: <Monitor size={20} /> },
                                    { name: "Kids Allowed", icon: <Baby size={20} /> },
                                    { name: "5-star Dining", icon: <Star size={20} /> },
                                    { name: "Buffet", icon: <Soup size={20} /> },
                                    { name: "Thali", icon: <Disc size={20} /> },
                                    { name: "Luxury Dining", icon: <Crown size={20} /> },
                                    { name: "New Year Specials", icon: <PartyPopper size={20} /> },
                                ].map((feature, idx) => (
                                    <div key={idx} className="feature-pill">
                                        <div style={{ color: "#6366f1" }}>{feature.icon}</div>
                                        <span style={{ fontSize: "0.9rem", fontWeight: 500, color: "#334155" }}>{feature.name}</span>
                                    </div>
                                ))}
                            </Box>
                        </div>

                        {/* Reviews */}
                        <div className="section-card reveal active" data-reveal-id="reviews">
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "32px", flexWrap: "wrap", gap: "16px" }} id="reviews">
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
                                    <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#0f172a", lineHeight: 1 }}>{restaurant?.average_rating || "N/A"}</div>
                                    <div style={{ fontSize: "0.8rem", color: "#64748b", marginTop: "4px", fontWeight: 500 }}>out of 5</div>
                                </div>
                                <div style={{ width: "2px", height: "40px", background: "#e2e8f0" }} />
                                <div>
                                    <div style={{ display: "flex", gap: "2px" }}>
                                        {[1, 2, 3, 4, 5].map(s => (
                                            <StarIcon key={s} sx={{ color: s <= (parseFloat(restaurant?.average_rating) || 0) ? "#f59e0b" : "#e2e8f0", fontSize: 20 }} />
                                        ))}
                                    </div>
                                    <div style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500, marginTop: "4px" }}>
                                        Based on {reviews.length || 0} verified guest experiences
                                    </div>
                                </div>
                            </Box>
                            {!Array.isArray(reviews) || reviews.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "40px 0", color: "#94a3b8" }}>
                                    <div style={{ fontSize: "3rem", marginBottom: "10px" }}>💬</div>
                                    <p style={{ fontWeight: 500 }}>No reviews yet. Be the first to share your dining experience!</p>
                                </div>
                            ) : (
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    {reviews.map((rev, idx) => (
                                        <div key={rev.id || idx} className="review-item">
                                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                                                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                                                    <div style={{ width: "48px", height: "48px", borderRadius: "14px", background: "linear-gradient(135deg,#6366f1 0%,#a855f7 100%)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: "1.2rem", boxShadow: "0 4px 12px rgba(99,102,241,0.2)" }}>
                                                        {(rev.user_name || "G")[0].toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div style={{ fontWeight: 600, color: "#0f172a", fontSize: "0.95rem" }}>{rev.user_name || "Verified Guest"}</div>
                                                        <div style={{ fontSize: "0.8rem", color: "#64748b" }}>
                                                            {rev.created_at ? new Date(rev.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" }) : "Recently"}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div style={{ display: "flex", gap: "1px" }}>
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
                                                        <img key={i} src={img.image} alt="review"
                                                            style={{ width: "90px", height: "90px", objectFit: "cover", borderRadius: "12px", cursor: "pointer", border: "2px solid #fff", boxShadow: "0 4px 12px rgba(0,0,0,0.05)", transition: "transform 0.2s" }}
                                                            onClick={() => window.open(img.image, "_blank")}
                                                            onMouseOver={e => e.currentTarget.style.transform = "scale(1.05)"}
                                                            onMouseOut={e => e.currentTarget.style.transform = "scale(1)"}
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

                    {/* RIGHT: SIDEBAR */}
                    <aside className="sidebar-area">
                        <div className="reservation-sidebar-card">
                            <Box sx={{ mb: 3 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                                    <Typography variant="h6" fontWeight="700" color="#0f172a" fontFamily="'Poppins',sans-serif">Reservation</Typography>
                                    <Chip
                                        icon={<Utensils size={13} />}
                                        label={restaurant.cuisine_type}
                                        size="small"
                                        sx={{ bgcolor: "rgba(99,102,241,0.1)", color: "#6366f1", fontWeight: 600 }}
                                    />
                                </div>
                                <div style={{ display: "flex", alignItems: "baseline", gap: "4px" }}>
                                    <span style={{ fontSize: "0.9rem", color: "#64748b", fontWeight: 500 }}>Avg. cost</span>
                                    <span style={{ fontSize: "1.8rem", fontWeight: 800, color: "#1e293b" }}>
                                        ₹{Number(restaurant.average_cost_for_two).toLocaleString()}
                                    </span>
                                    <span style={{ fontSize: "0.9rem", color: "#64748b" }}>/ slot</span>
                                </div>
                            </Box>
                            <Box sx={{ mb: 3, p: 2, background: "#fff9f2", borderRadius: "16px", border: "1px dashed #fbd38d" }}>
                                {restaurant.total_tables > 0 ? (
                                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                        <div style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#ed8936", animation: "pulse 2s infinite" }} />
                                        <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#c05621", letterSpacing: "0.02em" }}>
                                            HURRY! ONLY {restaurant.total_tables} TABLES LEFT
                                        </span>
                                    </div>
                                ) : (
                                    <span style={{ fontSize: "0.8rem", fontWeight: 700, color: "#e53e3e" }}>REGISTRATION CLOSED FOR NOW</span>
                                )}
                            </Box>
                            <Box sx={{ mb: 4, display: "flex", flexDirection: "column", gap: 1.5 }}>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#4ade80", marginTop: "6px", flexShrink: 0 }} />
                                    <Typography variant="body2" color="#475569">Amount deducted from your final bill.</Typography>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#f87171", marginTop: "6px", flexShrink: 0 }} />
                                    <Typography variant="body2" color="#475569">No refund for cancellations.</Typography>
                                </div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                    <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", marginTop: "6px", flexShrink: 0 }} />
                                    <Typography variant="body2" color="#475569">ServNex Verified Dining Property.</Typography>
                                </div>
                            </Box>


                            {/* ------------- */}

                            <button
                                onClick={() => setMenuOpen(true)}
                                style={{
                                    width: "100%",
                                    marginTop: "6px",
                                    marginBottom: "18px",
                                    padding: "14px",
                                    borderRadius: "14px",
                                    border: "1.5px solid #6366f1",
                                    background: "#fff",
                                    color: "#6366f1",
                                    fontFamily: "'Poppins', sans-serif",
                                    fontSize: "0.95rem",
                                    fontWeight: 600,
                                    cursor: "pointer",
                                    transition: "all 0.3s ease",
                                }}
                                onMouseEnter={e => {
                                    e.currentTarget.style.background = "#6366f1";
                                    e.currentTarget.style.color = "#fff";
                                }}
                                onMouseLeave={e => {
                                    e.currentTarget.style.background = "#fff";
                                    e.currentTarget.style.color = "#6366f1";
                                }}
                            >
                                View Menu
                            </button>

                            {/* ------------- */}

                            <button
                                className="reserve-main-btn"
                                onClick={handleOpenModal}
                                disabled={!restaurant.is_open}
                            >
                                {restaurant.is_open ? "Reserve a Table" : "Currently Closed"}
                            </button>
                        </div>
                        <Box sx={{ mt: 3, textAlign: "center", p: 2 }}>
                            <Typography variant="caption" color="text.secondary" sx={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 1, fontFamily: "'Poppins',sans-serif" }}>
                                <NotificationsIcon sx={{ fontSize: 16 }} />
                                Standard ServNex Booking Policy Applies
                            </Typography>
                        </Box>
                    </aside>
                </div>
            </div>

            {/* ══════════════════════════════════════════════════════════
                RESERVATION MODAL — redesigned with custom components
            ══════════════════════════════════════════════════════════ */}
            <Modal open={open} onClose={handleClose}>
                <div style={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: "min(480px, 94vw)",
                    outline: "none",
                    borderRadius: "28px",
                    overflow: "visible",
                    backgroundColor: "#fff",
                    backgroundImage: "linear-gradient(90deg,#6366f1 0%,#8b5cf6 50%,#a78bfa 100%)",
                    backgroundSize: "100% 6px",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "top",
                    boxShadow: "0 32px 80px rgba(0,0,0,0.14), 0 8px 24px rgba(99,102,241,0.08)",
                    fontFamily: "'Poppins', sans-serif",
                    animation: "modalIn 0.25s cubic-bezier(0.4,0,0.2,1)",
                }}>
                    {/* Close button */}
                    <button
                        onClick={handleClose}
                        style={{
                            position: "absolute", top: "18px", right: "20px",
                            zIndex: 10,
                            border: "none",
                            background: "#f1f5f9",
                            width: "32px", height: "32px",
                            minWidth: "32px", minHeight: "32px", padding: 0,
                            borderRadius: "50%",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            cursor: "pointer",
                            color: "#64748b",
                            transition: "all 0.2s ease"
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = "#fee2e2"; e.currentTarget.style.color = "#ef4444"; e.currentTarget.style.transform = "scale(1.08)"; }}
                        onMouseLeave={e => { e.currentTarget.style.background = "#f1f5f9"; e.currentTarget.style.color = "#64748b"; e.currentTarget.style.transform = "scale(1)"; }}
                    >
                        <X size={18} color="currentColor" strokeWidth={2} />
                    </button>

                    <div style={{ padding: "28px 32px 30px" }}>

                        {/* Modal header */}
                        <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "24px" }}>
                            <div style={{
                                width: "48px", height: "48px", borderRadius: "16px",
                                background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0, boxShadow: "0 8px 16px rgba(99,102,241,0.25)",
                            }}>
                                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 002-2V2" /><path d="M7 2v20" /><path d="M21 15V2a5 5 0 00-5 5v6c0 1.1.9 2 2 2h3z" />
                                </svg>
                            </div>
                            <div>
                                <div style={{ fontSize: "1.3rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                                    Reserve a Table
                                </div>


                                <div style={{ fontSize: "0.82rem", color: "#94a3b8", fontWeight: 400, marginTop: "3px" }}>
                                    Select your preferred date, time & party size
                                </div>
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ height: "1px", background: "linear-gradient(90deg,#f8fafc,#e2e8f0,#f8fafc)", marginBottom: "22px" }} />

                        {/* ── Date ── */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                <Calendar size={12} color="#6366f1" />
                                <span style={{ ...S.fieldLabel, marginBottom: 0 }}>Reservation Date</span>
                            </div>
                            {/* Custom calendar picker — replaces native input[type=date] */}
                            <CustomDatePicker
                                value={reservationDate}
                                onChange={setReservationDate}
                                min={new Date().toISOString().split("T")[0]}
                            />
                        </div>

                        {/* ── Time ── */}
                        <div style={{ marginBottom: "20px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                <Clock size={12} color="#6366f1" />
                                <span style={{ ...S.fieldLabel, marginBottom: 0 }}>Reservation Time</span>
                            </div>

                            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                {/* Hour */}
                                <CustomDropdown
                                    value={timeHour}
                                    onChange={setTimeHour}
                                    options={hourOptions}
                                    compact
                                />
                                <span style={{ fontSize: "1.4rem", fontWeight: 800, color: "#c7d2fe", flexShrink: 0, lineHeight: 1, userSelect: "none" }}>:</span>
                                {/* Minute */}
                                <CustomDropdown
                                    value={timeMinute}
                                    onChange={setTimeMinute}
                                    options={minuteOptions}
                                    compact
                                />
                                {/* AM/PM */}
                                <CustomDropdown
                                    value={timePeriod}
                                    onChange={setTimePeriod}
                                    options={periodOptions}
                                    compact
                                />
                            </div>

                            {/* Operating hours badge */}
                            {restaurant.opening_time && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "7px",
                                    marginTop: "10px", padding: "8px 12px",
                                    background: "linear-gradient(135deg,#f0fdf4,#dcfce7)",
                                    borderRadius: "10px", border: "1px solid #bbf7d0",
                                }}>
                                    <AccessTimeIcon sx={{ fontSize: "14px", color: "#16a34a" }} />
                                    <span style={{ fontSize: "0.76rem", fontWeight: 600, color: "#15803d", letterSpacing: "0.01em" }}>
                                        Open: {format12h(restaurant.opening_time)} — {format12h(restaurant.closing_time)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* ── Table Type ── */}
                        <div style={{ marginBottom: "28px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "10px" }}>
                                <Utensils size={12} color="#6366f1" />
                                <span style={{ ...S.fieldLabel, marginBottom: 0 }}>Select Table Type</span>
                            </div>

                            <CustomDropdown
                                value={tableCapacity}
                                onChange={(v) => setTableCapacity(parseInt(v))}
                                options={tableOptions}
                                icon={<Utensils size={15} />}
                            />

                            {/* Full warning */}
                            {availability[tableCapacity] === 0 && (
                                <div style={{
                                    display: "flex", alignItems: "center", gap: "7px",
                                    marginTop: "10px", padding: "8px 12px",
                                    background: "#fff1f2", borderRadius: "10px", border: "1px solid #fecdd3",
                                }}>
                                    <span style={{ fontSize: "0.77rem", fontWeight: 600, color: "#e11d48" }}>
                                        ⚠️ This table size is fully booked for the selected date.
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* CTA */}
                        <GradBtn onClick={handleReservation} fullWidth>
                            Continue to Reservation →
                        </GradBtn>

                        <p style={{
                            textAlign: "center", fontSize: "0.73rem", color: "#cbd5e1",
                            marginTop: "12px", marginBottom: 0,
                            display: "flex", alignItems: "center", justifyContent: "center", gap: "5px",
                        }}>
                            <CheckIcon style={{ fontSize: "13px", color: "#a3e635" }} />
                            Free cancellation up to 2 hours before your reservation
                        </p>
                    </div>
                </div>
            </Modal>

            {/* ══ REVIEW MODAL (unchanged) ══ */}
            <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)}>
                <Box sx={{
                    position: "absolute", top: "50%", left: "50%",
                    transform: "translate(-50%,-50%)",
                    width: { xs: "90%", sm: 440 },
                    bgcolor: "white", borderRadius: "24px",
                    overflow: "hidden", outline: "none",
                    boxShadow: "0 25px 60px rgba(0,0,0,0.12)",
                }}>
                    <div style={{ height: "4px", background: "linear-gradient(90deg,#6366f1,#8b5cf6)" }} />
                    <Box sx={{ p: 4 }}>
                        <Typography variant="h6" fontWeight="700" mb={0.5} sx={{ fontFamily: "'Poppins',sans-serif", color: "#0f172a" }}>
                            Rate Your Experience
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mb={3} sx={{ fontFamily: "'Poppins',sans-serif" }}>
                            How was your dining experience at {restaurant?.name}?
                        </Typography>
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 1, mb: 3 }}>
                            {[1, 2, 3, 4, 5].map(s => (
                                <IconButton key={s} onClick={() => setReviewRating(s)}>
                                    <StarIcon sx={{ fontSize: 38, color: s <= reviewRating ? "#f59e0b" : "#e2e8f0", transition: "color 0.2s" }} />
                                </IconButton>
                            ))}
                        </Box>
                        <textarea
                            placeholder="Write your review here..."
                            value={reviewComment}
                            onChange={e => setReviewComment(e.target.value)}
                            style={{
                                width: "100%", height: "100px", padding: "14px",
                                borderRadius: "14px", border: "1.5px solid #e2e8f0",
                                fontFamily: "'Poppins',sans-serif", fontSize: "0.9rem",
                                resize: "none", outline: "none", marginBottom: "16px",
                                color: "#334155", background: "#f8fafc", boxSizing: "border-box",
                            }}
                            onFocus={e => { e.target.style.borderColor = "#6366f1"; e.target.style.background = "#fff"; }}
                            onBlur={e => { e.target.style.borderColor = "#e2e8f0"; e.target.style.background = "#f8fafc"; }}
                        />
                        <div style={{ marginBottom: "24px" }}>
                            <span style={{ ...S.fieldLabel, marginBottom: "10px" }}>Add Photos (Optional)</span>
                            <input
                                type="file" multiple accept="image/*"
                                onChange={e => setReviewImages(e.target.files)}
                                style={{
                                    display: "block", width: "100%", padding: "10px 14px",
                                    border: "1.5px dashed #e2e8f0", borderRadius: "12px",
                                    background: "#f8fafc", cursor: "pointer", fontSize: "0.8rem", color: "#64748b",
                                }}
                            />
                            {reviewImages && reviewImages.length > 0 && (
                                <Typography variant="caption" sx={{ display: "block", mt: 1, color: "#6366f1", fontWeight: 500 }}>
                                    {reviewImages.length} file(s) selected
                                </Typography>
                            )}
                        </div>
                        <Button
                            fullWidth variant="contained"
                            onClick={handleReviewSubmit}
                            disabled={isSubmittingReview}
                            sx={{
                                py: 1.5, borderRadius: "14px", textTransform: "none",
                                fontWeight: 600, fontSize: "0.95rem",
                                background: "linear-gradient(135deg,#6366f1 0%,#8b5cf6 100%)",
                                boxShadow: "0 8px 20px rgba(99,102,241,0.25)",
                                fontFamily: "'Poppins',sans-serif",
                                "&:hover": { transform: "translateY(-1px)", boxShadow: "0 12px 28px rgba(99,102,241,0.35)" },
                            }}
                        >
                            {isSubmittingReview ? "Submitting…" : "Post Review"}
                        </Button>
                    </Box>
                </Box>
            </Modal>


            <Modal open={menuOpen} onClose={() => setMenuOpen(false)}>
                <Box
                    sx={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        width: { xs: "95%", sm: "85%", md: "70%" },
                        maxHeight: "90vh",
                        bgcolor: "#fff",
                        borderRadius: "24px",
                        boxShadow: "0 25px 60px rgba(0,0,0,0.25)",
                        overflow: "hidden",
                        outline: "none",
                        animation: "modalIn 0.25s ease",
                    }}
                >
                    {/* Close Button */}
                    <IconButton
                        onClick={() => setMenuOpen(false)}
                        sx={{
                            position: "absolute",
                            top: 12,
                            right: 12,
                            bgcolor: "rgba(0,0,0,0.4)",
                            color: "#fff",
                            "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                            zIndex: 2
                        }}
                    >
                        <IoClose size={22} />
                    </IconButton>

                    {/* Header */}
                    <Box
                        sx={{
                            p: 2,
                            textAlign: "center",
                            borderBottom: "1px solid #f1f5f9",
                            fontWeight: 700,
                            fontSize: "1.1rem",
                            color: "#0f172a"
                        }}
                    >
                        Restaurant Menu
                    </Box>

                    {/* Image Container */}
                    <Box
                        sx={{
                            maxHeight: "75vh",
                            overflowY: "auto",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            background: "#f8fafc",
                            p: 2
                        }}
                    >
                        <img
                            src={restaurant.menu_image || "https://via.placeholder.com/800x1200?text=Menu+Not+Available"}
                            alt="Menu"
                            style={{
                                width: "100%",
                                maxWidth: "700px",
                                borderRadius: "16px",
                                boxShadow: "0 10px 30px rgba(0,0,0,0.1)"
                            }}
                        />
                    </Box>
                </Box>
            </Modal>


        </div>
    );
}