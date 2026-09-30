import { CLIENT_CONFIG } from '../../../users/assets/js/client-config.js';

export { CLIENT_CONFIG };

const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(location.hostname);

export const ADMIN_CONFIG = {
  API_BASE_URL: (isLocalDevelopment && localStorage.getItem('adminApiBase')) || CLIENT_CONFIG.api.baseUrl,
  API_TIMEOUT_MS: CLIENT_CONFIG.api.timeoutMs,
  LOGIN_PAGE: '/admin/',
  DASHBOARD_PAGE: '/admin/dashboard/',
  // Admin is deployed under /admin on the same origin as the user frontend.
  USER_FRONTEND_URL: (isLocalDevelopment && localStorage.getItem('userFrontendUrl')) || '/users/dashboard/',
};
