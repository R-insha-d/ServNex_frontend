import React, { useState, useEffect } from 'react';
import { 
  Hotel, Plus, Search, 
  Edit, Trash2, 
  MapPin, Star, XCircle, AlertCircle, Upload,
  ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';
import AdminModal from './AdminModal';

const HotelManagement = () => {
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
    });
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Modal States
    const [showFormModal, setShowFormModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedHotel, setSelectedHotel] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        area: '',
        badge: 'Luxury Stays',
        price: '',
        description: '',
        owner: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchHotels(1);
    }, [searchTerm]);

    const fetchHotels = async (page = 1) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`api/admin/hotels/?page=${page}&search=${searchTerm}`);
            setHotels(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page
            });
        } catch (error) {
            console.error("Error fetching hotels:", error);
            toast.error("Failed to load hotels");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(hotels.map(h => h.id));
        } else {
            setSelectedIds([]);
        }
    };

    const handleSelectOne = (id) => {
        if (selectedIds.includes(id)) {
            setSelectedIds(selectedIds.filter(i => i !== id));
        } else {
            setSelectedIds([...selectedIds, id]);
        }
    };

    const handleOpenAdd = () => {
        setSelectedHotel(null);
        setFormData({
            name: '',
            city: '',
            area: '',
            badge: 'Luxury Stays',
            price: '',
            description: '',
            owner: ''
        });
        setSelectedImage(null);
        setShowFormModal(true);
    };

    const handleOpenEdit = (hotel) => {
        setSelectedHotel(hotel);
        setFormData({
            name: hotel.name || '',
            city: hotel.city || '',
            area: hotel.area || '',
            badge: hotel.badge || 'Luxury Stays',
            price: hotel.price || '',
            description: hotel.description || '',
            owner: hotel.owner || ''
        });
        setSelectedImage(null);
        setShowFormModal(true);
    };

    const handleOpenDelete = (hotel) => {
        setSelectedHotel(hotel);
        setShowDeleteModal(true);
    };

    const handleSave = async () => {
        if (!formData.name || !formData.city) {
            toast.error("Name and City are required");
            return;
        }

        setFormLoading(true);
        const data = new FormData();
        Object.keys(formData).forEach(key => {
            if (formData[key] !== null && formData[key] !== undefined) {
                data.append(key, formData[key]);
            }
        });
        if (selectedImage) {
            data.append('image', selectedImage);
        }

        try {
            if (selectedHotel) {
                await AxiosInstance.put(`api/admin/hotels/${selectedHotel.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Hotel updated successfully");
            } else {
                await AxiosInstance.post('api/admin/hotels/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Hotel registered successfully");
            }
            setShowFormModal(false);
            fetchHotels(pagination.currentPage);
        } catch (error) {
            console.error("Error saving hotel:", error);
            toast.error("Failed to save hotel details");
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedHotel) return;
        setFormLoading(true);
        try {
            await AxiosInstance.delete(`api/admin/hotels/${selectedHotel.id}/`);
            toast.success("Hotel permanently removed");
            setShowDeleteModal(false);
            fetchHotels(pagination.currentPage);
        } catch (error) {
            console.error("Error deleting hotel:", error);
            toast.error("Failed to delete hotel");
        } finally {
            setFormLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} properties?`)) {
            try {
                await Promise.all(selectedIds.map(id => AxiosInstance.delete(`api/admin/hotels/${id}/`)));
                toast.success("Bulk deletion successful");
                setSelectedIds([]);
                fetchHotels(pagination.currentPage);
            } catch (error) {
                toast.error("Some deletions failed");
            }
        }
    };

    const handleExport = () => {
        const headers = ["ID", "Name", "City", "Area", "Price", "Badge", "Rating"];
        const rows = hotels.map(h => [h.id, h.name, h.city, h.area, h.price, h.badge, h.rating]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `hotels_export_page_${pagination.currentPage}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>Hotel Management</h3>
                    <p className="text-muted small mb-0">Total of {pagination.count} hotels registered</p>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        onClick={handleExport}
                        className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 border shadow-sm bg-white" style={{ fontSize: '13px' }}>
                        <Download size={16} />
                        <span className="fw-bold">Export CSV</span>
                    </button>
                    <button 
                        onClick={handleOpenAdd}
                        className="btn rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#667eea', color: '#fff', border: 'none' }}>
                        <Plus size={18} />
                        <span className="fw-bold" style={{ fontSize: '13px' }}>Register New Hotel</span>
                    </button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="alert alert-primary rounded-4 border-0 shadow-sm d-flex justify-content-between align-items-center mb-4 py-3 px-4 animate__animated animate__fadeIn">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white rounded-circle p-2 text-primary d-flex align-items-center justify-content-center shadow-sm">
                            <Hotel size={20} />
                        </div>
                        <span className="fw-bold">{selectedIds.length} properties selected</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold" onClick={() => setSelectedIds([])}>Cancel</button>
                        <button className="btn btn-danger btn-sm rounded-pill px-3 fw-bold" onClick={handleBulkDelete}>Delete Selected</button>
                    </div>
                </div>
            )}

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

                    <div className="d-flex gap-2">
                        <button 
                            disabled={!pagination.previous || loading}
                            onClick={() => fetchHotels(pagination.currentPage - 1)}
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="d-flex align-items-center px-3 fw-bold text-muted small bg-light rounded-pill border">
                            Page {pagination.currentPage} of {Math.ceil(pagination.count / 10) || 1}
                        </div>
                        <button 
                            disabled={!pagination.next || loading}
                            onClick={() => fetchHotels(pagination.currentPage + 1)}
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#f4f7ff' }}>
                            <tr>
                                <th className="ps-4 py-3" style={{ width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        checked={hotels.length > 0 && selectedIds.length === hotels.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>HOTEL</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>LOCATION</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>OWNER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>RATING</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5" style={{ color: '#667eea' }}>Loading hotels...</td>
                                </tr>
                            ) : hotels.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">No hotels found</td>
                                </tr>
                            ) : (
                                hotels.map((hotel) => (
                                    <tr key={hotel.id} className={selectedIds.includes(hotel.id) ? 'table-primary-subtle' : ''}>
                                        <td className="ps-4">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                checked={selectedIds.includes(hotel.id)}
                                                onChange={() => handleSelectOne(hotel.id)}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-3 bg-light overflow-hidden shadow-sm" style={{ width: '40px', height: '40px', border: '2px solid #fff' }}>
                                                    {hotel.image ? (
                                                        <img src={hotel.image} alt={hotel.name} className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f4f7ff', color: '#667eea' }}>
                                                            <Hotel size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="fw-bold mb-0" style={{ color: '#2d3748', fontSize: '13px' }}>{hotel.name || 'Untitled'}</p>
                                                    <p className="text-muted" style={{ fontSize: '11px', marginBottom: '0' }}>{hotel.badge || 'Standard'}</p>
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
                                                <Star size={14} style={{ color: '#ecc94b', fill: '#ecc94b' }} />
                                                <span className="small fw-bold" style={{ color: '#2d3748' }}>{hotel.rating || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button 
                                                    onClick={() => handleOpenEdit(hotel)}
                                                    className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenDelete(hotel)}
                                                    className="btn btn-sm btn-icon rounded-circle p-2 text-danger" style={{ backgroundColor: 'rgba(229, 62, 62, 0.05)' }}>
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

            {/* Form Modal (Add/Edit) */}
            <AdminModal
                show={showFormModal}
                onHide={() => setShowFormModal(false)}
                title={selectedHotel ? 'Edit Property Details' : 'Register New Property'}
                saveLabel={selectedHotel ? 'Update Property' : 'Register Property'}
                onSave={handleSave}
                loading={formLoading}
                size="lg"
            >
                <div className="row g-3">
                    <div className="col-md-8">
                        <label className="form-label small fw-bold text-muted">Property Name</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">Property Badge</label>
                        <select 
                            className="form-select rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.badge}
                            onChange={(e) => setFormData({...formData, badge: e.target.value})}
                        >
                            <option value="Luxury Stays">Luxury Stays</option>
                            <option value="Cheap & Best">Cheap & Best</option>
                            <option value="Dormitory">Dormitory</option>
                        </select>
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">City</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">Area</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.area}
                            onChange={(e) => setFormData({...formData, area: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">Nightly Price (₹)</label>
                        <input 
                            type="number" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: e.target.value})}
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Property Description</label>
                        <textarea 
                            rows="3"
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Hotel Image</label>
                        <div 
                            className="p-3 rounded-3 d-flex flex-column align-items-center justify-content-center border-dashed"
                            style={{ backgroundColor: '#f4f7ff', border: '2px dashed #e0e6ff', cursor: 'pointer' }}
                            onClick={() => document.getElementById('hotel_image_input').click()}
                        >
                            <Upload size={24} className="text-secondary mb-2" />
                            <span className="small text-muted fw-bold">
                                {selectedImage ? selectedImage.name : 'Click to upload main property image'}
                            </span>
                            <input 
                                id="hotel_image_input"
                                type="file" 
                                hidden 
                                accept="image/*"
                                onChange={(e) => setSelectedImage(e.target.files[0])}
                            />
                        </div>
                    </div>
                </div>
            </AdminModal>

            {/* Delete Confirmation Modal */}
            <AdminModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Confirm Data Deletion"
                saveLabel="Delete Property"
                onSave={confirmDelete}
                loading={formLoading}
                variant="danger"
            >
                <div className="text-center py-3">
                    <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex p-3 mb-4">
                        <AlertCircle size={40} />
                    </div>
                    <h5 className="fw-bold mb-2">Are you absolutely sure?</h5>
                    <p className="text-muted px-4">
                        You are about to delete <strong>{selectedHotel?.name}</strong>. This action will remove all rooms and images associated with this property.
                    </p>
                </div>
            </AdminModal>
            
            <style>{`
                .btn-icon:hover {
                    background-color: #f1f5f9 !important;
                }
                .table-hover tbody tr:hover {
                    background-color: #f8fafc;
                }
                .border-dashed:hover {
                    border-color: #667eea !important;
                    background-color: #f0f3ff !important;
                }
                .table-primary-subtle {
                    background-color: rgba(102, 126, 234, 0.05) !important;
                }
            `}</style>
        </div>
    );
};

export default HotelManagement;
