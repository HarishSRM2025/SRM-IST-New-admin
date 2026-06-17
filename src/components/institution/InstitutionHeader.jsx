import React from 'react';
import { Plus } from 'lucide-react';
import SearchBar from '../common/SearchBar';

const InstitutionHeader = ({ 
  handleOpenModal, 
  searchQuery, 
  setSearchQuery,
  title = "Institution Details",
  subtitle = "Manage the core identity, vision, and mission.",
  buttonText = "New Institution",
  breadcrumbSection = "Institution"
}) => {
  return (
    <div className="page-header" style={{ padding: '0 0 32px 0' }}>
      <div>
        <div className="breadcrumb">SRM Admin <span>&gt;</span> {breadcrumbSection}</div>
        <h1 className="page-title">{title}</h1>
        <p className="page-subtitle">{subtitle}</p>
      </div>
      <div className="header-actions" style={{ alignItems: 'center' }}>
        <SearchBar 
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          placeholder="Search..."
        />
        {handleOpenModal && (
          <button className="btn-primary" onClick={() => handleOpenModal()}>
            <Plus size={16} />
            {buttonText}
          </button>
        )}
      </div>
    </div>
  );
};

export default InstitutionHeader;
