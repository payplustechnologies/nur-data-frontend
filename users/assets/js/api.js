import { APP_CONFIG, CLIENT_CONFIG } from './config.js';
import { applyClientIdentity } from './client-config.js';
import { initTheme } from './theme.js?v=20260829-1';

const storage = window.localStorage;
initTheme();
applyClientIdentity(CLIENT_CONFIG);

export function getSession() {
  let user = {};
  try { user = JSON.parse(storage.getItem('authUser') || '{}'); } catch (_) {}
  return { token: storage.getItem('authToken') || '', user };
}

export function saveSession(payload) {
  const token = payload.token || payload.apikey || payload.user?.apikey || '';
  if (!token) throw new Error('The server did not return an authentication token.');
  storage.setItem('authToken', token);
  storage.setItem('authUser', JSON.stringify(payload.user || {}));
}

export function clearSession() {
  storage.removeItem('authToken');
  storage.removeItem('authUser');
}

export async function api(path, options = {}) {
  const { token } = getSession();
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('X-PayPlus-License-ID', CLIENT_CONFIG.license.id);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (token) headers.set('Authorization', `Bearer ${token}`);

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), APP_CONFIG.API_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(`${APP_CONFIG.API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: options.signal || controller.signal,
    });
  } catch (error) {
    if (error.name === 'AbortError') {
      throw new Error('The server is taking too long to respond. Please try again.');
    }
    throw new Error('Unable to reach the server. Please check your connection and try again.');
  } finally {
    clearTimeout(timeout);
  }
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.message || payload.msg || payload.error || 'Request failed.');
    error.status = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

export async function loadBrand() {
  try {
    const config = await api('/client/config');
    storage.setItem('clientBrand', JSON.stringify(config));
    applyBrand(config);
    return config;
  } catch (_) {
    let cached = {};
    try { cached = JSON.parse(storage.getItem('clientBrand') || '{}'); } catch (_) {}
    applyBrand(cached);
    return cached;
  }
}

export function applyBrand(config = {}) {
  applyClientIdentity(CLIENT_CONFIG);
  if (!CLIENT_CONFIG.branding.allowBackendOverride) return;
  const rawColor = config.settings?.color || config.client?.brand?.primary_color || config.color;
  const color = normalizeBrandColor(rawColor);
  const name = config.settings?.name || config.client?.name || config.name || CLIENT_CONFIG.appName;
  if (color) document.documentElement.style.setProperty('--brand', color);
  document.querySelectorAll('[data-brand-name]').forEach((node) => { node.textContent = name; });
}

export function normalizeBrandColor(value) {
  if (typeof value !== 'string') return '';
  const normalized = value.trim().replace(/^#+/, '');
  if (/^[0-9a-f]{3}$/i.test(normalized) || /^[0-9a-f]{6}$/i.test(normalized)) return `#${normalized}`;
  if (/^[0-9a-f]{8}$/i.test(normalized)) return `#${normalized}`;
  return '';
}

export function requireAuth() {
  if (!getSession().token) {
    location.replace(APP_CONFIG.LOGIN_PAGE);
    throw new Error('Authentication required.');
  }
}

export function money(value) {
  return `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function notify(message, type = 'info') {
  const toast = document.querySelector('[data-toast]');
  if (!toast) return;
  toast.textContent = message;
  toast.dataset.type = type;
  toast.classList.add('show');
  clearTimeout(notify.timer);
  notify.timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

export function renderSidebarNavigation() {
  const nav = document.querySelector('.side nav');
  if (!nav) return;
  const page = location.pathname.split('/').filter(Boolean).pop() || 'dashboard';
  const items = [
    ['/users/dashboard/', 'speedometer2', 'Dashboard', false],
    ['/users/service/?service=data', 'router-fill', 'Buy Data', false],
    ['/users/service/?service=airtime', 'phone-fill', 'Buy Airtime', false],
    ['/users/wallet/', 'wallet-fill', 'Add Money', false],
    ['/users/history/', 'receipt-cutoff', 'Transaction History', false],
    ...(CLIENT_CONFIG.features.pricing === false ? [] : [['/users/pricing/', 'tag-fill', 'Pricing', false]]),
    ...(CLIENT_CONFIG.features.developerApi === false ? [] : [['/users/developer-api/', 'braces-asterisk', 'Developer API', false]]),
    ['/users/profile/', 'person-badge-fill', 'Profile', false],
    ['/users/support/', 'headset', 'Support', false],
  ];
  nav.innerHTML = `<small>MAIN MENU</small>${items.map(([href, icon, label, soon]) => { const route = new URL(href, location.origin).pathname.split('/').filter(Boolean).pop(); return `<a href="${soon ? '#' : href}" class="${page === route ? 'active' : ''}" ${soon ? 'data-soon' : ''}><i class="bi bi-${icon}"></i><span>${label}</span>${soon ? '<em>soon</em>' : ''}</a>`; }).join('')}`;
}

renderSidebarNavigation();
