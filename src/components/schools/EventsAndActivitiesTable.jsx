import { Loader2, Edit2, Trash2 } from 'lucide-react';
import Pagination from '../common/Pagination';

const EventsAndActivitiesTable = ({
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

  const formatDateTime = (dateTimeStr) => {
    if (!dateTimeStr) return '';
    try {
      const date = new Date(dateTimeStr);
      if (isNaN(date.getTime())) {
        return dateTimeStr; // Legacy text fallback
      }
      return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return dateTimeStr;
    }
  };

  const getTypeLabel = (type) => {
    switch (type) {
      case 'competition':
        return 'Competition';
      case 'activity':
        return 'Activity';
      case 'visit':
        return 'Visit';
      case 'workshop':
        return 'Workshop';
      case 'seminar':
        return 'Seminar';
      case 'conference':
        return 'Conference';
      case 'other':
        return 'Other';
      default:
        return type || 'Other';
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return { background: 'rgba(16, 185, 129, 0.1)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.2)' };
      case 'ongoing':
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'upcoming':
      default:
        return { background: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6', border: '1px solid rgba(59, 130, 246, 0.2)' };
    }
  };

  const getTypeStyle = (type) => {
    switch (type) {
      case 'competition':
        return { background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)' };
      case 'activity':
        return { background: 'rgba(139, 92, 246, 0.1)', color: '#8b5cf6', border: '1px solid rgba(139, 92, 246, 0.2)' };
      case 'visit':
        return { background: 'rgba(13, 148, 136, 0.1)', color: '#0d9488', border: '1px solid rgba(13, 148, 136, 0.2)' };
      case 'workshop':
        return { background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.2)' };
      case 'seminar':
        return { background: 'rgba(6, 182, 212, 0.1)', color: '#06b6d4', border: '1px solid rgba(6, 182, 212, 0.2)' };
      case 'conference':
        return { background: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', border: '1px solid rgba(37, 99, 235, 0.2)' };
      case 'other':
        return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
      default:
        return { background: 'rgba(107, 114, 128, 0.1)', color: '#6b7280', border: '1px solid rgba(107, 114, 128, 0.2)' };
    }
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
              <th style={{ width: '10%' }}>{entityLabel}</th>
              <th style={{ width: '10%' }}>Banner</th>
              <th style={{ width: '10%' }}>Name</th>
              <th style={{ width: '10%' }}>Type</th>
              <th style={{ width: '15%' }}>Date / Time</th>
              <th style={{ width: '15%' }}>Location</th>
              <th style={{ width: '10%' }}>Status</th>
              <th style={{ width: '10%' }}>Announcement</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => {
                const imageUrl = (() => {
                  if (!item.eventImage || (Array.isArray(item.eventImage) && item.eventImage.length === 0)) return null;
                  const img = Array.isArray(item.eventImage) ? item.eventImage[0] : item.eventImage;
                  if (!img || typeof img !== 'string') return null;
                  const fileName = img.split('\\').pop().split('/').pop();
                  return `${import.meta.env.VITE_API_URL.replace('/api', '')}/public/uploads/${fileName}`;
                })();

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
                        <div style={{
                          width: '60px',
                          height: '40px',
                          background: 'var(--bg-body)',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '10px',
                          color: 'var(--text-light)',
                          border: '1px solid var(--border-color)'
                        }}>
                          No Image
                        </div>
                      )}
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start' }}>
                        <span style={{ fontWeight: '600' }}>{item.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '10px',
                        padding: '1px 6px',
                        borderRadius: '10px',
                        textTransform: 'uppercase',
                        fontWeight: '700',
                        ...getTypeStyle(item.type)
                      }}>
                        {getTypeLabel(item.type)}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: '13px', color: 'var(--text-gray)' }}>{formatDateTime(item.eventDateTime)}</span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', fontSize: '13px' }}>
                        <span style={{ color: 'var(--text-gray)' }}>{item.location}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        textTransform: 'capitalize',
                        fontWeight: '600',
                        display: 'inline-block',
                        ...getStatusStyle(item.status)
                      }}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        textTransform: 'capitalize',
                        fontWeight: '600',
                        display: 'inline-block',
                        background: item.announcement ? 'rgba(200, 149, 42, 0.15)' : 'rgba(107, 114, 128, 0.1)',
                        color: item.announcement ? '#92400e' : '#6b7280',
                        border: item.announcement ? '1px solid rgba(200, 149, 42, 0.35)' : '1px solid rgba(107, 114, 128, 0.2)'
                      }}>
                        {item.announcement ? 'Yes' : 'No'}
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
                );
              })
            ) : (
              <tr>
                <td colSpan="9" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No Events or Activities available. Click "New Record" to create one.
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

export default EventsAndActivitiesTable;
