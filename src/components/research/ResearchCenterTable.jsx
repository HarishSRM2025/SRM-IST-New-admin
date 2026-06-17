import React from 'react';
import { Edit2, Loader2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const truncateText = (text = '', limit = 120) => {
  if (!text) return '-';
  return text.length > limit ? `${text.slice(0, limit)}...` : text;
};

const ResearchCenterTable = ({ fetching, dataList, handleOpenModal, handleDelete, pagination }) => {
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
              <th style={{ width: '22%' }}>Center Name</th>
              <th style={{ width: '24%' }}>Mission</th>
              <th style={{ width: '22%' }}>Roles & Responsibility</th>
              <th style={{ width: '22%' }}>Outcomes</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td><strong>{item.centerName}</strong></td>
                  <td>{truncateText(item.centerMission)}</td>
                  <td>{truncateText(item.centerRolesResponsibility)}</td>
                  <td>{truncateText(item.publicationAndProjectOutcomes)}</td>
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
                  No research centers available. Click "New Research Center" to create one.
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

export default ResearchCenterTable;
