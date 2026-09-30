/**
 * Public deployment configuration.
 *
 * Add each client profile here and map its custom hostname below. Never place API
 * keys, database credentials, payment secrets, or private tokens here because
 * every value in this file is visible in the browser.
 */
const assetUrl = (path) => new URL(path, import.meta.url).href;

const defaultConfig = {
  clientKey: 'mbrdata', // Frontend label only; it is not a backend tenant_id.
  appName: 'MBR Data',
  shortName: 'MBR',
  tagline: 'Fast, secure digital services',
  license: Object.freeze({ id: 'PPT-MBRDATA' }),

  api: Object.freeze({
    baseUrl: 'https://app.mbrdata.com/api',
    timeoutMs: 15000,
  }),

  branding: Object.freeze({
    primaryColor: '#0D2275',
    logoUrl: assetUrl('../img/mbr-brand.jpg'),
    faviconUrl: assetUrl('../img/favicon.svg'),
    allowBackendOverride: false,
  }),

  support: Object.freeze({
    email: '',
    phone: '',
    whatsapp: '',
    whatsappGroup: '',
    address: '',
  }),

  company: Object.freeze({
    name: 'PayPlus Technologies',
    website: 'https://payplustechnologies.com/',
    email: 'info@payplustechnologies.com',
    phone: '+2347066620622',
    whatsapp: '2347066620622',
  }),

  features: Object.freeze({
    data: true,
    airtime: true,
    cable: true,
    electricity: true,
    exam: true,
    smile: true,
    nin: true,
    bvn: true,
    alpha: true,
    ratel: true,
    kirani: true,
    pricing: true,
    developerApi: true,
    cashbackWithdrawal: true,
  }),
};

const CLIENT_PROFILES = Object.freeze({
  mbrdata: defaultConfig,

  'nur-data': {
    ...defaultConfig,
    clientKey: 'nur-data',
    appName: 'Nur Data',
    shortName: 'ND',
    tagline: 'Simple, reliable digital services',
    license: { id: 'PPT-NUR-DATA' },
    api: { ...defaultConfig.api, baseUrl: 'https://app.nurdatasub.com/api' },
    branding: {
      ...defaultConfig.branding,
      logoUrl: assetUrl('../img/nur-data-logo.svg'),
      faviconUrl: assetUrl('../img/nur-data-logo.svg'),
    },
    support: { ...defaultConfig.support, email: 'support@nurdata.com' },
    company: { ...defaultConfig.company },
    features: { ...defaultConfig.features },
  },
});

// Add production domains here, without https:// or a trailing slash.
const HOSTNAME_PROFILE = Object.freeze({
  'mbrdata.com': 'mbrdata',
  'www.mbrdata.com': 'mbrdata',
  'app.mbrdata.com': 'mbrdata',
  'nurdatasub.com': 'nur-data',
  'www.nurdatasub.com': 'nur-data',
  'app.nurdatasub.com': 'nur-data',
  'payplustechnologies.github.io': 'mbrdata',
});

function selectedProfileKey() {
  // A live hostname always owns its profile; query parameters cannot switch
  // a production site to another client's API.
  const mapped = HOSTNAME_PROFILE[location.hostname];
  if (mapped) return mapped;

  const requested = new URLSearchParams(location.search).get('client');
  if (['localhost', '127.0.0.1'].includes(location.hostname)
    && requested && Object.hasOwn(CLIENT_PROFILES, requested)) {
    sessionStorage.setItem('clientProfile', requested);
    return requested;
  }
  return ['localhost', '127.0.0.1'].includes(location.hostname)
    ? sessionStorage.getItem('clientProfile') || 'mbrdata'
    : 'mbrdata';
}

export const CLIENT_CONFIG = Object.freeze(CLIENT_PROFILES[selectedProfileKey()] || defaultConfig);
export { CLIENT_PROFILES };

export function applyClientIdentity(config = CLIENT_CONFIG, { admin = false } = {}) {
  const root = document.documentElement;
  root.style.setProperty('--brand', config.branding.primaryColor);
  root.dataset.client = config.clientKey;

  document.querySelectorAll('[data-brand-name]').forEach((node) => {
    node.textContent = config.appName;
  });
  document.querySelectorAll('[data-brand-tagline]').forEach((node) => {
    node.textContent = config.tagline;
  });

  // Covers legacy headings that pre-date the data-brand-name hook.
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const brandPattern = /\bMBR\s+DATA\b/gi;
  let textNode;
  while ((textNode = walker.nextNode())) {
    if (['SCRIPT', 'STYLE'].includes(textNode.parentElement?.tagName)) continue;
    if (brandPattern.test(textNode.nodeValue)) {
      textNode.nodeValue = textNode.nodeValue.replace(brandPattern, config.appName);
    }
    brandPattern.lastIndex = 0;
  }

  const currentTitle = document.title || '';
  if (currentTitle) {
    const pageTitle = currentTitle.split(/\s[·|–-]\s/)[0].trim();
    document.title = pageTitle && pageTitle.toLowerCase() !== config.appName.toLowerCase()
      ? `${pageTitle} · ${config.appName}`
      : config.appName;
  }

  let favicon = document.querySelector('link[rel~="icon"]');
  if (!favicon) {
    favicon = document.createElement('link');
    favicon.rel = 'icon';
    document.head.append(favicon);
  }
  favicon.href = config.branding.faviconUrl;

  document.querySelectorAll('[data-client-logo], .brand-logo').forEach((image) => {
    if (image.tagName === 'IMG') {
      image.src = config.branding.logoUrl;
      image.alt = `${config.appName} logo`;
    }
  });

  if (admin) {
    document.querySelectorAll('.admin-mark strong').forEach((node) => { node.textContent = config.appName; });
  }
}
