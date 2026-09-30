import { ADMIN_CONFIG, CLIENT_CONFIG } from './config.js';
import { applyClientIdentity } from '../../../users/assets/js/client-config.js';
import { api, applyTheme, clearSession, session } from './api.js';

export function initAdminShell(active = '') {
  if (!session().token) { location.replace(ADMIN_CONFIG.LOGIN_PAGE); return null; }
  const adminCss=document.querySelector('link[href*="assets/css/admin.css"]');if(adminCss){const cssUrl=new URL(adminCss.href);cssUrl.searchParams.set('v','20260913-7');adminCss.href=cssUrl.href}
  if (!document.querySelector('link[data-ubuntu-font]')) document.head.insertAdjacentHTML('beforeend','<link data-ubuntu-font rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Ubuntu:wght@300;400;500;700&display=swap">');
  applyClientIdentity(CLIENT_CONFIG,{admin:true});
  const savedBrand=localStorage.getItem('adminBrandColor');if(savedBrand&&CLIENT_CONFIG.branding.allowBackendOverride)document.documentElement.style.setProperty('--brand',savedBrand);
  const headerContainer=document.querySelector('.navbar-header .container-fluid');
  if(headerContainer&&!headerContainer.querySelector('.legacy-header-search')){
    headerContainer.insertAdjacentHTML('afterbegin',`<div class="legacy-header-search"><i class="fas fa-search" aria-hidden="true"></i><input type="search" placeholder="Search navigation..." aria-label="Search admin navigation"></div><div class="legacy-header-tools"><a href="/admin/notifications/?tab=app" class="legacy-tool-button" title="Notifications" aria-label="Notifications"><i class="fas fa-bell"></i><span></span></a><a href="/admin/dashboard/" class="legacy-tool-button" title="Dashboard" aria-label="Dashboard"><i class="fas fa-layer-group"></i></a></div>`);
  }
  api('/admin/theme').then(theme=>{const useBackend=CLIENT_CONFIG.branding.allowBackendOverride;if(useBackend&&theme.color){localStorage.setItem('adminBrandColor',theme.color);document.documentElement.style.setProperty('--brand',theme.color)}const name=useBackend&&theme.name?theme.name:CLIENT_CONFIG.appName;const logo=useBackend&&theme.logo?theme.logo:CLIENT_CONFIG.branding.logoUrl;document.querySelectorAll('.legacy-logo').forEach(node=>{node.innerHTML=`<img data-client-logo src="${logo}" alt="${name} logo"><span>${name.toUpperCase()}</span>`})}).catch(()=>{document.querySelectorAll('.legacy-logo').forEach(node=>{node.innerHTML=`<img data-client-logo src="${CLIENT_CONFIG.branding.logoUrl}" alt="${CLIENT_CONFIG.appName} logo"><span>${CLIENT_CONFIG.appName.toUpperCase()}</span>`})});
  const admin = session().admin || {}, permissions = admin.permissions || {};
  const menuButton = document.querySelector('#menu');
  if (menuButton) {
    menuButton.replaceChildren();
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    menuButton.setAttribute('title', 'Menu');
  }
  const nav = document.querySelector('.nav-primary');
  const group=(permission,activeKey,icon,label,items)=>`<li class="nav-item" data-nav="${activeKey}" data-permission="${permission}"><a href="javascript:void(0)" role="button" data-submenu-toggle><i class="${icon}"></i><p>${label}</p><span class="caret"></span></a><div class="collapse"><ul class="nav nav-collapse">${items.map(([text,href])=>`<li><a href="${href}"><span class="sub-item">${text}</span></a></li>`).join('')}</ul></div></li>`;
  if (nav) nav.innerHTML = `
    <li class="nav-item" data-nav="dashboard"><a href="/admin/dashboard/"><i class="fas fa-home"></i><p>Dashboard</p></a></li>
    ${group('users','users','fas fa-user','Manage Users Account',[['Verified Users','/admin/users/?status=1'],['Pending Users KYC','/admin/users/?scope=kyc'],['Unverified User','/admin/users/?status=0'],['Banned User','/admin/users/?status=2']])}
    ${group('transactions','transactions','fas fa-receipt','Users Transactions',[['Successful Transactions','/admin/transactions/?status=1'],['Fail Transactions','/admin/transactions/?status=0'],['All Transactions','/admin/transactions/']])}
    ${group('finance','finance','fas fa-wallet','Finance Management',[['Credit User','/admin/finance/?tab=credit'],['Upgrade User','/admin/finance/?tab=upgrade'],['Debit User','/admin/finance/?tab=debit'],['Create Coupon Code','/admin/finance/?tab=coupon']])}
    ${group('rewards','rewards','fas fa-percent','Referral & CashBack',[['Referral Reward','/admin/rewards/?tab=referral'],['CashBack Reward','/admin/rewards/?tab=cashback'],['Data Giveaway','/admin/rewards/?tab=transfer']])}
    ${group('sales','sales','fas fa-chart-line','Sales Analysis',[['Sales Analysis','/admin/sales-analysis/']])}
    ${group('airtime_cash','airtime_cash','fas fa-gift','2 Cash Services',[['Pending Airtime 2 Cash','/admin/airtime-cash/?tab=transactions'],['Airtime 2 Cash Number','/admin/airtime-cash/?tab=numbers']])}
    ${group('charges','charges','fas fa-percentage','Services Charges',[['Transfer Charges','/admin/service-charges/?tab=transfer'],['Airtime Discount','/admin/service-charges/?tab=airtime'],['Airtime 2 Cash Charges','/admin/service-charges/?tab=airtime_cash'],['Electricity Charges','/admin/service-charges/?tab=electricity'],['Cable Charges','/admin/service-charges/?tab=cable'],['Exam Charges','/admin/service-charges/?tab=exam']])}
    ${group('services_lock','services_lock','fas fa-unlock-alt','Lock and Unlock Service',[['Network Services','/admin/service-locks/?tab=network_services'],['Data Service','/admin/service-locks/?tab=data'],['Smart Switch Services','/admin/service-locks/?tab=switch'],['Airtime Service','/admin/service-locks/?tab=airtime'],['Airtime Discount','/admin/service-locks/?tab=airtime_discount'],['Cable Service','/admin/service-locks/?tab=cable'],['Exam Service','/admin/service-locks/?tab=exam'],['General Service','/admin/service-locks/?tab=general'],['Email Verification','/admin/service-locks/?tab=email_verification']])}
    ${group('bundles','bundles','fas fa-file-archive','Add Bundles',[['Data Plans','/admin/bundles/?tab=data'],['Switch Data Plans','/admin/bundles/?tab=switch'],['Cable Plans','/admin/bundles/?tab=cable'],['Electricity Plans','/admin/bundles/?tab=electricity'],['Smile Plans','/admin/bundles/?tab=smile'],['Alpha Plans','/admin/bundles/?tab=alpha'],['Ratel Plans','/admin/bundles/?tab=ratel'],['Kirani Plans','/admin/bundles/?tab=kirani'],['Exam Plans','/admin/bundles/?tab=exam'],['NIN Plans','/admin/bundles/?tab=nin'],['BVN Plans','/admin/bundles/?tab=bvn']])}
    ${group('notifications','notifications','fas fa-envelope-open','Notification',[['App Notification','/admin/notifications/?tab=app'],['Email Notification','/admin/notifications/?tab=email'],['Welcome Message','/admin/notifications/?tab=welcome']])}
    <li class="nav-section"><span class="sidebar-mini-icon"><i class="fa fa-ellipsis-h"></i></span><h4 class="text-section">Website Setting</h4></li>
    ${group('website_setting','website_setting','fas fa-cog','Website Setting',[['Website Information','/admin/website-settings/?tab=general'],['Email Configuration','/admin/website-settings/?tab=mail'],['System User','/admin/website-settings/?tab=system']])}
    ${group('website_management','website_management','fas fa-tasks','Website Management',[['Welcome Message','/admin/notifications/?tab=welcome'],['Change Password','/admin/website-management/?tab=password']])}
    ${group('api_integration','api_integration','fas fa-globe','API Integration',[['Wallet API','/admin/api-integration/?tab=wallet'],['Data API','/admin/api-integration/?tab=data'],['Airtime API','/admin/api-integration/?tab=airtime'],['General API','/admin/api-integration/?tab=general']])}
    ${group('payment_gateway','payment_gateway','fas fa-credit-card','Payment Gateway',[['Asfiy API','/admin/payment-gateway/?gateway=asfiy'],['Billstack API','/admin/payment-gateway/?gateway=billstack'],['PaymentPoint API','/admin/payment-gateway/?gateway=paymentpoint'],['M Pay','/admin/payment-gateway/?gateway=mpay']])}
    <li class="nav-item" data-permission="support"><a href="/admin/support/"><i class="fas fa-headset"></i><p>Support</p></a></li>
    <li class="nav-section"><span class="sidebar-mini-icon"><i class="fa fa-ellipsis-h"></i></span><h4 class="text-section">Company</h4></li>
    <li class="nav-item" data-nav="company"><a href="/admin/company/"><i class="fas fa-building"></i><p>PayPlus Technologies</p></a></li>
    <li class="nav-section"><span class="sidebar-mini-icon"><i class="fa fa-ellipsis-h"></i></span><h4 class="text-section">Session</h4></li>
    <li class="nav-item"><a id="logout" href="javascript:void(0)"><i class="fas fa-sign-out-alt"></i><p>Logout</p></a></li>`;
  document.querySelectorAll('[data-admin-name]').forEach(n => n.textContent = admin.username || 'Admin');
  document.querySelectorAll('[data-admin-role]').forEach(n => n.textContent = admin.role || 'Administrator');
  document.querySelectorAll('[data-avatar]').forEach(n => n.textContent = (admin.username || 'A')[0].toUpperCase());
  document.querySelectorAll('[data-permission]').forEach(n => { if (!Number(permissions[n.dataset.permission] || 0)) n.remove(); });
  document.querySelector(`[data-nav="${active}"]`)?.classList.add('active');
  const navSearch=document.querySelector('.legacy-header-search input');
  navSearch?.addEventListener('input',()=>{const query=navSearch.value.trim().toLowerCase();document.querySelectorAll('.nav-primary>.nav-item').forEach(item=>{item.style.display=!query||item.textContent.toLowerCase().includes(query)?'':'none'})});
  const panel=document.querySelector('.main-panel');if(panel&&!panel.querySelector('.admin-product-footer'))panel.insertAdjacentHTML('beforeend',`<footer class="admin-product-footer"><span>A Product of</span> <a href="/admin/company/">${CLIENT_CONFIG.company.name}</a></footer>`);
  document.querySelectorAll('[data-submenu-toggle]').forEach(toggle=>toggle.addEventListener('click',event=>{event.preventDefault();const item=toggle.closest('.nav-item'),panel=item.querySelector('.collapse'),open=panel.classList.toggle('show');toggle.setAttribute('aria-expanded',String(open));item.classList.toggle('submenu-open',open)}));
  const activeItem=document.querySelector(`[data-nav="${active}"]`);if(activeItem?.querySelector('.collapse')){activeItem.querySelector('.collapse').classList.add('show');activeItem.querySelector('[data-submenu-toggle]').setAttribute('aria-expanded','true')}
  menuButton?.addEventListener('click',event=>{event.preventDefault();document.body.classList.toggle('nav-open');document.body.classList.toggle('nav_open',document.body.classList.contains('nav-open'));menuButton.setAttribute('aria-expanded',String(document.body.classList.contains('nav-open')))});
  document.querySelector('#scrim')?.addEventListener('click',()=>{document.body.classList.remove('nav-open','nav_open')});
  document.querySelectorAll('.sidebar a[href]:not([href="#"]):not([href^="javascript"])').forEach(link=>link.addEventListener('click',()=>document.body.classList.remove('nav-open','nav_open')));
  const themeButton=document.querySelector('#theme');
  const syncThemeButton=()=>{
    if(!themeButton)return;
    const dark=document.documentElement.dataset.theme==='dark';
    themeButton.innerHTML=`<i class="${dark?'fas fa-sun':'fas fa-moon'}" aria-hidden="true"></i><span>${dark?'Light':'Dark'}</span>`;
    themeButton.setAttribute('aria-label',`Switch to ${dark?'light':'dark'} mode`);
    themeButton.setAttribute('title',`Switch to ${dark?'light':'dark'} mode`);
  };
  syncThemeButton();
  themeButton?.addEventListener('click',()=>{
    applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
    syncThemeButton();
  });
  document.querySelector('.legacy-profile .avatar-sm')?.addEventListener('click',()=>location.href='/admin/website-management/?tab=password');
  document.querySelector('.legacy-profile>div:last-child')?.addEventListener('click',()=>location.href='/admin/website-management/?tab=password');
  document.querySelector('#logout')?.addEventListener('click', async () => {
    const result = await Swal.fire({ icon:'warning', title:'Sign out?', text:'Your admin session will be closed.', showCancelButton:true, confirmButtonText:'Sign Out', confirmButtonColor:'#132b86' });
    if (!result.isConfirmed) return;
    try { await api('/admin/logout', { method:'POST', body:'{}' }); } catch (_) {}
    clearSession(); location.replace(ADMIN_CONFIG.LOGIN_PAGE);
  });
  return admin;
}

