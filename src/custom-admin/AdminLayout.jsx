import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Hotel, Utensils, 
  CalendarCheck, LogOut, Menu, X, Bell, Search 
} from 'lucide-react';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const menuItems = [
        { name: 'Dashboard', icon: <LayoutDashboard size={20} />, path: '/custom-admin' },
        { name: 'Users', icon: <Users size={20} />, path: '/custom-admin/users' },
        { name: 'Hotels', icon: <Hotel size={20} />, path: '/custom-admin/hotels' },
        { name: 'Restaurants', icon: <Utensils size={20} />, path: '/custom-admin/restaurants' },
        { name: 'Bookings', icon: <CalendarCheck size={20} />, path: '/custom-admin/bookings' },
    ];

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
                }}
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

                    <div className="d-flex align-items-center gap-3">
                        <button className="btn btn-light position-relative rounded-circle p-2">
                            <Bell size={20} />
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: '10px' }}>3</span>
                        </button>
                        <div className="d-flex align-items-center gap-2 ps-3 border-start">
                            <div className="text-end d-none d-sm-block">
                                <p className="small fw-bold mb-0 text-dark">{user.first_name || 'Admin'}</p>
                                <p className="text-muted mb-0" style={{ fontSize: '12px' }}>Super Admin</p>
                            </div>
                            <div className="rounded-circle overflow-hidden bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: '40px', height: '40px' }}>
                                {user.profile_image ? <img src={user.profile_image} alt="profile" /> : (user.first_name ? user.first_name[0] : 'A')}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Dashboard View */}
                <div className="p-4 flex-grow-1 overflow-auto">
                    <Outlet />
                </div>
            </main>

            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;600;700&display=swap');

                .admin-sidebar {
                    width: 260px;
                    min-height: 100vh;
                    transition: all 0.3s ease-in-out;
                    z-index: 1050;
                    overflow-y: auto;
                    border-right: 1px solid rgba(255, 255, 255, 0.1);
                    font-family: 'Poppins', sans-serif;
                }

                /* Mobile View: Fixed Overlay */
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

                /* Desktop View: Flex Item with Transition */
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
            `}</style>
        </div>
    );
};

export default AdminLayout;
