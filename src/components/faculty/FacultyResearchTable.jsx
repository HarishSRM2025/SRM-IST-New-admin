import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';
import TableTopHeader from '../common/TableTopHeader';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const FacultyResearchTable = ({ fetching, dataList, facultyList, handleOpenModal, handleDelete, pagination }) => {

  const getFacultyId = (facultyId) => (
    typeof facultyId === 'object' && facultyId !== null ? facultyId._id : facultyId
  );

  const getFacultyName = (id) => {
    if (typeof id === 'object' && id !== null && id.facultyName) return id.facultyName;
    const fac = facultyList.find(f => f._id === getFacultyId(id));
    return fac ? fac.facultyName : 'Unknown Faculty';
  };

  const getFacultyImage = (id) => {
    if (typeof id === 'object' && id !== null && id.facultyImage) return id.facultyImage;
    const fac = facultyList.find(f => f._id === getFacultyId(id));
    return fac?.facultyImage || '';
  };

  const countItems = (arr) => (Array.isArray(arr) ? arr.length : 0);

  return (
    <div className="table-container animate-fade-in">
      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <>
          <TableTopHeader
            totalItems={pagination?.totalItems ?? dataList.length}
            currentPage={pagination?.currentPage ?? 1}
            itemsPerPage={pagination?.itemsPerPage ?? 10}
          />
          <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '20%' }}>Faculty</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Work Exp</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Publications</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Awards</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Invited Lectures</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Funded Projects</th>
              <th style={{ width: '11%', textAlign: 'center' }}>Memberships</th>
              <th style={{ width: '7%', textAlign: 'center' }}>Other</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => {
                const otherCount = countItems(item.patents) + countItems(item.grants) + countItems(item.conferences) + countItems(item.workshop);
                const facultyImage = getFacultyImage(item.facultyId);
                const imageUrl = facultyImage
                  ? (facultyImage.startsWith('http')
                    ? facultyImage
                    : `${API_BASE}/${facultyImage.replace(/\\/g, '/').startsWith('public/')
                        ? facultyImage.replace(/\\/g, '/')
                        : 'public/uploads/' + facultyImage.replace(/\\/g, '/')}`)
                  : '';

                const expCount = countItems(item.workExperience || item.industryExperience);

                return (
                  <tr key={item._id || index}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {imageUrl ? (
                          <img
                            src={imageUrl}
                            alt={getFacultyName(item.facultyId)}
                            style={{ width: '38px', height: '38px', borderRadius: '50%', objectFit: 'cover', border: '1px solid var(--border-color)' }}
                          />
                        ) : (
                          <div style={{
                            width: '38px', height: '38px', borderRadius: '50%',
                            background: 'var(--primary-light)', display: 'flex',
                            alignItems: 'center', justifyContent: 'center',
                            fontSize: '13px', fontWeight: '600', color: 'var(--primary)',
                            border: '1px solid var(--border-color)'
                          }}>
                            {getFacultyName(item.facultyId)?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                        )}
                        <strong>{getFacultyName(item.facultyId)}</strong>
                      </div>
                    </td>
                    <td style={{ textAlign: 'center' }}>
                      <span style={{ background: '#fef3c7', color: '#92400e', padding: '2px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: '600' }}>
                        {expCount}
                      </span>
                    </td>
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
                          onClick={() => handleDelete(item)}
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
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No faculty research & work experience records. Click "New Research & Work Experience" to add one.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </>
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
