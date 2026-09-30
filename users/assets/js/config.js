import { CLIENT_CONFIG } from './client-config.js';

export { CLIENT_CONFIG };

const isLocalDevelopment = ['localhost', '127.0.0.1'].includes(location.hostname);

export const APP_CONFIG = Object.freeze({
  API_BASE_URL: (isLocalDevelopment && localStorage.getItem('clientApiBase')) || CLIENT_CONFIG.api.baseUrl,
  API_TIMEOUT_MS: CLIENT_CONFIG.api.timeoutMs,
  LOGIN_PAGE: '/users/login/',
  DASHBOARD_PAGE: '/users/dashboard/',
});
