/**
 * _dev-waves-tool.js — Wellen-Maske live justieren
 * Nur auf localhost aktiv. Vor </body> einbinden.
 *
 * Steuert:
 *  - Kanten-Breite   : ab wann die Linien ausgeblendet werden (%)
 *  - Kanten-Stärke   : wie sichtbar die Linie am Übergang bleibt (0–1)
 *  - Mitte           : Sichtbarkeit in der Seitenmitte (0 = aus)
 */
(function () {
  if (!['localhost', '127.0.0.1', ''].includes(location.hostname)) return;

  const LS_KEY = '_waves_tool';
  const DEFAULT = { edgeWidth: 24, midOpacity: 0.55, centerOpacity: 0.0 };

  function loadState() {
    try { return Object.assign({}, DEFAULT, JSON.parse(localStorage.getItem(LS_KEY) || '{}')); }
    catch { return { ...DEFAULT }; }
  }
  function saveState(s) { localStorage.setItem(LS_KEY, JSON.stringify(s)); }

  let state = loadState();

  function buildMask(s) {
    const mid = (s.edgeWidth / 2).toFixed(1);
    const ew  = s.edgeWidth.toFixed(1);
    const mo  = s.midOpacity.toFixed(2);
    const co  = s.centerOpacity.toFixed(2);
    const ew2 = (100 - s.edgeWidth).toFixed(1);
    const mid2= (100 - s.edgeWidth / 2).toFixed(1);
    return `linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,${mo}) ${mid}%, rgba(0,0,0,${co}) ${ew}%, rgba(0,0,0,${co}) ${ew2}%, rgba(0,0,0,${mo}) ${mid2}%, rgba(0,0,0,1) 100%)`;
  }

  function applyMask(s) {
    const waveBg = document.getElementById('waveBg');
    if (!waveBg) return;
    const mask = buildMask(s);
    waveBg.style.webkitMaskImage = mask;
    waveBg.style.maskImage = mask;
  }

  // Beim Laden gespeicherte Werte anwenden
  applyMask(state);

  // ── Styles ────────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #_wt{position:fixed;bottom:20px;left:20px;z-index:99999;width:260px;background:#1a1a1a;color:#e8e8e8;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.65);font-family:system-ui,sans-serif;font-size:12px;user-select:none;}
    #_wt ._wh{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#252525;border-radius:10px 10px 0 0;cursor:move;font-weight:600;font-size:13px;}
    #_wt ._wh button{background:#333;border:none;color:#ccc;border-radius:5px;padding:3px 8px;cursor:pointer;font-size:11px;}
    #_wt ._wh button:hover{background:#444;}
    #_wt #_wcpy{background:#2d5f3f!important;color:#fff!important;}
    #_wt #_wcpy:hover{background:#3a7a52!important;}
    #_wt ._wb{padding:12px;display:flex;flex-direction:column;gap:10px;}
    #_wt ._wr{display:flex;flex-direction:column;gap:4px;}
    #_wt ._wl{display:flex;justify-content:space-between;font-size:11px;color:#aaa;}
    #_wt ._wl span:last-child{color:#4a7c59;font-variant-numeric:tabular-nums;}
    #_wt input[type=range]{width:100%;accent-color:#4a7c59;cursor:pointer;}
    #_wt ._wdiv{border:none;border-top:1px solid #2a2a2a;margin:2px 0;}
    #_wt.mini ._wb{display:none;}
    #_wt.mini{border-radius:10px;}
  `;
  document.head.appendChild(style);

  // ── Panel ─────────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = '_wt';
  panel.innerHTML = `
    <div class="_wh">
      <span>〜 Wellen-Maske</span>
      <div style="display:flex;gap:4px;">
        <button id="_wmin">−</button>
        <button id="_wcpy">CSS kopieren</button>
        <button id="_wclose">✕</button>
      </div>
    </div>
    <div class="_wb">
      <div class="_wr">
        <div class="_wl"><span>Kanten-Breite</span><span id="_ewV">${state.edgeWidth}%</span></div>
        <input type="range" id="_ew" min="10" max="45" step="1" value="${state.edgeWidth}">
      </div>
      <div class="_wr">
        <div class="_wl"><span>Kanten-Stärke</span><span id="_moV">${state.midOpacity.toFixed(2)}</span></div>
        <input type="range" id="_mo" min="0" max="1" step="0.05" value="${state.midOpacity}">
      </div>
      <hr class="_wdiv"/>
      <div class="_wr">
        <div class="_wl"><span>Mitte sichtbar</span><span id="_coV">${state.centerOpacity.toFixed(2)}</span></div>
        <input type="range" id="_co" min="0" max="0.6" step="0.05" value="${state.centerOpacity}">
      </div>
    </div>`;
  document.body.appendChild(panel);

  // ── Slider-Events ─────────────────────────────────────────
  function wire(id, valId, key, fmt) {
    const sl = document.getElementById(id);
    const vl = document.getElementById(valId);
    sl.addEventListener('input', function () {
      state[key] = parseFloat(this.value);
      vl.textContent = fmt(state[key]);
      applyMask(state);
      saveState(state);
    });
  }
  wire('_ew', '_ewV', 'edgeWidth',    v => v + '%');
  wire('_mo', '_moV', 'midOpacity',   v => v.toFixed(2));
  wire('_co', '_coV', 'centerOpacity',v => v.toFixed(2));

  // ── Copy ──────────────────────────────────────────────────
  document.getElementById('_wcpy').addEventListener('click', function () {
    const mask = buildMask(state);
    const css = [
      '/* Wellen-Maske — aus _dev-waves-tool */',
      `-webkit-mask-image: ${mask};`,
      `        mask-image: ${mask};`,
    ].join('\n');
    navigator.clipboard.writeText(css).then(() => {
      this.textContent = '✓ Kopiert!';
      setTimeout(() => { this.textContent = 'CSS kopieren'; }, 1800);
    });
  });

  // ── Minimize / Close ──────────────────────────────────────
  document.getElementById('_wmin').addEventListener('click', () => {
    const m = panel.classList.toggle('mini');
    document.getElementById('_wmin').textContent = m ? '+' : '−';
  });
  document.getElementById('_wclose').addEventListener('click', () => panel.remove());

  // ── Draggable ─────────────────────────────────────────────
  const hdr = panel.querySelector('._wh');
  let drag = false, ox = 0, oy = 0;
  hdr.addEventListener('mousedown', e => {
    if (e.target.tagName === 'BUTTON') return;
    drag = true;
    ox = e.clientX - panel.getBoundingClientRect().left;
    oy = e.clientY - panel.getBoundingClientRect().top;
    panel.style.left = 'auto'; panel.style.bottom = 'auto';
  });
  document.addEventListener('mousemove', e => {
    if (drag) { panel.style.left = (e.clientX - ox) + 'px'; panel.style.top = (e.clientY - oy) + 'px'; }
  });
  document.addEventListener('mouseup', () => drag = false);
})();
