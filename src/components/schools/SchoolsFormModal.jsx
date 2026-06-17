import React from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X } from 'lucide-react';

const SchoolsFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message,
  institutionsList
}) => {

  if (!isModalOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit School' : 'Add School'}</h2>
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
            <label className="form-label" htmlFor="institutionId">Institution</label>
            <select
              id="institutionId"
              name="institutionId"
              className="form-input"
              value={formData.institutionId}
              onChange={handleChange}
              required
            >
              <option value="">Select an Institution</option>
              {institutionsList.map(inst => (
                <option key={inst._id} value={inst._id}>{inst.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">School Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="e.g. School of Computing"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="slug">Slug (URL identifier)</label>
            <input
              type="text"
              id="slug"
              name="slug"
              className="form-input"
              placeholder="e.g. school-of-computing"
              value={formData.slug}
              onChange={handleChange}
              required
            />
            <small style={{ color: 'var(--text-light)', display: 'block', marginTop: '4px' }}>
              Used in URLs. Should be lowercase, no spaces (use hyphens). Auto-generated if left blank.
            </small>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="about">About</label>
            <textarea
              id="about"
              name="about"
              className="form-textarea"
              placeholder="Detailed description of the school..."
              value={formData.about}
              onChange={handleChange}
              required
              style={{ minHeight: '150px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update School' : 'Add School'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default SchoolsFormModal;
