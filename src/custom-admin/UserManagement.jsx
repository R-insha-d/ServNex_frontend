import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, 
  Edit, Trash2, 
  CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Download
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';
import AdminModal from './AdminModal';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
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
    const [selectedUser, setSelectedUser] = useState(null);
    const [formLoading, setFormLoading] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        first_name: '',
        email: '',
        phone: '',
        role: 'User',
        is_active: true,
        is_staff: false,
        password: ''
    });

    useEffect(() => {
        fetchUsers(1);
    }, [searchTerm]);

    const fetchUsers = async (page = 1) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`api/admin/users/?page=${page}&search=${searchTerm}`);
            setUsers(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page
            });
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const handleSelectAll = (e) => {
        if (e.target.checked) {
            setSelectedIds(users.map(u => u.id));
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
        setSelectedUser(null);
        setFormData({
            first_name: '',
            email: '',
            phone: '',
            role: 'User',
            is_active: true,
            is_staff: false,
            password: ''
        });
        setShowFormModal(true);
    };

    const handleOpenEdit = (user) => {
        setSelectedUser(user);
        setFormData({
            first_name: user.first_name || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'User',
            is_active: user.is_active,
            is_staff: user.is_staff,
            password: '' 
        });
        setShowFormModal(true);
    };

    const handleOpenDelete = (user) => {
        setSelectedUser(user);
        setShowDeleteModal(true);
    };

    const handleSave = async () => {
        if (!formData.first_name || !formData.email) {
            toast.error("Name and Email are required");
            return;
        }

        setFormLoading(true);
        try {
            if (selectedUser) {
                await AxiosInstance.put(`api/admin/users/${selectedUser.id}/`, formData);
                toast.success("User updated successfully");
            } else {
                if (!formData.password) {
                    toast.error("Password is required for new users");
                    setFormLoading(false);
                    return;
                }
                await AxiosInstance.post('api/admin/users/', formData);
                toast.success("User created successfully");
            }
            setShowFormModal(false);
            fetchUsers(pagination.currentPage);
        } catch (error) {
            console.error("Error saving user:", error);
            const errorMsg = error.response?.data?.email?.[0] || error.response?.data?.phone?.[0] || "Failed to save user";
            toast.error(errorMsg);
        } finally {
            setFormLoading(false);
        }
    };

    const confirmDelete = async () => {
        if (!selectedUser) return;
        setFormLoading(true);
        try {
            await AxiosInstance.delete(`api/admin/users/${selectedUser.id}/`);
            toast.success("User permanently removed");
            setShowDeleteModal(false);
            fetchUsers(pagination.currentPage);
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        } finally {
            setFormLoading(false);
        }
    };

    const toggleStatus = async (user) => {
        try {
            await AxiosInstance.patch(`api/admin/users/${user.id}/`, {
                is_active: !user.is_active
            });
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'}`);
            fetchUsers(pagination.currentPage);
        } catch (error) {
            toast.error("Status update failed");
        }
    };

    const handleBulkDelete = async () => {
        if (window.confirm(`Are you sure you want to permanently delete ${selectedIds.length} users?`)) {
            try {
                await Promise.all(selectedIds.map(id => AxiosInstance.delete(`api/admin/users/${id}/`)));
                toast.success("Bulk deletion successful");
                setSelectedIds([]);
                fetchUsers(pagination.currentPage);
            } catch (error) {
                toast.error("Some deletions failed");
            }
        }
    };

    const handleExport = () => {
        // Simple client-side JSON to CSV for now
        const headers = ["ID", "Name", "Email", "Role", "Status", "Joined"];
        const rows = users.map(u => [u.id, u.first_name, u.email, u.role, u.is_active ? 'Active' : 'Inactive', u.date_joined]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `users_export_page_${pagination.currentPage}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>User Management</h3>
                    <p className="text-muted small mb-0">Total of {pagination.count} registered users</p>
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
                        <UserPlus size={18} />
                        <span className="fw-bold" style={{ fontSize: '13px' }}>Add New User</span>
                    </button>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="alert alert-primary rounded-4 border-0 shadow-sm d-flex justify-content-between align-items-center mb-4 py-3 px-4 animate__animated animate__fadeIn">
                    <div className="d-flex align-items-center gap-3">
                        <div className="bg-white rounded-circle p-2 text-primary d-flex align-items-center justify-content-center shadow-sm">
                            <Users size={20} />
                        </div>
                        <span className="fw-bold">{selectedIds.length} users selected</span>
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
                            placeholder="Search by name or email..." 
                            className="form-control ps-5 rounded-pill border-0"
                            style={{ backgroundColor: '#f4f7ff', fontSize: '14px', height: '45px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="d-flex gap-2">
                        {/* Pagination Controls */}
                        <button 
                            disabled={!pagination.previous || loading}
                            onClick={() => fetchUsers(pagination.currentPage - 1)}
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="d-flex align-items-center px-3 fw-bold text-muted small bg-light rounded-pill border">
                            Page {pagination.currentPage} of {Math.ceil(pagination.count / 10) || 1}
                        </div>
                        <button 
                            disabled={!pagination.next || loading}
                            onClick={() => fetchUsers(pagination.currentPage + 1)}
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
                                        checked={users.length > 0 && selectedIds.length === users.length}
                                        onChange={handleSelectAll}
                                    />
                                </th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>USER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>ROLE</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>STATUS</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>JOINED</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5" style={{ color: '#667eea' }}>Loading users...</td>
                                </tr>
                            ) : users.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">No users found</td>
                                </tr>
                            ) : (
                                users.map((user) => (
                                    <tr key={user.id} className={selectedIds.includes(user.id) ? 'table-primary-subtle' : ''}>
                                        <td className="ps-4">
                                            <input 
                                                type="checkbox" 
                                                className="form-check-input" 
                                                checked={selectedIds.includes(user.id)}
                                                onChange={() => handleSelectOne(user.id)}
                                            />
                                        </td>
                                        <td className="py-3">
                                            <div className="d-flex align-items-center gap-3">
                                                <div className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white shadow-sm" style={{ width: '40px', height: '40px', fontSize: '14px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                    {user.first_name ? user.first_name[0].toUpperCase() : 'U'}
                                                </div>
                                                <div>
                                                    <p className="fw-bold mb-0" style={{ color: '#2d3748', fontSize: '14px' }}>{user.first_name || 'No Name'}</p>
                                                    <p className="text-muted small mb-0">{user.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`badge rounded-pill px-3 py-2 fw-bold text-uppercase`} style={{ 
                                                fontSize: '10px',
                                                backgroundColor: 'rgba(102, 126, 234, 0.1)',
                                                color: '#667eea'
                                            }}>
                                                {user.role}
                                            </span>
                                            {user.is_staff && (
                                                <span className="ms-2 badge rounded-pill bg-success-subtle text-success" style={{ fontSize: '10px' }}>STAFF</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="rounded-circle" style={{ width: '8px', height: '8px', backgroundColor: user.is_active ? '#48bb78' : '#e53e3e' }}></div>
                                                <span className="small fw-bold" style={{ color: user.is_active ? '#48bb78' : '#e53e3e' }}>
                                                    {user.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="text-muted small fw-medium">
                                            {new Date(user.date_joined).toLocaleDateString()}
                                        </td>
                                        <td className="text-end pe-4">
                                            <div className="d-flex gap-2 justify-content-end">
                                                <button 
                                                    className="btn btn-sm btn-icon rounded-circle p-2"
                                                    style={{ color: user.is_active ? '#e53e3e' : '#48bb78', backgroundColor: '#f4f7ff' }}
                                                    onClick={() => toggleStatus(user)}
                                                    title={user.is_active ? "Deactivate" : "Activate"}
                                                >
                                                    {user.is_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenEdit(user)}
                                                    className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Edit size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => handleOpenDelete(user)}
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
                title={selectedUser ? 'Edit User Profile' : 'Register New User'}
                saveLabel={selectedUser ? 'Update User' : 'Create User'}
                onSave={handleSave}
                loading={formLoading}
            >
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small fw-bold text-muted">Full Name</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.first_name}
                            onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Email Address</label>
                        <input 
                            type="email" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">Phone Number</label>
                        <input 
                            type="text" 
                            className="form-control rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                    {!selectedUser && (
                        <div className="col-12">
                            <label className="form-label small fw-bold text-muted">Password</label>
                            <input 
                                type="password" 
                                className="form-control rounded-3 border-0 py-2 px-3" 
                                style={{ backgroundColor: '#f4f7ff' }}
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                            />
                            <p className="text-muted" style={{ fontSize: '10px' }}>User will be able to change this later.</p>
                        </div>
                    )}
                    <div className="col-md-6">
                        <label className="form-label small fw-bold text-muted">System Role</label>
                        <select 
                            className="form-select rounded-3 border-0 py-2 px-3" 
                            style={{ backgroundColor: '#f4f7ff' }}
                            value={formData.role}
                            onChange={(e) => setFormData({...formData, role: e.target.value})}
                        >
                            <option value="User">Customer (User)</option>
                            <option value="Business">Business Partner</option>
                            <option value="Hotel">Hotel Owner</option>
                            <option value="Restaurant">Restaurant Owner</option>
                        </select>
                    </div>
                    <div className="col-md-6 d-flex align-items-end">
                        <div className="form-check form-switch mb-2">
                            <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={formData.is_staff}
                                onChange={(e) => setFormData({...formData, is_staff: e.target.checked})}
                            />
                            <label className="form-check-label small fw-bold text-muted">Is Staff Member</label>
                        </div>
                    </div>
                </div>
            </AdminModal>

            {/* Delete Confirmation Modal */}
            <AdminModal
                show={showDeleteModal}
                onHide={() => setShowDeleteModal(false)}
                title="Confirm Data Deletion"
                saveLabel="Delete Permanently"
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
                        You are about to delete <strong>{selectedUser?.first_name}</strong>. This action is permanent and will remove all associated history.
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
                .table-primary-subtle {
                    background-color: rgba(102, 126, 234, 0.05) !important;
                }
                .animate__animated {
                    animation-duration: 0.3s;
                }
            `}</style>
        </div>
    );
};

export default UserManagement;
