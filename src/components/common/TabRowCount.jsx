import { useEffect, useState } from 'react';

const endpoints = {
  '/faculty': '/faculty/getfaculty',
  '/faculty/research': ['/faculty/getfacultyresearch', '/faculty/getfacultyexperience'],
  '/research': '/research', '/research/faculty-members': '/research/faculty-members', '/research/student-members': '/research/student-members',
  '/about': '/about/accreditation/getall', '/about/ranking': '/about/ranking/getall',
  '/about/leadership': '/about/leadership/getall',
  '/about/leaders-in-home': '/about/leadership/getall?displayInHome=true',
  '/about/academic-heads': '/about/leadership/getall?category=Academic%20Heads',
  '/about/administrative-heads': '/about/leadership/getall?category=Administrative%20Heads',
  '/sliders': '/slider/sliders', '/student-testimonials': '/student/getall',
  '/careers': '/careers/get-careers', '/logs': '/auth/audit-logs', '/users': '/auth/users', '/coordinators': '/auth/users',
};
for (const module of ['institution', 'schools', 'school-divisions']) {
  const api = module === 'school-divisions' ? 'school-division' : module;
  endpoints[`/${module}`] = `/${api}/getall`;
  for (const section of module === 'institution' ? ['stats', 'dean-message', 'infrastructure', 'gallery-resource', 'events-and-activities', 'programmes'] : ['hod-message', 'programmes', 'achievements', 'events-and-activities']) endpoints[`/${module}/${section}`] = `/${api}/${section}/getall`;
  endpoints[`/${module}/announcement`] = `/announcements/?module=${api}`;
}
const pending = new Map();
function list(data) {
  if (Array.isArray(data)) return data;
  for (const key of ['data', 'users', 'sliders', 'testimonials', 'careers', 'logs']) if (Array.isArray(data?.[key])) return data[key];
  return data?.data && typeof data.data === 'object' ? [data.data] : [];
}
async function getCount(path) {
  const raw = sessionStorage.getItem('srm_coordinator_session') || sessionStorage.getItem('srm_admin_session') || localStorage.getItem('srm_admin_session');
  const user = raw ? JSON.parse(raw) : null;
  const key = `${user?.id}:${path}`;
  if (pending.has(key)) return pending.get(key);
  const task = (async () => {
    const results = await Promise.all([endpoints[path]].flat().map(async endpoint => {
      const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, { headers: { 'x-user-id': user?.id || '' } });
      if (!response.ok) throw new Error('Unable to load row count');
      return list(await response.json());
    }));
    if (path === '/faculty/research') return new Set(results.flat().map(row => row.facultyId?._id || row.facultyId).filter(Boolean).map(String)).size;
    if (path === '/users') return results[0].filter(row => row.role !== 'coordinator').length;
    if (path === '/coordinators') return results[0].filter(row => row.role === 'coordinator').length;
    return results[0].length;
  })();
  pending.set(key, task);
  try { return await task; } finally { pending.delete(key); }
}
export default function TabRowCount({ path }) {
  const [count, setCount] = useState(null);
  useEffect(() => {
    if (!endpoints[path]) return;
    let active = true;
    const refresh = () => getCount(path).then(value => { if (active) setCount(value); }).catch(() => { if (active) setCount(null); });
    refresh();
    window.addEventListener('admin-records-changed', refresh);
    return () => { active = false; window.removeEventListener('admin-records-changed', refresh); };
  }, [path]);
  return count === null ? null : <span className="tab-row-count" aria-label={`${count} records`}>{count.toLocaleString()}</span>;
}
