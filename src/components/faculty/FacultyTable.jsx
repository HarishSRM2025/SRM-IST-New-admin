import React, { useMemo } from 'react';
import { Loader2, Edit2, Trash2, Filter, X } from 'lucide-react';
import Pagination from '../common/Pagination';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

const filterSelectStyle = {
  padding: '8px 12px',
  borderRadius: '8px',
  border: '1px solid var(--border-color)',
  fontSize: '13px',
  color: 'var(--text-dark)',
  backgroundColor: 'var(--bg-white)',
  cursor: 'pointer',
  minWidth: '150px',
  outline: 'none',
  transition: 'var(--transition)',
  fontFamily: 'inherit'
};

const FacultyTable = ({
  fetching,
  dataList,
  allFacultyData = [],
  schoolsList,
  institutionsList = [],
  handleOpenModal,
  handleDelete,
  selectedSchool,
  setSelectedSchool,
  selectedInstitution,
  setSelectedInstitution,
  selectedDivision,
  setSelectedDivision,
  selectedDesignation,
  setSelectedDesignation,
  selectedGender,
  setSelectedGender,
  onClearFilters,
  pagination
}) => {

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

  // Derive designation options: consolidated rank categories + individual specific roles
  const uniqueDesignations = useMemo(() => {
    const contextualFaculty = allFacultyData.filter(item => {
      const schoolObj = schoolsList.find(s => s._id === item.school);
      const schoolInstId = schoolObj ? (typeof schoolObj.institutionId === 'object' ? schoolObj.institutionId?._id : schoolObj.institutionId) : null;

      const matchesInstitution = !selectedInstitution || item.institution === selectedInstitution || String(schoolInstId) === String(selectedInstitution);
      const matchesSchool = !selectedSchool || item.school === selectedSchool;
      const matchesDivision = !selectedDivision || item.schoolDivision === selectedDivision;
      const matchesGender = !selectedGender || item.facultyGender === selectedGender;

      return matchesInstitution && matchesSchool && matchesDivision && matchesGender;
    });

    const rawDesignations = contextualFaculty
      .map(f => f.designation?.trim())
      .filter(Boolean);

    const categories = [];
    if (rawDesignations.some(d => /assistant\s+professor/i.test(d))) {
      categories.push('Assistant Professor');
    }
    if (rawDesignations.some(d => /associate\s+professor/i.test(d))) {
      categories.push('Associate Professor');
    }
    if (rawDesignations.some(d => /professor/i.test(d) && !/assistant|associate/i.test(d))) {
      categories.push('Professor');
    }

    const uniqueRaw = [...new Set(rawDesignations)].filter(d => !categories.includes(d)).sort();

    return [...categories, ...uniqueRaw];
  }, [allFacultyData, selectedInstitution, selectedSchool, selectedDivision, selectedGender, schoolsList]);

  // Get schools for the currently selected institution
  const availableSchools = useMemo(() => {
    if (!selectedInstitution) return [];
    return schoolsList.filter(s => {
      const schoolInstId = typeof s.institutionId === 'object' ? s.institutionId?._id : s.institutionId;
      return String(schoolInstId) === String(selectedInstitution);
    });
  }, [selectedInstitution, schoolsList]);

  // Get divisions for currently selected school
  const availableDivisions = useMemo(() => {
    if (!selectedSchool) return [];
    const school = schoolsList.find(s => s._id === selectedSchool);
    return school?.divisions || [];
  }, [selectedSchool, schoolsList]);

  const rawSession =
    sessionStorage.getItem('srm_coordinator_session') ||
    localStorage.getItem('srm_coordinator_session') ||
    sessionStorage.getItem('srm_admin_session') ||
    localStorage.getItem('srm_admin_session');
  const userSession = rawSession ? JSON.parse(rawSession) : null;
  const isCoordinator = userSession?.role === 'coordinator';

  const hasActiveFilters = isCoordinator
    ? Boolean(selectedDesignation || selectedGender)
    : Boolean(selectedSchool || selectedInstitution || selectedDivision || selectedDesignation || selectedGender);

  return (
    <div className="table-container animate-fade-in">

      {/* Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '16px 24px',
        borderBottom: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-body)',
        flexWrap: 'wrap'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          color: 'var(--text-gray)',
          fontSize: '13px',
          fontWeight: '600',
          whiteSpace: 'nowrap'
        }}>
          <Filter size={15} />
          Filters
        </div>

        {!isCoordinator && (
          <>
            {/* 1. Institution Filter (always enabled) */}
            <select
              value={selectedInstitution}
              onChange={(e) => setSelectedInstitution(e.target.value)}
              style={{
                ...filterSelectStyle,
                borderColor: selectedInstitution ? 'var(--primary-blue)' : 'var(--border-color)',
                backgroundColor: selectedInstitution ? 'var(--primary-blue-light)' : 'var(--bg-white)'
              }}
            >
              <option value="">All Institutions</option>
              {institutionsList.map(i => (
                <option key={i._id} value={i._id}>{i.name}</option>
              ))}
            </select>

            {/* 2. School Filter (enabled only when institution is selected) */}
            <select
              value={selectedSchool}
              onChange={(e) => setSelectedSchool(e.target.value)}
              disabled={!selectedInstitution}
              style={{
                ...filterSelectStyle,
                borderColor: selectedSchool ? 'var(--primary-blue)' : 'var(--border-color)',
                backgroundColor: selectedSchool ? 'var(--primary-blue-light)' : 'var(--bg-white)',
                opacity: selectedInstitution ? 1 : 0.55,
                cursor: selectedInstitution ? 'pointer' : 'not-allowed'
              }}
            >
              <option value="">{selectedInstitution ? 'All Schools' : 'Select Institution first'}</option>
              {availableSchools.map(s => (
                <option key={s._id} value={s._id}>{s.name}</option>
              ))}
            </select>

            {/* 3. Division Filter (enabled only when school is selected) */}
            <select
              value={selectedDivision}
              onChange={(e) => setSelectedDivision(e.target.value)}
              disabled={!selectedSchool}
              style={{
                ...filterSelectStyle,
                borderColor: selectedDivision ? 'var(--primary-blue)' : 'var(--border-color)',
                backgroundColor: selectedDivision ? 'var(--primary-blue-light)' : 'var(--bg-white)',
                opacity: selectedSchool ? 1 : 0.55,
                cursor: selectedSchool ? 'pointer' : 'not-allowed'
              }}
            >
              <option value="">{selectedSchool ? 'All Divisions' : 'Select School first'}</option>
              {availableDivisions.map(d => (
                <option key={d._id} value={d._id}>{d.name}</option>
              ))}
            </select>
          </>
        )}

        {/* Designation Filter */}
        <select
          value={selectedDesignation}
          onChange={(e) => setSelectedDesignation(e.target.value)}
          style={{
            ...filterSelectStyle,
            borderColor: selectedDesignation ? 'var(--primary-blue)' : 'var(--border-color)',
            backgroundColor: selectedDesignation ? 'var(--primary-blue-light)' : 'var(--bg-white)'
          }}
        >
          <option value="">All Designations</option>
          {uniqueDesignations.map(d => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>

        {/* Gender Filter */}
        <select
          value={selectedGender}
          onChange={(e) => setSelectedGender(e.target.value)}
          style={{
            ...filterSelectStyle,
            minWidth: '120px',
            borderColor: selectedGender ? 'var(--primary-blue)' : 'var(--border-color)',
            backgroundColor: selectedGender ? 'var(--primary-blue-light)' : 'var(--bg-white)'
          }}
        >
          <option value="">All Genders</option>
          <option value="Male">Male</option>
          <option value="Female">Female</option>
          <option value="Other">Other</option>
        </select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '8px 14px',
              borderRadius: '8px',
              border: '1px solid #fca5a5',
              backgroundColor: '#fef2f2',
              color: '#ef4444',
              fontSize: '13px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'var(--transition)',
              whiteSpace: 'nowrap',
              fontFamily: 'inherit'
            }}
            title="Clear all filters"
          >
            <X size={14} />
            Clear
          </button>
        )}
      </div>

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
                        src={item.facultyImage.startsWith('http')
                          ? item.facultyImage
                          : `${API_BASE}/${item.facultyImage.replace(/\\/g, '/').startsWith('public/')
                              ? item.facultyImage.replace(/\\/g, '/')
                              : 'public/uploads/' + item.facultyImage.replace(/\\/g, '/')}`}
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
