import React, { useState, useEffect } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import FacultyResearchTable from '../components/faculty/FacultyResearchTable';
import FacultyResearchFormModal from '../components/faculty/FacultyResearchFormModal';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import SubNav from '../components/common/SubNav';

const facultyTabs = [
  { label: 'Faculty Details', path: '/faculty', end: true },
  { label: 'Faculty Research & Work Experience', path: '/faculty/research', end: false },
];

const EMPTY_FORM = {
  facultyId: '',
  workExperience: [],
  awards_and_achievements: [],
  publications: [],
  invited_lectures: [],
  fundedProject: [],
  professional_memberships: [],
  patents: [],
  grants: [],
  conferences: [],
  workshop: [],
};

const getFacultyId = (facultyId) => (
  typeof facultyId === 'object' && facultyId !== null ? facultyId._id : facultyId
);

const FacultyResearch = () => {
  const [facultyList, setFacultyList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [dataList, setDataList] = useState([]);
  const [formData, setFormData] = useState({ ...EMPTY_FORM });
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchData = async () => {
    setFetching(true);
    try {
      const [facRes, schoolsRes, researchRes, experienceRes] = await Promise.all([
        fetch(`${import.meta.env.VITE_API_URL}/faculty/getfaculty`),
        fetch(`${import.meta.env.VITE_API_URL}/schools/getall`),
        fetch(`${import.meta.env.VITE_API_URL}/faculty/getfacultyresearch`),
        fetch(`${import.meta.env.VITE_API_URL}/faculty/getfacultyexperience`),
      ]);

      let faculties = [];
      if (facRes.ok) {
        const facJson = await facRes.json();
        faculties = Array.isArray(facJson) ? facJson : facJson.data ? (Array.isArray(facJson.data) ? facJson.data : [facJson.data]) : [];
        setFacultyList(faculties);
      }

      if (schoolsRes.ok) {
        const schoolsJson = await schoolsRes.json();
        setSchoolsList(Array.isArray(schoolsJson) ? schoolsJson : schoolsJson.data ? (Array.isArray(schoolsJson.data) ? schoolsJson.data : [schoolsJson.data]) : []);
      }

      let researches = [];
      let experiences = [];
      if (researchRes.ok) {
        const researchJson = await researchRes.json();
        researches = Array.isArray(researchJson) ? researchJson : researchJson.data ? (Array.isArray(researchJson.data) ? researchJson.data : [researchJson.data]) : [];
      }
      if (experienceRes.ok) {
        const experienceJson = await experienceRes.json();
        experiences = Array.isArray(experienceJson) ? experienceJson : experienceJson.data ? (Array.isArray(experienceJson.data) ? experienceJson.data : [experienceJson.data]) : [];
      }

      // Merge research & experience by facultyId
      const mergedMap = new Map();

      researches.forEach((r) => {
        const fId = getFacultyId(r.facultyId);
        if (!fId) return;
        mergedMap.set(String(fId), {
          _id: r._id,
          facultyId: r.facultyId,
          publications: r.publications || [],
          awards_and_achievements: r.awards_and_achievements || [],
          invited_lectures: r.invited_lectures || r.invitedLectures || [],
          fundedProject: r.fundedProject || r.fundedProjects || [],
          professional_memberships: r.professional_memberships || r.professionalMemberships || [],
          patents: r.patents || [],
          grants: r.grants || [],
          conferences: r.conferences || [],
          workshop: r.workshop || [],
          workExperience: [],
          experienceId: null,
        });
      });

      experiences.forEach((e) => {
        const fId = getFacultyId(e.facultyId);
        if (!fId) return;
        const key = String(fId);
        const expData = e.workExperience?.length ? e.workExperience : (e.industryExperience || []);
        if (mergedMap.has(key)) {
          const current = mergedMap.get(key);
          current.workExperience = expData;
          current.experienceId = e._id;
        } else {
          mergedMap.set(key, {
            _id: null,
            facultyId: e.facultyId,
            publications: [],
            awards_and_achievements: [],
            invited_lectures: [],
            fundedProject: [],
            professional_memberships: [],
            patents: [],
            grants: [],
            conferences: [],
            workshop: [],
            workExperience: expData,
            experienceId: e._id,
          });
        }
      });

      setDataList(Array.from(mergedMap.values()));
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessage({ type: 'error', text: 'Failed to load research & experience data.' });
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

  const resetForm = () => {
    setFormData({ ...EMPTY_FORM });
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        _id: item._id || null,
        experienceId: item.experienceId || null,
        facultyId: getFacultyId(item.facultyId) || '',
        workExperience: item.workExperience || [],
        awards_and_achievements: item.awards_and_achievements || [],
        publications: item.publications || [],
        invited_lectures: item.invited_lectures || [],
        fundedProject: item.fundedProject || [],
        professional_memberships: item.professional_memberships || [],
        patents: item.patents || [],
        grants: item.grants || [],
        conferences: item.conferences || [],
        workshop: item.workshop || [],
      });
    } else {
      resetForm();
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    resetForm();
    setMessage({ type: '', text: '' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    if (!formData.facultyId) {
      setMessage({ type: 'error', text: 'Please select a faculty member.' });
      setLoading(false);
      return;
    }

    try {
      const researchPayload = {
        facultyId: formData.facultyId,
        publications: formData.publications || [],
        awards_and_achievements: formData.awards_and_achievements || [],
        invited_lectures: formData.invited_lectures || [],
        fundedProject: formData.fundedProject || [],
        professional_memberships: formData.professional_memberships || [],
        patents: formData.patents || [],
        grants: formData.grants || [],
        conferences: formData.conferences || [],
        workshop: formData.workshop || [],
      };

      const experiencePayload = {
        facultyId: formData.facultyId,
        workExperience: formData.workExperience || [],
        industryExperience: formData.workExperience || [],
      };

      // 1. Research request
      let researchPromise;
      if (formData._id) {
        researchPromise = fetch(`${import.meta.env.VITE_API_URL}/faculty/updatefacultyresearch/${formData._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(researchPayload),
        });
      } else {
        researchPromise = fetch(`${import.meta.env.VITE_API_URL}/faculty/addfacultyresearch`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(researchPayload),
        });
      }

      // 2. Experience request
      let experiencePromise;
      if (formData.experienceId) {
        experiencePromise = fetch(`${import.meta.env.VITE_API_URL}/faculty/updatefacultyexperience/${formData.experienceId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(experiencePayload),
        });
      } else {
        experiencePromise = fetch(`${import.meta.env.VITE_API_URL}/faculty/addfacultyexperience`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(experiencePayload),
        });
      }

      const [resRes, expRes] = await Promise.all([researchPromise, experiencePromise]);

      if (resRes.ok || expRes.ok) {
        setMessage({ type: 'success', text: 'Research & Work Experience saved successfully!' });
        await fetchData();
        setTimeout(() => handleCloseModal(), 1200);
      } else {
        const errData = await resRes.json().catch(() => null);
        setMessage({ type: 'error', text: errData?.message || 'Failed to save record.' });
      }
    } catch (error) {
      console.error('Error saving data:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = (item) => {
    setDeleteTarget(item);
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const deletePromises = [];
      if (deleteTarget._id) {
        deletePromises.push(
          fetch(`${import.meta.env.VITE_API_URL}/faculty/deletefacultyresearch/${deleteTarget._id}`, {
            method: 'DELETE',
          })
        );
      }
      if (deleteTarget.experienceId) {
        deletePromises.push(
          fetch(`${import.meta.env.VITE_API_URL}/faculty/deletefacultyexperience/${deleteTarget.experienceId}`, {
            method: 'DELETE',
          })
        );
      }

      await Promise.all(deletePromises);
      await fetchData();
      setDeleteTarget(null);
    } catch (error) {
      console.error('Error deleting record:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter(item => {
    const facName = facultyList.find(f => f._id === getFacultyId(item.facultyId))?.facultyName || '';
    return facName.toLowerCase().includes(searchQuery.toLowerCase());
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
        handleOpenModal={() => handleOpenModal(null)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Faculty Research & Work Experience"
        subtitle="Manage research achievements, publications, patents, and work experience."
        buttonText="New Research & Work Experience"
      />

      <div style={{ margin: '0 -32px' }}>
        <SubNav tabs={facultyTabs} />
      </div>

      <FacultyResearchTable
        fetching={fetching}
        dataList={currentData}
        facultyList={facultyList}
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

      <FacultyResearchFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        setFormData={setFormData}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
        facultyList={facultyList}
        schoolsList={schoolsList}
      />

      <InstitutionDeleteModal
        deleteConfirmId={deleteTarget}
        setDeleteConfirmId={setDeleteTarget}
        confirmDelete={confirmDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
};

export default FacultyResearch;
