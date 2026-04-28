import React, { useState, useEffect, useMemo, useRef } from "react";
import { Search, Filter, Globe, ChevronDown, Check, Star, MapPin, LocateFixed, Scissors } from "lucide-react";
import { Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import Header from "../Component/Header";
import "./SaloonList.css";

function CustomDropdown({ icon, options, value, onChange, placeholder, isLoading, loadingText }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setOpen(false);
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    useEffect(() => {
        if (isLoading) setOpen(false);
    }, [isLoading]);

    const selectedLabel = isLoading
        ? (loadingText || "Loading...")
        : (options.find((o) => o.value === value)?.label || placeholder);

    return (
        <div className="custom-dd-root" ref={ref}>
            <div
                className={`custom-dd-trigger ${open ? "custom-dd-trigger--open" : ""} ${isLoading ? "custom-dd-trigger--loading" : ""}`}
                onClick={() => !isLoading && setOpen((p) => !p)}
            >
                {icon && <span className="custom-dd-icon">{icon}</span>}
                <span className={`custom-dd-selected ${isLoading ? "custom-dd-selected--loading" : ""}`}>
                    {selectedLabel}
                </span>
                {!isLoading && (
                    <ChevronDown size={18} className={`custom-dd-chevron ${open ? "custom-dd-chevron--open" : ""}`} />
                )}
            </div>

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
                                {value === opt.value && <Check size={16} className="custom-dd-check" />}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}



export default function SaloonList() {
    const [saloonsData, setSaloonsData] = useState([]);
    const [city, setCity] = useState("All");
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [coords, setCoords] = useState({ lat: null, lng: null });
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        const fetchSuggestions = async () => {
            if (search.length >= 2) {
                try {
                    const res = await AxiosInstance.get(`api/search/suggestions/?q=${search}&type=salon`);
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

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        if (city !== "All") params.append("city", city);
        if (coords.lat && coords.lng) {
            params.append("lat", coords.lat);
            params.append("lng", coords.lng);
        }
        params.append("type", "salon");

        AxiosInstance
            .get(`api/search/?${params.toString()}`)
            .then((res) => {
                setSaloonsData(res.data || []);
            })
            .catch((err) => {
                console.error("Error fetching saloons:", err);
                setSaloonsData([]);
            })
            .finally(() => setLoading(false));
    }, [search, city, coords]);

    const filteredSaloons = useMemo(() => {
        return saloonsData.filter((saloon) => {
            const matchService =
                serviceFilter === "All" || (saloon.all_services && saloon.all_services.includes(serviceFilter));
            return matchService;
        });
    }, [saloonsData, serviceFilter]);

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser.");
            return;
        }
        setLocationLoading(true);
        setLocationError("");
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoords({ lat: position.coords.latitude, lng: position.coords.longitude });
                Array.from(document.querySelectorAll('.custom-dd-list .custom-dd-option')).forEach(el => {
                    if (el.textContent === "Detect My Location") {
                        el.click();
                    }
                });
                setLocationLoading(false);
            },
            (err) => {
                setLocationError("Unable to retrieve your location.");
                setLocationLoading(false);
            }
        );
    };

    const cityOptions = [
        { value: "All", label: "All Cities" },
        { value: "DETECT", label: "Detect My Location" },
        { value: "New Delhi", label: "New Delhi" },
        { value: "Mumbai", label: "Mumbai" },
        { value: "Bangalore", label: "Bangalore" },
        { value: "Chennai", label: "Chennai" },
    ];

    const serviceOptions = useMemo(() => {
        const services = new Set();
        saloonsData.forEach(saloon => {
            if (saloon.all_services) {
                saloon.all_services.forEach(s => services.add(s));
            }
        });
        const options = Array.from(services).map(s => ({ value: s, label: s }));
        return [{ value: "All", label: "All Services" }, ...options];
    }, [saloonsData]);

    const handleCityChange = (val) => {
        if (val === "DETECT") {
            handleGetLocation();
        } else {
            setCity(val);
            setCoords({ lat: null, lng: null });
        }
    };

    return (
        <div className="saloon-list-page">
            <Header />

            <div className="saloon-filters-wrapper py-4 border-bottom shadow-sm bg-white">
                <div className="container">
                    <div className="row g-3">
                        <div className="col-md-4">
                            <CustomDropdown
                                icon={<Globe size={18} color="#667eea" />}
                                options={cityOptions}
                                value={city}
                                onChange={handleCityChange}
                                placeholder="Select City"
                                isLoading={locationLoading}
                                loadingText="Detecting location..."
                            />
                            {locationError && <p className="text-danger small mt-1 mb-0">{locationError}</p>}
                        </div>

                        <div className="col-md-4">
                            <div className="d-flex align-items-center bg-light border rounded px-3 py-2" style={{ height: "48px", position: "relative" }}>
                                <Search size={18} color="#667eea" />
                                <input
                                    type="text"
                                    className="border-0 bg-transparent ms-2 w-100 outline-none shadow-none"
                                    placeholder="Search saloons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    onFocus={() => search.length >= 2 && setShowSuggestions(true)}
                                    onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                                />
                                {showSuggestions && suggestions.length > 0 && (
                                    <div className="search-suggestions-dropdown" style={{
                                        position: "absolute",
                                        top: "100%",
                                        left: 0,
                                        right: 0,
                                        background: "#fff",
                                        border: "1px solid #e2e8f0",
                                        borderRadius: "12px",
                                        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                                        zIndex: 1000,
                                        marginTop: "8px",
                                        maxHeight: "300px",
                                        overflowY: "auto",
                                        padding: "8px"
                                    }}>
                                        {suggestions.map((s, idx) => (
                                            <div
                                                key={idx}
                                                className="suggestion-item d-flex align-items-center gap-2"
                                                style={{ padding: "10px", cursor: "pointer", borderRadius: "8px" }}
                                                onMouseOver={(e) => e.currentTarget.style.backgroundColor = "#f1f5f9"}
                                                onMouseOut={(e) => e.currentTarget.style.backgroundColor = "transparent"}
                                                onMouseDown={(e) => {
                                                    e.preventDefault();
                                                    setSearch(s.value);
                                                    setShowSuggestions(false);
                                                }}
                                            >
                                                {/* Removed hardcoded emojis as requested */}
                                                <span className="suggestion-label text-dark fw-medium">{s.label}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="col-md-4">
                            <CustomDropdown
                                icon={<Filter size={18} color="#667eea" />}
                                options={serviceOptions}
                                value={serviceFilter}
                                onChange={setServiceFilter}
                                placeholder="All Services"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <main className="container py-5 min-vh-100">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                        <h2 className="fw-bold mb-1">Top Rated Saloons</h2>
                        <p className="text-muted small">Skip the wait, book your spot seamlessly.</p>
                    </div>
                    <span className="badge bg-light text-dark px-3 py-2 border rounded-pill shadow-sm">
                        {filteredSaloons.length} saloons found
                    </span>
                </div>

                {loading ? (
                    <div className="text-center py-5">
                        <div className="spinner-border text-primary" role="status"></div>
                        <p className="mt-3 text-muted">Loading best saloons...</p>
                    </div>
                ) : filteredSaloons.length > 0 ? (
                    <div className="row g-4">
                        {filteredSaloons.map((saloon) => (
                            <div key={saloon.id} className="col-md-6 col-lg-4">
                                <div className="card h-100 border-0 shadow-sm rounded-4 overflow-hidden saloon-card">
                                    <div className="position-relative">
                                        <img
                                            src={saloon.image || "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                            className="card-img-top"
                                            alt={saloon.name}
                                            style={{ height: "220px", objectFit: "cover" }}
                                        />
                                        <div className="position-absolute top-0 end-0 m-3 px-2 py-1 bg-white rounded shadow-sm text-dark d-flex align-items-center gap-1">
                                            <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                            <span className="fw-bold small">{saloon.average_rating || saloon.rating || "0.0"}</span>
                                            {saloon.reviews_count > 0 && <span className="text-muted" style={{ fontSize: '0.65rem' }}>({saloon.reviews_count})</span>}
                                        </div>
                                    </div>
                                    <div className="card-body p-4 d-flex flex-column">
                                        <h5 className="fw-bold mb-1">{saloon.name}</h5>
                                        <p className="text-muted small mb-3 d-flex align-items-center gap-1">
                                            <MapPin size={14} /> {saloon.area}, {saloon.city}
                                        </p>
                                        <p className="small mb-4 text-secondary flex-grow-1">
                                            <Scissors size={14} className="me-1" /> Specialized in {saloon.service_type || "Styling, Spa, Haircuts"}
                                        </p>

                                        <div className="d-flex align-items-center justify-content-between mt-auto">
                                            <div className={saloon.is_open ? "text-success small fw-bold" : "text-danger small fw-bold"}>
                                                {saloon.is_open ? "Open now" : "Closed"}
                                            </div>
                                            <Link to={`/salon/${saloon.id}`} className="btn btn-primary px-4 rounded-pill fw-medium">
                                                Join Queue
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-5">
                        <h4>No saloons found matching your criteria.</h4>
                        <p className="text-muted">Try removing some filters to see more results.</p>
                        <Link className="btn btn-outline-primary mt-3" onClick={() => { setSearch(""); setCity("All"); setServiceFilter("All"); }}>
                            Clear Filters
                        </Link>
                    </div>
                )}
            </main>
        </div>
    );
}
