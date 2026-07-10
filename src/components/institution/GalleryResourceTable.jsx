import React from 'react';
import { Loader2, Edit2, Trash2, Video, FileText, Image as ImageIcon } from 'lucide-react';
import Pagination from '../common/Pagination';

const GalleryResourceTable = ({ fetching, dataList, institutionsList, handleOpenModal, handleDelete, pagination }) => {

  const getInstitutionName = (id) => {
    const inst = institutionsList.find(i => i._id === id);
    return inst ? inst.name : 'Unknown Institution';
  };

  const getBadgeClass = (type) => {
    switch (type) {
      case 'photos':
        return 'badge-cyan';
      case 'videos':
        return 'badge-red';
      case 'downloads':
        return 'badge-green';
      case 'reports':
        return 'badge-purple';
      default:
        return 'badge-secondary';
    }
  };

  const getAssetUrl = (fileNameOrPath) => {
    if (!fileNameOrPath) return '';
    let clean = fileNameOrPath.replace(/^(public[/\\]uploads[/\\])/i, '');
    return `${API_BASE}/public/uploads/${clean.replace(/\\/g, '/')}`;
  };

  const renderMediaPreview = (item) => {
    switch (item.galleryType) {
      case 'photos':
        return item.galleryImage ? (
          <img
            src={getAssetUrl(item.galleryImage)}
            alt={item.title}
            style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
          />
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
            <ImageIcon size={18} />
          </div>
        );
      case 'videos':
        return item.videoLink ? (
          <a href={item.videoLink} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#fee2e2', color: '#ef4444', border: '1px solid #fca5a5' }} title="Watch Video">
            <Video size={20} />
          </a>
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
            <Video size={18} />
          </div>
        );
      case 'downloads':
      case 'reports':
        return item.pdfFile ? (
          <a href={getAssetUrl(item.pdfFile)} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '48px', height: '48px', borderRadius: '8px', backgroundColor: '#dcfce7', color: '#15803d', border: '1px solid #bbf7d0' }} title="Download File">
            <FileText size={20} />
          </a>
        ) : (
          <div style={{ width: '48px', height: '48px', borderRadius: '8px', backgroundColor: 'var(--bg-body)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-light)' }}>
            <FileText size={18} />
          </div>
        );
      default:
        return null;
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
              <th style={{ width: '10%' }}>Resource</th>
              <th style={{ width: '20%' }}>Title</th>
              <th style={{ width: '15%' }}>Type</th>
              <th style={{ width: '20%' }}>Institution</th>
              <th style={{ width: '20%' }}>Description</th>
              <th style={{ width: '15%', textAlign: 'center' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {dataList.length > 0 ? (
              dataList.map((item, index) => (
                <tr key={item._id || index}>
                  <td>
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                      {renderMediaPreview(item)}
                    </div>
                  </td>
                  <td><strong>{item.title}</strong></td>
                  <td>
                    <span className={`badge ${getBadgeClass(item.galleryType)}`}>
                      {item.galleryType.toUpperCase()}
                    </span>
                  </td>
                  <td>{getInstitutionName(item.institutionId?._id || item.institutionId)}</td>
                  <td>
                    <div style={{
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      {item.description}
                    </div>
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
                <td colSpan="6" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-gray)' }}>
                  No Gallery or Resource entries available. Click "New Resource" to create one.
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

export default GalleryResourceTable;
