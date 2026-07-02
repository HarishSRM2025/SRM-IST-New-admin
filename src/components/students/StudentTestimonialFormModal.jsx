import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Save, X } from 'lucide-react';

const StudentTestimonialFormModal = ({
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
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {formData._id ? 'Edit Testimonial' : 'Add Testimonial'}
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
          {/* Student Name */}
          <div className="form-group">
            <label className="form-label" htmlFor="name">Student Name</label>
            <input
              id="name"
              type="text"
              name="name"
              className="form-input"
              value={formData.name || ''}
              onChange={handleChange}
              placeholder="Enter student name"
              required
            />
          </div>

          {/* Role / Department */}
          <div className="form-group">
            <label className="form-label" htmlFor="role">Role / Department</label>
            <input
              id="role"
              type="text"
              name="role"
              className="form-input"
              value={formData.role || ''}
              onChange={handleChange}
              placeholder="e.g. IIIrd Year B.Tech CSE"
              required
            />
          </div>

          {/* YouTube Video ID */}
          <div className="form-group">
            <label className="form-label" htmlFor="videoId">YouTube Video ID</label>
            <input
              id="videoId"
              type="text"
              name="videoId"
              className="form-input"
              value={formData.videoId || ''}
              onChange={handleChange}
              placeholder="e.g. NnTvO44n-HE"
              required
            />
            <small style={{ display: 'block', marginTop: '6px', color: 'var(--text-gray)', fontSize: '12px' }}>
              https://www.youtube.com/shorts/<strong>NnTvO44n-HE</strong>
            </small>
          </div>

          {/* Video Thumbnail Preview */}
          {formData.videoId && formData.videoId.length >= 11 && (
            <div className="form-group" style={{ marginTop: '16px' }}>
              <label className="form-label">Video Thumbnail Preview</label>
              <div style={{ position: 'relative', width: '100%', aspectRatio: '16/9', borderRadius: '8px', overflow: 'hidden', border: '1px solid var(--border-color)', marginTop: '8px' }}>
                <img
                  src={`https://img.youtube.com/vi/${formData.videoId}/hqdefault.jpg`}
                  alt="YouTube preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                  <div style={{ background: 'rgba(239, 68, 68, 0.9)', color: 'white', padding: '8px 16px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: 'bold' }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect width="24" height="24" rx="4" fill="currentColor" opacity="0.2" />
                      <polygon points="10,8 10,16 16,12" fill="white" />
                    </svg>
                    Live Preview
                  </div>
                </div>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Testimonial' : 'Add Testimonial'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default StudentTestimonialFormModal;
