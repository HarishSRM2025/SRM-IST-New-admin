import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Loader2, Plus, Save, Trash2, X, ClipboardPaste, List } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const getId = (value) => (
  typeof value === 'object' && value !== null ? value._id : value
);

const getImageUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http')) return path;
  const cleanPath = path.replace(/\\/g, '/');
  const fullPath = cleanPath.startsWith('public/') ? cleanPath : `public/uploads/${cleanPath}`;
  return `${API_BASE}/${fullPath}`;
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

const parseTextToPoints = (text) => {
  if (!text) return [];
  return text
    .split(/\r?\n/)
    .map(line => line.replace(/^[\s•*\-–—\d.)]+/, '').trim())
    .filter(Boolean);
};

const formatItemText = (item) => {
  if (typeof item === 'string') return item;
  if (!item) return '';
  if (item.companyName || item.role) {
    return [item.role, item.companyName].filter(Boolean).join(' at ');
  }
  return Object.values(item).filter(v => typeof v === 'string').join(' - ');
};

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
  const [rawText, setRawText] = useState('');
  const [mode, setMode] = useState('text'); // 'text' | 'points'

  const currentPoints = (formData.workExperience?.length ? formData.workExperience : (formData.industryExperience || []))
    .map(formatItemText)
    .filter(Boolean);

  useEffect(() => {
    if (isModalOpen) {
      const points = (formData.workExperience?.length ? formData.workExperience : (formData.industryExperience || []))
        .map(formatItemText)
        .filter(Boolean);
      setRawText(points.join('\n'));
    }
  }, [isModalOpen, formData._id]);

  if (!isModalOpen) return null;

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

  const handleRawTextChange = (e) => {
    const text = e.target.value;
    setRawText(text);
    const parsed = parseTextToPoints(text);
    setFormData(prev => ({
      ...prev,
      workExperience: parsed,
      industryExperience: parsed,
    }));
  };

  const handlePointChange = (index, value) => {
    const updated = [...currentPoints];
    updated[index] = value;
    const filtered = updated.filter(Boolean);
    setFormData(prev => ({
      ...prev,
      workExperience: updated,
      industryExperience: updated,
    }));
    setRawText(filtered.join('\n'));
  };

  const handleRemovePoint = (index) => {
    const updated = currentPoints.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      workExperience: updated,
      industryExperience: updated,
    }));
    setRawText(updated.join('\n'));
  };

  const handleAddPoint = () => {
    const updated = [...currentPoints, ''];
    setFormData(prev => ({
      ...prev,
      workExperience: updated,
      industryExperience: updated,
    }));
    setMode('points');
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '850px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Work Experience' : 'Add Work Experience'}</h2>
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
          {/* Faculty Select */}
          <div className="form-group" style={{ position: 'relative', marginBottom: '20px' }}>
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

          {/* Work Experience Section */}
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '12px',
            padding: '18px',
            background: '#fafbfc',
            marginBottom: '20px'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
              <div>
                <label className="form-label" style={{ marginBottom: '2px', fontWeight: 700, fontSize: '14px' }}>
                  Work Experience Points
                </label>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>
                  Paste points below (e.g. 5 points, one per line or bulleted). If left empty, it will remain empty.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: currentPoints.length > 0 ? '#dbeafe' : '#f3f4f6',
                  color: currentPoints.length > 0 ? '#1d4ed8' : '#6b7280',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {currentPoints.length} {currentPoints.length === 1 ? 'point' : 'points'}
                </span>

                <button
                  type="button"
                  onClick={() => setMode(prev => prev === 'text' ? 'points' : 'text')}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {mode === 'text' ? <List size={13} /> : <ClipboardPaste size={13} />}
                  {mode === 'text' ? 'List View' : 'Text Area'}
                </button>
              </div>
            </div>

            {mode === 'text' ? (
              <div>
                <textarea
                  className="form-input"
                  rows={6}
                  placeholder="Paste your 5 points here (one point per line):&#10;• Senior Software Engineer at Tech Corp (2020 - 2023)&#10;• Lead AI Researcher at SRM IST (2018 - 2020)&#10;• Systems Architect at Global Solutions..."
                  value={rawText}
                  onChange={handleRawTextChange}
                  style={{ fontSize: '13px', lineHeight: '1.6', fontFamily: 'inherit' }}
                />
              </div>
            ) : (
              <div>
                {currentPoints.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-gray)', fontSize: '13px' }}>
                    No points added yet. Switch to "Text Area" to paste points or click "+ Add Point".
                  </div>
                ) : (
                  currentPoints.map((point, index) => (
                    <div key={index} style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: '#e0e7ff',
                        color: '#4338ca',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '12px',
                        fontWeight: 700,
                        flexShrink: 0
                      }}>
                        {index + 1}
                      </span>
                      <input
                        type="text"
                        className="form-input"
                        value={point}
                        onChange={(e) => handlePointChange(index, e.target.value)}
                        placeholder={`Point ${index + 1}`}
                        style={{ fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: '6px 8px', flexShrink: 0 }}
                        onClick={() => handleRemovePoint(index)}
                        title="Remove point"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))
                )}
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handleAddPoint}
                  style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Point
                </button>
              </div>
            )}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : formData._id ? 'Update Experience' : 'Save Experience'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FacultyExperienceFormModal;
