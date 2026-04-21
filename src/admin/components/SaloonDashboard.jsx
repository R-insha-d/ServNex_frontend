import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import AxiosInstance from "../../Component/AxiosInstance";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Users, Scissors, CheckCircle, Home, ClipboardList, LogOut, Loader2, Star, MapPin } from "lucide-react";

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
  }, []);

  const fetchMySaloon = async () => {
    try {
      setLoading(true);
      const res = await AxiosInstance.get("api/saloons/me/");
      setMySaloon(res.data);
      fetchQueue();
    } catch (error) {
      console.warn("Error fetching saloon (might not exist):", error);
      // Mocking for frontend demonstration
      setMySaloon({
          id: 1, name: "Premium Glow Saloon & Spa", city: "New Delhi", area: "Downtown",
          service_type: "Styling, Spa, Haircuts", is_open: true, rating: "4.8",
          description: "Experience premium grooming and wellness in a luxurious atmosphere.",
      });
      fetchQueue(true);
    } finally {
      setLoading(false);
    }
  };

  const fetchQueue = async (mock = false) => {
    setLoadingQueue(true);
    if(mock) {
        setQueue([
            { id: 101, user_name: "Rinshad", service: "Haircut & Styling", status: "Waiting", created_at: new Date().toISOString() },
            { id: 102, user_name: "John Doe", service: "Beard Trim", status: "In Service", created_at: new Date(Date.now() - 600000).toISOString() }
        ]);
        setLoadingQueue(false);
        return;
    }
    try {
      const res = await AxiosInstance.get("api/saloon-dashboard/queue/");
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
      const res = await AxiosInstance.get("api/saloon-dashboard/previous-records/");
      setPreviousRecords(Array.isArray(res.data) ? res.data : (res.data.results || []));
    } catch (error) {
      console.error("Records error:", error);
    } finally {
      setLoadingRecords(false);
    }
  };

  const handleMarkInService = async (id) => {
    try {
      await AxiosInstance.patch(`api/queue/${id}/`, { status: "In Service" });
      setQueue(prev => prev.map((q) => q.id === id ? { ...q, status: "In Service" } : q));
    } catch (error) {
      toast.error("Failed to update status.");
    }
  };

  const handleMarkCompleted = async (id) => {
    if (!window.confirm("Complete service? Customer will be removed from queue.")) return;
    try {
      await AxiosInstance.patch(`api/queue/${id}/`, { status: "completed" });
      setQueue(prev => prev.filter((q) => q.id !== id));
    } catch (error) {
      toast.error("Failed to complete service.");
    }
  };

  const handleToggleStatus = async () => {
    if (!mySaloon || togglingStatus) return;
    try {
      setTogglingStatus(true);
      const newStatus = !mySaloon.is_open;
      const res = await AxiosInstance.patch("api/saloons/me/", { is_open: newStatus });
      setMySaloon(res.data);
      toast.success(`Saloon is now ${newStatus ? "OPEN" : "CLOSED"}`);
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setTogglingStatus(false);
    }
  };

  if (loading) return <div className="p-5 text-center"><div className="spinner-border me-2" />Loading Dashboard...</div>;
  if (!mySaloon) return <div className="p-5 text-center">No Saloon Profile Found.</div>;

  const tabs = ["dashboard", "queue", "records"];
  const tabIcons = { dashboard: "🏠", queue: "👥", records: "📋" };
  const tabLabels = { dashboard: "Dashboard", queue: "Live Queue", records: "Previous Records" };

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
      `}</style>

      <div className="container-fluid saloon-dashboard">
        <div className="row min-vh-100">

          {/* SIDEBAR */}
          <div
            className={"col-md-3 col-lg-2 p-4 d-flex flex-column " + (sidebarOpen ? "d-block" : "d-none d-md-flex")}
            style={{ background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`, minHeight: "100vh" }}
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
              <button className={"sidebar-tab-btn " + (activeTab === "records" ? "active" : "")} onClick={() => { setActiveTab("records"); fetchPreviousRecords(); setSidebarOpen(false); }}>
                <ClipboardList size={20} /> Records
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
                onClick={() => navigate("/", { replace: true })}>
                <LogOut size={16} /> Logout
              </button>
            </div>
          </div>

          {/* MAIN */}
          <div className="col-md-9 col-lg-10 p-0">
            {/* TOPBAR */}
            <div className="bg-white shadow-sm p-3 d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center gap-3">
                <button className="btn d-md-none" style={{ background: theme.secondary, color: "white", borderRadius: "8px" }} onClick={() => setSidebarOpen(true)}>☰</button>
                <h5 className="fw-semibold mb-0" style={{ color: theme.primary }}>
                  {activeTab === "dashboard" && "Overview"}
                  {activeTab === "queue" && "Live Queue Management"}
                  {activeTab === "records" && "Previous Records"}
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
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: theme.primary, lineHeight: "1" }}>{queue.length}</div>
                        <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Total in Queue</div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #10b981` }}>
                        <div className="stat-icon-wrapper text-success"><Scissors /></div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#059669", lineHeight: "1" }}>
                            {queue.filter(q => q.status === 'In Service').length}
                        </div>
                        <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Currently Serving</div>
                      </div>
                    </div>
                    <div className="col-md-6 col-lg-4">
                      <div className="stat-card shadow-sm bg-white" style={{ borderLeft: `4px solid #f59e0b` }}>
                        <div className="stat-icon-wrapper text-warning"><CheckCircle /></div>
                        <div style={{ fontSize: "2.5rem", fontWeight: 800, color: "#d97706", lineHeight: "1" }}>
                            {previousRecords.length}
                        </div>
                        <div className="text-secondary fw-semibold mt-2 text-uppercase" style={{ fontSize: "0.85rem", letterSpacing: "1px" }}>Completed Today</div>
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
                    <button className="btn btn-outline-primary rounded-pill d-flex align-items-center gap-2 px-4" onClick={() => fetchQueue(true)}>
                        <Loader2 size={16} className={loadingQueue ? "spin" : ""} /> Refresh
                    </button>
                  </div>

                  <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { 100% { transform: rotate(360deg); } }`}</style>

                  {loadingQueue ? (
                    <div className="text-center py-5 d-flex flex-column align-items-center">
                        <Loader2 size={40} color={theme.primary} className="spin mb-3" />
                        <p className="text-muted">Loading live queue data...</p>
                    </div>
                  ) : queue.length > 0 ? (
                    <div className="d-flex flex-column gap-3">
                      {queue.map((q, idx) => (
                        <div key={q.id} className="queue-card p-4 d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center">
                          <div className="d-flex align-items-center gap-4 mb-3 mb-md-0">
                            <div className="bg-primary bg-opacity-10 rounded-circle d-flex justify-content-center align-items-center fw-bold fs-4 text-primary shrink-0" style={{width: 60, height: 60, border: `2px solid ${theme.primary}55`}}>
                                #{idx + 1}
                            </div>
                            <div>
                                <h5 className="fw-bold mb-1" style={{ color: "#1e293b" }}>{q.user_name}</h5>
                                <div className="d-flex align-items-center gap-2">
                                    <span className="lux-badge bg-light text-secondary border"><Scissors size={14} className="me-1" />{q.service}</span>
                                    <span className="text-muted small">Arrived at {new Date(q.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                                </div>
                            </div>
                          </div>
                          
                          <div className="d-flex align-items-center gap-3">
                            <span className={`lux-badge ${q.status === 'In Service' ? 'bg-success text-white shadow-sm' : 'bg-warning text-dark'}`}>
                                {q.status === 'In Service' ? '🟢 In Service' : '⏳ Waiting'}
                            </span>
                            
                            {q.status === 'Waiting' && (
                                <button className="btn btn-primary px-4 py-2 fw-semibold rounded-pill" onClick={() => handleMarkInService(q.id)}>
                                    Start Service
                                </button>
                            )}
                            
                            {q.status === 'In Service' && (
                                <button className="btn btn-success px-4 py-2 fw-semibold rounded-pill d-flex align-items-center gap-2" onClick={() => handleMarkCompleted(q.id)}>
                                    <CheckCircle size={18} /> Finish
                                </button>
                            )}
                          </div>
                        </div>
                      ))}
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
              
              {/* RECORDS TAB */}
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
                                          <p className="text-muted small mb-0"><Scissors size={14} className="me-1" />{r.service}</p>
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

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
