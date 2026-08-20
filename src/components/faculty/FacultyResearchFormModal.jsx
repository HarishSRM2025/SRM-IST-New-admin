import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Save, Loader2, X, Plus, Trash2, ClipboardPaste, List } from 'lucide-react';

const API_BASE = (import.meta.env.VITE_API_URL || '').replace('/api', '');

const TABS = [
  { key: 'workExperience', label: 'Work Experience', placeholder: 'Paste work experience here (one per line):&#10;• Senior Software Engineer at Tech Corp (2020 - 2023)&#10;• Lead AI Researcher at SRM IST (2018 - 2020)' },
  { key: 'publications', label: 'Publications', placeholder: 'Paste publications here (one per line):&#10;• Deep Learning Approaches for Medical Image Analysis, IEEE Trans 2023&#10;• Real-Time Object Detection on Edge Devices, Springer 2022' },
  { key: 'awards_and_achievements', label: 'Awards & Achievements', placeholder: 'Paste awards/achievements here (one per line):&#10;• Best Researcher Award 2023 by National Science Forum&#10;• Outstanding Faculty Award 2021, SRM IST' },
  { key: 'invited_lectures', label: 'Invited Lectures', placeholder: 'Paste invited lectures here (one per line):&#10;• Keynote Speaker on AI in Healthcare at Global Tech Summit 2023&#10;• Guest Lecture on Deep Learning at IIT Madras' },
  { key: 'fundedProject', label: 'Funded Projects', placeholder: 'Paste funded projects here (one per line):&#10;• AI for Smart Agriculture - DST Grant (Rs. 25 Lakhs, 2022-2025)&#10;• IoT-based Smart Grid Monitoring - SERB (Rs. 18 Lakhs, 2021-2024)' },
  { key: 'professional_memberships', label: 'Professional Society Membership', placeholder: 'Paste memberships here (one per line):&#10;• Senior Member, IEEE (Institute of Electrical and Electronics Engineers)&#10;• Life Member, CSI (Computer Society of India)&#10;• Member, ACM' },
  { key: 'patents', label: 'Patents', placeholder: 'Paste patent details here (one per line):&#10;• Automated Crop Disease Detection System (Patent No: 202241012345)&#10;• Smart Traffic Flow Optimization System' },
  { key: 'grants', label: 'Grants', placeholder: 'Paste grants here (one per line)...' },
  { key: 'conferences', label: 'Conferences', placeholder: 'Paste conference papers/presentations here (one per line)...' },
  { key: 'workshop', label: 'Workshops', placeholder: 'Paste workshops attended/conducted here (one per line)...' },
];

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
    .map(line => line.replace(/^\s*[✔✓•❖➤►▪▫◉○●■□◆◇➢➣➜➝★*\-–—\d.)\s]+/, '').trim())
    .filter(Boolean);
};

