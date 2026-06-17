import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Save, Loader2, X, Plus, Trash2 } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const TABS = [
  { key: 'awards_and_achievements', label: 'Awards' },
  { key: 'publications', label: 'Publications' },
  { key: 'patents', label: 'Patents' },
  { key: 'grants', label: 'Grants' },
  { key: 'conferences', label: 'Conferences' },
  { key: 'workshop', label: 'Workshops' },
  { key: 'fundedProject', label: 'Funded Projects' },
];

const FIELD_DEFS = {
  awards_and_achievements: [
    { key: 'awardName', label: 'Award Name', type: 'text' },
    { key: 'awardDate', label: 'Date', type: 'date' },
    { key: 'awardBy', label: 'Awarded By', type: 'text' },
    { key: 'awardLocation', label: 'Location', type: 'text' },
  ],
  publications: [
    { key: 'title', label: 'Title', type: 'text' },
    { key: 'journal', label: 'Journal', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'coAuthors', label: 'Co-Authors', type: 'text' },
  ],
  patents: [
    { key: 'patentName', label: 'Patent Name', type: 'text' },
    { key: 'patentNumber', label: 'Patent Number', type: 'text' },
    { key: 'country', label: 'Country', type: 'text' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  grants: [
    { key: 'grantTitle', label: 'Grant Title', type: 'text' },
    { key: 'fundingAgency', label: 'Funding Agency', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
  conferences: [
    { key: 'conferenceName', label: 'Conference Name', type: 'text' },
    { key: 'conferenceLocation', label: 'Location', type: 'text' },
    { key: 'conferenceDate', label: 'Date', type: 'date' },
    { key: 'paperPresented', label: 'Paper Presented', type: 'text' },
  ],
  workshop: [
    { key: 'workshopName', label: 'Workshop Name', type: 'text' },
    { key: 'workshopLocation', label: 'Location', type: 'text' },
    { key: 'workshopDate', label: 'Date', type: 'date' },
  ],
  fundedProject: [
    { key: 'projectName', label: 'Project Name', type: 'text' },
    { key: 'fundingAgency', label: 'Funding Agency', type: 'text' },
    { key: 'amount', label: 'Amount', type: 'number' },
    { key: 'year', label: 'Year', type: 'number' },
    { key: 'status', label: 'Status', type: 'text' },
  ],
};

const emptyRow = (tabKey) => {
  const row = {};
  FIELD_DEFS[tabKey].forEach(f => { row[f.key] = ''; });
  return row;
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

const FacultyResearchFormModal = ({
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
  const [activeTab, setActiveTab] = useState('awards_and_achievements');
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');

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
      getSchoolName(faculty),
      faculty.facultyEmail,
    ].some(value => String(value || '').toLowerCase().includes(query));
  });

  const handleFacultySelect = (facultyId) => {
    setFormData(prev => ({ ...prev, facultyId }));
    setIsFacultyOpen(false);
    setFacultySearch('');
  };

  const handleAddRow = () => {
    setFormData(prev => ({
      ...prev,
      [activeTab]: [...(prev[activeTab] || []), emptyRow(activeTab)]
    }));
  };

  const handleFieldChange = (tabKey, index, fieldKey, value) => {
    setFormData(prev => {
      const updated = [...(prev[tabKey] || [])];
      updated[index] = { ...updated[index], [fieldKey]: value };
      return { ...prev, [tabKey]: updated };
    });
  };

  const handleRemoveRow = (tabKey, index) => {
    setFormData(prev => ({
      ...prev,
      [tabKey]: (prev[tabKey] || []).filter((_, i) => i !== index)
    }));
  };

  const tabStyle = (key) => ({
    padding: '8px 16px',
    fontSize: '13px',
    fontWeight: activeTab === key ? '600' : '400',
    background: activeTab === key ? 'var(--primary-blue)' : '#fff',
    color: activeTab === key ? '#fff' : 'var(--text-gray)',
    border: activeTab === key ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
  });

  const currentItems = formData[activeTab] || [];
  const fields = FIELD_DEFS[activeTab];

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Research' : 'Add Research'}</h2>
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
          {/* Faculty Selector */}
          <div className="form-group" style={{ marginBottom: '22px', position: 'relative' }}>
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

          {/* Tabs */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '20px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            {TABS.map(tab => (
              <button
                type="button"
                key={tab.key}
                style={tabStyle(tab.key)}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
                {(formData[tab.key] || []).length > 0 && (
                  <span style={{
                    marginLeft: '6px', background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--primary-blue-light)',
                    color: activeTab === tab.key ? '#fff' : 'var(--primary-blue)',
                    padding: '1px 7px', borderRadius: '10px', fontSize: '11px', fontWeight: '700'
                  }}>
                    {(formData[tab.key] || []).length}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content - Dynamic Rows */}
          <div>
            {currentItems.map((item, idx) => (
              <div key={idx} style={{
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '14px',
                marginBottom: '12px',
                background: 'var(--bg-body)',
                position: 'relative',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)' }}>
                    {TABS.find(t => t.key === activeTab)?.label} #{idx + 1}
                  </span>
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ padding: '4px 8px' }}
                    onClick={() => handleRemoveRow(activeTab, idx)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: fields.length > 4 ? '1fr 1fr 1fr 1fr' : `repeat(${fields.length}, 1fr)`, gap: '8px' }}>
                  {fields.map(field => (
                    <div key={field.key}>
                      <label style={{ fontSize: '11px', color: 'var(--text-gray)', fontWeight: '500', marginBottom: '2px', display: 'block' }}>
                        {field.label}
                      </label>
                      <input
                        type={field.type}
                        className="form-input"
                        placeholder={field.label}
                        value={field.type === 'date' ? toDateInputValue(item[field.key]) : (item[field.key] || '')}
                        onChange={(e) => handleFieldChange(activeTab, idx, field.key, e.target.value)}
                        style={{ fontSize: '13px' }}
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}

            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '8px 16px', fontSize: '13px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
              onClick={handleAddRow}
            >
              <Plus size={14} /> Add {TABS.find(t => t.key === activeTab)?.label}
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : formData._id ? 'Update Research' : 'Add Research'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FacultyResearchFormModal;
