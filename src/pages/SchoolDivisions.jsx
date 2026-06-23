import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import SchoolDivisionsTable from '../components/schools/SchoolDivisionsTable';
import SchoolDivisionsFormModal from '../components/schools/SchoolDivisionsFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const divisionTabs = [
  { label: 'Division Details', path: '/school-divisions', end: true },
  { label: 'HOD Message', path: '/school-divisions/hod-message', end: false },
  { label: 'Programmes', path: '/school-divisions/programmes', end: false },
  { label: 'Achievements', path: '/school-divisions/achievements', end: false },
  { label: 'Events & Activities', path: '/school-divisions/events-and-activities', end: false }
];

const blankForm = {
  schoolId: '',
  name: '',
  slug: '',
  about: ''
};

const SchoolDivisions = () => {
  const [dataList, setDataList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [formData, setFormData] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const toArray = (json) => Array.isArray(json) ? json : (json?.data ? (Array.isArray(json.data) ? json.data : [json.data]) : []);

  const fetchData = async () => {
    setFetching(true);
    try {
      const schoolsRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/getall`);
      if (schoolsRes.ok) {
        setSchoolsList(toArray(await schoolsRes.json()));
      }

      const divisionsRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/getall`);
      if (divisionsRes.ok) {
        setDataList(toArray(await divisionsRes.json()));
      } else {
        setDataList([]);
      }
    } catch (error) {
      console.error('Error fetching school divisions:', error);
      setMessage({ type: 'error', text: 'Failed to load school divisions. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const generateSlug = (name) => name.toString().toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        schoolId: typeof item.schoolId === 'object' ? item.schoolId?._id || '' : item.schoolId || '',
        name: item.name || '',
        slug: item.slug || '',
        about: item.about || '',
        _id: item._id
      });
    } else {
      setFormData(blankForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(blankForm);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const submissionData = {
        ...formData,
        slug: formData.slug?.trim() ? formData.slug : generateSlug(formData.name)
      };

      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/school-division/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/school-division/add`;

      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData)
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'School division saved successfully!' });
        await fetchData();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save division. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving school division:', error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/school-division/delete/${deleteConfirmId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || 'Failed to delete.');
      }
    } catch (error) {
      console.error('Error deleting school division:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const schoolId = typeof item.schoolId === 'object' ? item.schoolId?._id : item.schoolId;
    const schoolName = schoolsList.find(s => s._id === schoolId)?.name || '';
    const query = searchQuery.toLowerCase();

    return (
      item.name?.toLowerCase().includes(query) ||
      item.slug?.toLowerCase().includes(query) ||
      item.about?.toLowerCase().includes(query) ||
      schoolName.toLowerCase().includes(query)
    );
  });

  const totalItems = filteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredDataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <InstitutionHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="School Divisions"
        subtitle="Manage departments and divisions under each school."
        buttonText="New Division"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={divisionTabs} />
      </div>

      <SchoolDivisionsTable
        fetching={fetching}
        dataList={currentData}
        schoolsList={schoolsList}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
      />

      <SchoolDivisionsFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
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

export default SchoolDivisions;
