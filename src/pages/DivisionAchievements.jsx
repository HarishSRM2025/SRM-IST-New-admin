import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import AchievementsTable from '../components/schools/AchievementsTable';
import AchievementsFormModal from '../components/schools/AchievementsFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const divisionTabs = [
  { label: 'Division Details', path: '/school-divisions', end: true },
  { label: 'HOD Message', path: '/school-divisions/hod-message', end: false },
  { label: 'Achievements', path: '/school-divisions/achievements', end: false },
  { label: 'Events & Activities', path: '/school-divisions/events-and-activities', end: false }
];

const initialFormData = {
  schoolDivisionId: '',
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
};

const DivisionAchievements = () => {
  const [dataList, setDataList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [formData, setFormData] = useState(initialFormData);
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
      const divisionsRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/getall`);
      if (divisionsRes.ok) {
        const divisionsJson = await divisionsRes.json();
        setDivisionsList(Array.isArray(divisionsJson) ? divisionsJson : (divisionsJson.data || []));
      }
      const achievementsRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/achievements/getall`);
      if (achievementsRes.ok) {
        const achievementsJson = await achievementsRes.json();
        setDataList(Array.isArray(achievementsJson) ? achievementsJson : (achievementsJson.data || []));
      }
    } catch (error) {
      console.error('Error fetching division achievements:', error);
      setMessage({ type: 'error', text: 'Failed to load division achievements.' });
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
    if (e.target.files?.[0]) setFormData(prev => ({ ...prev, achievementImage: e.target.files[0] }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const schoolDivisionId = typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?._id : item.schoolDivisionId;
      setFormData({
        ...initialFormData,
        ...item,
        schoolDivisionId: schoolDivisionId || '',
        achievementImage: null,
        existingImage: item.achievementImage || '',
        _id: item._id
      });
    } else {
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData(initialFormData);
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id
        ? `${import.meta.env.VITE_API_URL}/school-division/achievements/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/school-division/achievements/create`;
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (['_id', 'achievementImage', 'existingImage'].includes(key)) return;
        data.append(key, value);
      });
      if (formData.achievementImage) data.append('achievementImage', formData.achievementImage);
      else if (formData.existingImage) data.append('achievementImage', formData.existingImage);

      const response = await fetch(url, { method: formData._id ? 'PUT' : 'POST', body: data });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to save division achievement.');
      }
      setMessage({ type: 'success', text: 'Division achievement saved successfully!' });
      await fetchData();
      setTimeout(handleCloseModal, 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/school-division/achievements/delete/${deleteConfirmId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const divisionId = typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?._id : item.schoolDivisionId;
    const divisionName = divisionsList.find(d => d._id === divisionId)?.name || item.schoolDivisionId?.name || '';
    const query = searchQuery.toLowerCase();
    return item.title?.toLowerCase().includes(query) ||
      item.achieverName?.toLowerCase().includes(query) ||
      item.achievementType?.toLowerCase().includes(query) ||
      item.achievementCategory?.toLowerCase().includes(query) ||
      item.awardOrRecognition?.toLowerCase().includes(query) ||
      divisionName.toLowerCase().includes(query);
  });

  const totalItems = filteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredDataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <InstitutionHeader handleOpenModal={handleOpenModal} searchQuery={searchQuery} setSearchQuery={setSearchQuery} title="Division Achievements" subtitle="Manage achievements for school divisions." buttonText="New Division Achievement" />
      <div style={{ margin: '0 -32px' }}><SubNav tabs={divisionTabs} /></div>
      <AchievementsTable fetching={fetching} dataList={currentData} schoolsList={divisionsList} handleOpenModal={handleOpenModal} handleDelete={setDeleteConfirmId} pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }} entityField="schoolDivisionId" entityLabel="Division" />
      <AchievementsFormModal isModalOpen={isModalOpen} handleCloseModal={handleCloseModal} formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} handleSubmit={handleSubmit} loading={loading} message={message} schoolsList={divisionsList} entityField="schoolDivisionId" entityLabel="Division" />
      <InstitutionDeleteModal deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} confirmDelete={confirmDelete} isDeleting={isDeleting} />
    </div>
  );
};

export default DivisionAchievements;
