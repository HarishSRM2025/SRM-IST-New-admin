import React, { useEffect, useState } from 'react';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import ResearchFacultyMembersFormModal from '../components/research/ResearchFacultyMembersFormModal';
import ResearchFacultyMembersTable from '../components/research/ResearchFacultyMembersTable';

const researchTabs = [
  { label: 'Center of Research', path: '/research', end: true },
  { label: 'Research Faculty Members', path: '/research/faculty-members', end: true },
  { label: 'Research Student Members', path: '/research/student-members', end: true },
];

const initialFacultyFormData = {
  researchCenterId: '',
  facultyId: '',
};

const getCleanId = (val) => (
  typeof val === 'object' && val !== null ? val._id : val
);

const ResearchFacultyMembers = () => {
  // Faculty members state
  const [facultyDataList, setFacultyDataList] = useState([]);
  const [facultyFormData, setFacultyFormData] = useState(initialFacultyFormData);
  const [facultyLoading, setFacultyLoading] = useState(false);
  const [facultyFetching, setFacultyFetching] = useState(true);
  const [facultyMessage, setFacultyMessage] = useState({ type: '', text: '' });
  const [isFacultyModalOpen, setIsFacultyModalOpen] = useState(false);
  const [facultyDeleteConfirmId, setFacultyDeleteConfirmId] = useState(null);
  const [facultyIsDeleting, setFacultyIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [researchCenters, setResearchCenters] = useState([]);
  const [facultyMembers, setFacultyMembers] = useState([]);

  // Fetch research centers for dropdown & name resolution
  const fetchResearchCenters = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research`);
      if (response.ok) {
        const json = await response.json();
        setResearchCenters(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error('Error fetching research centers:', error);
    }
  };

  // Fetch faculty members list for dropdown & name resolution
  const fetchFacultyMembers = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/faculty/getfaculty`);
      if (response.ok) {
        const json = await response.json();
        setFacultyMembers(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error('Error fetching faculty members:', error);
    }
  };

  // Fetch assigned faculty members
  const fetchResearchFacultyMembers = async () => {
    setFacultyFetching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research/faculty-members`);
      if (response.ok) {
        const json = await response.json();
        setFacultyDataList(Array.isArray(json) ? json : json.data || []);
      }
    } catch (error) {
      console.error('Error fetching research faculty members:', error);
      setFacultyMessage({ type: 'error', text: 'Failed to load research faculty members. Ensure backend is running.' });
    } finally {
      setFacultyFetching(false);
    }
  };

  useEffect(() => {
    fetchResearchCenters();
    fetchFacultyMembers();
    fetchResearchFacultyMembers();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handlers
  const handleFacultyChange = (e) => {
    const { name, value } = e.target;
    setFacultyFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenFacultyModal = (item = null) => {
    if (item) {
      setFacultyFormData({
        researchCenterId: getCleanId(item.researchCenterId) || '',
        facultyId: getCleanId(item.facultyId) || '',
        _id: item._id,
      });
    } else {
      setFacultyFormData(initialFacultyFormData);
    }
    setIsFacultyModalOpen(true);
  };

  const handleCloseFacultyModal = () => {
    setIsFacultyModalOpen(false);
    setFacultyFormData(initialFacultyFormData);
    setFacultyMessage({ type: '', text: '' });
  };

  const handleFacultySubmit = async (e) => {
    e.preventDefault();
    setFacultyLoading(true);
    setFacultyMessage({ type: '', text: '' });

    try {
      const url = facultyFormData._id
        ? `${import.meta.env.VITE_API_URL}/research/faculty-members/${facultyFormData._id}`
        : `${import.meta.env.VITE_API_URL}/research/faculty-members`;
      const method = facultyFormData._id ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          researchCenterId: facultyFormData.researchCenterId,
          facultyId: facultyFormData.facultyId,
        }),
      });

      if (response.ok) {
        setFacultyMessage({ type: 'success', text: 'Faculty member assigned successfully!' });
        await fetchResearchFacultyMembers();
        setTimeout(() => {
          handleCloseFacultyModal();
        }, 1200);
      } else {
        const json = await response.json().catch(() => null);
        setFacultyMessage({ type: 'error', text: json?.message || 'Failed to save. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving faculty member:', error);
      setFacultyMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setFacultyLoading(false);
    }
  };

  const handleFacultyDelete = (id) => {
    setFacultyDeleteConfirmId(id);
  };

  const confirmFacultyDelete = async () => {
    if (!facultyDeleteConfirmId) return;
    setFacultyIsDeleting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/research/faculty-members/${facultyDeleteConfirmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchResearchFacultyMembers();
        setFacultyDeleteConfirmId(null);
      } else {
        const json = await response.json().catch(() => null);
        alert(json?.message || 'Failed to delete faculty member assignment.');
      }
    } catch (error) {
      console.error('Error deleting faculty member:', error);
      alert('An error occurred while deleting.');
    } finally {
      setFacultyIsDeleting(false);
    }
  };

  // Filtered data for faculty members
  const filteredFacultyDataList = facultyDataList.filter(item => {
    const center = researchCenters.find(c => c._id === getCleanId(item.researchCenterId));
    const faculty = facultyMembers.find(f => f._id === getCleanId(item.facultyId));
    
    const centerName = center?.centerName || '';
    const facultyName = faculty?.facultyName || faculty?.name || '';
    
    return centerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      facultyName.toLowerCase().includes(searchQuery.toLowerCase());
  });

  const facultyTotalItems = filteredFacultyDataList.length;
  const facultyTotalPages = Math.ceil(facultyTotalItems / itemsPerPage);
  const currentFacultyData = filteredFacultyDataList.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div>
      <InstitutionHeader
        handleOpenModal={handleOpenFacultyModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Research Faculty Members"
        subtitle="Assign faculty members to research centers and manage their roles."
        buttonText="Assign Faculty Member"
        breadcrumbSection="Research Faculty Members"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={researchTabs} />
      </div>

      <ResearchFacultyMembersTable
        fetching={facultyFetching}
        dataList={currentFacultyData}
        researchCenters={researchCenters}
        facultyMembers={facultyMembers}
        handleOpenModal={handleOpenFacultyModal}
        handleDelete={handleFacultyDelete}
        pagination={{
          currentPage: currentPage,
          totalPages: facultyTotalPages,
          totalItems: facultyTotalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      />

      <ResearchFacultyMembersFormModal
        isModalOpen={isFacultyModalOpen}
        handleCloseModal={handleCloseFacultyModal}
        formData={facultyFormData}
        handleChange={handleFacultyChange}
        handleSubmit={handleFacultySubmit}
        loading={facultyLoading}
        message={facultyMessage}
        researchCenters={researchCenters}
        facultyMembers={facultyMembers}
      />

      <InstitutionDeleteModal
        deleteConfirmId={facultyDeleteConfirmId}
        setDeleteConfirmId={setFacultyDeleteConfirmId}
        confirmDelete={confirmFacultyDelete}
        isDeleting={facultyIsDeleting}
      />
    </div>
  );
};

export default ResearchFacultyMembers;
