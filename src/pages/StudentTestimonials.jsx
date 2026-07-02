import React, { useEffect, useState } from 'react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import StudentTestimonialTable from '../components/students/StudentTestimonialTable';
import StudentTestimonialFormModal from '../components/students/StudentTestimonialFormModal';
import { Loader2, Trash2 } from 'lucide-react';
import { createPortal } from 'react-dom';

const initialFormData = {
  name: '',
  role: '',
  videoId: '',
};

const StudentTestimonials = () => {
  const [dataList, setDataList] = useState([]);
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

  // Fetch testimonials
  const fetchTestimonials = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/getAll`);
      if (response.ok) {
        const json = await response.json();
        // The API returns { success: true, studentTestimonials: [...] }
        setDataList(json.studentTestimonials || []);
      } else {
        console.error('Failed to fetch testimonials');
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
      setMessage({ type: 'error', text: 'Failed to load testimonials. Ensure backend is running.' });
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchTestimonials();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery]);

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setFormData({
        _id: item._id,
        name: item.name || '',
        role: item.role || '',
        videoId: item.videoId || '',
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
      const isEdit = !!formData._id;
      const url = isEdit
        ? `${import.meta.env.VITE_API_URL}/student/update`
        : `${import.meta.env.VITE_API_URL}/student/create`;
      const method = isEdit ? 'PUT' : 'POST';

      // For update, the API expects { id, name, role, videoId }
      const payload = isEdit 
        ? { id: formData._id, name: formData.name, role: formData.role, videoId: formData.videoId }
        : { name: formData.name, role: formData.role, videoId: formData.videoId };

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        setMessage({ 
          type: 'success', 
          text: isEdit ? 'Testimonial updated successfully!' : 'Testimonial created successfully!' 
        });
        await fetchTestimonials();
        setTimeout(() => {
          handleCloseModal();
        }, 1200);
      } else {
        const json = await response.json().catch(() => null);
        setMessage({ type: 'error', text: json?.message || 'Failed to save. Please try again.' });
      }
    } catch (error) {
      console.error('Error saving testimonial:', error);
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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/student/delete/${deleteConfirmId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchTestimonials();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json().catch(() => null);
        alert(json?.message || 'Failed to delete testimonial.');
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtered data
  const filteredDataList = dataList.filter(item => {
    const name = item.name || '';
    const role = item.role || '';
    const videoId = item.videoId || '';

    return name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      videoId.toLowerCase().includes(searchQuery.toLowerCase());
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
        title="Student Testimonials"
        subtitle="Add, edit, or remove student video stories displayed on the homepage."
        buttonText="Add Testimonial"
        breadcrumbSection="Student Testimonials"
      />

      <StudentTestimonialTable
        fetching={fetching}
        dataList={currentData}
        handleOpenModal={handleOpenModal}
        handleDelete={handleDelete}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      />

      <StudentTestimonialFormModal
        isModalOpen={isModalOpen}
        handleCloseModal={handleCloseModal}
        formData={formData}
        handleChange={handleChange}
        handleSubmit={handleSubmit}
        loading={loading}
        message={message}
      />

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', color: '#ef4444' }}>
              <Trash2 size={48} strokeWidth={1.5} />
            </div>
            <h2 className="modal-title" style={{ marginBottom: '8px', fontSize: '20px', justifyContent: 'center' }}>Confirm Deletion</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: '24px', fontSize: '14px' }}>
              Are you sure you want to delete this student testimonial? This action cannot be undone.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '12px' }}>
              <button 
                className="btn-secondary" 
                onClick={() => setDeleteConfirmId(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button 
                className="btn-danger" 
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
};

export default StudentTestimonials;
