import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Building, FileText, Activity, RefreshCw, ArrowRight } from 'lucide-react';
import { getAuditLogs } from '../api/auth';
import '../styles/theme.css';

const StatCard = ({ title, value, icon: Icon, iconColor, iconBg, trend, trendLabel, trendClass }) => (
  <div className="stat-card">
    <div className="stat-icon" style={{ backgroundColor: iconBg, color: iconColor }}>
      <Icon size={24} strokeWidth={2.5} />
    </div>
    <div className="stat-content">
      <h3 className="stat-value">{value}</h3>
      <span className="stat-title">{title}</span>
      <div className="flex items-center gap-2">
        {trend && <span className={`stat-trend ${trendClass}`}>{trend}</span>}
        {trendLabel && <span className="trend-text">{trendLabel}</span>}
      </div>
    </div>
  </div>
);

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

const Dashboard = () => {
  const navigate = useNavigate();
  const [logs, setLogs] = useState([]);
  const [counts, setCounts] = useState({ institution: 0, schools: 0, divisions: 0 });
  const [loadingStats, setLoadingStats] = useState(true);
  const session = useMemo(() => getSession(), []);
  const isCoordinator = session?.role === 'coordinator';
  const roleLabel = isCoordinator ? 'Coordinator' : 'Admin';
  const scopeLabel = isCoordinator
    ? `${String(session?.mappingLevel || 'department')} scope`
    : 'Overall scope';

  const fetchJsonList = async (url) => {
    const response = await fetch(url);
    const data = await response.json().catch(() => null);
    if (!response.ok) return [];
    if (Array.isArray(data)) return data;
    return data?.data && Array.isArray(data.data) ? data.data : [];
  };

  const loadStats = async () => {
    setLoadingStats(true);
    try {
      const [institutions, schools, divisions] = await Promise.all([
        fetchJsonList(`${import.meta.env.VITE_API_URL}/institution/getall`),
        fetchJsonList(`${import.meta.env.VITE_API_URL}/schools/getall`),
        fetchJsonList(`${import.meta.env.VITE_API_URL}/school-division/getall`),
      ]);
      setCounts({
        institution: institutions.length,
        schools: schools.length,
        divisions: divisions.length,
      });
    } catch {
      setCounts({ institution: 0, schools: 0, divisions: 0 });
    } finally {
      setLoadingStats(false);
    }
  };

  useEffect(() => {
    const loadLogs = async () => {
      try {
        const data = await getAuditLogs();
        setLogs((data.logs || []).filter((log) => {
          const action = String(log.action || '').toLowerCase();
          return action.includes(' added ') || action.includes(' updated ') || action.includes(' deleted ');
        }).slice(0, 5));
      } catch {
        setLogs([]);
      }
    };

    loadLogs();
    loadStats();
  }, []);

  return (
    <div>
      <div className="page-header" style={{ padding: '0 0 32px 0' }}>
        <div>
          <div className="breadcrumb">SRM Admin <span>&gt;</span> Dashboard</div>
          <h1 className="page-title">{roleLabel} Dashboard Overview</h1>
          <p className="page-subtitle">{scopeLabel} only.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline" onClick={loadStats}><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard
          title="Institutions"
          value={loadingStats ? '...' : String(counts.institution)}
          icon={Users}
          iconColor="#3b82f6"
          iconBg="#eff6ff"
          trend={isCoordinator ? 'Scoped' : 'All'}
          trendLabel={isCoordinator ? 'mapped data' : 'overall data'}
          trendClass="trend-up"
        />
        <StatCard
          title="Schools"
          value={loadingStats ? '...' : String(counts.schools)}
          icon={Building}
          iconColor="#10b981"
          iconBg="#ecfdf5"
          trend={isCoordinator ? 'Scoped' : 'All'}
          trendLabel={isCoordinator ? 'mapped data' : 'overall data'}
          trendClass="trend-up"
        />
        <StatCard
          title="School Divisions"
          value={loadingStats ? '...' : String(counts.divisions)}
          icon={FileText}
          iconColor="#8b5cf6"
          iconBg="#f5f3ff"
          trend={isCoordinator ? 'Scoped' : 'All'}
          trendLabel={isCoordinator ? 'mapped data' : 'overall data'}
          trendClass="trend-up"
        />
        <StatCard
          title="Recent Logs"
          value={loadingStats ? '...' : String(logs.length)}
          icon={Activity}
          iconColor="#f59e0b"
          iconBg="#fffbeb"
          trend={isCoordinator ? 'Own logs' : 'All logs'}
          trendLabel="latest activity"
          trendClass="trend-down"
        />
      </div>

      <div className="main-card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={16} color="var(--primary-blue)" />
            Audit Log Preview
          </div>
          <div className="card-actions">
            <button className="btn btn-outline" onClick={() => navigate('/logs')}>
              More <ArrowRight size={14} />
            </button>
          </div>
        </div>
        {logs.length === 0 ? (
          <div className="empty-state" style={{ padding: '60px 20px' }}>
            <div className="empty-icon">
              <FileText size={28} />
            </div>
            <p className="empty-text">No recent audit logs to show.</p>
          </div>
        ) : (
          <div className="table-container" style={{ border: 'none', borderRadius: 0, boxShadow: 'none' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Action</th>
                  <th>Module/Page</th>
                  <th>Date &amp; Time</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log._id}>
                    <td>{log.userId?.username || log.userId?.email || '-'}</td>
                    <td>{log.action}</td>
                    <td>{log.modulePage}</td>
                    <td>{new Date(log.createdAt).toLocaleString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
