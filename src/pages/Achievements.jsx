import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import AchievementsTable from '../components/schools/AchievementsTable';
import AchievementsFormModal from '../components/schools/AchievementsFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const schoolTabs = [
  { label: 'School Details', path: '/schools', end: true },
  { label: 'HOD Message', path: '/schools/hod-message', end: false },
  { label: 'Programmes', path: '/schools/programmes', end: false },
  { label: 'Achievements', path: '/schools/achievements', end: false },
  { label: 'Events & Activities', path: '/schools/events-and-activities', end: false }
];

const Achievements = () => {
  const [dataList, setDataList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [formData, setFormData] = useState({
    school: '',
    title: '',
    description: '',
    achievementDate: '',
    achieverName: '',
    achievementType: 'inter-school',
    achievementCategory: 'academic',
    awardOrRecognition: '',
    achieverDesignation: 'student',
    status: 'active',
    achievementImage: null,
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
  const itemsPerPage = 10;

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

      // Fetch Achievements
      const achievementsRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/achievements/getall`);
      if (achievementsRes.ok) {
        const achievementsJson = await achievementsRes.json();
        if (Array.isArray(achievementsJson)) {
          setDataList(achievementsJson);
        } else if (achievementsJson.data) {
          setDataList(Array.isArray(achievementsJson.data) ? achievementsJson.data : [achievementsJson.data]);
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
      setFormData(prev => ({ ...prev, achievementImage: e.target.files[0] }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const schoolId = typeof item.school === 'object' ? item.school?._id : item.school;
      setFormData({ 
        school: schoolId || '', 
        title: item.title || '', 
        description: item.description || '', 
        achievementDate: item.achievementDate || '',
        achieverName: item.achieverName || '',
        achievementType: item.achievementType || 'inter-school',
        achievementCategory: item.achievementCategory || 'academic',
        awardOrRecognition: item.awardOrRecognition || '',
        achieverDesignation: item.achieverDesignation || 'student',
        status: item.status || 'active',
        achievementImage: null,
        existingImage: item.achievementImage || '',
        _id: item._id 
      });
    } else {
      setFormData({ 
        school: '', 
        title: '', 
        description: '', 
        achievementDate: '',
        achieverName: '',
        achievementType: 'inter-school',
        achievementCategory: 'academic',
        awardOrRecognition: '',
        achieverDesignation: 'student',
        status: 'active',
        achievementImage: null,
        existingImage: '' 
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      school: '', 
      title: '', 
      description: '', 
      achievementDate: '',
      achieverName: '',
      achievementType: 'inter-school',
      achievementCategory: 'academic',
      awardOrRecognition: '',
      achieverDesignation: 'student',
      status: 'active',
      achievementImage: null,
      existingImage: '' 
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/schools/achievements/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/schools/achievements/add`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('school', formData.school);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('achievementDate', formData.achievementDate);
      data.append('achieverName', formData.achieverName);
      data.append('achievementType', formData.achievementType);
      data.append('achievementCategory', formData.achievementCategory);
      data.append('awardOrRecognition', formData.awardOrRecognition);
      data.append('achieverDesignation', formData.achieverDesignation);
      data.append('status', formData.status);
      
      if (formData.achievementImage) {
        data.append('achievementImage', formData.achievementImage);
      } else if (formData.existingImage) {
        data.append('achievementImage', formData.existingImage);
      }

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Achievement saved successfully!' });
        await fetchData();
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save achievement. Please try again.' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schools/achievements/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || "Failed to delete achievement.");
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
    const schoolName = schoolsList.find(s => s._id === schoolId)?.name || (typeof item.school === 'object' ? item.school?.name : '') || '';
    
    return (
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.achieverName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.achievementType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.achievementCategory?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.awardOrRecognition?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title="Achievements"
        subtitle="Manage student and faculty accomplishments for academic Schools."
        buttonText="New Achievement"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={schoolTabs} />
      </div>

      <AchievementsTable 
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

      <AchievementsFormModal 
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

export default Achievements;
