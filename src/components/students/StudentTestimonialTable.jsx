import React from 'react';
import { Edit2, Loader2, Trash2, ExternalLink } from 'lucide-react';
import Pagination from '../common/Pagination';

const StudentTestimonialTable = ({
  fetching,
  dataList,
  handleOpenModal,
  handleDelete,
  pagination,
}) => {
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
              <th style={{ width: '15%' }}>Thumbnail</th>
              <th style={{ width: '25%' }}>Student Name</th>
              <th style={{ width: '30%' }}>Role / Department</th>
              <th style={{ width: '15%' }}>Video ID</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    {item.videoId ? (
                      <div style={{ position: 'relative', width: '80px', aspectRatio: '16/9', borderRadius: '4px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
                        <img
                          src={`https://img.youtube.com/vi/${item.videoId}/hqdefault.jpg`}
                          alt={item.name}
                          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: '80px', aspectRatio: '16/9', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--border-color)', borderRadius: '4px', fontSize: '11px', color: 'var(--text-gray)' }}>
                        No Video
                      </div>
                    )}
                  </td>
                  <td>
                    <strong>{item.name}</strong>
                  </td>
                  <td>
                    <span style={{ color: 'var(--text-gray)' }}>{item.role}</span>
                  </td>
                  <td>
                    <a
                      href={`https://www.youtube.com/watch?v=${item.videoId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: 'var(--primary-blue)', textDecoration: 'none', fontWeight: '500' }}
                    >
                      {item.videoId}
                      <ExternalLink size={12} />
                    </a>
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
                <td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No student testimonials available. Click "Add Testimonial" to create one.
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

export default StudentTestimonialTable;
