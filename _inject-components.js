#!/usr/bin/env node
'use strict';

/**
 * _inject-components.js
 *
 * Injects the shared NAV and SEO-Footer columns into all HTML pages.
 * Run with: node _inject-components.js
 *
 * What this touches:
 *   - The full <nav> block (between the NAV comment and </nav>)
 *   - The <div class="seo-footer-grid"> block (the four columns only,
 *     NOT the seo-footer-text paragraph below it)
 *
 * What this does NOT touch:
 *   - Page-specific SEO text (seo-footer-text)
 *   - <head>, fonts, styles, scripts, or any other content
 *
 * To add a new page: append an entry to FILES below and re-run.
 */

const fs   = require('fs');
const path = require('path');

const ROOT = __dirname;

// ─── PAGE REGISTRY ──────────────────────────────────────────────────────────
// activePage: 'home' | 'preise' | 'ueber-mich' | 'faq' |
//             'leistungen' | 'audit' | 'management' | 'strategie' |
//             'blog' | 'glossar' | 'rechner' | '' (no active item)
const FILES = [
  { file: 'index.html',                                                   activePage: 'home'       },
  { file: 'ueber-mich.html',                                              activePage: 'ueber-mich' },
  { file: 'faq.html',                                                     activePage: 'faq'        },
  { file: 'kontakt.html',                                                 activePage: ''           },
  { file: 'impressum.html',                                               activePage: ''           },
  { file: 'datenschutz.html',                                             activePage: ''           },
  { file: '404.html',                                                     activePage: ''           },
  { file: 'leistungen/index.html',                                        activePage: 'leistungen' },
  { file: 'preise/index.html',                                            activePage: 'preise'     },
  { file: 'blog/index.html',                                              activePage: 'blog'       },
  { file: 'rechner/index.html',                                           activePage: 'rechner'    },
  { file: 'glossar/index.html',                                           activePage: 'glossar'    },
  { file: 'amazon-ppc-audit/index.html',                                  activePage: 'audit'      },
  { file: 'amazon-ppc-management/index.html',                             activePage: 'management' },
  { file: 'amazon-ppc-strategie/index.html',                              activePage: 'strategie'  },
  { file: 'blog/amazon-ppc-freelancer-vs-agentur/index.html',             activePage: 'blog'       },
  { file: 'blog/amazon-ppc-tacos-vs-acos/index.html',                     activePage: 'blog'       },
  { file: 'glossar/acos/index.html',                                      activePage: 'glossar'    },
  { file: 'glossar/tacos/index.html',                                     activePage: 'glossar'    },
  { file: 'glossar/roas/index.html',                                      activePage: 'glossar'    },
  { file: 'glossar/cpc/index.html',                                       activePage: 'glossar'    },
  { file: 'glossar/ctr/index.html',                                       activePage: 'glossar'    },
  { file: 'glossar/conversion-rate/index.html',                           activePage: 'glossar'    },
  { file: 'glossar/impression-share/index.html',                          activePage: 'glossar'    },
  { file: 'glossar/sponsored-products/index.html',                        activePage: 'glossar'    },
  { file: 'glossar/sponsored-brands/index.html',                          activePage: 'glossar'    },
  { file: 'glossar/sponsored-display/index.html',                         activePage: 'glossar'    },
  { file: 'glossar/match-types/index.html',                               activePage: 'glossar'    },
  { file: 'glossar/negative-keywords/index.html',                         activePage: 'glossar'    },
  { file: 'glossar/auto-vs-manual-kampagne/index.html',                   activePage: 'glossar'    },
  { file: 'glossar/placement-top-of-search/index.html',                   activePage: 'glossar'    },
  { file: 'rechner/acos/index.html',                                       activePage: 'rechner'    },
];

// ─── NAV TEMPLATE ───────────────────────────────────────────────────────────
const CHEV = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

