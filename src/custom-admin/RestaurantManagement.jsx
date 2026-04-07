import React, { useState, useEffect } from 'react';
import { 
  Utensils, Plus, Search, 
  Edit, Trash2, 
  MapPin, Star, AlertCircle, Upload, 
  ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';
import AdminModal from './AdminModal';

const RestaurantManagement = () => {
    const [restaurants, setRestaurants] = useState([]);
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
    const [selectedRes, setSelectedRes] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        name: '',
        city: '',
        area: '',
        badge: 'Casual Dining',
        cuisine_type: '',
        price_range: '₹₹',
        description: '',
        owner: ''
    });
    const [selectedImage, setSelectedImage] = useState(null);

    useEffect(() => {
        fetchRestaurants(1);
    }, [searchTerm]);

    const fetchRestaurants = async (page = 1) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`api/admin/restaurants/?page=${page}&search=${searchTerm}`);
            setRestaurants(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page
            });
        } catch (error) {
            console.error("Error fetching restaurants:", error);
            toast.error("Failed to load restaurants");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(restaurants.map(r => r.id));
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
        setSelectedRes(null);
        setFormData({
            name: '',
            city: '',
            area: '',
            badge: 'Casual Dining',
            cuisine_type: '',
            price_range: '₹₹',
            description: '',
            owner: ''
        });
        setSelectedImage(null);
        setShowFormModal(true);
    };

    const handleOpenEdit = (res) => {
        setSelectedRes(res);
        setFormData({
            name: res.name || '',
            city: res.city || '',
            area: res.area || '',
            badge: res.badge || 'Casual Dining',
            cuisine_type: res.cuisine_type || '',
            price_range: res.price_range || '₹₹',
            description: res.description || '',
            owner: res.owner || ''
        });
        setSelectedImage(null);
        setShowFormModal(true);
    };

    const handleOpenDelete = (res) => {
        setSelectedRes(res);
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
            if (selectedRes) {
                await AxiosInstance.put(`api/admin/restaurants/${selectedRes.id}/`, data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Restaurant updated successfully");
            } else {
                await AxiosInstance.post('api/admin/restaurants/', data, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                toast.success("Restaurant registered successfully");
            }
            setShowFormModal(false);
            fetchRestaurants(pagination.currentPage);
        } catch (error) {
            console.error("Error saving restaurant:", error);
            toast.error("Failed to save restaurant details");
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedRes) return;
        setFormLoading(true);
        try {
            await AxiosInstance.delete(`api/admin/restaurants/${selectedRes.id}/`);
            toast.success("Restaurant permanently removed");
            setShowDeleteModal(false);
            fetchRestaurants(pagination.currentPage);
        } catch (error) {
            console.error("Error deleting restaurant:", error);
            toast.error("Failed to delete restaurant");
        } finally {
            setFormLoading(false);
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} venues?`)) {
            try {
                await Promise.all(selectedIds.map(id => AxiosInstance.delete(`api/admin/restaurants/${id}/`)));
                toast.success("Bulk deletion successful");
                setSelectedIds([]);
                fetchRestaurants(pagination.currentPage);
            } catch (error) {
                toast.error("Some deletions failed");
            }
        }
    };

    const handleExport = () => {
        const headers = ["ID", "Name", "City", "Area", "Cuisine", "Price Range", "Rating"];
        const rows = restaurants.map(r => [r.id, r.name, r.city, r.area, r.cuisine_type, r.price_range, r.rating]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `restaurants_export_page_${pagination.currentPage}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>Restaurant Management</h3>
                    <p className="text-muted small mb-0">Total of {pagination.count} restaurants registered</p>
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
                        <span className="fw-bold" style={{ fontSize: '13px' }}>Register New Restaurant</span>
                    </button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="alert alert-primary rounded-4 border-0 shadow-sm d-flex justify-content-between align-items-center mb-4 py-3 px-4 animate__animated animate__fadeIn">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white rounded-circle p-2 text-primary d-flex align-items-center justify-content-center shadow-sm">
                            <Utensils size={20} />
                        </div>
                        <span className="fw-bold">{selectedIds.length} venues selected</span>
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
                            placeholder="Search by restaurant name, city, or cuisine..." 
                            className="form-control ps-5 rounded-pill border-0"
                            style={{ backgroundColor: '#f4f7ff', fontSize: '14px', height: '45px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>

                    <div className="d-flex gap-2">
                        <button 
                            disabled={!pagination.previous || loading}
                            onClick={() => fetchRestaurants(pagination.currentPage - 1)}
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="d-flex align-items-center px-3 fw-bold text-muted small bg-light rounded-pill border">
                            Page {pagination.currentPage} of {Math.ceil(pagination.count / 10) || 1}
                        </div>
                        <button 
                            disabled={!pagination.next || loading}
                            onClick={() => fetchRestaurants(pagination.currentPage + 1)}
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
                                        checked={restaurants.length > 0 && selectedIds.length === restaurants.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>RESTAURANT</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>LOCATION</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>CUISINE</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>PRICE RANGE</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5" style={{ color: '#667eea' }}>Loading restaurants...</td>
                                </tr>
                            ) : restaurants.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">No restaurants found</td>
                                </tr>
                            ) : (
                                restaurants.map((res) => (
                                    <tr key={res.id} className={selectedIds.includes(res.id) ? 'table-primary-subtle' : ''}>
                                        <td className="ps-4">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                checked={selectedIds.includes(res.id)}
                                                onChange={() => handleSelectOne(res.id)}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-3 bg-light overflow-hidden shadow-sm" style={{ width: '40px', height: '40px', border: '2px solid #fff' }}>
                                                    {res.image ? (
                                                        <img src={res.image} alt={res.name} className="w-100 h-100 object-fit-cover" />
                                                    ) : (
                                                        <div className="w-100 h-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#f4f7ff', color: '#667eea' }}>
                                                            <Utensils size={20} />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="fw-bold mb-0" style={{ color: '#2d3748', fontSize: '13px' }}>{res.name || 'Untitled'}</p>
                                                    <div className="d-flex align-items-center gap-1">
                                                        <Star size={12} style={{ color: '#ecc94b', fill: '#ecc94b' }} />
                                                        <span className="small text-muted fw-bold" style={{ fontSize: '11px' }}>{res.rating || 'N/A'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-1">
                                                <MapPin size={14} style={{ color: '#667eea' }} />
                                                <span className="small fw-medium text-secondary">{res.city || 'N/A'}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="badge rounded-pill border-0 px-3 py-2 fw-bold" style={{ backgroundColor: 'rgba(102, 126, 234, 0.1)', color: '#667eea', fontSize: '10px' }}>
                                                {res.cuisine_type || 'General'}
                                            </span>
                                        </td>
                                        <td>
                                            <span className="fw-bold" style={{ letterSpacing: '1px', color: '#48bb78', fontSize: '13px' }}>{res.price_range || '₹₹'}</span>
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button 
                                                    onClick={() => handleOpenEdit(res)}
                                                    className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenDelete(res)}
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
                title={selectedRes ? 'Edit Restaurant Profile' : 'Register New Restaurant'}
                saveLabel={selectedRes ? 'Update Restaurant' : 'Register Restaurant'}
                onSave={handleSave}
                loading={formLoading}
                size="lg"
            >
                <div className="row g-3">
                    <div className="col-md-8">
                        <label className="form-label small fw-bold text-muted">Restaurant Name</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">Dining Style</label>
                        <select 
                            className="form-select rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.badge}
                            onChange={(e) => setFormData({...formData, badge: e.target.value})}
                        >
                            <option value="Fine Dining">Fine Dining</option>
                            <option value="Casual Dining">Casual Dining</option>
                            <option value="Fast Food">Fast Food</option>
                            <option value="Cafe">Cafe</option>
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
                        <label className="form-label small fw-bold text-muted">Area / Street</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.area}
                            onChange={(e) => setFormData({...formData, area: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">Cuisine Category</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Italian, Indian"
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.cuisine_type}
                            onChange={(e) => setFormData({...formData, cuisine_type: e.target.value})}
                        />
                    </div>
                    <div className="col-md-4">
                        <label className="form-label small fw-bold text-muted">Price Range</label>
                        <select 
                            className="form-select rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.price_range}
                            onChange={(e) => setFormData({...formData, price_range: e.target.value})}
                        >
                            <option value="₹">Budget (₹)</option>
                            <option value="₹₹">Moderate (₹₹)</option>
                            <option value="₹₹₹">Premium (₹₹₹)</option>
                            <option value="₹₹₹₹">Luxury (₹₹₹₹)</option>
                        </select>
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-bold text-muted">About the Restaurant</label>
                        <textarea 
                            rows="3"
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        ></textarea>
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Display Image</label>
                        <div 
                            className="p-3 rounded-3 d-flex flex-column align-items-center justify-content-center border-dashed"
                            style={{ backgroundColor: '#f4f7ff', border: '2px dashed #e0e6ff', cursor: 'pointer' }}
                            onClick={() => document.getElementById('res_image_input').click()}
                        >
                            <Upload size={24} className="text-secondary mb-2" />
                            <span className="small text-muted fw-bold">
                                {selectedImage ? selectedImage.name : 'Click to upload main display image'}
                            </span>
                            <input 
                                id="res_image_input"
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
                saveLabel="Delete Restaurant"
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
                        You are about to delete <strong>{selectedRes?.name}</strong>. This action will remove all table configurations and images associated with this venue.
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

export default RestaurantManagement;
