import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

const Pagination = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
  if (totalPages <= 1 && totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      let startPage = Math.max(1, currentPage - 2);
      let endPage = startPage + maxVisiblePages - 1;

      if (endPage > totalPages) {
        endPage = totalPages;
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
      }

      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
    }
    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: '16px 24px',
      borderTop: '1px solid var(--border-color)',
      backgroundColor: 'var(--bg-white)',
      borderBottomLeftRadius: '12px',
      borderBottomRightRadius: '12px',
      flexWrap: 'wrap',
      gap: '12px'
    }}>
      <div style={{ fontSize: '13px', color: 'var(--text-gray)' }}>
        Showing <strong>{totalItems === 0 ? 0 : startItem}</strong> to <strong>{endItem}</strong> of <strong>{totalItems}</strong> entries
      </div>
      
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {/* First Page Button */}
        <button 
          className="btn-outline" 
          style={{ padding: '6px 10px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          onClick={() => onPageChange(1)}
          disabled={currentPage === 1}
          title="First Page"
        >
          <ChevronsLeft size={16} />
        </button>

        {/* Previous Page Button */}
        <button 
          className="btn-outline" 
          style={{ padding: '6px 10px', opacity: currentPage === 1 ? 0.5 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>
        
        {/* Page Numbers (at least 5 shown when available) */}
        {pageNumbers.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'var(--transition)',
              border: page === currentPage ? '1px solid var(--primary-blue)' : '1px solid var(--border-color)',
              backgroundColor: page === currentPage ? 'var(--primary-blue)' : 'var(--bg-white)',
              color: page === currentPage ? '#ffffff' : 'var(--text-dark)',
              minWidth: '34px'
            }}
          >
            {page}
          </button>
        ))}

        {/* Next Page Button */}
        <button 
          className="btn-outline" 
          style={{ padding: '6px 10px', opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>

        {/* Last Page Button */}
        <button 
          className="btn-outline" 
          style={{ padding: '6px 10px', opacity: (currentPage === totalPages || totalPages === 0) ? 0.5 : 1, cursor: (currentPage === totalPages || totalPages === 0) ? 'not-allowed' : 'pointer' }}
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage === totalPages || totalPages === 0}
          title="Last Page"
        >
          <ChevronsRight size={16} />
        </button>
      </div>
    </div>
  );
};

export default Pagination;

