import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Save, X } from 'lucide-react';

const ResearchCenterFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message,
}) => {
  if (!isModalOpen) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Research Center' : 'Add Research Center'}</h2>
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
            <label className="form-label" htmlFor="centerName">Center Name</label>
            <input
              type="text"
              id="centerName"
              name="centerName"
              className="form-input"
              placeholder="Enter research center name"
              value={formData.centerName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="centerMission">Center Mission</label>
            <textarea
              id="centerMission"
              name="centerMission"
              className="form-textarea"
              placeholder="Enter center mission..."
              value={formData.centerMission}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="centerRolesResponsibility">Roles & Responsibility</label>
            <textarea
              id="centerRolesResponsibility"
              name="centerRolesResponsibility"
              className="form-textarea"
              placeholder="Enter roles and responsibilities..."
              value={formData.centerRolesResponsibility}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="publicationAndProjectOutcomes">Publication & Project Outcomes</label>
            <textarea
              id="publicationAndProjectOutcomes"
              name="publicationAndProjectOutcomes"
              className="form-textarea"
              placeholder="Enter publication and project outcomes..."
              value={formData.publicationAndProjectOutcomes}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="studentTrainingAndDevelopment">Student Training & Development</label>
            <textarea
              id="studentTrainingAndDevelopment"
              name="studentTrainingAndDevelopment"
              className="form-textarea"
              placeholder="Enter student training and development details..."
              value={formData.studentTrainingAndDevelopment}
              onChange={handleChange}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Research Center' : 'Add Research Center'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default ResearchCenterFormModal;
