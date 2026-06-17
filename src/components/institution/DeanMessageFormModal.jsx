import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Upload } from 'lucide-react';

const DeanMessageFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  loading,
  message,
  institutionsList
}) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

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
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Dean Message' : 'Add Dean Message'}</h2>
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
            <label className="form-label" htmlFor="deanName">Dean Name</label>
            <input
              type="text"
              id="deanName"
              name="deanName"
              className="form-input"
              placeholder="e.g. Dr. Muthamizhchelvan"
              value={formData.deanName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Dean Image</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {(previewImage || formData.existingImage) && (
                <img 
                  src={previewImage || `http://localhost:3000/public/uploads/${formData.existingImage}`} 
                  alt="Preview" 
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              )}
              <input
                type="file"
                id="deanImage"
                name="deanImage"
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
                {fileInputRef.current?.files?.[0]?.name || (formData.existingImage && !previewImage ? formData.existingImage : 'No file chosen')}
              </span>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="message">Message</label>
            <textarea
              id="message"
              name="message"
              className="form-textarea"
              placeholder="Enter the Dean's message..."
              value={formData.message}
              onChange={handleChange}
              required
              style={{ minHeight: '150px' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={closeAndReset}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Message' : 'Add Message'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default DeanMessageFormModal;
