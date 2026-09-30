import { APP_CONFIG } from './config.js';
import { clearSession, getSession, loadBrand, notify, requireAuth } from './api.js';
export function bootShell(active) {
  requireAuth(); loadBrand();
  const user=getSession().user||{}, name=user.username||user.name||'User';
  document.querySelectorAll('[data-user-name]').forEach(x=>x.textContent=name);
  document.querySelectorAll('[data-avatar]').forEach(x=>x.textContent=name[0].toUpperCase());
  document.querySelector('#logout')?.addEventListener('click',()=>{clearSession();location.replace(APP_CONFIG.LOGIN_PAGE)});
  document.querySelector('#menu')?.addEventListener('click',()=>document.body.classList.toggle('nav-open'));
  document.querySelector('#scrim')?.addEventListener('click',()=>document.body.classList.remove('nav-open'));
  document.querySelectorAll('[data-soon]').forEach(x=>x.addEventListener('click',e=>{e.preventDefault();notify('This page will be migrated next.')}));
  document.querySelectorAll(`[data-nav="${active}"]`).forEach(x=>x.classList.add('active'));
  return user;
}
export async function copyText(value,message='Copied.') { try { await navigator.clipboard.writeText(value); notify(message,'success'); } catch { notify('Copy failed.','error'); } }
