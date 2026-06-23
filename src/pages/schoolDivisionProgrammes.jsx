import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import SubNav from '../components/common/SubNav';
import ProgrammesTable from '../components/schools/ProgrammesTable';
import ProgrammesFormModal from '../components/schools/ProgrammesFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';

const divisionTabs = [
  { label: 'Division Details', path: '/school-divisions', end: true },
  { label: 'HOD Message', path: '/school-divisions/hod-message', end: false },
  { label: 'Programmes', path: '/school-divisions/programmes', end: false },
  { label: 'Achievements', path: '/school-divisions/achievements', end: false },
  { label: 'Events & Activities', path: '/school-divisions/events-and-activities', end: false }
];

const SchoolDivisionProgrammes = () => {
  const [dataList, setDataList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [formData, setFormData] = useState({
    schoolDivisionId: '',
    name: '',
    shortName: '',
    overview: '',
    duration: '',
    eligibility: '',
    careerPath: ''
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
      // Fetch Divisions for the dropdown list
      const divisionRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/getall`);
      if (divisionRes.ok) {
        const divisionJson = await divisionRes.json();
        if (Array.isArray(divisionJson)) {
          setDivisionsList(divisionJson);
        } else if (divisionJson.data) {
          setDivisionsList(Array.isArray(divisionJson.data) ? divisionJson.data : [divisionJson.data]);
        }
      }

      // Fetch schoolDivisionProgrammes
      const progRes = await fetch(`${import.meta.env.VITE_API_URL}/school-division/programmes/getall`);
      if (progRes.ok) {
        const progJson = await progRes.json();
        if (Array.isArray(progJson)) {
          setDataList(progJson);
        } else if (progJson.data) {
          setDataList(Array.isArray(progJson.data) ? progJson.data : [progJson.data]);
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
      // Resolve the school division ID string if populated as an object
      const schoolDivisionId = typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?._id : item.schoolDivisionId;
      setFormData({ 
        schoolDivisionId: schoolDivisionId || '', 
        name: item.name || '', 
        shortName: item.shortName || '', 
        overview: item.overview || '',
        duration: item.duration || '',
        eligibility: item.eligibility || '',
        careerPath: Array.isArray(item.careerPath) ? item.careerPath.join(', ') : (item.careerPath || ''),
        _id: item._id 
      });
    } else {
      setFormData({ schoolDivisionId: '', name: '', shortName: '', overview: '', duration: '', eligibility: '', careerPath: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormData({ schoolDivisionId: '', name: '', shortName: '', overview: '', duration: '', eligibility: '', careerPath: '' });
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const url = formData._id 
        ? `${import.meta.env.VITE_API_URL}/school-division/programmes/update/${formData._id}` 
        : `${import.meta.env.VITE_API_URL}/school-division/programmes/create`;
      
      const method = formData._id ? 'PUT' : 'POST';

      // Parse careerPath back into array
      const parsedCareerPath = typeof formData.careerPath === 'string'
        ? formData.careerPath.split(',').map(s => s.trim()).filter(s => s !== '')
        : (Array.isArray(formData.careerPath) ? formData.careerPath : []);

      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          schoolDivisionId: formData.schoolDivisionId,
          name: formData.name,
          shortName: formData.shortName,
          overview: formData.overview,
          duration: formData.duration,
          eligibility: formData.eligibility,
          careerPath: parsedCareerPath
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: 'Programme saved successfully!' });
        await fetchData();
        
        setTimeout(() => {
          handleCloseModal();
        }, 1500);
      } else {
        const errData = await response.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save programme. Please try again.' });
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/school-division/programmes/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json();
        alert(json.message || "Failed to delete programme.");
      }
    } catch (error) {
      console.error("Error deleting:", error);
      alert("An error occurred while deleting.");
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const schoolDivisionId = typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?._id : item.schoolDivisionId;
    const divisionName = divisionsList.find(s => s._id === schoolDivisionId)?.name || (typeof item.schoolDivisionId === 'object' ? item.schoolDivisionId?.name : '') || '';
    
    return (
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.shortName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.overview?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      divisionName.toLowerCase().includes(searchQuery.toLowerCase())
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
        title="Division Programmes"
        subtitle="Manage academic programmes and curriculum paths for School Divisions."
        buttonText="New Programme"
      />
      
      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={divisionTabs} />
      </div>

      <ProgrammesTable 
        fetching={fetching}
        dataList={currentData}
        schoolsList={divisionsList}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage
        }}
        entityField="schoolDivisionId"
        entityLabel="Division"
      />

      <ProgrammesFormModal 
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        schoolsList={divisionsList}
        entityField="schoolDivisionId"
        entityLabel="Division"
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

export default SchoolDivisionProgrammes;
