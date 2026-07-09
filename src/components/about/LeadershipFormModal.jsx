import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Upload } from 'lucide-react';

const CATEGORY_OPTIONS = [
  'Founder',
  'Chairman',
  'Co-Chairman',
  'Leadership',
  'Academic Heads',
  'Administrative Heads'
];

const LeadershipFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  loading,
  message,
  // When the modal is opened from a specific tab (Academic Heads / Administrative Heads),
  // the category field is locked to that tab's value instead of being a free dropdown.
  lockedCategory = null,
  // Controls whether the "Show in Home" checkbox is exposed in the form.
  showDisplayInHome = true
}) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

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
  const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';  
  const getImageUrl = (imagePath) => {
    const fileName = imagePath.split('\\').pop().split('/').pop();
    return `${API_BASE}/public/uploads/${fileName}`;
  };

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content" style={{ maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Leadership Entry' : 'Add Leadership Entry'}</h2>
          <button className="modal-close" onClick={closeAndReset}>
            <X size={24} />
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} animate-fade-in`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                className="form-input"
                placeholder="e.g. Dr. A. Ramachandran"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="role">Role / Designation</label>
              <input
                type="text"
                id="role"
                name="role"
                className="form-input"
                placeholder="e.g. Chairman & Managing Trustee"
                value={formData.role}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="category">Category</label>
              {lockedCategory ? (
                <input
                  type="text"
                  id="category"
                  name="category"
                  className="form-input"
                  value={lockedCategory}
                  disabled
                  readOnly
                />
              ) : (
                <select
                  id="category"
                  name="category"
                  className="form-input"
                  value={formData.category}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a Category</option>
                  {CATEGORY_OPTIONS.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="order">Display Order</label>
              <input
                type="number"
                id="order"
                name="order"
                className="form-input"
                placeholder="0"
                value={formData.order}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Image</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {(previewImage || formData.existingImage) && (
                <img
                  src={previewImage || getImageUrl(formData.existingImage)}
                  alt="Preview"
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-color)' }}
                />
              )}
              <input
                type="file"
                id="image"
                name="image"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onFileChange}
                accept=".jpg,.jpeg,.png,.webp"
              />
              <button
                type="button"
                className="btn-outline"
                onClick={() => fileInputRef.current.click()}
              >
                <Upload size={16} />
                {formData.existingImage ? 'Change Image' : 'Upload Image'}
              </button>
              <span style={{ fontSize: '12px', color: 'var(--text-light)' }}>
                {fileInputRef.current?.files?.[0]?.name || (formData.existingImage && !previewImage ? formData.existingImage.split('\\').pop().split('/').pop() : 'No file chosen')}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="leadershipMessage">Leadership Message</label>
            <textarea
              id="leadershipMessage"
              name="leadershipMessage"
              className="form-textarea"
              placeholder="Enter the leadership message..."
              value={formData.leadershipMessage}
              onChange={handleChange}
              style={{ minHeight: '150px' }}
            />
          </div>

          {showDisplayInHome && (
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontWeight: 500 }}>
                <input
                  type="checkbox"
                  name="displayInHome"
                  checked={!!formData.displayInHome}
                  onChange={handleChange}
                />
                Show in Home Page
              </label>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={closeAndReset} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Entry' : 'Add Entry'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default LeadershipFormModal;
