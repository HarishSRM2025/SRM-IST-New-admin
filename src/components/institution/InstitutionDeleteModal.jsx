import React from 'react';
import { createPortal } from 'react-dom';
import { Trash2, Loader2 } from 'lucide-react';

const InstitutionDeleteModal = ({ deleteConfirmId, setDeleteConfirmId, confirmDelete, isDeleting }) => {
  if (!deleteConfirmId) return null;

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#ef4444' }}>
          <Trash2 size={48} strokeWidth={1.5} />
        </div>
        <h2 className="modal-title" style={{ marginBottom: '8px', fontSize: '20px', justifyContent: 'center' }}>Confirm Deletion</h2>
        <p style={{ color: 'var(--text-gray)', marginBottom: '24px', fontSize: '14px' }}>
          Are you sure you want to delete this institution? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
          <button 
            className="btn-secondary" 
            onClick={() => setDeleteConfirmId(null)}
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button 
            className="btn-danger" 
            onClick={confirmDelete}
            disabled={isDeleting}
          >
            {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
            {isDeleting ? 'Deleting...' : 'Yes, Delete'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default InstitutionDeleteModal;
