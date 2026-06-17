import { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Upload } from 'lucide-react';

const EventsAndActivitiesFormModal = ({
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
  const [previewImages, setPreviewImages] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');

  // Sync / reset preview image when modal status changes
  useEffect(() => {
    if (!isModalOpen) {
      setPreviewImages(prev => {
        prev.forEach(url => URL.revokeObjectURL(url));
        return [];
      });
      setSelectedFileName('');
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const onFileChange = (e) => {
    handleFileChange(e);
    setPreviewImages(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });

    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      setSelectedFileName(`${filesArray.length} file(s) selected`);
      const urls = filesArray.map(file => URL.createObjectURL(file));
      setPreviewImages(urls);
    } else {
      setSelectedFileName('');
      setPreviewImages([]);
    }
  };
  const closeAndReset = () => {
    setPreviewImages(prev => {
      prev.forEach(url => URL.revokeObjectURL(url));
      return [];
    });
    setSelectedFileName('');
    handleCloseModal();
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Events & Activities' : 'Add Events & Activities'}</h2>
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

            <div className="form-group">
              <label className="form-label" htmlFor="type">Type</label>
              <select
                id="type"
                name="type"
                className="form-input"
                value={formData.type}
                onChange={handleChange}
                required
              >
                <option value="competition">Competition</option>
                <option value="activity">Activity</option>
                <option value="visit">Industrial Visit</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="conference">Conference</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="name">Event/Activity Title</label>
            <input
              type="text"
              id="name"
              name="name"
              className="form-input"
              placeholder="e.g. National Symposium on Generative AI"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="eventDateTime">Date & Time</label>
              <input
                type="datetime-local"
                id="eventDateTime"
                name="eventDateTime"
                className="form-input"
                value={formData.eventDateTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="location">Location / Venue</label>
              <input
                type="text"
                id="location"
                name="location"
                className="form-input"
                placeholder="e.g. Mini Hall 2, Tech Park"
                value={formData.location}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="conductedBy">Conducted By</label>
              <input
                type="text"
                id="conductedBy"
                name="conductedBy"
                className="form-input"
                placeholder="e.g. Department of Software Engineering"
                value={formData.conductedBy}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="co_ordinator">Coordinator Name</label>
              <input
                type="text"
                id="co_ordinator"
                name="co_ordinator"
                className="form-input"
                placeholder="e.g. Dr. A. K. Sharma"
                value={formData.co_ordinator}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="resourcePerson">Resource Person</label>
              <input
                type="text"
                id="resourcePerson"
                name="resourcePerson"
                className="form-input"
                placeholder="e.g. Dr. Susan Varghese"
                value={formData.resourcePerson}
                onChange={handleChange}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="resourcePersonDesignation">Resource Person Designation</label>
              <input
                type="text"
                id="resourcePersonDesignation"
                name="resourcePersonDesignation"
                className="form-input"
                placeholder="e.g. Distinguished Research Fellow, IISc"
                value={formData.resourcePersonDesignation}
                onChange={handleChange}
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="status">Status</label>
              <select
                id="status"
                name="status"
                className="form-input"
                value={formData.status}
                onChange={handleChange}
                required
              >
                <option value="upcoming">Upcoming</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="announcement">Announcement</label>
              <label
                htmlFor="announcement"
                style={{
                  minHeight: '46px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px 14px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '10px',
                  background: '#fff',
                  cursor: 'pointer',
                  fontSize: '14px',
                  color: 'var(--text-dark)'
                }}
              >
                <input
                  type="checkbox"
                  id="announcement"
                  name="announcement"
                  checked={Boolean(formData.announcement)}
                  onChange={handleChange}
                  style={{ width: '16px', height: '16px' }}
                />
                Show as announcement
              </label>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>

            <div className="form-group">
              <label className="form-label">Event Banner / Image</label>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                {((previewImages && previewImages.length > 0) || (Array.isArray(formData.existingImage) && formData.existingImage.length > 0)) && (
                  <div className="image-preview-grid" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    {previewImages && previewImages.length > 0 ? (
                      previewImages.map((url, idx) => (
                        <img
                          key={idx}
                          src={url}
                          alt={`Preview ${idx + 1}`}
                          style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                      ))
                    ) : (
                      Array.isArray(formData.existingImage) &&
                      formData.existingImage.map((img, idx) => (
                        <img
                          key={idx}
                          src={`${import.meta.env.VITE_API_URL.replace('/api', '')}/public/uploads/${img.split(/[\\/]/).pop()}`}
                          alt={`Existing ${idx + 1}`}
                          style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                        />
                      ))
                    )}
                  </div>
                )}
<input
  type="file"
  id="eventImage"
  name="eventImage"
  ref={fileInputRef}
  style={{ display: 'none' }}
  multiple
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
                  {selectedFileName || (previewImages.length === 0 && formData.existingImage && formData.existingImage.length > 0 ? `${formData.existingImage.length} existing file(s)` : 'No file chosen')}
                </span>
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Event Description</label>
            <textarea
              id="description"
              name="description"
              className="form-textarea"
              placeholder="Provide a detailed description of the event topic, details and context..."
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
              {loading ? 'Saving...' : formData._id ? 'Update Record' : 'Add Record'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default EventsAndActivitiesFormModal;
