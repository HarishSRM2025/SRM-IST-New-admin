import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import HODMessageTable from '../components/schools/HODMessageTable';
import HODMessageFormModal from '../components/schools/HODMessageFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const schoolTabs = [
  { label: 'School Details', path: '/schools', end: true },
  { label: 'HOD Message', path: '/schools/hod-message', end: false },
  { label: 'Programmes', path: '/schools/programmes', end: false },
  { label: 'Achievements', path: '/schools/achievements', end: false },
  { label: 'Events & Activities', path: '/schools/events-and-activities', end: false }
];

const HODMessage = () => {
  const [dataList, setDataList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [formData, setFormData] = useState({
    school: '',
    hodName: '',
    hodDesignation: '',
    message: '',
    hodImage: null,
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
      // Fetch Schools for the dropdown list
      const schoolRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/getall`);
      if (schoolRes.ok) {
        const schoolJson = await schoolRes.json();
        if (Array.isArray(schoolJson)) {
          setSchoolsList(schoolJson);
        } else if (schoolJson.data) {
          setSchoolsList(Array.isArray(schoolJson.data) ? schoolJson.data : [schoolJson.data]);
        }
      }

      // Fetch HOD Messages
      const msgRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/hod-message/getall`);
      if (msgRes.ok) {
        const msgJson = await msgRes.json();
        if (Array.isArray(msgJson)) {
          setDataList(msgJson);
        } else if (msgJson.data) {
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
      setFormData(prev => ({ ...prev, hodImage: e.target.files[0] }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const schoolId = typeof item.school === 'object' ? item.school?._id : item.school;
      setFormData({ 
        school: schoolId || '', 
        hodName: item.hodName || '', 
        hodDesignation: item.hodDesignation || '', 
        message: item.message || '',
        hodImage: null,
        existingImage: item.hodImage || '',
        _id: item._id 
      });
    } else {
      setFormData({ school: '', hodName: '', hodDesignation: '', message: '', hodImage: null, existingImage: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ school: '', hodName: '', hodDesignation: '', message: '', hodImage: null, existingImage: '' });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/schools/hod-message/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/schools/hod-message/add`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('school', formData.school);
      data.append('hodName', formData.hodName);
      data.append('hodDesignation', formData.hodDesignation);
      data.append('message', formData.message);
      
      if (formData.hodImage) {
        data.append('hodImage', formData.hodImage);
      } else if (formData.existingImage) {
        data.append('hodImage', formData.existingImage);
      }

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'HOD message saved successfully!' });
        await fetchData();
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save HOD message. Please try again.' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schools/hod-message/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || "Failed to delete HOD message.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const schoolId = typeof item.school === 'object' ? item.school?._id : item.school;
    const schoolName = schoolsList.find(s => s._id === schoolId)?.name || item.school?.name || '';
    return (
      item.hodName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.hodDesignation?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.message?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      schoolName.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="HOD Messages"
        subtitle="Manage welcome messages and details for School Heads of Department."
        buttonText="New HOD Message"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={schoolTabs} />
      </div>

      <HODMessageTable 
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

      <HODMessageFormModal 
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
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

export default HODMessage;
