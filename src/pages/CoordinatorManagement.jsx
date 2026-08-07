import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Copy, Check, Edit2, Loader2, Plus, RefreshCw, Save, Users as UsersIcon, X } from 'lucide-react';
import { createCoordinator, getUsers, updateUser } from '../api/auth';
import '../styles/theme.css';

const emptyForm = {
  _id: '',
  username: '',
  email: '',
  password: '',
  role: 'coordinator',
  status: 'active',
  mappingLevel: 'institute',
  instituteId: '',
  schoolId: '',
  divisionId: '',
};

const parseListResponse = async (response) => {
  if (!response.ok) return [];
  const json = await response.json().catch(() => ({}));
  if (Array.isArray(json)) return json;
  if (Array.isArray(json.data)) return json.data;
  if (json.data) return [json.data];
  return [];
};

export default function CoordinatorManagement() {
  const [users, setUsers] = useState([]);
  const [institutionsList, setInstitutionsList] = useState([]);
  const [schoolsList, setSchoolsList] = useState([]);
  const [divisionsList, setDivisionsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [copied, setCopied] = useState(false);

  const handleCopyLink = () => {
    const link = `${window.location.origin}/coordinator/signin`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fetchAll = async () => {
    setLoading(true);
    setError('');
    try {
      const [usersResult, institutionsRes, schoolsRes, divisionsRes] = await Promise.allSettled([
        getUsers(),
        fetch(`${import.meta.env.VITE_API_URL}/institution/getall`),
        fetch(`${import.meta.env.VITE_API_URL}/schools/getall`),
        fetch(`${import.meta.env.VITE_API_URL}/school-division/getall`),
      ]);

      if (usersResult.status === 'fulfilled') setUsers((usersResult.value.users || []).filter((user) => user.role === 'coordinator'));

      const institutions = institutionsRes.status === 'fulfilled' ? await parseListResponse(institutionsRes.value) : [];
      const schools = schoolsRes.status === 'fulfilled' ? await parseListResponse(schoolsRes.value) : [];
      const divisions = divisionsRes.status === 'fulfilled' ? await parseListResponse(divisionsRes.value) : [];

      setInstitutionsList(institutions);
      setDivisionsList(divisions);
      setSchoolsList(schools.map((school) => ({
        ...school,
        divisions: divisions.filter((division) => {
          const divSchoolId = typeof division.schoolId === 'object' ? division.schoolId?._id : division.schoolId;
          return String(divSchoolId) === String(school._id);
        }),
      })));
    } catch (err) {
      setError(err.message || 'Unable to fetch coordinators.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchAll, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;
    return users.filter((user) => [user.username, user.email, user.status, user.mappingLevel].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [searchQuery, users]);

  const availableSchools = useMemo(
    () => schoolsList.filter((school) => String(school.institutionId?._id || school.institutionId) === String(formData.instituteId)),
    [formData.instituteId, schoolsList]
  );
  const selectedSchool = useMemo(
    () => availableSchools.find((item) => String(item._id) === String(formData.schoolId)),
    [availableSchools, formData.schoolId]
  );
  const availableDivisions = useMemo(
    () => (selectedSchool?.divisions || divisionsList).filter((division) => String(division.schoolId?._id || division.schoolId) === String(formData.schoolId)),
    [divisionsList, selectedSchool, formData.schoolId]
  );

  const openCreateModal = () => {
    setIsCreateMode(true);
    setSelectedUser(null);
    setFormData(emptyForm);
    setError('');
    setSuccess('');
  };

  const openEditModal = (user) => {
    setIsCreateMode(false);
    setSelectedUser(user);
    setFormData({
      _id: user._id,
      username: user.username || '',
      email: user.email || '',
      password: '',
      role: 'coordinator',
      status: user.status || 'active',
      mappingLevel: user.mappingLevel || 'institute',
      instituteId: user.instituteId?._id || user.instituteId || '',
      schoolId: user.schoolId?._id || user.schoolId || '',
      divisionId: user.divisionId?._id || user.divisionId || '',
    });
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setIsCreateMode(false);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => {
      const next = { ...prev, [name]: value };
      if (name === 'mappingLevel') {
        if (value === 'institute') next.schoolId = '';
        if (value !== 'division') next.divisionId = '';
      }
      if (name === 'instituteId') {
        next.schoolId = '';
        next.divisionId = '';
      }
      if (name === 'schoolId') next.divisionId = '';
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const payload = {
        username: formData.username,
        email: formData.email,
        role: 'coordinator',
        status: formData.status,
        mappingLevel: formData.mappingLevel,
        instituteId: formData.instituteId,
        schoolId: formData.mappingLevel === 'institute' ? '' : formData.schoolId,
        divisionId: formData.mappingLevel === 'division' ? formData.divisionId : '',
      };
      if (isCreateMode) {
        await createCoordinator({ ...payload, password: formData.password });
        setSuccess('Coordinator created successfully.');
      } else {
        const data = await updateUser(formData._id, payload);
        setUsers((prev) => prev.map((user) => (user._id === data.user._id ? data.user : user)).filter((user) => user.role === 'coordinator'));
        setSuccess('Coordinator updated successfully.');
      }
      closeModal();
      fetchAll();
    } catch (err) {
      setError(err.message || 'Unable to save coordinator.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ padding: '0 0 32px 0' }}>
        <div>
          <div className="breadcrumb">SRM Admin <span>&gt;</span> Coordinators</div>
          <h1 className="page-title">Coordinator Management</h1>
          <p className="page-subtitle">Create and manage coordinator mappings by institute, school, or division.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={handleCopyLink} type="button" title="Copy Coordinator Sign In URL to clipboard">
            {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
            {copied ? 'Link Copied!' : 'Copy Sign In Link'}
          </button>
          <button className="btn btn-outline" onClick={openCreateModal}>
            <Plus size={14} /> New Coordinator
          </button>
          <button className="btn btn-outline" onClick={fetchAll} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="main-card" style={{ marginBottom: 24 }}>
        <div className="card-header">
          <div className="card-title"><UsersIcon size={16} color="var(--primary-blue)" /> Coordinators <span className="badge-light">{filteredUsers.length}</span></div>
          <div className="card-actions">
            <input className="search-input" type="search" placeholder="Search coordinators..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
                <th>Mapping</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>Loading coordinators...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No coordinators found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td><div className="user-cell"><div className="user-avatar">{(user.username || user.email || 'A').charAt(0).toUpperCase()}</div><strong>{user.username || '-'}</strong></div></td>
                  <td>{user.email}</td>
                  <td>{user.status || 'active'}</td>
                  <td>{user.mappingLevel || '-'}</td>
                  <td style={{ textAlign: 'right' }}><button className="btn btn-outline" onClick={() => openEditModal(user)}><Edit2 size={14} /> Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {(selectedUser || isCreateMode) && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '820px' }}>
            <div className="modal-header">
              <h2 className="modal-title">{isCreateMode ? 'Create Coordinator' : 'Edit Coordinator'}</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close"><X size={24} /></button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input id="username" name="username" className="form-input" value={formData.username} onChange={handleChange} required />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input id="email" name="email" className="form-input" type="email" value={formData.email} onChange={handleChange} required />
              </div>
              {isCreateMode && (
                <div className="form-group">
                  <label className="form-label" htmlFor="password">Password</label>
                  <input id="password" name="password" className="form-input" type="password" value={formData.password} onChange={handleChange} required />
                </div>
              )}
              <div className="form-group">
                <label className="form-label" htmlFor="mappingLevel">Mapping Level</label>
                <select id="mappingLevel" name="mappingLevel" className="form-input" value={formData.mappingLevel} onChange={handleChange}>
                  <option value="institute">Institute Mapping</option>
                  <option value="school">School Mapping</option>
                  <option value="division">Division Mapping</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="status">Status</label>
                <select id="status" name="status" className="form-input" value={formData.status} onChange={handleChange}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="instituteId">Institute</label>
                <select id="instituteId" name="instituteId" className="form-input" value={formData.instituteId} onChange={handleChange} required>
                  <option value="">Select Institute</option>
                  {institutionsList.map((institution) => (
                    <option key={institution._id} value={institution._id}>{institution.name}</option>
                  ))}
                </select>
              </div>
              {(formData.mappingLevel === 'school' || formData.mappingLevel === 'division') && (
                <div className="form-group">
                  <label className="form-label" htmlFor="schoolId">School</label>
                  <select id="schoolId" name="schoolId" className="form-input" value={formData.schoolId} onChange={handleChange} required>
                    <option value="">Select School</option>
                    {availableSchools.map((school) => (
                      <option key={school._id} value={school._id}>{school.name}</option>
                    ))}
                  </select>
                </div>
              )}
              {formData.mappingLevel === 'division' && (
                <div className="form-group">
                  <label className="form-label" htmlFor="divisionId">Division</label>
                  <select id="divisionId" name="divisionId" className="form-input" value={formData.divisionId} onChange={handleChange} required>
                    <option value="">Select Division</option>
                    {availableDivisions.map((division) => (
                      <option key={division._id} value={division._id}>{division.name}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-secondary" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
              </div>
            </form>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}
