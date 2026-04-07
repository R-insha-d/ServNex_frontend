import React, { useState, useEffect } from 'react';
import { 
  Hotel, Plus, Search, 
  MoreVertical, Edit, Trash2, 
  MapPin, Star, CheckCircle, XCircle
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';

const HotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchHotels();
    }, []);

    const fetchHotels = async () => {
        try {
            const response = await AxiosInstance.get('api/admin/hotels/');
            setHotels(response.data);
        } catch (error) {
            console.error("Error fetching hotels:", error);
            toast.error("Failed to load hotels");
        } finally {
            setLoading(false);
        }
    };

    const deleteHotel = async (id) => {
        if (!window.confirm("Are you sure you want to delete this hotel?")) return;
        try {
            await AxiosInstance.delete(`api/admin/hotels/${id}/`);
            toast.success("Hotel deleted successfully");
            fetchHotels();
        } catch (error) {
            console.error("Error deleting hotel:", error);
            toast.error("Failed to delete hotel");
        }
    };

    const filteredHotels = hotels.filter(hotel => 
        (hotel.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (hotel.city?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>Hotel Management</h3>
                    <p className="text-muted small mb-0">Total of {hotels.length} hotels registered</p>
                </div>
                <button className="btn rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#667eea', color: '#fff', border: 'none' }}>
                    <Plus size={18} />
                    <span className="fw-bold" style={{ fontSize: '13px' }}>Register New Hotel</span>
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: '1px solid rgba(102, 126, 234, 0.1) !important' }}>
                <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between">
                    <div className="position-relative" style={{ width: '350px' }}>
                        <Search className="position-absolute translate-middle-y top-50 start-0 ms-3" size={18} style={{ color: '#667eea' }} />
                        <input 
                            type="text" 
                            placeholder="Search by hotel name or city..." 
                            className="form-control ps-5 rounded-pill border-0"
                            style={{ backgroundColor: '#f4f7ff', fontSize: '14px', height: '45px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#f4f7ff' }}>
                            <tr>
                                <th className="ps-4 py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>HOTEL</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>LOCATION</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>OWNER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>RATING</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5" style={{ color: '#667eea' }}>Loading hotels...</td>
                                </tr>
                            ) : filteredHotels.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">No hotels found</td>
                                </tr>
                            ) : (
                                filteredHotels.map((hotel) => (
                                    <tr key={hotel.id}>
                                        <td className="ps-4 py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-3 bg-light overflow-hidden shadow-sm" style={{ width: '50px', height: '50px', border: '2px solid #fff' }}>
                                                    {hotel.image ? (
                                                        <img src={hotel.image} alt={hotel.name} className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f4f7ff', color: '#667eea' }}>
                                                            <Hotel size={24} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="fw-bold mb-0" style={{ color: '#2d3748', fontSize: '14px' }}>{hotel.name || 'Untitled'}</p>
                                                    <p className="text-muted small mb-0">{hotel.badge || 'Standard'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                <MapPin size={14} style={{ color: '#667eea' }} />
                                                <span className="small fw-medium text-secondary">{hotel.city || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <p className="small mb-0 fw-bold" style={{ color: '#4a5568' }}>{hotel.owner_email || 'No Owner'}</p>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                <Star size={16} style={{ color: '#ecc94b', fill: '#ecc94b' }} />
                                                <span className="small fw-bold" style={{ color: '#2d3748' }}>{hotel.rating || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    className="btn btn-sm btn-icon rounded-circle p-2" 
                                                    style={{ color: '#e53e3e', backgroundColor: 'rgba(229, 62, 62, 0.05)' }}
                                                    onClick={() => deleteHotel(hotel.id)}
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                .btn-icon:hover {
                    background-color: #f1f5f9 !important;
                }
                .table-hover tbody tr:hover {
                    background-color: #f8fafc;
                }
            `}</style>
        </div>
    );
};

export default HotelManagement;
