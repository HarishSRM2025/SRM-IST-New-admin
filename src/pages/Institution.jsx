import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import InstitutionTable from '../components/institution/InstitutionTable';
import InstitutionFormModal from '../components/institution/InstitutionFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import SubNav from '../components/common/SubNav';

const institutionTabs = [
  { label: 'Institute Details', path: '/institution', end: true },
  { label: 'Institute Stats', path: '/institution/stats', end: false },
  { label: 'Dean Message', path: '/institution/dean-message', end: false },
  { label: 'Infrastructure', path: '/institution/infrastructure', end: false },
  { label: 'Gallery & Resources', path: '/institution/gallery-resource', end: false },
  { label: 'Events & Activities', path: '/institution/events-and-activities', end: false },
  { label: 'Programmes Offered', path: '/institution/programmes', end: false }
];

const Institution = () => {
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    vision: '',
    mission: ''
  });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // Fetch initial data
  const fetchInstitutionData = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/getall`);
      if (response.ok) {
        const json = await response.json();
        if (json.success && json.data) {
          setDataList(Array.isArray(json.data) ? json.data : [json.data]);
        } else {
          setDataList([]);
        }
      }
    } catch (error) {
      console.error("Error fetching institution data:", error);
      setMessage({ type: 'error', text: 'Failed to load institution data. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchInstitutionData();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ name: item.name || '', vision: item.vision || '', mission: item.mission || '', _id: item._id });
    } else {
      setFormData({ name: '', vision: '', mission: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ name: '', vision: '', mission: '' });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/institution/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/institution/create`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          vision: formData.vision,
          mission: formData.mission
        }),
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setMessage({ type: 'success', text: 'Institution data saved successfully!' });
          await fetchInstitutionData(); // Refresh the table data
          
          // Close modal after short delay to show success message
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setMessage({ type: 'error', text: json.message || 'Failed to save data. Please try again.' });
        }
      } else {
        setMessage({ type: 'error', text: 'Failed to save data. Please try again.' });
      }
    } catch (error) {
      console.error("Error saving institution data:", error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchInstitutionData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || "Failed to delete.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => 
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.vision?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.mission?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={institutionTabs} />
      </div>

      <InstitutionTable 
        fetching={fetching}
        dataList={currentData}
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

      <InstitutionFormModal 
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

export default Institution;
