import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const HODMessageTable = ({
  fetching,
  dataList,
  schoolsList,
  handleOpenModal,
  handleDelete,
  pagination,
  entityField = 'school',
  entityLabel = 'School',
  emptyLabel = 'HOD Messages'
}) => {
  
  const getSchoolName = (idOrSchoolObj) => {
    if (idOrSchoolObj && typeof idOrSchoolObj === 'object' && idOrSchoolObj.name) {
      return idOrSchoolObj.name;
    }
    const school = schoolsList.find(s => s._id === idOrSchoolObj);
    return school ? school.name : `Unknown ${entityLabel}`;
  };

  const getImageUrl = (imagePath) => {
    const fileName = imagePath.split('\\').pop().split('/').pop();
    return `http://localhost:3000/public/uploads/${fileName}`;
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
              <th style={{ width: '10%' }}>HOD Image</th>
              <th style={{ width: '15%' }}>HOD Name</th>
              <th style={{ width: '20%' }}>Designation</th>
              <th style={{ width: '25%' }}>{entityLabel}</th>
              <th style={{ width: '25%' }}>Message Snippet</th>
              <th style={{ width: '5%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    {item.hodImage ? (
                      <img 
                        src={getImageUrl(item.hodImage)}
                        alt={item.hodName} 
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '10px' }}>No Img</div>
                    )}
                  </td>
                  <td><strong>{item.hodName}</strong></td>
                  <td><span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>{item.hodDesignation}</span></td>
                  <td>{getSchoolName(item[entityField])}</td>
                  <td>
                    <div style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      color: 'var(--text-gray)',
                      fontSize: '13px'
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No {emptyLabel} available. Click "New HOD Message" to create one.
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

export default HODMessageTable;
