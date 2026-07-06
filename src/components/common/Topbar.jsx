import { Bell, User, LogOut } from 'lucide-react';

const getDisplayName = (session) => {
  const rawName = session?.username || session?.name || session?.email?.split('@')[0] || 'Admin';

  return rawName
    .replace(/[._-]+/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
};

const getInitials = (name) => {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'A';
};

const Topbar = ({ onLogout, session }) => {
  const displayName = getDisplayName(session);

  return (
    <header className="topbar">
      <div className="flex items-center gap-2">
        <button
          className="btn btn-outline"
          style={{ border: 'none', padding: 8, color: 'var(--text-gray)' }}
          onClick={onLogout}
          aria-label="Sign out"
          title="Sign out"
        >
          <LogOut size={18} />
        </button>
        <button className="btn btn-outline" style={{ border: 'none', padding: 8, color: 'var(--text-gray)' }}><Bell size={18} /></button>
        <div className="topbar-user" title={session?.email || displayName}>
          <User size={17} />
          <span className="topbar-user-name">{displayName}</span>
          <div className="topbar-avatar">{getInitials(displayName)}</div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
