import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import EventsAndActivitiesTable from '../components/schools/EventsAndActivitiesTable';
import EventsAndActivitiesFormModal from '../components/schools/EventsAndActivitiesFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const divisionTabs = [
  { label: 'Division Details', path: '/school-divisions', end: true },
  { label: 'HOD Message', path: '/school-divisions/hod-message', end: false },
  { label: 'Achievements', path: '/school-divisions/achievements', end: false },
  { label: 'Events & Activities', path: '/school-divisions/events-and-activities', end: false }
];

const initialFormData = {
  schoolDivisionId: '',
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
};

const DivisionEventsAndActivities = () => {
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
      const eventsRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/events-and-activities/getall`);
      if (eventsRes.ok) {
        const eventsJson = await eventsRes.json();
        setDataList(Array.isArray(eventsJson) ? eventsJson : (eventsJson.data || []));
      }
    } catch (error) {
      console.error('Error fetching division events:', error);
      setMessage({ type: 'error', text: 'Failed to load division events.' });
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
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFormData(prev => ({ ...prev, eventImage: Array.from(e.target.files) }));
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const schoolDivisionId = typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?._id : item.schoolDivisionId;
      setFormData({
        ...initialFormData,
        ...item,
        schoolDivisionId: schoolDivisionId || '',
        eventImage: null,
        existingImage: Array.isArray(item.eventImage) ? item.eventImage : (item.eventImage ? [item.eventImage] : []),
        announcement: Boolean(item.announcement),
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
        ? `${import.meta.env.VITE_API_URL}/school-division/events-and-activities/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/school-division/events-and-activities/create`;
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (['_id', 'eventImage', 'existingImage'].includes(key)) return;
        data.append(key, value);
      });
      if (formData.eventImage && formData.eventImage.length > 0) {
        formData.eventImage.forEach(file => data.append('eventImage', file));
      } else if (formData.existingImage && formData.existingImage.length > 0) {
        formData.existingImage.forEach(img => data.append('eventImage', img));
      }

      const response = await fetch(url, { method: formData._id ? 'PUT' : 'POST', body: data });
      if (!response.ok) {
        const errData = await response.json().catch(() => null);
        throw new Error(errData?.message || 'Failed to save division event.');
      }
      setMessage({ type: 'success', text: 'Division event saved successfully!' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/school-division/events-and-activities/delete/${deleteConfirmId}`, { method: 'DELETE' });
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
    return item.name?.toLowerCase().includes(query) ||
      item.type?.toLowerCase().includes(query) ||
      item.status?.toLowerCase().includes(query) ||
      item.location?.toLowerCase().includes(query) ||
      divisionName.toLowerCase().includes(query);
  });

  const totalItems = filteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredDataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <InstitutionHeader handleOpenModal={handleOpenModal} searchQuery={searchQuery} setSearchQuery={setSearchQuery} title="Division Events & Activities" subtitle="Manage events and activities for school divisions." buttonText="New Division Event" />
      <div style={{ margin: '0 -32px' }}><SubNav tabs={divisionTabs} /></div>
      <EventsAndActivitiesTable fetching={fetching} dataList={currentData} schoolsList={divisionsList} handleOpenModal={handleOpenModal} handleDelete={setDeleteConfirmId} pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }} entityField="schoolDivisionId" entityLabel="Division" />
      <EventsAndActivitiesFormModal isModalOpen={isModalOpen} handleCloseModal={handleCloseModal} formData={formData} handleChange={handleChange} handleFileChange={handleFileChange} handleSubmit={handleSubmit} loading={loading} message={message} schoolsList={divisionsList} entityField="schoolDivisionId" entityLabel="Division" />
      <InstitutionDeleteModal deleteConfirmId={deleteConfirmId} setDeleteConfirmId={setDeleteConfirmId} confirmDelete={confirmDelete} isDeleting={isDeleting} />
    </div>
  );
};

export default DivisionEventsAndActivities;
