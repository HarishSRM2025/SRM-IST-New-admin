import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import FacultyExperienceTable from '../components/faculty/FacultyExperienceTable';
import FacultyExperienceFormModal from '../components/faculty/FacultyExperienceFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const facultyTabs = [
  { label: 'Faculty Details', path: '/faculty', end: true },
  { label: 'Faculty Research', path: '/faculty/research', end: false },
  { label: 'Faculty Experience', path: '/faculty/experience', end: false },
];

const EMPTY_FORM = {
  facultyId: '',
  industryExperience: [],
};

const getFacultyId = (facultyId) => (
  typeof facultyId === 'object' && facultyId !== null ? facultyId._id : facultyId
);

const FacultyExperience = () => {
  const [dataList, setDataList] = useState([]);
  const [facultyList, setFacultyList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setFetching(true);
    try {
      const facRes = await fetch(`${import.meta.env.VITE_API_URL}/faculty/getfaculty`);
      if (facRes.ok) {
        const facJson = await facRes.json();
        setFacultyList(Array.isArray(facJson) ? facJson : facJson.data ? (Array.isArray(facJson.data) ? facJson.data : [facJson.data]) : []);
      }

      const schoolsRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/getall`);
      if (schoolsRes.ok) {
        const schoolsJson = await schoolsRes.json();
        setSchoolsList(Array.isArray(schoolsJson) ? schoolsJson : schoolsJson.data ? (Array.isArray(schoolsJson.data) ? schoolsJson.data : [schoolsJson.data]) : []);
      }

      const dataRes = await fetch(`${import.meta.env.VITE_API_URL}/faculty/getfacultyexperience`);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        setDataList(Array.isArray(dataJson) ? dataJson : dataJson.data ? (Array.isArray(dataJson.data) ? dataJson.data : [dataJson.data]) : []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load data. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => { fetchData(); }, []);
  useEffect(() => { setCurrentPage(1); }, [searchQuery]);

  const resetForm = () => setFormData({ ...EMPTY_FORM });

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        _id: item._id,
        facultyId: getFacultyId(item.facultyId) || '',
        industryExperience: item.industryExperience || [],
      });
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.facultyId) {
      setMessage({ type: 'error', text: 'Please select a faculty member.' });
      setLoading(false);
      return;
    }

    try {
      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/faculty/updatefacultyexperience/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/faculty/addfacultyexperience`;
      const method = formData._id ? 'PUT' : 'POST';
      const { _id, ...payload } = formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Experience saved successfully!' });
        await fetchData();
        setTimeout(() => handleCloseModal(), 1200);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save data.' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/faculty/deletefacultyexperience/${deleteConfirmId}`, { method: 'DELETE' });
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

  const filteredDataList = dataList.filter(item => {
    const facultyName = facultyList.find(faculty => faculty._id === getFacultyId(item.facultyId))?.facultyName || '';
    return facultyName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const totalItems = filteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredDataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <InstitutionHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Faculty Experience"
        subtitle="Manage faculty industry experience records."
        buttonText="New Experience"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={facultyTabs} />
      </div>

      <FacultyExperienceTable
        fetching={fetching}
        dataList={currentData}
        facultyList={facultyList}
        handleOpenModal={handleOpenModal}
        handleDelete={setDeleteConfirmId}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
      />

      <FacultyExperienceFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        facultyList={facultyList}
        schoolsList={schoolsList}
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

export default FacultyExperience;
