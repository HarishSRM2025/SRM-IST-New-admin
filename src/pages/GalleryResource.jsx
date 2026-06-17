import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import GalleryResourceTable from '../components/institution/GalleryResourceTable';
import GalleryResourceFormModal from '../components/institution/GalleryResourceFormModal';
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

const GalleryResource = () => {
  const [dataList, setDataList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [formData, setFormData] = useState({
    institutionId: '',
    title: '',
    description: '',
    galleryType: '',
    videoLink: '',
    galleryImage: null,
    existingImage: '',
    pdfFile: null,
    existingPdf: ''
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

      // Fetch Gallery & Resources
      const dataRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/gallery-resource/getall`);
      if (dataRes.ok) {
        const dataJson = await dataRes.json();
        setDataList(Array.isArray(dataJson) ? dataJson : []);
      } else {
        setDataList([]);
      }
    } catch (error) {
      console.error("Error fetching gallery/resource data:", error);
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
        institutionId: item.institutionId?._id || item.institutionId || '',
        title: item.title || '',
        description: item.description || '',
        galleryType: item.galleryType || '',
        videoLink: item.videoLink || '',
        galleryImage: null,
        existingImage: item.galleryImage || '',
        pdfFile: null,
        existingPdf: item.pdfFile || '',
        _id: item._id
      });
    } else {
      setFormData({
        institutionId: '',
        title: '',
        description: '',
        galleryType: '',
        videoLink: '',
        galleryImage: null,
        existingImage: '',
        pdfFile: null,
        existingPdf: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({
      institutionId: '',
      title: '',
      description: '',
      galleryType: '',
      videoLink: '',
      galleryImage: null,
      existingImage: '',
      pdfFile: null,
      existingPdf: ''
    });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/institution/gallery-resource/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/institution/gallery-resource/create`;
      
      const method = formData._id ? 'PUT' : 'POST';

      const data = new FormData();
      data.append('institutionId', formData.institutionId);
      data.append('title', formData.title);
      data.append('description', formData.description);
      data.append('galleryType', formData.galleryType);

      if (formData.galleryType === 'videos') {
        data.append('videoLink', formData.videoLink);
      } else {
        data.append('videoLink', '');
      }

      if (formData.galleryType === 'photos') {
        if (formData.galleryImage) {
          data.append('galleryImage', formData.galleryImage);
        } else if (formData.existingImage) {
          data.append('galleryImage', formData.existingImage);
        }
      }

      if (formData.galleryType === 'downloads' || formData.galleryType === 'reports') {
        if (formData.pdfFile) {
          data.append('pdfFile', formData.pdfFile);
        } else if (formData.existingPdf) {
          data.append('pdfFile', formData.existingPdf);
        }
      }

      const response = await fetch(url, {
        method: method,
        body: data,
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Resource saved successfully!' });
        await fetchData();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save data. Please try again.' });
      }
    } catch (error) {
      console.error("Error saving resource:", error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/gallery-resource/delete/${deleteConfirmId}`, {
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
      console.error("Error deleting resource:", error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const instName = institutionsList.find(i => i._id === (item.institutionId?._id || item.institutionId))?.name || '';
    return (
      item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.galleryType?.toLowerCase().includes(searchQuery.toLowerCase()) ||
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
        title="Gallery & Resources"
        subtitle="Manage campus photos, video links, downloads, and reports."
        buttonText="New Resource"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={institutionTabs} />
      </div>

      <GalleryResourceTable 
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

      <GalleryResourceFormModal 
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
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

export default GalleryResource;
