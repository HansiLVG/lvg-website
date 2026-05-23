/**
 * Image Lab — Dev-only Tool. Funktioniert auf jeder Seite.
 * Nur auf localhost aktiv. Nicht pushen.
 * Einbinden: <script src="/_dev-image-lab.js"></script> vor </body>
 *
 * Das Tool erkennt automatisch alle <section>-Elemente auf der Seite,
 * findet bestehende [data-parallax]-Hintergründe und erlaubt für jede
 * Sektion Bilder einzufügen, tauschen, entfernen und Opacity zu justieren.
 * Einstellungen werden in localStorage gespeichert (pro Seite getrennt).
 */
(function () {
  if (!['localhost', '127.0.0.1', ''].includes(location.hostname)) return;

  const PAGE_KEY     = '_image_lab_' + location.pathname;
  const BG_SUFFIX    = '-bg';
  const DEFAULT_OP   = 0.12;

  // ─── Auto-discover sections ──────────────────────────────
  const sections = Array.from(document.querySelectorAll('section[id]')).map(el => {
    const id       = el.id;
    const label    = el.dataset.screenLabel || id;
    const existing = el.querySelector('[data-parallax]');
    const bgClass  = existing ? existing.className.split(' ')[0]
                              : id.replace(/[^a-z0-9]/gi, '-') + BG_SUFFIX;
    const origFile = existing ? (existing.dataset.bg || null) : null;
    return { id, label, el, bgClass, origFile };
  }).filter(s => s.id !== 'hero'); // Hero hat Canvas-Layer, kein normales Bg

  const PORTRAITS = [
    { label: 'SW Light',  file: 'assets/portrait-bw-light.webp' },
    { label: 'SW Medium', file: 'assets/portrait-bw-medium.webp' },
    { label: 'SW Strong', file: 'assets/portrait-bw-strong.webp' },
    { label: 'Farbe',     file: 'assets/portrait-colour.webp' },
  ];
  const portraitImg  = document.querySelector('.ueber-portrait');
  const origPortrait = portraitImg?.getAttribute('src') || '';
  const origSrcset   = portraitImg?.getAttribute('srcset') || '';
  const hasPortrait  = !!portraitImg;

  // ─── localStorage ────────────────────────────────────────
  function loadSaved() {
    try { return JSON.parse(localStorage.getItem(PAGE_KEY) || '{}'); } catch { return {}; }
  }
  function save() {
    const snap = {};
    sections.forEach(s => { snap[s.id] = { opacity: state[s.id].opacity, visible: state[s.id].visible, removed: state[s.id].removed, customFile: state[s.id].customFile }; });
    snap._portrait = state._portrait;
    localStorage.setItem(PAGE_KEY, JSON.stringify(snap));
  }
  const saved = loadSaved();

  // ─── State ───────────────────────────────────────────────
  const state = { _portrait: saved._portrait || null };
  sections.forEach(s => {
    const el = s.el.querySelector('.' + s.bgClass);
    const sv = saved[s.id] || {};
    state[s.id] = {
      opacity:    sv.opacity    ?? (el ? parseFloat(getComputedStyle(el).opacity) : DEFAULT_OP),
      visible:    sv.visible    ?? true,
      removed:    sv.removed    ?? false,
      customFile: sv.customFile ?? null,
    };
  });

  // ─── Bg helpers ──────────────────────────────────────────
  function getBgEl(s)  { return s.el.querySelector('.' + s.bgClass); }

  function createBgEl(s, src) {
    const bg = document.createElement('div');
    bg.className = s.bgClass;
    Object.assign(bg.style, {
      position:'absolute', inset:'-6% 0', backgroundSize:'cover',
      backgroundPosition:'center', opacity: String(state[s.id].opacity),
      zIndex:'0', willChange:'transform,filter',
      filter:'saturate(1.02) contrast(1.04) blur(1px)',
      WebkitMaskImage:'radial-gradient(ellipse 90% 100% at 50% 50%,rgba(0,0,0,1) 30%,rgba(0,0,0,0.2) 100%)',
      maskImage:'radial-gradient(ellipse 90% 100% at 50% 50%,rgba(0,0,0,1) 30%,rgba(0,0,0,0.2) 100%)',
    });
    bg.style.backgroundImage = `url("${src}")`;
    s.el.style.position = 'relative';
    if (getComputedStyle(s.el).overflow === 'visible') s.el.style.overflow = 'hidden';
    s.el.insertBefore(bg, s.el.firstChild);
    return bg;
  }

  // ─── Apply saved state on load ───────────────────────────
  sections.forEach(s => {
    const el = getBgEl(s);
    if (!el) return;
    // Placeholder divs with display:none and no image → treat as removed
    if (el.style.display === 'none' && !el.style.backgroundImage) { state[s.id].removed = true; }
    if (state[s.id].removed)       { el.style.display = 'none'; return; }
    if (!state[s.id].visible)      { el.style.opacity = '0'; return; }
    el.style.opacity = String(state[s.id].opacity);
  });
  if (state._portrait && portraitImg) { portraitImg.src = state._portrait; portraitImg.srcset = ''; }

  // ─── Styles ──────────────────────────────────────────────
  const style = document.createElement('style');
  style.textContent = `
    #_il{position:fixed;bottom:20px;right:20px;z-index:99999;width:314px;background:#1a1a1a;color:#e8e8e8;border-radius:10px;box-shadow:0 8px 32px rgba(0,0,0,.65);font-family:system-ui,sans-serif;font-size:12px;user-select:none;}
    #_il ._h{display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:#252525;border-radius:10px 10px 0 0;cursor:move;font-weight:600;font-size:13px;}
    #_il ._h button{background:#333;border:none;color:#ccc;border-radius:5px;padding:3px 8px;cursor:pointer;font-size:11px;}
    #_il ._h button:hover{background:#444;}
    #_il #_exp{background:#2d5f3f!important;color:#fff!important;}
    #_il #_exp:hover{background:#3a7a52!important;}
    #_il #_clr{background:#5a2020!important;color:#ffaaaa!important;font-size:10px!important;}
    #_il ._body{padding:10px 12px;display:flex;flex-direction:column;gap:7px;max-height:84vh;overflow-y:auto;}
    #_il ._gl{font-size:10px;font-weight:700;letter-spacing:.08em;color:#555;padding-top:3px;}
    #_il ._row{display:flex;flex-direction:column;gap:5px;padding:8px;border-radius:7px;border:1px solid #2a2a2a;background:#202020;}
    #_il ._row.nobg{border-style:dashed;}
    #_il ._row.off{opacity:.4;}
    #_il ._rh{display:flex;justify-content:space-between;align-items:center;gap:5px;}
    #_il ._name{font-weight:600;font-size:12px;flex:1;}
    #_il ._fn{font-size:10px;color:#4a7c59;font-style:italic;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:120px;}
    #_il ._badge{font-size:10px;padding:1px 5px;border-radius:3px;background:#2a2a2a;color:#555;border:1px solid #333;white-space:nowrap;}
    #_il ._badge.has{background:#1a2e22;color:#4a7c59;border-color:#2d5f3f;}
    #_il ._badge.warn{background:#2a1a00;color:#c08030;border-color:#5a3a00;}
    #_il ._ctrl{display:flex;flex-direction:column;gap:5px;}
    #_il ._ctrl.hidden{display:none;}
    #_il ._sr{display:flex;align-items:center;gap:6px;}
    #_il ._sl{color:#555;font-size:11px;min-width:46px;}
    #_il ._sr input[type=range]{flex:1;accent-color:#4a7c59;cursor:pointer;}
    #_il ._sv{color:#999;font-size:11px;min-width:28px;text-align:right;}
    #_il ._acts{display:flex;gap:4px;}
    #_il ._drop{flex:1;border:1px dashed #333;border-radius:5px;padding:5px 6px;text-align:center;color:#555;cursor:pointer;font-size:11px;transition:border-color .2s,color .2s;}
    #_il ._drop:hover,#_il ._drop.over{border-color:#4a7c59;color:#9ecfb0;}
    #_il ._drop.got{border-color:#4a7c59;color:#9ecfb0;border-style:solid;}
    #_il ._tog{background:none;border:1px solid #333;border-radius:4px;color:#666;padding:2px 6px;cursor:pointer;font-size:10px;white-space:nowrap;}
    #_il ._tog.on{border-color:#4a7c59;color:#9ecfb0;}
    #_il ._btn{background:#252525;border:1px solid #333;color:#777;border-radius:5px;padding:4px 7px;cursor:pointer;font-size:11px;white-space:nowrap;}
    #_il ._btn:hover{border-color:#555;color:#bbb;}
    #_il ._btn.d:hover{border-color:#8b2020;color:#e08080;}
    #_il ._pbtns{display:flex;flex-wrap:wrap;gap:5px;}
    #_il ._pbtn{background:#252525;border:1px solid #333;color:#bbb;border-radius:5px;padding:4px 9px;cursor:pointer;font-size:11px;}
    #_il ._pbtn:hover{border-color:#4a7c59;color:#9ecfb0;}
    #_il ._pbtn.active{border-color:#4a7c59;background:#1a2e22;color:#9ecfb0;}
    #_il ._div{border:none;border-top:1px solid #252525;margin:2px 0;}
    #_il ._remind{background:#2a1f00;border:1px solid #5a3e00;border-radius:6px;padding:7px 10px;font-size:11px;color:#e0b040;line-height:1.5;}
    #_il ._remind strong{display:block;margin-bottom:2px;}
    #_il.mini ._body{display:none;}
    #_il.mini{border-radius:10px;}
  `;
  document.head.appendChild(style);

  // ─── Build reminder ──────────────────────────────────────
  const missing = sections.filter(s => state[s.id].customFile && !state[s.id].removed);
  const remHtml = missing.length ? `<div class="_remind"><strong>⚠ Bilder nach Reload neu laden:</strong>${missing.map(s=>`• <b>${s.label}:</b> ${state[s.id].customFile}`).join('<br>')}</div>` : '';

  // ─── Panel ───────────────────────────────────────────────
  const panel = document.createElement('div');
  panel.id = '_il';
  panel.innerHTML = `
    <div class="_h">
      <span>🖼 Image Lab</span>
      <div style="display:flex;gap:4px;">
        <button id="_min" title="Minimieren">−</button>
        <button id="_clr" title="Reset">Reset</button>
        <button id="_exp">Export CSS</button>
        <button id="_cls">✕</button>
      </div>
    </div>
    <div class="_body">
      ${remHtml}
      <div class="_gl">SEKTIONEN (${sections.length})</div>
      ${sections.map(s => {
        const el      = getBgEl(s);
        const hasBg   = !!el && !state[s.id].removed;
        const needRel = state[s.id].customFile && !state[s.id].removed;
        const fname   = state[s.id].customFile;
        const op      = state[s.id].opacity;
        const vis     = state[s.id].visible;
        return `<div class="_row ${hasBg?'':'nobg'} ${!vis&&hasBg?'off':''}" data-id="${s.id}">
          <div class="_rh">
            <span class="_name">${s.label}</span>
            ${fname?`<span class="_fn" title="${fname}">${fname}</span>`:''}
            <span class="_badge ${hasBg?(needRel?'warn':'has'):''}">${hasBg?(needRel?'⚠ neu laden':'Bild'):'kein Bild'}</span>
            <button class="_tog ${hasBg&&vis?'on':''}" data-id="${s.id}">${hasBg&&vis?'● An':'○ Aus'}</button>
          </div>
          <div class="_ctrl ${hasBg?'':'hidden'}">
            <div class="_sr">
              <span class="_sl">Opacity</span>
              <input type="range" min="0" max="1" step="0.01" data-id="${s.id}" value="${op}"/>
              <span class="_sv">${op.toFixed(2)}</span>
            </div>
          </div>
          <div class="_acts">
            <div class="_drop" data-id="${s.id}">${hasBg&&!needRel?'↑ Tauschen':needRel?'↑ Neu laden':'+ Einfügen'}<input type="file" accept="image/*" style="display:none"/></div>
            <button class="_btn d _rm" data-id="${s.id}">✕</button>
            <button class="_btn _res" data-id="${s.id}" data-orig="${s.origFile||''}">↺</button>
          </div>
        </div>`;
      }).join('')}
      ${hasPortrait ? `
        <hr class="_div"/>
        <div class="_gl">PORTRAIT</div>
        <div class="_pbtns">${PORTRAITS.map(p=>`<button class="_pbtn${(state._portrait||origPortrait).includes(p.file.split('/').pop())?'  active':''}" data-file="${p.file}">${p.label}</button>`).join('')}</div>
        <div class="_acts" style="margin-top:4px;">
          <div class="_drop _pdrop">+ Eigenes Bild<input type="file" accept="image/*" style="display:none"/></div>
          <button class="_btn d _prm">✕</button>
          <button class="_btn _pres">↺</button>
        </div>` : ''}
    </div>`;
  document.body.appendChild(panel);

  // ─── applyBg ─────────────────────────────────────────────
  function applyBg(s, src, fname) {
    let el = getBgEl(s);
    if (!el || state[s.id].removed) { el = createBgEl(s, src); }
    else el.style.backgroundImage = `url("${src}")`;
    el.style.display = '';
    el.style.opacity = String(state[s.id].opacity);
    state[s.id] = { ...state[s.id], visible:true, removed:false, customFile:fname||null };

    const row  = panel.querySelector(`._row[data-id="${s.id}"]`);
    row.classList.remove('nobg','off');
    row.querySelector('._badge').textContent = 'Bild'; row.querySelector('._badge').className = '_badge has';
    row.querySelector('._tog').textContent = '● An'; row.querySelector('._tog').classList.add('on');
    const drop = row.querySelector(`._drop[data-id="${s.id}"]`);
    drop.classList.add('got'); drop.childNodes[0].textContent = fname ? '↑ Tauschen' : '↑ Tauschen';
    row.querySelector('._ctrl').classList.remove('hidden');
    row.querySelector('input[type=range]').value = state[s.id].opacity;
    row.querySelector('._sv').textContent = state[s.id].opacity.toFixed(2);
    let fn = row.querySelector('._fn');
    if (fname) {
      if (!fn) { fn = document.createElement('span'); fn.className='_fn'; row.querySelector('._rh').insertBefore(fn, row.querySelector('._badge')); }
      fn.textContent = fname; fn.title = fname;
    }
    save();
  }

  // ─── Sliders ─────────────────────────────────────────────
  panel.querySelectorAll('input[type=range][data-id]').forEach(sl => {
    sl.addEventListener('input', () => {
      const s = sections.find(x=>x.id===sl.dataset.id);
      const el = getBgEl(s);
      const val = parseFloat(sl.value);
      if (el && state[s.id].visible) el.style.opacity = val;
      state[s.id].opacity = val;
      sl.closest('._ctrl').querySelector('._sv').textContent = val.toFixed(2);
      save();
    });
  });

  // ─── Toggles ─────────────────────────────────────────────
  panel.querySelectorAll('._tog').forEach(btn => {
    btn.addEventListener('click', () => {
      const s = sections.find(x=>x.id===btn.dataset.id);
      const el = getBgEl(s); if (!el) return;
      state[s.id].visible = !state[s.id].visible;
      el.style.opacity = state[s.id].visible ? state[s.id].opacity : 0;
      btn.textContent = state[s.id].visible ? '● An' : '○ Aus';
      btn.classList.toggle('on', state[s.id].visible);
      btn.closest('._row').classList.toggle('off', !state[s.id].visible);
      save();
    });
  });

  // ─── Drop / file picker ──────────────────────────────────
  panel.querySelectorAll('._drop[data-id]').forEach(drop => {
    const s = sections.find(x=>x.id===drop.dataset.id);
    const inp = drop.querySelector('input');
    drop.addEventListener('click', ()=>inp.click());
    inp.addEventListener('change', ()=>{ if(inp.files[0]) applyBg(s, URL.createObjectURL(inp.files[0]), inp.files[0].name); });
    drop.addEventListener('dragover', e=>{e.preventDefault();drop.classList.add('over');});
    drop.addEventListener('dragleave', ()=>drop.classList.remove('over'));
    drop.addEventListener('drop', e=>{e.preventDefault();drop.classList.remove('over');if(e.dataTransfer.files[0]) applyBg(s,URL.createObjectURL(e.dataTransfer.files[0]),e.dataTransfer.files[0].name);});
  });

  // ─── Remove ──────────────────────────────────────────────
  panel.querySelectorAll('._rm').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const s = sections.find(x=>x.id===btn.dataset.id);
      const el = getBgEl(s); if (!el) return;
      el.remove();
      state[s.id] = {...state[s.id], removed:true, visible:true, customFile:null};
      const row = btn.closest('._row');
      row.querySelector('._badge').textContent='kein Bild'; row.querySelector('._badge').className='_badge';
      row.querySelector('._tog').textContent='○ Aus'; row.querySelector('._tog').classList.remove('on');
      row.querySelector(`._drop[data-id="${s.id}"]`).classList.remove('got');
      row.querySelector(`._drop[data-id="${s.id}"]`).childNodes[0].textContent='+ Einfügen';
      row.querySelector('._ctrl').classList.add('hidden');
      row.classList.add('nobg'); row.classList.remove('off');
      const fn=row.querySelector('._fn'); if(fn) fn.remove();
      save();
    });
  });

  // ─── Reset ───────────────────────────────────────────────
  panel.querySelectorAll('._res').forEach(btn => {
    btn.addEventListener('click', ()=>{
      const s = sections.find(x=>x.id===btn.dataset.id);
      if (!btn.dataset.orig) { panel.querySelector(`._rm[data-id="${s.id}"]`).click(); return; }
      const cssOp = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--il-orig-'+s.id)) || DEFAULT_OP;
      state[s.id].opacity = cssOp;
      state[s.id].customFile = null;
      applyBg(s, btn.dataset.orig, null);
    });
  });

  // ─── Portrait ────────────────────────────────────────────
  if (hasPortrait) {
    function setPrt(src, btn) {
      portraitImg.src=src; portraitImg.srcset=''; portraitImg.style.display='';
      panel.querySelectorAll('._pbtn').forEach(b=>b.classList.remove('active'));
      if(btn) btn.classList.add('active');
      state._portrait=src; save();
    }
    panel.querySelectorAll('._pbtn').forEach(b=>b.addEventListener('click',()=>setPrt(b.dataset.file,b)));
    const pd=panel.querySelector('._pdrop'), pi=pd.querySelector('input');
    pd.addEventListener('click',()=>pi.click());
    pi.addEventListener('change',()=>{if(pi.files[0]){setPrt(URL.createObjectURL(pi.files[0]),null);pd.classList.add('got');}});
    pd.addEventListener('dragover',e=>{e.preventDefault();pd.classList.add('over');});
    pd.addEventListener('dragleave',()=>pd.classList.remove('over'));
    pd.addEventListener('drop',e=>{e.preventDefault();pd.classList.remove('over');if(e.dataTransfer.files[0]){setPrt(URL.createObjectURL(e.dataTransfer.files[0]),null);pd.classList.add('got');}});
    panel.querySelector('._prm').addEventListener('click',()=>{portraitImg.style.display='none';panel.querySelectorAll('._pbtn').forEach(b=>b.classList.remove('active'));state._portrait=null;save();});
    panel.querySelector('._pres').addEventListener('click',()=>{portraitImg.src=origPortrait;portraitImg.srcset=origSrcset;portraitImg.style.display='';panel.querySelector('._pdrop').classList.remove('got');PORTRAITS.forEach(p=>{if(origPortrait.includes(p.file.split('/').pop()))panel.querySelector(`._pbtn[data-file="${p.file}"]`)?.classList.add('active');});state._portrait=origPortrait;save();});
  }

  // ─── Export ──────────────────────────────────────────────
  document.getElementById('_exp').addEventListener('click', ()=>{
    const lines=['/* ── Image Lab Export ── */','/* Seite: '+location.pathname+' */'];
    sections.forEach(s=>{
      const el=getBgEl(s); const st=state[s.id];
      if(!el||st.removed){lines.push(`/* ${s.label}: kein Bild */`);return;}
      if(st.customFile) lines.push(`/* ${s.label}: Datei = "${st.customFile}" */`);
      if(!st.visible)   lines.push(`/* ${s.label}: ausgeblendet */`);
      lines.push(`.${s.bgClass} { opacity: ${st.opacity.toFixed(2)}; }`);
    });
    if(hasPortrait&&portraitImg){const src=portraitImg.src.replace(location.origin+'/','');if(!src.startsWith('blob:'))lines.push(`/* Portrait: ${src} */`);}
    navigator.clipboard.writeText(lines.join('\n')).then(()=>{const b=document.getElementById('_exp');b.textContent='✓ Kopiert!';setTimeout(()=>b.textContent='Export CSS',1800);});
  });

  // ─── Clear ───────────────────────────────────────────────
  document.getElementById('_clr').addEventListener('click',()=>{if(!confirm('Alle Image Lab Einstellungen für diese Seite löschen?'))return;localStorage.removeItem(PAGE_KEY);location.reload();});

  // ─── Close ───────────────────────────────────────────────
  document.getElementById('_cls').addEventListener('click',()=>panel.remove());
  document.getElementById('_min').addEventListener('click',()=>{ const m=panel.classList.toggle('mini'); document.getElementById('_min').textContent=m?'+':'−'; });

  // ─── Draggable ───────────────────────────────────────────
  const hdr=panel.querySelector('._h'); let drag=false,ox=0,oy=0;
  hdr.addEventListener('mousedown',e=>{if(e.target.tagName==='BUTTON')return;drag=true;ox=e.clientX-panel.getBoundingClientRect().left;oy=e.clientY-panel.getBoundingClientRect().top;panel.style.right='auto';panel.style.bottom='auto';});
  document.addEventListener('mousemove',e=>{if(drag){panel.style.left=(e.clientX-ox)+'px';panel.style.top=(e.clientY-oy)+'px';}});
  document.addEventListener('mouseup',()=>drag=false);
})();
