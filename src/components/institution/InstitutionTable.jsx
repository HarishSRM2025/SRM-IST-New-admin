import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const InstitutionTable = ({ fetching, dataList, handleOpenModal, handleDelete, pagination }) => {
  return (
    <div className="table-container animate-fade-in">
      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '25%' }}>Institution Name</th>
              <th style={{ width: '35%' }}>Vision</th>
              <th style={{ width: '35%' }}>Mission</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td><strong>{item.name}</strong></td>
                  <td>{item.vision}</td>
                  <td>{item.mission}</td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button 
                        className="btn-secondary" 
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleOpenModal(item)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button 
                        className="btn-danger" 
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No institution data available. Click "New Institution" to create one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
      
      {!fetching && pagination && (
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}
    </div>
  );
};

export default InstitutionTable;
