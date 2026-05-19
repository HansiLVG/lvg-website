# LVG Website

Persönliche Website von Leon-Vincent Gamradt — Amazon PPC Spezialist, Berlin.

Statische Single-File-Website (HTML/CSS/JS, kein Build-Schritt).

## Lokal öffnen

```bash
# Einfach die Datei im Browser öffnen:
open index.html

# Oder mit lokalem Server (empfohlen für korrekte Font-Pfade):
npx serve .
# → http://localhost:3000
```

## Seiten

| Datei | Inhalt |
|---|---|
| `index.html` | Startseite (One-Pager) |
| `account-audit.html` | Leistungsseite Account-Audit |
| `strategie-aufbau.html` | Leistungsseite Strategie & Aufbau |
| `kampagnen-management.html` | Leistungsseite Kampagnen-Management |
| `impressum.html` | Impressum |
| `datenschutz.html` | Datenschutzerklärung ⚠️ Platzhalter |
| `404.html` | Fehlerseite |

## Deployment

Alle Dateien (inkl. `assets/`) auf einen Webserver hochladen. Kein Build, keine Dependencies.
Die `404.html` muss beim Hoster als Custom-Error-Page konfiguriert werden.

## Dokumentation

- [`CLAUDE.md`](CLAUDE.md) — Projektkontext, Status, offene TODOs (für Claude Code Sessions)
- [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md) — Vollständige technische Design-Dokumentation
