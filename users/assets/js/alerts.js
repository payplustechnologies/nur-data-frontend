let loaderPromise;

if (!document.querySelector('link[data-mbr-alerts]')) {
  const stylesheet = document.createElement('link');
  stylesheet.rel = 'stylesheet';
  stylesheet.href = './assets/css/alerts.css';
  stylesheet.dataset.mbrAlerts = 'true';
  document.head.append(stylesheet);
}

export function loadSweetAlert() {
  if (window.Swal) return Promise.resolve(window.Swal);
  if (loaderPromise) return loaderPromise;
  loaderPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './assets/vendor/sweetalert2.all.min.js';
    script.onload = () => resolve(window.Swal);
    script.onerror = () => reject(new Error('Unable to load the alert interface.'));
    document.head.append(script);
  });
  return loaderPromise;
}

export async function confirmAction({ title, text, confirmText = 'Continue', icon = 'question' }) {
  const Swal = await loadSweetAlert();
  const result = await Swal.fire({ icon, title, text, showCancelButton: true, confirmButtonText: confirmText, cancelButtonText: 'Cancel', reverseButtons: true, focusCancel: true, customClass: { popup: `mbr-alert ${icon === 'warning' ? 'mbr-danger' : ''}` } });
  return result.isConfirmed;
}

export async function showProcessing(title = 'Processing...', text = 'Please wait while we complete your request.') {
  const Swal = await loadSweetAlert();
  const dots = Array.from({ length: 10 }, () => '<span></span>').join('');
  Swal.fire({ title, html: `<div class="mbr-loader" aria-hidden="true">${dots}</div><div>${text}</div>`, allowOutsideClick: false, allowEscapeKey: false, showConfirmButton: false, customClass: { popup: 'mbr-alert mbr-processing' } });
  return Swal;
}

export async function showResult({ success, title, message }) {
  const Swal = await loadSweetAlert();
  return Swal.fire({ icon: success ? 'success' : 'error', title, text: message, confirmButtonText: 'Okay', customClass: { popup: 'mbr-alert' } });
}

export function transactionStatus(value) {
  const status = String(value ?? '').trim().toLowerCase();
  if (['1', 'success', 'successful', 'completed', 'complete', 'approved', 'paid'].includes(status)) {
    return { label: 'Successful', className: 'success' };
  }
  if (['2', 'pending', 'processing', 'queued', 'in progress', 'in_progress'].includes(status)) {
    return { label: 'Pending', className: 'pending' };
  }
  return { label: 'Failed', className: 'failed' };
}

export async function runAction(action, { loadingTitle = 'Processing...', loadingText, successTitle = 'Successful', successMessage, showSuccess = true } = {}) {
  await showProcessing(loadingTitle, loadingText);
  try {
    const response = await action();
    window.Swal.close();
    if (showSuccess) await showResult({ success: true, title: successTitle, message: response?.message || successMessage || 'Request completed successfully.' });
    return response;
  } catch (error) {
    window.Swal?.close();
    await showResult({ success: false, title: 'Request Failed', message: error.message || 'Unable to complete the request.' });
    throw error;
  }
}

export async function showReceipt(tx, money) {
  const Swal = await loadSweetAlert();
  const ref = String(tx.transid || tx.reference || 'N/A');
  const service = String(tx.service || tx.network || tx.type || 'Transaction').replaceAll('_', ' ').toUpperCase();
  const details = [tx.network, tx.mobile, tx.plans].filter(Boolean).join(' • ') || 'Transaction record';
  const status = transactionStatus(tx.status);
  const html = `<div class="receipt-sheet"><div class="receipt-total"><small>TRANSACTION AMOUNT</small><strong>${money(tx.amount)}</strong></div><div class="receipt-line"><span>Transaction ID</span><b>${ref}</b></div><div class="receipt-line"><span>Date & Time</span><b>${tx.date || 'N/A'}</b></div><div class="receipt-line"><span>Service</span><b>${service}</b></div><div class="receipt-line"><span>Details</span><b>${details}</b></div><div class="receipt-line"><span>Old Balance</span><b>${money(tx.oldbal)}</b></div><div class="receipt-line"><span>New Balance</span><b>${money(tx.newbal)}</b></div><div class="receipt-line"><span>Status</span><b class="status ${status.className}">${status.label}</b></div><div class="receipt-tools"><button id="receipt-copy" type="button"><i class="bi bi-copy"></i> Copy Ref</button><button id="receipt-print" type="button"><i class="bi bi-printer"></i> Print</button></div></div>`;
  return Swal.fire({ title: 'Transaction Receipt', html, width: 520, confirmButtonText: 'Close', confirmButtonColor: getComputedStyle(document.documentElement).getPropertyValue('--brand').trim() || '#132b86', customClass: { popup: 'mbr-alert receipt-popup' }, didOpen: () => { document.querySelector('#receipt-copy').onclick = async () => { await navigator.clipboard.writeText(ref); Swal.showValidationMessage('Transaction reference copied.'); }; document.querySelector('#receipt-print').onclick = () => window.print(); } });
}
