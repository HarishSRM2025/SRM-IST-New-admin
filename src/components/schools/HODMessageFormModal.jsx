import React, { useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Upload } from 'lucide-react';

const HODMessageFormModal = ({
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

  const getImageUrl = (imagePath) => {
    const fileName = imagePath.split('\\').pop().split('/').pop();
    return `http://localhost:3000/public/uploads/${fileName}`;
  };

  return createPortal(
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit HOD Message' : 'Add HOD Message'}</h2>
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
              {schoolsList.map(sch => (
                <option key={sch._id} value={sch._id}>{sch.name}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hodName">HOD Name</label>
            <input
              type="text"
              id="hodName"
              name="hodName"
              className="form-input"
              placeholder="e.g. Dr. Rajesh Kumar"
              value={formData.hodName}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="hodDesignation">HOD Designation</label>
            <input
              type="text"
              id="hodDesignation"
              name="hodDesignation"
              className="form-input"
              placeholder="e.g. Head of Department, CSE"
              value={formData.hodDesignation}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">HOD Image</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {(previewImage || formData.existingImage) && (
                <img 
                  src={previewImage || getImageUrl(formData.existingImage)} 
                  alt="Preview" 
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              )}
              <input
                type="file"
                id="hodImage"
                name="hodImage"
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
              placeholder="Enter the HOD's welcome message..."
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

export default HODMessageFormModal;
