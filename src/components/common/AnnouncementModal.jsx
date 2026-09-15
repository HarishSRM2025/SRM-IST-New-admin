import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

export default function AnnouncementModal({ title, onClose, busy, children, compact = false }) {
  const dialog = useRef(null);
  useEffect(() => {
    const previous = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    dialog.current?.focus();
    return () => { document.body.style.overflow = overflow; previous?.focus(); };
  }, []);
  const onKeyDown = event => {
    if (event.key === 'Escape' && !busy) onClose();
    if (event.key !== 'Tab') return;
    const controls = [...dialog.current.querySelectorAll('button:not(:disabled), input:not(:disabled), select:not(:disabled), a[href]')];
    const first = controls[0], last = controls.at(-1);
    if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus(); }
    else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus(); }
  };
  return createPortal(<div className="modal-overlay">
    <div ref={dialog} tabIndex={-1} role="dialog" aria-modal="true" aria-labelledby="announcement-modal-title" onKeyDown={onKeyDown}
      className="modal-content announcement-modal" style={{ maxWidth: compact ? 480 : 750, maxHeight: '90vh', overflowY: 'auto' }}>
      <div className="modal-header"><h2 id="announcement-modal-title" className="modal-title">{title}</h2>
        <button className="modal-close" aria-label="Close dialog" onClick={onClose} disabled={busy}><X size={24} /></button>
      </div>
      {children}
    </div>
  </div>, document.body);
}
