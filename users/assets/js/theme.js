const THEME_KEY = 'mbrTheme';

function preferredTheme() {
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  return matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  document.querySelectorAll('[data-theme-toggle]').forEach(button => {
    const dark = theme === 'dark';
    button.innerHTML = `<i class="bi bi-${dark ? 'sun' : 'moon-stars'}"></i><span>${dark ? 'Light' : 'Dark'}</span>`;
    button.setAttribute('aria-label', `Switch to ${dark ? 'light' : 'dark'} theme`);
    button.title = `Switch to ${dark ? 'light' : 'dark'} theme`;
  });
}

export function initTheme() {
  if (!document.querySelector('link[data-theme-styles]')) {
    const stylesheet = document.createElement('link');
    stylesheet.rel = 'stylesheet';
    stylesheet.href = './assets/css/theme.css?v=20260829-1';
    stylesheet.dataset.themeStyles = 'true';
    document.head.append(stylesheet);
  }
  let button = document.querySelector('[data-theme-toggle]');
  if (!button) {
    button = document.createElement('button');
    button.type = 'button';
    button.className = 'theme-toggle';
    button.dataset.themeToggle = 'true';
    const header = document.querySelector('main>header, .dash-header, header');
    const user = header?.querySelector('.user, .user-pill, .user-chip');
    if (header && user) header.insertBefore(button, user);
    else document.body.append(button);
  }
  applyTheme(preferredTheme());
  button.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    localStorage.setItem(THEME_KEY, next);
    applyTheme(next);
  });
}