function buildNav(activePage) {
  const isHome    = activePage === 'home';
  const leistAct  = ['leistungen', 'audit', 'management', 'strategie'].includes(activePage);
  const toolsAct  = ['blog', 'glossar', 'rechner'].includes(activePage);
  const brandHref = isHome ? '#top' : '/';
  const ctaHref   = isHome ? '#kontakt' : '/kontakt.html#termin';

  // Simple nav link: active → href="#", else normal href
  const sl = (href, label, page) => {
    const active = activePage === page;
    return active
      ? `<a href="#" class="active">${label}</a>`
      : `<a href="${href}">${label}</a>`;
  };

  // Dropdown menu item
  const di = (href, title, desc, page) => {
    const active = activePage === page;
    return active
      ? `            <a href="#" role="menuitem" class="active"><strong>${title}</strong><small>${desc}</small></a>`
      : `            <a href="${href}" role="menuitem"><strong>${title}</strong><small>${desc}</small></a>`;
  };

  return [
    `  <!-- ═══════════ NAV ═══════════ -->`,
    `  <nav class="nav is-transparent" id="nav">`,
    `    <div class="nav-inner">`,
    `      <a href="${brandHref}" class="nav-brand" aria-label="LVG PPC Startseite">`,
    `        <img src="/assets/logo-primary.svg" alt="LVG PPC" />`,
    `      </a>`,
    `      <div class="nav-links">`,
    `        <div class="nav-group">`,
    `          <a href="${leistAct ? '#' : '/leistungen/'}" class="nav-group-trigger${leistAct ? ' active' : ''}">`,
    `            Leistungen`,
    `            ${CHEV}`,
    `          </a>`,
    `          <div class="nav-dropdown" role="menu">`,
    di('/amazon-ppc-audit/',     'Account-Audit',      'Diagnose in 48 Stunden',  'audit'),
    di('/amazon-ppc-strategie/', 'Strategie-Aufbau',   'Vollständiger Neuaufbau', 'strategie'),
    di('/amazon-ppc-management/','Kampagnenmanagement','Laufende Betreuung',      'management'),
    `          </div>`,
    `        </div>`,
    `        ` + sl('/preise/',         'Preise',    'preise'),
    `        ` + sl('/ueber-mich.html', 'Über mich', 'ueber-mich'),
    `        ` + sl('/faq.html',        'FAQ',       'faq'),
    `        <div class="nav-group">`,
    `          <a href="${toolsAct ? '#' : '/rechner/'}" class="nav-group-trigger${toolsAct ? ' active' : ''}">`,
    `            Tools`,
    `            ${CHEV}`,
    `          </a>`,
    `          <div class="nav-dropdown" role="menu">`,
    di('/blog/',    'Blog',    'Amazon PPC Artikel',   'blog'),
    di('/glossar/', 'Glossar', 'PPC-Begriffe erklärt', 'glossar'),
    di('/rechner/', 'Rechner', 'ACOS, Bid, Budget',    'rechner'),
    `          </div>`,
    `        </div>`,
    `      </div>`,
    `      <div class="nav-right">`,
    `        <a href="/kontakt.html#formular" class="btn btn-ghost btn-sm nav-cta-secondary">Schreib mir</a>`,
    `        <a href="${ctaHref}" class="btn btn-primary btn-sm">Gespräch buchen <span class="arrow">↗</span></a>`,
    `        <button class="nav-hamb" aria-label="Menü öffnen" id="hamb">`,
    `          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">`,
    `            <line x1="4" y1="8" x2="20" y2="8" />`,
    `            <line x1="4" y1="16" x2="20" y2="16" />`,
    `          </svg>`,
    `        </button>`,
    `      </div>`,
    `    </div>`,
    `    <div class="nav-mobile" id="navMobile">`,
    `      <div class="nav-mobile-inner">`,
    `        <a href="/leistungen/">Leistungen</a>`,
    `        <a href="/amazon-ppc-audit/" class="nav-sub">Account-Audit</a>`,
    `        <a href="/amazon-ppc-strategie/" class="nav-sub">Strategie-Aufbau</a>`,
    `        <a href="/amazon-ppc-management/" class="nav-sub nav-sub-end">Kampagnen-Management</a>`,
    `        ` + sl('/preise/',         'Preise',    'preise'),
    `        ` + sl('/ueber-mich.html', 'Über mich', 'ueber-mich'),
    `        ` + sl('/faq.html',        'FAQ',       'faq'),
    `        ` + sl('/blog/',           'Blog',      'blog'),
    `        ` + sl('/glossar/',        'Glossar',   'glossar'),
    `        ` + sl('/rechner/',        'Rechner',   'rechner'),
    `        <a href="/kontakt.html">Kontakt</a>`,
    `      </div>`,
    `    </div>`,
    `  </nav>`,
  ].join('\n');
}

