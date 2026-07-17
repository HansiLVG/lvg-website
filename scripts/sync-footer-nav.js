#!/usr/bin/env node
/**
 * sync-footer-nav.js
 *
 * Eine Wahrheit fuer das Footer-Link-Raster.
 * Quelle: _partials/footer-nav.html
 * Ziel:   das Raster zwischen <!-- FOOTER-NAV:START --> und <!-- FOOTER-NAV:END -->
 *         in jeder HTML-Seite.
 *
 * Beim ersten Lauf ersetzt das Skript den vorhandenen <div class="seo-footer-grid">-Block
 * und setzt dabei die Marker. Bei jedem weiteren Lauf wird nur noch zwischen den Markern
 * ersetzt. Der seitenspezifische Fliesstext (.seo-footer-text) bleibt unberuehrt.
 *
 * Aufruf:  node scripts/sync-footer-nav.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTIAL = path.join(ROOT, '_partials', 'footer-nav.html');

const START = '<!-- FOOTER-NAV:START · zentrale Quelle: _partials/footer-nav.html · generiert via scripts/sync-footer-nav.js, nicht manuell editieren -->';
const END = '<!-- FOOTER-NAV:END -->';

const partial = fs.readFileSync(PARTIAL, 'utf8').replace(/\s+$/, '');
const block = `      ${START}\n${partial}\n      ${END}`;

// Marker-Region (Folgelaeufe) bzw. roher Grid-Block (Erstlauf)
const markerRe = /[ \t]*<!-- FOOTER-NAV:START[\s\S]*?<!-- FOOTER-NAV:END -->/;
const gridRe = /[ \t]*<div class="seo-footer-grid">[\s\S]*?<\/div>(?=\s*<div class="seo-footer-text">)/;

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules' || entry.name === '_partials' || entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, out);
    else if (entry.isFile() && entry.name.endsWith('.html')) out.push(full);
  }
  return out;
}

let changed = 0, skipped = 0, missed = 0;
for (const file of walk(ROOT)) {
  const src = fs.readFileSync(file, 'utf8');
  let next;
  if (markerRe.test(src)) {
    next = src.replace(markerRe, block);
  } else if (gridRe.test(src)) {
    next = src.replace(gridRe, block);
  } else {
    continue; // Seite ohne SEO-Footer (z. B. 404) -> ueberspringen
  }
  const rel = path.relative(ROOT, file);
  if (next === src) { skipped++; }
  else { fs.writeFileSync(file, next); changed++; console.log('  aktualisiert:', rel); }
}

console.log(`\nFertig. ${changed} Seiten aktualisiert, ${skipped} bereits aktuell.`);
