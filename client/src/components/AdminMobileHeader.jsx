export default function AdminMobileHeader({ onToggle }) {
  return (
    <header className="mobile-header admin-mobile-header">
      <div className="mobile-header-left">
        <button className="menu-toggle" onClick={onToggle} aria-label="Toggle Menu">
          <svg viewBox="0 0 24 24" width="24" height="24">
            <path fill="currentColor" d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z" />
          </svg>
        </button>
        <span className="mobile-brand">Richway Admin</span>
      </div>
      <div className="mobile-header-right">
        <span className="mobile-logo">🛡️</span>
      </div>
    </header>
  );
}
