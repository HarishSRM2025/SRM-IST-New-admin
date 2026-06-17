import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Building2, Settings, GraduationCap, Users, Microscope, GitBranch, Image } from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const isSchoolRoute = location.pathname.startsWith('/schools') && !location.pathname.startsWith('/schools/divisions');
  const isDivisionRoute = location.pathname.startsWith('/school-divisions') || location.pathname.startsWith('/schools/divisions');

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <div className="sidebar-logo-icon">S</div>
          <span className="sidebar-title">SRM <span className="badge">Admin</span></span>
        </div>
      </div>
      
      <div className="sidebar-nav-group">
        <div className="sidebar-nav-label">Main</div>
        <NavLink to="/" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} end>
          <div className="nav-item-left"><LayoutDashboard size={18} /> Dashboard</div>
        </NavLink>
        <NavLink to="/sliders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Image size={18} /> Sliders</div>
        </NavLink>
        <NavLink to="/institution" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Building2 size={18} /> Institution</div>
        </NavLink>
        <NavLink to="/schools" className={() => `nav-item ${isSchoolRoute ? 'active' : ''}`}>
          <div className="nav-item-left"><GraduationCap size={18} /> Schools</div>
        </NavLink>
        <NavLink to="/school-divisions" className={() => `nav-item ${isDivisionRoute ? 'active' : ''}`}>
          <div className="nav-item-left"><GitBranch size={18} /> School Divisions</div>
        </NavLink>
        <NavLink to="/faculty" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Users size={18} /> Faculty</div>
        </NavLink>
        <NavLink to="/research" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Microscope size={18} /> Research</div>
        </NavLink>
      </div>

      <div className="sidebar-nav-group">
        <div className="sidebar-nav-label">System</div>
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <div className="nav-item-left"><Settings size={18} /> Settings</div>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
