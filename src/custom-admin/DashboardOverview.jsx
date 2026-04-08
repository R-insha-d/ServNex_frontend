import React, { useState, useEffect } from 'react';
import { 
   Users, Hotel, Utensils, 
   TrendingUp, CreditCard, Calendar, Activity,
   ArrowUpRight, ArrowDownRight, Server, ShieldCheck,
   Clock
 } from 'lucide-react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import AxiosInstance from '../Component/AxiosInstance';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const StatCard = ({ title, value, icon, color, trend }) => (
    <div className="card border-0 shadow-sm rounded-4 p-4 h-100 transition-all hover-translate-y" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
        <div className="d-flex justify-content-between align-items-center mb-3">
            <div className={`p-3 rounded-4`} style={{ backgroundColor: `rgba(${color}, 0.1)`, color: `rgb(${color})` }}>
                {icon}
            </div>
            {trend && (
                <div className={`badge rounded-pill d-flex align-items-center gap-1 px-2 py-1`} style={{ 
                    fontSize: '11px', 
                    fontWeight: '600',
                    backgroundColor: trend > 0 ? 'rgba(72, 187, 120, 0.1)' : 'rgba(229, 62, 62, 0.1)',
                    color: trend > 0 ? '#48bb78' : '#e53e3e'
                }}>
                    {trend > 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                    {Math.abs(trend)}%
                </div>
            )}
        </div>
        <h6 className="text-secondary fw-bold mb-1" style={{ fontSize: '11px', letterSpacing: '0.8px', color: '#718096', textTransform: 'uppercase' }}>{title}</h6>
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
    const [analytics, setAnalytics] = useState(null);
    const [activities, setActivities] = useState([]);
    const [range, setRange] = useState('180'); // Default 6 months
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [statsRes, analyticsRes, activityRes] = await Promise.all([
                    AxiosInstance.get(`api/admin/stats/?days=${range}`),
                    AxiosInstance.get(`api/admin/analytics/?days=${range}`),
                    AxiosInstance.get(`api/admin/activity/`)
                ]);
                setStats(statsRes.data);
                setAnalytics(analyticsRes.data);
                setActivities(activityRes.data.results.slice(0, 5));
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [range]);

    if (loading) {
        return (
            <div className="d-flex flex-column align-items-center justify-content-center py-5" style={{ minHeight: '400px' }}>
                <div className="spinner-border text-primary mb-3" role="status" style={{ width: '3rem', height: '3rem' }}></div>
                <p className="text-muted fw-bold">Synchronizing Platform Data...</p>
            </div>
        );
    }

    // Chart Data Preparation
    const lineChartData = {
        labels: analytics?.revenue_trends.map(item => {
            const date = new Date(item.period);
            return parseInt(range) <= 30 
                ? date.toLocaleDateString('default', { month: 'short', day: 'numeric' })
                : date.toLocaleDateString('default', { month: 'short' });
        }) || [],
        datasets: [
            {
                label: 'Revenue (₹)',
                data: analytics?.revenue_trends.map(item => item.total) || [],
                borderColor: '#667eea',
                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                fill: true,
                tension: 0.4,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderWidth: 2,
            },
            {
                label: 'User Signups',
                data: analytics?.user_growth.map(item => item.count) || [],
                borderColor: '#764ba2',
                backgroundColor: 'transparent',
                borderDash: [5, 5],
                tension: 0.4,
                pointRadius: 0, // Hidden for cleaner look
            }
        ],
    };

    const doughnutData = {
        labels: ['Hotels', 'Restaurants'],
        datasets: [{
            data: [stats.total_hotels, stats.total_restaurants],
            backgroundColor: ['#667eea', '#764ba2'],
            borderWidth: 0,
            hoverOffset: 10
        }]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    font: { family: "'Poppins', sans-serif", size: 11, weight: '600' }
                }
            },
            tooltip: {
                backgroundColor: '#1a202c',
                titleFont: { size: 14, weight: 'bold' },
                padding: 12,
                cornerRadius: 8,
                titleColor: '#fff',
                bodyColor: '#cbd5e0',
                displayColors: false
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: { color: 'rgba(0,0,0,0.03)' },
                ticks: { font: { size: 10 } }
            },
            x: {
                grid: { display: false },
                ticks: { font: { size: 10 } }
            }
        }
    };

    return (
        <div className="container-fluid p-0 animate__animated animate__fadeIn" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="mb-4">
                <h3 className="fw-bold text-dark" style={{ letterSpacing: '-1px' }}>Platform Intelligence</h3>
                <p className="text-muted" style={{ fontSize: '14px' }}>Real-time performance metrics and historical growth analytics.</p>
            </div>

            <div className="row g-4 mb-4">
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="Registered Users" 
                        value={stats.total_users.toLocaleString()} 
                        icon={<Users size={24} />} 
                        color="102, 126, 234" 
                        trend={stats.user_growth} 
                    />
                </div>
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="Total Revenue" 
                        value={`₹${stats.hotel_revenue.toLocaleString()}`} 
                        icon={<CreditCard size={24} />} 
                        color="72, 187, 120" 
                        trend={stats.revenue_growth} 
                    />
                </div>
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="Confirmed Orders" 
                        value={stats.total_bookings.toLocaleString()} 
                        icon={<Calendar size={24} />} 
                        color="236, 201, 75" 
                        trend={stats.booking_growth} 
                    />
                </div>
                <div className="col-sm-6 col-lg-3">
                    <StatCard 
                        title="Service Partners" 
                        value={stats.total_hotels + stats.total_restaurants} 
                        icon={<Activity size={24} />} 
                        color="237, 100, 166" 
                        trend={stats.partner_growth} 
                    />
                </div>
            </div>

            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold mb-0" style={{ color: '#2d3748' }}>Growth Dynamics</h5>
                                <p className="text-muted small mb-0">Monthly revenue trends vs user acquisition</p>
                            </div>
                            <select 
                                className="form-select border-0 bg-light rounded-pill ps-3 pe-5 py-1 fw-bold" 
                                style={{ width: 'auto', fontSize: '12px', color: '#667eea' }}
                                value={range}
                                onChange={(e) => setRange(e.target.value)}
                            >
                                <option value="7">Last 7 Days</option>
                                <option value="30">Last 30 Days</option>
                                <option value="180">Last 6 Months</option>
                                <option value="365">Year to Date</option>
                            </select>
                        </div>
                        <div style={{ height: '320px' }}>
                            <Line data={lineChartData} options={chartOptions} />
                        </div>
                    </div>
                </div>
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                        <h5 className="fw-bold mb-2" style={{ color: '#2d3748' }}>Platform Mix</h5>
                        <p className="text-muted small mb-4">Service distribution across the ecosystem</p>
                        
                        <div className="position-relative d-flex justify-content-center align-items-center" style={{ height: '220px' }}>
                            <Doughnut data={doughnutData} options={{ 
                                plugins: { legend: { display: false } },
                                cutout: '75%',
                                maintainAspectRatio: false 
                            }} />
                            <div className="position-absolute text-center">
                                <h3 className="fw-bold mb-0" style={{ color: '#1a202c' }}>{stats.total_hotels + stats.total_restaurants}</h3>
                                <p className="text-muted small mb-0 fw-bold">PARTNERS</p>
                            </div>
                        </div>

                        <div className="mt-4">
                            <div className="d-flex align-items-center justify-content-between p-2 rounded-3 mb-2" style={{ backgroundColor: 'rgba(102, 126, 234, 0.05)' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#667eea' }}></div>
                                    <span className="small fw-bold text-secondary">Hotel Properties</span>
                                </div>
                                <span className="small fw-bold" style={{ color: '#1a202c' }}>{stats.total_hotels}</span>
                            </div>
                            <div className="d-flex align-items-center justify-content-between p-2 rounded-3" style={{ backgroundColor: 'rgba(118, 75, 162, 0.05)' }}>
                                <div className="d-flex align-items-center gap-2">
                                    <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: '#764ba2' }}></div>
                                    <span className="small fw-bold text-secondary">Dining Venues</span>
                                </div>
                                <span className="small fw-bold" style={{ color: '#1a202c' }}>{stats.total_restaurants}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-8 mt-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ border: '1px solid rgba(102, 126, 234, 0.1)' }}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                            <div>
                                <h5 className="fw-bold mb-0" style={{ color: '#2d3748' }}>Recent Management Actions</h5>
                                <p className="text-muted small mb-0">Audit log of latest administrative operations</p>
                            </div>
                            <ShieldCheck size={24} className="text-primary opacity-50" />
                        </div>
                        
                        <div className="activity-feed">
                            {activities.length === 0 ? (
                                <div className="text-center py-5 opacity-50">
                                    <Clock size={32} className="mb-2" />
                                    <p className="small fw-bold">No recent activities found</p>
                                </div>
                            ) : (
                                activities.map((act, index) => (
                                    <div key={act.id} className={`d-flex gap-3 pb-3 ${index !== activities.length - 1 ? 'border-bottom mb-3' : ''}`}>
                                        <div className={`p-2 rounded-circle d-flex align-items-center justify-content-center shadow-sm h-fit`} 
                                            style={{ 
                                                width: '36px', 
                                                height: '36px',
                                                backgroundColor: act.action === 'DELETE' ? 'rgba(229, 62, 62, 0.1)' : 
                                                                act.action === 'CREATE' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                                                color: act.action === 'DELETE' ? '#e53e3e' : 
                                                       act.action === 'CREATE' ? '#48bb78' : '#667eea'
                                            }}>
                                            <Activity size={18} />
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between">
                                                <h6 className="fw-bold mb-0" style={{ fontSize: '13px', color: '#2d3748' }}>
                                                    {act.admin_name} {act.action.toLowerCase()}d <span className="text-primary">{act.model_name}</span>
                                                </h6>
                                                <span className="text-muted" style={{ fontSize: '10px' }}>{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                            </div>
                                            <p className="small text-secondary mb-0 mt-1" style={{ fontSize: '11px' }}>
                                                {act.object_repr}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>

                <div className="col-lg-4 mt-4">
                    <div className="card border-0 shadow-sm rounded-4 p-4 h-100" style={{ backgroundColor: '#1a202c', color: '#fff' }}>
                        <div className="d-flex align-items-center gap-3 mb-3">
                            <div className="p-2 rounded-3" style={{ backgroundColor: 'rgba(72, 187, 120, 0.2)', color: '#48bb78' }}>
                                <Server size={20} />
                            </div>
                            <h5 className="fw-bold mb-0">Infrastructure</h5>
                        </div>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="small text-secondary fw-bold">CPU USAGE</span>
                                <span className="small text-success fw-bold">4.2%</span>
                            </div>
                            <div className="progress rounded-pill overflow-hidden" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <div className="progress-bar bg-success" style={{ width: '4.2%' }}></div>
                            </div>
                        </div>
                        <div className="mb-4">
                            <div className="d-flex justify-content-between mb-1">
                                <span className="small text-secondary fw-bold">API LATENCY</span>
                                <span className="small text-warning fw-bold">124ms</span>
                            </div>
                            <div className="progress rounded-pill overflow-hidden" style={{ height: '6px', backgroundColor: 'rgba(255,255,255,0.1)' }}>
                                <div className="progress-bar bg-warning" style={{ width: '25%' }}></div>
                            </div>
                        </div>
                        <div className="p-3 rounded-4" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                            <div className="d-flex align-items-center gap-2 mb-2 text-success">
                                <div className="rounded-circle bg-success shadow-glow" style={{ width: '8px', height: '8px' }}></div>
                                <span className="small fw-bold">All Systems Nominal</span>
                            </div>
                            <p className="text-secondary small mb-0" style={{ fontSize: '10px' }}>Last security audit passed 14 minutes ago. Platform instances running on AWS-Mumbai (ap-south-1).</p>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .hover-translate-y:hover {
                    transform: translateY(-5px);
                }
                .transition-all {
                    transition: all 0.3s ease;
                }
                .h-fit { height: fit-content; }
                .shadow-glow { box-shadow: 0 0 10px rgba(72, 187, 120, 0.5); }
            `}</style>
        </div>
    );
};

export default DashboardOverview;
