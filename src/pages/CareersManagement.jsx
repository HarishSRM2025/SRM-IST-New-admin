import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { BriefcaseBusiness, Download, Edit2, FileText, Loader2, Plus, RefreshCw, Trash2, X } from 'lucide-react';
import {
  createCareer,
  deleteCareer,
  deleteJobApplication,
  getCareers,
  getJobApplications,
  getResumeUrl,
  updateCareer,
} from '../api/careers';
import '../styles/theme.css';

const emptyCareer = {
  _id: '',
  title: '',
  description: '',
  eligibility: '',
  location: '',
  type: '',
  Institute: '',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function CareersManagement() {
  const [activeTab, setActiveTab] = useState('careers');
  const [careers, setCareers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(emptyCareer);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const [careersData, applicationsData] = await Promise.all([
        getCareers(),
        getJobApplications(),
      ]);
      setCareers(careersData.careers || []);
      setApplications(applicationsData.jobApplications || []);
    } catch (err) {
      setError(err.message || 'Unable to load careers data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchData, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredCareers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return careers;
    return careers.filter((career) =>
      [career.title, career.Institute, career.location, career.type]
        .some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [careers, searchQuery]);

  const filteredApplications = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return applications;
    return applications.filter((application) =>
      [
        application.name,
        application.email,
        application.phone,
        application.positionId?.title,
        application.positionId?.Institute,
      ].some((value) => String(value || '').toLowerCase().includes(query))
    );
  }, [applications, searchQuery]);

  const openCareerModal = (career = null) => {
    setFormData(career ? {
      _id: career._id,
      title: career.title || '',
      description: career.description || '',
      eligibility: career.eligibility || '',
      location: career.location || '',
      type: career.type || '',
      Institute: career.Institute || '',
    } : emptyCareer);
    setError('');
    setSuccess('');
    setIsModalOpen(true);
  };

  const closeCareerModal = () => {
    setIsModalOpen(false);
    setFormData(emptyCareer);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCareerSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      title: formData.title,
      description: formData.description,
      eligibility: formData.eligibility,
      location: formData.location,
      type: formData.type,
      Institute: formData.Institute,
    };

    try {
      const data = formData._id
        ? await updateCareer(formData._id, payload)
        : await createCareer(payload);

      setCareers((prev) => {
        if (formData._id) {
          return prev.map((career) => (career._id === data.career._id ? data.career : career));
        }
        return [data.career, ...prev];
      });
      setSuccess(formData._id ? 'Career updated successfully.' : 'Career created successfully.');
      closeCareerModal();
    } catch (err) {
      setError(err.message || 'Unable to save career.');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setSaving(true);
    setError('');
    try {
      if (deleteTarget.type === 'career') {
        await deleteCareer(deleteTarget.id);
        setCareers((prev) => prev.filter((career) => career._id !== deleteTarget.id));
      } else {
        await deleteJobApplication(deleteTarget.id);
        setApplications((prev) => prev.filter((application) => application._id !== deleteTarget.id));
      }
      setDeleteTarget(null);
    } catch (err) {
      setError(err.message || 'Unable to delete record.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ padding: '0 0 32px 0' }}>
        <div>
          <div className="breadcrumb">SRM Admin <span>&gt;</span> Careers</div>
          <h1 className="page-title">Careers</h1>
          <p className="page-subtitle">Manage career postings and review submitted job applications.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchData} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
          <button className="btn-primary" onClick={() => openCareerModal()}>
            <Plus size={16} /> Add Career
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="main-card">
        <div className="card-header">
          <div className="card-title">
            <BriefcaseBusiness size={16} color="var(--primary-blue)" />
            Careers <span className="badge-light">{careers.length}</span>
          </div>
          <div className="card-actions">
            <button className={`btn ${activeTab === 'careers' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('careers')}>
              Postings
            </button>
            <button className={`btn ${activeTab === 'applications' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('applications')}>
              Applications <span className="badge-light">{applications.length}</span>
            </button>
            <input
              className="search-input"
              type="search"
              placeholder="Search careers..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        {activeTab === 'careers' ? (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Institute</th>
                  <th>Location</th>
                  <th>Type</th>
                  <th>Created</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading careers...</td></tr>
                ) : filteredCareers.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No career postings found.</td></tr>
                ) : filteredCareers.map((career) => (
                  <tr key={career._id}>
                    <td><strong>{career.title}</strong></td>
                    <td>{career.Institute}</td>
                    <td>{career.location}</td>
                    <td>{career.type}</td>
                    <td>{formatDate(career.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 8 }}>
                        <button className="btn btn-outline" onClick={() => openCareerModal(career)}>
                          <Edit2 size={14} /> Edit
                        </button>
                        <button className="btn-danger" onClick={() => setDeleteTarget({ type: 'career', id: career._id })}>
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Applicant</th>
                  <th>Position</th>
                  <th>Phone</th>
                  <th>Applied</th>
                  <th>Resume</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>Loading applications...</td></tr>
                ) : filteredApplications.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: 40 }}>No applications found.</td></tr>
                ) : filteredApplications.map((application) => (
                  <tr key={application._id}>
                    <td>
                      <strong>{application.name}</strong>
                      <div style={{ color: 'var(--text-gray)', fontSize: 12 }}>{application.email}</div>
                    </td>
                    <td>
                      {application.positionId?.title || '-'}
                      <div style={{ color: 'var(--text-gray)', fontSize: 12 }}>{application.positionId?.Institute || ''}</div>
                    </td>
                    <td>{application.phone}</td>
                    <td>{formatDate(application.createdAt)}</td>
                    <td>
                      <a className="btn btn-outline" href={getResumeUrl(application.resume)} target="_blank" rel="noreferrer">
                        <Download size={14} /> Resume
                      </a>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn-danger" onClick={() => setDeleteTarget({ type: 'application', id: application._id })}>
                        <Trash2 size={14} /> Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {isModalOpen && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '720px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{formData._id ? 'Edit Career' : 'Add Career'}</h2>
              <button className="modal-close" onClick={closeCareerModal} aria-label="Close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleCareerSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="title">Title</label>
                <input id="title" name="title" className="form-input" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="Institute">Institute</label>
                <input id="Institute" name="Institute" className="form-input" value={formData.Institute} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="location">Location</label>
                <input id="location" name="location" className="form-input" value={formData.location} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="type">Type</label>
                <input id="type" name="type" className="form-input" value={formData.type} onChange={handleChange} required placeholder="Full-time, Contract, Visiting" />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="description">Description</label>
                <textarea id="description" name="description" className="form-textarea" value={formData.description} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="eligibility">Eligibility</label>
                <textarea id="eligibility" name="eligibility" className="form-textarea" value={formData.eligibility} onChange={handleChange} required />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 32 }}>
                <button type="button" className="btn-secondary" onClick={closeCareerModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                  {saving ? 'Saving...' : 'Save Career'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}

      {deleteTarget && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '400px', padding: '32px', textAlign: 'center' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 16, color: '#ef4444' }}>
              <Trash2 size={48} strokeWidth={1.5} />
            </div>
            <h2 className="modal-title" style={{ marginBottom: 8, fontSize: 20, justifyContent: 'center' }}>Confirm Deletion</h2>
            <p style={{ color: 'var(--text-gray)', marginBottom: 24, fontSize: 14 }}>
              Are you sure you want to delete this {deleteTarget.type === 'career' ? 'career posting' : 'application'}?
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
              <button className="btn-secondary" onClick={() => setDeleteTarget(null)} disabled={saving}>Cancel</button>
              <button className="btn-danger" onClick={confirmDelete} disabled={saving}>
                {saving ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}
                {saving ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
