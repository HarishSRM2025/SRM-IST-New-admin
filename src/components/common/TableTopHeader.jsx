import React from 'react';

const TableTopHeader = ({
  totalItems = 0,
  currentPage = 1,
  itemsPerPage = 10,
  title
}) => {
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  return (
    <div 
      className="table-top-header"
      style={{
        display: 'flex',
        justifyContent: title ? 'space-between' : 'flex-end',
        alignItems: 'center',
        padding: '10px 20px',
        backgroundColor: 'var(--bg-white, #ffffff)',
        borderBottom: '1px solid var(--border-color, #e2e8f0)',
        borderTopLeftRadius: '12px',
        borderTopRightRadius: '12px',
        flexWrap: 'wrap',
        gap: '8px'
      }}
    >
      {title && (
        <span style={{ fontWeight: 600, fontSize: '14px', color: 'var(--text-dark, #1e293b)' }}>
          {title}
        </span>
      )}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginLeft: 'auto' }}>
        <span 
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: 'var(--primary-blue-light, #eff6ff)',
            color: 'var(--primary-blue, #2563eb)',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            border: '1px solid #bfdbfe',
            letterSpacing: '0.01em',
            whiteSpace: 'nowrap'
          }}
        >
          {totalItems === 0
            ? '0 Results'
            : `Showing ${startItem}–${endItem} of ${totalItems} ${totalItems === 1 ? 'result' : 'results'}`}
        </span>
      </div>
    </div>
  );
};

export default TableTopHeader;
