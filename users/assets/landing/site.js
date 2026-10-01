import { CLIENT_CONFIG } from '../js/client-config.js';

const root = document.documentElement;
const menuButton = document.querySelector('.menu-button');
const siteNav = document.getElementById('site-nav');

menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') !== 'true';
  menuButton.setAttribute('aria-expanded', String(open));
  menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  siteNav?.classList.toggle('open', open);
});
siteNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
  siteNav.classList.remove('open');
  menuButton?.setAttribute('aria-expanded', 'false');
  menuButton?.setAttribute('aria-label', 'Open menu');
}));

const revealItems = [...document.querySelectorAll('[data-reveal]')];
if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  document.body.classList.add('has-motion');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, { threshold: 0.08, rootMargin: '0px 0px 40px 0px' });
  revealItems.forEach((item) => observer.observe(item));
}

function validColor(value) {
  const color = String(value || '').trim();
  return /^#?[0-9a-f]{3}(?:[0-9a-f]{3})?$/i.test(color)
    ? (color.startsWith('#') ? color : `#${color}`)
    : '';
}

function whatsappLink(raw) {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (/^https?:\/\//i.test(value)) {
    try {
      const url = new URL(value);
      return ['wa.me', 'api.whatsapp.com'].includes(url.hostname.toLowerCase()) ? url.href : '';
    } catch (_) { return ''; }
  }
  let digits = value.replace(/\D/g, '');
  if (digits.startsWith('0')) digits = `234${digits.slice(1)}`;
  return /^\d{10,15}$/.test(digits) ? `https://wa.me/${digits}` : '';
}

function setLink(selector, href, label) {
  document.querySelectorAll(selector).forEach((element) => {
    element.hidden = !href;
    if (href) {
      element.href = href;
      if (label) element.textContent = label;
    } else {
      element.removeAttribute('href');
    }
  });
}

function renderIdentity(settings = {}) {
  const name = String(settings.name || CLIENT_CONFIG.appName).trim() || CLIENT_CONFIG.appName;
  const color = validColor(settings.color) || validColor(CLIENT_CONFIG.branding.primaryColor);
  if (color) {
    root.style.setProperty('--brand', color);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', color);
  }
  document.querySelectorAll('[data-brand-name]').forEach((node) => { node.textContent = name; });
  document.querySelectorAll('[data-client-logo]').forEach((image) => {
    image.src = CLIENT_CONFIG.branding.logoUrl;
    image.alt = `${name} logo`;
  });
  document.querySelector('link[rel="icon"]')?.setAttribute('href', CLIENT_CONFIG.branding.faviconUrl);
  document.title = `${name} — Data, airtime and bills`;
  document.querySelector('meta[name="description"]')?.setAttribute('content', `${name} brings data, airtime and everyday bill payments together in one account.`);
  document.querySelector('.site-header .brand')?.setAttribute('aria-label', `${name} home`);

  const company = CLIENT_CONFIG.company;
  document.querySelectorAll('[data-company-name]').forEach((node) => { node.textContent = company.name; });
  document.querySelectorAll('[data-company-link]').forEach((link) => { link.href = company.website; });
  const year = document.querySelector('[data-year]');
  if (year) year.textContent = String(new Date().getFullYear());
}

function renderContact(settings = {}) {
  const support = CLIENT_CONFIG.support;
  const email = String(settings.email || support.email || '').trim();
  setLink('[data-contact-email]', /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ? `mailto:${email}` : '', email);

  const phone = String(settings.phone || support.phone || '').trim();
  const dial = phone.replace(/[^+\d]/g, '');
  setLink('[data-contact-phone]', /^\+?\d{7,15}$/.test(dial) ? `tel:${dial}` : '', phone);

  const whatsapp = whatsappLink(settings.whatlink || support.whatsapp);
  setLink('[data-contact-whatsapp]', whatsapp);

  const address = String(settings.address || support.address || '').trim();
  document.querySelectorAll('[data-contact-address]').forEach((node) => {
    node.hidden = !address;
    node.textContent = address ? `Office address: ${address}` : '';
  });
}

function renderPlans(allPlans = {}) {
  document.querySelectorAll('.price-card[data-network]').forEach((card) => {
    const list = card.querySelector('[data-plan-list]');
    const plans = Array.isArray(allPlans[card.dataset.network]) ? allPlans[card.dataset.network] : [];
    list.replaceChildren();
    if (!plans.length) {
      const empty = document.createElement('p');
      empty.className = 'no-plans';
      empty.textContent = 'Sign in to see current plans and prices.';
      list.append(empty);
      return;
    }
    plans.slice(0, 15).forEach((plan) => {
      const price = Number(plan.price);
      if (!Number.isFinite(price) || price <= 0) return;
      const row = document.createElement('div');
      row.className = 'price-row';
      const title = document.createElement('span');
      title.textContent = String(plan.name || 'Data plan');
      const detail = document.createElement('small');
      const days = Number(plan.day);
      detail.textContent = `${String(plan.type || 'Data')} · ${Number.isFinite(days) && days > 0 ? `${days} ${days === 1 ? 'day' : 'days'}` : 'Validity varies'}`;
      title.append(detail);
      const amount = document.createElement('strong');
      amount.textContent = `₦${price.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      row.append(title, amount);
      list.append(row);
    });
  });
}

renderIdentity();
renderContact();
renderPlans();

const cacheKey = `landing-public:${CLIENT_CONFIG.clientKey}`;
try {
  const saved = JSON.parse(sessionStorage.getItem(cacheKey) || 'null');
  if (saved && Date.now() - saved.savedAt < 10 * 60 * 1000) {
    renderIdentity(saved.settings);
    renderContact(saved.settings);
    renderPlans(saved.plans);
  }
} catch (_) { /* Ignore damaged local cache. */ }

const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), CLIENT_CONFIG.api.timeoutMs);
fetch(`${CLIENT_CONFIG.api.baseUrl}/client/config?landing=1`, {
  headers: { Accept: 'application/json', 'X-PayPlus-License-ID': CLIENT_CONFIG.license.id },
  signal: controller.signal,
}).then(async (response) => {
  if (!response.ok) throw new Error('Public settings unavailable');
  return response.json();
}).then((payload) => {
  if (payload?.success !== true) return;
  renderIdentity(payload.settings || {});
  renderContact(payload.settings || {});
  renderPlans(payload.plans || {});
  try {
    sessionStorage.setItem(cacheKey, JSON.stringify({ savedAt: Date.now(), settings: payload.settings || {}, plans: payload.plans || {} }));
  } catch (_) { /* Storage is optional. */ }
}).catch(() => {
  // Keep the client-specific identity and any cached public data offline.
}).finally(() => clearTimeout(timeout));
