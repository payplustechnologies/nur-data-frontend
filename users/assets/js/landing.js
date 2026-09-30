const menu = document.querySelector('#menu');
const nav = document.querySelector('#site-nav');
menu?.addEventListener('click', () => nav.classList.toggle('open'));
nav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => nav.classList.remove('open')));

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    observer.unobserve(entry.target);
  });
}, { threshold: 0.12 });
document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));

const counterObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const target = Number(entry.target.dataset.count || 0);
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
      const progress = Math.min(1, (now - start) / duration);
      entry.target.textContent = String(Math.round(target * (1 - Math.pow(1 - progress, 3))));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    counterObserver.unobserve(entry.target);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((counter) => counterObserver.observe(counter));

const rotatingWord = document.querySelector('.rotating-word');
const phrases = ['in one wallet.', 'delivered faster.', 'made more secure.'];
let phraseIndex = 0;
if (rotatingWord && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  setInterval(() => {
    rotatingWord.style.opacity = '0';
    rotatingWord.style.transform = 'translateY(8px)';
    setTimeout(() => {
      phraseIndex = (phraseIndex + 1) % phrases.length;
      rotatingWord.textContent = phrases[phraseIndex];
      rotatingWord.style.opacity = '1';
      rotatingWord.style.transform = 'none';
    }, 260);
  }, 3200);
}
