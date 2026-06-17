import React, { useEffect, useState } from 'react';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import ResearchCenterFormModal from '../components/research/ResearchCenterFormModal';
import ResearchCenterTable from '../components/research/ResearchCenterTable';

const researchTabs = [
  { label: 'Center of Research', path: '/research', end: true },
  { label: 'Research Faculty Members', path: '/research/faculty-members', end: true },
  { label: 'Research Student Members', path: '/research/student-members', end: true },
];

const initialFormData = {
  centerName: '',
  centerMission: '',
  centerRolesResponsibility: '',
  publicationAndProjectOutcomes: '',
  studentTrainingAndDevelopment: '',
};

const ResearchCenter = () => {
  // Centers state
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

  // Fetch research centers
  const fetchResearchCenters = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research`);
      if (response.ok) {
        const json = await response.json();
        setDataList(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error('Error fetching research centers:', error);
      setMessage({ type: 'error', text: 'Failed to load research centers. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchResearchCenters();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Centers handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        centerName: item.centerName || '',
        centerMission: item.centerMission || '',
        centerRolesResponsibility: item.centerRolesResponsibility || '',
        publicationAndProjectOutcomes: item.publicationAndProjectOutcomes || '',
        studentTrainingAndDevelopment: item.studentTrainingAndDevelopment || '',
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
        ? `${import.meta.env.VITE_API_URL}/research/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/research`;
      const method = formData._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          centerName: formData.centerName,
          centerMission: formData.centerMission,
          centerRolesResponsibility: formData.centerRolesResponsibility,
          publicationAndProjectOutcomes: formData.publicationAndProjectOutcomes,
          studentTrainingAndDevelopment: formData.studentTrainingAndDevelopment,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Research center saved successfully!' });
        await fetchResearchCenters();
        setTimeout(() => {
          handleCloseModal();
        }, 1200);
      } else {
        const json = await response.json().catch(() => null);
        setMessage({ type: 'error', text: json?.message || 'Failed to save research center. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving research center:', error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research/${deleteConfirmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchResearchCenters();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json().catch(() => null);
        alert(json?.message || 'Failed to delete research center.');
      }
    } catch (error) {
      console.error('Error deleting research center:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered data for centers
  const filteredDataList = dataList.filter(item => (
    item.centerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.centerMission?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.centerRolesResponsibility?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.publicationAndProjectOutcomes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.studentTrainingAndDevelopment?.toLowerCase().includes(searchQuery.toLowerCase())
  ));

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
        title="Center of Research"
        subtitle="Manage research centers, missions, responsibilities, outcomes, and student development details."
        buttonText="New Research Center"
        breadcrumbSection="Research"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={researchTabs} />
      </div>

      <ResearchCenterTable
        fetching={fetching}
        dataList={currentData}
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

      <ResearchCenterFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
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

export default ResearchCenter;
