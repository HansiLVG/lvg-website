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

  /* ─── Boot ─── */
  function boot() {
    initMobileNav();
    initNavScroll();
    initNavDropdown();
    initReveal();
    initCookieBanner();
    initUeberPortrait();
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
