import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import LeadershipTable from '../components/about/LeadershipTable';
import LeadershipFormModal from '../components/about/LeadershipFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import { aboutTabs } from './About';

const initialFormState = {
  name: '',
  role: '',
  leadershipMessage: '',
  category: '',
  image: null,
  existingImage: '',
  displayInHome: false,
  order: 0
};

/**
 * Shared driver for the four "Leadership" admin tabs (Leaders In Home,
 * Academic Heads, Administrative Heads, Leadership Message). They all
 * read/write the same `leadership` collection, scoped via query params.
 *
 * - lockedCategory: when set, every record created/edited here is forced to
 *   this category, and the dropdown is replaced with a disabled field.
 * - homeOnly: when true, fetches only displayInHome=true records, regardless
 *   of category (used by "Leaders In Home" which can mix any category).
 * - title/subtitle/buttonText: header copy for this tab.
 */
const LeadershipBasePage = ({
  lockedCategory = null,
  homeOnly = false,
  title = 'About',
  subtitle = 'Manage leadership information.',
  buttonText = 'New Entry',
  showCategoryColumn = true
}) => {
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

  const buildFetchUrl = () => {
    const base = `${import.meta.env.VITE_API_URL}/about/leadership/getall`;
    const params = new URLSearchParams();
    if (homeOnly) {
      params.append('displayInHome', 'true');
    } else if (lockedCategory) {
      params.append('category', lockedCategory);
    }
    const qs = params.toString();
    return qs ? `${base}?${qs}` : base;
  };

  const fetchData = async () => {
    setFetching(true);
    try {
      const res = await fetch(buildFetchUrl());
      if (res.ok) {
        const json = await res.json();
        setDataList(Array.isArray(json) ? json : []);
      }
    } catch (error) {
      console.error("Error fetching leadership entries:", error);
      setMessage({ type: 'error', text: 'Failed to load data. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lockedCategory, homeOnly]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, image: e.target.files[0] || null }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        name: item.name || '',
        role: item.role || '',
        leadershipMessage: item.leadershipMessage || '',
        category: item.category || lockedCategory || '',
        image: null,
        existingImage: item.image || '',
        displayInHome: !!item.displayInHome,
        order: item.order ?? 0,
        _id: item._id
      });
    } else {
      setFormData({
        ...initialFormState,
        category: lockedCategory || '',
        // When adding from the "Leaders In Home" tab directly, default the
        // toggle on so the new entry actually shows up in that list.
        displayInHome: homeOnly ? true : false
      });
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
        ? `${import.meta.env.VITE_API_URL}/about/leadership/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/about/leadership/add`;

      const method = formData._id ? 'PUT' : 'POST';

      const payload = new FormData();
      payload.append('name', formData.name);
      payload.append('role', formData.role);
      payload.append('leadershipMessage', formData.leadershipMessage);
      payload.append('category', lockedCategory || formData.category);
      payload.append('displayInHome', formData.displayInHome ? 'true' : 'false');
      payload.append('order', formData.order ?? 0);
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
        setMessage({ type: 'success', text: 'Entry saved successfully!' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/about/leadership/delete/${deleteConfirmId}`, {
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
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.role?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.category?.toLowerCase().includes(searchQuery.toLowerCase())
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
        title={title}
        subtitle={subtitle}
        buttonText={buttonText}
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={aboutTabs} />
      </div>

      <LeadershipTable
        fetching={fetching}
        dataList={currentData}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        showCategoryColumn={showCategoryColumn}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
      />

      <LeadershipFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        lockedCategory={lockedCategory}
        showDisplayInHome={true}
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

export default LeadershipBasePage;
