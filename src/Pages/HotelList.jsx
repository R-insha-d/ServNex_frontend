import React, { useState, useEffect, useMemo } from "react";
import { MapPin, ArrowRight, Search, Filter, Globe, Bell, ChevronDown, ChevronUp } from "lucide-react";
import { Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import "./HotelList.css";

import { TbCurrentLocation } from "react-icons/tb";

export default function HotelList() {
    const [hotelsData, setHotelsData] = useState([]);
    const [city, setCity] = useState("All");
    const [search, setSearch] = useState("");
    const [badgeFilter, setBadgeFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [showFilters, setShowFilters] = useState(false);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");

    // Fetch hotels from Django
    useEffect(() => {
        AxiosInstance
            .get("api/hotels/")
            .then((res) => setHotelsData(res.data))
            .catch((err) => console.error("Error fetching hotels:", err))
            .finally(() => setLoading(false));
    }, []);

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

                    if (!detectedCity) {
                        setLocationError("Could not detect city from your location.");
                        setLocationLoading(false);
                        return;
                    }

                    // Try to match detected city against available hotel cities (case-insensitive)
                    const matched = uniqueCities.find(
                        (c) => c.toLowerCase() === detectedCity.toLowerCase()
                    );

                    if (matched) {
                        setCity(matched);
                        setLocationError("");
                    } else {
                        // Partial match fallback
                        const partial = uniqueCities.find((c) =>
                            c.toLowerCase().includes(detectedCity.toLowerCase()) ||
                            detectedCity.toLowerCase().includes(c.toLowerCase())
                        );
                        if (partial) {
                            setCity(partial);
                            setLocationError("");
                        } else {
                            setLocationError(`No hotels found near "${detectedCity}". Showing all cities.`);
                            setCity("All");
                        }
                    }
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

    // Filtering logic (optimized)
    const filteredHotels = useMemo(() => {
        return hotelsData.filter((hotel) => {
            const matchCity =
                city === "All" ||
                hotel.city?.toLowerCase() === city.toLowerCase();

            const matchSearch =
                !search ||
                hotel.name?.toLowerCase().includes(search.toLowerCase());

            const matchBadge =
                badgeFilter === "All" || hotel.badge === badgeFilter;

            return matchCity && matchSearch && matchBadge;
        });
    }, [hotelsData, city, search, badgeFilter]);

    // Dynamic city dropdown
    const uniqueCities = [
        ...new Set(hotelsData.map((h) => h.city).filter(Boolean)),
    ];

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
                            <div className="col-md-4">
                                <div className="filter-card">
                                    {locationLoading
                                        ? <span style={{ width: "18px", height: "18px", border: "2px solid #667eea", borderTopColor: "transparent", borderRadius: "50%", display: "inline-block", flexShrink: 0, animation: "spin 0.7s linear infinite" }} />
                                        : <Globe size={18} color="#667eea" style={{ flexShrink: 0 }} />
                                    }
                                    <select
                                        className="filter-select"
                                        value={city}
                                        onChange={(e) => {
                                            if (e.target.value === "__locate__") {
                                                handleGetLocation();
                                            } else {
                                                setCity(e.target.value);
                                                setLocationError("");
                                            }
                                        }}
                                    >
                                        <option value="All">All Cities</option>
                                        <option value="__locate__">📍 Detect My Location</option>
                                        {uniqueCities.map((c) => (
                                            <option key={c} value={c}>{c}</option>
                                        ))}
                                    </select>
                                </div>
                                {locationError && (
                                    <p style={{ fontSize: "11px", color: "#e53e3e", margin: "4px 0 0 4px" }}>
                                        {locationError}
                                    </p>
                                )}
                            </div>

                            <div className="col-md-4">
                                <div className="filter-card">
                                    <Search size={18} color="#667eea" />
                                    <input
                                        type="text"
                                        className="filter-input"
                                        placeholder="Discover your perfect stay..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="col-md-4">
                                <div className="filter-card">
                                    <Filter size={18} color="#667eea" />
                                    <select
                                        className="filter-select"
                                        value={badgeFilter}
                                        onChange={(e) => setBadgeFilter(e.target.value)}
                                    >
                                        <option value="All">All Property Types</option>
                                        <option value="Luxury Stays">Luxury Stays</option>
                                        <option value="Cheap & Best">Cheap & Best</option>
                                        <option value="Dormitory">Dormitory</option>
                                    </select>
                                </div>
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
                        <p className="mt-3 text-muted">Finding best hotels for you...</p>
                    </div>
                ) : hotelsData.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-4 text-muted mb-3">📭</div>
                        <h4 className="text-dark">No hotels available right now</h4>
                        <p className="text-muted">Check back later for new listings.</p>
                    </div>
                ) : filteredHotels.length === 0 ? (
                    <div className="text-center py-5">
                        <div className="display-4 text-muted mb-3">🔍</div>
                        <h4 className="text-dark">No hotels match your search</h4>
                        <p className="text-muted">Try adjusting your filters or search terms.</p>
                        <button
                            className="btn btn-outline-primary btn-sm mt-2 rounded-pill px-4"
                            onClick={() => { setCity("All"); setSearch(""); setBadgeFilter("All"); }}
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
                                                        {hotel.name}
                                                    </h3>
                                                    {hotel.rating && (
                                                        <div className="rating-pill">
                                                            <span>★</span> {hotel.rating}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="hotel-location mb-3">
                                                    <MapPin size={16} />
                                                    {hotel.area}, {hotel.city}
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
                                                    {hotel.description.slice(0, 235)}...
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
                                                        <span>See Details ›</span>
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