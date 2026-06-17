import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import InstituteStatsTable from '../components/institution/InstituteStatsTable';
import InstituteStatsFormModal from '../components/institution/InstituteStatsFormModal';
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

const blankForm = {
  instituteId: '',
  instituteStats: [{ name: '', value: '' }]
};

const InstituteStats = () => {
  const [dataList, setDataList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [formData, setFormData] = useState(blankForm);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const fetchData = async () => {
    setFetching(true);
    try {
      const instRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/getall`);
      if (instRes.ok) {
        const instJson = await instRes.json();
        if (instJson.success && instJson.data) {
          setInstitutionsList(Array.isArray(instJson.data) ? instJson.data : [instJson.data]);
        }
      }

      const statsRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/stats/getall`);
      if (statsRes.ok) {
        const statsJson = await statsRes.json();
        if (statsJson.success && statsJson.data) {
          setDataList(Array.isArray(statsJson.data) ? statsJson.data : [statsJson.data]);
        } else {
          setDataList([]);
        }
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
      setMessage({ type: 'error', text: 'Failed to load stats. Ensure backend is running.' });
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

  const handleStatChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      instituteStats: prev.instituteStats.map((stat, statIndex) => (
        statIndex === index ? { ...stat, [field]: value } : stat
      ))
    }));
  };

  const handleAddStat = () => {
    setFormData(prev => ({
      ...prev,
      instituteStats: [...prev.instituteStats, { name: '', value: '' }]
    }));
  };

  const handleRemoveStat = (index) => {
    setFormData(prev => ({
      ...prev,
      instituteStats: prev.instituteStats.filter((_, statIndex) => statIndex !== index)
    }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        instituteId: typeof item.instituteId === 'object' ? item.instituteId?._id || '' : item.instituteId || '',
        instituteStats: item.instituteStats?.length
          ? item.instituteStats.map(stat => ({ name: stat.name || '', value: stat.value ?? '' }))
          : [{ name: '', value: '' }],
        _id: item._id
      });
    } else {
      setFormData(blankForm);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(blankForm);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/institution/stats/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/institution/stats/create`;

      const response = await fetch(url, {
        method: formData._id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          instituteId: formData.instituteId,
          instituteStats: formData.instituteStats.map(stat => ({
            name: stat.name,
            value: Number(stat.value)
          }))
        })
      });

      const json = await response.json().catch(() => null);
      if (response.ok && json?.success) {
        setMessage({ type: 'success', text: 'Institute stats saved successfully!' });
        await fetchData();
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        setMessage({ type: 'error', text: json?.message || 'Failed to save stats. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving stats:', error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/stats/delete/${deleteConfirmId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || 'Failed to delete.');
      }
    } catch (error) {
      console.error('Error deleting stats:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const instituteId = typeof item.instituteId === 'object' ? item.instituteId?._id : item.instituteId;
    const instName = institutionsList.find(i => i._id === instituteId)?.name || '';
    const statsText = (item.instituteStats || []).map(stat => `${stat.name} ${stat.value}`).join(' ');
    const query = searchQuery.toLowerCase();

    return instName.toLowerCase().includes(query) || statsText.toLowerCase().includes(query);
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
        title="Institute Stats"
        subtitle="Manage public highlight numbers for each institution."
        buttonText="New Stats"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={institutionTabs} />
      </div>

      <InstituteStatsTable
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

      <InstituteStatsFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleStatChange={handleStatChange}
        handleAddStat={handleAddStat}
        handleRemoveStat={handleRemoveStat}
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

export default InstituteStats;
