import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import SubNav from '../components/common/SubNav';
import InstitutionHeader from '../components/institution/InstitutionHeader';
import Pagination from '../components/common/Pagination';
import TableTopHeader from '../components/common/TableTopHeader';
import AnnouncementModal from '../components/common/AnnouncementModal';
import { Plus, Save, Loader2, Edit2, Trash2 } from 'lucide-react';
import './Announcements.css';

const instituteTabs = [
  { label: 'Institute Details', path: '/institution', end: true },
  { label: 'Institute Stats', path: '/institution/stats', end: false },
  { label: 'Dean Message', path: '/institution/dean-message', end: false },
  { label: 'Infrastructure', path: '/institution/infrastructure', end: false },
  { label: 'Gallery & Resources', path: '/institution/gallery-resource', end: false },
  { label: 'Events & Activities', path: '/institution/events-and-activities', end: false },
  { label: 'Announcement', path: '/institution/announcement', end: false },
  { label: 'Programmes Offered', path: '/institution/programmes', end: false }
];
const schoolTabs = [
  { label: 'School Details', path: '/schools', end: true },
  { label: 'HOD Message', path: '/schools/hod-message', end: false },
  { label: 'Programmes', path: '/schools/programmes', end: false },
  { label: 'Achievements', path: '/schools/achievements', end: false },
  { label: 'Events & Activities', path: '/schools/events-and-activities', end: false },
  { label: 'Announcement', path: '/schools/announcement', end: false }
];

const divisionTabs = [
  { label: 'Division Details', path: '/school-divisions', end: true },
  { label: 'HOD Message', path: '/school-divisions/hod-message', end: false },
  { label: 'Programmes', path: '/school-divisions/programmes', end: false },
  { label: 'Achievements', path: '/school-divisions/achievements', end: false },
  { label: 'Events & Activities', path: '/school-divisions/events-and-activities', end: false },
  { label: 'Announcement', path: '/school-divisions/announcement', end: false }
];

