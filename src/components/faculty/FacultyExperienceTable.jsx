import React from 'react';
import { Edit2, Loader2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const getFacultyId = (facultyId) => (
  typeof facultyId === 'object' && facultyId !== null ? facultyId._id : facultyId
);

const formatItemText = (item) => {
  if (typeof item === 'string') return item;
  if (!item) return '';
  if (item.companyName || item.role) {
    return [item.role, item.companyName].filter(Boolean).join(' at ');
  }
  return Object.values(item).filter(v => typeof v === 'string').join(' - ');
};

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
              <th style={{ width: '30%' }}>Faculty</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Points Count</th>
              <th style={{ width: '35%' }}>Experience Preview</th>
              <th style={{ width: '20%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? dataList.map((item, index) => {
              const rawExp = item.workExperience?.length ? item.workExperience : (item.industryExperience || []);
              const experiences = Array.isArray(rawExp) ? rawExp.map(formatItemText).filter(Boolean) : [];
              const latest = experiences[0];

              return (
                <tr key={item._id || index}>
                  <td><strong>{getFacultyName(item.facultyId)}</strong></td>
                  <td style={{ textAlign: 'center' }}>
                    <span style={{
                      background: experiences.length > 0 ? '#dbeafe' : '#f3f4f6',
                      color: experiences.length > 0 ? '#1d4ed8' : '#6b7280',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '600'
                    }}>
                      {experiences.length}
                    </span>
                  </td>
                  <td style={{ color: 'var(--text-gray)', fontSize: '13px' }}>
                    {latest ? (
                      <span title={experiences.join('\n')}>
                        {latest.length > 60 ? `${latest.slice(0, 60)}...` : latest}
                        {experiences.length > 1 && (
                          <span style={{ fontSize: '11px', color: 'var(--text-light)', marginLeft: '6px' }}>
                            (+{experiences.length - 1} more)
                          </span>
                        )}
                      </span>
                    ) : '-'}
                  </td>
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
