import React from 'react';
import { X, Filter, RotateCcw } from 'lucide-react';

const FilterSidebar = ({ isOpen, onHide, filters, activeFilters, onFilterChange, onReset }) => {
    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div 
                className="position-fixed top-0 start-0 w-100 h-100 animate__animated animate__fadeIn"
                style={{ backgroundColor: 'rgba(0,0,0,0.3)', zIndex: 1050, backdropFilter: 'blur(2px)' }}
                onClick={onHide}
            ></div>

            {/* Sidebar */}
            <div 
                className="position-fixed top-0 end-0 h-100 bg-white shadow-lg animate__animated animate__slideInRight"
                style={{ width: '350px', zIndex: 1060, borderLeft: '1px solid #e0e6ff' }}
            >
                <div className="p-4 h-100 d-flex flex-column" style={{ fontFamily: "'Poppins', sans-serif" }}>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="d-flex align-items-center gap-2">
                            <div className="p-2 rounded-3 bg-primary-subtle text-primary">
                                <Filter size={20} />
                            </div>
                            <h5 className="fw-bold mb-0">Advanced Filters</h5>
                        </div>
                        <button className="btn btn-light rounded-circle shadow-sm p-2" onClick={onHide}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="flex-grow-1 overflow-y-auto px-1">
                        {filters.map((filter, idx) => (
                            <div key={idx} className="mb-4">
                                <label className="form-label small fw-bold text-muted text-uppercase mb-3" style={{ letterSpacing: '0.8px' }}>
                                    {filter.label}
                                </label>
                                
                                {filter.type === 'select' && (
                                    <select 
                                        className="form-select rounded-3 border-0 py-2 px-3 shadow-sm bg-light"
                                        value={activeFilters[filter.name] || ''}
                                        onChange={(e) => onFilterChange(filter.name, e.target.value)}
                                        style={{ fontSize: '13px' }}
                                    >
                                        <option value="">All {filter.label}</option>
                                        {filter.options.map((opt, i) => (
                                            <option key={i} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                )}

                                {filter.type === 'checkbox' && (
                                    <div className="d-flex flex-column gap-2">
                                        {filter.options.map((opt, i) => (
                                            <div key={i} className="form-check custom-check">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    checked={Array.isArray(activeFilters[filter.name]) ? activeFilters[filter.name].includes(opt.value) : false}
                                                    onChange={(e) => {
                                                        const current = activeFilters[filter.name] || [];
                                                        const updated = e.target.checked 
                                                            ? [...current, opt.value] 
                                                            : current.filter(v => v !== opt.value);
                                                        onFilterChange(filter.name, updated);
                                                    }}
                                                />
                                                <label className="form-check-label small fw-medium" style={{ color: '#4a5568' }}>
                                                    {opt.label}
                                                </label>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="pt-4 border-top d-flex gap-2">
                        <button 
                            className="btn btn-light flex-grow-1 rounded-pill fw-bold d-flex align-items-center justify-content-center gap-2 py-2"
                            onClick={onReset}
                            style={{ fontSize: '14px', border: '1px solid #e2e8f0' }}
                        >
                            <RotateCcw size={16} /> Reset
                        </button>
                        <button 
                            className="btn btn-primary flex-grow-1 rounded-pill fw-bold py-2"
                            onClick={onHide}
                            style={{ fontSize: '14px', backgroundColor: '#667eea', border: 'none' }}
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-check .form-check-input:checked {
                    background-color: #667eea;
                    border-color: #667eea;
                }
                .bg-primary-subtle { background-color: rgba(102, 126, 234, 0.1); }
            `}</style>
        </>
    );
};

export default FilterSidebar;
