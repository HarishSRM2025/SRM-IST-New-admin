import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import DeanMessageTable from '../components/institution/DeanMessageTable';
import DeanMessageFormModal from '../components/institution/DeanMessageFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const institutionTabs = [
  { label: 'Institute Details', path: '/institution', end: true },
  { label: 'Institute Stats', path: '/institution/stats', end: false },
  { label: 'Dean Message', path: '/institution/dean-message', end: false },
  { label: 'Infrastructure', path: '/institution/infrastructure', end: false },
  { label: 'Gallery & Resources', path: '/institution/gallery-resource', end: false },
  { label: 'Events & Activities', path: '/institution/events-and-activities', end: false },
  { label: 'Programmes Offered', path: '/institution/programmes', end: false }
];

const DeanMessage = () => {
  const [dataList, setDataList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [formData, setFormData] = useState({
    institutionId: '',
    deanName: '',
    message: '',
    deanImage: null,
    existingImage: ''
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
  const fetchData = async () => {
    setFetching(true);
    try {
      // Fetch Institutions for the dropdown
      const instRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/getall`);
      if (instRes.ok) {
        const instJson = await instRes.json();
        if (instJson.success && instJson.data) {
          setInstitutionsList(Array.isArray(instJson.data) ? instJson.data : [instJson.data]);
        }
      }

      // Fetch Dean Messages
      const msgRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/dean-message/getall`);
      if (msgRes.ok) {
        const msgJson = await msgRes.json();
        if (msgJson.success && msgJson.data) {
          setDataList(Array.isArray(msgJson.data) ? msgJson.data : [msgJson.data]);
        } else {
          setDataList([]);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      setMessage({ type: 'error', text: 'Failed to load data. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFormData(prev => ({ ...prev, deanImage: e.target.files[0] }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ 
        institutionId: item.institutionId || '', 
        deanName: item.deanName || '', 
        message: item.message || '', 
        deanImage: null,
        existingImage: item.deanImage || '',
        _id: item._id 
      });
    } else {
      setFormData({ institutionId: '', deanName: '', message: '', deanImage: null, existingImage: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ institutionId: '', deanName: '', message: '', deanImage: null, existingImage: '' });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/institution/dean-message/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/institution/dean-message/create`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('institutionId', formData.institutionId);
      data.append('deanName', formData.deanName);
      data.append('message', formData.message);
      if (formData.deanImage) {
        data.append('deanImage', formData.deanImage);
      } else if (formData.existingImage) {
        data.append('deanImage', formData.existingImage);
      }

      const response = await fetch(url, {
        method: method,
        body: data, // Using FormData instead of JSON
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setMessage({ type: 'success', text: 'Dean message saved successfully!' });
          await fetchData();
          
          setTimeout(() => {
            handleCloseModal();
          }, 1500);
        } else {
          setMessage({ type: 'error', text: json.message || 'Failed to save data. Please try again.' });
        }
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save data. Please try again.' });
      }
    } catch (error) {
      console.error("Error saving data:", error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/dean-message/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchData();
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

  const filteredDataList = dataList.filter(item => {
    const instName = institutionsList.find(i => i._id === item.institutionId)?.name || '';
    return (
      item.deanName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instName.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="Dean Messages"
        subtitle="Manage dean messages and images for institutions."
        buttonText="New Dean Message"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={institutionTabs} />
      </div>

      <DeanMessageTable 
        fetching={fetching}
        dataList={currentData}
        institutionsList={institutionsList}
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

      <DeanMessageFormModal 
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        institutionsList={institutionsList}
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

export default DeanMessage;
