import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, Save, X } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const getId = (value) => (
  typeof value === 'object' && value !== null ? value._id : value
);

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  return `${API_BASE}/${path.replace(/\\/g, '/')}`;
};

const getInitials = (name = '') => (
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0])
    .join('')
    .toUpperCase() || 'R'
);

const ResearchFacultyMembersFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message,
  researchCenters = [],
  facultyMembers = [],
}) => {
  const [isCenterOpen, setIsCenterOpen] = useState(false);
  const [centerSearch, setCenterSearch] = useState('');
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');

  if (!isModalOpen) return null;

  const selectedCenter = researchCenters.find(center => center._id === formData.researchCenterId);
  const filteredCenterList = researchCenters.filter(center => {
    const query = centerSearch.trim().toLowerCase();
    if (!query) return true;
    return [center.centerName, center.centerMission].some(value =>
      String(value || '').toLowerCase().includes(query)
    );
  });

  const selectedFaculty = facultyMembers.find(faculty => faculty._id === formData.facultyId);
  const filteredFacultyList = facultyMembers.filter(faculty => {
    const query = facultySearch.trim().toLowerCase();
    if (!query) return true;
    return [faculty.facultyName, faculty.designation, faculty.facultyEmail].some(value =>
      String(value || '').toLowerCase().includes(query)
    );
  });

  const handleCenterSelect = (centerId) => {
    handleChange({ target: { name: 'researchCenterId', value: centerId } });
    setIsCenterOpen(false);
    setCenterSearch('');
  };

  const handleFacultySelect = (facultyId) => {
    handleChange({ target: { name: 'facultyId', value: facultyId } });
    setIsFacultyOpen(false);
    setFacultySearch('');
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">
            {formData._id ? 'Edit Research Faculty Member' : 'Add Research Faculty Member'}
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
                    {selectedCenter.centerImage ? (
                      <img
                        src={getImageUrl(selectedCenter.centerImage)}
                        alt={selectedCenter.centerName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : getInitials(selectedCenter.centerName)}
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
                      {center.centerImage ? (
                        <img
                          src={getImageUrl(center.centerImage)}
                          alt={center.centerName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : getInitials(center.centerName)}
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

          {/* Faculty Member Dropdown */}
          <div className="form-group" style={{ position: 'relative', marginTop: '20px' }}>
            <label className="form-label">Faculty Member</label>
            <input
              name="facultyId"
              value={formData.facultyId || ''}
              onChange={() => {}}
              required
              tabIndex={-1}
              style={{ position: 'absolute', width: 1, height: 1, opacity: 0, pointerEvents: 'none' }}
            />

            <button
              type="button"
              onClick={() => setIsFacultyOpen(prev => !prev)}
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
              {selectedFaculty ? (
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
                    {selectedFaculty.facultyImage ? (
                      <img
                        src={getImageUrl(selectedFaculty.facultyImage)}
                        alt={selectedFaculty.facultyName}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : getInitials(selectedFaculty.facultyName)}
                  </span>
                  <span style={{ minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
                      {selectedFaculty.facultyName}
                    </span>
                    <span style={{ display: 'block', color: 'var(--text-gray)', fontSize: '12px', marginTop: '3px' }}>
                      {selectedFaculty.designation || 'Designation not set'} | {selectedFaculty.facultyEmail || 'Email not set'}
                    </span>
                  </span>
                </span>
              ) : (
                <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>Select Faculty Member</span>
              )}
              <ChevronDown size={18} color="var(--text-gray)" />
            </button>

            {isFacultyOpen && (
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
                    value={facultySearch}
                    onChange={(event) => setFacultySearch(event.target.value)}
                    placeholder="Search faculty name, designation..."
                    style={{ fontSize: '13px', padding: '10px 12px' }}
                  />
                </div>

                {filteredFacultyList.length > 0 ? filteredFacultyList.map(faculty => (
                  <button
                    type="button"
                    key={faculty._id}
                    onMouseDown={(event) => {
                      event.preventDefault();
                      handleFacultySelect(faculty._id);
                    }}
                    style={{
                      width: '100%',
                      border: 'none',
                      borderRadius: '10px',
                      background: formData.facultyId === faculty._id ? 'var(--primary-blue-light)' : 'transparent',
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
                      {faculty.facultyImage ? (
                        <img
                          src={getImageUrl(faculty.facultyImage)}
                          alt={faculty.facultyName}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      ) : getInitials(faculty.facultyName)}
                    </span>
                    <span style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
                        {faculty.facultyName}
                      </div>
                      <div style={{ color: 'var(--text-gray)', fontSize: '12px', marginTop: '3px' }}>
                        {faculty.designation || 'Designation not set'} | {faculty.facultyEmail || 'Email not set'}
                      </div>
                    </span>
                  </button>
                )) : (
                  <div style={{ padding: '10px', textAlign: 'center', color: 'var(--text-light)', fontSize: '13px' }}>
                    No faculty members found
                  </div>
                )}
              </div>
            )}
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

export default ResearchFacultyMembersFormModal;
