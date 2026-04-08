import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, Star, Hotel, Utensils, Search, 
  Trash2, AlertCircle, ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';
import AdminModal from './AdminModal';

const ReviewManagement = () => {
    const navigate = useNavigate();
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('hotels');
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
    });
    
    // Modal States
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);

    useEffect(() => {
        fetchReviews(1);
    }, [activeTab, searchTerm]);

    const fetchReviews = async (page = 1) => {
        setLoading(true);
        const endpoint = activeTab === 'hotels' ? 'api/admin/hotel-reviews/' : 'api/admin/restaurant-reviews/';
        try {
            const response = await AxiosInstance.get(`${endpoint}?page=${page}&search=${searchTerm}`);
            setData(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page
            });
        } catch (error) {
            console.error("Error fetching reviews:", error);
            toast.error("Failed to load user feedback");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        setFormLoading(true);
        const endpoint = activeTab === 'hotels' ? 'api/admin/hotel-reviews/' : 'api/admin/restaurant-reviews/';
        try {
            await AxiosInstance.delete(`${endpoint}${selectedItem.id}/`);
            toast.success("Review permanently removed");
            setShowDeleteModal(false);
            fetchReviews(pagination.currentPage);
        } catch (error) {
            toast.error("Failed to delete review");
        } finally {
            setFormLoading(false);
        }
    };

    const renderStars = (rating) => {
        return [...Array(5)].map((_, i) => (
            <Star 
                key={i} 
                size={14} 
                fill={i < rating ? "#ecc94b" : "transparent"} 
                color={i < rating ? "#ecc94b" : "#cbd5e0"} 
                className="me-1"
            />
        ));
    };

    return (
        <div className="container-fluid p-0 animate__animated animate__fadeIn" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>User Feedback Moderation</h3>
                    <p className="text-muted small mb-0">Monitor and moderate property reviews across the platform</p>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center mb-0 p-1 rounded-pill" style={{ backgroundColor: '#f4f7ff', width: 'fit-content', border: '1px solid #e0e6ff' }}>
                        <button 
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === 'hotels' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`}
                            style={{ color: activeTab === 'hotels' ? '#667eea' : '#718096', fontSize: '14px' }}
                            onClick={() => setActiveTab('hotels')}
                        >
                            <Hotel size={18} className="me-2" />
                            Hotel Reviews
                        </button>
                        <button 
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === 'restaurants' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`}
                            style={{ color: activeTab === 'restaurants' ? '#667eea' : '#718096', fontSize: '14px' }}
                            onClick={() => setActiveTab('restaurants')}
                        >
                            <Utensils size={18} className="me-2" />
                            Restaurant Reviews
                        </button>
                    </div>

                    <div className="d-flex gap-3 align-items-center">
                        <div className="position-relative" style={{ width: '250px' }}>
                            <Search className="position-absolute translate-middle-y top-50 start-0 ms-3" size={18} style={{ color: '#667eea' }} />
                            <input 
                                type="text" 
                                placeholder="Search comments..." 
                                className="form-control ps-5 rounded-pill border-0"
                                style={{ backgroundColor: '#f4f7ff', fontSize: '13px', height: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button 
                                disabled={!pagination.previous || loading}
                                onClick={() => fetchReviews(pagination.currentPage - 1)}
                                className="btn btn-light rounded-circle p-2 border shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="d-none d-md-flex align-items-center px-3 fw-bold text-muted small bg-light rounded-pill border">
                                {pagination.currentPage} / {Math.ceil(pagination.count / 10) || 1}
                            </div>
                            <button 
                                disabled={!pagination.next || loading}
                                onClick={() => fetchReviews(pagination.currentPage + 1)}
                                className="btn btn-light rounded-circle p-2 border shadow-sm"
                            >
                                <ChevronRight size={18} />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#f4f7ff' }}>
                            <tr>
                                <th className="ps-4 py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>CUSTOMER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>RATING</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>PROPERTY</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px', width: '40%' }}>COMMENT</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>DATE</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan="6" className="text-center py-5" style={{ color: '#667eea' }}>Loading feedback...</td></tr>
                            ) : data.length === 0 ? (
                                <tr><td colSpan="6" className="text-center py-5">No reviews found for this category</td></tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id}>
                                        <td className="ps-4">
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light p-2 rounded-circle">
                                                    <UserIcon size={14} className="text-muted" />
                                                </div>
                                                <span className="small fw-bold">{item.user_email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex">
                                                {renderStars(item.rating)}
                                            </div>
                                        </td>
                                        <td>
                                            <p className="small mb-0 fw-bold">{activeTab === 'hotels' ? item.hotel_name : item.restaurant_name}</p>
                                        </td>
                                        <td>
                                            <p className="small mb-0 text-dark" style={{ lineHeight: '1.4' }}>{item.comment || <em className="text-muted small">No comment provided</em>}</p>
                                        </td>
                                        <td className="text-muted small fw-medium">
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="text-end pe-4">
                                            <button 
                                                onClick={() => handleOpenDelete(item)}
                                                className="btn btn-sm btn-icon rounded-circle p-2 text-danger" style={{ backgroundColor: 'rgba(229, 62, 62, 0.05)' }}>
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <AdminModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Moderate User Feedback"
                saveLabel="Delete Review"
                onSave={confirmDelete}
                loading={formLoading}
                variant="danger"
            >
                <div className="text-center py-3">
                    <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex p-3 mb-4">
                        <MessageSquare size={40} />
                    </div>
                    <h5 className="fw-bold mb-2">Delete this review?</h5>
                    <p className="text-muted px-4 small">
                        This action will permanently remove the review from the platform. It cannot be recovered.
                    </p>
                </div>
            </AdminModal>
            
            <style>{`
                .btn-icon:hover { background-color: #f1f5f9 !important; }
                .table-hover tbody tr:hover { background-color: #f8fafc; }
            `}</style>
        </div>
    );
};

export default ReviewManagement;
