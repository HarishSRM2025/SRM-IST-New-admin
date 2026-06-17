import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import InfrastructureTable from '../components/institution/InfrastructureTable';
import InfrastructureFormModal from '../components/institution/InfrastructureFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

export const institutionTabs = [
  { label: 'Institute Details', path: '/institution', end: true },
  { label: 'Institute Stats', path: '/institution/stats', end: false },
  { label: 'Dean Message', path: '/institution/dean-message', end: false },
  { label: 'Infrastructure', path: '/institution/infrastructure', end: false },
  { label: 'Gallery & Resources', path: '/institution/gallery-resource', end: false },
  { label: 'Events & Activities', path: '/institution/events-and-activities', end: false },
  { label: 'Programmes Offered', path: '/institution/programmes', end: false }
];

const Infrastructure = () => {
  const [dataList, setDataList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [formData, setFormData] = useState({
    institutionId: '',
    infraName: '',
    infraDesc: '',
    capacity: '',
    equipment: '', // String in frontend, parsed to array in backend
    infraImage: null,
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

      // Fetch Infrastructure
      const dataRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/infrastructure/getall`);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        if (dataJson.success && dataJson.data) {
          setDataList(Array.isArray(dataJson.data) ? dataJson.data : [dataJson.data]);
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
      setFormData(prev => ({ ...prev, infraImage: e.target.files[0] }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      // Convert equipment array to comma-separated string for editing
      const equipmentStr = Array.isArray(item.equipment) ? item.equipment.join(', ') : (item.equipment || '');
      
      setFormData({ 
        institutionId: item.institutionId || '', 
        infraName: item.infraName || '', 
        infraDesc: item.infraDesc || '', 
        capacity: item.capacity || '',
        equipment: equipmentStr,
        infraImage: null,
        existingImage: item.infraImage || '',
        _id: item._id 
      });
    } else {
      setFormData({ institutionId: '', infraName: '', infraDesc: '', capacity: '', equipment: '', infraImage: null, existingImage: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ institutionId: '', infraName: '', infraDesc: '', capacity: '', equipment: '', infraImage: null, existingImage: '' });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/institution/infrastructure/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/institution/infrastructure/create`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('institutionId', formData.institutionId);
      data.append('infraName', formData.infraName);
      data.append('infraDesc', formData.infraDesc);
      data.append('capacity', formData.capacity);
      
      // Convert comma-separated string to JSON array for backend
      const equipmentArray = formData.equipment
        .split(',')
        .map(item => item.trim())
        .filter(item => item !== '');
      data.append('equipment', JSON.stringify(equipmentArray));
      
      if (formData.infraImage) {
        data.append('infraImage', formData.infraImage);
      } else if (formData.existingImage) {
        data.append('infraImage', formData.existingImage); // Fallback for backend
      }

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        const json = await response.json();
        if (json.success) {
          setMessage({ type: 'success', text: 'Infrastructure saved successfully!' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/infrastructure/delete/${deleteConfirmId}`, {
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
      item.infraName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.infraDesc?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title="Infrastructure"
        subtitle="Manage infrastructure facilities, equipment, and capacities."
        buttonText="New Infrastructure"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={institutionTabs} />
      </div>

      <InfrastructureTable 
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

      <InfrastructureFormModal 
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

export default Infrastructure;
