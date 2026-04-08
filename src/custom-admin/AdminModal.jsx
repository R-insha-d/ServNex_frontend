import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { X } from 'lucide-react';

const AdminModal = ({ 
    show, 
    onHide, 
    title, 
    children, 
    saveLabel = 'Save Changes', 
    onSave, 
    loading = false,
    size = 'md',
    variant = 'primary' // 'primary' or 'danger'
}) => {
    return (
        <Modal 
            show={show} 
            onHide={onHide} 
            centered 
            size={size}
            contentClassName="border-0 shadow-lg rounded-4 overflow-hidden"
            backdrop="static"
        >
            <Modal.Header className="border-0 px-4 pt-4 pb-0 bg-white d-flex align-items-center justify-content-between">
                <Modal.Title className="fw-bold" style={{ letterSpacing: '-0.5px', color: '#2d3748' }}>
                    {title}
                </Modal.Title>
                <button 
                    onClick={onHide} 
                    className="btn btn-link p-2 rounded-circle hover-bg-light text-muted border-0 transition-all"
                >
                    <X size={20} />
                </button>
            </Modal.Header>
            
            <Modal.Body className="px-4 py-4" style={{ fontFamily: "'Poppins', sans-serif" }}>
                {children}
            </Modal.Body>

            <Modal.Footer className="border-0 px-4 pb-4 pt-0 bg-white">
                <Button 
                    variant="link" 
                    className="text-decoration-none text-secondary fw-bold border-0" 
                    onClick={onHide}
                    disabled={loading}
                >
                    Cancel
                </Button>
                <Button 
                    onClick={onSave}
                    disabled={loading}
                    className="rounded-pill px-4 fw-bold shadow-sm border-0 transition-all"
                    style={{ 
                        backgroundColor: variant === 'danger' ? '#e53e3e' : '#667eea',
                        color: '#fff',
                        opacity: loading ? 0.7 : 1
                    }}
                >
                    {loading ? 'Processing...' : saveLabel}
                </Button>
            </Modal.Footer>

            <style>{`
                .hover-bg-light:hover {
                    background-color: #f7fafc;
                    color: #2d3748 !important;
                }
                .modal-content {
                    animation: modalScaleIn 0.2s cubic-bezier(0.34, 1.56, 0.64, 1);
                }
                @keyframes modalScaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </Modal>
    );
};

export default AdminModal;
