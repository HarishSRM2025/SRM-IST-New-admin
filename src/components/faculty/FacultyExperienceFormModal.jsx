import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, Plus, Save, Trash2, X } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const emptyExperience = {
  companyName: '',
  role: '',
  startDate: '',
  endDate: '',
};

const toDateInputValue = (value) => {
  if (!value) return '';
  return String(value).slice(0, 10);
};

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
    .toUpperCase() || 'F'
);

const FacultyExperienceFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  setFormData,
  handleSubmit,
  loading,
  message,
  facultyList,
  schoolsList = [],
}) => {
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');

  if (!isModalOpen) return null;

  const experiences = formData.industryExperience || [];
  const getSchoolName = (faculty) => {
    if (faculty?.school && typeof faculty.school === 'object') return faculty.school.name || 'Department not set';
    return schoolsList.find(school => school._id === getId(faculty?.school))?.name || 'Department not set';
  };

  const selectedFaculty = facultyList.find(faculty => faculty._id === formData.facultyId);
  const filteredFacultyList = facultyList.filter(faculty => {
    const query = facultySearch.trim().toLowerCase();
    if (!query) return true;

    return [
      faculty.facultyName,
      faculty.designation,
      faculty.facultyEmail,
      getSchoolName(faculty),
    ].some(value => String(value || '').toLowerCase().includes(query));
  });

  const handleFacultySelect = (facultyId) => {
    setFormData(prev => ({ ...prev, facultyId }));
    setIsFacultyOpen(false);
    setFacultySearch('');
  };

  const updateExperience = (index, key, value) => {
    setFormData(prev => {
      const updated = [...(prev.industryExperience || [])];
      updated[index] = { ...updated[index], [key]: value };
      return { ...prev, industryExperience: updated };
    });
  };

  const addExperience = () => {
    setFormData(prev => ({
      ...prev,
      industryExperience: [...(prev.industryExperience || []), { ...emptyExperience }],
    }));
  };

  const removeExperience = (index) => {
    setFormData(prev => ({
      ...prev,
      industryExperience: (prev.industryExperience || []).filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Experience' : 'Add Experience'}</h2>
          <button className="modal-close" onClick={handleCloseModal}>
            <X size={24} />
          </button>
        </div>

        {message.text && (
          <div className={`message ${message.type}`} style={{ margin: '0 0 16px' }}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ position: 'relative' }}>
            <label className="form-label" htmlFor="facultyId">Faculty Member</label>
            <input
              id="facultyId"
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
                      {getSchoolName(selectedFaculty)} | {selectedFaculty.designation || 'Designation not set'}
                    </span>
                  </span>
                </span>
              ) : (
                <span style={{ color: 'var(--text-light)', fontSize: '14px' }}>Select Faculty</span>
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
                    placeholder="Search faculty, department, designation..."
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
                      <span style={{ display: 'block', fontWeight: 700, color: 'var(--text-dark)', fontSize: '14px' }}>
                        {faculty.facultyName}
                      </span>
                      <span style={{ display: 'block', color: 'var(--text-gray)', fontSize: '12px', marginTop: '3px' }}>
                        {getSchoolName(faculty)}
                      </span>
                      <span style={{ display: 'block', color: 'var(--text-light)', fontSize: '12px', marginTop: '2px' }}>
                        {faculty.designation || 'Designation not set'}
                      </span>
                    </span>
                  </button>
                )) : (
                  <div style={{ padding: '18px', color: 'var(--text-gray)', fontSize: '13px', textAlign: 'center' }}>
                    No matching faculty records found.
                  </div>
                )}
              </div>
            )}
          </div>

          {experiences.map((experience, index) => (
            <div key={index} style={{ border: '1px solid var(--border-color)', borderRadius: '10px', padding: '16px', marginBottom: '12px', background: 'var(--bg-body)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <strong style={{ fontSize: '13px' }}>Industry Experience #{index + 1}</strong>
                <button type="button" className="btn-danger" style={{ padding: '4px 8px' }} onClick={() => removeExperience(index)}>
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label className="form-label">Company Name</label>
                  <input className="form-input" value={experience.companyName || ''} onChange={(event) => updateExperience(index, 'companyName', event.target.value)} />
                </div>
                <div>
                  <label className="form-label">Role</label>
                  <input className="form-input" value={experience.role || ''} onChange={(event) => updateExperience(index, 'role', event.target.value)} />
                </div>
                <div>
                  <label className="form-label">Start Date</label>
                  <input type="date" className="form-input" value={toDateInputValue(experience.startDate)} onChange={(event) => updateExperience(index, 'startDate', event.target.value)} />
                </div>
                <div>
                  <label className="form-label">End Date</label>
                  <input type="date" className="form-input" value={toDateInputValue(experience.endDate)} onChange={(event) => updateExperience(index, 'endDate', event.target.value)} />
                </div>
              </div>

            </div>
          ))}

          <button type="button" className="btn-secondary" onClick={addExperience}>
            <Plus size={14} /> Add Industry Experience
          </button>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : formData._id ? 'Update Experience' : 'Add Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FacultyExperienceFormModal;
