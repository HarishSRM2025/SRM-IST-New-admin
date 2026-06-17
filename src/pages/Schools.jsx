import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import SchoolsTable from '../components/schools/SchoolsTable';
import SchoolsFormModal from '../components/schools/SchoolsFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const schoolTabs = [
  { label: 'School Details', path: '/schools', end: true },
  { label: 'HOD Message', path: '/schools/hod-message', end: false },
  { label: 'Programmes', path: '/schools/programmes', end: false },
  { label: 'Achievements', path: '/schools/achievements', end: false },
  { label: 'Events & Activities', path: '/schools/events-and-activities', end: false }
];

const Schools = () => {
  const [dataList, setDataList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [formData, setFormData] = useState({
    institutionId: '',
    name: '',
    slug: '',
    about: ''
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
      // Fetch Institutions for the dropdown
      const instRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/getall`);
      if (instRes.ok) {
        const instJson = await instRes.json();
        if (instJson.success && instJson.data) {
          setInstitutionsList(Array.isArray(instJson.data) ? instJson.data : [instJson.data]);
        }
      }

      // Fetch Schools
      const dataRes = await fetch(`${import.meta.env.VITE_API_URL}/schools/getall`);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        // The schools API just returns the array directly, not inside a { success: true, data: [...] } wrapper based on the controller we reviewed
        if (Array.isArray(dataJson)) {
            setDataList(dataJson);
        } else if (dataJson.data) {
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

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({ 
        institutionId: item.institutionId || '', 
        name: item.name || '', 
        slug: item.slug || '', 
        about: item.about || '',
        _id: item._id 
      });
    } else {
      setFormData({ institutionId: '', name: '', slug: '', about: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ institutionId: '', name: '', slug: '', about: '' });
    setMessage({ type: '', text: '' });
  };

  // Helper to generate a slug from the name
  const generateSlug = (name) => {
      return name.toString().toLowerCase()
        .replace(/\s+/g, '-')           // Replace spaces with -
        .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
        .replace(/\-\-+/g, '-')         // Replace multiple - with single -
        .replace(/^-+/, '')             // Trim - from start of text
        .replace(/-+$/, '');            // Trim - from end of text
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/schools/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/schools/create`;
      
      const method = formData._id ? 'PUT' : 'POST';

      // Auto-generate slug if not provided
      const submissionData = { ...formData };
      if (!submissionData.slug || submissionData.slug.trim() === '') {
          submissionData.slug = generateSlug(submissionData.name);
      }

      const response = await fetch(url, {
        method: method,
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (response.ok) {
        // Backend controllers return raw json, not {success: true} for schools API
        setMessage({ type: 'success', text: 'School saved successfully!' });
        await fetchData();
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/schools/delete/${deleteConfirmId}`, {
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
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.slug?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
      {/* Reusing InstitutionHeader as it is generic enough for search & add button */}
      <InstitutionHeader 
        handleOpenModal={handleOpenModal} 
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Schools"
        subtitle="Manage schools and their details across institutions."
        buttonText="New School"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={schoolTabs} />
      </div>

      <SchoolsTable 
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

      <SchoolsFormModal 
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
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

export default Schools;
