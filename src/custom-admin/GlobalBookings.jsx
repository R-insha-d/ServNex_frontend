import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Hotel, Utensils, Search, 
  Filter, MoreVertical, Eye, Download
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';

const GlobalBookings = () => {
    const [bookings, setBookings] = useState([]);
    const [reservations, setReservations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hotels');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [bookingsRes, reservationsRes] = await Promise.all([
                AxiosInstance.get('api/admin/bookings/'),
                AxiosInstance.get('api/admin/reservations/')
            ]);
            setBookings(bookingsRes.data);
            setReservations(reservationsRes.data);
        } catch (error) {
            console.error("Error fetching global transactions:", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status) => {
        const s = status.toLowerCase();
        if (s.includes('confirmed') || s.includes('paid') || s.includes('ready')) return 'bg-success-subtle text-success border border-success-subtle';
        if (s.includes('pending')) return 'bg-warning-subtle text-warning border border-warning-subtle';
        if (s.includes('cancelled') || s.includes('failed')) return 'bg-danger-subtle text-danger border border-danger-subtle';
        return 'bg-secondary-subtle text-secondary border border-secondary-subtle';
    };

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>Global Bookings</h3>
                    <p className="text-muted small mb-0">Monitor all platform transactions and reservations</p>
                </div>
                <div className="d-flex gap-2">
                    <button className="btn rounded-pill px-4 d-flex align-items-center gap-2 border shadow-sm bg-white" style={{ color: '#667eea', fontWeight: 'bold' }}>
                        <Download size={18} />
                        <span style={{ fontSize: '13px' }}>Export Records</span>
                    </button>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: '1px solid rgba(102, 126, 234, 0.1) !important' }}>
                <div className="p-4 border-bottom bg-white">
                    <div className="d-flex align-items-center mb-0 p-1 rounded-pill" style={{ backgroundColor: '#f4f7ff', width: 'fit-content', border: '1px solid #e0e6ff' }}>
                        <button 
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === 'hotels' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`}
                            style={{ color: activeTab === 'hotels' ? '#667eea' : '#718096', fontSize: '14px' }}
                            onClick={() => setActiveTab('hotels')}
                        >
                            <Hotel size={18} className="me-2" />
                            Hotels ({bookings.length})
                        </button>
                        <button 
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === 'restaurants' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`}
                            style={{ color: activeTab === 'restaurants' ? '#667eea' : '#718096', fontSize: '14px' }}
                            onClick={() => setActiveTab('restaurants')}
                        >
                            <Utensils size={18} className="me-2" />
                            Restaurants ({reservations.length})
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#f4f7ff' }}>
                            <tr>
                                <th className="ps-4 py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>ID / DATE</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>CUSTOMER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>{activeTab === 'hotels' ? 'HOTEL' : 'RESTAURANT'}</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>AMOUNT/PEOPLE</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>STATUS</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5" style={{ color: '#667eea' }}>Loading records...</td>
                                </tr>
                            ) : activeTab === 'hotels' ? (
                                bookings.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5">No hotel bookings found</td></tr>
                                ) : (
                                    bookings.map((booking) => (
                                        <tr key={booking.id}>
                                            <td className="ps-4">
                                                <p className="fw-bold mb-0" style={{ color: '#667eea', fontSize: '13px' }}>#HTL-{booking.id.toString().padStart(4, '0')}</p>
                                                <p className="text-muted small mb-0">{new Date(booking.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td>
                                                <p className="small mb-0 fw-bold" style={{ color: '#2d3748' }}>{booking.user_email || 'Guest'}</p>
                                                <p className="text-muted small mb-0">{booking.room_type_name}</p>
                                            </td>
                                            <td>
                                                <p className="small mb-0 fw-bold" style={{ color: '#4a5568' }}>{booking.hotel_name}</p>
                                            </td>
                                            <td>
                                                <p className="small mb-0 fw-bold" style={{ color: '#1a202c' }}>₹{booking.final_price?.toLocaleString()}</p>
                                                <p className="text-muted small mb-0">{booking.rooms_booked} Rooms</p>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 fw-bold`} style={{ 
                                                    fontSize: '11px',
                                                    backgroundColor: booking.status.toLowerCase().includes('confirm') ? 'rgba(72, 187, 120, 0.1)' : 'rgba(236, 201, 75, 0.1)',
                                                    color: booking.status.toLowerCase().includes('confirm') ? '#48bb78' : '#ecc94b'
                                                }}>
                                                    {booking.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            ) : (
                                reservations.length === 0 ? (
                                    <tr><td colSpan="6" className="text-center py-5">No reservations found</td></tr>
                                ) : (
                                    reservations.map((res) => (
                                        <tr key={res.id}>
                                            <td className="ps-4">
                                                <p className="fw-bold mb-0" style={{ color: '#764ba2', fontSize: '13px' }}>#RES-{res.id.toString().padStart(4, '0')}</p>
                                                <p className="text-muted small mb-0">{new Date(res.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td>
                                                <p className="small mb-0 fw-bold" style={{ color: '#2d3748' }}>{res.user_email || 'Guest'}</p>
                                                <p className="text-muted small mb-0">{res.reservation_time}</p>
                                            </td>
                                            <td>
                                                <p className="small mb-0 fw-bold" style={{ color: '#4a5568' }}>{res.restaurant_name}</p>
                                            </td>
                                            <td>
                                                <p className="small mb-0 fw-bold" style={{ color: '#1a202c' }}>{res.number_of_guests} Guests</p>
                                                <p className="text-muted small mb-0">Table for {res.table_capacity}</p>
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 fw-bold`} style={{ 
                                                    fontSize: '11px',
                                                    backgroundColor: res.status.toLowerCase().includes('confirm') ? 'rgba(72, 187, 120, 0.1)' : 'rgba(236, 201, 75, 0.1)',
                                                    color: res.status.toLowerCase().includes('confirm') ? '#48bb78' : '#ecc94b'
                                                }}>
                                                    {res.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <button className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Eye size={18} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                .transition-all {
                    transition: all 0.2s ease;
                }
                .btn-icon:hover {
                    background-color: #f1f5f9 !important;
                }
                @media (max-width: 768px) {
                    .container-fluid {
                        padding: 0 10px !important;
                    }
                }
            `}</style>
        </div>
    );
};

export default GlobalBookings;
