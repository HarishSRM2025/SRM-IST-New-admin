import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const ProgrammesTable = ({
  fetching,
  dataList,
  schoolsList,
  handleOpenModal,
  handleDelete,
  pagination,
  entityField = 'school',
  entityLabel = 'School'
}) => {
  
  const getEntityName = (idOrObj) => {
    if (!idOrObj) return `Unknown ${entityLabel}`;
    if (typeof idOrObj === 'object' && idOrObj.name) {
      return idOrObj.name;
    }
    const match = schoolsList.find(s => s._id === idOrObj);
    return match ? match.name : `Unknown ${entityLabel}`;
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
              <th style={{ width: '20%' }}>{entityLabel}</th>
              <th style={{ width: '20%' }}>Programme Name</th>
              <th style={{ width: '10%' }}>Short Name</th>
              <th style={{ width: '10%' }}>Duration</th>
              <th style={{ width: '30%' }}>Career Paths</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td><strong>{getEntityName(item[entityField])}</strong></td>
                  <td>{item.name}</td>
                  <td>
                    <span style={{ 
                      fontFamily: 'monospace', 
                      fontSize: '12px', 
                      background: 'var(--bg-body)', 
                      padding: '2px 6px', 
                      borderRadius: '4px',
                      color: 'var(--primary-blue)',
                      fontWeight: '600'
                    }}>
                      {item.shortName}
                    </span>
                  </td>
                  <td>{item.duration}</td>
                  <td>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      {Array.isArray(item.careerPath) && item.careerPath.length > 0 ? (
                        item.careerPath.map((path, pIdx) => (
                          <span 
                            key={pIdx} 
                            style={{
                              fontSize: '11px',
                              background: 'rgba(59, 130, 246, 0.1)',
                              color: 'var(--primary-blue)',
                              padding: '2px 8px',
                              borderRadius: '12px',
                              border: '1px solid rgba(59, 130, 246, 0.2)'
                            }}
                          >
                            {path}
                          </span>
                        ))
                      ) : (
                        <span style={{ color: 'var(--text-light)', fontSize: '12px', fontStyle: 'italic' }}>None specified</span>
                      )}
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No Programmes available. Click "New Programme" to create one.
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

export default ProgrammesTable;
