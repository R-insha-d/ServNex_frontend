import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AxiosInstance from "../../Component/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Users, Scissors, CheckCircle, Home, ClipboardList, LogOut, Loader2, Star, MapPin, Plus, Trash2, Clock, Settings, Camera, ArrowDown, Image } from "lucide-react";

export default function SaloonDashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const [mySaloon, setMySaloon] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Saloon specific states
  const [queue, setQueue] = useState([]);
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [previousRecords, setPreviousRecords] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [togglingStatus, setTogglingStatus] = useState(false);
  const [stats, setStats] = useState(null);
  const [loadingStats, setLoadingStats] = useState(false);
  
  // Services Management
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const [serviceForm, setServiceForm] = useState({ name: "", price: "", duration: "30" });
  const [editingServiceId, setEditingServiceId] = useState(null);

  // Edit Profile States
  const [editForm, setEditForm] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Gallery States
  const [gallery, setGallery] = useState([]);
  const [loadingGallery, setLoadingGallery] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // Manual Queue Entry States
  const [showManualQueueModal, setShowManualQueueModal] = useState(false);
  const [manualQueueForm, setManualQueueForm] = useState({ guest_name: "", guest_phone: "", service_ids: [] });
  const [isAddingToQueue, setIsAddingToQueue] = useState(false);

  const theme = {
    primary: "#6366f1",     
    secondary: "#8b5cf6",   
    accent: "#c4b5fd",      
    light: "#f8fafc"       
  };

  const getImageUrl = (url) => {
    if (!url) return "";
    if (url.startsWith("http")) return url;
    return (AxiosInstance.defaults.baseURL || "http://127.0.0.1:8000") + url;
  };

  useEffect(() => { 
    fetchMySaloon(); 
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      setLoadingStats(true);
      const res = await AxiosInstance.get("api/salons/dashboard_stats/");
      setStats(res.data);
    } catch (error) {
      console.error("Stats error:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const fetchMySaloon = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("api/salons/me/");
      setMySaloon(res.data);
      fetchQueue();
    } catch (error) {
      console.warn("Error fetching saloon (might not exist):", error);
      toast.error("Failed to load salon profile.");
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async () => {
    setLoadingQueue(true);
    try {
      const res = await AxiosInstance.get("api/salon-dashboard/queue/");
      setQueue(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error("Queue error:", error);
    } finally {
      setLoadingQueue(false);
    }
  };

  const fetchPreviousRecords = async () => {
    try {
      setLoadingRecords(true);
      const res = await AxiosInstance.get("api/salon-dashboard/previous-records/");
      setPreviousRecords(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error("Records error:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchReviews = async () => {
    try {
      setLoadingReviews(true);
      const res = await AxiosInstance.get("api/reviews/?mine=true");
      setReviews(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error("Reviews error:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  const fetchGallery = async () => {
    try {
      setLoadingGallery(true);
      const res = await AxiosInstance.get("api/salon-dashboard/gallery/");
      setGallery(Array.isArray(res.data) ? res.data : []);
    } catch (error) {
      console.error("Gallery error:", error);
    } finally {
      setLoadingGallery(false);
    }
  };

  const handleGalleryUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("image", file);
    setUploadingGallery(true);
    try {
      const res = await AxiosInstance.post("api/salon-dashboard/gallery/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setGallery(prev => [...prev, res.data]);
      toast.success("Photo uploaded!");
    } catch (error) {
      toast.error("Failed to upload photo.");
    } finally {
      setUploadingGallery(false);
    }
  };

  const handleDeleteGalleryImage = async (imageId) => {
    if (!window.confirm("Delete this photo?")) return;
    try {
      await AxiosInstance.delete(`api/salon-dashboard/gallery/${imageId}/delete/`);
      setGallery(prev => prev.filter(img => img.id !== imageId));
      toast.success("Photo deleted.");
    } catch (error) {
      toast.error("Failed to delete photo.");
    }
  };

  const handleMarkInService = async (id) => {
    try {
      await AxiosInstance.patch(`api/queue/${id}/`, { status: "in_progress" });
      setQueue(prev => prev.map((q) => q.id === id ? { ...q, status: "in_progress" } : q));
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!window.confirm("Complete service? Customer will be removed from queue.")) return;
    try {
      await AxiosInstance.patch(`api/queue/${id}/`, { status: "completed" });
      setQueue(prev => prev.filter((q) => q.id !== id));
      fetchPreviousRecords(); // Refresh the records tab
      toast.success("Service marked as completed.");
    } catch (error) {
      toast.error("Failed to complete service.");
    }
  };

  const handleMoveDown = async (id) => {
    try {
      await AxiosInstance.post(`api/queue/${id}/move-down/`);
      fetchQueue();
      toast.success("Customer moved down.");
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to move down.");
    }
  };

  const handleToggleStatus = async () => {
    if (!mySaloon || togglingStatus) return;
    try {
      setTogglingStatus(true);
      const newStatus = !mySaloon.is_open;
      const res = await AxiosInstance.patch("api/salons/update_me/", { is_open: newStatus });
      setMySaloon(res.data);
      toast.success(`Saloon is now ${newStatus ? "OPEN" : "CLOSED"}`);
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  const handleOpenEdit = () => {
    setEditForm({
      name: mySaloon.name || "",
      city: mySaloon.city || "",
      area: mySaloon.area || "",
      address: mySaloon.address || "",
      phone: mySaloon.phone || "",
      description: mySaloon.description || "",
      badge: mySaloon.badge || "Premium Saloon",
      opening_time: mySaloon.opening_time || "09:00",
      closing_time: mySaloon.closing_time || "21:00",
      amenities: mySaloon.amenities || "",
      keywords: mySaloon.keywords || "",
      image: null
    });
    setEditImagePreview(getImageUrl(mySaloon.image));
    setActiveTab("edit");
  };

  const handleUpdateSaloon = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    const formData = new FormData();
    Object.entries(editForm).forEach(([key, val]) => {
      if (val !== null && val !== undefined) {
        if (key === "image" && val instanceof File) {
          formData.append(key, val);
        } else if (key !== "image") {
          formData.append(key, val);
        }
      }
    });

    try {
      const res = await AxiosInstance.patch("api/salons/update_me/", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      });
      setMySaloon(res.data);
      toast.success("Profile updated successfully!");
      setActiveTab("dashboard");
    } catch (error) {
      console.error("Update profile error:", error.response?.data);
      const serverError = error.response?.data;
      let errorMsg = "Failed to update profile.";
      if (serverError && typeof serverError === 'object') {
        errorMsg = Object.values(serverError).flat().join(", ");
      }
      toast.error(errorMsg);
    } finally {
      setIsUpdating(false);
    }
  };

  const fetchServices = async () => {
    if (!mySaloon) return;
    try {
      setLoadingServices(true);
      const res = await AxiosInstance.get(`api/salon-services/?salon=${mySaloon.id}`);
      const data = res.data;
      setServices(Array.isArray(data) ? data : (data.results || []));
    } catch (error) {
      console.error("Services fetch error:", error);
    } finally {
      setLoadingServices(false);
    }
  };

  const handleAddService = async (e) => {
    e.preventDefault();
    if (!serviceForm.name || !serviceForm.price) {
      toast.warn("Name and price are required");
      return;
    }
    try {
      if (editingServiceId) {
        // Update existing service
        const res = await AxiosInstance.patch(`api/salon-services/${editingServiceId}/`, serviceForm);
        setServices(prev => prev.map(s => s.id === editingServiceId ? res.data : s));
        toast.success("Service updated successfully");
      } else {
        // Add new service
        const res = await AxiosInstance.post("api/salon-services/", {
          ...serviceForm,
          salon: mySaloon.id
        });
        setServices(prev => [...prev, res.data]);
        toast.success("Service added successfully");
      }
      setShowServiceModal(false);
      setEditingServiceId(null);
      setServiceForm({ name: "", price: "", duration: "30" });
    } catch (error) {
      console.error("Service error details:", error.response?.data || error.message);
      const serverError = error.response?.data;
      let errorMsg = editingServiceId ? "Failed to update service" : "Failed to add service";
      if (serverError && typeof serverError === 'object') {
        errorMsg = Object.values(serverError).flat().join(", ");
      }
      toast.error(errorMsg);
    }
  };

  const handleEditService = (service) => {
    setEditingServiceId(service.id);
    setServiceForm({
      name: service.name,
      price: service.price,
      duration: service.duration.replace(/[^0-9]/g, '') // Extract digits only
    });
    setShowServiceModal(true);
  };

  const handleDeleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      await AxiosInstance.delete(`api/salon-services/${id}/`);
      setServices(services.filter(s => s.id !== id));
      toast.success("Service deleted");
    } catch (error) {
      toast.error("Failed to delete service");
    }
  };

  const handleAddManualQueue = async (e) => {
    e.preventDefault();
    if (!manualQueueForm.guest_name || manualQueueForm.service_ids.length === 0) {
        toast.warn("Name and at least one Service are required");
        return;
    }
    try {
        setIsAddingToQueue(true);
        const res = await AxiosInstance.post(`api/salons/${mySaloon.id}/join-queue/`, manualQueueForm);
        toast.success("Customer added to queue!");
        setShowManualQueueModal(false);
        setManualQueueForm({ guest_name: "", guest_phone: "", service_ids: [] });
        fetchQueue();
        fetchStats(); // Refresh stats too
    } catch (error) {
        toast.error(error.response?.data?.error || "Failed to add to queue");
    } finally {
        setIsAddingToQueue(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border me-2" />Loading Dashboard...</div>;
  if (!mySaloon) return <div className="p-5 text-center">No Saloon Profile Found.</div>;

  const tabs = ["dashboard", "queue", "services", "records", "gallery", "reviews", "edit"];
  const tabIcons = { dashboard: "🏠", queue: "👥", services: "✂️", records: "📋", gallery: "🖼️", reviews: "⭐", edit: "⚙️" };
  const tabLabels = { dashboard: "Dashboard", queue: "Live Queue", services: "Services", records: "Previous Records", gallery: "Gallery", reviews: "Reviews", edit: "Edit Profile" };

  return (
    <>
      <style>{`
        .saloon-dashboard { font-family: 'Poppins', sans-serif; background: ${theme.light}; }
        .sidebar-tab-btn { 
            background: transparent; color: rgba(255,255,255,0.7); border: none; border-radius: 12px; 
            padding: 12px 16px; width: 100%; text-align: left; font-size: 0.95rem; font-weight: 500; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer;
            display: flex; align-items: center; gap: 12px; margin-bottom: 4px;
        }
        .sidebar-tab-btn:hover { background: rgba(255,255,255,0.1); color: white; transform: translateX(4px); }
        .sidebar-tab-btn.active { 
            background: white; color: ${theme.primary}; font-weight: 600; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.1); transform: translateX(4px);
        }
        .stat-card { 
            border-radius: 20px; border: none; padding: 24px; transition: transform 0.3s ease, box-shadow 0.3s ease; 
            position: relative; overflow: hidden;
        }
        .stat-card:hover { transform: translateY(-5px); box-shadow: 0 15px 30px rgba(99,102,241,0.1) !important; }
        .stat-icon-wrapper {
            position: absolute; right: -10px; bottom: -10px; opacity: 0.1; transform: scale(3);
        }
        .queue-card { 
            border-radius: 16px; border: 1px solid #e2e8f0; background: white; 
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); 
        }
        .queue-card:hover { border-color: ${theme.accent}; box-shadow: 0 10px 25px rgba(99,102,241,0.1); transform: scale(1.01); }
        .hero-overlay { background: linear-gradient(to top, rgba(15,23,42,0.9) 0%, rgba(15,23,42,0.3) 100%); border-radius: 20px; }
        .lux-badge { padding: 6px 12px; border-radius: 8px; font-weight: 600; font-size: 0.8rem; }
        
        /* Remove default focus blue outline and box-shadow */
        .form-control:focus, .form-select:focus, .btn:focus {
            box-shadow: none !important;
            outline: none !important;
        }
        
        /* Premium focus state for input groups */
        .input-group {
            transition: all 0.3s ease;
        }
        .input-group:focus-within {
            border-color: ${theme.primary} !important;
            box-shadow: 0 0 0 4px ${theme.primary}15 !important;
        }
      `}</style>

      <div className="container-fluid saloon-dashboard">
        <div className="row" style={{ height: "100vh", overflow: "hidden" }}>

          {/* SIDEBAR */}
          <div
            className={"col-md-3 col-lg-2 p-4 d-flex flex-column " + (sidebarOpen ? "d-block" : "d-none d-md-flex")}
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, height: "100vh", position: "sticky", top: 0, overflowY: "auto" }}
          >
            <div className="mb-5 mt-2 text-white">
              <h4 className="fw-bold mb-0 d-flex align-items-center gap-2" style={{ fontSize: "1.4rem" }}>
                <Scissors size={24} /> ServNex
              </h4>
              <small style={{ color: "rgba(255,255,255,0.7)", fontSize: "0.8rem", marginLeft: "32px", letterSpacing: "1px" }}>SALOON MANAGER</small>
            </div>
            <div className="d-flex flex-column flex-grow-1">
              <button className={"sidebar-tab-btn " + (activeTab === "dashboard" ? "active" : "")} onClick={() => { setActiveTab("dashboard"); setSidebarOpen(false); }}>
                <Home size={20} /> Dashboard
              </button>
              <button className={"sidebar-tab-btn " + (activeTab === "queue" ? "active" : "")} onClick={() => { setActiveTab("queue"); setSidebarOpen(false); }}>
                <Users size={20} /> Live Queue
              </button>
              <button className={"sidebar-tab-btn " + (activeTab === "services" ? "active" : "")} onClick={() => { setActiveTab("services"); fetchServices(); setSidebarOpen(false); }}>
                <Scissors size={20} /> Services
              </button>
              <button className={"sidebar-tab-btn " + (activeTab === "records" ? "active" : "")} onClick={() => { setActiveTab("records"); fetchPreviousRecords(); setSidebarOpen(false); }}>
                <ClipboardList size={20} /> Records
              </button>
              <button className={"sidebar-tab-btn " + (activeTab === "gallery" ? "active" : "")} onClick={() => { setActiveTab("gallery"); fetchGallery(); setSidebarOpen(false); }}>
                <Image size={20} /> Gallery
              </button>
              <button className={"sidebar-tab-btn " + (activeTab === "reviews" ? "active" : "")} onClick={() => { setActiveTab("reviews"); fetchReviews(); setSidebarOpen(false); }}>
                <Star size={20} /> Reviews
              </button>
              <button className={"sidebar-tab-btn " + (activeTab === "edit" ? "active" : "")} onClick={() => { handleOpenEdit(); setSidebarOpen(false); }}>
                <Settings size={20} /> Edit Profile
              </button>
            </div>
            <div className="mt-auto pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.15)" }}>
              <div className="d-flex align-items-center gap-3 mb-3 text-white">
                 <div style={{ width: 40, height: 40, borderRadius: "50%", background: "white", color: theme.primary, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                    {mySaloon.name.charAt(0)}
                 </div>
                 <div style={{ lineHeight: "1.2" }}>
                    <small style={{ color: "white", fontSize: "0.85rem", fontWeight: "600", display: "block" }}>{mySaloon.name}</small>
                    <small style={{ color: "rgba(255,255,255,0.6)", fontSize: "0.75rem" }}>Manager View</small>
                 </div>
              </div>
              <button 
                className="btn w-100 d-flex align-items-center justify-content-center gap-2" 
                style={{ background: "rgba(255,255,255,0.15)", color: "white", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", transition: "all 0.2s" }} 
                onMouseEnter={(e) => e.currentTarget.style.background = "rgba(239, 68, 68, 0.8)"}
                onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.15)"}
                onClick={() => {
                  localStorage.clear();
                  navigate("/", { replace: true });
                }}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="col-md-9 col-lg-10 p-0" style={{ height: "100vh", overflowY: "auto" }}>
            {/* TOPBAR */}
            <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <button className="btn d-md-none" style={{ background: theme.secondary, color: "white", borderRadius: "8px" }} onClick={() => setSidebarOpen(true)}>☰</button>
                <h5 className="fw-semibold mb-0" style={{ color: theme.primary }}>
                  {activeTab === "dashboard" && "Overview"}
                  {activeTab === "queue" && "Live Queue Management"}
                  {activeTab === "services" && "Manage Services"}
                  {activeTab === "records" && "Previous Records"}
                  {activeTab === "gallery" && "Salon Gallery"}
                  {activeTab === "reviews" && "Customer Reviews"}
                  {activeTab === "edit" && "Update Salon Profile"}
                </h5>
              </div>

              <div className="d-flex align-items-center">
                <button 
                  onClick={handleToggleStatus}
                  disabled={togglingStatus}
                  className="btn d-flex align-items-center gap-2 px-4 py-2 rounded-pill shadow-sm"
                  style={{ background: mySaloon.is_open ? "#10b981" : "#ef4444", color: "white", fontWeight: "700", border: "none" }}
                >
                  {togglingStatus ? "Updating..." : (mySaloon.is_open ? "🟢 OPEN" : "🔴 CLOSED")}
                </button>
              </div>
            </div>

            <div className="p-4 p-md-5">
              {/* DASHBOARD TAB */}
              {activeTab === "dashboard" && (
                <div className="animate__animated animate__fadeIn">
                  
                  {/* Hero Banner */}
                  <div className="card border-0 shadow-sm mb-5 rounded-4 overflow-hidden position-relative" style={{ height: "240px" }}>
                    <img
                      src={mySaloon.image || "https://images.unsplash.com/photo-1560066984-138dadb4c035?q=80&w=1000&auto=format&fit=crop"}
                      alt="saloon cover"
                      style={{ height: "100%", width: "100%", objectFit: "cover" }}
                    />
                    <div className="position-absolute top-0 start-0 w-100 h-100 hero-overlay d-flex flex-column justify-content-end p-4 p-md-5 text-white">
                        <div className="d-flex align-items-center justify-content-between flex-wrap gap-3">
                            <div>
                                <div className="badge bg-primary mb-2 py-1 px-3 rounded-pill text-white shadow-sm border border-white border-opacity-25">PREMIUM SALOON</div>
                                <h2 className="fw-bold mb-2 display-6">{mySaloon.name}</h2>
                                <p className="mb-0 d-flex align-items-center gap-3 opacity-75">
                                    <span className="d-flex align-items-center gap-1"><MapPin size={16} /> {mySaloon.area}, {mySaloon.city}</span>
                                    {mySaloon.rating && <span className="d-flex align-items-center gap-1"><Star size={16} fill="#fbbf24" stroke="#fbbf24" /> {mySaloon.rating} Rating</span>}
                                </p>
                            </div>
                        </div>
                    </div>
                  </div>

                  <h5 className="fw-bold mb-4" style={{ color: "#1e293b" }}>Real-time Insights</h5>
                  <div className="row g-4 mb-4">
                    <div className="col-md-6 col-lg-4">
                      <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid ${theme.primary}` }}>
                        <div className="stat-icon-wrapper text-primary"><Users /></div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: theme.primary, lineHeight: "1" }}>
                            {loadingStats ? <div className="spinner-border spinner-border-sm" /> : (stats?.active_queue || 0)}
                        </div>
                        <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Active Queue</div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #10b981` }}>
                        <div className="stat-icon-wrapper text-success"><Scissors /></div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#059669", lineHeight: "1" }}>
                            {loadingStats ? <div className="spinner-border spinner-border-sm" /> : (stats?.today_completed || 0)}
                        </div>
                        <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Completed Today</div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #f59e0b` }}>
                        <div className="stat-icon-wrapper text-warning"><Star /></div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#d97706", lineHeight: "1" }}>
                            {loadingStats ? <div className="spinner-border spinner-border-sm" /> : (stats?.average_rating || "0.0")}
                        </div>
                        <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Average Rating</div>
                      </div>
                    </div>
                  </div>

                  <div className="row g-4 mb-4">
                    <div className="col-md-6 col-lg-4">
                        <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #8b5cf6` }}>
                            <div className="stat-icon-wrapper text-purple"><ClipboardList /></div>
                            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#7c3aed", lineHeight: "1" }}>
                                {loadingStats ? <div className="spinner-border spinner-border-sm" /> : (stats?.total_bookings || 0)}
                            </div>
                            <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Total Bookings</div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                        <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #ef4444` }}>
                            <div className="stat-icon-wrapper text-danger"><Star size={24} /></div>
                            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#dc2626", lineHeight: "1" }}>
                                {loadingStats ? <div className="spinner-border spinner-border-sm" /> : (stats?.total_reviews || 0)}
                            </div>
                            <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Total Reviews</div>
                        </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                        <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #10b981` }}>
                            <div className="stat-icon-wrapper text-success">₹</div>
                            <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#059669", lineHeight: "1" }}>
                                ₹{loadingStats ? <div className="spinner-border spinner-border-sm" /> : (stats?.today_revenue || 0)}
                            </div>
                            <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Today's Revenue</div>
                        </div>
                    </div>
                  </div>
                </div>
              )}

              {/* QUEUE TAB */}
              {activeTab === "queue" && (
                <div className="card shadow-sm border-0 p-4 p-md-5 rounded-4 animate__animated animate__fadeIn">
                  <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <div>
                        <h4 className="mb-1 fw-bold" style={{ color: "#1e293b" }}>Active Queue</h4>
                        <p className="text-muted small mb-0">Manage you live customer flow</p>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-primary rounded-pill d-flex align-items-center gap-2 px-4 shadow-sm" onClick={() => setShowManualQueueModal(true)}>
                            <Plus size={18} /> Add Customer
                        </button>
                        <button className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-4" onClick={() => fetchQueue()}>
                            <Loader2 size={16} className={loadingQueue ? "spin" : ""} /> Refresh
                        </button>
                    </div>
                  </div>

                  <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

                  {loadingQueue ? (
                    <div className="text-center py-5 d-flex flex-column align-items-center">
                        <Loader2 size={40} color={theme.primary} className="spin mb-3" />
                        <p className="text-muted">Loading live queue data...</p>
                    </div>
                  ) : queue.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {(() => {
                        const waitingList = queue.filter(q => q.status === 'pending' || q.status === 'Waiting');
                        const firstWaitingId = waitingList.length > 0 ? waitingList[0].id : null;
                        const lastWaitingId = waitingList.length > 0 ? waitingList[waitingList.length - 1].id : null;

                        return queue.map((q, idx) => (
                          <div key={q.id} className="queue-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                            <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                              <div className="bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center fw-bold fs-4 text-primary shrink-0" style={{width: 60, height: 60, border: `2px solid ${theme.primary}55`}}>
                                  #{idx + 1}
                              </div>
                              <div>
                                  <h5 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{q.user_name}</h5>
                                  <div className="d-flex align-items-center gap-2">
                                      <span className="lux-badge bg-light text-secondary border"><Scissors size={14} className="me-1" />{q.service_names || q.service_name || "Multiple Services"}</span>
                                      <span className="text-muted small">Arrived at {new Date(q.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                  </div>
                                  <div className="text-muted small mt-1 d-flex align-items-center gap-1">
                                      <Clock size={12} /> Phone: {q.user_phone || "N/A"}
                                  </div>
                              </div>
                            </div>
                            
                             <div className="d-flex align-items-center gap-3">
                              <span className={`lux-badge ${(q.status === 'in_progress' || q.status === 'In Service') ? 'bg-success text-white shadow-sm' : 'bg-warning text-dark'}`}>
                                  {(q.status === 'in_progress' || q.status === 'In Service') ? '🟢 In Service' : '⏳ Waiting'}
                              </span>
                              
                              {(q.status === 'pending' || q.status === 'Waiting') && (
                                  <div className="d-flex gap-2">
                                      {q.id === firstWaitingId && (
                                          <button className="btn btn-primary px-4 py-2 fw-semibold rounded-pill" onClick={() => handleMarkInService(q.id)}>
                                              Start Service
                                          </button>
                                      )}
                                      {q.id !== lastWaitingId && (
                                          <button className="btn btn-outline-secondary px-3 py-2 rounded-pill d-flex align-items-center gap-1" title="Move one spot down" onClick={() => handleMoveDown(q.id)}>
                                              <ArrowDown size={16} /> Down
                                          </button>
                                      )}
                                  </div>
                              )}
                              
                              {(q.status === 'in_progress' || q.status === 'In Service') && (
                                  <button className="btn btn-success px-4 py-2 fw-semibold rounded-pill d-flex align-items-center gap-2" onClick={() => handleMarkCompleted(q.id)}>
                                      <CheckCircle size={18} /> Finish
                                  </button>
                              )}
                            </div>
                          </div>
                        ));
                      })()}
                    </div>
                  ) : (
                    <div className="text-center py-5">
                        <div className="mb-4 text-opacity-50 text-secondary"><Users size={64} /></div>
                        <h5 className="fw-bold text-secondary">Queue is completely clear</h5>
                        <p className="text-muted">No customers are waiting at the moment.</p>
                    </div>
                  )}
                </div>
              )}
              {/* SERVICES TAB */}
              {activeTab === "services" && (
                <div className="card shadow-sm border-0 p-4 p-md-5 rounded-4 animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                      <h4 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Salon Services</h4>
                      <button className="btn btn-primary d-flex align-items-center gap-2 px-4 py-2 rounded-pill fw-semibold" onClick={() => setShowServiceModal(true)}>
                          <Plus size={18} /> Add New Service
                      </button>
                  </div>
                  
                  {loadingServices ? (
                      <div className="text-center py-5 d-flex flex-column align-items-center">
                          <Loader2 size={40} color={theme.primary} className="spin mb-3" />
                          <p className="text-muted">Loading services...</p>
                      </div>
                  ) : services.length > 0 ? (
                      <div className="row g-4">
                          {services.map((s) => (
                              <div key={s.id} className="col-md-6 col-lg-4">
                                  <div className="queue-card p-4 h-100 d-flex flex-column">
                                      <div className="d-flex justify-content-between align-items-start mb-3">
                                          <div className="p-2 rounded-3" style={{ background: `${theme.primary}15`, color: theme.primary }}>
                                              <Scissors size={24} />
                                          </div>
                                          <div className="d-flex gap-2">
                                              <button className="btn btn-outline-primary btn-sm border-0" onClick={() => handleEditService(s)}>
                                                  <Settings size={18} />
                                              </button>
                                              <button className="btn btn-outline-danger btn-sm border-0" onClick={() => handleDeleteService(s.id)}>
                                                  <Trash2 size={18} />
                                              </button>
                                          </div>
                                      </div>
                                      <h5 className="fw-bold mb-1">{s.name}</h5>
                                      <div className="d-flex align-items-center gap-2 mb-3 text-muted small">
                                          <Clock size={14} /> {s.duration} mins
                                      </div>
                                      <div className="mt-auto pt-3 border-top d-flex justify-content-between align-items-center">
                                          <span className="text-muted small">Starting from</span>
                                          <span className="fw-bold fs-5 text-primary">₹{s.price}</span>
                                      </div>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-5">
                          <div className="mb-4 text-opacity-50 text-secondary"><Scissors size={64} /></div>
                          <h5 className="fw-bold text-secondary">No services added yet</h5>
                          <p className="text-muted">Add the services your salon provides to start taking bookings.</p>
                      </div>
                  )}
                </div>
              )}

              {/* SERVICE MODAL */}
              {showServiceModal && (
                <div 
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" 
                  style={{ zIndex: 3000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)" }}
                >
                  <div 
                    className="bg-white rounded-4 shadow-xl animate__animated animate__fadeInUp overflow-hidden" 
                    style={{ width: "100%", maxWidth: "500px", border: "1px solid rgba(99, 102, 241, 0.1)" }}
                  >
                    {/* Modal Header */}
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 bg-primary text-white shadow-sm">
                                <Scissors size={20} />
                            </div>
                            <h4 className="fw-bold mb-0" style={{ color: "#1e293b", fontSize: "1.25rem" }}>
                                {editingServiceId ? "Refine Service" : "Add New Service"}
                            </h4>
                        </div>
                        <button 
                            className="btn btn-light rounded-circle p-2 d-flex align-items-center justify-content-center border-0" 
                            onClick={() => { setShowServiceModal(false); setEditingServiceId(null); setServiceForm({ name: "", price: "", duration: "30" }); }}
                        >
                            <Plus size={20} style={{ transform: "rotate(45deg)" }} />
                        </button>
                    </div>

                    <form onSubmit={handleAddService} className="p-4 p-md-5">
                      <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2" style={{ letterSpacing: "0.5px" }}>Service Name</label>
                        <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden border">
                            <span className="input-group-text border-0 bg-white text-muted ps-3"><Scissors size={18} /></span>
                            <input 
                              type="text" 
                              className="form-control border-0 ps-2" 
                              placeholder="e.g. Master Haircut" 
                              value={serviceForm.name} 
                              onChange={(e) => setServiceForm({...serviceForm, name: e.target.value})}
                              style={{ fontSize: "1rem", fontWeight: "500" }}
                              required
                            />
                        </div>
                      </div>

                      <div className="row g-4 mb-5">
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2" style={{ letterSpacing: "0.5px" }}>Price (₹)</label>
                          <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden border">
                              <span className="input-group-text border-0 bg-white text-primary fw-bold ps-3">₹</span>
                              <input 
                                type="number" 
                                className="form-control border-0 ps-1" 
                                placeholder="0" 
                                value={serviceForm.price} 
                                onChange={(e) => setServiceForm({...serviceForm, price: e.target.value})}
                                style={{ fontSize: "1rem", fontWeight: "600" }}
                                required
                              />
                          </div>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2" style={{ letterSpacing: "0.5px" }}>Duration (mins)</label>
                          <div className="input-group input-group-lg shadow-sm rounded-3 overflow-hidden border">
                              <span className="input-group-text border-0 bg-white text-muted ps-3"><Clock size={18} /></span>
                              <input 
                                type="number" 
                                className="form-control border-0 ps-1" 
                                placeholder="30" 
                                value={serviceForm.duration} 
                                onChange={(e) => setServiceForm({...serviceForm, duration: e.target.value})}
                                style={{ fontSize: "1rem", fontWeight: "500" }}
                              />
                          </div>
                        </div>
                      </div>

                      <div className="d-flex gap-3 pt-2">
                        <button 
                            type="button" 
                            className="btn btn-light flex-grow-1 rounded-pill fw-bold py-3 text-secondary" 
                            onClick={() => { setShowServiceModal(false); setEditingServiceId(null); setServiceForm({ name: "", price: "", duration: "30" }); }}
                            style={{ border: "1px solid #e2e8f0" }}
                        >
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn btn-primary flex-grow-1 rounded-pill fw-bold py-3 shadow-lg hover-scale"
                            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, border: "none" }}
                        >
                            {editingServiceId ? "Save Changes" : "Create Service"}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* GALLERY TAB */}
              {activeTab === "gallery" && (
                <div className="animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center mb-4">
                    <div>
                      <h4 className="fw-bold mb-1" style={{ color: "#1e293b" }}>Salon Gallery</h4>
                      <p className="text-muted small mb-0">Showcase your work — upload photos customers will see on your salon page.</p>
                    </div>
                    <label
                      className="btn btn-primary rounded-pill px-4 py-2 fw-semibold d-flex align-items-center gap-2"
                      style={{ cursor: "pointer" }}
                    >
                      {uploadingGallery ? <Loader2 size={18} className="spin" /> : <Plus size={18} />}
                      {uploadingGallery ? "Uploading..." : "Add Photo"}
                      <input type="file" className="d-none" accept="image/*" onChange={handleGalleryUpload} disabled={uploadingGallery} />
                    </label>
                  </div>

                  {loadingGallery ? (
                    <div className="text-center py-5"><Loader2 size={32} className="spin text-primary" /></div>
                  ) : gallery.length === 0 ? (
                    <div className="text-center py-5 rounded-4" style={{ background: "#f8fafc", border: "2px dashed #e2e8f0" }}>
                      <Image size={48} color="#94a3b8" className="mb-3" />
                      <h6 className="text-muted fw-semibold">No gallery photos yet</h6>
                      <p className="text-muted small">Upload photos to showcase your salon to customers.</p>
                    </div>
                  ) : (
                    <div className="row g-3">
                      {gallery.map(img => (
                        <div key={img.id} className="col-6 col-md-4 col-lg-3">
                          <div className="position-relative rounded-3 overflow-hidden shadow-sm" style={{ paddingTop: "100%", background: "#f1f5f9" }}>
                            <img
                              src={img.image}
                              alt="Gallery"
                              className="position-absolute top-0 start-0 w-100 h-100"
                              style={{ objectFit: "cover" }}
                            />
                            <button
                              onClick={() => handleDeleteGalleryImage(img.id)}
                              className="position-absolute top-0 end-0 m-2 btn btn-sm"
                              style={{ background: "rgba(239,68,68,0.9)", color: "white", borderRadius: "8px", padding: "4px 8px", border: "none" }}
                              title="Delete photo"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* REVIEWS TAB */}
              {activeTab === "reviews" && (
                <div className="card shadow-sm border-0 p-4 p-md-5 rounded-4 animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                      <h4 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Customer Reviews</h4>
                      <div className="d-flex align-items-center gap-2">
                        <Star size={20} fill="#fbbf24" stroke="#fbbf24" />
                        <span className="fw-bold fs-5">{stats?.average_rating || "0.0"}</span>
                        <span className="text-muted">({stats?.total_reviews || 0} reviews)</span>
                      </div>
                  </div>

                  {loadingReviews ? (
                    <div className="text-center py-5"><Loader2 size={32} className="spin text-primary" /></div>
                  ) : reviews.length === 0 ? (
                    <div className="text-center py-5">
                      <Star size={48} color="#cbd5e1" className="mb-3" />
                      <h5 className="text-muted fw-semibold">No reviews yet</h5>
                      <p className="text-muted small">Reviews from your customers will appear here.</p>
                    </div>
                  ) : (
                    <div className="d-flex flex-column gap-4">
                      {reviews.map((rev) => (
                        <div key={rev.id} className="p-4 rounded-4 border bg-white shadow-sm hover-scale transition-all">
                          <div className="d-flex justify-content-between align-items-start mb-3">
                            <div className="d-flex align-items-center gap-3">
                              <div className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center fw-bold" style={{ width: 48, height: 48, fontSize: "1.2rem" }}>
                                {rev.user_name?.charAt(0) || "U"}
                              </div>
                              <div>
                                <h6 className="fw-bold mb-0">{rev.user_name}</h6>
                                <small className="text-muted">{new Date(rev.created_at).toLocaleDateString()}</small>
                              </div>
                            </div>
                            <div className="d-flex align-items-center gap-1 bg-warning bg-opacity-10 px-3 py-1 rounded-pill">
                              <Star size={16} fill="#fbbf24" stroke="#fbbf24" />
                              <span className="fw-bold text-dark">{rev.rating}.0</span>
                            </div>
                          </div>
                          <p className="mb-0 text-secondary" style={{ fontStyle: "italic" }}>"{rev.comment}"</p>
                          {rev.images && rev.images.length > 0 && (
                            <div className="d-flex gap-2 mt-3 overflow-auto pb-2">
                              {rev.images.map((img, idx) => (
                                <img key={idx} src={img.image} alt="Review" className="rounded-3" style={{ width: 80, height: 80, objectFit: "cover" }} />
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* EDIT TAB */}
              {activeTab === "edit" && editForm && (
                <div className="card shadow-sm border-0 p-4 p-md-5 rounded-4 animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                    <h4 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Update Salon Profile</h4>
                  </div>
                  <form onSubmit={handleUpdateSaloon}>
                    <div className="row g-4">
                      {/* Image Upload */}
                      <div className="col-12 mb-2 text-center">
                        <div className="position-relative mx-auto shadow-sm overflow-hidden" style={{ width: "200px", height: "200px", borderRadius: "24px", border: `3px solid ${theme.primary}20` }}>
                          <img src={editImagePreview} alt="Saloon preview" className="w-100 h-100 object-fit-cover" />
                          <label className="position-absolute bottom-0 end-0 m-2 p-2 rounded-circle bg-white shadow-sm cursor-pointer hover-scale" style={{ border: `1px solid ${theme.primary}30` }}>
                            <Camera size={20} color={theme.primary} />
                            <input type="file" className="d-none" accept="image/*" onChange={(e) => {
                              const file = e.target.files[0];
                              if(file) {
                                setEditForm({...editForm, image: file});
                                setEditImagePreview(URL.createObjectURL(file));
                              }
                            }} />
                          </label>
                        </div>
                        <p className="text-center text-muted small mt-2">Click the camera icon to update cover image</p>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Salon Name</label>
                        <input type="text" className="form-control rounded-3 py-2" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} required />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Phone Number</label>
                        <input type="text" className="form-control rounded-3 py-2" value={editForm.phone} onChange={(e) => setEditForm({...editForm, phone: e.target.value})} />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">City</label>
                        <input type="text" className="form-control rounded-3 py-2" value={editForm.city} onChange={(e) => setEditForm({...editForm, city: e.target.value})} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Area</label>
                        <input type="text" className="form-control rounded-3 py-2" value={editForm.area} onChange={(e) => setEditForm({...editForm, area: e.target.value})} required />
                      </div>
                      <div className="col-md-4">
                        <label className="form-label fw-semibold">Badge</label>
                        <select className="form-select rounded-3 py-2" value={editForm.badge} onChange={(e) => setEditForm({...editForm, badge: e.target.value})}>
                          <option value="Premium Saloon">Premium Saloon</option>
                          <option value="Budget Friendly">Budget Friendly</option>
                          <option value="Spa & Wellness">Spa & Wellness</option>
                          <option value="Unisex">Unisex</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Address</label>
                        <input type="text" className="form-control rounded-3 py-2" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Opening Time</label>
                        <input type="time" className="form-control rounded-3 py-2" value={editForm.opening_time} onChange={(e) => setEditForm({...editForm, opening_time: e.target.value})} />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-semibold">Closing Time</label>
                        <input type="time" className="form-control rounded-3 py-2" value={editForm.closing_time} onChange={(e) => setEditForm({...editForm, closing_time: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Amenities (comma separated)</label>
                        <input type="text" className="form-control rounded-3 py-2" placeholder="e.g. WiFi, AC, Parking" value={editForm.amenities} onChange={(e) => setEditForm({...editForm, amenities: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Search Keywords (comma separated)</label>
                        <input type="text" className="form-control rounded-3 py-2" placeholder="e.g. bridal, spa, haircut" value={editForm.keywords} onChange={(e) => setEditForm({...editForm, keywords: e.target.value})} />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-semibold">Description</label>
                        <textarea className="form-control rounded-3 py-2" rows="4" value={editForm.description} onChange={(e) => setEditForm({...editForm, description: e.target.value})}></textarea>
                      </div>
                    </div>

                    <div className="mt-5 d-flex gap-3">
                      <button type="button" className="btn btn-light rounded-pill px-5 py-2 fw-semibold" onClick={() => setActiveTab("dashboard")}>Cancel</button>
                      <button type="submit" className="btn btn-primary rounded-pill px-5 py-2 fw-semibold" disabled={isUpdating}>
                        {isUpdating ? <Loader2 size={20} className="spin mx-auto" /> : "Save Changes"}
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {activeTab === "records" && (
                <div className="card shadow-sm border-0 p-4 p-md-5 rounded-4 animate__animated animate__fadeIn">
                  <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
                      <h4 className="mb-0 fw-bold" style={{ color: "#1e293b" }}>Previous Records</h4>
                  </div>
                  
                  {loadingRecords ? (
                      <div className="text-center py-5 d-flex flex-column align-items-center">
                          <Loader2 size={40} color={theme.primary} className="spin mb-3" />
                          <p className="text-muted">Loading history...</p>
                      </div>
                  ) : previousRecords.length > 0 ? (
                      <div className="d-flex flex-column gap-3">
                          {previousRecords.map((r) => (
                              <div key={r.id} className="queue-card p-4">
                                  <div className="d-flex justify-content-between align-items-center">
                                      <div>
                                          <h6 className="fw-bold mb-1">{r.user_name}</h6>
                                          <p className="text-muted small mb-0">Service: {r.service_names || r.service_name}</p>
                                      </div>
                                      <span className="lux-badge bg-success bg-opacity-10 text-success"><CheckCircle size={14} className="me-1"/> Completed</span>
                                  </div>
                              </div>
                          ))}
                      </div>
                  ) : (
                      <div className="text-center py-5">
                          <div className="mb-4 text-opacity-50 text-secondary"><ClipboardList size={64} /></div>
                          <h5 className="fw-bold text-secondary">No records found</h5>
                          <p className="text-muted">Completed services will appear here.</p>
                      </div>
                  )}
                </div>
              )}

              {/* MANUAL QUEUE MODAL */}
              {showManualQueueModal && (
                <div 
                  className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3" 
                  style={{ zIndex: 3000, background: "rgba(15, 23, 42, 0.4)", backdropFilter: "blur(8px)" }}
                >
                  <div 
                    className="bg-white rounded-4 shadow-xl animate__animated animate__fadeInUp overflow-hidden" 
                    style={{ width: "100%", maxWidth: "500px", border: "1px solid rgba(99, 102, 241, 0.1)" }}
                  >
                    <div className="p-4 border-bottom d-flex justify-content-between align-items-center" style={{ background: "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)" }}>
                        <div className="d-flex align-items-center gap-3">
                            <div className="p-2 rounded-3 bg-primary text-white shadow-sm">
                                <Users size={20} />
                            </div>
                            <h4 className="fw-bold mb-0" style={{ color: "#1e293b", fontSize: "1.25rem" }}>Manual Queue Entry</h4>
                        </div>
                        <button className="btn btn-light rounded-circle p-2 border-0" onClick={() => setShowManualQueueModal(false)}>
                            <Plus size={20} style={{ transform: "rotate(45deg)" }} />
                        </button>
                    </div>

                    <form onSubmit={handleAddManualQueue} className="p-4 p-md-5">
                      <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2">Customer Name</label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg rounded-3 shadow-sm" 
                          placeholder="Full Name" 
                          value={manualQueueForm.guest_name} 
                          onChange={(e) => setManualQueueForm({...manualQueueForm, guest_name: e.target.value})}
                          required
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2">Phone Number</label>
                        <input 
                          type="text" 
                          className="form-control form-control-lg rounded-3 shadow-sm" 
                          placeholder="Phone (Optional)" 
                          value={manualQueueForm.guest_phone} 
                          onChange={(e) => setManualQueueForm({...manualQueueForm, guest_phone: e.target.value})}
                        />
                      </div>
                      <div className="mb-4">
                        <label className="form-label small fw-bold text-uppercase tracking-wider text-secondary mb-2">Select Services</label>
                        <div className="rounded-3 shadow-sm border p-3" style={{ maxHeight: "200px", overflowY: "auto" }}>
                          {services.map(s => (
                            <div key={s.id} className="form-check mb-2">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                id={`service-${s.id}`}
                                checked={manualQueueForm.service_ids.includes(s.id)}
                                onChange={(e) => {
                                  const ids = [...manualQueueForm.service_ids];
                                  if (e.target.checked) {
                                    ids.push(s.id);
                                  } else {
                                    const index = ids.indexOf(s.id);
                                    if (index > -1) ids.splice(index, 1);
                                  }
                                  setManualQueueForm({...manualQueueForm, service_ids: ids});
                                }}
                              />
                              <label className="form-check-label d-flex justify-content-between w-100" htmlFor={`service-${s.id}`}>
                                <span>{s.name}</span>
                                <span className="text-primary fw-bold">₹{s.price}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="d-flex gap-3 pt-2">
                        <button type="button" className="btn btn-light flex-grow-1 rounded-pill fw-bold py-3" onClick={() => setShowManualQueueModal(false)}>Cancel</button>
                        <button 
                            type="submit" 
                            className="btn btn-primary flex-grow-1 rounded-pill fw-bold py-3 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, border: "none" }}
                            disabled={isAddingToQueue}
                        >
                            {isAddingToQueue ? <Loader2 size={20} className="spin mx-auto" /> : "Add to Queue"}
                        </button>
                      </div>
                    </form>
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
