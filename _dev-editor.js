/**
 * _dev-editor.js — Visueller Website-Editor für lvg-ppc.de
 *
 * Nur über _dev-server.js geladen. Niemals in echten HTML-Dateien verlinken.
 *
 * Steuerung:
 *   Alt + E        → Editor ein-/ausschalten
 *   Klick          → Element auswählen
 *   Escape         → Auswahl aufheben / Editor schließen
 *   Strg + Z       → Rückgängig
 *   "Export CSS"   → CSS-Datei mit allen Änderungen herunterladen
 */

(function () {
  'use strict';

  // ─── State ────────────────────────────────────────────────────────────────────

  let editMode   = false;
  let selectedEl = null;
  const undoStack  = [];        // { el, prop, before }
  const changeMap  = new Map(); // el → { prop → value } für CSS-Export
  let changeCount  = 0;

  // ─── DOM-Refs ────────────────────────────────────────────────────────────────

  let toolbar, panel, hoverOutline, selectOutline;

  // ─── Init ────────────────────────────────────────────────────────────────────

  function init() {
    injectCSS();
    hoverOutline  = createOutline('dev-hover-outline',  'hover');
    selectOutline = createOutline('dev-select-outline', 'select');
    toolbar       = createToolbar();
    panel         = createPanel();
    document.body.append(hoverOutline, selectOutline, toolbar, panel);
    document.addEventListener('keydown', onKeyDown);
    window.addEventListener('scroll', updateOutlines, { passive: true });
    window.addEventListener('resize', updateOutlines, { passive: true });
    console.info('%c[DevEditor] bereit — Alt+E zum Starten', 'color:#4a7c59;font-weight:bold;font-size:13px');
  }

  // ─── Edit-Mode ───────────────────────────────────────────────────────────────

  function toggleEditMode() {
    editMode = !editMode;
    document.body.classList.toggle('dev-edit-active', editMode);
    toolbar.querySelector('.dev-btn-toggle').textContent = editMode ? '✕ Editor schließen' : '✎ Editor öffnen';
    if (!editMode) deselect();
  }

  // ─── Hover & Klick ───────────────────────────────────────────────────────────

  document.addEventListener('mouseover', e => {
    if (!editMode || isEditorEl(e.target)) return;
    positionOutline(hoverOutline, e.target);
  }, true);

  document.addEventListener('mouseout', e => {
    if (!editMode || isEditorEl(e.target)) return;
    hoverOutline.style.display = 'none';
  }, true);

  document.addEventListener('click', e => {
    if (!editMode) return;
    if (isEditorEl(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    selectEl(e.target);
  }, true);

  // ─── Tastatur ────────────────────────────────────────────────────────────────

  function onKeyDown(e) {
    if (e.altKey && e.key.toLowerCase() === 'e') {
      e.preventDefault();
      toggleEditMode();
    }
    if (e.key === 'Escape' && editMode) {
      if (selectedEl) deselect();
      else toggleEditMode();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      // Nur wenn Fokus NICHT im contenteditable (wird dort separat behandelt)
      if (document.activeElement?.id !== 'dv-text') {
        e.preventDefault();
        undo();
      }
    }
  }

  // ─── Element auswählen ───────────────────────────────────────────────────────

  function selectEl(el) {
    selectedEl = el;
    positionOutline(selectOutline, el);
    hoverOutline.style.display = 'none';
    fillPanel(el);
    panel.classList.add('dev-visible');
  }

  function deselect() {
    selectedEl = null;
    selectOutline.style.display = 'none';
    hoverOutline.style.display  = 'none';
    panel.classList.remove('dev-visible');
  }

  // ─── Outlines ────────────────────────────────────────────────────────────────

  function createOutline(id, type) {
    const el     = document.createElement('div');
    el.id        = id;
    el.className = `dev-outline dev-outline-${type}`;
    el.style.display = 'none';
    return el;
  }

  function positionOutline(outline, target) {
    const r = target.getBoundingClientRect();
    if (r.width === 0 && r.height === 0) return;
    Object.assign(outline.style, {
      display : 'block',
      top     : (r.top  + window.scrollY - 3) + 'px',
      left    : (r.left + window.scrollX - 3) + 'px',
      width   : (r.width  + 6) + 'px',
      height  : (r.height + 6) + 'px',
    });
  }

  function updateOutlines() {
    if (selectedEl) positionOutline(selectOutline, selectedEl);
  }

  // ─── Panel aufbauen ──────────────────────────────────────────────────────────

  function createPanel() {
    const p = document.createElement('div');
    p.id    = 'dev-panel';
    p.innerHTML = `
      <div class="dev-panel-head" id="dev-panel-head">
        <code class="dev-el-tag">—</code>
        <div class="dev-tabs">
          <button class="dev-tab active" data-tab="typ">Typ</button>
          <button class="dev-tab" data-tab="abstand">Abstand</button>
          <button class="dev-tab" data-tab="hintergrund">Hintergrund</button>
          <button class="dev-tab" data-tab="bild">Bild</button>
        </div>
        <button class="dev-close-btn" title="Schließen">✕</button>
      </div>

      <div class="dev-body">

        <!-- ── Tab: Typografie ── -->
        <div class="dev-pane active" data-pane="typ">

          <div class="dev-rich-label">Text-Inhalt</div>
          <div class="dev-fmt-bar">
            <button type="button" class="dev-fmt-btn" id="dv-bold"      title="Fett"><b>B</b></button>
            <button type="button" class="dev-fmt-btn" id="dv-italic"    title="Kursiv"><i>I</i></button>
            <button type="button" class="dev-fmt-btn" id="dv-underline" title="Unterstrichen"><u>U</u></button>
            <div class="dev-fmt-sep"></div>
            <button type="button" class="dev-swatch" title="Ink (Schwarz)"  data-color="#0a0a0a" style="background:#0a0a0a"></button>
            <button type="button" class="dev-swatch" title="Ink Soft"       data-color="#4a4a4a" style="background:#4a4a4a"></button>
            <button type="button" class="dev-swatch" title="Ink Muted"      data-color="#6e6e6e" style="background:#6e6e6e"></button>
            <button type="button" class="dev-swatch" title="Waldgrün"       data-color="#2d5f3f" style="background:#2d5f3f"></button>
            <button type="button" class="dev-swatch" title="Waldgrün Soft"  data-color="#4a7c59" style="background:#4a7c59"></button>
            <button type="button" class="dev-swatch dev-swatch-light" title="Paper (Weiß)" data-color="#fafafa" style="background:#fafafa"></button>
            <input type="color" id="dv-textcolor-picker" class="dev-color-mini" title="Eigene Textfarbe" value="#000000">
          </div>
          <div id="dv-text" class="dev-rich-editor" contenteditable="true" spellcheck="false"></div>

          <div class="dev-2col">
            <label>Schriftgröße (px)
              <input class="dev-field" id="dv-fsize" type="number" min="6" max="200">
            </label>
            <label>Schriftstärke
              <select class="dev-field" id="dv-fweight">
                <option value="300">300 — Light</option>
                <option value="400">400 — Regular</option>
                <option value="500">500 — Medium</option>
                <option value="600">600 — SemiBold</option>
                <option value="700">700 — Bold</option>
                <option value="800">800 — ExtraBold</option>
              </select>
            </label>
          </div>

          <label>Schriftart
            <select class="dev-field" id="dv-ffamily">
              <option value="">— unverändert —</option>
              <option value="'Instrument Serif', serif">Instrument Serif</option>
              <option value="'Inter', sans-serif">Inter</option>
              <option value="serif">Serif (generisch)</option>
              <option value="sans-serif">Sans-Serif (generisch)</option>
              <option value="monospace">Monospace</option>
            </select>
          </label>

          <div class="dev-2col">
            <label>Textfarbe (gesamt)
              <input class="dev-field" id="dv-color" type="color">
            </label>
            <label>Ausrichtung
              <select class="dev-field" id="dv-align">
                <option value="left">Links</option>
                <option value="center">Mitte</option>
                <option value="right">Rechts</option>
              </select>
            </label>
          </div>

          <div class="dev-2col">
            <label>Buchstabenabstand (px)
              <input class="dev-field" id="dv-lspacing" type="number" step="0.5">
            </label>
            <label>Zeilenhöhe
              <input class="dev-field" id="dv-lheight" type="number" step="0.05" min="0.5" max="4">
            </label>
          </div>
        </div>

        <!-- ── Tab: Abstände ── -->
        <div class="dev-pane" data-pane="abstand">
          <div class="dev-spacing-block">
            <div class="dev-spacing-label">Innenabstand (Padding)</div>
            <div class="dev-4col">
              <label>Oben<input    class="dev-field" id="dv-pt" type="number" min="0"></label>
              <label>Rechts<input  class="dev-field" id="dv-pr" type="number" min="0"></label>
              <label>Unten<input   class="dev-field" id="dv-pb" type="number" min="0"></label>
              <label>Links<input   class="dev-field" id="dv-pl" type="number" min="0"></label>
            </div>
          </div>
          <div class="dev-spacing-block">
            <div class="dev-spacing-label">Außenabstand (Margin)</div>
            <div class="dev-4col">
              <label>Oben<input    class="dev-field" id="dv-mt" type="number"></label>
              <label>Rechts<input  class="dev-field" id="dv-mr" type="number"></label>
              <label>Unten<input   class="dev-field" id="dv-mb" type="number"></label>
              <label>Links<input   class="dev-field" id="dv-ml" type="number"></label>
            </div>
          </div>
          <div class="dev-2col">
            <label>Breite
              <input class="dev-field" id="dv-width" placeholder="auto">
            </label>
            <label>Max-Breite
              <input class="dev-field" id="dv-maxwidth" placeholder="none">
            </label>
          </div>
        </div>

        <!-- ── Tab: Hintergrund & Rahmen ── -->
        <div class="dev-pane" data-pane="hintergrund">

          <div class="dev-spacing-label">Hintergrundfarbe</div>
          <label>Farbe
            <input class="dev-field" id="dv-bgcolor" type="color">
          </label>
          <label>
            <div class="dev-row-label">
              <span>Kein Hintergrund (transparent)</span>
              <input type="checkbox" id="dv-bgtrans">
            </div>
          </label>

          <div class="dev-spacing-label" style="margin-top:4px">Hintergrundbild</div>
          <button class="dev-action-btn" id="dv-bg-img-btn">📁 Bild wählen</button>
          <input type="file" id="dv-bg-img-input" accept="image/*" style="display:none">
          <div class="dev-2col" style="margin-top:4px">
            <label>Position
              <select class="dev-field" id="dv-bgpos">
                <option value="center center">Zentriert</option>
                <option value="top center">Oben Mitte</option>
                <option value="bottom center">Unten Mitte</option>
                <option value="center left">Links Mitte</option>
                <option value="center right">Rechts Mitte</option>
              </select>
            </label>
            <label>Größe
              <select class="dev-field" id="dv-bgsize">
                <option value="cover">Cover</option>
                <option value="contain">Contain</option>
                <option value="auto">Auto</option>
              </select>
            </label>
          </div>
          <button class="dev-action-btn" id="dv-bg-img-clear" style="background:#2a2a2a;color:#888;margin-top:4px">✕ Bild entfernen</button>

          <div class="dev-spacing-label" style="margin-top:8px">Allgemein</div>
          <div class="dev-2col">
            <label>Deckkraft (0–1)
              <input class="dev-field" id="dv-opacity" type="number" min="0" max="1" step="0.05">
            </label>
            <label>Ecken-Radius (px)
              <input class="dev-field" id="dv-radius" type="number" min="0">
            </label>
          </div>

          <div class="dev-spacing-label" style="margin-top:4px">Rahmen</div>
          <div class="dev-2col">
            <label>Breite (px)
              <input class="dev-field" id="dv-bwidth" type="number" min="0">
            </label>
            <label>Farbe
              <input class="dev-field" id="dv-bcolor" type="color">
            </label>
          </div>
          <label>Stil
            <select class="dev-field" id="dv-bstyle">
              <option value="none">Kein</option>
              <option value="solid">Durchgezogen</option>
              <option value="dashed">Gestrichelt</option>
              <option value="dotted">Gepunktet</option>
              <option value="double">Doppelt</option>
            </select>
          </label>
        </div>

        <!-- ── Tab: Bild ── -->
        <div class="dev-pane" data-pane="bild">
          <p class="dev-hint">Wähle ein <code>&lt;img&gt;</code>-Element aus, dann kannst Du es hier tauschen.</p>
          <button class="dev-action-btn" id="dv-replace-img">📁 Bild tauschen</button>
          <input type="file" id="dv-file-input" accept="image/*" style="display:none">
          <label style="margin-top:6px">Alt-Text
            <input class="dev-field" id="dv-alt" type="text">
          </label>
          <div id="dv-img-preview-wrap" style="display:none; margin-top:8px;">
            <div class="dev-spacing-label">Vorschau</div>
            <img id="dv-img-preview" style="max-width:100%; border-radius:6px; margin-top:4px;">
          </div>
        </div>

      </div><!-- /.dev-body -->

      <!-- ── Footer: Element-Aktionen ── -->
      <div class="dev-panel-footer">
        <button class="dev-foot-btn" id="dv-parent"     title="Übergeordnetes Element auswählen">↑ Elternelement</button>
        <button class="dev-foot-btn" id="dv-toggle-vis" title="Element ausblenden / einblenden">👁 Ausblenden</button>
        <button class="dev-foot-btn dev-foot-btn-danger" id="dv-delete" title="Element löschen">🗑 Löschen</button>
      </div>
    `;

    // ── Tab-Wechsel ──
    p.querySelectorAll('.dev-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        p.querySelectorAll('.dev-tab').forEach(b => b.classList.remove('active'));
        p.querySelectorAll('.dev-pane').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        p.querySelector(`[data-pane="${btn.dataset.tab}"]`).classList.add('active');
      });
    });

    // ── Schließen ──
    p.querySelector('.dev-close-btn').addEventListener('click', deselect);

    // ── Rich-Text-Editor ──────────────────────────────────────────────────────
    const dvText = p.querySelector('#dv-text');
    let _htmlBefore = null;

    dvText.addEventListener('focus', () => {
      _htmlBefore = selectedEl ? selectedEl.innerHTML : null;
    });
    dvText.addEventListener('blur', () => {
      if (!selectedEl || _htmlBefore === null) return;
      if (dvText.innerHTML !== _htmlBefore) {
        undoStack.push({ el: selectedEl, prop: 'innerHTML', before: _htmlBefore });
        _htmlBefore = dvText.innerHTML;
      }
    });
    dvText.addEventListener('input', () => {
      if (!selectedEl) return;
      selectedEl.innerHTML = dvText.innerHTML;
      trackChange(selectedEl, 'innerHTML', dvText.innerHTML);
    });
    dvText.addEventListener('keyup',   updateFmtButtons);
    dvText.addEventListener('mouseup', updateFmtButtons);
    dvText.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        e.stopPropagation();
        if (selectedEl && _htmlBefore !== null && dvText.innerHTML !== _htmlBefore) {
          undoStack.push({ el: selectedEl, prop: 'innerHTML', before: _htmlBefore });
        }
        undo();
        if (selectedEl) {
          dvText.innerHTML = selectedEl.innerHTML;
          _htmlBefore = selectedEl.innerHTML;
        }
      }
    });

    // ── B / I / U ──
    function execFmt(cmd) {
      dvText.focus();
      document.execCommand(cmd, false, null);
      if (selectedEl) selectedEl.innerHTML = dvText.innerHTML;
      updateFmtButtons();
    }
    p.querySelector('#dv-bold').addEventListener('click',      () => execFmt('bold'));
    p.querySelector('#dv-italic').addEventListener('click',    () => execFmt('italic'));
    p.querySelector('#dv-underline').addEventListener('click', () => execFmt('underline'));

    // ── Farb-Swatches (Textauswahl) ──
    p.querySelectorAll('.dev-swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        dvText.focus();
        document.execCommand('foreColor', false, sw.dataset.color);
        if (selectedEl) selectedEl.innerHTML = dvText.innerHTML;
      });
    });
    p.querySelector('#dv-textcolor-picker').addEventListener('input', e => {
      dvText.focus();
      document.execCommand('foreColor', false, e.target.value);
      if (selectedEl) selectedEl.innerHTML = dvText.innerHTML;
    });

    // ── Style-Inputs verdrahten (WICHTIG: p.querySelector, nicht document.getElementById) ──
    function wireP(id, prop, transform, evt = 'change') {
      const input = p.querySelector('#' + id);
      if (!input) return;
      input.addEventListener(evt, () => {
        if (!selectedEl) return;
        applyStyle(selectedEl, prop, transform(input.value));
      });
    }
    wireP('dv-fsize',    'fontSize',      v => v + 'px');
    wireP('dv-fweight',  'fontWeight',    v => v);
    wireP('dv-ffamily',  'fontFamily',    v => v);
    wireP('dv-color',    'color',         v => v);
    wireP('dv-align',    'textAlign',     v => v);
    wireP('dv-lspacing', 'letterSpacing', v => v + 'px');
    wireP('dv-lheight',  'lineHeight',    v => v);
    wireP('dv-pt',       'paddingTop',    v => v + 'px');
    wireP('dv-pr',       'paddingRight',  v => v + 'px');
    wireP('dv-pb',       'paddingBottom', v => v + 'px');
    wireP('dv-pl',       'paddingLeft',   v => v + 'px');
    wireP('dv-mt',       'marginTop',     v => v + 'px');
    wireP('dv-mr',       'marginRight',   v => v + 'px');
    wireP('dv-mb',       'marginBottom',  v => v + 'px');
    wireP('dv-ml',       'marginLeft',    v => v + 'px');
    wireP('dv-width',    'width',         v => v || 'auto');
    wireP('dv-maxwidth', 'maxWidth',      v => v || 'none');
    wireP('dv-bgcolor',  'backgroundColor', v => v);
    wireP('dv-opacity',  'opacity',       v => v);
    wireP('dv-radius',   'borderRadius',  v => v + 'px');
    wireP('dv-bstyle',   'borderStyle',   v => v);
    wireP('dv-bcolor',   'borderColor',   v => v);
    wireP('dv-bwidth',   'borderWidth',   v => v + 'px');
    wireP('dv-bgpos',    'backgroundPosition', v => v);
    wireP('dv-bgsize',   'backgroundSize',     v => v);

    // ── Transparenz-Checkbox ──
    p.querySelector('#dv-bgtrans').addEventListener('change', e => {
      if (!selectedEl) return;
      applyStyle(selectedEl, 'backgroundColor', e.target.checked ? 'transparent' : '');
    });

    // ── Hintergrundbild ──
    const bgImgInput = p.querySelector('#dv-bg-img-input');
    p.querySelector('#dv-bg-img-btn').addEventListener('click', () => bgImgInput.click());
    bgImgInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !selectedEl) return;
      const url    = URL.createObjectURL(file);
      const before = selectedEl.style.backgroundImage;
      selectedEl.style.backgroundImage  = `url('${url}')`;
      selectedEl.style.backgroundSize   = p.querySelector('#dv-bgsize').value || 'cover';
      selectedEl.style.backgroundRepeat = 'no-repeat';
      undoStack.push({ el: selectedEl, prop: 'backgroundImage', before });
      trackChange(selectedEl, 'backgroundImage', `url('${url}')`);
      bumpCounter();
    });
    p.querySelector('#dv-bg-img-clear').addEventListener('click', () => {
      if (!selectedEl) return;
      const before = selectedEl.style.backgroundImage;
      applyStyle(selectedEl, 'backgroundImage', 'none');
    });

    // ── Alt-Text ──
    p.querySelector('#dv-alt').addEventListener('change', e => {
      if (!selectedEl || selectedEl.tagName !== 'IMG') return;
      selectedEl.alt = e.target.value;
    });

    // ── Bild tauschen ──
    const fileInput = p.querySelector('#dv-file-input');
    p.querySelector('#dv-replace-img').addEventListener('click', () => {
      if (selectedEl?.tagName === 'IMG') fileInput.click();
      else alert('Wähle zuerst ein Bild-Element auf der Seite aus (einfach draufklicken).');
    });
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (!file || !selectedEl || selectedEl.tagName !== 'IMG') return;
      const url    = URL.createObjectURL(file);
      const before = selectedEl.src;
      selectedEl.src = url;
      undoStack.push({ el: selectedEl, prop: 'src', before });
      bumpCounter();
      const preview = p.querySelector('#dv-img-preview');
      preview.src = url;
      p.querySelector('#dv-img-preview-wrap').style.display = 'block';
    });

    // ── Footer-Aktionen ──
    p.querySelector('#dv-parent').addEventListener('click', () => {
      if (!selectedEl || !selectedEl.parentElement || selectedEl.parentElement === document.body) return;
      selectEl(selectedEl.parentElement);
    });

    p.querySelector('#dv-toggle-vis').addEventListener('click', () => {
      if (!selectedEl) return;
      const btn    = p.querySelector('#dv-toggle-vis');
      const hidden = selectedEl.style.visibility === 'hidden';
      const before = selectedEl.style.visibility;
      selectedEl.style.visibility = hidden ? '' : 'hidden';
      btn.textContent = hidden ? '👁 Ausblenden' : '👁 Einblenden';
      undoStack.push({ el: selectedEl, prop: 'visibility', before });
      trackChange(selectedEl, 'visibility', selectedEl.style.visibility);
      bumpCounter();
    });

    p.querySelector('#dv-delete').addEventListener('click', () => {
      if (!selectedEl) return;
      if (!confirm('Element wirklich löschen? (Rückgängig möglich)')) return;
      const parent    = selectedEl.parentNode;
      const nextSib   = selectedEl.nextSibling;
      const deletedEl = selectedEl;
      undoStack.push({
        el: deletedEl, prop: '__delete__',
        before: { parent, nextSib, el: deletedEl }
      });
      deletedEl.remove();
      deselect();
      bumpCounter();
    });

    // ── Panel verschiebbar ──
    makeDraggable(p, p.querySelector('#dev-panel-head'));

    return p;
  }

  // ─── Panel befüllen ──────────────────────────────────────────────────────────

  function fillPanel(el) {
    const cs  = getComputedStyle(el);
    const tag = el.tagName.toLowerCase();
    const id  = el.id ? '#' + el.id : '';
    const cls = typeof el.className === 'string'
      ? el.className.trim().split(/\s+/).filter(c => !c.startsWith('dev-')).map(c => '.' + c).join('') : '';
    panel.querySelector('.dev-el-tag').textContent = tag + id + cls;

    const px = prop => parseInt(cs[prop]) || 0;

    // Rich-Text
    const dvTextEl = panel.querySelector('#dv-text');
    if (dvTextEl) dvTextEl.innerHTML = el.innerHTML;
    updateFmtButtons();

    // Typografie
    set('dv-fsize',    px('fontSize'));
    set('dv-fweight',  cs.fontWeight);
    set('dv-ffamily',  '');   // Schriftart nicht auto-detektieren (zu viele Varianten)
    set('dv-color',    rgbToHex(cs.color));
    set('dv-align',    cs.textAlign);
    set('dv-lspacing', parseFloat(cs.letterSpacing) || 0);
    set('dv-lheight',  parseFloat(cs.lineHeight)    || 0);

    // Abstände
    set('dv-pt', px('paddingTop'));
    set('dv-pr', px('paddingRight'));
    set('dv-pb', px('paddingBottom'));
    set('dv-pl', px('paddingLeft'));
    set('dv-mt', px('marginTop'));
    set('dv-mr', px('marginRight'));
    set('dv-mb', px('marginBottom'));
    set('dv-ml', px('marginLeft'));
    set('dv-width',    el.style.width    || '');
    set('dv-maxwidth', el.style.maxWidth || '');

    // Hintergrund
    const bgColor = cs.backgroundColor;
    const isTrans = bgColor === 'transparent' || bgColor === 'rgba(0, 0, 0, 0)';
    set('dv-bgcolor', isTrans ? '#ffffff' : rgbToHex(bgColor));
    panel.querySelector('#dv-bgtrans').checked = isTrans;
    set('dv-opacity', cs.opacity || 1);
    set('dv-radius',  px('borderRadius'));

    // Rahmen
    set('dv-bwidth', px('borderWidth'));
    set('dv-bcolor', rgbToHex(cs.borderColor));
    set('dv-bstyle', cs.borderStyle === 'none' ? 'none' : cs.borderStyle);

    // Bild
    const isImg = el.tagName === 'IMG';
    panel.querySelector('#dv-replace-img').disabled = !isImg;
    set('dv-alt', isImg ? el.alt : '');
    panel.querySelector('#dv-img-preview-wrap').style.display = 'none';
    if (isImg) {
      panel.querySelector('#dv-img-preview').src = el.src;
      panel.querySelector('#dv-img-preview-wrap').style.display = 'block';
    }

    // Ausblenden-Button zurücksetzen
    const visBtn = panel.querySelector('#dv-toggle-vis');
    if (visBtn) visBtn.textContent = cs.visibility === 'hidden' ? '👁 Einblenden' : '👁 Ausblenden';
  }

  function set(id, val) {
    const el = panel?.querySelector('#' + id) || document.getElementById(id);
    if (el) el.value = val ?? '';
  }

  function updateFmtButtons() {
    const b = panel?.querySelector('#dv-bold');
    const i = panel?.querySelector('#dv-italic');
    const u = panel?.querySelector('#dv-underline');
    if (b) b.classList.toggle('dev-fmt-active', document.queryCommandState('bold'));
    if (i) i.classList.toggle('dev-fmt-active', document.queryCommandState('italic'));
    if (u) u.classList.toggle('dev-fmt-active', document.queryCommandState('underline'));
  }

  // ─── Style anwenden + tracken ────────────────────────────────────────────────

  function applyStyle(el, prop, value) {
    const before = el.style[prop] || getComputedStyle(el)[prop] || '';
    el.style[prop] = value;
    undoStack.push({ el, prop, before });
    trackChange(el, prop, value);
    updateOutlines();
    bumpCounter();
  }

  function trackChange(el, prop, value) {
    if (!changeMap.has(el)) changeMap.set(el, { _selector: cssSelector(el) });
    changeMap.get(el)[prop] = value;
  }

  function bumpCounter() {
    changeCount++;
    const badge = toolbar?.querySelector('#dev-change-count');
    if (badge) {
      badge.textContent = changeCount;
      badge.style.display = 'inline-flex';
    }
  }

  // ─── Rückgängig ──────────────────────────────────────────────────────────────

  function undo() {
    const last = undoStack.pop();
    if (!last) {
      console.info('[DevEditor] Nichts mehr rückgängig zu machen.');
      return;
    }
    const { el, prop, before } = last;

    if (prop === '__delete__') {
      // Element wiederherstellen
      const { parent, nextSib, el: delEl } = before;
      if (nextSib) parent.insertBefore(delEl, nextSib);
      else parent.appendChild(delEl);
    } else if (prop === 'innerHTML') {
      el.innerHTML = before;
      const dvTextEl = panel?.querySelector('#dv-text');
      if (dvTextEl && selectedEl === el) dvTextEl.innerHTML = before;
    } else if (prop === 'src') {
      el.src = before;
    } else {
      el.style[prop] = before;
    }

    if (changeCount > 0) {
      changeCount--;
      const badge = toolbar?.querySelector('#dev-change-count');
      if (badge) {
        badge.textContent = changeCount;
        if (changeCount === 0) badge.style.display = 'none';
      }
    }

    if (selectedEl === el) fillPanel(el);
    updateOutlines();
  }

  // ─── CSS exportieren ─────────────────────────────────────────────────────────

  function exportCSS() {
    if (changeMap.size === 0) {
      alert('Keine Änderungen zum Exportieren.\nMache zuerst Änderungen im Editor.');
      return;
    }

    let css  = `/* DevEditor — Änderungen vom ${new Date().toLocaleString('de-DE')} */\n\n`;
    let hasCSS = false;

    changeMap.forEach((props, el) => {
      const rules = Object.entries(props)
        .filter(([prop]) => prop !== 'innerHTML')
        .map(([prop, val]) => `  ${camelToKebab(prop)}: ${val};`)
        .join('\n');
      if (rules) {
        css += `${cssSelector(el)} {\n${rules}\n}\n\n`;
        hasCSS = true;
      }
    });

    if (!hasCSS) {
      alert('Alle Änderungen sind Textänderungen (kein CSS).\nDiese müssen direkt in den HTML-Dateien gespeichert werden.');
      return;
    }

    const blob = new Blob([css], { type: 'text/css' });
    const a    = document.createElement('a');
    a.href     = URL.createObjectURL(blob);
    a.download = 'dev-overrides.css';
    a.click();
    console.info('%c[DevEditor] CSS exportiert:', 'color:#4a7c59;font-weight:bold');
    console.info(css);
  }

  function cssSelector(el) {
    if (el.id) return '#' + el.id;
    const classes = typeof el.className === 'string'
      ? el.className.trim().split(/\s+/).filter(c => !c.startsWith('dev-'))
      : [];
    if (classes.length) return '.' + classes.join('.');
    const parts = [];
    let cur = el;
    while (cur && cur !== document.body) {
      const idx = Array.from(cur.parentNode?.children || []).indexOf(cur) + 1;
      parts.unshift(`${cur.tagName.toLowerCase()}:nth-child(${idx})`);
      cur = cur.parentNode;
    }
    return parts.join(' > ');
  }

  function camelToKebab(s) {
    return s.replace(/([A-Z])/g, '-$1').toLowerCase();
  }

  // ─── In Datei speichern ──────────────────────────────────────────────────────

  function saveToFile() {
    const filePath = window.location.pathname === '/' ? '/index.html' : window.location.pathname;
    if (!filePath.endsWith('.html')) {
      alert('Speichern funktioniert nur auf HTML-Seiten.'); return;
    }
    if (changeMap.size === 0) { showToast('Keine Änderungen zum Speichern.'); return; }

    // Quellcode vom Server holen (ungeparsed, kein gerenderter JS-Content)
    fetch(filePath)
      .then(r => r.text())
      .then(sourceHtml => {
        // Als DOM parsen (kein JS-Execution, nur statisches HTML)
        const doc = new DOMParser().parseFromString(sourceHtml, 'text/html');

        // Injiziertes Script-Tag entfernen
        doc.querySelector('script[src="/_dev-editor.js"]')?.remove();

        // Änderungen per CSS-Selector in den Quellcode einpflegen
        let patched = 0;
        changeMap.forEach((props, el) => {
          const sel = props._selector || (el.id ? '#' + el.id : null);
          if (!sel) return;
          let target;
          try { target = doc.querySelector(sel); } catch(e) { return; }
          if (!target) return;
          Object.entries(props).forEach(([prop, val]) => {
            if (prop === '_selector') return;
            if (prop === 'innerHTML') target.innerHTML = val;
            else target.style[prop] = val;
          });
          patched++;
        });

        if (patched === 0) {
          showToast('⚠ Keine speicherbaren Änderungen gefunden.');
          return Promise.resolve(null);
        }

        const html = '<!DOCTYPE html>\n' + doc.documentElement.outerHTML;
        return fetch('/api/save', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ filePath, html })
        }).then(r => r.json());
      })
      .then(result => {
        if (!result) return;
        showToast('✔ Gespeichert (' + changeMap.size + ' Änderung' + (changeMap.size > 1 ? 'en' : '') + ')');
        changeCount = 0;
        const badge = toolbar?.querySelector('#dev-change-count');
        if (badge) badge.style.display = 'none';
      })
      .catch(e => alert('Fehler beim Speichern: ' + e.message));
  }

  function showToast(msg) {
    const t = document.createElement('div');
    t.textContent = msg;
    Object.assign(t.style, {
      position:'fixed', bottom:'24px', left:'50%', transform:'translateX(-50%)',
      background:'#2d5f3f', color:'#fff', padding:'10px 20px', borderRadius:'10px',
      fontSize:'13px', fontFamily:'system-ui,sans-serif', zIndex:'2147483647',
      boxShadow:'0 4px 20px rgba(0,0,0,.4)', pointerEvents:'none'
    });
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2500);
  }

  // ─── Toolbar ─────────────────────────────────────────────────────────────────

  function createToolbar() {
    const t = document.createElement('div');
    t.id    = 'dev-toolbar';
    t.innerHTML = `
      <span class="dev-logo">✎</span>
      <button class="dev-btn-toggle dev-btn">Editor öffnen</button>
      <button class="dev-btn-undo dev-btn" title="Strg+Z">↩ Rückgängig</button>
      <button class="dev-btn-export dev-btn">⬇ CSS exportieren</button>
      <button class="dev-btn-save dev-btn">💾 Speichern</button>
      <span class="dev-change-badge" id="dev-change-count" style="display:none" title="Ungespeicherte Änderungen">0</span>
    `;
    t.querySelector('.dev-btn-toggle').addEventListener('click', toggleEditMode);
    t.querySelector('.dev-btn-undo').addEventListener('click', undo);
    t.querySelector('.dev-btn-export').addEventListener('click', exportCSS);
    t.querySelector('.dev-btn-save').addEventListener('click', saveToFile);
    makeDraggable(t, t);
    return t;
  }

  // ─── Hilfsfunktionen ─────────────────────────────────────────────────────────

  function isEditorEl(el) {
    return !!el.closest('#dev-toolbar, #dev-panel, #dev-hover-outline, #dev-select-outline');
  }

  function rgbToHex(rgb) {
    if (!rgb || rgb === 'transparent') return '#000000';
    const m = rgb.match(/\d+/g);
    if (!m || m.length < 3) return '#000000';
    return '#' + [m[0], m[1], m[2]].map(n => (+n).toString(16).padStart(2, '0')).join('');
  }

  function makeDraggable(el, handle) {
    let startX, startY, origLeft, origTop;
    handle.style.cursor = 'move';
    handle.addEventListener('mousedown', e => {
      if (['BUTTON', 'INPUT', 'SELECT', 'TEXTAREA'].includes(e.target.tagName)) return;
      e.preventDefault();
      const r = el.getBoundingClientRect();
      origLeft = r.left; origTop = r.top;
      startX = e.clientX; startY = e.clientY;
      const onMove = ev => {
        el.style.left   = (origLeft + ev.clientX - startX) + 'px';
        el.style.top    = (origTop  + ev.clientY - startY) + 'px';
        el.style.right  = 'auto';
        el.style.bottom = 'auto';
      };
      const onUp = () => {
        document.removeEventListener('mousemove', onMove);
        document.removeEventListener('mouseup',   onUp);
      };
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup',   onUp);
    });
  }

  // ─── CSS ─────────────────────────────────────────────────────────────────────

  function injectCSS() {
    const s = document.createElement('style');
    s.id    = 'dev-editor-styles';
    s.textContent = `
      /* ── Outlines ── */
      .dev-outline {
        position: absolute; pointer-events: none; z-index: 2147483645;
        border-radius: 3px;
        transition: top .05s, left .05s, width .05s, height .05s;
      }
      .dev-outline-hover  { border: 2px dashed #4a7c59; background: rgba(45,95,63,.05); }
      .dev-outline-select { border: 2px solid #2d5f3f; box-shadow: 0 0 0 3px rgba(45,95,63,.2); }

      /* ── Edit-Mode ── */
      body.dev-edit-active,
      body.dev-edit-active * { cursor: crosshair !important; }
      body.dev-edit-active a,
      body.dev-edit-active button,
      body.dev-edit-active [onclick] { pointer-events: none !important; }
      body.dev-edit-active #dev-toolbar button,
      body.dev-edit-active #dev-panel button,
      body.dev-edit-active #dev-panel input,
      body.dev-edit-active #dev-panel select,
      body.dev-edit-active #dev-panel textarea,
      body.dev-edit-active #dev-panel [contenteditable] {
        pointer-events: all !important; cursor: auto !important;
      }
      body.dev-edit-active #dev-panel [contenteditable] { cursor: text !important; }

      /* ── Toolbar ── */
      #dev-toolbar {
        position: fixed; top: 16px; right: 16px; z-index: 2147483646;
        display: flex; align-items: center; gap: 8px;
        background: #111; border: 1px solid #2a2a2a; border-radius: 12px;
        padding: 10px 14px;
        box-shadow: 0 4px 24px rgba(0,0,0,.6);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 12px; user-select: none;
      }
      .dev-logo { color: #4a7c59; font-size: 16px; }
      #dev-toolbar .dev-btn {
        background: #1e1e1e; color: #ccc; border: 1px solid #333; border-radius: 7px;
        padding: 6px 12px; cursor: pointer; font-size: 12px;
        transition: background .15s, color .15s; white-space: nowrap;
      }
      #dev-toolbar .dev-btn:hover { background: #2a2a2a; color: #fff; }
      #dev-toolbar .dev-btn-toggle { background: #2d5f3f; color: #fff; border-color: #4a7c59; }
      #dev-toolbar .dev-btn-toggle:hover { background: #3a7550; }
      #dev-toolbar .dev-btn-save { background: #1a3a2a; color: #7ec89a; border-color: #2d5f3f; }
      #dev-toolbar .dev-btn-save:hover { background: #2d5f3f; color: #fff; }
      .dev-change-badge {
        background: #c0392b; color: #fff; border-radius: 10px;
        padding: 2px 7px; font-size: 11px; font-weight: 700;
        align-items: center; justify-content: center; min-width: 20px;
      }

      /* ── Panel ── */
      #dev-panel {
        position: fixed; top: 60px; right: 16px; z-index: 2147483646;
        width: 320px; max-height: calc(100vh - 80px);
        display: none; flex-direction: column;
        background: #111; border: 1px solid #222; border-radius: 14px;
        box-shadow: 0 8px 40px rgba(0,0,0,.7);
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
        font-size: 13px; color: #ddd; overflow: hidden;
      }
      #dev-panel.dev-visible { display: flex; }

      .dev-panel-head {
        display: flex; align-items: center; gap: 8px;
        padding: 12px 14px; border-bottom: 1px solid #1e1e1e;
        flex-shrink: 0; cursor: move;
      }
      .dev-el-tag {
        flex: 1; font-size: 11px; color: #4a7c59;
        overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
      }
      .dev-close-btn {
        background: none; border: none; color: #555; font-size: 16px;
        cursor: pointer; padding: 0 2px; flex-shrink: 0; line-height: 1;
      }
      .dev-close-btn:hover { color: #fff; }

      .dev-tabs { display: flex; gap: 3px; flex-shrink: 0; }
      .dev-tab {
        background: none; border: none; color: #555; font-size: 11px; font-weight: 500;
        padding: 4px 8px; border-radius: 5px; cursor: pointer;
        transition: background .1s, color .1s;
      }
      .dev-tab:hover  { background: #1e1e1e; color: #bbb; }
      .dev-tab.active { background: #1e1e1e; color: #4a7c59; }

      .dev-body {
        padding: 14px; overflow-y: auto; flex: 1;
        scrollbar-width: thin; scrollbar-color: #333 transparent;
      }
      .dev-pane { display: none; flex-direction: column; gap: 12px; }
      .dev-pane.active { display: flex; }

      .dev-body label {
        display: flex; flex-direction: column; gap: 4px;
        font-size: 11px; color: #666; font-weight: 500;
      }
      .dev-field {
        background: #0d0d0d; border: 1px solid #2a2a2a; color: #e0e0e0;
        border-radius: 7px; padding: 7px 9px; font-size: 12px;
        width: 100%; box-sizing: border-box; outline: none;
        transition: border-color .15s; font-family: inherit;
      }
      .dev-field:focus { border-color: #4a7c59; }
      .dev-field[type="color"] { height: 38px; padding: 3px 6px; cursor: pointer; }

      .dev-2col { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
      .dev-4col { display: grid; grid-template-columns: 1fr 1fr 1fr 1fr; gap: 6px; }
      .dev-spacing-block { display: flex; flex-direction: column; gap: 6px; }
      .dev-spacing-label {
        font-size: 10px; color: #444; text-transform: uppercase;
        letter-spacing: .06em; font-weight: 600;
      }
      .dev-row-label {
        display: flex; align-items: center; justify-content: space-between;
        font-size: 11px; color: #666;
      }

      .dev-action-btn {
        background: #2d5f3f; color: #fff; border: none; border-radius: 8px;
        padding: 9px 14px; cursor: pointer; font-size: 12px; width: 100%;
        transition: background .15s;
      }
      .dev-action-btn:hover    { background: #3a7550; }
      .dev-action-btn:disabled { background: #1e1e1e; color: #444; cursor: not-allowed; }

      .dev-hint { font-size: 11px; color: #444; margin: 0; line-height: 1.5; }
      .dev-hint code { color: #4a7c59; }

      /* ── Rich-Text-Editor ── */
      .dev-rich-label { font-size: 11px; color: #666; font-weight: 500; margin-bottom: 4px; }
      .dev-fmt-bar {
        display: flex; gap: 4px; margin-bottom: 6px;
        align-items: center; flex-wrap: wrap;
      }
      .dev-fmt-btn {
        background: #1e1e1e; border: 1px solid #2a2a2a; color: #888;
        border-radius: 6px; width: 30px; height: 26px; flex-shrink: 0;
        cursor: pointer; font-size: 13px; line-height: 1;
        display: flex; align-items: center; justify-content: center;
        transition: background .15s, color .15s, border-color .15s;
      }
      .dev-fmt-btn:hover { background: #2a2a2a; color: #ddd; }
      .dev-fmt-btn.dev-fmt-active { background: #2d5f3f; border-color: #4a7c59; color: #fff; }
      .dev-fmt-sep { width: 1px; height: 20px; background: #2a2a2a; flex-shrink: 0; margin: 0 2px; }
      .dev-swatch {
        width: 20px; height: 20px; border-radius: 50%; border: 2px solid transparent;
        cursor: pointer; flex-shrink: 0; padding: 0;
        transition: transform .1s, border-color .1s;
      }
      .dev-swatch:hover { transform: scale(1.2); border-color: #fff; }
      .dev-swatch-light { border-color: #333 !important; }
      .dev-swatch-light:hover { border-color: #888 !important; }
      .dev-color-mini {
        width: 26px; height: 26px; border-radius: 6px; border: 1px solid #2a2a2a;
        padding: 2px 3px; cursor: pointer; background: #1e1e1e; flex-shrink: 0;
      }
      .dev-rich-editor {
        background: #0d0d0d; border: 1px solid #2a2a2a; border-radius: 7px;
        padding: 8px 10px; min-height: 60px; color: #e0e0e0;
        font-size: 12px; line-height: 1.5; outline: none;
        transition: border-color .15s; word-break: break-word; font-family: inherit;
      }
      .dev-rich-editor:focus { border-color: #4a7c59; }
      .dev-rich-editor b, .dev-rich-editor strong { font-weight: bold; }
      .dev-rich-editor i, .dev-rich-editor em { font-style: italic; }
      .dev-rich-editor u { text-decoration: underline; }

      /* ── Panel Footer ── */
      .dev-panel-footer {
        display: flex; gap: 6px; padding: 10px 14px;
        border-top: 1px solid #1e1e1e; flex-shrink: 0;
      }
      .dev-foot-btn {
        flex: 1; background: #1a1a1a; border: 1px solid #2a2a2a; color: #888;
        border-radius: 7px; padding: 6px 4px; cursor: pointer; font-size: 11px;
        transition: background .15s, color .15s;
      }
      .dev-foot-btn:hover { background: #2a2a2a; color: #ddd; }
      .dev-foot-btn-danger:hover { background: #3a1515; color: #e05555; border-color: #5a2020; }
    `;
    document.head.appendChild(s);
  }

  // ─── Start ───────────────────────────────────────────────────────────────────

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();