// ─── SEO-FOOTER GRID ────────────────────────────────────────────────────────
const SEO_FOOTER_GRID = `      <div class="seo-footer-grid">
        <div class="seo-footer-col">
          <h3>Leistungen</h3>
          <ul>
            <li><a href="/amazon-ppc-audit/">Account-Audit</a></li>
            <li><a href="/amazon-ppc-strategie/">Strategie-Aufbau</a></li>
            <li><a href="/amazon-ppc-management/">Kampagnen-Management</a></li>
            <li><a href="/preise/">Preise</a></li>
          </ul>
        </div>
        <div class="seo-footer-col">
          <h3>Ressourcen</h3>
          <ul>
            <li><a href="/blog/">Blog</a></li>
            <li><a href="/glossar/">Glossar</a></li>
            <li><a href="/rechner/">Rechner</a></li>
            <li><a href="/faq.html">FAQ</a></li>
          </ul>
        </div>
        <div class="seo-footer-col">
          <h3>Über</h3>
          <ul>
            <li><a href="/ueber-mich.html">Über mich</a></li>
            <li><a href="/kontakt.html">Kontakt</a></li>
          </ul>
        </div>
        <div class="seo-footer-col">
          <h3>Rechtliches</h3>
          <ul>
            <li><a href="/impressum.html">Impressum</a></li>
            <li><a href="/datenschutz.html">Datenschutz</a></li>
          </ul>
        </div>
      </div>`;

// ─── REPLACE HELPERS ────────────────────────────────────────────────────────
function replaceNav(html, activePage) {
  const NAV_COMMENT = '  <!-- ═══════════ NAV ═══════════ -->';
  const NAV_END     = '  </nav>';

  const start = html.indexOf(NAV_COMMENT);
  if (start === -1) { console.warn('    ⚠  NAV comment not found'); return html; }

  const endSearch = html.indexOf(NAV_END, start);
  if (endSearch === -1) { console.warn('    ⚠  </nav> not found'); return html; }

  const end = endSearch + NAV_END.length;
  return html.slice(0, start) + buildNav(activePage) + html.slice(end);
}

function replaceSeoGrid(html) {
  const GRID_OPEN = '<div class="seo-footer-grid">';
  const openIdx = html.indexOf(GRID_OPEN);
  if (openIdx === -1) return html; // no seo-footer-grid — skip silently

  // Back up to start of the line to capture any leading whitespace
  let lineStart = openIdx;
  while (lineStart > 0 && html[lineStart - 1] !== '\n') lineStart--;

  // Walk div depth from after the opening tag to find its matching closing tag
  let pos   = openIdx + GRID_OPEN.length;
  let depth = 1;

  while (pos < html.length && depth > 0) {
    const nextOpen  = html.indexOf('<div',  pos);
    const nextClose = html.indexOf('</div>', pos);

    if (nextClose === -1) { console.warn('    ⚠  Unmatched </div> in seo-footer-grid'); return html; }

    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      pos = nextClose + 6;
    }
  }

  // pos is now right after the closing </div> of the grid
  return html.slice(0, lineStart) + SEO_FOOTER_GRID + html.slice(pos);
}

// ─── MAIN ───────────────────────────────────────────────────────────────────
let updated = 0, skipped = 0;

for (const { file, activePage } of FILES) {
  const filePath = path.join(ROOT, file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⊘  ${file} (not found, skipped)`);
    skipped++;
    continue;
  }

  let html = fs.readFileSync(filePath, 'utf8');
  html = html.replace(/\r\n/g, '\n'); // normalize line endings

  html = replaceNav(html, activePage);
  html = replaceSeoGrid(html);

  fs.writeFileSync(filePath, html, 'utf8');
  console.log(`  ✓  ${file}`);
  updated++;
}

console.log(`\nDone. ${updated} updated, ${skipped} skipped.`);
