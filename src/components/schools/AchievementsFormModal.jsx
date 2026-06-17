import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Upload } from 'lucide-react';

const AchievementsFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  loading,
  message,
  schoolsList,
  entityField = 'school',
  entityLabel = 'School'
}) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Sync / reset preview image when modal status changes
  useEffect(() => {
    if (!isModalOpen) {
      setPreviewImage(null);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const onFileChange = (e) => {
    handleFileChange(e);
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(e.target.files[0]);
    } else {
      setPreviewImage(null);
    }
  };

  const closeAndReset = () => {
    setPreviewImage(null);
    handleCloseModal();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Achievement' : 'Add Achievement'}</h2>
          <button className="modal-close" onClick={closeAndReset}>
            <X size={24} />
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} animate-fade-in`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px 24px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Entity Dropdown */}
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
                {schoolsList.map((s) => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>

            {/* Achievement Title */}
            <div className="form-group">
              <label className="form-label" htmlFor="title">Achievement Title</label>
              <input
                type="text"
                id="title"
                name="title"
                className="form-input"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Winner of Smart India Hackathon 2026"
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Achiever Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="achieverName">Achiever Name</label>
              <input
                type="text"
                id="achieverName"
                name="achieverName"
                className="form-input"
                value={formData.achieverName}
                onChange={handleChange}
                placeholder="e.g. Rahul Sharma or CSE Team"
                required
              />
            </div>

            {/* Achiever Designation */}
            <div className="form-group">
              <label className="form-label" htmlFor="achieverDesignation">Achiever Designation</label>
              <select
                id="achieverDesignation"
                name="achieverDesignation"
                className="form-input"
                value={formData.achieverDesignation}
                onChange={handleChange}
              >
                <option value="student">Student</option>
                <option value="faculty">Faculty</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Achievement Type / Level */}
            <div className="form-group">
              <label className="form-label" htmlFor="achievementType">Achievement Type / Level</label>
              <select
                id="achievementType"
                name="achievementType"
                className="form-input"
                value={formData.achievementType}
                onChange={handleChange}
              >
                <option value="inter-school">Inter-School</option>
                <option value="state-level">State-Level</option>
                <option value="national-level">National-Level</option>
                <option value="international-level">International-Level</option>
              </select>
            </div>

            {/* Category */}
            <div className="form-group">
              <label className="form-label" htmlFor="achievementCategory">Category</label>
              <select
                id="achievementCategory"
                name="achievementCategory"
                className="form-input"
                value={formData.achievementCategory}
                onChange={handleChange}
              >
                <option value="academic">Academic</option>
                <option value="sports">Sports</option>
                <option value="cultural">Cultural</option>
                <option value="science-and-technology">Science and Technology</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Award or Recognition */}
            <div className="form-group">
              <label className="form-label" htmlFor="awardOrRecognition">Award or Recognition</label>
              <input
                type="text"
                id="awardOrRecognition"
                name="awardOrRecognition"
                className="form-input"
                value={formData.awardOrRecognition}
                onChange={handleChange}
                placeholder="e.g. First Prize, Gold Medal"
                required
              />
            </div>

            {/* Date */}
            <div className="form-group">
              <label className="form-label" htmlFor="achievementDate">Achievement Date</label>
              <input
                type="date"
                id="achievementDate"
                name="achievementDate"
                className="form-input"
                value={formData.achievementDate ? formData.achievementDate.substring(0, 10) : ''}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            {/* Status toggle */}
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>

            {/* Image upload */}
            <div className="form-group">
              <label className="form-label">Achievement Image / Banner</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {(previewImage || formData.existingImage) && (
                  <img 
                    src={previewImage || `${import.meta.env.VITE_API_URL.replace('/api', '')}/public/uploads/${formData.existingImage.split('\\').pop().split('/').pop()}`} 
                    alt="Preview" 
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                )}
                <input
                  type="file"
                  id="achievementImage"
                  name="achievementImage"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  onChange={onFileChange}
                  accept="image/*"
                />
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => fileInputRef.current.click()}
                  style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                >
                  <Upload size={16} />
                  {formData.existingImage ? 'Change Image' : 'Upload Image'}
                </button>
                <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                  {fileInputRef.current?.files?.[0]?.name || (formData.existingImage && !previewImage ? formData.existingImage.split('\\').pop().split('/').pop() : 'No file chosen')}
                </span>
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Details of the accomplishment, projects, or background..."
              value={formData.description}
              onChange={handleChange}
              rows={4}
              required
              style={{ minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={closeAndReset} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : formData._id ? 'Update Achievement' : 'Save Achievement'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default AchievementsFormModal;
