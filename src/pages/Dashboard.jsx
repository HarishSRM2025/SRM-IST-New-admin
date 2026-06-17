import React from 'react';
import { Users, Building, FileText, Activity, RefreshCw } from 'lucide-react';
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

const Dashboard = () => {
  return (
    <div>
      <div className="page-header" style={{ padding: '0 0 32px 0' }}>
        <div>
          <div className="breadcrumb">SRM Admin <span>&gt;</span> Dashboard</div>
          <h1 className="page-title">Dashboard Overview</h1>
          <p className="page-subtitle">Welcome back! Here is what's happening today.</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline"><RefreshCw size={14} /> Refresh</button>
        </div>
      </div>

      <div className="stats-grid">
        <StatCard 
          title="Total Students" 
          value="12,450" 
          icon={Users} 
          iconColor="#3b82f6" 
          iconBg="#eff6ff"
          trend="↑ +120"
          trendLabel="this month"
          trendClass="trend-up"
        />
        <StatCard 
          title="Departments" 
          value="48" 
          icon={Building} 
          iconColor="#10b981" 
          iconBg="#ecfdf5"
          trend="↑ +2"
          trendLabel="this year"
          trendClass="trend-up"
        />
        <StatCard 
          title="Total Applications" 
          value="3,210" 
          icon={FileText} 
          iconColor="#8b5cf6" 
          iconBg="#f5f3ff"
          trend="↑ +430"
          trendLabel="this week"
          trendClass="trend-up"
        />
        <StatCard 
          title="Active Sessions" 
          value="1,124" 
          icon={Activity} 
          iconColor="#f59e0b" 
          iconBg="#fffbeb"
          trend="↓ -12"
          trendLabel="today"
          trendClass="trend-down"
        />
      </div>

      <div className="main-card">
        <div className="card-header">
          <div className="card-title">
            <Activity size={16} color="var(--primary-blue)" />
            Recent Activity
          </div>
        </div>
        <div className="empty-state" style={{ padding: '60px 20px' }}>
          <div className="empty-icon">
            <FileText size={28} />
          </div>
          <p className="empty-text">No recent activity to show.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
