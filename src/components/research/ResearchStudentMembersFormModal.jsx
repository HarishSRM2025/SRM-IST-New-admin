import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, Save, X } from 'lucide-react';

const getInitials = (name = '') =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'R';

const ResearchStudentMembersFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message,
  researchCenters = [],
}) => {
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [centerSearch, setCenterSearch] = useState('');

  if (!isModalOpen) return null;

  const selectedCenter = researchCenters.find(center => center._id === formData.researchCenterId);
  const filteredCenterList = researchCenters.filter(center => {
    const query = centerSearch.trim().toLowerCase();
    if (!query) return true;
    return [center.centerName, center.centerMission].some(value =>
      String(value || '').toLowerCase().includes(query)
    );
  });

  const handleCenterSelect = (centerId) => {
    handleChange({ target: { name: 'researchCenterId', value: centerId } });
    setIsCenterOpen(false);
    setCenterSearch('');
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {formData._id ? 'Edit Student Member' : 'Add Student Member'}
          </h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={24} />
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} animate-fade-in`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Research Center Dropdown */}
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label">Research Center</label>
            <input
              name="researchCenterId"
              value={formData.researchCenterId || ''}
              onChange={() => {}}
              required
              tabIndex={-1}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
            />

            <button
              type="button"
              onClick={() => setIsCenterOpen(prev => !prev)}
              style={{
                width: '100%',
                minHeight: '64px',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                background: '#fff',
                padding: '10px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              {selectedCenter ? (
                <span style={{ display: 'flex', alignItems: 'center', gap: '12px', minWidth: 0 }}>
                  <span style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    background: 'var(--primary-blue-light)',
                    color: 'var(--primary-blue)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {getInitials(selectedCenter.centerName)}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
                      {selectedCenter.centerName}
                    </span>
                    <span style={{ display: 'block', color: 'var(--text-gray)', fontSize: '12px', marginTop: '3px' }}>
                      {selectedCenter.centerMission ? selectedCenter.centerMission.substring(0, 40) + '...' : 'No mission'}
                    </span>
                  </span>
                </span>
              ) : (
                <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>Select Research Center</span>
              )}
              <ChevronDown size={18} color="var(--text-gray)" />
            </button>

            {isCenterOpen && (
              <div style={{
                position: 'absolute',
                top: 'calc(100% + 6px)',
                left: 0,
                right: 0,
                zIndex: 5,
                background: '#fff',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-xl)',
                maxHeight: '280px',
                overflowY: 'auto',
                padding: '6px',
              }}>
                <div style={{ padding: '6px 6px 10px' }}>
                  <input
                    type="text"
                    className="form-input"
                    value={centerSearch}
                    onChange={(event) => setCenterSearch(event.target.value)}
                    placeholder="Search center name, mission..."
                    style={{ fontSize: '13px', padding: '10px 12px' }}
                  />
                </div>

                {filteredCenterList.length > 0 ? filteredCenterList.map(center => (
                  <button
                    type="button"
                    key={center._id}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleCenterSelect(center._id);
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      background: formData.researchCenterId === center._id ? 'var(--primary-blue-light)' : 'transparent',
                      padding: '10px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      cursor: 'pointer',
                      textAlign: 'left',
                    }}
                  >
                    <span style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      background: 'var(--bg-body)',
                      color: 'var(--primary-blue)',
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      flexShrink: 0,
                    }}>
                      {getInitials(center.centerName)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
                        {center.centerName}
                      </div>
                      <div style={{ color: 'var(--text-gray)', fontSize: '12px', marginTop: '3px' }}>
                        {center.centerMission ? center.centerMission.substring(0, 45) + '...' : 'No mission'}
                      </div>
                    </span>
                  </button>
                )) : (
                  <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                    No research centers found
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Student Name */}
          <div className="form-group" style={{ marginTop: '20px' }}>
            <label className="form-label">Student Name</label>
            <input
              type="text"
              name="studentName"
              className="form-input"
              value={formData.studentName || ''}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Member' : 'Add Member'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ResearchStudentMembersFormModal;
