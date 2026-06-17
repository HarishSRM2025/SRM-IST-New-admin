import React from 'react';
import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const AchievementsTable = ({
  fetching,
  dataList,
  schoolsList,
  handleOpenModal,
  handleDelete,
  pagination,
  entityField = 'school',
  entityLabel = 'School'
}) => {

  const getSchoolName = (idOrSchoolObj) => {
    if (!idOrSchoolObj) return 'Unknown School';
    if (typeof idOrSchoolObj === 'object' && idOrSchoolObj.name) {
      return idOrSchoolObj.name;
    }
    const school = schoolsList.find(s => s._id === idOrSchoolObj);
    return school ? school.name : 'Unknown School';
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const getStatusStyle = (status) => {
    if (status === 'active') {
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
    }
    return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
  };

  const getBadgeStyle = (categoryOrType) => {
    switch (categoryOrType) {
      // Type/Levels
      case 'inter-school':
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
      case 'state-level':
        return { background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' };
      case 'national-level':
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'international-level':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      
      // Categories
      case 'academic':
        return { background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' };
      case 'sports':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'cultural':
        return { background: 'rgba(236, 72, 153, 0.1)', color: '#ec4899', border: '1px solid rgba(236, 72, 153, 0.2)' };
      case 'science-and-technology':
        return { background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' };
      default:
        return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
    }
  };

  const badgeBaseStyle = {
    display: 'inline-block',
    padding: '4px 10px',
    fontSize: '11px',
    fontWeight: '600',
    borderRadius: '12px',
    textTransform: 'capitalize',
    whiteSpace: 'nowrap',
    textAlign: 'center',
    lineHeight: '1.2'
  };

  return (
    <div className="table-container animate-fade-in">
      {fetching ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <Loader2 className="animate-spin text-blue-600" size={32} />
        </div>
      ) : (
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>{entityLabel}</th>
              <th style={{ width: '10%' }}>Image</th>
              <th style={{ width: '18%' }}>Title</th>
              <th style={{ width: '15%' }}>Achiever</th>
              <th style={{ width: '12%' }}>Type / Level</th>
              <th style={{ width: '11%' }}>Category</th>
              <th style={{ width: '10%' }}>Date</th>
              <th style={{ width: '6%' }}>Status</th>
              <th style={{ width: '6%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => {
                const imageUrl = item.achievementImage
                  ? `${import.meta.env.VITE_API_URL.replace('/api', '')}/public/uploads/${item.achievementImage}`
                  : null;

                return (
                  <tr key={item._id || index}>
                    <td><strong>{getSchoolName(item[entityField])}</strong></td>
                    <td>
                      {imageUrl ? (
                        <img
                          src={imageUrl}
                          alt="Banner"
                          style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                        />
                      ) : (
                        <div style={{ width: '60px', height: '40px', background: '#f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: '#9ca3af', borderRadius: '4px' }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{item.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--gray)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '200px' }}>{item.description}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>{item.achieverName}</div>
                      <span style={{ fontSize: '11px', textTransform: 'capitalize', color: 'var(--gray)' }}>{item.achieverDesignation || 'student'}</span>
                    </td>
                    <td>
                      <span style={{ ...badgeBaseStyle, ...getBadgeStyle(item.achievementType) }}>
                        {item.achievementType ? item.achievementType.replace('-', ' ') : ''}
                      </span>
                    </td>
                    <td>
                      <span style={{ ...badgeBaseStyle, ...getBadgeStyle(item.achievementCategory) }}>
                        {item.achievementCategory ? item.achievementCategory.replace('-', ' ') : ''}
                      </span>
                    </td>
                    <td>{formatDate(item.achievementDate)}</td>
                    <td>
                      <span style={{ ...badgeBaseStyle, ...getStatusStyle(item.status) }}>
                        {item.status}
                      </span>
                    </td>
                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px' }}
                          onClick={() => handleOpenModal(item)}
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button 
                          className="btn-secondary" 
                          style={{ padding: '6px 12px', color: '#ef4444', borderColor: 'rgba(239,68,68,0.2)' }}
                          onClick={() => handleDelete(item._id)}
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
                  No achievements found. Click "New Achievement" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {!fetching && pagination && (
        <Pagination 
          currentPage={pagination.currentPage}
          totalPages={pagination.totalPages}
          onPageChange={pagination.onPageChange}
          totalItems={pagination.totalItems}
          itemsPerPage={pagination.itemsPerPage}
        />
      )}
    </div>
  );
};

export default AchievementsTable;
