import { money, notify } from './api.js';
import { bootShell } from './shell.js';
import { transactionStatus } from './alerts.js';

bootShell('history');

let receipt = {};
try { receipt = JSON.parse(sessionStorage.getItem('mbrLastReceipt') || '{}'); } catch (_) {}

if (!Object.keys(receipt).length) location.replace('/users/history/');

const value = (...keys) => keys.map((key) => receipt[key]).find((item) => item !== undefined && item !== null && String(item).trim() !== '');
const reference = String(value('transid', 'reference', 'request_id', 'id') || 'N/A');
const service = String(value('service', 'network', 'type') || 'Transaction').replaceAll('_', ' ');
const details = [value('network'), value('mobile', 'mobile_number', 'phone'), value('plans', 'plan', 'description')].filter(Boolean).join(' • ') || 'Transaction record';

document.querySelector('#receipt-amount').textContent = money(value('amount'));
const status = transactionStatus(value('status'));
document.querySelector('#receipt-status').textContent = status.label;
document.querySelector('#receipt-status').classList.add('status', status.className);

const rows = [
  ['Transaction Reference', reference],
  ['Date & Time', value('date', 'created_at') || new Date().toLocaleString()],
  ['Service', service],
  ['Transaction Details', details],
  ['Previous Balance', money(value('oldbal', 'old_balance'))],
  ['New Balance', money(value('newbal', 'new_balance'))],
];

document.querySelector('#receipt-details').innerHTML = rows.map(([label, content]) => `<div><span>${label}</span><b>${content}</b></div>`).join('');
document.querySelector('#copy-receipt').onclick = async () => { try { await navigator.clipboard.writeText(reference); notify('Transaction reference copied.', 'success'); } catch (_) { notify('Unable to copy the reference.', 'error'); } };
document.querySelector('#print-receipt').onclick = () => window.print();
