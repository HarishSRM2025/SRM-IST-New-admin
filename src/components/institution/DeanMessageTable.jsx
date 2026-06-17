import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const DeanMessageTable = ({ fetching, dataList, institutionsList, handleOpenModal, handleDelete, pagination }) => {
  
  const getInstitutionName = (id) => {
    const inst = institutionsList.find(i => i._id === id);
    return inst ? inst.name : 'Unknown Institution';
  };

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
              <th style={{ width: '10%' }}>Dean Image</th>
              <th style={{ width: '20%' }}>Dean Name</th>
              <th style={{ width: '25%' }}>Institution</th>
              <th style={{ width: '40%' }}>Message Snippet</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    {item.deanImage ? (
                      <img 
                        src={`http://localhost:3000/public/uploads/${item.deanImage}`}
                        alt={item.deanName} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '10px' }}>No Img</div>
                    )}
                  </td>
                  <td><strong>{item.deanName}</strong></td>
                  <td>{getInstitutionName(item.institutionId)}</td>
                  <td>
                    <div style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.message}
                    </div>
                  </td>
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
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No Dean Messages available. Click "New Dean Message" to create one.
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

export default DeanMessageTable;
