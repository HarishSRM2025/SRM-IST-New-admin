import React from 'react';
import { Bell, User, LogOut } from 'lucide-react';

const Topbar = () => {
  return (
    <header className="topbar">
      <div className="flex items-center gap-2">
        <button className="btn btn-outline" style={{ border: 'none', padding: 8, color: 'var(--text-gray)' }}><LogOut size={18} /></button>
        <button className="btn btn-outline" style={{ border: 'none', padding: 8, color: 'var(--text-gray)' }}><Bell size={18} /></button>
        <button className="btn btn-outline" style={{ border: 'none', padding: 8, color: 'var(--text-gray)' }}><User size={18} /></button>
        <div className="sidebar-logo-icon" style={{ width: 32, height: 32, fontSize: 14, borderRadius: '50%', marginLeft: 8 }}>A</div>
      </div>
    </header>
  );
};

export default Topbar;
