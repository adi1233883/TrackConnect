/* ============================================================
   TrackConnect — API Client & Shared Utilities
   ============================================================ */

const API_BASE = "https://himself-finder-pace-placed.trycloudflare.com/api";'http://const API_BASE = "https://himself-finder-pace-placed.trycloudflare.com/api";"https://willow-sets-valium-subsequently.trycloudflare.com/api";/api';

/* ---------- Token helpers ---------- */
const Auth = {
  getToken() { return localStorage.getItem('tc_token'); },
  setToken(t) { localStorage.setItem('tc_token', t); },
  getUser()  { const u = localStorage.getItem('tc_user'); return u ? JSON.parse(u) : null; },
  setUser(u) { localStorage.setItem('tc_user', JSON.stringify(u)); },
  clear()    { localStorage.removeItem('tc_token'); localStorage.removeItem('tc_user'); },
  isLoggedIn() { return !!this.getToken(); },
  requireAuth() {
    if (!this.isLoggedIn()) { window.location.href = 'index.html'; }
  },
  requireGuest() {
    if (this.isLoggedIn()) { window.location.href = 'dashboard.html'; }
  },
};

/* ---------- HTTP helper ---------- */
async function apiFetch(path, options = {}) {
  const token = Auth.getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  // For FormData don't set Content-Type (browser sets it with boundary)
  if (options.body instanceof FormData) delete headers['Content-Type'];

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({ success: false, message: 'Unexpected server response.' }));

  if (res.status === 401) {
    Auth.clear();
    window.location.href = 'index.html';
    return;
  }

  return { ok: res.ok, status: res.status, data };
}

/* ---------- Toast notifications ---------- */
const Toast = (() => {
  let container;

  function ensure() {
    if (!container) {
      container = document.getElementById('toast-container');
      if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        document.body.appendChild(container);
      }
    }
  }

  const icons = { success: '✅', error: '❌', info: 'ℹ️', warning: '⚠️' };

  function show(type, title, message, duration = 4000) {
    ensure();
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span class="toast-icon">${icons[type] || 'ℹ️'}</span>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        ${message ? `<div class="toast-msg">${message}</div>` : ''}
      </div>`;
    container.appendChild(toast);
    toast.addEventListener('click', () => dismiss(toast));
    setTimeout(() => dismiss(toast), duration);
  }

  function dismiss(toast) {
    toast.style.animation = 'fadeOut 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }

  return {
    success: (title, msg) => show('success', title, msg),
    error:   (title, msg) => show('error',   title, msg),
    info:    (title, msg) => show('info',    title, msg),
    warning: (title, msg) => show('warning', title, msg),
  };
})();

/* ---------- Sidebar helpers ---------- */
function initSidebar(activePage) {
  const user = Auth.getUser();
  if (!user) return;

  // Set user info in sidebar
  const nameEl  = document.getElementById('sb-name');
  const avatarEl = document.getElementById('sb-avatar');
  if (nameEl)  nameEl.textContent = user.name;
  if (avatarEl) {
    if (user.profile_image) {
      avatarEl.innerHTML = `<img src="http://const API_BASE = "https://himself-finder-pace-placed.trycloudflare.com/api";"https://willow-sets-valium-subsequently.trycloudflare.com/api";${user.profile_image}" alt="${user.name}">`;
    } else {
      avatarEl.textContent = user.name.charAt(0).toUpperCase();
    }
  }

  // Highlight active nav link
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.toggle('active', link.dataset.page === activePage);
  });

  // Logout button
  const logoutBtn = document.getElementById('btn-logout');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      await apiFetch('/auth/logout', { method: 'POST' });
      Auth.clear();
      window.location.href = 'index.html';
    });
  }

  // Mobile menu toggle
  const menuBtn = document.getElementById('mobile-menu-btn');
  const sidebar = document.querySelector('.sidebar');
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuBtn.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }
}

/* ---------- Refresh sidebar user (after profile update) ---------- */
async function refreshCurrentUser() {
  const res = await apiFetch('/auth/me');
  if (res && res.ok) {
    Auth.setUser(res.data.user);
    return res.data.user;
  }
}

/* ---------- Avatar initials helper ---------- */
function avatarHTML(name, imageUrl, size = 44) {
  if (imageUrl) {
    return `<img src="http://const API_BASE = "https://himself-finder-pace-placed.trycloudflare.com/api";"https://willow-sets-valium-subsequently.trycloudflare.com/api";${imageUrl}" alt="${name}" style="width:${size}px;height:${size}px;border-radius:50%;object-fit:cover;">`;
  }
  return `<span>${name.charAt(0).toUpperCase()}</span>`;
}

/* ---------- Relative time ---------- */
function timeAgo(dateStr) {
  const date = new Date(dateStr);
  const now  = new Date();
  const diff = Math.floor((now - date) / 1000);
  if (diff < 60)   return 'just now';
  if (diff < 3600) return `${Math.floor(diff/60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff/3600)}h ago`;
  return `${Math.floor(diff/86400)}d ago`;
}

/* ---------- Pending request badge ---------- */
async function loadPendingBadge() {
  try {
    const res = await apiFetch('/requests/incoming');
    if (res && res.ok) {
      const count = res.data.requests.length;
      const badge = document.getElementById('requests-badge');
      if (badge) {
        badge.textContent = count;
        badge.classList.toggle('hidden', count === 0);
      }
    }
  } catch (_) {}
}
