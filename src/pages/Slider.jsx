import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, ImagePlus, Loader2, Save, Trash2, Upload, X } from 'lucide-react';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import InstitutionDeleteModal from '../components/institution/InstitutionDeleteModal';
import Pagination from '../components/common/Pagination';

const API_URL = import.meta.env.VITE_API_URL;
const API_BASE = API_URL.replace('/api', '');
const initialFormData = {
  tagLine: '',
  title: '',
  description: '',
  ctaText1: '',
  ctaLink1: '',
  ctaText2: '',
  ctaLink2: '',
  sliderStatus: 'active',
  image: null,
  existingImage: '',
};

const getImageUrl = (imagePath) => {
  if (!imagePath) return null;
  const normalizedPath = imagePath.replace(/\\/g, '/');
  return normalizedPath.startsWith('public/')
    ? `${API_BASE}/${normalizedPath}`
    : `${API_BASE}/public/uploads/${normalizedPath.split('/').pop()}`;
};

const SliderFormModal = ({
  isModalOpen,
  formData,
  handleChange,
  handleFileChange,
  handleSubmit,
  handleCloseModal,
  loading,
  message,
}) => {
  const fileInputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');

  if (!isModalOpen) return null;

  const onFileChange = (e) => {
    handleFileChange(e);
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewImage(null);
      setSelectedFileName('');
      return;
    }

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (event) => setPreviewImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const closeAndReset = () => {
    setPreviewImage(null);
    setSelectedFileName('');
    handleCloseModal();
  };

  const existingImageUrl = getImageUrl(formData.existingImage);

  return createPortal(
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '760px', maxHeight: '90vh', overflowY: 'auto' }}>
        <div className="modal-header">
          <h2 className="modal-title">{formData._id ? 'Edit Slider' : 'Add Slider'}</h2>
          <button className="modal-close" onClick={closeAndReset}>
            <X size={24} />
          </button>
        </div>

        {message.text && (
          <div className={`alert alert-${message.type} animate-fade-in`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Slider Image</label>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              {(previewImage || existingImageUrl) && (
                <img
                  src={previewImage || existingImageUrl}
                  alt="Slider preview"
                  style={{ width: 112, height: 72, objectFit: 'cover', borderRadius: 8, border: '1px solid var(--border-color)' }}
                />
              )}
              <input
                type="file"
                name="image"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={onFileChange}
                accept="image/*"
              />
              <button
                type="button"
                className="btn-outline"
                onClick={() => fileInputRef.current.click()}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <Upload size={16} />
                {formData.existingImage ? 'Change Image' : 'Upload Image'}
              </button>
              <span style={{ fontSize: 12, color: 'var(--text-light)' }}>
                {selectedFileName || (formData.existingImage ? formData.existingImage.split('\\').pop().split('/').pop() : 'No file chosen')}
              </span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="tagLine">Tag Line</label>
              <input id="tagLine" name="tagLine" className="form-input" value={formData.tagLine} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="sliderStatus">Status</label>
              <select id="sliderStatus" name="sliderStatus" className="form-input" value={formData.sliderStatus} onChange={handleChange}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="title">Title</label>
            <input id="title" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="description">Description</label>
            <textarea id="description" name="description" className="form-textarea" value={formData.description} onChange={handleChange} required style={{ minHeight: 96 }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" htmlFor="ctaText1">Primary Button Text</label>
              <input id="ctaText1" name="ctaText1" className="form-input" value={formData.ctaText1} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ctaLink1">Primary Button Link</label>
              <input id="ctaLink1" name="ctaLink1" className="form-input" value={formData.ctaLink1} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ctaText2">Secondary Button Text</label>
              <input id="ctaText2" name="ctaText2" className="form-input" value={formData.ctaText2} onChange={handleChange} required />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="ctaLink2">Secondary Button Link</label>
              <input id="ctaLink2" name="ctaLink2" className="form-input" value={formData.ctaLink2} onChange={handleChange} required />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 28 }}>
            <button type="button" className="btn-secondary" onClick={closeAndReset}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
              {loading ? 'Saving...' : formData._id ? 'Update Slider' : 'Add Slider'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};

const SliderTable = ({ fetching, dataList, handleOpenModal, handleDelete, pagination }) => (
  <div className="table-container animate-fade-in">
    {fetching ? (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 200 }}>
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    ) : (
      <table className="data-table">
        <thead>
          <tr>
            <th style={{ width: '12%' }}>Image</th>
            <th style={{ width: '16%' }}>Tag Line</th>
            <th style={{ width: '22%' }}>Title</th>
            <th style={{ width: '28%' }}>Description</th>
            <th style={{ width: '8%' }}>Status</th>
            <th style={{ width: '14%', textAlign: 'center' }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {dataList.length > 0 ? dataList.map((item) => (
            <tr key={item._id}>
              <td>
                {getImageUrl(item.image) ? (
                  <img src={getImageUrl(item.image)} alt={item.title} style={{ width: 72, height: 46, objectFit: 'cover', borderRadius: 6, border: '1px solid var(--border-color)' }} />
                ) : (
                  <div style={{ width: 72, height: 46, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--border-color)', color: 'var(--text-light)' }}>
                    <ImagePlus size={18} />
                  </div>
                )}
              </td>
              <td>{item.tagLine}</td>
              <td><strong>{item.title}</strong></td>
              <td>
                <span style={{ color: 'var(--text-gray)', fontSize: 13 }}>
                  {item.description?.length > 110 ? `${item.description.slice(0, 110)}...` : item.description}
                </span>
              </td>
              <td>
                <span style={{
                  fontSize: 11,
                  padding: '2px 8px',
                  borderRadius: 12,
                  textTransform: 'capitalize',
                  fontWeight: 600,
                  background: item.sliderStatus === 'active' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                  color: item.sliderStatus === 'active' ? '#10b981' : '#6b7280',
                  border: item.sliderStatus === 'active' ? '1px solid rgba(16, 185, 129, 0.2)' : '1px solid rgba(107, 114, 128, 0.2)',
                }}>
                  {item.sliderStatus}
                </span>
              </td>
              <td style={{ textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                  <button className="btn-secondary" style={{ padding: '6px 12px' }} onClick={() => handleOpenModal(item)}>
                    <Edit2 size={16} /> Edit
                  </button>
                  <button className="btn-danger" style={{ padding: '6px 12px' }} onClick={() => handleDelete(item._id)}>
                    <Trash2 size={16} /> Delete
                  </button>
                </div>
              </td>
            </tr>
          )) : (
            <tr>
              <td colSpan="6" style={{ textAlign: 'center', padding: 32, color: 'var(--text-gray)' }}>
                No sliders available. Click "New Slider" to create one.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    )}

    {!fetching && pagination && <Pagination {...pagination} />}
  </div>
);

const Slider = () => {
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
  const itemsPerPage = 5;

  const fetchData = async () => {
    setFetching(true);
    try {
      const response = await fetch(`${API_URL}/slider/sliders`);
      const json = await response.json();
      setDataList(json.success && json.data ? (Array.isArray(json.data) ? json.data : [json.data]) : []);
    } catch (error) {
      console.error('Error fetching sliders:', error);
      setMessage({ type: 'error', text: 'Failed to load sliders. Ensure backend is running.' });
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
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    setFormData((prev) => ({ ...prev, image: file || null }));
  };

  const handleOpenModal = (item = null) => {
    setFormData(item ? {
      tagLine: item.tagLine || '',
      title: item.title || '',
      description: item.description || '',
      ctaText1: item.ctaText1 || '',
      ctaLink1: item.ctaLink1 || '',
      ctaText2: item.ctaText2 || '',
      ctaLink2: item.ctaLink2 || '',
      sliderStatus: item.sliderStatus || 'active',
      image: null,
      existingImage: item.image || '',
      _id: item._id,
    } : initialFormData);
    setMessage({ type: '', text: '' });
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
      const data = new FormData();
      ['tagLine', 'title', 'description', 'ctaText1', 'ctaLink1', 'ctaText2', 'ctaLink2', 'sliderStatus'].forEach((field) => {
        data.append(field, formData[field]);
      });
      if (formData.image) {
        data.append('image', formData.image);
      }

      const response = await fetch(
        formData._id ? `${API_URL}/slider/update-slider/${formData._id}` : `${API_URL}/slider/create-slider`,
        { method: formData._id ? 'PUT' : 'POST', body: data }
      );
      const json = await response.json().catch(() => null);

      if (response.ok && json?.success) {
        setMessage({ type: 'success', text: 'Slider saved successfully!' });
        await fetchData();
        setTimeout(() => handleCloseModal(), 1200);
      } else {
        setMessage({ type: 'error', text: json?.message || 'Failed to save slider.' });
      }
    } catch (error) {
      console.error('Error saving slider:', error);
      setMessage({ type: 'error', text: 'An error occurred while saving.' });
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteConfirmId) return;
    setIsDeleting(true);
    try {
      const response = await fetch(`${API_URL}/slider/delete-slider/${deleteConfirmId}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchData();
        setDeleteConfirmId(null);
      } else {
        const json = await response.json().catch(() => null);
        alert(json?.message || 'Failed to delete slider.');
      }
    } catch (error) {
      console.error('Error deleting slider:', error);
      alert('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
    }
  };

  const filteredDataList = dataList.filter((item) => (
    item.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.tagLine?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ));
  const totalItems = filteredDataList.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const currentData = filteredDataList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <div>
      <InstitutionHeader
        handleOpenModal={handleOpenModal}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        title="Home Sliders"
        subtitle="Manage homepage hero slides, CTA buttons, and display status."
        buttonText="New Slider"
        breadcrumbSection="Sliders"
      />

      <SliderTable
        fetching={fetching}
        dataList={currentData}
        handleOpenModal={handleOpenModal}
        handleDelete={setDeleteConfirmId}
        pagination={{
          currentPage,
          totalPages,
          totalItems,
          itemsPerPage,
          onPageChange: setCurrentPage,
        }}
      />

      <SliderFormModal
        isModalOpen={isModalOpen}
        formData={formData}
        handleChange={handleChange}
        handleFileChange={handleFileChange}
        handleSubmit={handleSubmit}
        handleCloseModal={handleCloseModal}
        loading={loading}
        message={message}
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

export default Slider;
