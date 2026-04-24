import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import AxiosInstance from "../Component/AxiosInstance";
import Header from "../Component/Header";
import { toast } from "react-toastify";
import { MapPin, Phone, Star, Clock, Users, ArrowRight, ShieldCheck, CheckCircle2 } from "lucide-react";
import { Modal, Box, Typography, Button, CircularProgress } from "@mui/material";
import "./SaloonDetail.css";

export default function SaloonDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [saloon, setSaloon] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [queueStatus, setQueueStatus] = useState(null);
    const [isJoining, setIsJoining] = useState(false);
    
    const [modalOpen, setModalOpen] = useState(false);
    const [joinSuccess, setJoinSuccess] = useState(false);
    const [selectedService, setSelectedService] = useState("");

    useEffect(() => {
        setLoading(true);
        // Fetch salon details
        AxiosInstance.get(`api/salons/${id}/`)
            .then(res => setSaloon(res.data))
            .catch(err => {
                console.error("Error fetching salon:", err);
                setError("Saloon not found or server error.");
            })
            .finally(() => setLoading(false));

        // Fetch Queue Status
        fetchQueueStatus();
        
        // Simulating live queue updates
        const timer = setInterval(fetchQueueStatus, 30000);
        return () => clearInterval(timer);
    }, [id]);

    const fetchQueueStatus = () => {
        AxiosInstance.get(`api/salons/${id}/queue-status/`)
            .then(res => setQueueStatus(res.data))
            .catch(() => {
                // Mock queue status if fetch fails
                setQueueStatus({
                    current_queue_length: 0,
                    estimated_wait_time: 0
                });
            });
    };

    const handleJoinQueue = () => {
        const token = localStorage.getItem("access");
        if (!token) {
            toast.error("Please login to join the queue.");
            navigate("/auth");
            return;
        }
        if (!selectedService) {
            toast.warning("Please select a service first.");
            return;
        }

        setIsJoining(true);
        AxiosInstance.post(`api/salons/${id}/join-queue/`, { service: selectedService })
            .then(res => {
                setJoinSuccess(true);
                toast.success("Successfully joined the queue!");
                fetchQueueStatus();
            })
            .catch(err => {
                const msg = err.response?.data?.error || "Failed to join queue. Please try again.";
                toast.error(msg);
            })
            .finally(() => setIsJoining(false));
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setJoinSuccess(false);
        setSelectedService("");
    };

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center vh-100">
            <CircularProgress style={{ color: "#6366f1" }} />
        </div>
    );
    if (error) return <div className="text-center py-5"><h4>{error}</h4><Link to="/salon" className="btn btn-primary mt-3">Go Back</Link></div>;
    if (!saloon) return <div className="text-center py-5"><h4>Saloon not found</h4></div>;

    const services = saloon.services || [];

    return (
        <div className="saloon-detail-page bg-light min-vh-100 pb-5">
            <Header />

            <div className="saloon-hero">
                <img src={saloon.image || "https://images.unsplash.com/photo-1521590832167-7bfc1748facd?auto=format&fit=crop&q=80&w=1000"} alt={saloon.name} className="saloon-hero-img" />
                <div className="saloon-hero-overlay"></div>
                <div className="container position-relative h-100">
                    <div className="saloon-hero-content">
                        <div className="d-flex align-items-center gap-2 mb-2">
                            <div className="badge bg-primary text-uppercase shadow-sm">{saloon.badge || "Premium Saloon"}</div>
                            <div className={`badge ${saloon.is_open ? 'bg-success' : 'bg-danger'} text-uppercase shadow-sm`}>
                                {saloon.is_open ? 'Open Now' : 'Closed'}
                            </div>
                        </div>
                        <h1 className="display-4 fw-bold text-white mb-2">{saloon.name}</h1>
                        <div className="d-flex flex-wrap align-items-center gap-4">
                            <p className="lead text-white-50 mb-0 d-flex align-items-center gap-2">
                                <MapPin size={20} /> {saloon.area}, {saloon.city}
                            </p>
                            {saloon.opening_time && (
                                <p className="lead text-white-50 mb-0 d-flex align-items-center gap-2">
                                    <Clock size={20} /> {saloon.opening_time.slice(0, 5)} - {saloon.closing_time.slice(0, 5)}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mt-n5 position-relative z-index-100">
                <div className="row g-4">
                    {/* Left Column: Details & Services */}
                    <div className="col-lg-8">
                        <div className="card border-0 shadow-sm rounded-4 p-4 mb-4">
                            <h3 className="fw-bold mb-3">About Us</h3>
                            <p className="text-secondary">{saloon.description}</p>
                            
                            <hr className="my-4" />
                            
                            <h4 className="fw-bold mb-4">Services Menu</h4>
                            <div className="services-grid">
                                {services.map((srv, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`service-item-card ${selectedService === srv.name ? 'selected' : ''}`}
                                        onClick={() => setSelectedService(srv.name)}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <h6 className="mb-0 fw-bold">{srv.name}</h6>
                                            {selectedService === srv.name && <CheckCircle2 size={18} className="text-primary" />}
                                        </div>
                                        <div className="text-muted small mt-2 d-flex justify-content-between">
                                            <span><Clock size={14} className="me-1" /> {srv.duration}</span>
                                            <span className="fw-bold text-dark">{srv.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Queue Card */}
                    <div className="col-lg-4">
                        <div className="card queue-card border-0 shadow-lg rounded-4 p-4 sticky-top" style={{ top: "100px" }}>
                            <div className="text-center mb-4">
                                <div className="queue-pulse mx-auto mb-3">
                                    <Users size={32} color="#fff" />
                                </div>
                                <h4 className="fw-bold mb-1">Live Queue Status</h4>
                                <p className="text-muted small">Updated in real-time</p>
                            </div>

                            <div className="d-flex justify-content-between align-items-center bg-light rounded-3 p-3 mb-3 border">
                                <div className="text-center">
                                    <h2 className="fw-bold text-primary mb-0">{queueStatus?.current_queue_length || 0}</h2>
                                    <span className="small text-secondary">People Ahead</span>
                                </div>
                                <div className="vr"></div>
                                <div className="text-center">
                                    <h2 className="fw-bold text-warning mb-0">{queueStatus?.estimated_wait_time || 0}<span className="fs-6"> m</span></h2>
                                    <span className="small text-secondary">Est. Wait</span>
                                </div>
                            </div>

                            <div className="alert alert-info bg-opacity-10 border-0 rounded-3 small d-flex gap-2">
                                <Clock size={40} className="text-info flex-shrink-0" />
                                <span>Save time! Join the queue virtually and arrive exactly when it's your turn.</span>
                            </div>

                            <button 
                                className="btn btn-primary w-100 py-3 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 mt-3 queue-btn"
                                onClick={() => setModalOpen(true)}
                                disabled={!selectedService}
                            >
                                {selectedService ? "Join Queue Now" : "Select a Service First"} <ArrowRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Join Queue Modal */}
            <Modal open={modalOpen} onClose={handleCloseModal} aria-labelledby="queue-modal">
                <Box className="queue-modal-box">
                    {!joinSuccess ? (
                        <>
                            <h4 className="fw-bold mb-4 text-center">Confirm Your Spot</h4>
                            <div className="bg-light p-3 rounded-3 mb-4">
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Saloon:</span>
                                    <span className="fw-bold">{saloon.name}</span>
                                </div>
                                <div className="d-flex justify-content-between mb-2">
                                    <span className="text-muted">Service:</span>
                                    <span className="fw-bold text-primary">{selectedService}</span>
                                </div>
                                <div className="d-flex justify-content-between">
                                    <span className="text-muted">Estimated Wait:</span>
                                    <span className="fw-bold text-warning">{queueStatus?.estimated_wait_time} mins</span>
                                </div>
                            </div>
                            <Button 
                                variant="contained" 
                                fullWidth 
                                style={{ background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)", padding: "12px", borderRadius: "12px", textTransform: "none", fontSize: "16px", fontWeight: "bold" }}
                                onClick={handleJoinQueue}
                                disabled={isJoining}
                            >
                                {isJoining ? <CircularProgress size={24} color="inherit" /> : "Confirm & Join Queue"}
                            </Button>
                        </>
                    ) : (
                        <div className="text-center py-4">
                            <div className="success-checkmark mx-auto mb-3">
                                <CheckCircle2 size={60} className="text-success" />
                            </div>
                            <h3 className="fw-bold text-success mb-2">You're in the Queue!</h3>
                            <p className="text-muted mb-4">Your virtual ticket has been generated. Keep an eye on your dashboard or SMS for your turn.</p>
                            <Link to="/my-bookings" className="btn btn-outline-primary rounded-pill px-4">View My Queue Ticket</Link>
                        </div>
                    )}
                </Box>
            </Modal>
        </div>
    );
}
