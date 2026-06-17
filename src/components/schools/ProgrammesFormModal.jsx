import React from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X } from 'lucide-react';

const ProgrammesFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message,
  schoolsList,
  entityField = 'school',
  entityLabel = 'School'
}) => {

  if (!isModalOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '650px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Programme' : 'Add Programme'}</h2>
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
          <div className="form-group">
            <label className="form-label" htmlFor={entityField}>{entityLabel}</label>
            <select
              id={entityField}
              name={entityField}
              className="form-input"
              value={formData[entityField]}
              onChange={handleChange}
              required
            >
              <option value="">Select a {entityLabel}</option>
              {schoolsList.map(school => (
                <option key={school._id} value={school._id}>{school.name}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Programme Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="e.g. B.Tech Computer Science"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="shortName">Short Name / Code</label>
              <input
                type="text"
                id="shortName"
                name="shortName"
                className="form-input"
                placeholder="e.g. B.Tech CSE"
                value={formData.shortName}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="duration">Duration</label>
            <input
              type="text"
              id="duration"
              name="duration"
              className="form-input"
              placeholder="e.g. 4 Years or 2 Years (4 Semesters)"
              value={formData.duration}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="overview">Overview</label>
            <textarea
              id="overview"
              name="overview"
              className="form-textarea"
              placeholder="Provide a detailed overview of the programme..."
              value={formData.overview}
              onChange={handleChange}
              required
              style={{ minHeight: '100px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="eligibility">Eligibility Criteria</label>
            <textarea
              id="eligibility"
              name="eligibility"
              className="form-textarea"
              placeholder="e.g. 10+2 with Physics, Chemistry and Mathematics..."
              value={formData.eligibility}
              onChange={handleChange}
              required
              style={{ minHeight: '80px' }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="careerPath">Career Paths (Comma-separated)</label>
            <input
              type="text"
              id="careerPath"
              name="careerPath"
              className="form-input"
              placeholder="e.g. Software Engineer, Data Analyst, Cloud Solutions Architect"
              value={formData.careerPath}
              onChange={handleChange}
            />
            <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
              Separate career pathways with commas (e.g. Job 1, Job 2, Job 3) to render them as individual badges.
            </small>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Programme' : 'Add Programme'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ProgrammesFormModal;
