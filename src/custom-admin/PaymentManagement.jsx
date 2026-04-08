import React, { useState, useEffect } from 'react';
import { 
  CreditCard, Search, 
  CheckCircle, XCircle, AlertCircle,
  ChevronLeft, ChevronRight, Download,
  ExternalLink, IndianRupee
} from 'lucide-react';
import AxiosInstance from '../Component/AxiosInstance';
import { toast } from 'react-toastify';

const PaymentManagement = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [pagination, setPagination] = useState({
        count: 0,
        next: null,
        previous: null,
        currentPage: 1
    });

    useEffect(() => {
        fetchPayments(1);
    }, [searchTerm]);

    const fetchPayments = async (page = 1) => {
        setLoading(true);
        try {
            const response = await AxiosInstance.get(`api/admin/payments/?page=${page}&search=${searchTerm}`);
            setPayments(response.data.results);
            setPagination({
                count: response.data.count,
                next: response.data.next,
                previous: response.data.previous,
                currentPage: page
            });
        } catch (error) {
            console.error("Error fetching payments:", error);
            toast.error("Failed to load payment history");
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        switch(status.toLowerCase()) {
            case 'success':
                return <span className="badge rounded-pill bg-success-subtle text-success px-3 py-2 fw-bold text-uppercase" style={{ fontSize: '10px' }}>SUCCESS</span>;
            case 'failed':
                return <span className="badge rounded-pill bg-danger-subtle text-danger px-3 py-2 fw-bold text-uppercase" style={{ fontSize: '10px' }}>FAILED</span>;
            default:
                return <span className="badge rounded-pill bg-warning-subtle text-warning px-3 py-2 fw-bold text-uppercase" style={{ fontSize: '10px' }}>PENDING</span>;
        }
    };

    const handleExport = () => {
        const headers = ["Order ID", "User", "Item", "Amount", "Status", "Date"];
        const rows = payments.map(p => [p.razorpay_order_id, p.user_email, p.item_name, `${p.currency} ${p.amount}`, p.status, new Date(p.created_at).toLocaleString()]);
        const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `payments_report_${new Date().toLocaleDateString()}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid p-0 animate__animated animate__fadeIn" style={{ fontFamily: "'Poppins', sans-serif" }}>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h3 className="fw-bold text-dark mb-1" style={{ letterSpacing: '-1px' }}>Financial Transactions</h3>
                    <p className="text-muted small mb-0">Platform revenue and payment verification center</p>
                </div>
                <button 
                    onClick={handleExport}
                    className="btn btn-light rounded-pill px-4 d-flex align-items-center gap-2 border shadow-sm bg-white" style={{ fontSize: '13px' }}>
                    <Download size={16} />
                    <span className="fw-bold">Download Finance Report</span>
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div className="p-4 border-bottom bg-white d-flex align-items-center justify-content-between">
                    <div className="position-relative" style={{ width: '350px' }}>
                        <Search className="position-absolute translate-middle-y top-50 start-0 ms-3" size={18} style={{ color: '#667eea' }} />
                        <input 
                            type="text" 
                            placeholder="Search by Order ID or email..." 
                            className="form-control ps-5 rounded-pill border-0"
                            style={{ backgroundColor: '#f4f7ff', fontSize: '14px', height: '45px' }}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    
                    <div className="d-flex gap-2">
                        <button 
                            disabled={!pagination.previous || loading}
                            onClick={() => fetchPayments(pagination.currentPage - 1)}
                            className="btn btn-light rounded-circle p-2 border shadow-sm"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <div className="d-flex align-items-center px-3 fw-bold text-muted small bg-light rounded-pill border">
                            Page {pagination.currentPage} of {Math.ceil(pagination.count / 10) || 1}
                        </div>
                        <button 
                            disabled={!pagination.next || loading}
                            onClick={() => fetchPayments(pagination.currentPage + 1)}
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
                                <th className="ps-4 py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>TRANSACTION</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>USER</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>PURCHASED ITEM</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>AMOUNT</th>
                                <th className="py-3 text-secondary small fw-bold" style={{ letterSpacing: '0.5px' }}>DATE</th>
                                <th className="py-3 text-secondary small fw-bold text-center" style={{ letterSpacing: '0.5px' }}>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5" style={{ color: '#667eea' }}>
                                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                        Fetching financial data...
                                    </td>
                                </tr>
                            ) : payments.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="text-center py-5">
                                        <div className="text-muted">
                                            <AlertCircle size={32} className="mb-2 opacity-25" />
                                            <p className="mb-0">No transactions recorded yet</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                payments.map((payment) => (
                                    <tr key={payment.id}>
                                        <td className="ps-4">
                                            <div>
                                                <p className="fw-bold mb-0 text-dark" style={{ fontSize: '13px' }}>{payment.razorpay_order_id}</p>
                                                <p className="text-muted small mb-0 font-monospace" style={{ fontSize: '11px' }}>PID: {payment.razorpay_payment_id || 'N/A'}</p>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="d-flex align-items-center gap-2">
                                                <div className="bg-light rounded-circle p-1">
                                                    <CreditCard size={14} className="text-primary" />
                                                </div>
                                                <span className="small fw-medium text-dark">{payment.user_email}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <span className="small fw-bold text-secondary">{payment.item_name}</span>
                                        </td>
                                        <td>
                                            <span className="fw-bold text-dark d-flex align-items-center gap-1">
                                                <small className="text-muted">{payment.currency}</small>
                                                {parseFloat(payment.amount).toLocaleString()}
                                            </span>
                                        </td>
                                        <td className="text-muted small fw-medium">
                                            {new Date(payment.created_at).toLocaleDateString()}
                                            <br />
                                            <small>{new Date(payment.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                                        </td>
                                        <td className="text-center">
                                            {getStatusBadge(payment.status)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <style>{`
                .table-hover tbody tr:hover {
                    background-color: #f8fafc;
                }
                .font-monospace {
                    font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace;
                }
            `}</style>
        </div>
    );
};

export default PaymentManagement;
