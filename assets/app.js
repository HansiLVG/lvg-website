/* ─── Shared app interactions ─────────────────────────────────────
   Used by ALL pages: FAQ accordion, mobile nav, reveal-on-scroll,
   cookie banner, GA4 consent mode v2.
*/

(function () {
  'use strict';

  /* ─── FAQ accordion (delegated, works for any .faq-item on the page) ─── */
  document.addEventListener('click', function (e) {
    var btn = e.target.closest && e.target.closest('.faq-q');
    if (!btn) return;
    var item = btn.closest('.faq-item');
    if (item) item.classList.toggle('open');
  });

  /* ─── Step accordion (Leistungsseiten) ─── */
  document.addEventListener('click', function (e) {
    var trg = e.target.closest && e.target.closest('.step-acc');
    if (!trg) return;
    if (e.target.closest('a')) return;
    trg.classList.toggle('open');
  });

  /* ─── Mobile nav ─── */
  function initMobileNav() {
    var hamb = document.getElementById('hamb');
    var navMobile = document.getElementById('navMobile');
    if (!hamb || !navMobile) return;
    hamb.addEventListener('click', function () {
      navMobile.classList.toggle('open');
    });
    navMobile.querySelectorAll('a').forEach(function (a) {
      a.addEventListener('click', function () { navMobile.classList.remove('open'); });
    });
    document.addEventListener('click', function (e) {
      if (!navMobile.classList.contains('open')) return;
      if (e.target.closest('.nav')) return;
      navMobile.classList.remove('open');
    });
  }

  /* ─── Reveal-on-scroll ─── */
  function initReveal() {
    if (!('IntersectionObserver' in window)) {
      document.querySelectorAll('.reveal').forEach(function (el) { el.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add('in');
      });
    }, { threshold: 0.10, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.reveal').forEach(function (el) { io.observe(el); });
  }

  /* ─── Cookie Banner + GA4 Consent Mode v2 ─────────────────────────
     GA4 ID: G-CMYKYVVJM3 (identisch zu V1, damit Property erhalten bleibt).
     Default = denied. Nutzer akzeptiert → granted + GA wird geladen.
  */
  var GA_ID = 'G-CMYKYVVJM3';
  var STORAGE_KEY = 'lvg-consent-v1';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  gtag('consent', 'default', {
    'ad_storage': 'denied',
    'ad_user_data': 'denied',
    'ad_personalization': 'denied',
    'analytics_storage': 'denied',
    'functionality_storage': 'granted',
    'security_storage': 'granted',
    'wait_for_update': 500
  });
  gtag('set', 'ads_data_redaction', true);

  function loadGA() {
    if (window._gaLoaded) return;
    window._gaLoaded = true;
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID, { 'anonymize_ip': true });
  }

  function applyConsent(granted) {
    if (granted) {
      gtag('consent', 'update', {
        'analytics_storage': 'granted',
        'ad_storage': 'granted',
        'ad_user_data': 'granted',
        'ad_personalization': 'granted'
      });
      loadGA();
    } else {
      gtag('consent', 'update', {
        'analytics_storage': 'denied',
        'ad_storage': 'denied',
        'ad_user_data': 'denied',
        'ad_personalization': 'denied'
      });
    }
  }

  function initCookieBanner() {
    var stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch (e) {}
    if (stored === 'granted') { applyConsent(true); return; }
    if (stored === 'denied')  { applyConsent(false); return; }

    var banner = document.getElementById('cookie-banner');
    if (!banner) return;
    banner.classList.add('show');

    var accept = document.getElementById('cookie-accept');
    var decline = document.getElementById('cookie-decline');
    function close() { banner.classList.remove('show'); }
    if (accept) accept.addEventListener('click', function () {
      try { localStorage.setItem(STORAGE_KEY, 'granted'); } catch (e) {}
      applyConsent(true);
      close();
    });
    if (decline) decline.addEventListener('click', function () {
      try { localStorage.setItem(STORAGE_KEY, 'denied'); } catch (e) {}
      applyConsent(false);
      close();
    });
  }

  /* ─── Aurora Waves sind reines CSS (siehe .aurora-waves in styles.css).
     Kein JS nötig, kein Scroll-Listener, kein Layout-Impact auf Seitenhöhe.
  */

  /* ─── Über-mich Portrait: Höhe an Textblock binden ─── */
  function initUeberPortrait() {
    var text = document.querySelector('.ueber-text');
    var portrait = document.querySelector('.ueber-portrait');
    if (!text || !portrait) return;
    function sync() {
      if (window.innerWidth > 920) {
        portrait.style.height = text.offsetHeight + 'px';
      } else {
        portrait.style.height = '';
      }
    }
    sync();
    window.addEventListener('resize', sync);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(sync);
    }
  }

  /* ─── Nav: transparente Variante auf Homepage, scrollt zu solid ─── */
  function initNavScroll() {
    var nav = document.getElementById('nav');
    if (!nav) return;
    var ticking = false;
    function update() {
      if (window.scrollY > 80) nav.classList.add('is-scrolled');
      else nav.classList.remove('is-scrolled');
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
  }

  /* ─── Nav-Dropdown (Hover + Touch/Tastatur) ─── */
  function initNavDropdown() {
    var groups = document.querySelectorAll('.nav-group');
    if (!groups.length) return;
    var isTouch = window.matchMedia('(hover: none)').matches;

    groups.forEach(function (group) {
      var trigger = group.querySelector('.nav-group-trigger');
      var dropdown = group.querySelector('.nav-dropdown');
      if (!trigger) return;
      trigger.setAttribute('aria-expanded', 'false');
      trigger.setAttribute('aria-haspopup', 'true');

      /* ── Hover (nur Desktop) ── */
      if (!isTouch && dropdown) {
        var hideTimer = null;

        function openGroup() {
          clearTimeout(hideTimer);
          group.classList.add('is-open');
          trigger.setAttribute('aria-expanded', 'true');
        }
        function closeGroup(delay) {
          hideTimer = setTimeout(function () {
            group.classList.remove('is-open');
            trigger.setAttribute('aria-expanded', 'false');
          }, delay == null ? 300 : delay);
        }

        trigger.addEventListener('mouseenter', openGroup);
        trigger.addEventListener('mouseleave', function () { closeGroup(300); });
        dropdown.addEventListener('mouseenter', function () { clearTimeout(hideTimer); });
        dropdown.addEventListener('mouseleave', function () { closeGroup(120); });
      }

      /* ── Klick (Touch oder direktes Antippen) ── */
      trigger.addEventListener('click', function (e) {
        if (isTouch || trigger.tagName === 'BUTTON') {
          e.preventDefault();
          var open = group.classList.toggle('is-open');
          trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
          groups.forEach(function (g) { if (g !== group) g.classList.remove('is-open'); });
        }
      });
    });

    /* ── Außerhalb klicken schließt alles ── */
    document.addEventListener('click', function (e) {
      groups.forEach(function (g) {
        if (!g.contains(e.target)) {
          g.classList.remove('is-open');
          var t = g.querySelector('.nav-group-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        }
      });
    });

    /* ── Escape schließt alles ── */
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        groups.forEach(function (g) {
          g.classList.remove('is-open');
          var t = g.querySelector('.nav-group-trigger');
          if (t) t.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  /* ─── Brevo E-Mail-Formular ─── */
  function initBrevoForm() {
    var form = document.querySelector('.calc-email-form');
    if (!form) return;
    var endpoint = form.getAttribute('data-brevo-endpoint');
    if (!endpoint) return;

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var emailInput = form.querySelector('input[type="email"]');
      var btn = form.querySelector('button[type="submit"]');
      var email = emailInput ? emailInput.value.trim() : '';
      if (!email) return;

      btn.disabled = true;
      btn.innerHTML = 'Wird gesendet…';

      fetch(endpoint, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'EMAIL=' + encodeURIComponent(email) + '&email_address_check=&locale=de'
      }).finally(function () {
        window.location.href = '/anmeldung-bestaetigen/';
      });
    });
  }

  /* ─── Site-Suche: Inline Nav-Bar ─── */
  function initSearch() {
    var navInner = document.querySelector('.nav-inner');
    var navLinks = document.querySelector('.nav-links');
    var navBrand = document.querySelector('.nav-brand');
    if (!navInner || !navLinks || !navBrand) return;

    navBrand.style.flex = '0 0 auto';

    var bar = document.createElement('div');
    bar.className = 'nav-search-bar';
    bar.innerHTML =
      '<div class="nav-search-wrap">' +
        '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
        '<input class="nav-search-input" type="search" placeholder="Seite oder Begriff suchen…" autocomplete="off" />' +
        '<span class="nav-search-kbd">⌘K</span>' +
      '</div>';
    navInner.insertBefore(bar, navLinks);

    var input = bar.querySelector('.nav-search-input');
    var index = null;
    var dropdown = null;

    function loadIndex(cb) {
      if (index) { cb(); return; }
      fetch('/search-index.json')
        .then(function (r) { return r.json(); })
        .then(function (d) { index = d; cb(); })
        .catch(function () { index = []; cb(); });
    }

    function closeDropdown() {
      if (dropdown) { dropdown.remove(); dropdown = null; }
    }

    function showDropdown(hits) {
      closeDropdown();
      if (!hits.length) return;
      dropdown = document.createElement('div');
      dropdown.className = 'nav-search-dropdown';
      hits.forEach(function (item) {
        var a = document.createElement('a');
        a.className = 'nav-search-item';
        a.href = item.url;
        a.innerHTML =
          '<span class="nav-search-item-cat">' + item.cat + '</span>' +
          '<span class="nav-search-item-title">' + item.title + '</span>';
        a.addEventListener('mousedown', function (e) {
          e.preventDefault();
          window.location.href = item.url;
        });
        dropdown.appendChild(a);
      });
      bar.appendChild(dropdown);
    }

    input.addEventListener('input', function () {
      var q = input.value.toLowerCase().trim();
      if (!q) { closeDropdown(); return; }
      loadIndex(function () {
        var hits = index.filter(function (item) {
          return (item.title + ' ' + item.desc + ' ' + item.cat).toLowerCase().includes(q);
        }).slice(0, 6);
        showDropdown(hits);
      });
    });

    input.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { input.value = ''; closeDropdown(); input.blur(); }
      if (e.key === 'Enter' && dropdown) {
        var first = dropdown.querySelector('.nav-search-item');
        if (first) { window.location.href = first.href; }
      }
    });

    input.addEventListener('blur', function () {
      setTimeout(closeDropdown, 150);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); input.focus(); }
    });
  }

  /* ─── Boot ─── */
  function boot() {
    initMobileNav();
    initNavScroll();
    initNavDropdown();
    initReveal();
    initCookieBanner();
    initUeberPortrait();
    initBrevoForm();
    initSearch();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
