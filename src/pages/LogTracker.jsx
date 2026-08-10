import { useEffect, useMemo, useState } from 'react';
import { RefreshCw, Shield, Search, FilterX } from 'lucide-react';
import { getAuditLogs, getUsers } from '../api/auth';
import '../styles/theme.css';

const getSession = () => {
  const raw =
    sessionStorage.getItem('srm_coordinator_session') ||
    sessionStorage.getItem('srm_admin_session') ||
    localStorage.getItem('srm_admin_session');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export default function LogTracker() {
  const [logs, setLogs] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const session = useMemo(() => getSession(), []);
  const isCoordinator = session?.role === 'coordinator';
  const [filters, setFilters] = useState({
    user: '',
    userRole: '',
    action: '',
    modulePage: '',
    date: '',
  });

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getAuditLogs();
      setLogs(data.logs || []);
    } catch (err) {
      setError(err.message || 'Unable to load audit logs.');
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    if (isCoordinator) return;
    try {
      const data = await getUsers();
      setUsers(Array.isArray(data.users) ? data.users : []);
    } catch {
      setUsers([]);
    }
  };

  useEffect(() => {
    fetchLogs();
    fetchUsers();
  }, []);

  const options = useMemo(() => {
    const adminUserOptionsFromApi = users
      .filter((user) => user.role !== 'coordinator')
      .map((user) => user.username || user.email || '')
      .filter(Boolean);

    const coordinatorUsersFromApi = users
      .filter((user) => user.role === 'coordinator')
      .map((user) => user.username || user.email || '')
      .filter(Boolean);

    const logAdminUsers = logs
      .filter((log) => log.userId?.role !== 'coordinator')
      .map((log) => log.userId?.username || log.userId?.email || '')
      .filter(Boolean);

    const logCoordinatorUsers = logs
      .filter((log) => log.userId?.role === 'coordinator')
      .map((log) => log.userId?.username || log.userId?.email || '')
      .filter(Boolean);

    return {
      users: [...new Set([...adminUserOptionsFromApi, ...logAdminUsers])].sort(),
      coordinators: [...new Set([...coordinatorUsersFromApi, ...logCoordinatorUsers])].sort(),
      actions: ['added', 'updated', 'deleted'],
      modules: [
        'institution',
        'school',
        'school division',
        'faculty',
        'research item',
        'programme',
        'activity item',
        'testimonial',
        'slider',
        'career item',
        'about content',
      ],
    };
  }, [logs, users]);

  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const userLabel = log.userId?.username || log.userId?.email || '';
      const logDate = log.createdAt ? new Date(log.createdAt).toISOString().slice(0, 10) : '';
      const action = String(log.action || '').toLowerCase();
      const modulePage = String(log.modulePage || '').toLowerCase();

      const matchesUser = !filters.user || userLabel.toLowerCase() === filters.user.toLowerCase();
      const matchesCoordinator = !filters.userRole || userLabel.toLowerCase() === filters.userRole.toLowerCase();
      const matchesAction = !filters.action || action.includes(filters.action.toLowerCase());
      const matchesModulePage = !filters.modulePage || modulePage.includes(filters.modulePage.toLowerCase());
      const matchesDate = !filters.date || logDate === filters.date;

      return (
        isCoordinator ||
        (matchesUser && matchesCoordinator && matchesAction && matchesModulePage && matchesDate)
      );
    });
  }, [filters, isCoordinator, logs]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearFilters = () => setFilters({ user: '', userRole: '', action: '', modulePage: '', date: '' });

  return (
    <div>
      <div className="page-header" style={{ padding: '0 0 32px 0' }}>
        <div>
          <div className="breadcrumb">SRM Admin <span>&gt;</span> Audit Logs</div>
          <h1 className="page-title">Log Tracker</h1>
          <p className="page-subtitle">Filter user actions by user, action, module, and date.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={fetchLogs} disabled={loading}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {!isCoordinator && (
        <div className="main-card" style={{ marginBottom: 24 }}>
          <div className="card-header">
            <div className="card-title">
              <Shield size={16} color="var(--primary-blue)" />
              Filters
            </div>
            <div className="card-actions">
              <button className="btn btn-outline" onClick={clearFilters}>
                <FilterX size={14} /> Clear
              </button>
            </div>
          </div>
          <div style={{ padding: 24, display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16 }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">User</label>
              <select name="user" className="form-input" value={filters.user} onChange={handleChange}>
                <option value="">All Users</option>
                {options.users.map((user) => <option key={user} value={user}>{user}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Coordinator User</label>
              <select name="userRole" className="form-input" value={filters.userRole} onChange={handleChange}>
                <option value="">All Coordinators</option>
                {options.coordinators.map((coordinator) => (
                  <option key={coordinator} value={coordinator}>{coordinator}</option>
                ))}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Action</label>
              <select name="action" className="form-input" value={filters.action} onChange={handleChange}>
                <option value="">All Actions</option>
                {options.actions.map((action) => <option key={action} value={action}>{action}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Module/Page</label>
              <select name="modulePage" className="form-input" value={filters.modulePage} onChange={handleChange}>
                <option value="">All Modules</option>
                {options.modules.map((modulePage) => <option key={modulePage} value={modulePage}>{modulePage}</option>)}
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Date</label>
              <input name="date" type="date" className="form-input" value={filters.date} onChange={handleChange} />
            </div>
          </div>
        </div>
      )}

      <div className="main-card">
        <div className="card-header">
          <div className="card-title">
            <Search size={16} color="var(--primary-blue)" />
            {isCoordinator ? 'My Activity' : 'Results'} <span className="badge-light">{filteredLogs.length}</span>
          </div>
        </div>
        <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Action</th>
                <th>Module/Page</th>
                <th>Date &amp; Time</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>Loading logs...</td></tr>
              ) : filteredLogs.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign: 'center', padding: 40 }}>{isCoordinator ? 'No activity found yet.' : 'No logs match the current filters.'}</td></tr>
              ) : filteredLogs.map((log) => (
                <tr key={log._id}>
                  <td>{log.userId?.username || log.userId?.email || '-'}</td>
                  <td>{log.userId?.role || '-'}</td>
                  <td>{log.action}</td>
                  <td>{log.modulePage}</td>
                  <td>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
