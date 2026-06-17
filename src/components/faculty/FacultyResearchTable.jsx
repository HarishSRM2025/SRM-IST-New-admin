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
              <th style={{ width: '20%' }}>Faculty</th>
              <th style={{ width: '10%' }}>Awards</th>
              <th style={{ width: '10%' }}>Publications</th>
              <th style={{ width: '10%' }}>Patents</th>
              <th style={{ width: '10%' }}>Grants</th>
              <th style={{ width: '10%' }}>Conferences</th>
              <th style={{ width: '10%' }}>Workshops</th>
              <th style={{ width: '10%' }}>Projects</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td><strong>{getFacultyName(item.facultyId)}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#dbeafe', color: '#1d4ed8', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.awards_and_achievements)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#dcfce7', color: '#15803d', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.publications)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#fef9c3', color: '#a16207', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.patents)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#fce7f3', color: '#be185d', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.grants)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#e0e7ff', color: '#4338ca', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.conferences)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#f3e8ff', color: '#7c3aed', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.workshop)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{ background: '#ffedd5', color: '#c2410c', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                      {countItems(item.fundedProject)}
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
              ))
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
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
