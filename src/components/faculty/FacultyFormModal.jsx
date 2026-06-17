import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X, Plus, Trash2, Upload } from 'lucide-react';

const FacultyFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleSubmit,
  loading,
  message,
  schoolsList,
  imageFile,
  setImageFile,
  subjects,
  setSubjects,
  educationDetails,
  setEducationDetails
}) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);

  // Reset preview when modal closes
  useEffect(() => {
    if (!isModalOpen) {
      setPreviewImage(null);
    }
  }, [isModalOpen]);

  if (!isModalOpen) return null;

  const onFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setPreviewImage(ev.target.result);
      reader.readAsDataURL(file);
    } else {
      setPreviewImage(null);
    }
  };

  const closeAndReset = () => {
    setPreviewImage(null);
    handleCloseModal();
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { subject: '' }]);
  };

  const handleSubjectChange = (index, value) => {
    const updated = [...subjects];
    updated[index] = { subject: value };
    setSubjects(updated);
  };

  const handleRemoveSubject = (index) => {
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const handleAddEducation = () => {
    setEducationDetails([...educationDetails, { degree: '', institution: '', specialization: '', year: '' }]);
  };

  const handleEducationChange = (index, field, value) => {
    const updated = [...educationDetails];
    updated[index] = { ...updated[index], [field]: value };
    setEducationDetails(updated);
  };

  const handleRemoveEducation = (index) => {
    setEducationDetails(educationDetails.filter((_, i) => i !== index));
  };

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '750px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Faculty' : 'Add Faculty'}</h2>
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
            <div className="form-group">
              <label className="form-label" htmlFor="facultyName">Full Name</label>
              <input
                type="text"
                id="facultyName"
                name="facultyName"
                className="form-input"
                placeholder="e.g. Dr. John Doe"
                value={formData.facultyName}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="facultyEmail">Email</label>
              <input
                type="email"
                id="facultyEmail"
                name="facultyEmail"
                className="form-input"
                placeholder="e.g. john@srm.edu"
                value={formData.facultyEmail}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="facultyGender">Gender</label>
              <select
                id="facultyGender"
                name="facultyGender"
                className="form-input"
                value={formData.facultyGender}
                onChange={handleChange}
                required
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="school">School</label>
              <select
                id="school"
                name="school"
                className="form-input"
                value={formData.school}
                onChange={handleChange}
                required
              >
                <option value="">Select a School</option>
                {schoolsList.map(s => (
                  <option key={s._id} value={s._id}>{s.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div className="form-group">
              <label className="form-label" htmlFor="designation">Designation</label>
              <input
                type="text"
                id="designation"
                name="designation"
                className="form-input"
                placeholder="e.g. Associate Professor"
                value={formData.designation}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="facultyExperience">Experience (years)</label>
              <input
                type="number"
                id="facultyExperience"
                name="facultyExperience"
                className="form-input"
                placeholder="e.g. 10"
                value={formData.facultyExperience}
                onChange={handleChange}
                required
                min="0"
              />
            </div>
          </div>

          {/* Image Upload — styled like other pages */}
          <div className="form-group">
            <label className="form-label">Faculty Image</label>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              {(previewImage || formData.existingImage) && (
                <img
                  src={previewImage || `${import.meta.env.VITE_API_URL.replace('/api', '')}/${formData.existingImage.replace(/\\/g, '/')}`}
                  alt="Preview"
                  style={{ width: '64px', height: '64px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                />
              )}
              <input
                type="file"
                id="facultyImage"
                name="facultyImage"
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

          {/* Subjects */}
          <div className="form-group">
            <label className="form-label">Subjects</label>
            {subjects.map((subj, idx) => (
              <div key={idx} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder={`Subject ${idx + 1}`}
                  value={subj.subject}
                  onChange={(e) => handleSubjectChange(idx, e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="btn-danger"
                  style={{ padding: '6px 10px', flexShrink: 0 }}
                  onClick={() => handleRemoveSubject(idx)}
                  title="Remove subject"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '13px' }}
              onClick={handleAddSubject}
            >
              <Plus size={14} /> Add Subject
            </button>
          </div>

          {/* Area of Interest */}
          <div className="form-group">
            <label className="form-label" htmlFor="areaOfInterest">Area of Interest</label>
            <textarea
              id="areaOfInterest"
              name="areaOfInterest"
              className="form-textarea"
              placeholder="e.g. Machine Learning, Data Science, Cloud Computing..."
              value={formData.areaOfInterest || ''}
              onChange={handleChange}
              required
              style={{ minHeight: '80px' }}
            />
          </div>

          {/* Education Details */}
          <div className="form-group">
            <label className="form-label">Education Details</label>
            {educationDetails.map((edu, idx) => (
              <div key={idx} style={{ border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', marginBottom: '10px', background: 'var(--bg-body)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-dark)' }}>Education {idx + 1}</span>
                  <button
                    type="button"
                    className="btn-danger"
                    style={{ padding: '4px 8px', flexShrink: 0 }}
                    onClick={() => handleRemoveEducation(idx)}
                    title="Remove education"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Degree (e.g. Ph.D, M.Tech)"
                    value={edu.degree}
                    onChange={(e) => handleEducationChange(idx, 'degree', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Institution (e.g. IIT Madras)"
                    value={edu.institution}
                    onChange={(e) => handleEducationChange(idx, 'institution', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Specialization (e.g. Computer Science)"
                    value={edu.specialization}
                    onChange={(e) => handleEducationChange(idx, 'specialization', e.target.value)}
                    required
                  />
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Year (e.g. 2020)"
                    value={edu.year}
                    onChange={(e) => handleEducationChange(idx, 'year', e.target.value)}
                    required
                  />
                </div>
              </div>
            ))}
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 14px', fontSize: '13px' }}
              onClick={handleAddEducation}
            >
              <Plus size={14} /> Add Education
            </button>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={closeAndReset} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {loading ? 'Saving...' : formData._id ? 'Update Faculty' : 'Add Faculty'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default FacultyFormModal;
