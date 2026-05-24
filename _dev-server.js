/**
 * _dev-server.js — Lokaler Dev-Server für lvg-ppc.de
 *
 * Starten: node _dev-server.js
 * Öffnen:  http://localhost:3000
 *
 * Injiziert _dev-editor.js automatisch in alle HTML-Antworten.
 * Die echten HTML-Dateien werden dabei NICHT verändert.
 * Dieser Code landet niemals auf dem Live-Server.
 */

const http = require('http');
const fs   = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME_TYPES = {
  '.html'  : 'text/html; charset=utf-8',
  '.css'   : 'text/css',
  '.js'    : 'application/javascript',
  '.json'  : 'application/json',
  '.xml'   : 'application/xml',
  '.webp'  : 'image/webp',
  '.png'   : 'image/png',
  '.jpg'   : 'image/jpeg',
  '.jpeg'  : 'image/jpeg',
  '.avif'  : 'image/avif',
  '.svg'   : 'image/svg+xml',
  '.ico'   : 'image/x-icon',
  '.woff'  : 'font/woff',
  '.woff2' : 'font/woff2',
  '.ttf'   : 'font/ttf',
  '.pdf'   : 'application/pdf',
  '.map'   : 'application/json',
};

// Dieses Tag wird vor </body> in jede HTML-Seite injiziert
const EDITOR_INJECT = '\n<script src="/_dev-editor.js"></script>\n';

const server = http.createServer((req, res) => {
  // ── Speichern-API ──────────────────────────────────────────────────────────
  if (req.method === 'POST' && req.url === '/api/save') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        const { filePath: reqPath, html } = JSON.parse(body);
        const target = path.join(ROOT, reqPath);
        if (!target.startsWith(ROOT) || !target.endsWith('.html')) {
          res.writeHead(400); res.end('Ungültiger Pfad'); return;
        }
        // Dev-Editor-Artefakte aus dem HTML entfernen bevor gespeichert wird
        let clean = html
          .replace(/\n?<script src="\/_dev-editor\.js"><\/script>\n?/gi, '')
          .replace(/<style id="dev-editor-styles">[\s\S]*?<\/style>/gi, '')
          .replace(/<div id="dev-toolbar"[\s\S]*?<\/div>/gi, '')
          .replace(/<div id="dev-panel"[\s\S]*?<\/div>/gi, '')
          .replace(/<div[^>]*class="dev-outline[^"]*"[^>]*>[\s\S]*?<\/div>/gi, '')
          .replace(/ class="dev-edit-active"/, '');
        fs.writeFile(target, clean, 'utf8', err => {
          if (err) { res.writeHead(500); res.end('Schreibfehler'); return; }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, path: reqPath }));
          console.log(`  ✔  Gespeichert: ${reqPath}`);
        });
      } catch (e) {
        res.writeHead(400); res.end('JSON-Fehler');
      }
    });
    return;
  }

  // URL bereinigen (Query-String, Hash entfernen)
  let urlPath = req.url.split('?')[0].split('#')[0];

  // Trailing Slash → index.html im Unterordner
  if (urlPath.endsWith('/')) {
    urlPath = urlPath + 'index.html';
  }

  // Root → index.html
  if (urlPath === '') urlPath = '/index.html';

  const filePath = path.join(ROOT, urlPath);
  const ext      = path.extname(filePath).toLowerCase();

  // Sicherheit: Nur Dateien innerhalb des Projektordners ausliefern
  if (!filePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // Versuche index.html in Unterordner (z. B. /amazon-ppc-audit)
        const fallback = path.join(filePath, 'index.html');
        fs.readFile(fallback, (err2, data2) => {
          if (err2) {
            res.writeHead(404, { 'Content-Type': 'text/plain' });
            res.end(`404 — Datei nicht gefunden: ${urlPath}`);
          } else {
            serveHTML(res, data2);
          }
        });
      } else {
        res.writeHead(500);
        res.end('Server-Fehler');
      }
      return;
    }

    if (ext === '.html') {
      serveHTML(res, data);
    } else {
      const mime = MIME_TYPES[ext] || 'application/octet-stream';
      res.writeHead(200, { 'Content-Type': mime });
      res.end(data);
    }
  });
});

function serveHTML(res, data) {
  let html = data.toString('utf8');
  // Inject vor </body> (case-insensitive)
  html = html.replace(/<\/body>/i, EDITOR_INJECT + '</body>');
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(html);
}

server.listen(PORT, '127.0.0.1', () => {
  console.log('');
  console.log('  ┌─────────────────────────────────────────┐');
  console.log('  │  LVG Dev-Server läuft                   │');
  console.log(`  │  http://localhost:${PORT}                   │`);
  console.log('  │                                         │');
  console.log('  │  Alt + E  →  Editor ein-/ausschalten   │');
  console.log('  │  Strg + Z →  Letzte Änderung rückgängig│');
  console.log('  │  "Export CSS" → CSS-Datei herunterladen │');
  console.log('  └─────────────────────────────────────────┘');
  console.log('');
});
