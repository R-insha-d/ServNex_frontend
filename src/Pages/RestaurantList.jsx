import React, { useState, useEffect, useMemo } from "react";
import { MapPin, ArrowRight, Search, Filter, Globe, Bell, UtensilsCrossed } from "lucide-react";
import { Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import "./HotelList.css";

export default function RestaurantList() {
    const [restaurantsData, setRestaurantsData] = useState([]);
    const [city, setCity] = useState("All");
    const [search, setSearch] = useState("");
    const [badgeFilter, setBadgeFilter] = useState("All");
    const [cuisineFilter, setCuisineFilter] = useState("All");
    const [loading, setLoading] = useState(true);

    // Fetch restaurants from Django
    useEffect(() => {
        AxiosInstance
            .get("api/restaurants/")
            .then((res) => setRestaurantsData(res.data))
            .catch((err) => console.error("Error fetching restaurants:", err))
            .finally(() => setLoading(false));
    }, []);

    // Filtering logic (optimized)
    const filteredRestaurants = useMemo(() => {
        return restaurantsData.filter((restaurant) => {
            const matchCity =
                city === "All" ||
                restaurant.city?.toLowerCase() === city.toLowerCase();

            const matchSearch =
                !search ||
                restaurant.name?.toLowerCase().includes(search.toLowerCase());

            const matchBadge =
                badgeFilter === "All" || restaurant.badge === badgeFilter;

            const matchCuisine =
                cuisineFilter === "All" || restaurant.cuisine_type === cuisineFilter;

            return matchCity && matchSearch && matchBadge && matchCuisine;
        });
    }, [restaurantsData, city, search, badgeFilter, cuisineFilter]);

    // Dynamic city dropdown
    const uniqueCities = [
        ...new Set(restaurantsData.map((r) => r.city).filter(Boolean)),
    ];

    // Dynamic cuisine types
    const uniqueCuisines = [
        ...new Set(restaurantsData.map((r) => r.cuisine_type).filter(Boolean)),
    ];

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
                    <div className="row g-3">
                        <div className="col-md-3">
                            <div className="filter-card">
                                <Globe size={18} color="#667eea" />
                                <select
                                    className="filter-select"
                                    value={city}
                                    onChange={(e) => setCity(e.target.value)}
                                >
                                    <option value="All">All Cities</option>
                                    {uniqueCities.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="filter-card">
                                <Search size={18} color="#667eea" />
                                <input
                                    type="text"
                                    className="filter-input"
                                    placeholder="Search restaurant..."
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="filter-card">
                                <Filter size={18} color="#667eea" />
                                <select
                                    className="filter-select"
                                    value={badgeFilter}
                                    onChange={(e) => setBadgeFilter(e.target.value)}
                                >
                                    <option value="All">All Types</option>
                                    <option value="Fine Dining">Fine Dining</option>
                                    <option value="Casual Dining">Casual Dining</option>
                                    <option value="Fast Food">Fast Food</option>
                                    <option value="Cafe">Cafe</option>
                                </select>
                            </div>
                        </div>

                        <div className="col-md-3">
                            <div className="filter-card">
                                <UtensilsCrossed size={18} color="#667eea" />
                                <select
                                    className="filter-select"
                                    value={cuisineFilter}
                                    onChange={(e) => setCuisineFilter(e.target.value)}
                                >
                                    <option value="All">All Cuisines</option>
                                    {uniqueCuisines.map((c) => (
                                        <option key={c} value={c}>
                                            {c}
                                        </option>
                                    ))}
                                </select>
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
                                    style={{ height: "310px" }}
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
                                                style={{
                                                    height: "310px",
                                                }}
                                            />
                                            <div className={`hotel-type-badge ${badgeInfo.class}`}>
                                                {badgeInfo.icon} {restaurant.badge}
                                            </div>
                                        </div>

                                        {/* CONTENT */}
                                        <div className="col-lg-8 col-md-7">
                                            <div className="card-body p-4 d-flex flex-column h-100">
                                                <div className="d-flex justify-content-between align-items-start mb-2">
                                                    <h3 className="hotel-title fs-5">
                                                        {restaurant.name}
                                                    </h3>
                                                    {restaurant.rating && (
                                                        <div className="rating-pill">
                                                            <span>★</span> {restaurant.rating}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="hotel-location mb-3">
                                                    <MapPin size={16} />
                                                    {restaurant.area}, {restaurant.city}
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
                                                        WebkitBoxOrient: "vertical",
                                                        overflow: "hidden",
                                                    }}
                                                >
                                                    {restaurant.description}
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

                                                    <Link
                                                        to={`/restaurant/${restaurant.id}`}
                                                        className="servnex-btn"
                                                    >
                                                        <span className="d-flex align-items-center">
                                                            See Details
                                                            <ArrowRight size={18} className="ms-2" />
                                                        </span>
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
