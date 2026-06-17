import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import EventsAndActivitiesTable from '../components/schools/EventsAndActivitiesTable';
import EventsAndActivitiesFormModal from '../components/schools/EventsAndActivitiesFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const schoolTabs = [
  { label: 'School Details', path: '/schools', end: true },
  { label: 'HOD Message', path: '/schools/hod-message', end: false },
  { label: 'Programmes', path: '/schools/programmes', end: false },
  { label: 'Achievements', path: '/schools/achievements', end: false },
  { label: 'Events & Activities', path: '/schools/events-and-activities', end: false }
];

const EventsAndActivities = () => {
  const [dataList, setDataList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [formData, setFormData] = useState({
    school: '',
    name: '',
    description: '',
    eventDateTime: '',
    location: '',
    type: 'competition',
    conductedBy: '',
    co_ordinator: '',
    resourcePerson: '',
    resourcePersonDesignation: '',
    status: 'upcoming',
    announcement: false,
    eventImage: null,
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

      // Fetch Events and Activities
      const eventsRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/events-and-activities/getall`);
      if (eventsRes.ok) {
        const eventsJson = await eventsRes.json();
        if (Array.isArray(eventsJson)) {
          setDataList(eventsJson);
        } else if (eventsJson.data) {
          setDataList(Array.isArray(eventsJson.data) ? eventsJson.data : [eventsJson.data]);
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      // Store an array of selected files
      setFormData(prev => ({ ...prev, eventImage: Array.from(e.target.files) }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const schoolId = typeof item.school === 'object' ? item.school?._id : item.school;
        setFormData({ 
          school: schoolId || '', 
          name: item.name || '', 
          description: item.description || '', 
          eventDateTime: item.eventDateTime || '',
          location: item.location || '',
          type: item.type || 'competition',
          conductedBy: item.conductedBy || '',
          co_ordinator: item.co_ordinator || '',
          resourcePerson: item.resourcePerson || '',
          resourcePersonDesignation: item.resourcePersonDesignation || '',
          status: item.status || 'upcoming',
          announcement: Boolean(item.announcement),
          eventImage: [],
          existingImage: Array.isArray(item.eventImage) ? item.eventImage : (item.eventImage ? [item.eventImage] : []),
          _id: item._id 
        });
    } else {
        setFormData({ 
          school: '', 
          name: '', 
          description: '', 
          eventDateTime: '', 
          location: '', 
          type: 'competition', 
          conductedBy: '', 
          co_ordinator: '', 
          resourcePerson: '', 
          resourcePersonDesignation: '', 
          status: 'upcoming', 
          announcement: false,
          eventImage: [], 
          existingImage: [], 
          // _id omitted for new record
        });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ 
      school: '', 
      name: '', 
      description: '', 
      eventDateTime: '', 
      location: '', 
      type: 'competition', 
      conductedBy: '', 
      co_ordinator: '', 
      resourcePerson: '', 
      resourcePersonDesignation: '', 
      status: 'upcoming', 
      announcement: false,
      eventImage: null, 
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
        ? `${import.meta.env.VITE_API_URL}/schools/events-and-activities/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/schools/events-and-activities/add`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('school', formData.school);
      data.append('name', formData.name);
      data.append('description', formData.description);
      data.append('eventDateTime', formData.eventDateTime);
      data.append('location', formData.location);
      data.append('type', formData.type);
      data.append('conductedBy', formData.conductedBy);
      data.append('co_ordinator', formData.co_ordinator);
      data.append('resourcePerson', formData.resourcePerson);
      data.append('resourcePersonDesignation', formData.resourcePersonDesignation);
      data.append('status', formData.status);
      data.append('announcement', formData.announcement);
      
      // Append multiple selected images if any
      if (formData.eventImage && formData.eventImage.length > 0) {
        formData.eventImage.forEach((file) => {
          data.append('eventImage', file);
        });
      } else if (formData.existingImage && formData.existingImage.length > 0) {
        // Append existing images (filenames) to retain them if not changed
        formData.existingImage.forEach((img) => {
          data.append('eventImage', img);
        });
      }

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Record saved successfully!' });
        await fetchData();
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save record. Please try again.' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schools/events-and-activities/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || "Failed to delete record.");
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
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.status?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title="Events & Activities"
        subtitle="Manage academic events and extracurricular activities for academic Schools."
        buttonText="New Record"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={schoolTabs} />
      </div>

      <EventsAndActivitiesTable 
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

      <EventsAndActivitiesFormModal 
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

export default EventsAndActivities;
