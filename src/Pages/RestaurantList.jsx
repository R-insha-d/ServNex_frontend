import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapPin, ArrowRight, Search, Filter, Globe, Bell, UtensilsCrossed, ChevronDown, ChevronUp, Check, LocateFixed, ChevronsRight } from "lucide-react";
import { TbCurrentLocation } from "react-icons/tb";
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

export default function RestaurantList() {
    const [restaurantsData, setRestaurantsData] = useState([]);
    const [city, setCity] = useState("All");
    const [search, setSearch] = useState("");
    const [badgeFilter, setBadgeFilter] = useState("All");
    const [cuisineFilter, setCuisineFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    // Fetch search suggestions
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (search.length >= 2) {
                try {
                    const res = await AxiosInstance.get(`api/search/suggestions/?q=${search}&type=restaurant`);
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

    // Fetch restaurants from Django - Unified Search
    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        if (city !== "All") params.append("city", city);
        if (coords.lat && coords.lng) {
            params.append("lat", coords.lat);
            params.append("lng", coords.lng);
        }
        params.append("type", "restaurant");

        AxiosInstance
            .get(`api/search/?${params.toString()}`)
            .then((res) => setRestaurantsData(res.data))
            .catch((err) => console.error("Error fetching restaurants:", err))
            .finally(() => setLoading(false));
    }, [search, city, coords]);

    // Filtering logic (Main search is now backend-driven, local filtering only for badge and cuisine)
    const filteredRestaurants = useMemo(() => {
        return restaurantsData.filter((restaurant) => {
            const matchBadge =
                badgeFilter === "All" || restaurant.badge === badgeFilter;

            const matchCuisine =
                cuisineFilter === "All" || restaurant.cuisine_type === cuisineFilter;

            return matchBadge && matchCuisine;
        });
    }, [restaurantsData, badgeFilter, cuisineFilter]);

    // Get user's current location
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

                    if (detectedCity) {
                        const matched = uniqueCities.find(
                            (c) => c.toLowerCase() === detectedCity.toLowerCase()
                        );
                        if (matched) setCity(matched);
                    }
                } catch {
                    console.error("Failed to fetch location data");
                } finally {
                    setLocationLoading(false);
                }
            },
            (err) => {
                setLocationLoading(false);
                setLocationError("Unable to retrieve location.");
            },
            { timeout: 10000 }
        );
    };

    // Dynamic city dropdown
    const uniqueCities = [
        ...new Set(restaurantsData.map((r) => r.city).filter(Boolean)),
    ];

    // Dynamic cuisine types
    const uniqueCuisines = [
        ...new Set(restaurantsData.map((r) => r.cuisine_type).filter(Boolean)),
    ];

    // City Dropdown options
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

    // Badge/Type options
    const typeOptions = [
        { value: "All", label: "All Types" },
        { value: "Fine Dining", label: "Fine Dining" },
        { value: "Casual Dining", label: "Casual Dining" },
        { value: "Fast Food", label: "Fast Food" },
        { value: "Cafe", label: "Cafe" },
    ];

    // Cuisine options
    const cuisineOptions = [
        { value: "All", label: "All Cuisines" },
        ...uniqueCuisines.map((c) => ({ value: c, label: c })),
    ];

    // Handle city change
    const handleCityChange = (val) => {
        if (val === "__locate__") {
            handleGetLocation();
        } else {
            setCity(val);
            setLocationError("");
            setCoords({ lat: null, lng: null });
        }
    };

    // Badge styling logic
    const getBadgeInfo = (badge) => {
        switch (badge) {
            case "Fine Dining":
                return { class: "badge-luxury", icon: "🍽️" };
            case "Casual Dining":
                return { class: "badge-budget", icon: "🥘" };
            case "Fast Food":
                return { class: "badge-dorm", icon: "🍔" };
            case "Cafe":
                return { class: "badge-default", icon: "☕" };
            default:
                return { class: "badge-default", icon: "🏪" };
        }
    };

    // Calculate active filters count
    const activeFiltersCount = [
        city !== "All",
        search !== "",
        badgeFilter !== "All",
        cuisineFilter !== "All"
    ].filter(Boolean).length;

    return (
        <div className="hotel-list-page">
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
                            <div className="col-md-3">
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
                            <div className="col-md-3">
                                <div className="filter-card">
                                    <Search size={18} color="#667eea" />
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Find best food..."
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
                                                    onMouseDown={(e) => {
                                                        e.preventDefault(); // Prevent input from losing focus immediately
                                                        setSearch(s.value);
                                                        setShowSuggestions(false);
                                                    }}
                                                >
                                                    <span className="suggestion-type">
                                                        {s.type === 'city' ? '📍' : s.type === 'restaurant' ? '🍴' : s.type === 'keyword' ? '✨' : '🍽️'}
                                                    </span>
                                                    <span className="suggestion-label">{s.label}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Badge/Type Dropdown */}
                            <div className="col-md-3">
                                <CustomDropdown
                                    icon={<Filter size={18} color="#667eea" />}
                                    options={typeOptions}
                                    value={badgeFilter}
                                    onChange={setBadgeFilter}
                                    placeholder="All Types"
                                />
                            </div>

                            {/* Cuisine Dropdown */}
                            <div className="col-md-3">
                                <CustomDropdown
                                    icon={<UtensilsCrossed size={18} color="#667eea" />}
                                    options={cuisineOptions}
                                    value={cuisineFilter}
                                    onChange={setCuisineFilter}
                                    placeholder="All Cuisines"
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
                        <h2 className="fw-bold fs-4 text-dark mb-1">Featured Restaurants</h2>
                        <p className="text-muted small">Handpicked dining experiences for you</p>
                    </div>
                    <span className="badge bg-white shadow-sm text-dark border p-2 px-3 rounded-pill fw-normal">
                        <strong>{filteredRestaurants.length}</strong> restaurants found
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" style={{ width: '3rem', height: '3rem' }} role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>
                        <p className="mt-3 text-muted">Finding best restaurants for you...</p>
                    </div>
                ) : restaurantsData.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-4 text-muted mb-3">📭</div>
                        <h4 className="text-dark">No restaurants available right now</h4>
                        <p className="text-muted">Check back later for new listings.</p>
                    </div>
                ) : filteredRestaurants.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-4 text-muted mb-3">🔍</div>
                        <h4 className="text-dark">No restaurants match your search</h4>
                        <p className="text-muted">Try adjusting your filters or search terms.</p>
                        <button
                            className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4"
                            onClick={() => { setCity("All"); setSearch(""); setBadgeFilter("All"); setCuisineFilter("All"); }}
                        >
                            Reset Filters
                        </button>
                    </div>
                ) : (
                    <div className="d-flex flex-column gap-5">
                        {filteredRestaurants.map((restaurant) => {
                            const badgeInfo = getBadgeInfo(restaurant.badge);
                            return (
                                <div
                                    key={restaurant.id}
                                    className="hotel-card"
                                >
                                    <div className="row g-0">
                                        {/* IMAGE */}
                                        <div className="col-lg-4 col-md-5 hotel-image-wrapper">
                                            <img
                                                src={
                                                    restaurant.image ||
                                                    "https://via.placeholder.com/600x450?text=Premium+Restaurant"
                                                }
                                                alt={restaurant.name}
                                                className="w-100 object-fit-cover hotel-image"
                                            />
                                            <div className={`hotel-type-badge ${badgeInfo.class}`}>
                                                {badgeInfo.icon} {restaurant.badge}
                                            </div>
                                            <div style={{
                                                position: "absolute",
                                                bottom: "8px",
                                                left: "8px",
                                                backgroundColor: restaurant.is_open ? "#10b981" : "#ef4444",
                                                color: "white",
                                                fontSize: "0.65rem",
                                                fontWeight: 800,
                                                padding: "2px 8px",
                                                borderRadius: "4px",
                                                textTransform: "uppercase",
                                                boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                                            }}>
                                                {restaurant.is_open ? "Open Now" : "Currently Closed"}
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="col-lg-8 col-md-7">
                                            <div className="card-body p-4 d-flex flex-column h-100">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h3 className="hotel-title fs-5">
                                                        <HighlightText text={restaurant.name} highlight={search} />
                                                    </h3>
                                                    {restaurant.rating && (
                                                        <div className="rating-pill">
                                                            <span>★</span> {restaurant.rating}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="hotel-location mb-3">
                                                    <MapPin size={16} />
                                                    <HighlightText text={`${restaurant.area}, ${restaurant.city}`} highlight={search} />
                                                </div>

                                                <div className="mb-3">
                                                    <span className="badge bg-light text-dark border">
                                                        <UtensilsCrossed size={14} className="me-1" />
                                                        {restaurant.cuisine_type}
                                                    </span>
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
                                                    <HighlightText text={restaurant.description.slice(0, 235)} highlight={search} />...
                                                </p>

                                                {/* PRICE + BUTTON */}
                                                <div className="d-flex justify-content-between align-items-end mt-4 pt-3 border-top">
                                                    <div className="price-container">
                                                        <span className="price-label">Average cost for two</span>
                                                        <div className="d-flex align-items-baseline gap-2">
                                                            <span className="price-value fs-5">
                                                                ₹{Number(restaurant.average_cost_for_two).toLocaleString()}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="d-flex flex-column align-items-end gap-2">
                                                        {restaurant.is_open ? (
                                                            <Link
                                                                to={`/restaurant/${restaurant.id}`}
                                                                className="explore-btns"
                                                            >
                                                                <span className="d-flex align-items-center gap-1">See Details <ChevronsRight size={18} /></span>
                                                            </Link>
                                                        ) : (
                                                            <button 
                                                                className="explore-btns" 
                                                                disabled 
                                                                style={{ 
                                                                    opacity: 0.6, 
                                                                    cursor: 'not-allowed',
                                                                    background: '#9ca3af'
                                                                }}
                                                            >
                                                                <span className="d-flex align-items-center gap-1">Closed <ChevronsRight size={18} /></span>
                                                            </button>
                                                        )}
                                                    </div>
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
