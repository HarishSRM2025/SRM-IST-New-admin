import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const InstituteStatsTable = ({ fetching, dataList, institutionsList, handleOpenModal, handleDelete, pagination }) => {
  const getInstitutionName = (id) => {
    const institutionId = typeof id === 'object' ? id?._id : id;
    const inst = institutionsList.find(i => i._id === institutionId);
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
              <th style={{ width: '30%' }}>Institution</th>
              <th style={{ width: '45%' }}>Stats</th>
              <th style={{ width: '10%' }}>Count</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td><strong>{getInstitutionName(item.instituteId)}</strong></td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {(item.instituteStats || []).map((stat, statIndex) => (
                        <span
                          key={`${stat.name}-${statIndex}`}
                          style={{
                            border: '1px solid var(--border-color)',
                            borderRadius: '6px',
                            padding: '4px 8px',
                            fontSize: '12px',
                            background: 'var(--bg-body)'
                          }}
                        >
                          {stat.name}: <strong>{stat.value}</strong>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{item.instituteStats?.length || 0}</td>
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
                  No institute stats available. Click "New Stats" to create one.
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

export default InstituteStatsTable;