const formatItemText = (item) => {
  if (typeof item === 'string') return item;
  if (!item) return '';
  if (item.companyName || item.role) {
    return [item.role, item.companyName].filter(Boolean).join(' at ');
  }
  if (item.title) {
    return [item.title, item.journal, item.year, item.coAuthors].filter(Boolean).join(' - ');
  }
  if (item.awardName) {
    return [item.awardName, item.awardBy, item.awardDate ? String(item.awardDate).slice(0, 10) : ''].filter(Boolean).join(' - ');
  }
  if (item.projectName) {
    return [item.projectName, item.fundingAgency, item.amount ? `Rs. ${item.amount}` : '', item.year].filter(Boolean).join(' - ');
  }
  if (item.patentName) {
    return [item.patentName, item.patentNumber, item.country, item.year].filter(Boolean).join(' - ');
  }
  if (item.conferenceName) {
    return [item.conferenceName, item.conferenceLocation, item.paperPresented].filter(Boolean).join(' - ');
  }
  if (item.workshopName) {
    return [item.workshopName, item.workshopLocation].filter(Boolean).join(' - ');
  }
  if (item.grantTitle) {
    return [item.grantTitle, item.fundingAgency, item.amount ? `Rs. ${item.amount}` : '', item.year].filter(Boolean).join(' - ');
  }
  return Object.values(item).filter(v => typeof v === 'string').join(' - ');
};

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
  const [activeTab, setActiveTab] = useState('workExperience');
  const [isFacultyOpen, setIsFacultyOpen] = useState(false);
  const [facultySearch, setFacultySearch] = useState('');
  const [rawTexts, setRawTexts] = useState({});
  const [modes, setModes] = useState({}); // tabKey -> 'text' | 'points'

  const currentTabDef = TABS.find(t => t.key === activeTab) || TABS[0];

  const getPointsForTab = (tabKey) => {
    const items = formData[tabKey] || [];
    return items.map(formatItemText).filter(Boolean);
  };

  useEffect(() => {
    if (isModalOpen) {
      const initialRaw = {};
      TABS.forEach(tab => {
        const points = getPointsForTab(tab.key);
        initialRaw[tab.key] = points.join('\n');
      });
      setRawTexts(initialRaw);
    }
  }, [isModalOpen, formData._id, formData.facultyId]);

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

  const handleRawTextChange = (tabKey, text) => {
    setRawTexts(prev => ({ ...prev, [tabKey]: text }));
    const parsed = parseTextToPoints(text);
    setFormData(prev => ({ ...prev, [tabKey]: parsed }));
  };

  const handlePointChange = (tabKey, index, value) => {
    const current = getPointsForTab(tabKey);
    const updated = [...current];
    updated[index] = value;
    const filtered = updated.filter(Boolean);
    setFormData(prev => ({ ...prev, [tabKey]: updated }));
    setRawTexts(prev => ({ ...prev, [tabKey]: filtered.join('\n') }));
  };

  const handleRemovePoint = (tabKey, index) => {
    const current = getPointsForTab(tabKey);
    const updated = current.filter((_, i) => i !== index);
    setFormData(prev => ({ ...prev, [tabKey]: updated }));
    setRawTexts(prev => ({ ...prev, [tabKey]: updated.join('\n') }));
  };

  const handleAddPoint = (tabKey) => {
    const current = getPointsForTab(tabKey);
    const updated = [...current, ''];
    setFormData(prev => ({ ...prev, [tabKey]: updated }));
    setModes(prev => ({ ...prev, [tabKey]: 'points' }));
  };

  const toggleMode = (tabKey) => {
    setModes(prev => ({
      ...prev,
      [tabKey]: (prev[tabKey] || 'text') === 'text' ? 'points' : 'text'
    }));
  };

  const tabStyle = (key) => ({
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: activeTab === key ? '600' : '400',
    background: activeTab === key ? 'var(--primary-blue)' : '#fff',
    color: activeTab === key ? '#fff' : 'var(--text-gray)',
    border: activeTab === key ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    whiteSpace: 'nowrap',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px'
  });

  const activePoints = getPointsForTab(activeTab);
  const activeMode = modes[activeTab] || 'text';
  const activeRawText = rawTexts[activeTab] !== undefined ? rawTexts[activeTab] : activePoints.join('\n');

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '920px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id || formData.experienceId ? 'Edit Faculty Research & Work Experience' : 'Add Faculty Research & Work Experience'}</h2>
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
          <div className="form-group" style={{ marginBottom: '20px', position: 'relative' }}>
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
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '18px', paddingBottom: '12px', borderBottom: '1px solid var(--border-color)' }}>
            {TABS.map(tab => {
              const count = getPointsForTab(tab.key).length;
              return (
                <button
                  type="button"
                  key={tab.key}
                  style={tabStyle(tab.key)}
                  onClick={() => setActiveTab(tab.key)}
                >
                  {tab.label}
                  {count > 0 && (
                    <span style={{
                      marginLeft: '4px',
                      background: activeTab === tab.key ? 'rgba(255,255,255,0.3)' : 'var(--primary-blue-light)',
                      color: activeTab === tab.key ? '#fff' : 'var(--primary-blue)',
                      padding: '1px 7px',
                      borderRadius: '10px',
                      fontSize: '11px',
                      fontWeight: '700'
                    }}>
                      {count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Tab Panel */}
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
                  {currentTabDef.label} Points
                </label>
                <div style={{ fontSize: '12px', color: 'var(--text-gray)' }}>
                  Paste points below (e.g. 5 points, one per line). Leave empty if not applicable.
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <span style={{
                  background: activePoints.length > 0 ? '#dbeafe' : '#f3f4f6',
                  color: activePoints.length > 0 ? '#1d4ed8' : '#6b7280',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600
                }}>
                  {activePoints.length} {activePoints.length === 1 ? 'point' : 'points'}
                </span>

                <button
                  type="button"
                  onClick={() => toggleMode(activeTab)}
                  className="btn-secondary"
                  style={{ padding: '4px 10px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                >
                  {activeMode === 'text' ? <List size={13} /> : <ClipboardPaste size={13} />}
                  {activeMode === 'text' ? 'List View' : 'Text Area'}
                </button>
              </div>
            </div>

            {activeMode === 'text' ? (
              <div>
                <textarea
                  className="form-input"
                  rows={6}
                  placeholder={currentTabDef.placeholder.replace(/&#10;/g, '\n')}
                  value={activeRawText}
                  onChange={(e) => handleRawTextChange(activeTab, e.target.value)}
                  style={{ fontSize: '13px', lineHeight: '1.6', fontFamily: 'inherit' }}
                />
              </div>
            ) : (
              <div>
                {activePoints.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '24px', color: 'var(--text-gray)', fontSize: '13px' }}>
                    No points added yet for {currentTabDef.label}. Switch to "Text Area" to paste points or click "+ Add Point".
                  </div>
                ) : (
                  activePoints.map((point, index) => (
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
                        onChange={(e) => handlePointChange(activeTab, index, e.target.value)}
                        placeholder={`Point ${index + 1}`}
                        style={{ fontSize: '13px' }}
                      />
                      <button
                        type="button"
                        className="btn-danger"
                        style={{ padding: '6px 8px', flexShrink: 0 }}
                        onClick={() => handleRemovePoint(activeTab, index)}
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
                  onClick={() => handleAddPoint(activeTab)}
                  style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <Plus size={14} /> Add Point
                </button>
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : formData._id || formData.experienceId ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FacultyResearchFormModal;
