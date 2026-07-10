import React from 'react';
import { createPortal } from 'react-dom';
import { Loader2, Plus, Save, Trash2, X } from 'lucide-react';

const InstituteStatsFormModal = ({
  isModalOpen,
  handleCloseModal,
  formData,
  handleChange,
  handleStatChange,
  handleAddStat,
  handleRemoveStat,
  handleSubmit,
  loading,
  message,
  institutionsList
}) => {
  if (!isModalOpen) return null;

  const statsRows = formData.instituteStats?.length
    ? formData.instituteStats
    : [{ name: '', value: '' }];
  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Institute Stats' : 'Add Institute Stats'}</h2>
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
            <label className="form-label" htmlFor="instituteId">Institution</label>
            <select
              id="instituteId"
              name="instituteId"
              className="form-input"
              value={formData.instituteId}
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <label className="form-label" style={{ margin: 0 }}>Stats</label>
              <button type="button" className="btn-outline" onClick={handleAddStat} style={{ padding: '6px 10px' }}>
                <Plus size={16} />
                Add Row
              </button>
            </div>

            <div style={{ display: 'grid', gap: '12px' }}>
              {statsRows.map((stat, index) => (
                <div
                  key={index}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 140px auto',
                    gap: '12px',
                    alignItems: 'center'
                  }}
                >
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Expert Faculty"
                    value={stat.name}
                    onChange={(e) => handleStatChange(index, 'name', e.target.value)}
                    required
                  />
                  <input
                    type="number"
                    className="form-input"
                    placeholder="150"
                    value={stat.value}
                    onChange={(e) => handleStatChange(index, 'value', e.target.value)}
                    required
                    min="0"
                  />
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleRemoveStat(index)}
                    disabled={statsRows.length === 1}
                    title="Remove stat"
                    style={{ padding: '10px' }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
            <button type="button" className="btn-secondary" onClick={handleCloseModal}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
              {loading ? 'Saving...' : formData._id ? 'Update Stats' : 'Add Stats'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

export default InstituteStatsFormModal;
