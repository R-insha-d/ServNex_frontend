import React, { useState, useEffect } from 'react';
import { 
  Users, Hotel, Utensils, 
  TrendingUp, CreditCard, Calendar 
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 transition-all hover-translate-y" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className={`p-3 rounded-4`} style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea' }}>
                {icon}
            </div>
            {trend && (
                <div className={`badge rounded-pill text-${trend > 0 ? 'success' : 'danger'} bg-${trend > 0 ? 'success' : 'danger'}-subtle px-2 py-1`} style={{ fontSize: '11px', fontWeight: '600' }}>
                    {trend > 0 ? '+' : ''}{trend}%
                </div>
            )}
        </div>
        <h6 className="text-secondary fw-bold mb-1" style={{ fontSize: '12px', letterSpacing: '0.5px', color: '#718096' }}>{title}</h6>
        <h3 className="fw-bold mb-0" style={{ letterSpacing: '-0.8px', color: '#1a202c', fontFamily: "'Poppins', sans-serif" }}>{value}</h3>
    </div>
);

const DashboardOverview = () => {
    const [stats, setStats] = useState({
        total_users: 0,
        total_hotels: 0,
        total_restaurants: 0,
        hotel_revenue: 0,
        total_bookings: 0,
        hotel_bookings: 0,
        restaurant_reservations: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await AxiosInstance.get('api/admin/stats/');
                setStats(response.data);
            } catch (error) {
                console.error("Error fetching admin stats:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return <div className="text-center py-5" style={{ fontFamily: "'Poppins', sans-serif", color: '#667eea' }}>Loading Dashboard...</div>;
    }

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="mb-4">
                <h3 className="fw-bold text-dark" style={{ letterSpacing: '-1px' }}>Welcome back, Admin!</h3>
                <p className="text-muted" style={{ fontSize: '14px' }}>Here's what's happening on ServNex platform today.</p>
            </div>

            <div className="row g-4 mb-5">
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="TOTAL USERS" 
                        value={stats.total_users} 
                        icon={<Users size={24} />} 
                        color="primary" 
                        trend={12} 
                    />
                </div>
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="PLATFORM REVENUE" 
                        value={`₹${stats.hotel_revenue.toLocaleString()}`} 
                        icon={<CreditCard size={24} />} 
                        color="success" 
                        trend={8.4} 
                    />
                </div>
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="TOTAL BOOKINGS" 
                        value={stats.total_bookings} 
                        icon={<Calendar size={24} />} 
                        color="info" 
                        trend={15} 
                    />
                </div>
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="SERVICES" 
                        value={stats.total_hotels + stats.total_restaurants} 
                        icon={<TrendingUp size={24} />} 
                        color="warning" 
                        trend={5.2} 
                    />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <h5 className="fw-bold mb-0" style={{ color: '#2d3748' }}>Platform Activity</h5>
                            <button className="btn btn-sm px-3 rounded-pill" style={{ backgroundColor: '#f4f7ff', color: '#667eea', fontWeight: '600', fontSize: '12px', border: '1px solid #e0e6ff' }}>Last 7 Days</button>
                        </div>
                        <div className="row g-3">
                            <div className="col-md-6">
                                <div className="p-3 rounded-4 d-flex align-items-center gap-3" style={{ backgroundColor: '#f4f7ff', border: '1px solid #eef2ff' }}>
                                    <div className="p-2 bg-white rounded-3 shadow-sm" style={{ color: '#667eea' }}>
                                        <Hotel size={20} />
                                    </div>
                                    <div>
                                        <p className="small fw-bold mb-0" style={{ color: '#718096' }}>Hotel Bookings</p>
                                        <h5 className="fw-bold mb-0" style={{ color: '#1a202c' }}>{stats.hotel_bookings}</h5>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="p-3 rounded-4 d-flex align-items-center gap-3" style={{ backgroundColor: '#f4f7ff', border: '1px solid #eef2ff' }}>
                                    <div className="p-2 bg-white rounded-3 shadow-sm" style={{ color: '#764ba2' }}>
                                        <Utensils size={20} />
                                    </div>
                                    <div>
                                        <p className="small fw-bold mb-0" style={{ color: '#718096' }}>Restaurant Reservations</p>
                                        <h5 className="fw-bold mb-0" style={{ color: '#1a202c' }}>{stats.restaurant_reservations}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 d-flex align-items-center justify-content-center" style={{ height: '240px', background: 'linear-gradient(rgba(102, 126, 234, 0.05), transparent)', borderRadius: '24px', border: '1px dashed #e2e8f0' }}>
                            <p className="text-muted small fw-medium">Platform Growth Insights Visualisation</p>
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                        <h5 className="fw-bold mb-4" style={{ color: '#2d3748' }}>System Status</h5>
                        <div className="space-y-4">
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: '#f7fafc' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#48bb78', boxShadow: '0 0 10px rgba(72, 187, 120, 0.4)' }}></div>
                                    <span className="small fw-bold" style={{ color: '#4a5568' }}>API Server</span>
                                </div>
                                <span className="badge bg-success-subtle text-success border-0 px-2 py-1" style={{ fontSize: '10px' }}>Operational</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: '#f7fafc' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#48bb78', boxShadow: '0 0 10px rgba(72, 187, 120, 0.4)' }}></div>
                                    <span className="small fw-bold" style={{ color: '#4a5568' }}>Database (PG)</span>
                                </div>
                                <span className="badge bg-success-subtle text-success border-0 px-2 py-1" style={{ fontSize: '10px' }}>Operational</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-3 border-bottom" style={{ borderColor: '#f7fafc' }}>
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-circle" style={{ width: '10px', height: '10px', backgroundColor: '#ecc94b', boxShadow: '0 0 10px rgba(236, 201, 75, 0.4)' }}></div>
                                    <span className="small fw-bold" style={{ color: '#4a5568' }}>Storage (S3)</span>
                                </div>
                                <span className="badge bg-warning-subtle text-warning border-0 px-2 py-1" style={{ fontSize: '10px' }}>Degraded</span>
                            </div>
                        </div>
                        <div className="mt-4 pt-3 text-center">
                            <button className="btn btn-sm rounded-pill px-4 fw-bold" style={{ border: '1px solid #e0e6ff', color: '#667eea', fontSize: '12px' }}>System Logs</button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-translate-y:hover {
                    transform: translateY(-5px);
                }
                .space-y-4 > * + * {
                    margin-top: 1rem;
                }
            `}</style>
        </div>
    );
};

export default DashboardOverview;
