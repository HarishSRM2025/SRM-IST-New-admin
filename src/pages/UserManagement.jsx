import { useEffect, useMemo, useState } from 'react';
import { Edit2, RefreshCw, Shield, Users as UsersIcon } from 'lucide-react';
import { getUsers, updateUser } from '../api/auth';
import '../styles/theme.css';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getUsers();
      setUsers((data.users || []).filter((user) => user.role !== 'coordinator'));
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
    return users.filter((user) => [user.username, user.email, user.role, user.status].some((value) => String(value || '').toLowerCase().includes(query)));
  }, [searchQuery, users]);

  const handleToggleStatus = async (user) => {
    setSaving(true);
    try {
      const nextStatus = user.status === 'inactive' ? 'active' : 'inactive';
      const data = await updateUser(user._id, {
        username: user.username,
        email: user.email,
        role: user.role,
        status: nextStatus,
      });
      setUsers((prev) => prev.map((item) => (item._id === data.user._id ? data.user : item)));
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
          <p className="page-subtitle">Manage non-coordinator admin users.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchUsers} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="main-card">
        <div className="card-header">
          <div className="card-title">
            <UsersIcon size={16} color="var(--primary-blue)" />
            Users <span className="badge-light">{filteredUsers.length}</span>
          </div>
          <div className="card-actions">
            <input className="search-input" type="search" placeholder="Search users..." value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} />
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>Loading users...</td></tr>
              ) : filteredUsers.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>No users found.</td></tr>
              ) : filteredUsers.map((user) => (
                <tr key={user._id}>
                  <td>
                    <div className="user-cell">
                      <div className="user-avatar">{(user.username || user.email || 'A').charAt(0).toUpperCase()}</div>
                      <strong>{user.username || '-'}</strong>
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td><span className={`role-pill role-${user.role || 'user'}`}><Shield size={13} /> {user.role || 'user'}</span></td>
                  <td>{user.status || 'active'}</td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn-outline" onClick={() => handleToggleStatus(user)} disabled={saving}>
                      <Edit2 size={14} /> {user.status === 'inactive' ? 'Activate' : 'Deactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
