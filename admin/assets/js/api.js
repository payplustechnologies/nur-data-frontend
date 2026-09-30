import { ADMIN_CONFIG, CLIENT_CONFIG } from './config.js';
import { applyClientIdentity } from '../../../users/assets/js/client-config.js';

applyClientIdentity(CLIENT_CONFIG, { admin: true });

export const session = () => ({ token: localStorage.getItem('adminToken') || '', admin: JSON.parse(localStorage.getItem('adminUser') || '{}') });
export const saveSession = (payload) => { localStorage.setItem('adminToken', payload.token); localStorage.setItem('adminUser', JSON.stringify(payload.admin || {})); };
export const clearSession = () => { localStorage.removeItem('adminToken'); localStorage.removeItem('adminUser');Object.keys(localStorage).filter((key)=>key.startsWith('mbrAdminCache:')).forEach((key)=>localStorage.removeItem(key)); };
export const money = (value) => `₦${Number(value || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('Accept', 'application/json');
  headers.set('X-PayPlus-License-ID', CLIENT_CONFIG.license.id);
  if (!(options.body instanceof FormData)) headers.set('Content-Type', 'application/json');
  if (session().token) headers.set('Authorization', `Bearer ${session().token}`);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), ADMIN_CONFIG.API_TIMEOUT_MS);
  try {
    const response = await fetch(`${ADMIN_CONFIG.API_BASE_URL}${path}`, { ...options, headers, signal: controller.signal });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) { const error = new Error(payload.message || 'Request failed.'); error.status = response.status; throw error; }
    return payload;
  } catch (error) {
    if (error.name === 'AbortError') throw new Error('The backend is taking too long to respond.');
    throw error;
  } finally { clearTimeout(timeout); }
}

export function applyTheme(theme = localStorage.getItem('adminTheme') || 'light') {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('adminTheme', theme);
}
applyTheme();
