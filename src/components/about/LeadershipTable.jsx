import React from 'react';
import { Loader2, Edit2, Trash2, Star } from 'lucide-react';
import Pagination from '../common/Pagination';

const getBadgeStyle = (category) => {
  switch (category) {
    case 'Founder':
      return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
    case 'Chairman':
      return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
    case 'Vice Chairman':
      return { background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' };
    case 'Academic Heads':
      return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
    case 'Administrative Heads':
      return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
    default:
      return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
  }
};

const LeadershipTable = ({
  fetching,
  dataList,
  handleOpenModal,
  handleDelete,
  pagination,
  // Hides the Category column when the table is already scoped to a single
  // category context (e.g. inside the "Academic Heads" tab).
  showCategoryColumn = true
}) => {

  const getImageUrl = (imagePath) => {
    const fileName = imagePath.split('\\').pop().split('/').pop();
    return `http://localhost:3000/public/uploads/${fileName}`;
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
              <th style={{ width: '8%' }}>Image</th>
              <th style={{ width: '16%' }}>Name</th>
              <th style={{ width: '16%' }}>Role</th>
              {showCategoryColumn && <th style={{ width: '14%' }}>Category</th>}
              <th style={{ width: '8%', textAlign: 'center' }}>In Home</th>
              <th style={{ width: '12%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    {item.image ? (
                      <img
                        src={getImageUrl(item.image)}
                        alt={item.name}
                        style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '50%', border: '1px solid var(--border-color)' }}
                      />
                    ) : (
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)', fontSize: '10px' }}>No Img</div>
                    )}
                  </td>
                  <td><strong>{item.name}</strong></td>
                  <td><span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>{item.role}</span></td>
                  {showCategoryColumn && (
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 10px',
                        borderRadius: '12px',
                        fontWeight: 600,
                        ...getBadgeStyle(item.category)
                      }}>
                        {item.category}
                      </span>
                    </td>
                  )}
               
                  <td style={{ textAlign: 'center' }}>
                    {item.displayInHome ? (
                      <Star size={16} fill="#f59e0b" color="#f59e0b" />
                    ) : (
                      <span style={{ color: 'var(--text-light)', fontSize: '12px' }}>—</span>
                    )}
                  </td>
                  <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <button
                        className="btn-secondary"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleOpenModal(item)}
                        title="Edit"
                      >
                        <Edit2 size={16} />
                        Edit
                      </button>
                      <button
                        className="btn-danger"
                        style={{ padding: '6px 12px' }}
                        onClick={() => handleDelete(item._id)}
                        title="Delete"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={showCategoryColumn ? 7 : 6} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No entries available. Click "New Entry" to create one.
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

export default LeadershipTable;
