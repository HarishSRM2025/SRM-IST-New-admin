import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import EventsAndActivitiesTable from '../components/schools/EventsAndActivitiesTable';
import EventsAndActivitiesFormModal from '../components/schools/EventsAndActivitiesFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const instituteTabs = [
  { label: 'Institute Details', path: '/institution', end: true },
  { label: 'Institute Stats', path: '/institution/stats', end: false },
  { label: 'Dean Message', path: '/institution/dean-message', end: false },
  { label: 'Infrastructure', path: '/institution/infrastructure', end: false },
  { label: 'Gallery & Resources', path: '/institution/gallery-resource', end: false },
  { label: 'Events & Activities', path: '/institution/events-and-activities', end: false },
  { label: 'Programmes Offered', path: '/institution/programmes', end: false }
];

const initialFormData = {
  institutionId: '',
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

const InstituteEventsAndActivities = () => {
  const [dataList, setDataList] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
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
      // Fetch Institutions instead of Schools
      const instRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/getall`);
      if (instRes.ok) {
        const instJson = await instRes.json();
        if (instJson.success && instJson.data) {
          setInstitutionsList(Array.isArray(instJson.data) ? instJson.data : [instJson.data]);
        }
      }
      const eventsRes = await fetch(`${import.meta.env.VITE_API_URL}/institution/events-and-activities/getall`);
      if (eventsRes.ok) {
        const eventsJson = await eventsRes.json();
        setDataList(Array.isArray(eventsJson) ? eventsJson : (eventsJson.data || []));
      }
    } catch (error) {
      console.error('Error fetching institute events:', error);
      setMessage({ type: 'error', text: 'Failed to load institute events.' });
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
    if (e.target.files?.[0]) setFormData(prev => ({ ...prev, eventImage: Array.from(e.target.files) }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      const instId = typeof item.institutionId === 'object' ? item.institutionId?._id : item.institutionId;
      setFormData({
        ...initialFormData,
        ...item,
        institutionId: instId || '',
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
        ? `${import.meta.env.VITE_API_URL}/institution/events-and-activities/update/${formData._id}`
        : `${import.meta.env.VITE_API_URL}/institution/events-and-activities/create`;
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
        const err = await response.json().catch(() => null);
        throw new Error(err?.message || 'Failed to save record');
      }
      setMessage({ type: 'success', text: 'Record saved successfully!' });
      await fetchData();
      setTimeout(handleCloseModal, 1200);
    } catch (error) {
      setMessage({ type: 'error', text: error.message });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/institution/events-and-activities/delete/${deleteConfirmId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const instId = typeof item.institutionId === 'object' ? item.institutionId?._id : item.institutionId;
    const instName = institutionsList.find(s => s._id === instId)?.name || (typeof item.institutionId === 'object' ? item.institutionId?.name : '');
    const q = searchQuery.toLowerCase();
    return (
      item.name?.toLowerCase().includes(q) ||
      item.type?.toLowerCase().includes(q) ||
      item.status?.toLowerCase().includes(q) ||
      item.location?.toLowerCase().includes(q) ||
      instName.toLowerCase().includes(q)
    );
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
        title="Institute Events & Activities"
        subtitle="Manage institute‑wide events and activities."
        buttonText="New Record"
      />
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={instituteTabs} />
      </div>
      <EventsAndActivitiesTable
        fetching={fetching}
        dataList={currentData}
        schoolsList={institutionsList}
        handleOpenModal={handleOpenModal}
        handleDelete={setDeleteConfirmId}
        pagination={{ currentPage, totalPages, totalItems, itemsPerPage, onPageChange: setCurrentPage }}
        entityField="institutionId"
        entityLabel="Institution"
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
        schoolsList={institutionsList}
        entityField="institutionId"
        entityLabel="Institution"
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

export default InstituteEventsAndActivities;
