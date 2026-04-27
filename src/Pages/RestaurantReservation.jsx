import React, { useState, useEffect, useRef } from "react";
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
    ChevronLeft,
    ChevronsRight,
    Users,
    Calendar,
    Tag,
    Utensils
} from "lucide-react";
import StarIcon from "@mui/icons-material/Star";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import AxiosInstance from "../Component/AxiosInstance";
import { toast } from "react-toastify";
import Header from "../Component/Header";

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
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "40px 15px",
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
        color: "#6366f1",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.08em",
        marginBottom: "10px",
        display: "flex",
        alignItems: "center",
        gap: "6px",
    },
    input: {
        width: "100%",
        height: "50px",
        padding: "0 16px",
        borderRadius: "14px",
        border: "1.5px solid #e2e8f0",
        backgroundColor: "#f8fafc",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "0.95rem",
        fontWeight: 600,
        color: "#0f172a",
        outline: "none",
        transition: "all 0.2s ease",
        boxSizing: "border-box",
        cursor: "pointer",
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

// ─── Custom Date Picker ────────────────────────────────────────────────────────
function CustomDatePicker({ value, onChange, minDate }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const today = new Date();
    const minD = minDate ? new Date(minDate) : today;

    const parseDate = (str) => {
        if (!str) return null;
        const [y, m, d] = str.split("-").map(Number);
        return new Date(y, m - 1, d);
    };

    const selected = parseDate(value);
    const [viewYear, setViewYear] = useState(selected ? selected.getFullYear() : today.getFullYear());
    const [viewMonth, setViewMonth] = useState(selected ? selected.getMonth() : today.getMonth());

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"];
    const dayNames = ["SU", "MO", "TU", "WE", "TH", "FR", "SA"];

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);

    const isDisabled = (d) => {
        const dt = new Date(viewYear, viewMonth, d);
        dt.setHours(0, 0, 0, 0);
        const mn = new Date(minD);
        mn.setHours(0, 0, 0, 0);
        return dt < mn;
    };

    const isSelected = (d) => {
        if (!selected) return false;
        return selected.getFullYear() === viewYear && selected.getMonth() === viewMonth && selected.getDate() === d;
    };

    const isToday = (d) => {
        return today.getFullYear() === viewYear && today.getMonth() === viewMonth && today.getDate() === d;
    };

    const handleSelect = (d) => {
        if (!d || isDisabled(d)) return;
        const mm = String(viewMonth + 1).padStart(2, "0");
        const dd = String(d).padStart(2, "0");
        onChange(`${viewYear}-${mm}-${dd}`);
        setOpen(false);
    };

    const handlePrev = () => {
        if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
        else setViewMonth(m => m - 1);
    };

    const handleNext = () => {
        if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
        else setViewMonth(m => m + 1);
    };

    const formatDisplay = () => {
        if (!value) return "Select Date";
        const d = parseDate(value);
        return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();
    };

    const goToToday = () => {
        setViewYear(today.getFullYear());
        setViewMonth(today.getMonth());
        const mm = String(today.getMonth() + 1).padStart(2, "0");
        const dd = String(today.getDate()).padStart(2, "0");
        onChange(`${today.getFullYear()}-${mm}-${dd}`);
        setOpen(false);
    };

    const handleClear = () => { onChange(""); setOpen(false); };

    return (
        <div ref={ref} style={{ position: "relative", width: "100%" }}>
            {/* Trigger */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: "52px", padding: "0 16px",
                    borderRadius: "14px",
                    border: open ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                    backgroundColor: open ? "#fff" : "#f8fafc",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "0.95rem", fontWeight: 600, color: "#0f172a",
                    cursor: "pointer", boxSizing: "border-box",
                    boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Calendar size={16} color="#6366f1" />
                    <span>{formatDisplay()}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <path d="M4 6l4 4 4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>

            {/* Dropdown Calendar */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 999,
                    background: "#fff", borderRadius: "20px",
                    border: "1.5px solid #e8eaf6",
                    boxShadow: "0 20px 60px rgba(99,102,241,0.12), 0 4px 20px rgba(0,0,0,0.06)",
                    padding: "20px", minWidth: "300px", width: "100%", boxSizing: "border-box",
                    fontFamily: "'Poppins', sans-serif",
                }}>
                    {/* Month Navigation */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                        <button onClick={handlePrev} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.2s" }}>
                            <ChevronLeftIcon sx={{ color: "#64748b", fontSize: 20 }} />
                        </button>
                        <span style={{ fontWeight: 600, fontSize: "1rem", color: "#0f172a" }}>{monthNames[viewMonth]} {viewYear}</span>
                        <button onClick={handleNext} style={{ background: "#f1f5f9", border: "none", borderRadius: "10px", width: "32px", height: "32px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", transition: "all 0.2s" }}>
                            <ChevronRightIcon sx={{ color: "#64748b", fontSize: 20 }} />
                        </button>
                    </div>

                    {/* Day Headers */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "8px" }}>
                        {dayNames.map(d => (
                            <div key={d} style={{ textAlign: "center", fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", padding: "4px 0" }}>{d}</div>
                        ))}
                    </div>

                    {/* Date Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px" }}>
                        {cells.map((d, i) => {
                            if (!d) return <div key={`empty-${i}`} />;
                            const disabled = isDisabled(d);
                            const sel = isSelected(d);
                            const tod = isToday(d);
                            return (
                                <div
                                    key={d}
                                    onClick={() => handleSelect(d)}
                                    style={{
                                        textAlign: "center", padding: "8px 4px",
                                        borderRadius: "10px", fontSize: "0.875rem", fontWeight: sel ? 700 : 500,
                                        cursor: disabled ? "not-allowed" : "pointer",
                                        background: sel ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : tod && !sel ? "rgba(99,102,241,0.08)" : "transparent",
                                        color: sel ? "#fff" : disabled ? "#cbd5e1" : tod ? "#6366f1" : "#0f172a",
                                        transition: "all 0.15s ease",
                                        userSelect: "none",
                                    }}
                                    onMouseEnter={e => { if (!disabled && !sel) e.currentTarget.style.background = "rgba(99,102,241,0.1)"; }}
                                    onMouseLeave={e => { if (!disabled && !sel) e.currentTarget.style.background = tod ? "rgba(99,102,241,0.08)" : "transparent"; }}
                                >
                                    {d}
                                </div>
                            );
                        })}
                    </div>

                    {/* Footer */}
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", paddingTop: "12px", borderTop: "1px solid #f1f5f9" }}>
                        <button onClick={handleClear} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Poppins', sans-serif", padding: "4px 8px", borderRadius: "8px" }}>
                            CLEAR
                        </button>
                        <button onClick={goToToday} style={{ background: "none", border: "none", color: "#6366f1", fontWeight: 600, fontSize: "0.85rem", cursor: "pointer", fontFamily: "'Poppins', sans-serif", padding: "4px 8px", borderRadius: "8px" }}>
                            TODAY
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}


// ─── Custom Time Picker ────────────────────────────────────────────────────────
function CustomTimePicker({ value, onChange, date }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    const parseTime = (str) => {
        if (!str) return { h: 12, m: 0, period: "PM" };
        const [hStr, mStr] = str.split(":");
        let h = parseInt(hStr, 10);
        const m = parseInt(mStr, 10);
        const period = h >= 12 ? "PM" : "AM";
        if (h > 12) h -= 12;
        if (h === 0) h = 12;
        return { h, m, period };
    };

    const { h: initH, m: initM, period: initP } = parseTime(value);
    const [hour, setHour] = useState(initH);
    const [minute, setMinute] = useState(initM);
    const [period, setPeriod] = useState(initP);

    useEffect(() => {
        function handleClickOutside(e) {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    const emitChange = (h, m, p) => {
        let h24 = h;
        if (p === "AM" && h === 12) h24 = 0;
        if (p === "PM" && h !== 12) h24 = h + 12;
        onChange(`${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    };

    const handleHour = (h) => { setHour(h); emitChange(h, minute, period); };
    const handleMinute = (m) => { setMinute(m); emitChange(hour, m, period); };
    const handlePeriod = (p) => { setPeriod(p); emitChange(hour, minute, p); };

    const formatDisplay = () => {
        if (!value) return "Select Time";
        return `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`;
    };

    const hours = Array.from({ length: 12 }, (_, i) => i + 1);
    const minutes = Array.from({ length: 60 }, (_, i) => i);

    return (
        <div ref={ref} style={{ position: "relative", width: "100%" }}>
            {/* Trigger */}
            <div
                onClick={() => setOpen(o => !o)}
                style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    height: "52px", padding: "0 16px",
                    borderRadius: "14px",
                    border: open ? "2px solid #6366f1" : "1.5px solid #e2e8f0",
                    backgroundColor: open ? "#fff" : "#f8fafc",
                    fontFamily: "'Poppins', sans-serif",
                    fontSize: "0.95rem", fontWeight: 600, color: "#0f172a",
                    cursor: "pointer", boxSizing: "border-box",
                    boxShadow: open ? "0 0 0 3px rgba(99,102,241,0.12)" : "none",
                    transition: "all 0.2s ease",
                    userSelect: "none",
                }}
            >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Clock size={16} color="#6366f1" />
                    <span>{formatDisplay()}</span>
                </div>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <path d="M4 6l4 4 4-4" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>


            {/* Dropdown Time Picker */}
            {open && (
                <div style={{
                    position: "absolute", top: "calc(100% + 8px)", left: 0, zIndex: 999,
                    background: "#fff", borderRadius: "20px",
                    border: "1.5px solid #e8eaf6",
                    boxShadow: "0 20px 60px rgba(99,102,241,0.12), 0 4px 20px rgba(0,0,0,0.06)",
                    padding: "20px", minWidth: "280px", width: "100%", boxSizing: "border-box",
                    fontFamily: "'Poppins', sans-serif",
                }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "16px" }}>
                        <Clock size={16} color="#6366f1" />
                        <span style={{ fontWeight: 600, fontSize: "0.95rem", color: "#0f172a" }}>Select Time</span>
                    </div>

                    <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        {/* Hours */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textAlign: "center", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Hour</div>
                            <div style={{ maxHeight: "180px", overflowY: "auto", borderRadius: "12px", border: "1px solid #f1f5f9", scrollbarWidth: "thin" }}>
                                {hours.map(h => {
                                    const isToday = date === new Date().toLocaleDateString('en-CA');
                                    const h24 = period === "PM" ? (h === 12 ? 12 : h + 12) : (h === 12 ? 0 : h);
                                    const now = new Date();
                                    const isPastHour = isToday && h24 < now.getHours();

                                    return (
                                        <div
                                            key={h}
                                            onClick={() => !isPastHour && handleHour(h)}
                                            style={{
                                                padding: "8px 12px", textAlign: "center", cursor: isPastHour ? "not-allowed" : "pointer",
                                                fontSize: "0.9rem", fontWeight: h === hour ? 700 : 500,
                                                background: h === hour ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                                                color: isPastHour ? "#cbd5e1" : (h === hour ? "#fff" : "#374151"),
                                                borderRadius: h === hour ? "8px" : "0",
                                                margin: h === hour ? "2px 4px" : "0",
                                                transition: "all 0.15s",
                                                opacity: isPastHour ? 0.6 : 1
                                            }}
                                            onMouseEnter={e => { if (h !== hour && !isPastHour) e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
                                            onMouseLeave={e => { if (h !== hour && !isPastHour) e.currentTarget.style.background = "transparent"; }}
                                        >
                                            {String(h).padStart(2, "0")}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", paddingTop: "44px", color: "#6366f1", fontWeight: 700, fontSize: "1.2rem" }}>:</div>

                        {/* Minutes */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "0.72rem", fontWeight: 600, color: "#94a3b8", textAlign: "center", marginBottom: "8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Min</div>
                            <div style={{ maxHeight: "180px", overflowY: "auto", borderRadius: "12px", border: "1px solid #f1f5f9", scrollbarWidth: "thin" }}>
                                {minutes.map(m => {
                                    const isToday = date === new Date().toLocaleDateString('en-CA');
                                    const h24 = period === "PM" ? (hour === 12 ? 12 : hour + 12) : (hour === 12 ? 0 : hour);
                                    const now = new Date();
                                    const isPastMin = isToday && h24 === now.getHours() && m < now.getMinutes();

                                    return (
                                        <div
                                            key={m}
                                            onClick={() => !isPastMin && handleMinute(m)}
                                            style={{
                                                padding: "8px 12px", textAlign: "center", cursor: isPastMin ? "not-allowed" : "pointer",
                                                fontSize: "0.9rem", fontWeight: m === minute ? 700 : 500,
                                                background: m === minute ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent",
                                                color: isPastMin ? "#cbd5e1" : (m === minute ? "#fff" : "#374151"),
                                                borderRadius: m === minute ? "8px" : "0",
                                                margin: m === minute ? "2px 4px" : "0",
                                                transition: "all 0.15s",
                                                opacity: isPastMin ? 0.6 : 1
                                            }}
                                            onMouseEnter={e => { if (m !== minute && !isPastMin) e.currentTarget.style.background = "rgba(99,102,241,0.08)"; }}
                                            onMouseLeave={e => { if (m !== minute && !isPastMin) e.currentTarget.style.background = "transparent"; }}
                                        >
                                            {String(m).padStart(2, "0")}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* AM / PM */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingTop: "30px" }}>
                            {["AM", "PM"].map(p => {
                                const isToday = date === new Date().toLocaleDateString('en-CA');
                                const now = new Date();
                                const isPastPeriod = isToday && p === "AM" && now.getHours() >= 12;

                                return (
                                    <div
                                        key={p}
                                        onClick={() => !isPastPeriod && handlePeriod(p)}
                                        style={{
                                            padding: "10px 14px", borderRadius: "12px", cursor: isPastPeriod ? "not-allowed" : "pointer",
                                            fontWeight: 700, fontSize: "0.85rem",
                                            background: period === p ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#f8fafc",
                                            color: isPastPeriod ? "#cbd5e1" : (period === p ? "#fff" : "#64748b"),
                                            border: period === p ? "none" : "1px solid #e2e8f0",
                                            transition: "all 0.2s",
                                            userSelect: "none",
                                            opacity: isPastPeriod ? 0.6 : 1
                                        }}
                                    >
                                        {p}
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Done */}
                    <button
                        onClick={() => setOpen(false)}
                        style={{
                            marginTop: "16px", width: "100%", padding: "10px",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            color: "#fff", border: "none", borderRadius: "12px",
                            fontFamily: "'Poppins', sans-serif", fontWeight: 600, fontSize: "0.9rem",
                            cursor: "pointer", transition: "opacity 0.2s",
                        }}
                    >
                        Done
                    </button>
                </div>
            )}
        </div>
    );
}




// ─── Animated Icons ────────────────────────────────────────────────────────────
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

// ─── Main Component ────────────────────────────────────────────────────────────
export default function RestaurantReservation() {
    const { id } = useParams();
    const location = useLocation();
    const navigate = useNavigate();

    const { reservationDate, reservationTime, tableCapacity: passedTableCapacity, restaurant: passedRestaurant } = location.state || {};

    const [restaurant, setRestaurant] = useState(passedRestaurant || null);
    const [loading, setLoading] = useState(!passedRestaurant);

    const [date, setDate] = useState(reservationDate || "");
    const [time, setTime] = useState(reservationTime || "");
    // const [selectedTable, setSelectedTable] = useState(passedTableCapacity || 4);
    const [tableSelection, setTableSelection] = useState({
  2: 0,
  4: 0,
  6: 0,
  8: 0,
  10: 0
});

const totalSeats = Object.entries(tableSelection)
  .reduce((sum, [cap, count]) => sum + cap * count, 0);

  const handleIncrement = (cap) => {
    const currentTotal = totalSeats;

    if (currentTotal + cap > 30) {
        toast.warning("⚠️ You can only select up to 30 seats");
        return;
    }

    // if (availability[cap] && tableSelection[cap] < availability[cap]) {
    if (availability[String(cap)] && tableSelection[cap] < availability[String(cap)]){
        setTableSelection(prev => ({
            ...prev,
            [cap]: prev[cap] + 1
        }));
    }
};

const handleDecrement = (cap) => {
    if (tableSelection[cap] > 0) {
        setTableSelection(prev => ({
            ...prev,
            [cap]: prev[cap] - 1
        }));
    }
};


    const [specialRequests, setSpecialRequests] = useState("");
    const [error, setError] = useState(null);
    const [showErrorModal, setShowErrorModal] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [isReserving, setIsReserving] = useState(false);
    const [newResvId, setNewResvId] = useState(null);
    const [resvDetails, setResvDetails] = useState(null);
    const [availability, setAvailability] = useState({});

    const isMobile = useMediaQuery("(max-width:768px)");
    const [hasBaby, setHasBaby] = useState(false);

    // const subtotal = restaurant ? (Number(restaurant.average_cost_for_two) || 0) * (selectedTable / 2) : 0;
    const subtotal = restaurant
  ? Object.entries(tableSelection).reduce((sum, [cap, count]) => {
        return sum + (Number(restaurant.average_cost_for_two) || 0) * (cap / 2) * count;
    }, 0)
  : 0;

    const convenienceFee = subtotal * 0.05;
    const totalCost = subtotal + convenienceFee;

    useEffect(() => {
        // [REMOVED] Guests cap by table capacity as guest count is removed
    }, [totalSeats]);

    useEffect(() => {
        if (!restaurant) {
            AxiosInstance.get(`api/restaurants/${id}/`)
                .then(res => { setRestaurant(res.data); setLoading(false); })
                .catch(() => setLoading(false));
        }
    }, [id, restaurant]);

    // useEffect(() => {
    //     if (date && restaurant) {
    //         AxiosInstance.get(`api/restaurants/${id}/availability/?date=${date}`)
    //             .then(res => setAvailability(res.data))
                
    //             .catch(() => { });
    //     }
    // }, [date, restaurant, id]);

    useEffect(() => {
    if (date && restaurant) {
        AxiosInstance.get(`api/restaurants/${id}/availability/?date=${date}`)
            .then(res => {
                console.log("AVAILABILITY DATA 👉", res.data); // 👈 ADD THIS
                setAvailability(res.data);
            })
            .catch(() => { });
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
    if (!date || !time) { 
        setError("Please select reservation date and time."); 
        setShowErrorModal(true); 
        return; 
    }
    
    const selected = new Date(`${date}T${time}`);
    if (selected < new Date(new Date().getTime() - 1 * 60 * 1000)) {
        setError("❌ Booking is only available for future dates and times.");
        setShowErrorModal(true);
        return;
    }

    if (totalSeats === 0) {
        setError("⚠️ Please select at least one table.");
        setShowErrorModal(true);
        return;
    }

    // ✅ NEW: Validate cost calculation
    if (totalCost === 0 || isNaN(totalCost)) {
        setError("⚠️ Unable to calculate booking cost. Please refresh and try again.");
        setShowErrorModal(true);
        return;
    }

    setIsReserving(true);
    setError(null);

    try {
        // ✅ FIXED: Send table_selection as expected by backend
        const resResponse = await AxiosInstance.post("api/reservations/", { 
            restaurant: restaurant.id, 
            reservation_date: date, 
            reservation_time: time, 
            special_requests: specialRequests,
            has_baby: hasBaby,
            table_selection: tableSelection,  // ✅ This is the key fix
            total_seats: totalSeats,
            number_of_guests: totalSeats,
        });
        
        const reservationId = resResponse.data.id;
        const orderRes = await AxiosInstance.post("api/razorpay/order/", { 
            amount: totalCost, 
            booking_type: 'restaurant', 
            booking_id: reservationId 
        });
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
                    await AxiosInstance.post("api/razorpay/verify/", { 
                        razorpay_order_id: response.razorpay_order_id, 
                        razorpay_payment_id: response.razorpay_payment_id, 
                        razorpay_signature: response.razorpay_signature 
                    });
                    setNewResvId(reservationId);
                    setResvDetails(resResponse.data);
                    toast.success("Payment Successful! Reservation Confirmed.");
                    setShowSuccessModal(true);
                } catch (err) { 
                    toast.error("Payment verification failed. Please contact support."); 
                }
            },
            theme: { color: "#6366f1" },
            modal: {
                ondismiss: async function () {
                    try {
                        await AxiosInstance.post("api/razorpay/failure/", { 
                            razorpay_order_id: order.id, 
                            error_description: "Payment was cancelled by the user." 
                        });
                    } catch (err) { 
                        console.error("Failed to report cancellation:", err); 
                    }
                }
            }
        };

        const rzp = new window.Razorpay(options);
        rzp.on('payment.failed', async function (response) {
            toast.error(`Payment failed: ${response.error.description}`);
            try {
                await AxiosInstance.post("api/razorpay/failure/", { 
                    razorpay_order_id: order.id, 
                    error_description: response.error.description 
                });
            } catch (err) { 
                console.error("Failed to report failure:", err); 
            }
        });
        rzp.open();

    } catch (err) {
        let msg = "Reservation failed. Please try again.";
        if (err.response && err.response.data) {
            const data = err.response.data;
            if (data.non_field_errors) msg = data.non_field_errors[0];
            else if (data.detail) msg = data.detail;
            else if (typeof data === 'object') {
                const fieldVal = Object.values(data)[0];
                msg = Array.isArray(fieldVal) ? fieldVal[0] : JSON.stringify(data);
            }
        }
        setError(msg);
        setShowErrorModal(true);
    } finally { 
        setIsReserving(false); 
    }
};

    const handleDownloadReceipt = () => {
        if (!resvDetails) return;
        const printWindow = window.open('', '_blank');
        const content = `<html><head><title>Reservation Receipt - ${restaurant.name}</title><style>body { font-family: 'Poppins', sans-serif; padding: 40px; color: #333; }.header { border-bottom: 2px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; }.details { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }.item { margin-bottom: 15px; }.label { font-weight: bold; color: #666; font-size: 0.9rem; text-transform: uppercase; }.val { font-size: 1.1rem; margin-top: 5px; }.total { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; text-align: right; }.price { font-size: 2rem; color: #6366f1; font-weight: bold; }</style></head><body><div class="header"><h1>ServNex Restaurants</h1><p>Table Reservation Confirmation</p></div><div class="details"><div class="item"><div class="label">Restaurant</div><div class="val">${restaurant.name}</div></div><div class="item"><div class="label">Reservation ID</div><div class="val">#SNX-RES-${resvDetails.id}</div></div><div class="item"><div class="label">Date</div><div class="val">${date}</div></div><div class="item"><div class="label">Time</div><div class="val">${time}</div></div><div class="item"><div class="label">Capacity</div><div class="val">${totalSeats} Seater</div></div><div class="item"><div class="label">Location</div><div class="val">${restaurant.area}, ${restaurant.city}</div></div></div><div class="total"><div class="label">Amount Paid</div><div class="price">₹${totalCost.toLocaleString()}</div></div><p style="margin-top: 50px; font-size: 0.8rem; color: #888;">Thank you for booking with ServNex. Please present this receipt at the restaurant.</p></body></html>`;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div style={S.page}>
            <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            <style>{`
                .counter-btn:hover { background: #6366f1 !important; color: white !important; border-color: #6366f1 !important; transform: scale(1.05); }
                .booking-input:focus { border-color: #6366f1 !important; background: white !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.1) !important; }
                .premium-btn { display: inline-flex; align-items: center; justify-content: center; width: 100%; height: 3.5em; border-radius: 30em; font-size: 15px; font-family: inherit; text-decoration: none; border: none; position: relative; overflow: hidden; cursor: pointer; color: #1e293b; background: white; box-shadow: 4px 4px 10px #e2e8f0, -4px -4px 10px #ffffff; transition: all 0.3s ease; font-weight: 500; }
                .premium-btn::before { content: ''; position: absolute; inset: 0; border-radius: 30em; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); transform: scaleX(0); transform-origin: left; transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1); z-index: 0; }
                .premium-btn:hover::before { transform: scaleX(1); }
                .premium-btn:hover { color: white; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(99, 102, 241, 0.2); }
                .premium-btn span { position: relative; z-index: 1; transition: color 0.3s ease; display: flex; align-items: center; gap: 8px; }
                .premium-btn:hover span { color: white; }
                @keyframes scaleUp { from { transform: scale(0); opacity: 0; } to { transform: scale(1); opacity: 1; } }
                .animate-scale { animation: scaleUp 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) forwards; }
                .table-type-card { transition: all 0.2s ease; }
                .table-type-card:hover:not(.disabled) { transform: translateY(-4px); border-color: #6366f1 !important; box-shadow: 0 10px 20px rgba(99, 102, 241, 0.1); }
                .table-type-card.active { border-color: #6366f1 !important; background: #f5f3ff !important; box-shadow: 0 4px 12px rgba(99, 102, 241, 0.12) !important; }
                .table-type-card.disabled { opacity: 0.5; cursor: not-allowed; filter: grayscale(1); }
            `}</style>

            <Header />

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

                        {/* ── Reservation Details with Custom Pickers ── */}
                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Calendar size={20} color="#6366f1" /> Reservation Details</div>
                            <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "24px" }}>
                                <div>
                                    <span style={S.formLabel}>
                                        <Calendar size={13} color="#6366f1" /> Reservation Date
                                    </span>
                                    <CustomDatePicker
                                        value={date}
                                        onChange={setDate}
                                        minDate={new Date().toLocaleDateString('en-CA')}
                                    />
                                </div>
                                <div>
                                    <span style={S.formLabel}>
                                        <Clock size={13} color="#6366f1" /> Time
                                    </span>
                                    <CustomTimePicker
                                        value={time}
                                        onChange={setTime}
                                        date={date}
                                    />
                                </div>
                            </div>
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Utensils size={20} color="#6366f1" /> Select Table Type</div>
                           <div style={{ display: "grid",
                                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                                gap: isMobile ? "16px" : "24px",
                                width: "100%"}}>
    {[2, 4, 6, 8, 10].map(cap => {
    const count = tableSelection[cap];
    // const isAvailable = availability[cap] > 0;
    const isAvailable = Number(availability[String(cap)]) > 0;

    return (
        <div
            key={cap}
            className={`table-type-card ${!isAvailable ? 'disabled' : ''}`}
            style={{
                padding: "20px 10px",
                borderRadius: "20px",
                border: "1.5px solid #e2e8f0",
                background: "#fff",
                textAlign: "center",
                opacity: !isAvailable ? 0.5 : 1
            }}
        >
            <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "14px",
                background: "#f1f5f9",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#6366f1",
                margin: "0 auto 8px"
            }}>
                <Utensils size={24} />
            </div>

            <div style={{ fontWeight: 700 }}>{cap}-Seater</div>

            <div style={{
                fontSize: "0.75rem",
                fontWeight: 600,
                color: isAvailable ? "#10b981" : "#ef4444"
            }}>
                {/* {isAvailable ? `${availability[cap]} Available` : "Full"} */}
                {isAvailable ? `${availability[String(cap)]} Available` : "Full"}
            </div>

            {/* Counter */}
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "10px",
                marginTop: "10px"
            }}>
                <button
                    onClick={() => handleDecrement(cap)}
                    disabled={count === 0}
                    className="counter-btn"
                    style={{width:"40px",padding:"10px",borderRadius:"50%",marginRight:"25px"}}
                >
                    <Minus size={14} />
                </button>

                <span style={{ fontWeight: 600 }}>{count}</span>

                <button
                    onClick={() => handleIncrement(cap)}
                    disabled={!isAvailable}
                    className="counter-btn"
                    style={{width:"40px",padding:"10px",borderRadius:"50%",marginLeft:"25px"}}
                >
                    <Plus size={14} />
                </button>
            </div>

            {count > 0 && (
                <div style={{
                    marginTop: "6px",
                    fontSize: "0.8rem",
                    color: "#6366f1",
                    fontWeight: 600
                }}>
                    {cap}-Seater × {count}
                </div>
            )}
        </div>
    );
})}
</div>

                            {/* [REMOVED] Number of Tables counter as only single table is supported */}
                        </div>

                        <div style={S.sectionCard}>
                            <div style={S.sectionTitle}><Info size={20} color="#6366f1" /> Special Requests</div>
                            <textarea
                                style={{ ...S.input, height: "120px", padding: "16px", resize: "none", cursor: "text", fontWeight: 500 }}
                                className="booking-input"
                                placeholder="Any dietary restrictions, special occasions, seating preferences, etc."
                                value={specialRequests}
                                onChange={e => setSpecialRequests(e.target.value)}
                            />


                            <div style={{ marginTop: "16px" }}>
        <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
            <input
                type="checkbox"
                checked={hasBaby}
                onChange={(e) => setHasBaby(e.target.checked)}
                style={{ width: "18px", height: "18px", cursor: "pointer" }}
            />
            <span style={{ fontWeight: 500 }}>Are you bringing a baby?</span>
        </label>
    </div>




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
                                {/* <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Table Type ({selectedTable}-Seater)</span>
                                    <span style={{ fontWeight: 600 }}>Confirmed</span>
                                </div> */}

                                <div style={S.priceRow}>
    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Tables</span>
    <span style={{ fontWeight: 600 }}>
        {Object.entries(tableSelection)
            .filter(([_, count]) => count > 0)
            .map(([cap, count]) => `${cap}×${count}`)
            .join(", ") || "None"}
    </span>
</div>
                                <div style={S.priceRow}>
                                    <span style={{ color: "#64748b", fontSize: "0.95rem" }}>Reservation Fee ({totalSeats}-Seater)</span>
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
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
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