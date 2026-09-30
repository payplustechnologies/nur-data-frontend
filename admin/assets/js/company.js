import{mountLegacyPage}from'./legacy-page.js?v=20260905-2';

const root=mountLegacyPage('company','PayPlus Technologies','Company');

root.innerHTML=`
  <div class="payplus-page">
    <section class="payplus-hero">
      <div class="payplus-orb payplus-orb-one"></div><div class="payplus-orb payplus-orb-two"></div>
      <div class="payplus-hero-copy">
        <div class="payplus-badge"><span>P+</span> PAYPLUS TECHNOLOGIES</div>
        <h1>Technology built to keep your business moving.</h1>
        <p>We design secure payment platforms, mobile applications and dependable business software that make daily operations simpler and digital growth easier.</p>
        <div class="payplus-actions">
          <a class="payplus-btn payplus-btn-light" href="https://payplustechnologies.com/" target="_blank" rel="noopener"><i class="fas fa-globe"></i> Visit our website</a>
          <a class="payplus-btn payplus-btn-glass" href="https://wa.me/2347066620622" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Chat with our team</a>
        </div>
        <div class="payplus-proof"><span><i class="fas fa-check"></i> Secure engineering</span><span><i class="fas fa-check"></i> Reliable delivery</span><span><i class="fas fa-check"></i> Long-term support</span></div>
      </div>
      <div class="payplus-visual" aria-hidden="true">
        <div class="payplus-window">
          <div class="payplus-window-top"><i></i><i></i><i></i><span>payplus technologies</span></div>
          <div class="payplus-window-body">
            <div class="payplus-mini-head"><span>Digital operations</span><b>Live</b></div>
            <div class="payplus-chart"><i></i><i></i><i></i><i></i><i></i><i></i></div>
            <div class="payplus-mini-grid"><span><i class="fas fa-shield-alt"></i><small>Secure</small></span><span><i class="fas fa-bolt"></i><small>Fast</small></span><span><i class="fas fa-headset"></i><small>Supported</small></span></div>
          </div>
        </div>
        <div class="payplus-float-card"><i class="fas fa-check-circle"></i><span><small>System status</small><b>Everything is running</b></span></div>
      </div>
    </section>

    <section class="payplus-intro"><span>YOUR TECHNOLOGY PARTNER</span><h2>More than software. A team that stays with you.</h2><p>From the first idea to launch, maintenance and future improvements, we help businesses build technology they can confidently depend on.</p></section>

    <section class="payplus-bento">
      <article class="payplus-capability payplus-capability-large"><div class="payplus-card-icon"><i class="fas fa-layer-group"></i></div><span>PRODUCT DEVELOPMENT</span><h3>Digital platforms made around your business.</h3><p>Web platforms, mobile apps, admin systems and custom tools designed for real operational needs.</p><div class="payplus-tags"><b>Web applications</b><b>Mobile apps</b><b>Admin systems</b></div></article>
      <article class="payplus-capability"><div class="payplus-card-icon"><i class="fas fa-credit-card"></i></div><h3>Payments & integrations</h3><p>Secure payment experiences and reliable third-party service integrations.</p></article>
      <article class="payplus-capability payplus-capability-dark"><div class="payplus-card-icon"><i class="fas fa-shield-alt"></i></div><h3>Built with confidence</h3><p>Security, stability and thoughtful engineering are part of every solution.</p></article>
    </section>

    <section class="payplus-help">
      <div class="payplus-help-mark"><i class="fas fa-headset"></i><span></span></div>
      <div><span>HERE WHEN YOU NEED US</span><h2>Need support, another service or a new feature?</h2><p>Whether you need technical support, another provider integration, more services or a completely new feature, the PayPlus Technologies team is available and ready to assist.</p></div>
      <a href="https://wa.me/2347066620622" target="_blank" rel="noopener">Request assistance <i class="fas fa-arrow-right"></i></a>
    </section>

    <section class="payplus-contact">
      <div class="payplus-contact-copy"><span>LET'S CONNECT</span><h2>Talk directly with our team.</h2><p>Choose the channel that is most convenient for you. We would be happy to discuss your support request or next digital project.</p></div>
      <div class="payplus-contact-grid">
        <a href="mailto:info@payplustechnologies.com"><i class="fas fa-envelope"></i><span><small>Email us</small><b>info@payplustechnologies.com</b></span><em class="fas fa-arrow-right"></em></a>
        <a href="tel:+2347066620622"><i class="fas fa-phone-alt"></i><span><small>Call us</small><b>+234 706 662 0622</b></span><em class="fas fa-arrow-right"></em></a>
        <a href="https://wa.me/2347066620622" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i><span><small>WhatsApp</small><b>Start a direct conversation</b></span><em class="fas fa-arrow-right"></em></a>
        <a href="https://payplustechnologies.com/" target="_blank" rel="noopener"><i class="fas fa-globe-africa"></i><span><small>Website</small><b>payplustechnologies.com</b></span><em class="fas fa-arrow-right"></em></a>
      </div>
    </section>
  </div>`;
