import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import HODMessageTable from '../components/schools/HODMessageTable';
import HODMessageFormModal from '../components/schools/HODMessageFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const divisionTabs = [
  { label: 'Division Details', path: '/school-divisions', end: true },
  { label: 'HOD Message', path: '/school-divisions/hod-message', end: false },
  { label: 'Programmes', path: '/school-divisions/programmes', end: false },
  { label: 'Achievements', path: '/school-divisions/achievements', end: false },
  { label: 'Events & Activities', path: '/school-divisions/events-and-activities', end: false }
];

const initialFormData = {
  schoolDivisionId: '',
  hodName: '',
  hodDesignation: '',
  message: '',
  hodImage: null,
  existingImage: ''
};

const DivisionHODMessage = () => {
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
  const itemsPerPage = 5;

  const fetchData = async () => {
    setFetching(true);
    try {
      const divisionsRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/getall`);
      if (divisionsRes.ok) {
        const divisionsJson = await divisionsRes.json();
        setDivisionsList(Array.isArray(divisionsJson) ? divisionsJson : (divisionsJson.data || []));
      }

      const msgRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/hod-message/getall`);
      if (msgRes.ok) {
        const msgJson = await msgRes.json();
        setDataList(Array.isArray(msgJson) ? msgJson : (msgJson.data || []));
      }
    } catch (error) {
      console.error('Error fetching division HOD messages:', error);
      setMessage({ type: 'error', text: 'Failed to load division HOD messages.' });
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
    if (e.target.files?.[0]) setFormData(prev => ({ ...prev, hodImage: e.target.files[0] }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const schoolDivisionId = typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?._id : item.schoolDivisionId;
      setFormData({
        schoolDivisionId: schoolDivisionId || '',
        hodName: item.hodName || '',
        hodDesignation: item.hodDesignation || '',
        message: item.message || '',
        hodImage: null,
        existingImage: item.hodImage || '',
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
        ? `${import.meta.env.VITE_API_URL}/school-division/hod-message/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/school-division/hod-message/create`;
      const data = new FormData();
      data.append('schoolDivisionId', formData.schoolDivisionId);
      data.append('hodName', formData.hodName);
      data.append('hodDesignation', formData.hodDesignation);
      data.append('message', formData.message);
      if (formData.hodImage) data.append('hodImage', formData.hodImage);
      else if (formData.existingImage) data.append('hodImage', formData.existingImage);

      const response = await fetch(url, { method: formData._id ? 'PUT' : 'POST', body: data });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to save division HOD message.');
      }
      setMessage({ type: 'success', text: 'Division HOD message saved successfully!' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/school-division/hod-message/delete/${deleteConfirmId}`, { method: 'DELETE' });
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
    return item.hodName?.toLowerCase().includes(query) ||
      item.hodDesignation?.toLowerCase().includes(query) ||
      item.message?.toLowerCase().includes(query) ||
      divisionName.toLowerCase().includes(query);
  });

  const totalItems = filteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredDataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <InstitutionHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Division HOD Messages"
        subtitle="Manage welcome messages for school divisions."
        buttonText="New Division HOD Message"
      />
      <div style={{ margin: '0 -32px' }}><SubNav tabs={divisionTabs} /></div>
      <HODMessageTable
        fetching={fetching}
        dataList={currentData}
        schoolsList={divisionsList}
        handleOpenModal={handleOpenModal}
        handleDelete={setDeleteConfirmId}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
        entityField="schoolDivisionId"
        entityLabel="Division"
        emptyLabel="Division HOD Messages"
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
        schoolsList={divisionsList}
        entityField="schoolDivisionId"
        entityLabel="Division"
      />
      <InstitutionDeleteModal deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} confirmDelete={confirmDelete} isDeleting={isDeleting} />
    </div>
  );
};

export default DivisionHODMessage;
