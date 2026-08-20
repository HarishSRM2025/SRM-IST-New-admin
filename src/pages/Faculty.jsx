import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import FacultyTable from '../components/faculty/FacultyTable';
import FacultyFormModal from '../components/faculty/FacultyFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import SubNav from '../components/common/SubNav';

const facultyTabs = [
  { label: 'Faculty Details', path: '/faculty', end: true },
  { label: 'Faculty Research & Work Experience', path: '/faculty/research', end: false },
];

const getDesignationRank = (designation = '') => {
  const normalized = String(designation || '').trim().toLowerCase();

  if (normalized.includes('director')) return 0;
  if (normalized.includes('dean')) return 1;
  if (normalized.includes('principal')) return 2;
  if (
    normalized.includes('head of the department') ||
    normalized.includes('head of the dept') ||
    normalized.includes('hod') ||
    normalized.includes('head')
  ) return 3;
  if (normalized.includes('professor') && !normalized.includes('assistant') && !normalized.includes('associate')) return 4;
  if (normalized.includes('associate professor')) return 5;
  if (normalized.includes('assistant professor')) return 6;
  return 7;
};

const getExperienceValue = (value) => {
  const parsed = Number(String(value ?? '').replace(/[^\d.-]/g, ''));
  return Number.isFinite(parsed) ? parsed : 0;
};

const sortFacultyMembers = (list = []) => {
  return [...list].sort((a, b) => {
    const rankDifference = getDesignationRank(a?.designation) - getDesignationRank(b?.designation);
    if (rankDifference !== 0) return rankDifference;

    const experienceDifference = getExperienceValue(b?.facultyExperience) - getExperienceValue(a?.facultyExperience);
    if (experienceDifference !== 0) return experienceDifference;

    return String(a?.facultyName || '').localeCompare(String(b?.facultyName || ''));
  });
};