export function handleAdminError(error, title = 'Request failed') {
  if (error.status === 401) { clearSession(); location.replace(ADMIN_CONFIG.LOGIN_PAGE); return; }
  Swal.fire({ icon:'error', title, text:error.message, confirmButtonColor:'#132b86' });
}

export const escapeHtml = (value) => String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
export const statusMeta = (value) => String(value) === '1' ? ['Active','success'] : String(value) === '2' ? ['Pending','warning'] : ['Banned','danger'];
export const loading = (title = 'Processing…', text = 'Please wait while we complete your request.') => {
  const dots = Array.from({ length:10 }, () => '<span></span>').join('');
  return Swal.fire({ title, html:`<div class="mbr-loader" aria-hidden="true">${dots}</div><div class="mbr-loader-message">${escapeHtml(text)}</div>`, allowOutsideClick:false, allowEscapeKey:false, showConfirmButton:false, customClass:{ popup:'mbr-alert mbr-processing' } });
};

export function pageCache(key) {
  const admin = session().admin || {};
  const owner = admin.id || admin.username || 'admin';
  const storageKey = `mbrAdminCache:${owner}:${key}`;
  return {
    read() { try { return JSON.parse(localStorage.getItem(storageKey) || 'null')?.data || null; } catch (_) { localStorage.removeItem(storageKey); return null; } },
    write(data) { try { localStorage.setItem(storageKey, JSON.stringify({ savedAt:Date.now(), data })); } catch (_) {} },
    clear() { localStorage.removeItem(storageKey); },
  };
}

