import React, { useState, useEffect } from 'react';
import { 
  CalendarCheck, Hotel, Utensils, Search, 
  Filter, MoreVertical, Eye, Download, Edit, Trash2, AlertCircle, Clock,
  ChevronLeft, ChevronRight, User as UserIcon
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';
import AdminModal from './AdminModal';

const GlobalBookings = () => {
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
    const [selectedIds, setSelectedIds] = useState([]);
    
    // Modal States
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedItem, setSelectedItem] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form States
    const [newStatus, setNewStatus] = useState('');

    useEffect(() => {
        fetchTransactions(1);
    }, [activeTab, searchTerm]);

    const fetchTransactions = async (page = 1) => {
        setLoading(true);
        const endpoint = activeTab === 'hotels' ? 'api/admin/bookings/' : 'api/admin/reservations/';
        try {
            const response = await AxiosInstance.get(`${endpoint}?page=${page}&search=${searchTerm}`);
            setData(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page
            });
            setSelectedIds([]); // Reset selection on change
        } catch (error) {
            console.error("Error fetching transactions:", error);
            toast.error("Failed to load transactions");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(data.map(item => item.id));
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

    const handleOpenStatus = (item) => {
        setSelectedItem(item);
        setNewStatus(item.status);
        setShowStatusModal(true);
    };

    const handleOpenDelete = (item) => {
        setSelectedItem(item);
        setShowDeleteModal(true);
    };

    const handleUpdateStatus = async () => {
        setFormLoading(true);
        const endpoint = activeTab === 'hotels' ? 'api/admin/bookings/' : 'api/admin/reservations/';
        try {
            await AxiosInstance.patch(`${endpoint}${selectedItem.id}/`, { status: newStatus });
            toast.success("Status updated successfully");
            setShowStatusModal(false);
            fetchTransactions(pagination.currentPage);
        } catch (error) {
            toast.error("Failed to update status");
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = async () => {
        setFormLoading(true);
        const endpoint = activeTab === 'hotels' ? 'api/admin/bookings/' : 'api/admin/reservations/';
        try {
            await AxiosInstance.delete(`${endpoint}${selectedItem.id}/`);
            toast.success("Record deleted successfully");
            setShowDeleteModal(false);
            fetchTransactions(pagination.currentPage);
        } catch (error) {
            toast.error("Failed to delete record");
        } finally {
            setFormLoading(false);
        }
    };

    const handleBulkStatusUpdate = async (status) => {
        const endpoint = activeTab === 'hotels' ? 'api/admin/bookings/' : 'api/admin/reservations/';
        try {
            await Promise.all(selectedIds.map(id => AxiosInstance.patch(`${endpoint}${id}/`, { status })));
            toast.success(`Bulk update to ${status} successful`);
            setSelectedIds([]);
            fetchTransactions(pagination.currentPage);
        } catch (error) {
            toast.error("Some updates failed");
        }
    };

    const handleExport = () => {
        const headers = activeTab === 'hotels' 
            ? ["ID", "Date", "Customer", "Hotel", "Amount", "Status"]
            : ["ID", "Date", "Customer", "Restaurant", "Guests", "Status"];
        
        const rows = data.map(item => activeTab === 'hotels' 
            ? [`#HTL-${item.id}`, item.created_at, item.user_email, item.hotel_name, `₹${item.final_price}`, item.status]
            : [`#RES-${item.id}`, item.created_at, item.user_email, item.restaurant_name, item.number_of_guests, item.status]
        );

        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${activeTab}_export_page_${pagination.currentPage}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const statusBadge = (status) => {
        const s = status?.toLowerCase() || '';
        if (s.includes('confirm') || s.includes('paid') || s.includes('ready') || s.includes('complete')) 
            return { bg: 'rgba(72, 187, 120, 0.1)', color: '#48bb78' };
        if (s.includes('pending')) 
            return { bg: 'rgba(236, 201, 75, 0.1)', color: '#ecc94b' };
        if (s.includes('cancelled') || s.includes('failed')) 
            return { bg: 'rgba(229, 62, 62, 0.1)', color: '#e53e3e' };
        return { bg: 'rgba(113, 128, 150, 0.1)', color: '#718096' };
    };

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>Global Transactions</h3>
                    <p className="text-muted small mb-0">Monitor and manage all platform bookings</p>
                </div>
                <div className="d-flex gap-2">
                    <button 
                        onClick={handleExport}
                        className="btn rounded-pill px-4 d-flex align-items-center gap-2 border shadow-sm bg-white" style={{ color: '#667eea', fontWeight: 'bold' }}>
                        <Download size={18} />
                        <span style={{ fontSize: '13px' }}>Export {activeTab === 'hotels' ? 'Bookings' : 'Reservations'}</span>
                    </button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="alert alert-primary rounded-4 border-0 shadow-sm d-flex justify-content-between align-items-center mb-4 py-3 px-4 animate__animated animate__fadeIn">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white rounded-circle p-2 text-primary d-flex align-items-center justify-content-center shadow-sm">
                            <CalendarCheck size={20} />
                        </div>
                        <span className="fw-bold">{selectedIds.length} records selected</span>
                    </div>
                    <div className="d-flex gap-2">
                        <button className="btn btn-light btn-sm rounded-pill px-3 fw-bold" onClick={() => setSelectedIds([])}>Cancel</button>
                        <div className="dropdown">
                            <button className="btn btn-primary btn-sm rounded-pill px-3 fw-bold dropdown-toggle" data-bs-toggle="dropdown">
                                Mark as...
                            </button>
                            <ul className="dropdown-menu shadow border-0 rounded-3">
                                <li><button className="dropdown-item small fw-bold" onClick={() => handleBulkStatusUpdate('completed')}>Completed</button></li>
                                <li><button className="dropdown-item small fw-bold" onClick={() => handleBulkStatusUpdate('cancelled')}>Cancelled</button></li>
                                {activeTab === 'hotels' && <li><button className="dropdown-item small fw-bold" onClick={() => handleBulkStatusUpdate('confirmed')}>Paid</button></li>}
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden" style={{ border: '1px solid rgba(102, 126, 234, 0.1) !important' }}>
                <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between flex-wrap gap-3">
                    <div className="d-flex align-items-center mb-0 p-1 rounded-pill" style={{ backgroundColor: '#f4f7ff', width: 'fit-content', border: '1px solid #e0e6ff' }}>
                        <button 
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === 'hotels' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`}
                            style={{ color: activeTab === 'hotels' ? '#667eea' : '#718096', fontSize: '14px' }}
                            onClick={() => setActiveTab('hotels')}
                        >
                            <Hotel size={18} className="me-2" />
                            Hotel Stays
                        </button>
                        <button 
                            className={`btn rounded-pill px-4 py-2 fw-bold transition-all ${activeTab === 'restaurants' ? 'bg-white shadow-sm' : 'border-0 text-secondary'}`}
                            style={{ color: activeTab === 'restaurants' ? '#667eea' : '#718096', fontSize: '14px' }}
                            onClick={() => setActiveTab('restaurants')}
                        >
                            <Utensils size={18} className="me-2" />
                            Tables
                        </button>
                    </div>

                    <div className="d-flex gap-3 align-items-center">
                        <div className="position-relative" style={{ width: '250px' }}>
                            <Search className="position-absolute translate-middle-y top-50 start-0 ms-3" size={18} style={{ color: '#667eea' }} />
                            <input 
                                type="text" 
                                placeholder="Search records..." 
                                className="form-control ps-5 rounded-pill border-0"
                                style={{ backgroundColor: '#f4f7ff', fontSize: '13px', height: '40px' }}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        
                        <div className="d-flex gap-2">
                            <button 
                                disabled={!pagination.previous || loading}
                                onClick={() => fetchTransactions(pagination.currentPage - 1)}
                                className="btn btn-light rounded-circle p-2 border shadow-sm"
                            >
                                <ChevronLeft size={18} />
                            </button>
                            <div className="d-none d-md-flex align-items-center px-3 fw-bold text-muted small bg-light rounded-pill border">
                                {pagination.currentPage} / {Math.ceil(pagination.count / 10) || 1}
                            </div>
                            <button 
                                disabled={!pagination.next || loading}
                                onClick={() => fetchTransactions(pagination.currentPage + 1)}
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
                                <th className="ps-4 py-3" style={{ width: '40px' }}>
                                    <input 
                                        type="checkbox" 
                                        className="form-check-input" 
                                        checked={data.length > 0 && selectedIds.length === data.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>ID / DATE</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>CUSTOMER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>{activeTab === 'hotels' ? 'HOTEL' : 'RESTAURANT'}</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>DETAILS</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>STATUS</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5" style={{ color: '#667eea' }}>Loading records...</td>
                                </tr>
                            ) : data.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="text-center py-5">No records found for this view</td>
                                </tr>
                            ) : (
                                data.map((item) => {
                                    const badge = statusBadge(item.status);
                                    return (
                                        <tr key={item.id} className={selectedIds.includes(item.id) ? 'table-primary-subtle' : ''}>
                                            <td className="ps-4">
                                                <input 
                                                    type="checkbox" 
                                                    className="form-check-input" 
                                                    checked={selectedIds.includes(item.id)}
                                                    onChange={() => handleSelectOne(item.id)}
                                                />
                                            </td>
                                            <td className="py-3">
                                                <p className="fw-bold mb-0" style={{ color: activeTab === 'hotels' ? '#667eea' : '#764ba2', fontSize: '13px' }}>
                                                    #{activeTab === 'hotels' ? 'HTL' : 'RES'}-{item.id.toString().padStart(4, '0')}
                                                </p>
                                                <p className="text-muted small mb-0 font-monospace" style={{ fontSize: '10px' }}>{new Date(item.created_at).toLocaleDateString()}</p>
                                            </td>
                                            <td>
                                                <div className="d-flex align-items-center gap-2 link-primary cursor-pointer" onClick={() => navigate(`/custom-admin/users?search=${item.user_email}`)}>
                                                    <div className="bg-light p-1 rounded">
                                                        <UserIcon size={12} className="text-muted" />
                                                    </div>
                                                    <p className="small mb-0 fw-bold border-bottom border-primary-subtle" style={{ color: '#2d3748' }}>{item.user_email?.split('@')[0] || 'Guest'}</p>
                                                </div>
                                                <p className="text-muted small mb-0" style={{ fontSize: '10px' }}>{item.user_email}</p>
                                            </td>
                                            <td>
                                                <div className="cursor-pointer" onClick={() => navigate(`/custom-admin/${activeTab}?search=${activeTab === 'hotels' ? item.hotel_name : item.restaurant_name}`)}>
                                                    <p className="small mb-0 fw-bold hover-primary" style={{ color: '#4a5568' }}>{activeTab === 'hotels' ? item.hotel_name : item.restaurant_name}</p>
                                                    <p className="text-muted small mb-0" style={{ fontSize: '10px' }}>{activeTab === 'hotels' ? 'Property Record' : 'Venue Record'}</p>
                                                </div>
                                            </td>
                                            <td>
                                                {activeTab === 'hotels' ? (
                                                    <>
                                                        <p className="small mb-0 fw-bold" style={{ color: '#1a202c' }}>₹{item.final_price?.toLocaleString()}</p>
                                                        <p className="text-muted small mb-0" style={{ fontSize: '10px' }}>{item.rooms_booked} Rooms • {item.days_stayed} Nights</p>
                                                    </>
                                                ) : (
                                                    <>
                                                        <p className="small mb-0 fw-bold" style={{ color: '#1a202c' }}>{item.number_of_guests} Guests</p>
                                                        <p className="text-muted small mb-0" style={{ fontSize: '10px' }}>{item.reservation_time} • Table {item.table_capacity}</p>
                                                    </>
                                                )}
                                            </td>
                                            <td>
                                                <span className={`badge rounded-pill px-3 py-2 fw-bold text-uppercase`} style={{ 
                                                    fontSize: '9px',
                                                    backgroundColor: badge.bg,
                                                    color: badge.color
                                                }}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="text-end pe-4">
                                                <div className="d-flex gap-2 justify-content-end">
                                                    <button 
                                                        onClick={() => handleOpenStatus(item)}
                                                        className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                        <Edit size={18} />
                                                    </button>
                                                    <button 
                                                        onClick={() => handleOpenDelete(item)}
                                                        className="btn btn-sm btn-icon rounded-circle p-2 text-danger" style={{ backgroundColor: 'rgba(229, 62, 62, 0.05)' }}>
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Status Modal */}
            <AdminModal
                show={showStatusModal}
                onHide={() => setShowStatusModal(false)}
                title="Update Transaction Status"
                saveLabel="Update Status"
                onSave={handleUpdateStatus}
                loading={formLoading}
            >
                <div className="py-2">
                    <label className="form-label small fw-bold text-muted">Select New Status</label>
                    <select 
                        className="form-select rounded-3 border-0 py-3 px-3 shadow-sm" 
                        style={{ backgroundColor: '#f4f7ff' }}
                        value={newStatus}
                        onChange={(e) => setNewStatus(e.target.value)}
                    >
                        {activeTab === 'hotels' ? (
                            <>
                                <option value="pending">Pending Review</option>
                                <option value="confirmed">Confirmed / Paid</option>
                                <option value="completed">Stay Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </>
                        ) : (
                            <>
                                <option value="Table Pending">Table Pending</option>
                                <option value="Your Table Is Ready">Table Ready</option>
                                <option value="completed">Completed</option>
                                <option value="cancelled">Cancelled</option>
                            </>
                        )}
                    </select>
                    <div className="mt-3 p-3 rounded-4 bg-light d-flex gap-3 align-items-center">
                        <Clock size={20} className="text-primary" />
                        <p className="small text-muted mb-0 fw-medium">Status changes are recorded for audit and immediately visible to the customer.</p>
                    </div>
                </div>
            </AdminModal>

            {/* Delete Confirmation Modal */}
            <AdminModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Permanent Record Archival"
                saveLabel="Delete Records"
                onSave={confirmDelete}
                loading={formLoading}
                variant="danger"
            >
                <div className="text-center py-3">
                    <div className="bg-danger-subtle text-danger rounded-circle d-inline-flex p-3 mb-4 animate__animated animate__shakeX">
                        <AlertCircle size={40} />
                    </div>
                    <h5 className="fw-bold mb-2">Are you absolutely sure?</h5>
                    <p className="text-muted px-4 small">
                        Deleting this transaction is permanent. You will lose all historical data, financial logs, and guest details associated with this record.
                    </p>
                </div>
            </AdminModal>
            
            <style>{`
                .transition-all { transition: all 0.2s ease; }
                .btn-icon:hover { background-color: #f1f5f9 !important; }
                .table-hover tbody tr:hover { background-color: #f8fafc; }
                .table-primary-subtle { background-color: rgba(102, 126, 234, 0.05) !important; }
                .hover-primary:hover { color: #667eea !important; text-decoration: underline; }
                .cursor-pointer { cursor: pointer; }
            `}</style>
        </div>
    );
};

export default GlobalBookings;
