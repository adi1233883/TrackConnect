/* ============================================================
   TrackConnect — Sidebar HTML injector
   Call injectSidebar() before initSidebar(activePage)
   ============================================================ */

function injectSidebar() {
  const html = `
    <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Open menu">☰</button>

    <aside class="sidebar" id="sidebar">
      <div class="sidebar-logo">
        <div class="logo-icon">📡</div>
        <span>TrackConnect</span>
      </div>

      <nav class="sidebar-nav">
        <a href="dashboard.html" class="nav-link" data-page="dashboard">
          <span class="nav-icon">🏠</span> Dashboard
        </a>
        <a href="contacts.html" class="nav-link" data-page="contacts">
          <span class="nav-icon">👥</span> Contacts
        </a>
        <a href="requests.html" class="nav-link" data-page="requests">
          <span class="nav-icon">📨</span> Requests
          <span class="nav-badge hidden" id="requests-badge">0</span>
        </a>
        <a href="tracking.html" class="nav-link" data-page="tracking">
          <span class="nav-icon">🗺️</span> Live Tracking
        </a>
        <a href="profile.html" class="nav-link" data-page="profile">
          <span class="nav-icon">⚙️</span> Profile
        </a>
      </nav>

      <div class="sidebar-user">
        <div class="user-avatar" id="sb-avatar"></div>
        <div class="user-info">
          <div class="user-name" id="sb-name">Loading…</div>
          <div class="user-status">Online</div>
        </div>
        <button class="btn-logout" id="btn-logout" title="Sign out">🚪</button>
      </div>
    </aside>
  `;
  document.body.insertAdjacentHTML('afterbegin', html);
}
