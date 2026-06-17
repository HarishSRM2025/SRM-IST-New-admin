import React from 'react';
import { NavLink } from 'react-router-dom';

const SubNav = ({ tabs }) => {
  return (
    <div style={{
      display: 'flex',
      gap: '24px',
      borderBottom: '1px solid var(--border-color)',
      marginBottom: '24px',
      padding: '0 32px'
    }}>
      {tabs.map((tab, index) => (
        <NavLink
          key={index}
          to={tab.path}
          style={({ isActive }) => ({
            padding: '12px 4px',
            textDecoration: 'none',
            fontSize: '14px',
            fontWeight: '600',
            color: isActive ? 'var(--primary-blue)' : 'var(--text-gray)',
            borderBottom: isActive ? '2px solid var(--primary-blue)' : '2px solid transparent',
            transition: 'var(--transition)',
            marginBottom: '-1px'
          })}
          end={tab.end}
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
};

export default SubNav;
