import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Upload } from 'lucide-react';

const GalleryResourceFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  setFormData,
  handleChange,
  handleSubmit,
  loading,
  message,
  institutionsList
}) => {
  const imageInputRef = useRef(null);
  const pdfInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    if (!isModalOpen) {
      setPreviewImage(null);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const onImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, galleryImage: file }));
      const reader = new FileReader();
      reader.onload = (e) => setPreviewImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const onPdfChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFormData(prev => ({ ...prev, pdfFile: file }));
    }
  };

  const closeAndReset = () => {
    setPreviewImage(null);
    handleCloseModal();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '600px' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Resource' : 'Add Resource'}</h2>
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
            <label className="form-label" htmlFor="galleryType">Resource Type</label>
            <select
              id="galleryType"
              name="galleryType"
              className="form-input"
              value={formData.galleryType}
              onChange={handleChange}
              required
            >
              <option value="">Select Resource Type</option>
              <option value="photos">Photos (Gallery Image)</option>
              <option value="videos">Videos (Video Link)</option>
              <option value="downloads">Downloads (PDF Resource)</option>
              <option value="reports">Reports (PDF Report)</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="e.g. Graduation Ceremony 2026"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* Conditional Input Fields depending on galleryType */}
          {formData.galleryType === 'photos' && (
            <div className="form-group">
              <label className="form-label">Gallery Image</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {(previewImage || formData.existingImage) && (
                  <img 
                    src={previewImage || `${API_BASE}/public/uploads/${formData.existingImage}`} 
                    alt="Preview" 
                    style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                  />
                )}
                <input
                  type="file"
                  id="galleryImage"
                  name="galleryImage"
                  ref={imageInputRef}
                  style={{ display: 'none' }}
                  onChange={onImageChange}
                  accept=".jpg,.jpeg,.png,.webp"
                />
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => imageInputRef.current.click()}
                >
                  <Upload size={16} />
                  {formData.existingImage ? 'Change Image' : 'Upload Image'}
                </button>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', wordBreak: 'break-all' }}>
                  {formData.galleryImage instanceof File ? formData.galleryImage.name : (formData.existingImage && !previewImage ? formData.existingImage : 'No file chosen')}
                </span>
              </div>
            </div>
          )}

          {formData.galleryType === 'videos' && (
            <div className="form-group">
              <label className="form-label" htmlFor="videoLink">Video URL Link</label>
              <input
                type="url"
                id="videoLink"
                name="videoLink"
                className="form-input"
                placeholder="e.g. https://www.youtube.com/watch?v=..."
                value={formData.videoLink}
                onChange={handleChange}
                required
              />
            </div>
          )}

          {(formData.galleryType === 'downloads' || formData.galleryType === 'reports') && (
            <div className="form-group">
              <label className="form-label">PDF File Document</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <input
                  type="file"
                  id="pdfFile"
                  name="pdfFile"
                  ref={pdfInputRef}
                  style={{ display: 'none' }}
                  onChange={onPdfChange}
                  accept=".pdf"
                />
                <button 
                  type="button" 
                  className="btn-outline" 
                  onClick={() => pdfInputRef.current.click()}
                >
                  <Upload size={16} />
                  {formData.existingPdf ? 'Change PDF' : 'Upload PDF'}
                </button>
                <span style={{ fontSize: '12px', color: 'var(--text-light)', wordBreak: 'break-all' }}>
                  {formData.pdfFile instanceof File ? formData.pdfFile.name : (formData.existingPdf ? formData.existingPdf : 'No file chosen')}
                </span>
              </div>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Short description of this resource..."
              value={formData.description}
              onChange={handleChange}
              required
              style={{ minHeight: '100px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={closeAndReset}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Resource' : 'Add Resource'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default GalleryResourceFormModal;
