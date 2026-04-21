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

const DUMMY_SALOONS = [
    { id: 1, name: "Luxe Trims", image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", area: "Downtown", city: "Mumbai", rating: 4.8, service_type: "Haircut" },
    { id: 2, name: "Zen Spa & Style", image: "https://media.raptor.d3corp.com/zen-spa-fenwick/zen-spa-fenwick-2024/2024/08/02130110/candy-counter-zen-spa-scaled.jpg", area: "Bandra", city: "Mumbai", rating: 4.6, service_type: "Spa" },
    { id: 3, name: "Elite Grooming", image: "https://klicknbook.com/assets/img/services/service-gallery/66c58c93bb06b.jpg", area: "Indiranagar", city: "Bangalore", rating: 4.9, service_type: "Styling" },
    { id: 4, name: "Urban Style Lounge", image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", area: "Connaught Place", city: "New Delhi", rating: 4.7, service_type: "Haircut" },
    { id: 5, name: "The Velvet Nail", image: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", area: "T Nagar", city: "Chennai", rating: 4.5, service_type: "Nails" },
    { id: 6, name: "Classic Clippers", image: "https://images.unsplash.com/photo-1582095133179-bfd08e2fc6b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", area: "Whitefield", city: "Bangalore", rating: 4.6, service_type: "Haircut" }
];

export default function SaloonList() {
    const [saloonsData, setSaloonsData] = useState([]);
    const [city, setCity] = useState("All");
    const [search, setSearch] = useState("");
    const [serviceFilter, setServiceFilter] = useState("All");
    const [loading, setLoading] = useState(true);
    const [locationLoading, setLocationLoading] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [coords, setCoords] = useState({ lat: null, lng: null });

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append("q", search);
        if (city !== "All") params.append("city", city);
        if (coords.lat && coords.lng) {
            params.append("lat", coords.lat);
            params.append("lng", coords.lng);
        }
        params.append("type", "saloon");

        AxiosInstance
            .get(`api/search/?${params.toString()}`)
            .then((res) => {
                if (res.data && res.data.length > 0) {
                    setSaloonsData(res.data);
                } else {
                    // Fallback to dummy data mapping cities/filters locally if backend returns empty
                    let fallback = DUMMY_SALOONS;

                    // Since it's mockup data, apply the current filters locally on the fallback
                    if (search) fallback = fallback.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
                    if (city !== "All") fallback = fallback.filter(s => s.city === city);

                    setSaloonsData(fallback);
                }
            })
            .catch(() => {
                let fallback = DUMMY_SALOONS;
                if (search) fallback = fallback.filter(s => s.name.toLowerCase().includes(search.toLowerCase()));
                if (city !== "All") fallback = fallback.filter(s => s.city === city);
                setSaloonsData(fallback);
            })
            .finally(() => setLoading(false));
    }, [search, city, coords]);

    const filteredSaloons = useMemo(() => {
        return saloonsData.filter((saloon) => {
            const matchService =
                serviceFilter === "All" || saloon.service_type === serviceFilter;
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

    const serviceOptions = [
        { value: "All", label: "All Services" },
        { value: "Haircut", label: "Haircut" },
        { value: "Spa", label: "Spa" },
        { value: "Styling", label: "Styling" },
        { value: "Nails", label: "Nails" },
    ];

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
                            <div className="d-flex align-items-center bg-light border rounded px-3 py-2" style={{ height: "48px" }}>
                                <Search size={18} color="#667eea" />
                                <input
                                    type="text"
                                    className="border-0 bg-transparent ms-2 w-100 outline-none shadow-none"
                                    placeholder="Search saloons..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
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
                                            src={saloon.image ? (saloon.image.startsWith('http') || saloon.image.startsWith('data:') ? saloon.image : `http://127.0.0.1:8000${saloon.image}`) : "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"}
                                            className="card-img-top"
                                            alt={saloon.name}
                                            style={{ height: "220px", objectFit: "cover" }}
                                        />
                                        <div className="position-absolute top-0 end-0 m-3 px-2 py-1 bg-white rounded shadow-sm text-dark d-flex align-items-center gap-1">
                                            <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                            <span className="fw-bold small">{saloon.rating || "4.5"}</span>
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
                                            <div className="text-success small fw-bold">Open now</div>
                                            <Link to={`/saloon/${saloon.id}`} className="btn btn-primary px-4 rounded-pill fw-medium">
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
                        <button className="btn btn-outline-primary mt-3" onClick={() => { setSearch(""); setCity("All"); setServiceFilter("All"); }}>
                            Clear Filters
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