const Faculty = () => {
  const [dataList, setDataList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [formData, setFormData] = useState({
    facultyName: '',
    facultyEmail: '',
    facultyGender: '',
    institution: '',
    school: '',
    schoolDivision: '',
    designation: '',
    facultyExperience: '',
    areaOfInterest: ''
  });
  const [subjects, setSubjects] = useState([]);
  const [educationDetails, setEducationDetails] = useState([{ degree: '', institution: '', specialization: '', year: '' }]);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');
  const [selectedInstitution, setSelectedInstitution] = useState('');
  const [selectedDivision, setSelectedDivision] = useState('');
  const [selectedDesignation, setSelectedDesignation] = useState('');
  const [selectedGender, setSelectedGender] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setFetching(true);
    try {
      const [schoolsRes, divisionsRes, institutionsRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/schools/getall`),
        fetch(`${import.meta.env.VITE_API_URL}/school-division/getall`),
        fetch(`${import.meta.env.VITE_API_URL}/institution/getall`)
      ]);

      let schools = [];
      let divisions = [];

      // Schools Data
      if (schoolsRes.ok) {
        const schoolsJson = await schoolsRes.json();
        if (Array.isArray(schoolsJson)) {
          schools = schoolsJson;
        } else if (schoolsJson.data) {
          schools = Array.isArray(schoolsJson.data) ? schoolsJson.data : [schoolsJson.data];
        }
      }

      // School Division Data
      if (divisionsRes.ok) {
        const divisionsJson = await divisionsRes.json();
        if (Array.isArray(divisionsJson)) {
          divisions = divisionsJson;
        } else if (divisionsJson.data) {
          divisions = Array.isArray(divisionsJson.data) ? divisionsJson.data : [divisionsJson.data];
        }
      }

      // Combined School + Division
      const combinedList = schools.map((school) => {
        const schoolDivisions = divisions.filter((division) => {
          const divSchoolId = typeof division.schoolId === 'object'
            ? division.schoolId?._id?.toString()
            : division.schoolId?.toString();
          return divSchoolId === school._id?.toString();
        });

        return {
          ...school,
          divisions: schoolDivisions,
        };
      });

      // Institution Data
      let institutions = [];
      if (institutionsRes.ok) {
        const instJson = await institutionsRes.json();
        if (instJson.success && instJson.data) {
          institutions = Array.isArray(instJson.data) ? instJson.data : [instJson.data];
        } else if (Array.isArray(instJson)) {
          institutions = instJson;
        }
      }

      setSchoolsList(combinedList);
      setInstitutionsList(institutions);

      // Fetch Faculty
      const dataRes = await fetch(`${import.meta.env.VITE_API_URL}/faculty/getfaculty`);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        let facultyData = [];
        if (Array.isArray(dataJson)) {
          facultyData = dataJson;
        } else if (dataJson.data) {
          facultyData = Array.isArray(dataJson.data) ? dataJson.data : [dataJson.data];
        }
        setDataList(sortFacultyMembers(facultyData));
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedSchool, selectedInstitution, selectedDivision, selectedDesignation, selectedGender]);

  const handleInstitutionChange = (value) => {
    setSelectedInstitution(value);
    setSelectedSchool('');
    setSelectedDivision('');
    setSelectedDesignation('');
  };

  const handleSchoolChange = (value) => {
    setSelectedSchool(value);
    setSelectedDivision('');
    setSelectedDesignation('');
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedSchool('');
    setSelectedInstitution('');
    setSelectedDivision('');
    setSelectedDesignation('');
    setSelectedGender('');
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setFormData({
      facultyName: '',
      facultyEmail: '',
      facultyGender: '',
      institution: '',
      school: '',
      schoolDivision: '',
      designation: '',
      facultyExperience: '',
      areaOfInterest: ''
    });
    setSubjects([]);
    setEducationDetails([{ degree: '', institution: '', specialization: '', year: '' }]);
    setImageFile(null);
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        facultyName: item.facultyName || '',
        facultyEmail: item.facultyEmail || '',
        facultyGender: item.facultyGender || '',
        institution: item.institution || '',
        school: item.school || '',
        schoolDivision: item.schoolDivision || '',
        designation: item.designation || '',
        facultyExperience: item.facultyExperience || '',
        areaOfInterest: item.areaOfInterest || '',
        existingImage: item.facultyImage || '',
        _id: item._id
      });
      // Convert subjects to simple string array
      if (item.subjects && item.subjects.length > 0) {
        setSubjects(item.subjects.map(s => typeof s === 'string' ? s : s.subject || ''));
      } else {
        setSubjects([]);
      }
      setEducationDetails(item.educationDetails && item.educationDetails.length > 0 ? item.educationDetails : [{ degree: '', institution: '', specialization: '', year: '' }]);
      setImageFile(null);
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/faculty/updatefaculty/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/faculty/addfaculty`;

      const method = formData._id ? 'PUT' : 'POST';

      const body = new FormData();
      body.append('facultyName', formData.facultyName);
      body.append('facultyEmail', formData.facultyEmail);
      body.append('facultyGender', formData.facultyGender);
      body.append('institution', formData.institution || '');
      body.append('school', formData.school || '');
      body.append('schoolDivision', formData.schoolDivision || '');
      body.append('designation', formData.designation);
      body.append('facultyExperience', formData.facultyExperience);
      // Convert subjects to object format for backend
      const formattedSubjects = subjects.map(s => ({ subject: typeof s === 'string' ? s : s.subject })).filter(s => s.subject.trim() !== '');
      body.append('subjects', JSON.stringify(formattedSubjects));
      body.append('areaOfInterest', formData.areaOfInterest);
      body.append('educationDetails', JSON.stringify(educationDetails.filter(e => e.degree.trim() !== '')));

      if (imageFile) {
        body.append('facultyImage', imageFile);
      }

      const response = await fetch(url, { method, body });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Faculty saved successfully!' });
        await fetchData();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save data. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/faculty/deletefaculty/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || 'Failed to delete.');
      }
    } catch (error) {
      console.error('Error deleting:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const matchesDesignationFilter = (designation, filter) => {
    if (!filter) return true;
    if (!designation) return false;
    const d = designation.trim();
    const f = filter.trim();

    if (d === f) return true;

    if (f === 'Assistant Professor') {
      return /assistant\s+professor/i.test(d);
    }
    if (f === 'Associate Professor') {
      return /associate\s+professor/i.test(d);
    }
    if (f === 'Professor') {
      return /professor/i.test(d) && !/assistant|associate/i.test(d);
    }

    return d.toLowerCase() === f.toLowerCase();
  };

  const filteredDataList = dataList.filter(item => {
    const schoolObj = schoolsList.find(s => s._id === item.school);
    const schoolName = schoolObj?.name || '';
    const instName = institutionsList.find(i => i._id === item.institution)?.name || '';
    const divName = schoolObj?.divisions?.find(d => d._id === item.schoolDivision)?.name || '';

    const matchesSearch = !searchQuery || (
      item.facultyName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.facultyEmail?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.designation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      divName.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const matchesSchool = !selectedSchool || item.school === selectedSchool;
    const schoolInstId = schoolObj ? (typeof schoolObj.institutionId === 'object' ? schoolObj.institutionId?._id : schoolObj.institutionId) : null;
    const matchesInstitution = !selectedInstitution || item.institution === selectedInstitution || String(schoolInstId) === String(selectedInstitution);
    const matchesDivision = !selectedDivision || item.schoolDivision === selectedDivision;
    const matchesDesignation = matchesDesignationFilter(item.designation, selectedDesignation);
    const matchesGender = !selectedGender || item.facultyGender === selectedGender;

    return matchesSearch && matchesSchool && matchesInstitution && matchesDivision && matchesDesignation && matchesGender;
  });

  const sortedFilteredDataList = sortFacultyMembers(filteredDataList);
  const totalItems = sortedFilteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const currentData = sortedFilteredDataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <InstitutionHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Faculty"
        subtitle="Manage faculty members and their details across schools."
        buttonText="New Faculty"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={facultyTabs} />
      </div>

      <FacultyTable
        fetching={fetching}
        dataList={currentData}
        allFacultyData={dataList}
        schoolsList={schoolsList}
        institutionsList={institutionsList}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        selectedSchool={selectedSchool}
        setSelectedSchool={handleSchoolChange}
        selectedInstitution={selectedInstitution}
        setSelectedInstitution={handleInstitutionChange}
        selectedDivision={selectedDivision}
        setSelectedDivision={setSelectedDivision}
        selectedDesignation={selectedDesignation}
        setSelectedDesignation={setSelectedDesignation}
        selectedGender={selectedGender}
        setSelectedGender={setSelectedGender}
        onClearFilters={handleClearFilters}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
      />

      <FacultyFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        schoolsList={schoolsList}
        institutionsList={institutionsList}
        imageFile={imageFile}
        setImageFile={setImageFile}
        subjects={subjects}
        setSubjects={setSubjects}
        educationDetails={educationDetails}
        setEducationDetails={setEducationDetails}
      />

      <InstitutionDeleteModal
        deleteConfirmId={deleteConfirmId}
        setDeleteConfirmId={setDeleteConfirmId}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default Faculty;
