import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { Edit2, Loader2, RefreshCw, Save, Shield, Users as UsersIcon, X } from 'lucide-react';
import { getUsers, updateUser } from '../api/auth';
import '../styles/theme.css';

const emptyForm = {
  _id: '',
  username: '',
  email: '',
  role: 'user',
};

const formatDate = (value) => {
  if (!value) return '-';
  return new Date(value).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
};

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [formData, setFormData] = useState(emptyForm);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers(data.users || []);
    } catch (err) {
      setError(err.message || 'Unable to fetch users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = window.setTimeout(fetchUsers, 0);
    return () => window.clearTimeout(timer);
  }, []);

  const filteredUsers = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return users;

    return users.filter((user) => {
      return [user.username, user.email, user.role].some((value) =>
        String(value || '').toLowerCase().includes(query)
      );
    });
  }, [searchQuery, users]);

  const openEditModal = (user) => {
    setSelectedUser(user);
    setFormData({
      _id: user._id,
      username: user.username || '',
      email: user.email || '',
      role: user.role || 'user',
    });
    setError('');
    setSuccess('');
  };

  const closeModal = () => {
    setSelectedUser(null);
    setFormData(emptyForm);
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    try {
      const data = await updateUser(formData._id, {
        username: formData.username,
        email: formData.email,
        role: formData.role,
      });

      setUsers((prev) => prev.map((user) => (user._id === data.user._id ? data.user : user)));
      setSuccess('User updated successfully.');
      closeModal();
    } catch (err) {
      setError(err.message || 'Unable to update user.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ padding: '0 0 32px 0' }}>
        <div>
          <div className="breadcrumb">SRM Admin <span>&gt;</span> Users</div>
          <h1 className="page-title">User Management</h1>
          <p className="page-subtitle">View admin users and update their access roles.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      <div className="main-card">
        <div className="card-header">
          <div className="card-title">
            <UsersIcon size={16} color="var(--primary-blue)" />
            Users <span className="badge-light">{filteredUsers.length}</span>
          </div>
          <div className="card-actions">
            <input
              className="search-input"
              type="search"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
            />
          </div>
        </div>

        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((user) => (
                  <tr key={user._id}>
                    <td>
                      <div className="user-cell">
                        <div className="user-avatar">{(user.username || user.email || 'A').charAt(0).toUpperCase()}</div>
                        <strong>{user.username || '-'}</strong>
                      </div>
                    </td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-pill role-${user.role || 'user'}`}>
                        <Shield size={13} /> {user.role || 'user'}
                      </span>
                    </td>

                    <td>{formatDate(user.createdAt)}</td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-outline" onClick={() => openEditModal(user)}>
                        <Edit2 size={14} /> Edit
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedUser && createPortal(
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <h2 className="modal-title">Edit User</h2>
              <button className="modal-close" onClick={closeModal} aria-label="Close">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label" htmlFor="username">Username</label>
                <input
                  id="username"
                  name="username"
                  className="form-input"
                  value={formData.username}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  className="form-input"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  readOnly
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="role">Role</label>
                <select
                  id="role"
                  name="role"
                  className="form-input"
                  value={formData.role}
                  onChange={handleChange}
                >
                  <option value="superadmin">Super Admin</option>
                  <option value="admin">Admin</option>
                  <option value="user">User</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px' }}>
                <button type="button" className="btn-secondary" onClick={closeModal}>
                  Cancel
                </button>
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
