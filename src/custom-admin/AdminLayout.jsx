import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Hotel, Utensils, 
  CalendarCheck, LogOut, Menu, X, Bell, Search 
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/custom-admin' },
        { name: 'Users', icon: <Users size={20} />, path: '/custom-admin/users' },
        { name: 'Hotels', icon: <Hotel size={20} />, path: '/custom-admin/hotels' },
        { name: 'Restaurants', icon: <Utensils size={20} />, path: '/custom-admin/restaurants' },
        { name: 'Bookings', icon: <CalendarCheck size={20} />, path: '/custom-admin/bookings' },
    ];

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const [users, bookings, reservations] = await Promise.all([
                    AxiosInstance.get('api/admin/users/'),
                    AxiosInstance.get('api/admin/bookings/'),
                    AxiosInstance.get('api/admin/reservations/')
                ]);

                // Transform and combine into unified notifications
                const allActivity = [
                    ...(users.data.results || []).slice(0, 3).map(u => ({
                        id: `user-${u.id}`,
                        type: 'user',
                        title: 'New Member Joined',
                        message: `${u.first_name || u.email} registered on ServNex.`,
                        time: u.date_joined,
                        icon: <Users size={16} className="text-primary" />,
                        bg: 'rgba(102, 126, 234, 0.1)'
                    })),
                    ...(bookings.data.results || []).slice(0, 3).map(b => ({
                        id: `book-${b.id}`,
                        type: 'booking',
                        title: 'Hotel Booking Confirmed',
                        message: `Order #HTL-${b.id} for ${b.hotel_name} - ₹${b.final_price?.toLocaleString()}`,
                        time: b.created_at,
                        icon: <Hotel size={16} className="text-success" />,
                        bg: 'rgba(72, 187, 120, 0.1)'
                    })),
                    ...(reservations.data.results || []).slice(0, 3).map(r => ({
                        id: `res-${r.id}`,
                        type: 'reservation',
                        title: 'Table Reserved',
                        message: `${r.restaurant_name} for ${r.number_of_guests} guests.`,
                        time: r.created_at,
                        icon: <Utensils size={16} className="text-warning" />,
                        bg: 'rgba(236, 201, 75, 0.1)'
                    }))
                ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 10);

                setNotifications(allActivity);
                setUnreadCount(allActivity.length);
            } catch (error) {
                console.error("Failed to fetch notifications:", error);
            }
        };

        fetchNotifications();
    }, []);

    const formatTime = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        if (diffInSeconds < 60) return 'Just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
        return date.toLocaleDateString();
    };

    const handleMarkAllRead = () => {
        setUnreadCount(0);
        toast.info("All notifications marked as read");
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/auth');
    };

    return (
        <div className="min-vh-100 d-flex bg-light">
            {/* Sidebar */}
            <aside 
                className={`admin-sidebar ${isSidebarOpen ? 'sidebar-open' : 'sidebar-closed'} shadow-sm flex-shrink-0 d-flex flex-column`}
                style={{ 
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: '#f8fafc',
                } }
            >
                <div className="p-4 d-flex align-items-center justify-content-between">
                    <h4 className="fw-bold mb-0 text-white" style={{ letterSpacing: '-0.5px', fontFamily: "'Poppins', sans-serif" }}>
                        ServNex <span style={{ color: 'rgba(255,255,255,0.7)', fontWeight: '400' }}>Admin</span>
                    </h4>
                    <button className="btn btn-link text-white d-md-none" onClick={() => setIsSidebarOpen(false)}>
                        <X size={24} />
                    </button>
                </div>

                <nav className="mt-4 px-3">
                    {menuItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            end
                            className={({ isActive }) => `
                                d-flex align-items-center gap-3 px-3 py-3 rounded-4 mb-2 text-decoration-none transition-all
                                ${isActive 
                                    ? 'bg-white shadow' 
                                    : 'text-white-50 hover-bg-white-10 text-white'
                                }
                            `}
                            style={({ isActive }) => ({
                                color: isActive ? '#667eea' : 'inherit',
                                transition: '0.3s'
                            })}
                        >
                            {item.icon}
                            <span className="fw-bold" style={{ fontSize: '14px' }}>{item.name}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="mt-auto p-4 border-top border-white-10">
                    <button 
                        onClick={handleLogout}
                        className="btn w-100 d-flex align-items-center gap-3 text-white-50 hover:text-white transition-all bg-transparent border-0 text-start"
                    >
                        <LogOut size={20} />
                        <span className="fw-medium">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow-1 d-flex flex-column" style={{ minWidth: 0, backgroundColor: '#f4f7ff', fontFamily: "'Poppins', sans-serif" }}>
                {/* Header */}
                <header className="bg-white border-bottom px-4 py-3 sticky-top d-flex align-items-center justify-content-between">
                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-light d-md-none" onClick={() => setIsSidebarOpen(true)}>
                            <Menu size={24} />
                        </button>
                        <div className="position-relative d-none d-sm-block">
                            <Search className="position-absolute translate-middle-y top-50 start-0 ms-3 text-muted" size={18} />
                            <input 
                                type="text" 
                                placeholder="Search everything..." 
                                className="form-control ps-5 rounded-pill border-0 bg-light"
                                style={{ width: '300px' }}
                            />
                        </div>
                    </div>

                    <div className="d-flex align-items-center gap-4">
                        <div className="position-relative">
                            <button 
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="btn btn-light position-relative rounded-circle d-flex align-items-center justify-content-center p-0" 
                                style={{ width: '38px', height: '38px', border: '1px solid #e2e8f0', backgroundColor: showNotifications ? '#f4f7ff' : '#fff' }}
                            >
                                <Bell size={18} className={unreadCount > 0 ? "text-primary" : "text-secondary"} />
                                {unreadCount > 0 && (
                                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger border border-white" style={{ fontSize: '9px', padding: '3px 5px' }}>
                                        {unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notification Dropdown */}
                            {showNotifications && (
                                <>
                                    <div className="position-fixed top-0 start-0 w-100 h-100" style={{ zIndex: 100 }} onClick={() => setShowNotifications(false)}></div>
                                    <div className="position-absolute top-100 end-0 mt-2 shadow-lg rounded-4 overflow-hidden" 
                                         style={{ width: '350px', backgroundColor: '#fff', border: '1px solid #e2e8f0', zIndex: 101, animation: 'slideIn 0.2s ease-out' }}>
                                        <div className="p-3 border-bottom d-flex align-items-center justify-content-between bg-white text-dark sticky-top">
                                            <h6 className="fw-bold mb-0">Recent Activity</h6>
                                            <button onClick={handleMarkAllRead} className="btn btn-link p-0 text-decoration-none small fw-bold" style={{ fontSize: '11px', color: '#667eea' }}>Mark all read</button>
                                        </div>
                                        <div className="overflow-auto" style={{ maxHeight: '400px' }}>
                                            {notifications.length === 0 ? (
                                                <div className="p-5 text-center text-muted">
                                                    <Bell size={32} className="mb-2 opacity-25" />
                                                    <p className="small mb-0">No recent activity</p>
                                                </div>
                                            ) : (
                                                notifications.map((notif) => (
                                                    <div key={notif.id} className="p-3 border-bottom hover-bg-light transition-all cursor-pointer" style={{ cursor: 'pointer' }}>
                                                        <div className="d-flex gap-3">
                                                            <div className="flex-shrink-0 p-2 rounded-3 d-flex align-items-center justify-content-center" style={{ width: '35px', height: '35px', backgroundColor: notif.bg }}>
                                                                {notif.icon}
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <p className="small fw-bold mb-0 text-dark" style={{ lineHeight: '1.2' }}>{notif.title}</p>
                                                                <p className="text-muted mb-1" style={{ fontSize: '11px', lineHeight: '1.4' }}>{notif.message}</p>
                                                                <span className="text-muted" style={{ fontSize: '10px' }}>{formatTime(notif.time)}</span>
                                                            </div>
                                                            <div className="rounded-circle bg-primary" style={{ width: '6px', height: '6px', marginTop: '5px', display: unreadCount > 0 ? 'block' : 'none' }}></div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                        <div className="p-2 border-top text-center bg-light">
                                            <button 
                                                onClick={() => { setShowNotifications(false); navigate('/custom-admin/bookings'); }}
                                                className="btn btn-sm btn-link text-decoration-none fw-bold" style={{ fontSize: '12px', color: '#667eea' }}>View All Activity</button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="d-flex align-items-center gap-3 ps-3 border-start" style={{ height: '32px', borderColor: '#e2e8f0' }}>
                            <div className="d-none d-sm-flex flex-column align-items-end justify-content-center">
                                <span className="fw-bold text-dark" style={{ fontSize: '13px', lineHeight: '1' }}>{user.first_name || 'Admin'}</span>
                                <span className="text-muted mt-1" style={{ fontSize: '11px', lineHeight: '1', fontWeight: '500' }}>Super Admin</span>
                            </div>
                            <div className="rounded-circle overflow-hidden d-flex align-items-center justify-content-center shadow-sm" 
                                 style={{ 
                                     width: '38px', 
                                     height: '38px', 
                                     backgroundColor: '#667eea', 
                                     color: '#fff',
                                     fontSize: '14px',
                                     fontWeight: '600',
                                     border: '2px solid #fff'
                                 }}>
                                {user.profile_image ? (
                                    <img src={user.profile_image} alt="profile" className="w-100 h-100 object-fit-cover" />
                                ) : (
                                    user.first_name ? user.first_name[0].toUpperCase() : 'A'
                                )}
                            </div>
                        </div>
                    </div>
                </header>

                <div className="p-4 flex-grow-1 overflow-auto">
                    <Outlet />
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

                .admin-sidebar {
                    width: 260px;
                    height: 100vh;
                    position: sticky;
                    top: 0;
                    transition: all 0.3s ease-in-out;
                    z-index: 1050;
                    overflow-y: auto;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    font-family: 'Poppins', sans-serif;
                }

                @media (max-width: 767.98px) {
                    .admin-sidebar {
                        position: fixed;
                        top: 0;
                        left: 0;
                        height: 100vh;
                        transform: translateX(-100%);
                    }
                    .admin-sidebar.sidebar-open {
                        transform: translateX(0);
                    }
                    .admin-sidebar.sidebar-closed {
                        transform: translateX(-100%);
                    }
                }

                @media (min-width: 768px) {
                    .admin-sidebar.sidebar-closed {
                        margin-left: -260px;
                        opacity: 0;
                        visibility: hidden;
                    }
                    .admin-sidebar.sidebar-open {
                        margin-left: 0;
                        opacity: 1;
                        visibility: visible;
                    }
                }

                .border-white-10 {
                    border-color: rgba(255, 255, 255, 0.1) !important;
                }

                .hover-bg-white-10:hover {
                    background-color: rgba(255, 255, 255, 0.1);
                    color: white !important;
                }
                .transition-all {
                    transition: all 0.3s ease;
                }

                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
};

export default AdminLayout;
