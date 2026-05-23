/**
 * waves.js — Animierte Hintergrundlinien
 * Selbst-injizierend: CSS + SVG-Element + Animation.
 * Wird auf allen Seiten außer index.html eingebunden
 * (index.html hat die Wellen bereits inline).
 */
(function () {
  'use strict';

  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMob   = window.matchMedia('(max-width: 900px)').matches;

  // ── Farben ────────────────────────────────────────────────────
  const POOL      = ['#2d5f3f','#7a4a9c','#c0883e','#3f6ea8'];
  const POOL_DARK = ['#6ab58a','#c088e8','#e8b870','#82b0e0'];

  function setWaveColors() {
    const isDark = document.body.classList.contains('dark');
    const pool   = isDark ? POOL_DARK : POOL;
    const opac   = isDark ? 0.28 : 0.14;
    [1,2,3,4].forEach((n, i) => {
      const el = document.getElementById('wave' + n);
      if (!el) return;
      const hex = pool[i];
      const r = parseInt(hex.slice(1,3), 16);
      const g = parseInt(hex.slice(3,5), 16);
      const b = parseInt(hex.slice(5,7), 16);
      el.setAttribute('stroke', `rgba(${r},${g},${b},${opac})`);
    });
  }

  // ── CSS ────────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    .wave-bg {
      position: fixed;
      inset: 0;
      width: 100%;
      height: 100%;
      pointer-events: none;
      z-index: 1;
      overflow: hidden;
      -webkit-mask-image: linear-gradient(to right,
        rgba(0,0,0,1) 0%,
        rgba(0,0,0,0.55) 12%,
        rgba(0,0,0,0) 24%,
        rgba(0,0,0,0) 76%,
        rgba(0,0,0,0.55) 88%,
        rgba(0,0,0,1) 100%);
      mask-image: linear-gradient(to right,
        rgba(0,0,0,1) 0%,
        rgba(0,0,0,0.55) 12%,
        rgba(0,0,0,0) 24%,
        rgba(0,0,0,0) 76%,
        rgba(0,0,0,0.55) 88%,
        rgba(0,0,0,1) 100%);
    }
    .wave-bg svg { width: 100%; height: 100%; display: block; }
    .wave-bg path { fill: none; stroke-width: 1.25; }
  `;
  document.head.appendChild(style);

  // ── HTML ───────────────────────────────────────────────────
  const div = document.createElement('div');
  div.className = 'wave-bg';
  div.id = 'waveBg';
  div.setAttribute('aria-hidden', 'true');
  div.innerHTML = `<svg viewBox="0 0 1600 1000" preserveAspectRatio="none">
    <path id="wave1" d="M -200 580 C 200 542, 500 552, 800 514 S 1300 467, 1800 420" stroke="rgba(45,95,63,0.14)"></path>
    <path id="wave2" d="M -200 670 C 250 642, 600 651, 900 614 S 1350 567, 1800 530" stroke="rgba(122,74,156,0.14)"></path>
    <path id="wave3" d="M -200 780 C 300 762, 700 753, 1000 727 S 1400 692, 1800 665" stroke="rgba(192,136,62,0.14)"></path>
    <path id="wave4" d="M -200 420 C 280 438, 580 393, 880 411 S 1320 374, 1800 310" stroke="rgba(63,110,168,0.14)"></path>
  </svg>`;
  document.body.insertBefore(div, document.body.firstChild);

  // Farben sofort nach Einfügen setzen (dark mode bereits bekannt)
  setWaveColors();

  // Bei Dark-Mode-Toggle nachziehen
  const observer = new MutationObserver(() => setWaveColors());
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

  // ── Animation ──────────────────────────────────────────────
  if (reduced || isMob) return;

  const waveDefs = [
    {
      id: 'wave1', base: { y0: 580, y1: 420 },
      cps: [[200,542,40,50,0.0],[500,552,50,59,0.7],[800,514,55,55,1.4],
            [1100,495,46,63,2.1],[1300,467,37,53,2.8],[1600,438,28,57,3.5]],
    },
    {
      id: 'wave2', base: { y0: 670, y1: 530 },
      cps: [[250,642,32,67,1.5],[600,651,50,61,2.2],[900,614,60,57,2.9],
            [1200,595,50,65,3.6],[1350,567,37,55,4.3],[1600,549,28,59,5.0]],
    },
    {
      id: 'wave3', base: { y0: 780, y1: 665 },
      cps: [[300,762,25,74,3.0],[700,753,37,68,3.7],[1000,727,41,63,4.4],
            [1300,709,37,70,5.1],[1400,692,28,61,5.8],[1600,683,21,67,0.5]],
    },
    {
      id: 'wave4', base: { y0: 420, y1: 310 },
      cps: [[280,438,23,80,4.5],[580,393,32,72,5.2],[880,411,41,76,5.9],
            [1080,402,32,68,0.6],[1320,374,28,78,1.3],[1600,338,21,74,2.0]],
    },
  ];

  function buildPath(def, t) {
    const { y0, y1 } = def.base;
    const c = def.cps.map(([x, y, amp, freq, phase]) => {
      return [x, y + Math.sin((t / 1000) * (2 * Math.PI / freq) + phase) * amp];
    });
    const [c0, c1, c2, c3, c4, c5] = c;
    return `M -200 ${y0} C ${c0[0]} ${c0[1]}, ${c1[0]} ${c1[1]}, ${c2[0]} ${c2[1]} S ${c3[0]} ${c3[1]}, ${c4[0]} ${c4[1]} S ${c5[0]} ${c5[1]}, 1800 ${y1}`;
  }

  const els = waveDefs.map(d => ({
    def: d,
    el: document.getElementById(d.id),
  }));

  let pageVisible = !document.hidden;
  let raf = null;
  const start = performance.now();

  function tick(now) {
    if (!pageVisible) { raf = null; return; }
    const t = now - start;
    els.forEach(({ def, el }) => { if (el) el.setAttribute('d', buildPath(def, t)); });
    raf = requestAnimationFrame(tick);
  }

  document.addEventListener('visibilitychange', () => {
    pageVisible = !document.hidden;
    if (pageVisible && !raf) raf = requestAnimationFrame(tick);
  });

  raf = requestAnimationFrame(tick);
})();
