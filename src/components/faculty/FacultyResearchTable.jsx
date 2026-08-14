import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const FacultyResearchTable = ({ fetching, dataList, facultyList, handleOpenModal, handleDelete, pagination }) => {

  const getFacultyId = (facultyId) => (
    typeof facultyId === 'object' && facultyId !== null ? facultyId._id : facultyId
  );

  const getFacultyName = (id) => {
    if (typeof id === 'object' && id !== null && id.facultyName) return id.facultyName;
    const fac = facultyList.find(f => f._id === getFacultyId(id));
    return fac ? fac.facultyName : 'Unknown Faculty';
  };

  const countItems = (arr) => (Array.isArray(arr) ? arr.length : 0);

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
              <th style={{ width: '22%' }}>Faculty</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Publications</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Awards</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Invited Lectures</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Funded Projects</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Memberships</th>
              <th style={{ width: '9%', textAlign: 'center' }}>Other</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => {
                const otherCount = countItems(item.patents) + countItems(item.grants) + countItems(item.conferences) + countItems(item.workshop);
                return (
                  <tr key={item._id || index}>
                    <td><strong>{getFacultyName(item.facultyId)}</strong></td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {countItems(item.publications)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {countItems(item.awards_and_achievements)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {countItems(item.invited_lectures || item.invitedLectures)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {countItems(item.fundedProject || item.fundedProjects)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {countItems(item.professional_memberships || item.professionalMemberships)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#f3f4f6', color: '#4b5563', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {otherCount}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button
                          className="btn-secondary"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleOpenModal(item)}
                          title="Edit"
                        >
                          <Edit2 size={16} /> Edit
                        </button>
                        <button
                          className="btn-danger"
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No faculty research records. Click "New Research" to add one.
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

export default FacultyResearchTable;
