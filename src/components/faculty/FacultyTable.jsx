import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const FacultyTable = ({ fetching, dataList, schoolsList, institutionsList = [], handleOpenModal, handleDelete, pagination }) => {

  const getSchoolName = (id) => {
    if (!id) return '—';
    const school = schoolsList.find(s => s._id === id);
    return school ? school.name : 'Unknown School';
  };

  const getInstitutionName = (id) => {
    if (!id) return '—';
    const inst = institutionsList.find(i => i._id === id);
    return inst ? inst.name : '—';
  };

  const getDivisionName = (schoolId, divisionId) => {
    if (!divisionId) return '—';
    const school = schoolsList.find(s => s._id === schoolId);
    if (!school || !school.divisions) return '—';
    const division = school.divisions.find(d => d._id === divisionId);
    return division ? division.name : '—';
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
              <th style={{ width: '5%' }}>Image</th>
              <th style={{ width: '15%' }}>Name</th>
              <th style={{ width: '15%' }}>Email</th>
              <th style={{ width: '8%' }}>Gender</th>
              <th style={{ width: '14%' }}>School / Institution</th>
              <th style={{ width: '14%' }}>Division</th>
              <th style={{ width: '10%' }}>Designation</th>
              <th style={{ width: '7%' }}>Exp (yrs)</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    {item.facultyImage ? (
                      <img
                        src={`${API_BASE}/${item.facultyImage.replace(/\\/g, '/')}`}
                        alt={item.facultyName}
                        style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                    ) : (
                      <div style={{
                        width: '40px', height: '40px', borderRadius: '50%',
                        background: 'var(--primary-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: '600', color: 'var(--primary)'
                      }}>
                        {item.facultyName?.charAt(0)?.toUpperCase() || '?'}
                      </div>
                    )}
                  </td>
                  <td><strong>{item.facultyName}</strong></td>
                  <td style={{ fontSize: '13px' }}>{item.facultyEmail}</td>
                  <td>
                    <span style={{
                      fontSize: '12px', padding: '2px 8px', borderRadius: '12px',
                      background: item.facultyGender === 'Male' ? '#dbeafe' : item.facultyGender === 'Female' ? '#fce7f3' : '#e5e7eb',
                      color: item.facultyGender === 'Male' ? '#1d4ed8' : item.facultyGender === 'Female' ? '#be185d' : '#374151'
                    }}>
                      {item.facultyGender}
                    </span>
                  </td>
                  <td>{item.institution ? getInstitutionName(item.institution) : getSchoolName(item.school)}</td>
                  <td>{item.institution ? '—' : getDivisionName(item.school, item.schoolDivision)}</td>
                  <td>{item.designation}</td>
                  <td style={{ textAlign: 'center' }}>{item.facultyExperience}</td>
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
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No faculty members available. Click "New Faculty" to add one.
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

export default FacultyTable;