const API = `${import.meta.env.VITE_API_URL}/announcements`;
const blankCategory = { name: '', status: 'active' };
const blankAnnouncement = { title: '', school_or_institution_id: '', announcement_category_id: '', url: '', publish_date: '', announcement_type: 'marquee', status: 'active' };
const localDate = value => {
  if (!value) return '';
  const date = new Date(value);
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
};
async function request(path, method = 'GET', body) {
  // Supply the session explicitly, including on the first render before App's fetch effect.
  const raw = sessionStorage.getItem('srm_coordinator_session') || sessionStorage.getItem('srm_admin_session') || localStorage.getItem('srm_admin_session');
  const session = raw ? JSON.parse(raw) : null;
  const response = await fetch(`${API}${path}`, { method, headers: { 'Content-Type': 'application/json', 'x-user-id': session?.id || '' }, ...(body ? { body: JSON.stringify(body) } : {}) });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Request failed.');
  return data;
}
export default function Announcements({ module }) {
  const [categories, setCategories] = useState([]);
  const [owners, setOwners] = useState([]);
  const [rows, setRows] = useState([]);
  const [category, setCategory] = useState(blankCategory);
  const [form, setForm] = useState(blankAnnouncement);
  const [modal, setModal] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const isDivision = module === 'school-division';
  const modulePath = isDivision ? 'school-divisions' : module;
  const entityLabel = isDivision ? 'School Division' : module === 'institution' ? 'Institution' : 'School';
  const query = `?module=${module}`;
  const load = async () => {
    const [cats, options, items] = await Promise.all([request('/categories'), request(`/owners${query}`), request(`/${query}`)]);
    setCategories(cats); setOwners(options); setRows(items);
  };
  useEffect(() => {
    let cancelled = false;
    Promise.all([request('/categories'), request(`/owners?module=${module}`), request(`/?module=${module}`)])
      .then(([cats, options, items]) => { if (!cancelled) { setCategories(cats); setOwners(options); setRows(items); } })
      .catch(err => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [module]);
  const close = () => { if (!busy) { setModal(null); setDeleteTarget(null); setError(''); } };
  const openAnnouncement = row => {
    setForm(row ? { ...row, announcement_category_id: row.announcement_category_id || '', publish_date: localDate(row.publish_date || new Date()), announcement_type: row.announcement_type || (row.announcement_category_id ? 'category' : 'marquee') } : { ...blankAnnouncement, publish_date: localDate(new Date()) });
    setError(''); setNotice(''); setModal('announcement');
  };
  const mutate = async (action, message) => {
    setBusy(true); setError(''); setNotice('');
    try { await action(); await load(); setNotice(message); setModal(null); setDeleteTarget(null); }
    catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const saveCategory = e => {
    e.preventDefault();
    mutate(() => request(`/categories${category._id ? `/${category._id}` : ''}`, category._id ? 'PUT' : 'POST', category), 'Category saved.');
  };
  const saveAnnouncement = e => {
    e.preventDefault();
    mutate(() => request(`/${form._id || ''}${query}`, form._id ? 'PUT' : 'POST', { ...form, announcement_category_id: form.announcement_type !== 'marquee' ? form.announcement_category_id : null, publish_date: new Date(`${form.publish_date}T00:00:00`).toISOString(), expiry_date: null }), 'Announcement saved.');
  };
  const confirmDelete = () => mutate(() => request(deleteTarget.kind === 'category' ? `/categories/${deleteTarget.row._id}` : `/${deleteTarget.row._id}${query}`, 'DELETE'), 'Deleted successfully.');
  const change = e => {
    const { name, value } = e.target;
    setForm(previous => ({ ...previous, [name]: value, ...(name === 'announcement_type' && value === 'marquee' ? { announcement_category_id: '' } : {}) }));
  };
  const ownerName = row => owners.find(o => o._id === row.school_or_institution_id)?.name || '—';
  const categoryName = row => categories.find(c => c._id === row.announcement_category_id)?.name || 'No category';
  const filtered = rows.filter(row => [row.title, row.url, ownerName(row), categoryName(row), row.source_type, row.status].some(value => String(value || '').toLowerCase().includes(search.trim().toLowerCase())));
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(filtered.length / itemsPerPage));
  const currentPage = Math.min(page, totalPages);
  const visibleRows = filtered.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const statusOptions = <><option value="active">Active</option><option value="inactive">Inactive</option></>;
  const errorAlert = error && <div role="alert" className="alert alert-error">{error}</div>;
  const saveButtons = editing => <div className="announcement-modal-actions">
    <button type="button" className="btn-secondary" onClick={close} disabled={busy}>Cancel</button>
    <button type="submit" className="btn-primary" disabled={busy}>{busy ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}{busy ? 'Saving...' : editing ? 'Update Record' : 'Add Record'}</button>
  </div>;
  return <div className="announcement-page">
    <InstitutionHeader title={`${isDivision ? 'School Division' : module === 'institution' ? 'Institute' : 'School'} Announcements`}
      subtitle="Manage announcements and their categories." breadcrumbSection={isDivision ? 'School Divisions' : module === 'institution' ? 'Institution' : 'Schools'}
      searchQuery={search} setSearchQuery={value => { setSearch(value); setPage(1); }}
      handleOpenModal={loading ? undefined : () => openAnnouncement()} buttonText="New Announcement"
      additionalActions={<button className="btn-primary" disabled={loading || busy} onClick={() => { setCategory(blankCategory); setError(''); setNotice(''); setModal('category'); }}><Plus size={16} />New Announcement Category</button>} />
    <div style={{ margin: '0 -32px' }}><SubNav tabs={isDivision ? divisionTabs : module === 'institution' ? instituteTabs : schoolTabs} /></div>
    {!modal && !deleteTarget && errorAlert}
    {notice && <div role="status" className="alert alert-success">{notice}</div>}
    <div className="table-container animate-fade-in">
      {loading ? <div className="announcement-empty"><Loader2 className="animate-spin" size={32} /></div> : <>
        <TableTopHeader totalItems={filtered.length} currentPage={currentPage} itemsPerPage={itemsPerPage} />
        <div className="announcement-table-scroll"><table className="data-table"><thead><tr>
          <th>{entityLabel}</th><th>Announcement</th><th>Category</th><th>Publish Date</th><th>Status</th><th>Source</th><th style={{ textAlign: 'center' }}>Actions</th>
        </tr></thead><tbody>{visibleRows.map(row => <tr key={row._id}>
          <td><strong>{ownerName(row)}</strong></td><td><strong>{row.title}</strong><small className="announcement-url">{row.url}</small></td>
          <td>{categoryName(row)}</td><td>{row.publish_date ? new Date(row.publish_date).toLocaleDateString() : 'Always'}</td>
          <td><span className={`announcement-status ${row.status}`}>{row.status === 'active' ? 'Active' : 'Inactive'}</span></td><td>{row.source_type === 'event' ? 'Event' : 'Announcement'}</td>
          <td><div className="announcement-row-actions">{row.source_type === 'event' ? <Link className="btn-secondary" to={`/${modulePath}/events-and-activities`}>Manage in Events</Link> : <>
            <button className="btn-secondary" disabled={busy} onClick={() => openAnnouncement(row)}><Edit2 size={16} />Edit</button>
            <button className="btn-danger" disabled={busy} onClick={() => { setError(''); setDeleteTarget({ kind: 'announcement', row }); }}><Trash2 size={16} />Delete</button>
          </>}</div></td>
        </tr>)}{!visibleRows.length && <tr><td colSpan={7} className="announcement-empty" style={{textAlign:'center'}}>{search ? 'No announcements match your search.' : 'No announcements available. Click "New Announcement" to create one.'}</td></tr>}</tbody></table></div>
        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setPage} totalItems={filtered.length} itemsPerPage={itemsPerPage} />
      </>}
    </div>
    {modal === 'category' && !deleteTarget && <AnnouncementModal compact title={category._id ? 'Edit Announcement Category' : 'New Announcement Category'} onClose={close} busy={busy}>
      {errorAlert}
      {categories.length > 0 && <div className="form-group announcement-category-picker">
        <label className="form-label" htmlFor="manage-category">Edit an existing category</label>
        <select id="manage-category" className="form-input" disabled={busy} value={category._id || ''} onChange={e => { setCategory(categories.find(c => c._id === e.target.value) || blankCategory); setError(''); }}>
          <option value="">Create a new category</option>{categories.map(cat => <option key={cat._id} value={cat._id}>{cat.name}{cat.status === 'inactive' ? ' (Inactive)' : ''}</option>)}
        </select>
      </div>}
      <form onSubmit={saveCategory}>
        <fieldset disabled={busy} className="announcement-fieldset">
          <div className="form-group"><label className="form-label" htmlFor="category-name">Category Name</label><input autoFocus id="category-name" className="form-input" required maxLength={150} value={category.name} onChange={e => setCategory({ ...category, name: e.target.value })} placeholder="Enter category name" /></div>
          <div className="form-group"><label className="form-label" htmlFor="category-status">Status</label><select id="category-status" className="form-input" value={category.status} onChange={e => setCategory({ ...category, status: e.target.value })}>{statusOptions}</select></div>
        </fieldset>
        {category._id && <button type="button" className="btn-danger" disabled={busy} onClick={() => { setError(''); setDeleteTarget({ kind: 'category', row: category }); }}><Trash2 size={16} />Delete Category</button>}
        {saveButtons(category._id)}
      </form>
    </AnnouncementModal>}
    {modal === 'announcement' && <AnnouncementModal title={form._id ? 'Edit Announcement' : 'New Announcement'} onClose={close} busy={busy}>
      {errorAlert}<form onSubmit={saveAnnouncement}><fieldset disabled={busy} className="announcement-fieldset announcement-form-grid">
        <div className="form-group"><label className="form-label" htmlFor="announcement-type">Announcement Type</label><select id="announcement-type" className="form-input" required name="announcement_type" value={form.announcement_type} onChange={change}><option value="marquee">Marquee Announcement</option><option value="category">Category Announcement</option><option value="both">Both</option></select></div>
        <div className="form-group"><label className="form-label" htmlFor="announcement-owner">{isDivision ? 'Select a Division' : 'Select a School Type'}</label><select id="announcement-owner" className="form-input" required name="school_or_institution_id" value={form.school_or_institution_id} onChange={change}><option value="">Select {isDivision ? 'a division' : module === 'institution' ? 'an institution' : 'a school'}</option>{owners.map(owner => <option key={owner._id} value={owner._id}>{owner.name}</option>)}</select></div>
        <div className="form-group"><label className="form-label" htmlFor="announcement-title">Announcement Title</label><input id="announcement-title" className="form-input" required maxLength={500} name="title" value={form.title} onChange={change} placeholder="Enter announcement title" /></div>
        {form.announcement_type !== 'marquee' && <div className="form-group"><label className="form-label" htmlFor="announcement-category">Announcement Category</label><select id="announcement-category" className="form-input" required name="announcement_category_id" value={form.announcement_category_id} onChange={change}><option value="">Select a category</option>{categories.filter(cat => cat.status === 'active' || cat._id === form.announcement_category_id).map(cat => <option key={cat._id} value={cat._id}>{cat.name}{cat.status === 'inactive' ? ' (Inactive)' : ''}</option>)}</select></div>}
        <div className="form-group"><label className="form-label" htmlFor="announcement-url">Announcement URL</label><input id="announcement-url" className="form-input" required name="url" placeholder="https://example.com or /admission" value={form.url} onChange={change} /></div>
        <div className="form-group"><label className="form-label" htmlFor="announcement-publish">Publish Date</label><input id="announcement-publish" className="form-input" required type="date" name="publish_date" value={form.publish_date} onChange={change} /></div>

        <div className="form-group"><label className="form-label" htmlFor="announcement-status">Status</label><select id="announcement-status" className="form-input" name="status" value={form.status} onChange={change}>{statusOptions}</select></div>
      </fieldset>{saveButtons(form._id)}</form>
    </AnnouncementModal>}
    {deleteTarget && <AnnouncementModal compact title="Confirm Deletion" busy={busy} onClose={() => { if (!busy) { setDeleteTarget(null); setError(''); } }}>
      {errorAlert}<div className="announcement-delete-icon"><Trash2 size={48} strokeWidth={1.5} /></div>
      <p className="page-subtitle">Are you sure you want to delete “{deleteTarget.row.name || deleteTarget.row.title}”? This action cannot be undone.</p>
      <div className="announcement-modal-actions"><button className="btn-secondary" disabled={busy} onClick={() => { setDeleteTarget(null); setError(''); }}>Cancel</button><button className="btn-danger" disabled={busy} onClick={confirmDelete}>{busy ? <Loader2 className="animate-spin" size={16} /> : <Trash2 size={16} />}{busy ? 'Deleting...' : 'Yes, Delete'}</button></div>
    </AnnouncementModal>}
  </div>;
}
