import React from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X } from 'lucide-react';

const InstitutionFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message
}) => {
  if (!isModalOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Institution Info' : 'Add Institution Info'}</h2>
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
            <label className="form-label" htmlFor="name">Institution Name</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="e.g. SRM Institute of Science and Technology"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="vision">Vision</label>
            <textarea
              id="vision"
              name="vision"
              className="form-textarea"
              placeholder="Enter the vision statement..."
              value={formData.vision}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="mission">Mission</label>
            <textarea
              id="mission"
              name="mission"
              className="form-textarea"
              placeholder="Enter the mission statement..."
              value={formData.mission}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : 'Add Institution'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default InstitutionFormModal;
