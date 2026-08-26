import { useMemo } from 'react';
import { Loader2, Edit2, Trash2, Filter, X } from 'lucide-react';
import Pagination from '../common/Pagination';
import TableTopHeader from '../common/TableTopHeader';

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

const FacultyResearchTable = ({
  fetching, dataList, facultyList, schoolsList = [], institutionsList = [],
  handleOpenModal, handleDelete, selectedSchool, setSelectedSchool,
  selectedInstitution, setSelectedInstitution, selectedDivision, setSelectedDivision,
  selectedDesignation, setSelectedDesignation, selectedGender, setSelectedGender,
  onClearFilters, pagination
}) => {

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

  const uniqueDesignations = useMemo(() => {
    const raw = facultyList.map(f => f.designation?.trim()).filter(Boolean);
    const categories = [];
    if (raw.some(d => /director/i.test(d))) categories.push('Director');
    if (raw.some(d => /dean/i.test(d))) categories.push('Dean');
    if (raw.some(d => /principal/i.test(d))) categories.push('Principal');
    if (raw.some(d => /head of the department|head of the dept|hod|\bhead\b/i.test(d))) categories.push('HOD / Head / Head of the Department');
    if (raw.some(d => /professor/i.test(d) && !/assistant|associate/i.test(d))) categories.push('Professor');
    if (raw.some(d => /associate\s+professor/i.test(d))) categories.push('Associate Professor');
    if (raw.some(d => /assistant\s+professor/i.test(d))) categories.push('Assistant Professor');
    return [...categories, ...[...new Set(raw)].filter(d => !categories.includes(d)).sort()];
  }, [facultyList]);

  const availableSchools = useMemo(() => {
    if (!selectedInstitution) return [];
    return schoolsList.filter(s => {
      const institutionId = typeof s.institutionId === 'object' ? s.institutionId?._id : s.institutionId;
      return String(institutionId) === String(selectedInstitution);
    });
  }, [selectedInstitution, schoolsList]);

  const availableDivisions = useMemo(() => {
    if (!selectedSchool) return [];
    return schoolsList.find(s => String(s._id) === String(selectedSchool))?.divisions || [];
  }, [selectedSchool, schoolsList]);

  const rawSession = sessionStorage.getItem('srm_coordinator_session') || localStorage.getItem('srm_coordinator_session') || sessionStorage.getItem('srm_admin_session') || localStorage.getItem('srm_admin_session');
  const isCoordinator = rawSession ? JSON.parse(rawSession)?.role === 'coordinator' : false;
  const hasActiveFilters = isCoordinator
    ? Boolean(selectedDesignation || selectedGender)
    : Boolean(selectedSchool || selectedInstitution || selectedDivision || selectedDesignation || selectedGender);

  return (
    <div className="table-container animate-fade-in">
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 24px', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-body)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-gray)', fontSize: '13px', fontWeight: '600', whiteSpace: 'nowrap' }}>
          <Filter size={15} /> Filters
        </div>
        {!isCoordinator && <>
          <select value={selectedInstitution} onChange={e => setSelectedInstitution(e.target.value)} style={{ ...filterSelectStyle, borderColor: selectedInstitution ? 'var(--primary-blue)' : 'var(--border-color)', backgroundColor: selectedInstitution ? 'var(--primary-blue-light)' : 'var(--bg-white)' }}>
            <option value="">All Institutions</option>
            {institutionsList.map(i => <option key={i._id} value={i._id}>{i.name}</option>)}
          </select>
          <select value={selectedSchool} onChange={e => setSelectedSchool(e.target.value)} disabled={!selectedInstitution} style={{ ...filterSelectStyle, borderColor: selectedSchool ? 'var(--primary-blue)' : 'var(--border-color)', backgroundColor: selectedSchool ? 'var(--primary-blue-light)' : 'var(--bg-white)', opacity: selectedInstitution ? 1 : 0.55, cursor: selectedInstitution ? 'pointer' : 'not-allowed' }}>
            <option value="">{selectedInstitution ? 'All Schools' : 'Select Institution first'}</option>
            {availableSchools.map(s => <option key={s._id} value={s._id}>{s.name}</option>)}
          </select>
          <select value={selectedDivision} onChange={e => setSelectedDivision(e.target.value)} disabled={!selectedSchool} style={{ ...filterSelectStyle, borderColor: selectedDivision ? 'var(--primary-blue)' : 'var(--border-color)', backgroundColor: selectedDivision ? 'var(--primary-blue-light)' : 'var(--bg-white)', opacity: selectedSchool ? 1 : 0.55, cursor: selectedSchool ? 'pointer' : 'not-allowed' }}>
            <option value="">{selectedSchool ? 'All Divisions' : 'Select School first'}</option>
            {availableDivisions.map(d => <option key={d._id} value={d._id}>{d.name}</option>)}
          </select>
        </>}
        <select value={selectedDesignation} onChange={e => setSelectedDesignation(e.target.value)} style={{ ...filterSelectStyle, borderColor: selectedDesignation ? 'var(--primary-blue)' : 'var(--border-color)', backgroundColor: selectedDesignation ? 'var(--primary-blue-light)' : 'var(--bg-white)' }}>
          <option value="">All Designations</option>
          {uniqueDesignations.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <select value={selectedGender} onChange={e => setSelectedGender(e.target.value)} style={{ ...filterSelectStyle, minWidth: '120px', borderColor: selectedGender ? 'var(--primary-blue)' : 'var(--border-color)', backgroundColor: selectedGender ? 'var(--primary-blue-light)' : 'var(--bg-white)' }}>
          <option value="">All Genders</option><option value="Male">Male</option><option value="Female">Female</option><option value="Other">Other</option>
        </select>
        {hasActiveFilters && <button onClick={onClearFilters} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '8px 14px', borderRadius: '8px', border: '1px solid #fca5a5', backgroundColor: '#fef2f2', color: '#ef4444', fontSize: '13px', fontWeight: '600', cursor: 'pointer', fontFamily: 'inherit' }} title="Clear all filters"><X size={14} /> Clear</button>}
      </div>
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
