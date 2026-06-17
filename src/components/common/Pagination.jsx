import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 24px',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-white)',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px'
    }}>
      <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>
        Showing <strong>{totalItems === 0 ? 0 : startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </div>
      
      <div style={{ display: 'flex', gap: '8px' }}>
        <button 
          className="btn-outline" 
          style={{ padding: '6px 10px' }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft size={16} />
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', padding: '0 8px', fontSize: '14px', fontWeight: '500', color: 'var(--text-dark)' }}>
          Page {currentPage} of {totalPages}
        </div>

        <button 
          className="btn-outline" 
          style={{ padding: '6px 10px' }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;