export function backgroundRefresh(callback, interval = 45000) {
  const refresh = () => { if (!document.hidden) Promise.resolve(callback(true)).catch(() => {}); };
  const timer = window.setInterval(refresh, interval);
  document.addEventListener('visibilitychange', refresh);
  window.addEventListener('beforeunload', () => window.clearInterval(timer), { once:true });
  return timer;
}

export function openLegacyModal({ title, body, confirmText = 'Save', onConfirm, large = true }) {
  document.querySelector('#legacy-modal-host')?.remove();
  const host = document.createElement('div'); host.id = 'legacy-modal-host';
  host.innerHTML = `<div class="modal-backdrop fade show"></div><div class="modal fade show legacy-api-modal" tabindex="-1" role="dialog" style="display:block"><div class="modal-dialog ${large?'modal-lg':''}" role="document"><div class="modal-content"><div class="modal-header no-bd"><h5 class="modal-title">${title}</h5><button type="button" class="close" data-modal-close><span>&times;</span></button></div><div class="modal-body">${body}</div><div class="modal-footer no-bd"><button type="button" class="btn btn-secondary" data-modal-close>Close</button>${onConfirm?`<button type="button" class="btn btn-primary" data-modal-confirm>${confirmText}</button>`:''}</div></div></div></div>`;
  document.body.append(host); document.body.classList.add('modal-open');
  const close=()=>{host.remove();document.body.classList.remove('modal-open')};host.querySelectorAll('[data-modal-close]').forEach(b=>b.onclick=close);
  if(onConfirm) host.querySelector('[data-modal-confirm]').onclick=()=>onConfirm(host,close);
  return {host,close};
}
