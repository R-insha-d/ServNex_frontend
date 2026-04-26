import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AxiosInstance from "../../Component/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import LocationPicker from "./LocationPicker";

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [myRestaurant, setMyRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reservations, setReservations] = useState([]);
  const [loadingReservations, setLoadingReservations] = useState(false);
  const [statusFilter, setStatusFilter] = useState("all");
  const [previousRecords, setPreviousRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [editForm, setEditForm] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [menuImagePreview, setMenuImagePreview] = useState("");
  const [interiorImagePreview, setInteriorImagePreview] = useState("");

  const [showMap, setShowMap] = useState(false);
  const [selectedCoords, setSelectedCoords] = useState(null);

  const [extraImagePreview, setExtraImagePreview] = useState("");

 const theme = {
  primary: "#667eea",     // main blue
  secondary: "#9333ea",   // purple
  accent: "#c4b5fd",      // soft violet highlight
  light: "#f3f4ff"       // very light background
};
  const badgeChoices = ["Fine Dining", "Casual Dining", "Fast Food", "Cafe"];
  const priceRangeChoices = ["₹", "₹₹", "₹₹₹", "₹₹₹₹"];


  

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return (AxiosInstance.defaults.baseURL || "http://127.0.0.1:8000") + url;
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < rating ? "#9b722d" : "#d1d5db", fontSize: "1rem" }}>&#9733;</span>
    ));
  };

  // --- Time Helpers for 12-hour Format ---
  const formatTo24h = (h, m, p) => {
    let hour = parseInt(h);
    if (p === "AM" && hour === 12) hour = 0;
    if (p === "PM" && hour !== 12) hour += 12;
    return `${String(hour).padStart(2, "0")}:${m}`;
  };

  const parseFrom24h = (timeStr) => {
    if (!timeStr) return { h: "09", m: "00", p: "AM" };
    const [h24, m] = timeStr.split(":");
    let h = parseInt(h24);
    const p = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return { h: String(h).padStart(2, "0"), m, p };
  };

  useEffect(() => { fetchMyRestaurant(); }, []);

  const fetchMyRestaurant = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("api/restaurants/me/");
      setMyRestaurant(res.data);
      fetchReservations();
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoadingReservations(true);
      const res = await AxiosInstance.get("api/restaurant-dashboard/reservations/");
      const data = res.data;
      setReservations(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Reservations error:", error);
    } finally {
      setLoadingReservations(false);
    }
  };

  const fetchPreviousRecords = async () => {
    try {
      setLoadingRecords(true);
      const res = await AxiosInstance.get("api/restaurant-dashboard/previous-records/");
      const data = res.data;
      setPreviousRecords(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Records error:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      if (myRestaurant) {
          const res = await AxiosInstance.get(`api/restaurants/${myRestaurant.id}/reviews/`);
          const data = res.data;
          setReviews(Array.isArray(data) ? data : (data.results || []));
      }
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const handleMarkReady = async (id) => {
    try {
      await AxiosInstance.patch("api/reservations/" + id + "/", { status: "Your Table Is Ready" });
      setReservations(prev => prev.map((r) => r.id === id ? { ...r, status: "Your Table Is Ready" } : r));
    } catch (error) {
      toast.error("Failed to mark table ready.");
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!window.confirm("Mark this reservation as completed? It will move to Previous Records.")) return;
    try {
      await AxiosInstance.patch("api/reservations/" + id + "/", { status: "completed" });
      setReservations(prev => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error("Failed to complete reservation.");
    }
  };

  const handleDeleteReservation = async (id) => {
    if (!window.confirm("Delete this reservation?")) return;
    try {
      await AxiosInstance.delete("api/reservations/" + id + "/");
      setReservations(prev => prev.filter((r) => r.id !== id));
    } catch (error) {
      toast.error("Failed to delete.");
    }
  };

  const filteredReservations = statusFilter === "all" ? reservations : reservations.filter((r) => r.status === statusFilter);
  const totalReservations = reservations.length;
  const confirmedCount = reservations.filter((r) => r.status === "Table Pending").length;
  const completedCount = reservations.filter((r) => r.status === "Your Table Is Ready").length;
  const cancelledCount = reservations.filter((r) => r.status === "cancelled").length;

  const handleToggleStatus = async () => {
    if (!myRestaurant || togglingStatus) return;
    try {
      setTogglingStatus(true);
      const newStatus = !myRestaurant.is_open;
      const res = await AxiosInstance.patch("api/restaurants/me/", { is_open: newStatus });
      setMyRestaurant(res.data);
      toast.success(`Restaurant is now ${newStatus ? "OPEN" : "CLOSED"}`);
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const statusBadgeClass = (s) => {
    if (s === "Table Pending") return "bg-warning text-dark";
    if (s === "cancelled") return "bg-danger";
    if (s === "Your Table Is Ready") return "bg-primary";
    if (s === "completed") return "bg-success";
    return "bg-secondary";
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: myRestaurant.name || "", city: myRestaurant.city || "", area: myRestaurant.area || "",
      badge: myRestaurant.badge || "", cuisine_type: myRestaurant.cuisine_type || "",
      price_range: myRestaurant.price_range || "₹₹", average_cost_for_two: myRestaurant.average_cost_for_two || "",
      tables_2_capacity: myRestaurant.tables_2_capacity || 0,
      tables_4_capacity: myRestaurant.tables_4_capacity || 0,
      tables_6_capacity: myRestaurant.tables_6_capacity || 0,
      tables_8_capacity: myRestaurant.tables_8_capacity || 0,
      tables_10_capacity: myRestaurant.tables_10_capacity || 0,
      is_open: myRestaurant.is_open,
      opening_time: myRestaurant.opening_time || "09:00",
      closing_time: myRestaurant.closing_time || "22:00",
      description: myRestaurant.description || "",
      keywords: myRestaurant.keywords || "",
      image: null, menu_image: null, interior_image: null, extra_image: null,
      
    });
    setEditImagePreview(getImageUrl(myRestaurant.image));
    setMenuImagePreview(getImageUrl(myRestaurant.menu_image));
    setInteriorImagePreview(getImageUrl(myRestaurant.interior_image));

    setExtraImagePreview(getImageUrl(myRestaurant.extra_image));
    setActiveTab("edit");
  };

  const handleEditImageUpload = (e, field, setPreview) => {
    const file = e.target.files[0];
    if (file && file.type.startsWith("image")) {
      setEditForm((prev) => ({ ...prev, [field]: file }));
      setPreview(URL.createObjectURL(file));
    }
  };


// ------------------------------------
  const handleUpdateRestaurant = async () => {
  if (!editForm.name || !editForm.city || !editForm.description) {
    toast.warn("Name, city, and description are required.");
    return;
  }

  if (!selectedCoords) {
    toast.warn("Please pick location from map.");
    return;
  }

  console.log("Final coords:", selectedCoords);

  const formData = new FormData();

  Object.entries(editForm).forEach(([key, val]) => {
    if (val instanceof File) {
      formData.append(key, val);
    } else if (val !== null && val !== "") {
      if (typeof val === "boolean") {
        formData.append(key, val ? "true" : "false");
      } else {
        formData.append(key, val);
      }
    }
  });

  // ✅ ONLY USE MAP COORDS
  formData.append("latitude", selectedCoords.latitude);
  formData.append("longitude", selectedCoords.longitude);

  try {
    const res = await AxiosInstance.patch(
      "api/restaurants/me/",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    setMyRestaurant(res.data);
    toast.success("Restaurant updated successfully!");
    setActiveTab("dashboard");
  } catch (error) {
    console.error("Update error:", error.response?.data || error.message);
    toast.error("Failed to update.");
  }
};

// ------------------------------------


  if (loading) return <div className="p-5 text-center"><div className="spinner-border me-2" />Loading Dashboard...</div>;
  if (!myRestaurant) return <div className="p-5 text-center">No Restaurant Profile Found.</div>;

  const tabs = ["dashboard", "reservations", "records", "reviews", "edit"];
  const tabIcons = { dashboard: "🏠", reservations: "📅", records: "📋", reviews: "⭐", edit: "✏️" };
  const tabLabels = { dashboard: "Dashboard", reservations: "Reservations", records: "Previous Records", reviews: "Guest Reviews", edit: "Edit" };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600;700&family=DM+Sans:wght@400;500;600&display=swap');
        .restaurant-dashboard { font-family: 'DM Sans', sans-serif; background: ${theme.light}; }
        .sidebar-brand { font-family: 'Playfair Display', serif; }
        .sidebar-tab-btn { background: transparent; color: rgba(255,255,255,0.75); border: none; border-radius: 12px; padding: 10px 16px; width: 100%; text-align: left; font-size: 0.9rem; font-weight: 500; transition: all 0.3s ease; cursor: pointer; }
        .sidebar-tab-btn:hover { background: rgba(255,255,255,0.15); color: white; transform: translateX(5px); }
        .sidebar-tab-btn.active { background: white; color: #667eea; font-weight: 600; box-shadow: 0 2px 12px rgba(0,0,0,0.15); }
        .sidebar-tab-btn.active:hover { transform: none; }
        .stat-card { border-radius: 16px; border: none; padding: 20px 24px; transition: transform 0.2s ease; }
        .stat-card:hover { transform: translateY(-3px); }
        .reservation-card { border-radius: 14px; border: 1px solid #f0d9cc; background: white; transition: box-shadow 0.2s ease; }
        .reservation-card:hover { box-shadow: 0 4px 16px rgba(124,45,18,0.1); }
        .record-card { border-radius: 14px; border: 1px solid #e5e7eb; background: white; transition: box-shadow 0.2s ease; }
        .record-card:hover { box-shadow: 0 4px 16px rgba(0,0,0,0.08); }
        .hero-overlay { background: linear-gradient(to top, rgba(84, 82, 177, 0.85) 0%, rgba(0,0,0,0.2) 100%); }
        .form-control:focus, .form-select:focus { border-color: ${theme.secondary}; box-shadow: 0 0 0 0.2rem rgba(234,88,12,0.2); }
        .btn-restaurant-primary { background: ${theme.primary}; color: white; border: none; border-radius: 10px; padding: 10px 24px; font-weight: 600; transition: background 0.2s ease; }
        .btn-restaurant-primary:hover { background: ${theme.secondary}; color: white; }
        .info-pill {color:#667eea; border-radius: 20px; padding: 4px 12px; font-size: 0.8rem; font-weight: 500; display: inline-block; }
        .image-preview-box { border-radius: 10px; overflow: hidden; border: 2px dashed #fed7aa; background: #fff7ed; min-height: 120px; display: flex; align-items: center; justify-content: center; margin-top: 8px; }
        .image-preview-box img { width: 100%; height: 120px; object-fit: cover; }
        .image-preview-box .no-image { color: #d97706; font-size: 0.82rem; text-align: center; padding: 16px; }
        .review-box { background: #f9fafb; border-radius: 10px; padding: 10px 14px; margin-top: 10px; border-left: 3px solid #f59e0b; }
        .no-review-box { background: #f3f4f6; border-radius: 10px; padding: 8px 14px; margin-top: 10px; font-size: 0.82rem; color: #9ca3af; font-style: italic; }
      `}</style>

      <div className="container-fluid restaurant-dashboard">
        <div className="row min-vh-100">

          {/* SIDEBAR */}
          <div
            className={"col-md-3 col-lg-2 text-white p-3 d-flex flex-column " + (sidebarOpen ? "d-block" : "d-none d-md-flex")}
            style={{ background: "linear-gradient(135deg, #667eea 0%, #9333ea 100%)", minHeight: "100vh" }}
          >
            <div className="mb-4 mt-2">
              <h4 className="sidebar-brand fw-bold mb-0" style={{ fontSize: "1.2rem" }}>🍽️ ServNex</h4>
              <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>Restaurant Manager</small>
            </div>
            <div className="d-flex flex-column gap-1 flex-grow-1">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  className={"sidebar-tab-btn " + (activeTab === tab ? "active" : "")}
                  onClick={() => {
                    if (tab === "edit") handleOpenEdit();
                    else {
                      setActiveTab(tab);
                      if (tab === "records") fetchPreviousRecords();
                      if (tab === "reviews") fetchReviews();
                    }
                    setSidebarOpen(false);
                  }}
                >
                  {tabIcons[tab]} {tabLabels[tab]}
                </button>
              ))}
            </div>
            <div className="mt-auto pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <small style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.75rem", display: "block", marginBottom: "10px" }}>{myRestaurant.name}</small>
              <button className="btn w-100"
                style={{
                  background: "rgba(220,53,69,0.2)",
                  border: "1px solid rgba(220,53,69,0.4)",
                  color: "white",
                  backdropFilter: "blur(10px)",
                  borderRadius: "12px",
                  padding: "12px",
                  fontWeight: "600",
                  transition: "all 0.3s ease",
                  fontSize: "16px",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(220,53,69,0.4)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "rgba(220,53,69,0.2)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
                onClick={() => { localStorage.clear(); navigate("/", { replace: true }); }}>
                🚪 Logout
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="col-md-9 col-lg-10 p-0">
            {/* TOPBAR */}
            <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <button className="btn d-md-none" style={{ background: theme.secondary, color: "white", borderRadius: "8px" }} onClick={() => setSidebarOpen(true)}>☰</button>
                <h5 className="fw-semibold mb-0" style={{ color: theme.primary, fontFamily: "'Playfair Display', serif" }}>
                  {activeTab === "dashboard" && "Overview"}
                  {activeTab === "reservations" && "Table Reservations"}
                  {activeTab === "records" && "Previous Records"}
                  {activeTab === "reviews" && "Guest Reviews"}
                  {activeTab === "edit" && "Edit Restaurant"}
                </h5>
              </div>

              {/* Status Toggle Button */}
              <div className="d-flex align-items-center">
                <button 
                  onClick={handleToggleStatus}
                  disabled={togglingStatus}
                  className="btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm transition-all"
                  style={{ 
                    background: myRestaurant.is_open ? "#10b981" : "#ef4444",
                    color: "white",
                    border: "none",
                    fontWeight: "700",
                    fontSize: "0.9rem",
                    transition: "all 0.3s ease",
                    transform: "scale(1)",
                    opacity: togglingStatus ? 0.8 : 1,
                    cursor: togglingStatus ? "not-allowed" : "pointer"
                  }}
                  onMouseEnter={(e) => !togglingStatus && (e.currentTarget.style.transform = "scale(1.05)")}
                  onMouseLeave={(e) => !togglingStatus && (e.currentTarget.style.transform = "scale(1)")}
                >
                  {togglingStatus ? (
                    <>
                      <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
                      Updating...
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: "1.1rem" }}>{myRestaurant.is_open ? "🟢" : "🔴"}</span>
                      {myRestaurant.is_open ? "RESTAURANT IS OPEN" : "RESTAURANT IS CLOSED"}
                    </>
                  )}
                </button>
              </div>
            </div>

            <div className="p-4">

              {/* ── DASHBOARD TAB ── */}
              {activeTab === "dashboard" && (
                <>
                  <div className="card border-0 shadow mb-4 rounded-4 overflow-hidden">
                    <img
                      src={getImageUrl(myRestaurant.image) || "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1200"}
                      style={{ height: 260, objectFit: "cover", width: "100%" }} alt="restaurant"
                    />
                    <div className="card-img-overlay text-white d-flex flex-column justify-content-end hero-overlay">
                      <div className="d-flex align-items-end justify-content-between flex-wrap gap-2">
                        <div>
                          <h3 className="fw-bold mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{myRestaurant.name}</h3>
                          <p className="mb-0 opacity-75">
                            📍 {myRestaurant.area}, {myRestaurant.city}
                            {myRestaurant.cuisine_type && " • 🍴 " + myRestaurant.cuisine_type}
                            {myRestaurant.rating && " • ⭐ " + myRestaurant.rating}
                          </p>
                        </div>
                        <div className="d-flex gap-2 flex-wrap">
                          {myRestaurant.price_range && <span className="badge rounded-pill" style={{ background: theme.accent, color: "#7c2d12" }}></span>}
                          {myRestaurant.badge && <span className="badge rounded-pill bg-white" style={{ color: theme.primary }}>{myRestaurant.badge}</span>}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-3 mb-4">
                    {[
                      { label: "Total Active", count: totalReservations, bg: "#fff7ed", border: theme.secondary, color: theme.primary },
                      { label: "Table Pending", count: confirmedCount, bg: "#f0fdf4", border: "#22c55e", color: "#15803d" },
                      { label: "Table Is Ready", count: completedCount, bg: "#eff6ff", border: "#3b82f6", color: "#1d4ed8" },
                      { label: "Cancelled", count: cancelledCount, bg: "#fef2f2", border: "#ef4444", color: "#dc2626" },
                    ].map((s) => (
                      <div key={s.label} className="col-6 col-md-3">
                        <div className="stat-card shadow-sm" style={{ background: s.bg, borderLeft: "4px solid " + s.border }}>
                          <div style={{ fontSize: "1.8rem", fontWeight: 700, color: s.color }}>{s.count}</div>
                          <div className="text-muted small">{s.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h6 className="fw-bold mb-3" style={{ color: theme.primary }}>Restaurant Details</h6>
                        <div className="d-flex flex-column gap-2">
                          <div className="d-flex justify-content-between small mb-1"><span className="text-muted">Total Tables</span><strong>{myRestaurant.total_tables}</strong></div>
                          <div className="d-flex flex-column gap-1 bg-light p-2 rounded-3 mt-1" style={{ fontSize: "0.8rem" }}>
                            <div className="d-flex justify-content-between"><span>2-Cap Tables:</span><span>{myRestaurant.tables_2_capacity}</span></div>
                            <div className="d-flex justify-content-between"><span>4-Cap Tables:</span><span>{myRestaurant.tables_4_capacity}</span></div>
                            <div className="d-flex justify-content-between"><span>6-Cap Tables:</span><span>{myRestaurant.tables_6_capacity}</span></div>
                            <div className="d-flex justify-content-between"><span>8-Cap Tables:</span><span>{myRestaurant.tables_8_capacity}</span></div>
                            <div className="d-flex justify-content-between"><span>10-Cap Tables:</span><span>{myRestaurant.tables_10_capacity}</span></div>
                          </div>
                          {myRestaurant.average_cost_for_two && <div className="d-flex justify-content-between"><span className="text-muted">Avg Cost for Two</span><strong>Rs.{myRestaurant.average_cost_for_two}</strong></div>}
                          {myRestaurant.cuisine_type && <div className="d-flex justify-content-between"><span className="text-muted">Cuisine</span><strong>{myRestaurant.cuisine_type}</strong></div>}
                          {/* {myRestaurant.price_range && <div className="d-flex justify-content-between"><span className="text-muted">Price Range</span><strong>{myRestaurant.price_range}</strong></div>} */}
                        </div>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
                        <h6 className="fw-bold mb-3" style={{ color: theme.primary }}>About</h6>
                        <p className="text-muted mb-0" style={{ fontSize: "0.9rem", lineHeight: 1.7 }}>{myRestaurant.description || "No description added yet."}</p>
                      </div>
                    </div>
                    {(myRestaurant.menu_image || myRestaurant.interior_image) && (
                      <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4">
                          <h6 className="fw-bold mb-3" style={{ color: theme.primary }}>Photos</h6>
                          <div className="row g-3">
                            {myRestaurant.menu_image && (
                              <div className="col-md-6">
                                <p className="text-muted small mb-1">📋 Menu</p>
                                <img src={getImageUrl(myRestaurant.menu_image)} className="img-fluid rounded-3" style={{ maxHeight: 200, width: "100%", objectFit: "cover" }} alt="menu" />
                              </div>
                            )}
                            {myRestaurant.interior_image && (
                              <div className="col-md-6">
                                <p className="text-muted small mb-1">🏛️ Interior</p>
                                <img src={getImageUrl(myRestaurant.interior_image)} className="img-fluid rounded-3" style={{ maxHeight: 200, width: "100%", objectFit: "cover" }} alt="interior" />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}

              {/* ── RESERVATIONS TAB ── */}
              {activeTab === "reservations" && (
                <div className="card shadow border-0 p-4 rounded-4">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
                    <h5 className="mb-0 fw-semibold d-flex align-items-center gap-2" style={{ color: theme.primary }}>
                      Table Reservations
                      {filteredReservations.length > 0 && <span className="badge rounded-pill" style={{ background: theme.secondary }}>{filteredReservations.length}</span>}
                    </h5>
                    <select className="form-select form-select-sm w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} style={{ minWidth: 160, borderColor: theme.secondary }}>
                      <option value="all">All Reservations</option>
                      <option value="Table Pending">Table Pending</option>
                      <option value="Your Table Is Ready">Your Table Is Ready</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  {loadingReservations ? (
                    <div className="text-center py-5"><div className="spinner-border spinner-border-sm me-2" />Loading...</div>
                  ) : filteredReservations.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {filteredReservations.map((r) => (
                        <div key={r.id} className="reservation-card p-3 d-flex justify-content-between align-items-start">
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2 mb-1">
                              <div style={{ width: 36, height: 36, borderRadius: "50%", background: theme.light, border: "2px solid " + theme.secondary, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: theme.primary }}>
                                {(r.user_name || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: theme.primary }}>{r.user_name || "Unknown"}</strong>
                                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                                  {r.user_email}{r.user_phone && " · 📞 " + r.user_phone}
                                </div>
                              </div>
                            </div>
                            <span className="text-muted small">📅 {r.reservation_date} at 🕐 {r.reservation_time}</span>
                            <span className="text-muted small">👥 {r.number_of_guests} guests · 🪑 {r.tables_reserved} table(s)</span>
                            {r.special_requests && <span className="text-muted small">💬 <em>{r.special_requests}</em></span>}
                            <span className="text-muted small">🕐 Time: {new Date(r.created_at).toLocaleString()}</span>
                            {r.payment_info && (
                              <span className="small fw-semibold" style={{ color: "#16a34a" }}>
                                💳 Paid: ₹{parseFloat(r.payment_info.amount).toLocaleString()} &nbsp;|&nbsp; Txn: {r.payment_info.transaction_id}
                              </span>
                            )}
                          </div>
                          <div className="d-flex flex-column align-items-end gap-2 ms-3">
                            <span className={"badge " + statusBadgeClass(r.status)} style={{ whiteSpace: "nowrap" }}>{r.status}</span>

                            {/* Mark Table Ready button */}
                            {r.status === "Table Pending" && (
                              <button className="btn btn-sm" style={{ fontSize: "0.75rem", borderRadius: "8px", background: theme.primary, color: "white" }}
                                onClick={() => handleMarkReady(r.id)}>
                                ✅ Mark Table Ready
                              </button>
                            )}

                            {/* Completed button — moves to Previous Records & frees tables */}
                            {r.status === "Your Table Is Ready" && (
                              <button className="btn btn-sm btn-success" style={{ fontSize: "0.75rem", borderRadius: "8px" }}
                                onClick={() => handleMarkCompleted(r.id)}>
                                🏁 Completed
                              </button>
                            )}

                            {/* Delete button */}
                            {r.status === "Your Table Is Ready" && (
                              <button className="btn btn-outline-danger btn-sm" style={{ fontSize: "0.75rem", borderRadius: "8px" }}
                                onClick={() => handleDeleteReservation(r.id)}>
                                🗑️ Delete
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <div style={{ fontSize: "2.5rem" }}>📭</div>
                      <p className="mt-2 mb-0">{statusFilter === "all" ? "No active reservations." : "No " + statusFilter + " reservations."}</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── PREVIOUS RECORDS TAB ── */}
              {activeTab === "records" && (
                <div className="card shadow border-0 p-4 rounded-4">
                  <div className="d-flex align-items-center justify-content-between mb-4">
                    <h5 className="mb-0 fw-semibold" style={{ color: theme.primary }}>
                      📋 Previous Records
                      {previousRecords.length > 0 && (
                        <span className="badge rounded-pill ms-2" style={{ background: theme.secondary, fontSize: "0.75rem" }}>{previousRecords.length}</span>
                      )}
                    </h5>
                    <button className="btn btn-sm" style={{ borderRadius: "8px", background: theme.light, color: theme.primary, border: "1px solid #fed7aa" }}
                      onClick={fetchPreviousRecords}>
                      🔄 Refresh
                    </button>
                  </div>

                  {loadingRecords ? (
                    <div className="text-center py-5"><div className="spinner-border spinner-border-sm me-2" />Loading records...</div>
                  ) : previousRecords.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {previousRecords.map((r) => (
                        <div key={r.id} className="record-card p-3">
                          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
                            {/* Customer info */}
                            <div className="d-flex align-items-center gap-2">
                              <div style={{ width: 40, height: 40, borderRadius: "50%", background: "#f0fdf4", border: "2px solid #22c55e", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1rem", fontWeight: 700, color: "#15803d" }}>
                                {(r.user_name || "?")[0].toUpperCase()}
                              </div>
                              <div>
                                <strong style={{ color: "#1f2937" }}>{r.user_name || "Unknown"}</strong>
                                <div className="text-muted" style={{ fontSize: "0.78rem" }}>
                                  {r.user_email}{r.user_phone && " · 📞 " + r.user_phone}
                                </div>
                              </div>
                            </div>
                            <span className="badge bg-success">✓ Completed</span>
                          </div>

                          <div className="d-flex flex-wrap gap-3 mt-2" style={{ fontSize: "0.83rem", color: "#6b7280" }}>
                            <span>📅 {r.reservation_date}</span>
                            <span>🕐 {r.reservation_time}</span>
                            <span>👥 {r.number_of_guests} guests</span>
                            <span>🪑 {r.tables_reserved} table(s)</span>
                            <span>🕐 {new Date(r.created_at).toLocaleDateString()}</span>
                          </div>

                          {/* Review section */}
                          {r.review_data ? (
                            <div className="review-box">
                              <div className="d-flex align-items-center gap-2 mb-1">
                                <span>{Array.from({ length: 5 }, (_, i) => (
                                  <span key={i} style={{ color: i < r.review_data.rating ? "#f59e0b" : "#d1d5db" }}>&#9733;</span>
                                ))}</span>
                                <small className="text-muted">{r.review_data.rating}/5</small>
                                <small className="text-muted ms-auto">{new Date(r.review_data.created_at).toLocaleDateString()}</small>
                              </div>
                              {r.review_data.comment && (
                                <p className="mb-0" style={{ fontSize: "0.85rem", color: "#374151" }}>
                                  "{r.review_data.comment}"
                                </p>
                              )}
                              {r.review_data.images && r.review_data.images.length > 0 && (
                                <div className="d-flex gap-2 flex-wrap mt-2">
                                  {r.review_data.images.map((img, i) => (
                                    <img 
                                        key={i} 
                                        src={img.image} 
                                        alt="review" 
                                        className="rounded-3 border shadow-sm"
                                        style={{ width: "80px", height: "80px", objectFit: "cover", cursor: "pointer" }}
                                        onClick={() => window.open(img.image, '_blank')}
                                    />
                                  ))}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="no-review-box">No review submitted yet by customer.</div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                      <div style={{ fontSize: "2.5rem" }}>📂</div>
                      <p className="mt-2 mb-0">No completed reservations yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── REVIEWS TAB ── */}
              {activeTab === "reviews" && (
                <div className="card shadow border-0 p-4 rounded-4">
                  <h5 className="mb-4 fw-semibold" style={{ color: theme.primary }}>Guest Reviews</h5>
                  {loadingReviews ? (
                    <div className="text-center py-5"><div className="spinner-border spinner-border-sm me-2" />Loading...</div>
                  ) : reviews.length > 0 ? (
                    <div className="row g-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="col-12">
                          <div className="border rounded-4 p-3 shadow-sm bg-white">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div className="d-flex align-items-center gap-2">
                                <div 
                                  className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                  style={{ width: "40px", height: "40px", backgroundColor: theme.primary, fontSize: "1.1rem" }}
                                >
                                  {(rev.user_name || "G")[0].toUpperCase()}
                                </div>
                                <div>
                                  <h6 className="mb-0 fw-bold">{rev.user_name}</h6>
                                  <small className="text-muted">{new Date(rev.created_at).toLocaleDateString()}</small>
                                </div>
                              </div>
                              <div className="bg-warning-subtle text-warning px-2 py-1 rounded small fw-bold">
                                {rev.rating} ⭐
                              </div>
                            </div>
                            <p className="mb-3 text-secondary" style={{ fontStyle: "italic" }}>"{rev.comment}"</p>
                            
                            {/* Attached Images */}
                            {rev.images && rev.images.length > 0 && (
                              <div className="d-flex gap-2 flex-wrap">
                                {rev.images.map((img, i) => (
                                  <img 
                                    key={i} 
                                    src={img.image} 
                                    alt="review" 
                                    className="rounded-3 border shadow-sm"
                                    style={{ width: "100px", height: "100px", objectFit: "cover", cursor: "pointer" }}
                                    onClick={() => window.open(img.image, '_blank')}
                                  />
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-5 text-muted">
                       <div style={{ fontSize: "2.5rem" }}>⭐</div>
                       <p className="mt-2 mb-0">No reviews found.</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── EDIT TAB ── */}
              {activeTab === "edit" && editForm && (
                <div className="card border-0 shadow p-4 rounded-4">
                  <h5 className="fw-semibold mb-4" style={{ color: theme.primary, fontFamily: "'Playfair Display', serif" }}>Edit Restaurant Profile</h5>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Restaurant Name *</label>
                      <input type="text" className="form-control" value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">City *</label>
                      <input type="text" className="form-control" value={editForm.city} onChange={(e) => setEditForm({ ...editForm, city: e.target.value })} />
                    </div>
                    <div className="col-md-3">
                      <label className="form-label small fw-semibold">Area</label>
                      <input type="text" className="form-control" value={editForm.area} onChange={(e) => setEditForm({ ...editForm, area: e.target.value })} />
                    </div>

                    {/* --------- */}

                     <div className="col-12">
  <button
    type="button"
    className="btn btn-outline-primary"
    onClick={() => setShowMap(!showMap)}
  >
    🗺️ Pick Location from Map
  </button>
</div>

{showMap && (
  <div className="col-12">
    <LocationPicker onSelect={(coords) => setSelectedCoords(coords)} />
  </div>
)}

                    {/* --------- */}
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Badge / Type</label>
                      <select className="form-select" value={editForm.badge} onChange={(e) => setEditForm({ ...editForm, badge: e.target.value })}>
                        <option value="">Select Badge</option>
                        {badgeChoices.map((b) => <option key={b}>{b}</option>)}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Cuisine Type</label>
                      <input type="text" className="form-control" value={editForm.cuisine_type} onChange={(e) => setEditForm({ ...editForm, cuisine_type: e.target.value })} />
                    </div>
                    
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Avg Cost for Two (Rs.)</label>
                      <input type="number" className="form-control" min="0" value={editForm.average_cost_for_two} onChange={(e) => setEditForm({ ...editForm, average_cost_for_two: e.target.value })} />
                    </div>
                    <div className="col-md-6 border rounded-3 p-3 bg-light">
                      <label className="form-label small fw-bold text-primary mb-3">🕒 Operating Hours *</label>
                      <div className="row g-3">
                        <div className="col-12">
                          <label className="form-label x-small fw-semibold text-muted">Opening Time</label>
                          <div className="d-flex gap-1">
                            <select className="form-select form-select-sm" value={parseFrom24h(editForm.opening_time).h} 
                              onChange={(e) => {
                                const { m, p } = parseFrom24h(editForm.opening_time);
                                setEditForm({ ...editForm, opening_time: formatTo24h(e.target.value, m, p) });
                              }}>
                              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select className="form-select form-select-sm" value={parseFrom24h(editForm.opening_time).m} 
                              onChange={(e) => {
                                const { h, p } = parseFrom24h(editForm.opening_time);
                                setEditForm({ ...editForm, opening_time: formatTo24h(h, e.target.value, p) });
                              }}>
                              {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select className="form-select form-select-sm" value={parseFrom24h(editForm.opening_time).p} 
                              onChange={(e) => {
                                const { h, m } = parseFrom24h(editForm.opening_time);
                                setEditForm({ ...editForm, opening_time: formatTo24h(h, m, e.target.value) });
                              }}>
                              <option value="AM">AM</option><option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                        <div className="col-12">
                          <label className="form-label x-small fw-semibold text-muted">Closing Time</label>
                          <div className="d-flex gap-1">
                            <select className="form-select form-select-sm" value={parseFrom24h(editForm.closing_time).h} 
                              onChange={(e) => {
                                const { m, p } = parseFrom24h(editForm.closing_time);
                                setEditForm({ ...editForm, closing_time: formatTo24h(e.target.value, m, p) });
                              }}>
                              {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, "0")).map(h => <option key={h} value={h}>{h}</option>)}
                            </select>
                            <select className="form-select form-select-sm" value={parseFrom24h(editForm.closing_time).m} 
                              onChange={(e) => {
                                const { h, p } = parseFrom24h(editForm.closing_time);
                                setEditForm({ ...editForm, closing_time: formatTo24h(h, e.target.value, p) });
                              }}>
                              {["00", "15", "30", "45"].map(m => <option key={m} value={m}>{m}</option>)}
                            </select>
                            <select className="form-select form-select-sm" value={parseFrom24h(editForm.closing_time).p} 
                              onChange={(e) => {
                                const { h, m } = parseFrom24h(editForm.closing_time);
                                setEditForm({ ...editForm, closing_time: formatTo24h(h, m, e.target.value) });
                              }}>
                              <option value="AM">AM</option><option value="PM">PM</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold text-muted text-uppercase" style={{ letterSpacing: "0.05em", fontSize: "0.75rem" }}>Table Counts by Capacity</label>
                      <div className="row g-2">

                        <div className="col-md-3">
  <label className="form-label x-small">2-Guest Tables</label>
  <input
    type="number"
    className="form-control form-control-sm"
    min="0"
    value={editForm.tables_2_capacity}
    onChange={(e) =>
      setEditForm({ ...editForm, tables_2_capacity: e.target.value })
    }
  />
</div>

                        
                        <div className="col-md-3">
                          <label className="form-label x-small">4-Guest Tables</label>
                          <input type="number" className="form-control form-control-sm" min="0" value={editForm.tables_4_capacity} onChange={(e) => setEditForm({ ...editForm, tables_4_capacity: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label x-small">6-Guest Tables</label>
                          <input type="number" className="form-control form-control-sm" min="0" value={editForm.tables_6_capacity} onChange={(e) => setEditForm({ ...editForm, tables_6_capacity: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label x-small">8-Guest Tables</label>
                          <input type="number" className="form-control form-control-sm" min="0" value={editForm.tables_8_capacity} onChange={(e) => setEditForm({ ...editForm, tables_8_capacity: e.target.value })} />
                        </div>
                        <div className="col-md-3">
                          <label className="form-label x-small">10-Guest Tables</label>
                          <input type="number" className="form-control form-control-sm" min="0" value={editForm.tables_10_capacity} onChange={(e) => setEditForm({ ...editForm, tables_10_capacity: e.target.value })} />
                        </div>
                      </div>
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description *</label>
                      <textarea className="form-control" rows="3" value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Keywords (comma separated, for search optimization)</label>
                      <input type="text" className="form-control" placeholder="e.g. biriyani, rooftop, live music, vegan" value={editForm.keywords} onChange={(e) => setEditForm({ ...editForm, keywords: e.target.value })} />
                    </div>
                    {[
                      { label: "🖼️ Main Image", field: "image", preview: editImagePreview, setPreview: setEditImagePreview },
                      { label: "🧾 Extra Display Image", field: "extra_image", preview: extraImagePreview, setPreview: setExtraImagePreview },
                      { label: "🏛️ Interior Image", field: "interior_image", preview: interiorImagePreview, setPreview: setInteriorImagePreview },
                      { label: "📋 Menu Image", field: "menu_image", preview: menuImagePreview, setPreview: setMenuImagePreview },

                    ].map(({ label, field, preview, setPreview }) => (
                      <div key={field} className="col-md-4">
                        <label className="form-label small fw-semibold">{label}</label>
                        <input type="file" className="form-control" accept="image/*" onChange={(e) => handleEditImageUpload(e, field, setPreview)} />
                        <div className="image-preview-box">
                          {preview ? <img src={preview} alt={field + " preview"} /> : <span className="no-image">📷 No image uploaded</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="d-flex gap-2 mt-4">
                    <button className="btn-restaurant-primary btn" onClick={handleUpdateRestaurant}>Save Changes</button>
                    <button className="btn btn-outline-secondary" style={{ borderRadius: "10px" }} onClick={() => setActiveTab("dashboard")}>Cancel</button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}