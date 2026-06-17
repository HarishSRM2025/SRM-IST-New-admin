import React, { useEffect, useState } from 'react';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import ResearchStudentMembersFormModal from '../components/research/ResearchStudentMembersFormModal';
import ResearchStudentMembersTable from '../components/research/ResearchStudentMembersTable';

const researchTabs = [
  { label: 'Center of Research', path: '/research', end: true },
  { label: 'Research Faculty Members', path: '/research/faculty-members', end: true },
  { label: 'Research Student Members', path: '/research/student-members', end: true },
];

const initialFormData = {
  researchCenterId: '',
  studentName: '',
};

const getCleanId = (val) => (
  typeof val === 'object' && val !== null ? val._id : val
);

const ResearchStudentMembers = () => {
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [researchCenters, setResearchCenters] = useState([]);

  // Fetch research centers for dropdown & name resolution
  const fetchResearchCenters = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research`);
      if (response.ok) {
        const json = await response.json();
        setResearchCenters(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error('Error fetching research centers:', error);
    }
  };

  // Fetch student members
  const fetchStudentMembers = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research/student-members`);
      if (response.ok) {
        const json = await response.json();
        setDataList(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error('Error fetching research student members:', error);
      setMessage({ type: 'error', text: 'Failed to load research student members. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchResearchCenters();
    fetchStudentMembers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        researchCenterId: getCleanId(item.researchCenterId) || '',
        studentName: item.studentName || '',
        _id: item._id,
      });
    } else {
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/research/student-members/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/research/student-members`;
      const method = formData._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchCenterId: formData.researchCenterId,
          studentName: formData.studentName,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Student member saved successfully!' });
        await fetchStudentMembers();
        setTimeout(() => {
          handleCloseModal();
        }, 1200);
      } else {
        const json = await response.json().catch(() => null);
        setMessage({ type: 'error', text: json?.message || 'Failed to save. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving student member:', error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research/student-members/${deleteConfirmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchStudentMembers();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json().catch(() => null);
        alert(json?.message || 'Failed to delete student member.');
      }
    } catch (error) {
      console.error('Error deleting student member:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered data
  const filteredDataList = dataList.filter(item => {
    const center = researchCenters.find(c => c._id === getCleanId(item.researchCenterId));
    const centerName = center?.centerName || '';
    const studentName = item.studentName || '';

    return centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      studentName.toLowerCase().includes(searchQuery.toLowerCase());
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
        title="Research Student Members"
        subtitle="Add student members to research centers and manage their details."
        buttonText="Add Student Member"
        breadcrumbSection="Research Student Members"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={researchTabs} />
      </div>

      <ResearchStudentMembersTable
        fetching={fetching}
        dataList={currentData}
        researchCenters={researchCenters}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      />

      <ResearchStudentMembersFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        researchCenters={researchCenters}
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

export default ResearchStudentMembers;
