import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import AccreditationTable from '../components/about/AccreditationTable';
import AccreditationFormModal from '../components/about/AccreditationFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

export const aboutTabs = [
  { label: 'Leadership', path: '/about/leadership', end: false },
  { label: 'Leaders In Home Page', path: '/about/leaders-in-home', end: false },
  { label: 'Academic Heads', path: '/about/academic-heads', end: false },
  { label: 'Administrative Heads', path: '/about/administrative-heads', end: false },
  { label: 'Accreditation', path: '/about', end: true },
  { label: 'Ranking', path: '/about/ranking', end: false }
];

const initialFormState = {
  title: '',
  description: '',
  image: null,
  existingImage: ''
};

const About = () => {
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState(initialFormState);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setFetching(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/about/accreditation/getall`);
      if (res.ok) {
        const json = await res.json();
        setDataList(Array.isArray(json) ? json : []);
      }
    } catch (error) {
      console.error("Error fetching accreditations:", error);
      setMessage({ type: 'error', text: 'Failed to load data. Ensure backend is running.' });
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

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] || null }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        title: item.title || '',
        description: item.description || '',
        image: null,
        existingImage: item.image || '',
        _id: item._id
      });
    } else {
      setFormData(initialFormState);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormState);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/about/accreditation/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/about/accreditation/add`;

      const method = formData._id ? 'PUT' : 'POST';

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      if (formData.image) {
        payload.append('image', formData.image);
      } else if (formData.existingImage) {
        payload.append('image', formData.existingImage);
      }

      const response = await fetch(url, {
        method,
        body: payload,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Accreditation saved successfully!' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/about/accreditation/delete/${deleteConfirmId}`, {
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

  const filteredDataList = dataList.filter(item =>
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="About"
        subtitle="Manage accreditations, rankings, and leadership information."
        buttonText="New Accreditation"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={aboutTabs} />
      </div>

      <AccreditationTable
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

      <AccreditationFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
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

export default About;
