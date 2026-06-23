import React from 'react';
import { createPortal } from 'react-dom';
import { Save, Loader2, X } from 'lucide-react';

const RankingFormModal = ({
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
    <div className="modal-overlay animate-fade-in">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Ranking' : 'Add Ranking'}</h2>
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
            <label className="form-label" htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              className="form-input"
              placeholder="e.g. NIRF Ranking"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="count">Count / Rank</label>
            <input
              type="text"
              id="count"
              name="count"
              className="form-input"
              placeholder="e.g. #15 or Top 50"
              value={formData.count}
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
              {loading ? 'Saving...' : formData._id ? 'Update Ranking' : 'Add Ranking'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default RankingFormModal;
