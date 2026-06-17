import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Topbar from '../components/common/Topbar';
import '../styles/theme.css';

const AdminLayout = () => {
  return (
    <div className="admin-container">
      <Sidebar />

      {/* Main Content Area */}
      <main className="main-content">
        <Topbar />

        {/* Page Content */}
        <div className="page-content animate-fade-in" style={{ paddingTop: 32 }}>
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
