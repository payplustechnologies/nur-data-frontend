import { ADMIN_CONFIG } from './config.js';
import { api, saveSession, session } from './api.js';

if (session().token) location.replace(ADMIN_CONFIG.DASHBOARD_PAGE);

const form = document.querySelector('#login-form');
const submit = form.querySelector('[type="submit"]');
const passwordInput = document.querySelector('#password');
const passwordToggle = document.querySelector('#toggle-password');

function showProcessing(title, message) {
  const dots = Array.from({ length: 10 }, () => '<span></span>').join('');
  return Swal.fire({
    title,
    html: `<div class="mbr-loader" aria-hidden="true">${dots}</div><div>${message}</div>`,
    allowOutsideClick: false,
    allowEscapeKey: false,
    showConfirmButton: false,
    customClass: { popup: 'mbr-alert mbr-processing' },
  });
}

function showResult({ success, title, message }) {
  return Swal.fire({
    icon: success ? 'success' : 'error',
    title,
    text: message,
    confirmButtonText: 'Okay',
    customClass: { popup: 'mbr-alert' },
  });
}

passwordToggle.addEventListener('click', () => {
  const showing = passwordInput.type === 'text';
  passwordInput.type = showing ? 'password' : 'text';
  passwordToggle.setAttribute('aria-label', showing ? 'Show password' : 'Hide password');
  passwordToggle.querySelector('i').className = showing ? 'bi bi-eye' : 'bi bi-eye-slash';
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const username = document.querySelector('#username').value.trim();
  const password = passwordInput.value;
  submit.disabled = true;
  showProcessing('Signing you in...', 'Verifying your administrator details securely.');

  try {
    const result = await api('/admin/login', { method: 'POST', body: JSON.stringify({ username, password }) });
    saveSession(result);
    Swal.close();
    await showResult({ success: true, title: 'Welcome Back', message: result.message || 'Login successful.' });
    location.replace(ADMIN_CONFIG.DASHBOARD_PAGE);
  } catch (error) {
    Swal.close();
    await showResult({ success: false, title: 'Login Failed', message: error.message });
  } finally {
    submit.disabled = false;
  }
});
