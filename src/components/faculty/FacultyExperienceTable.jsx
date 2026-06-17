import React from 'react';
import { Edit2, Loader2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const getFacultyId = (facultyId) => (
  typeof facultyId === 'object' && facultyId !== null ? facultyId._id : facultyId
);

const FacultyExperienceTable = ({ fetching, dataList, facultyList, handleOpenModal, handleDelete, pagination }) => {
  const getFacultyName = (id) => {
    if (typeof id === 'object' && id !== null && id.facultyName) return id.facultyName;
    return facultyList.find(faculty => faculty._id === getFacultyId(id))?.facultyName || 'Unknown Faculty';
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
              <th style={{ width: '35%' }}>Faculty</th>
              <th style={{ width: '20%' }}>Experience Count</th>
              <th style={{ width: '25%' }}>Latest Role</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? dataList.map((item, index) => {
              const experiences = Array.isArray(item.industryExperience) ? item.industryExperience : [];
              const latest = experiences[0];

              return (
                <tr key={item._id || index}>
                  <td><strong>{getFacultyName(item.facultyId)}</strong></td>
                  <td>{experiences.length}</td>
                  <td>{latest ? `${latest.role || '-'} at ${latest.companyName || '-'}` : '-'}</td>
                  <td style={{ textAlign: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleOpenModal(item)}>
                        <Edit2 size={16} /> Edit
                      </button>
                      <button className="btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(item._id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </td>
                </tr>
              );
            }) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No faculty experience records. Click "New Experience" to add one.
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

export default FacultyExperienceTable;
