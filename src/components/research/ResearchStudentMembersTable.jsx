import React from 'react';
import { Edit2, Loader2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const ResearchStudentMembersTable = ({
  fetching,
  dataList,
  researchCenters,
  handleOpenModal,
  handleDelete,
  pagination,
}) => {
  const getCleanId = (val) => (
    typeof val === 'object' && val !== null ? val._id : val
  );

  const getCenterName = (centerId) => {
    if (typeof centerId === 'object' && centerId !== null && centerId.centerName) {
      return centerId.centerName;
    }
    const center = researchCenters.find((c) => c._id === getCleanId(centerId));
    return center ? center.centerName : 'Unknown Center';
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
              <th style={{ width: '40%' }}>Research Center</th>
              <th style={{ width: '40%' }}>Student Name</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    <strong>{getCenterName(item.researchCenterId)}</strong>
                  </td>
                  <td>
                    <strong>{item.studentName}</strong>
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
                <td colSpan="3" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No research student members available. Click "Add Student Member" to create one.
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

export default ResearchStudentMembersTable;
