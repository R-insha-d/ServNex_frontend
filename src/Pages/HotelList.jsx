import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapPin, Search, Filter, Globe, Bell, ChevronDown, ChevronUp, Check, LocateFixed, ChevronsRight } from "lucide-react";
import { Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import "./HotelList.css";

// ─── Custom Dropdown Component ───────────────────────────────────────────────
function CustomDropdown({ icon, options, value, onChange, placeholder, isLoading, loadingText }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    // Close when clicking outside
    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Close panel whenever loading starts (e.g. just clicked "Detect My Location")
    useEffect(() => {
        if (isLoading) setOpen(false);
    }, [isLoading]);

    const selectedLabel = isLoading
        ? (loadingText || "Loading...")
        : (options.find((o) => o.value === value)?.label || placeholder);

    return (
        <div className="custom-dd-root" ref={ref}>
            {/* Trigger */}
            <div
                className={`custom-dd-trigger ${open ? "custom-dd-trigger--open" : ""} ${isLoading ? "custom-dd-trigger--loading" : ""}`}
                onClick={() => !isLoading && setOpen((p) => !p)}
            >
                {icon && <span className="custom-dd-icon">{icon}</span>}
                <span className={`custom-dd-selected ${isLoading ? "custom-dd-selected--loading" : ""}`}>
                    {selectedLabel}
                </span>
                {!isLoading && (
                    <ChevronDown
                        size={18}
                        className={`custom-dd-chevron ${open ? "custom-dd-chevron--open" : ""}`}
                    />
                )}
            </div>

            {/* Panel */}
            {open && !isLoading && (
                <div className="custom-dd-panel">
                    <div className="custom-dd-list">
                        {options.map((opt) => (
                            <div
                                key={opt.value}
                                className={`custom-dd-option ${value === opt.value ? "custom-dd-option--selected" : ""}`}
                                onClick={() => {
                                    onChange(opt.value);
                                    setOpen(false);
                                }}
                            >
                                <span className="custom-dd-option-label">{opt.label}</span>
                                {value === opt.value && (
                                    <Check size={16} className="custom-dd-check" />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Highlight Text Component ────────────────────────────────────────────────
function HighlightText({ text, highlight }) {
    if (!highlight.trim()) {
        return <span>{text}</span>;
    }
    const regex = new RegExp(`(${highlight.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi");
    const parts = text.split(regex);

    return (
        <span>
            {parts.map((part, i) =>
                regex.test(part) ? (
                    <mark key={i} className="highlight">
                        {part}
                    </mark>
                ) : (
                    <span key={i}>{part}</span>
                )
            )}
        </span>
    );
}
// ─────────────────────────────────────────────────────────────────────────────

export default function HotelList() {
    const [hotelsData, setHotelsData] = useState([]);
    const [city, setCity] = useState("All");
    const [search, setSearch] = useState("");
    const [badgeFilter, setBadgeFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [coords, setCoords] = useState(null);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (search.length >= 2) {
                try {
                    const res = await AxiosInstance.get(`api/search/suggestions/?q=${search}`);
                    setSuggestions(res.data);
                    setShowSuggestions(true);
                } catch (err) {
                    console.error("Error fetching suggestions:", err);
                }
            } else {
                setSuggestions([]);
                setShowSuggestions(false);
            }
        };

        const timeoutId = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch hotels from Django - Unified Search
    useEffect(() => {
        // AbortController cancels the previous in-flight request
        // so a slow "all hotels" response never overwrites a faster location-filtered one
        const controller = new AbortController();

        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        // Always send city so backend fallback can filter by city name when coords yield 0 results
        if (city !== "All" && city !== "__locate__") params.append("city", city);
        if (coords?.lat && coords?.lng) {
            params.append("lat", coords.lat);
            params.append("lng", coords.lng);
        }
        params.append("type", "hotel");

        AxiosInstance
            .get(`api/search/?${params.toString()}`, { signal: controller.signal })
            .then((res) => setHotelsData(res.data))
            .catch((err) => {
                if (err.name !== "CanceledError" && err.code !== "ERR_CANCELED") {
                    console.error("Error fetching hotels:", err);
                }
                // Silently ignore aborted requests
            })
            .finally(() => setLoading(false));

        // Cleanup: abort on next effect run or unmount
        return () => controller.abort();
    }, [search, city, coords]);

    // Get user's current location and match to nearest city
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        setLocationLoading(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                setCoords({ lat: latitude, lng: longitude });
                try {
                    const res = await fetch(
                        `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`,
                        { headers: { "Accept-Language": "en" } }
                    );
                    const data = await res.json();
                    const detectedCity =
                        data.address?.city ||
                        data.address?.town ||
                        data.address?.village ||
                        data.address?.county ||
                        "";

                    const finalCity = detectedCity || "Current Location";
                    setCity(finalCity);
                    setLocationError("");
                } catch {
                    setLocationError("Failed to fetch location data. Try again.");
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                setLocationLoading(false);
                if (err.code === 1) {
                    setLocationError("Location permission denied.");
                } else {
                    setLocationError("Unable to retrieve your location.");
                }
            },
            { timeout: 10000 }
        );
    };

    // Filtering logic (Main search is now backend-driven, local filtering only for badge and city)
    const filteredHotels = useMemo(() => {
        return hotelsData.filter((hotel) => {
            const matchBadge =
                badgeFilter === "All" || hotel.badge === badgeFilter;

            const matchCity =
                city === "All" ||
                city === "__locate__" ||
                city === "Current Location" ||
                (hotel.city && hotel.city.toLowerCase() === city.toLowerCase());

            return matchBadge && matchCity;
        });
    }, [hotelsData, badgeFilter, city]);

    // Dynamic city dropdown options
    const uniqueCities = [
        ...new Set(hotelsData.map((h) => h.city).filter(Boolean)),
    ];

    const cityOptions = [
        { value: "All", label: "All Cities" },
        { 
            value: "__locate__", 
            label: (
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <LocateFixed size={16} color="#667eea" />
                    <span>Detect My Location</span>
                </div>
            )
        },
        ...(city !== "All" && city !== "__locate__" && !uniqueCities.includes(city)
            ? [{ 
                value: city, 
                label: (
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <MapPin size={16} color="#667eea" />
                        <span>{city}</span>
                    </div>
                )
            }]
            : []),
        ...uniqueCities.map((c) => ({ value: c, label: c })),
    ];

    const badgeOptions = [
        { value: "All", label: "All Property Types" },
        { value: "Luxury Stays", label: "Luxury Stays" },
        { value: "Cheap & Best", label: "Cheap & Best" },
        { value: "Dormitory", label: "Dormitory" },
    ];

    // Handle city dropdown change (preserves detect-location behavior)
    const handleCityChange = (val) => {
        if (val === "__locate__") {
            handleGetLocation();
        } else {
            setCity(val);
            setLocationError("");
            setCoords(null);
        }
    };

    // Badge styling logic
    const getBadgeInfo = (badge) => {
        switch (badge) {
            case "Luxury Stays":
                return { class: "badge-luxury", icon: "💎" };
            case "Cheap & Best":
                return { class: "badge-budget", icon: "💰" };
            case "Dormitory":
                return { class: "badge-dorm", icon: "🏠" };
            default:
                return { class: "badge-default", icon: "🏢" };
        }
    };

    // Calculate active filters count
    const activeFiltersCount = [
        city !== "All",
        search !== "",
        badgeFilter !== "All"
    ].filter(Boolean).length;

    return (
        <div className="hotel-list-page">
            {/* CUSTOM HEADER */}
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

            {/* FILTERS SECTION */}
            <div className="filters-container">
                <div className="container">
                    {/* Mobile Filter Toggle */}
                    <div
                        className="mobile-filter-toggle"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        <div className="filter-icon-box">
                            <Filter size={18} />
                        </div>
                        <span className="filter-toggle-text">Filters</span>
                        {activeFiltersCount > 0 && (
                            <span className="active-filter-count">{activeFiltersCount}</span>
                        )}
                        <div className="chevron-icon ms-auto">
                            {showFilters ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                    </div>

                    <div className={`filters-grid-wrapper ${showFilters ? 'expanded' : 'collapsed'}`}>
                        <div className="row g-3">
                            {/* City Dropdown */}
                            <div className="col-md-4">
                                <CustomDropdown
                                    icon={
                                        locationLoading ? (
                                            <span
                                                style={{
                                                    width: "18px",
                                                    height: "18px",
                                                    border: "2px solid #667eea",
                                                    borderTopColor: "transparent",
                                                    borderRadius: "50%",
                                                    display: "inline-block",
                                                    animation: "spin 0.7s linear infinite",
                                                }}
                                            />
                                        ) : (
                                            <Globe size={18} color="#667eea" />
                                        )
                                    }
                                    options={cityOptions}
                                    value={city}
                                    onChange={handleCityChange}
                                    placeholder="Select City"
                                    isLoading={locationLoading}
                                    loadingText="Detecting location..."
                                />
                                {locationError && (
                                    <p style={{ fontSize: "11px", color: "#e53e3e", margin: "4px 0 0 4px" }}>
                                        {locationError}
                                    </p>
                                )}
                            </div>

                            {/* Search Input */}
                            <div className="col-md-4">
                                <div className="filter-card">
                                    <Search size={18} color="#667eea" />
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Discover your perfect stay..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        onFocus={() => search.length >= 2 && setShowSuggestions(true)}
                                        onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                    />
                                    {showSuggestions && suggestions.length > 0 && (
                                        <div className="search-suggestions-dropdown">
                                            {suggestions.map((s, idx) => (
                                                <div
                                                    key={idx}
                                                    className="suggestion-item"
                                                    onClick={() => {
                                                        setSearch(s.value);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <span className="suggestion-type">{s.type === 'city' ? '📍' : s.type === 'hotel' ? '🏨' : '🍽️'}</span>
                                                    <span className="suggestion-label">{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badge/Property Type Dropdown */}
                            <div className="col-md-4">
                                <CustomDropdown
                                    icon={<Filter size={18} color="#667eea" />}
                                    options={badgeOptions}
                                    value={badgeFilter}
                                    onChange={setBadgeFilter}
                                    placeholder="All Property Types"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* CONTENT */}
            <main className="container py-5">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold fs-4 text-dark mb-1">Featured Hotels</h2>
                        <p className="text-muted small">Handpicked stays for your perfect trip</p>
                    </div>
                    <span className="badge bg-white shadow-sm text-dark border p-2 px-3 rounded-pill fw-normal">
                        <strong>{filteredHotels.length}</strong> stays found
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">
                            {coords ? `Finding hotels near ${city !== "All" ? city : "your location"}...` : "Finding best hotels for you..."}
                        </p>
                    </div>
                ) : hotelsData.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-4 mb-3">📍</div>
                        <h4 className="text-dark fw-bold">
                            {coords && city !== "All"
                                ? `No Hotels Found in "${city}"`
                                : "No hotels available right now"}
                        </h4>
                        <p className="text-muted">
                            {coords && city !== "All"
                                ? `We couldn't find any hotels within 50 km of ${city}. Try browsing all cities.`
                                : "Check back later for new listings."}
                        </p>
                        {coords && (
                            <button
                                className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4"
                                onClick={() => { setCity("All"); setCoords(null); }}
                            >
                                Browse All Cities
                            </button>
                        )}
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-4 mb-3">🔍</div>
                        <h4 className="text-dark fw-bold">
                            {coords && city !== "All"
                                ? `No Hotels Found in "${city}"`
                                : "No hotels match your search"}
                        </h4>
                        <p className="text-muted">
                            {coords && city !== "All"
                                ? `We couldn't find any hotels matching your filters near ${city}.`
                                : "Try adjusting your filters or search terms."}
                        </p>
                        <button
                            className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4"
                            onClick={() => { setCity("All"); setSearch(""); setBadgeFilter("All"); setCoords(null); }}
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-5">
                        {filteredHotels.map((hotel) => {
                            const badgeInfo = getBadgeInfo(hotel.badge);
                            return (
                                <div
                                    key={hotel.id}
                                    className="hotel-card"
                                >
                                    <div className="row g-0">
                                        {/* IMAGE */}
                                        <div className="col-lg-4 col-md-5 hotel-image-wrapper">
                                            <img
                                                src={
                                                    hotel.image ||
                                                    "https://via.placeholder.com/600x450?text=Premium+Hotel"
                                                }
                                                alt={hotel.name}
                                                className="w-100 object-fit-cover hotel-image"
                                            />
                                            <div className={`hotel-type-badge ${badgeInfo.class}`}>
                                                {badgeInfo.icon} {hotel.badge}
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="col-lg-8 col-md-7">
                                            <div className="card-body p-4 d-flex flex-column h-100">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h3 className="hotel-title fs-5">
                                                        <HighlightText text={hotel.name} highlight={search} />
                                                    </h3>
                                                    {hotel.rating && (
                                                        <div className="rating-pill">
                                                            <span>★</span> {hotel.rating}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="hotel-location mb-3">
                                                    <MapPin size={16} />
                                                    <HighlightText text={`${hotel.area}, ${hotel.city}`} highlight={search} />
                                                </div>

                                                {/* DESCRIPTION */}
                                                <p
                                                    className="hotel-description small flex-grow-1"
                                                    style={{
                                                        display: "-webkit-box",
                                                        WebkitLineClamp: 3,
                                                        lineClamp: 3,
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    <HighlightText text={hotel.description.slice(0, 235)} highlight={search} />...
                                                </p>

                                                {/* PRICE + BUTTON */}
                                                <div className="d-flex justify-content-between align-items-end mt-4 pt-3 border-top">
                                                    <div className="price-container">
                                                        <span className="price-label">Price per night</span>
                                                        <div className="d-flex align-items-baseline gap-2">
                                                            <span className="price-value fs-5">
                                                                ₹{Number(hotel.price).toLocaleString()}
                                                            </span>
                                                            {hotel.old_price && (
                                                                <span className="old-price fs-5">
                                                                    ₹{Number(hotel.old_price).toLocaleString()}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <Link
                                                        to={`/hotel/${hotel.id}`}
                                                        className="explore-btns"
                                                    >
                                                        <span className="d-flex align-items-center gap-1">See Details <ChevronsRight size={18} /></span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}