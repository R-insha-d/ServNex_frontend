import React, { useState, useEffect } from 'react';
import { 
  Users, UserPlus, Search, 
  MoreVertical, Edit, Trash2, 
  CheckCircle, XCircle 
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';

const UserManagement = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await AxiosInstance.get('api/admin/users/');
            setUsers(response.data);
        } catch (error) {
            console.error("Error fetching users:", error);
            toast.error("Failed to load users");
        } finally {
            setLoading(false);
        }
    };

    const toggleStatus = async (user) => {
        try {
            await AxiosInstance.patch(`api/admin/users/${user.id}/`, {
                is_active: !user.is_active
            });
            toast.success(`User ${user.is_active ? 'deactivated' : 'activated'} successfully`);
            fetchUsers();
        } catch (error) {
            console.error("Error updating user status:", error);
            toast.error("Failed to update user status");
        }
    };

    const deleteUser = async (id) => {
        if (!window.confirm("Are you sure you want to delete this user?")) return;
        try {
            await AxiosInstance.delete(`api/admin/users/${id}/`);
            toast.success("User deleted successfully");
            fetchUsers();
        } catch (error) {
            console.error("Error deleting user:", error);
            toast.error("Failed to delete user");
        }
    };

    const filteredUsers = users.filter(user => 
        (user.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
        (user.email?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );

    return (
        <div className="container-fluid p-0" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>User Management</h3>
                    <p className="text-muted small mb-0">Total of {users.length} registered users</p>
                </div>
                <button className="btn rounded-pill px-4 d-flex align-items-center gap-2 shadow-sm" style={{ backgroundColor: '#667eea', color: '#fff', border: 'none' }}>
                    <UserPlus size={18} />
                    <span className="fw-bold" style={{ fontSize: '13px' }}>Add New User</span>
                </button>
            </div>

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
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead style={{ backgroundColor: '#f4f7ff' }}>
                            <tr>
                                <th className="ps-4 py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>USER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>ROLE</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>STATUS</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>JOINED</th>
                                <th className="py-3 text-secondary small fw-bold text-end pe-4" style={{ letterSpacing: '0.5px' }}>ACTIONS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5" style={{ color: '#667eea' }}>Loading users...</td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="text-center py-5">No users found</td>
                                </tr>
                            ) : (
                                filteredUsers.map((user) => (
                                    <tr key={user.id}>
                                        <td className="ps-4 py-3">
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
                                            <span className={`badge rounded-pill px-3 py-2 fw-bold`} style={{ 
                                                fontSize: '11px',
                                                backgroundColor: user.role === 'Business' ? 'rgba(72, 187, 120, 0.1)' : 'rgba(102, 126, 234, 0.1)',
                                                color: user.role === 'Business' ? '#48bb78' : '#667eea'
                                            }}>
                                                {user.role}
                                            </span>
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
                                                >
                                                    {user.is_active ? <XCircle size={18} /> : <CheckCircle size={18} />}
                                                </button>
                                                <button className="btn btn-sm btn-icon rounded-circle p-2" style={{ color: '#667eea', backgroundColor: '#f4f7ff' }}>
                                                    <Edit size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="p-4 border-top bg-white d-flex align-items-center justify-content-between">
                    <p className="text-muted small mb-0">Showing {filteredUsers.length} of {users.length} users</p>
                    <nav>
                        <ul className="pagination pagination-sm mb-0">
                            <li className="page-item disabled"><a className="page-link border-0 bg-light rounded-circle mx-1" href="#">&laquo;</a></li>
                            <li className="page-item active"><a className="page-link border-0 rounded-circle mx-1" href="#">1</a></li>
                            <li className="page-item"><a className="page-link border-0 bg-light rounded-circle mx-1" href="#">2</a></li>
                            <li className="page-item"><a className="page-link border-0 bg-light rounded-circle mx-1" href="#">&raquo;</a></li>
                        </ul>
                    </nav>
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

export default UserManagement;
