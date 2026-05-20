# CLAUDE.md — LVG Website

Persönliche Website von Leon-Vincent Gamradt, Amazon PPC Spezialist Berlin.
Statische HTML/CSS/JS-Website, kein Framework, kein Build-Schritt.

## Projektstruktur

```
Claude Code/
├── index.html                  ← Startseite (One-Pager)
├── account-audit.html          ← Leistungsseite
├── strategie-aufbau.html       ← Leistungsseite
├── kampagnen-management.html   ← Leistungsseite
├── impressum.html
├── datenschutz.html            ← Finalisiert (DSGVO-konform, Mai 2026)
├── 404.html
├── DESIGN-SYSTEM.md            ← Vollständige technische Spezifikation
└── assets/
    ├── fonts/                  ← Selbst gehostet (kein Google Fonts CDN)
    │   ├── fonts.css
    │   ├── instrument-serif-regular.woff2
    │   ├── instrument-serif-italic.woff2
    │   └── inter-latin.woff2
    ├── LVG_Logo.png / .webp
    ├── portrait*.webp          ← Mehrere Varianten (bw-light/medium/strong, colour)
    ├── hero-background.webp
    ├── cta-background.webp
    ├── water-flow.webp
    ├── valley-mist.webp
    ├── leistungen-detail.webp
    ├── badge-sponsored-ads.avif        ← Amazon Ads Certified – Sponsored Ads | Advanced
    ├── badge-marketing-cloud.png       ← Amazon Ads Certified – Marketing Cloud
    ├── zertifikat-sponsored-ads.pdf    ← Zertifikats-PDF (nicht verlinkt, nur als Backup)
    └── zertifikat-amazon-marketing-cloud.pdf  ← Zertifikats-PDF (nicht verlinkt, nur als Backup)
```

## Design-Prinzipien (Kurzfassung)

**Vollständige Spezifikation → [`DESIGN-SYSTEM.md`](DESIGN-SYSTEM.md)**

- **Typografie:** Instrument Serif (Headlines, Peaks, Zahlen) + Inter (Body, Labels)
- **Farben:** Monochrom Paper/Ink + sparsamer Waldgrün-Akzent `#2d5f3f`
- **Motiv:** Aufwärts-Dreieck (▲) als wiederkehrendes Akzent-Element
- **Atmosphäre:** Animierte Wellen (SVG/RAF) + Parallax + Scroll-Blur — das Design "atmet"
- **Prinzip:** Grün-Akzent nur an 6 definierten Stellen. Kein Hintergrundfarbe-Hover. Nur Scale + Farbshift.

## Wichtige CSS-Tokens

```css
--paper: #fafafa      --ink: #0a0a0a        --accent: #2d5f3f
--ink-soft: #4a4a4a   --ink-muted: #8a8a8a  --accent-soft: #4a7c59
--maxw: 1240px        --pad-x: 64px (→ 28px mobile)
--serif: "Instrument Serif"    --sans: "Inter"
```

## Aktueller Stand

### Lighthouse-Scores (Desktop / Mobile)
| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 96 / 74 | 100 / 100 | 100 / 100 | 100 / 100 |

### Was implementiert ist
- Vollständige Website: Startseite + 3 Leistungsseiten + Impressum + Datenschutz + 404
- Fonts selbst gehostet → FCP < 1s (war 3,1s mit Google CDN)
- WCAG AA Farbkontrast-konform
- Google Analytics 4 (`G-CMYKYVVJM3`), Consent Mode v2, anonymize_ip: true, Conversion-Tracking auf CTAs
- Cookie-Banner mit `applyConsent()` — GA wird nur nach Zustimmung aktiviert
- Cookie-Banner, Parallax, Reveal-Animationen (bi-direktional), animierte Wellen
- Wellen: Opacity und Bewegung in Session 3 feinabgestimmt (träger, breiter)
- Datenschutzerklärung finalisiert: GitHub Pages, Formspree, Cal.com, GA4 (Consent Mode v2), LinkedIn, selbst gehostete Fonts
- Zertifikats-Badges als Akkordeon-Cards im Vertrauensbereich auf index.html (text-only, kein PDF-Link aus Datenschutzgründen)
- Step-Akkordeons auf allen 3 Leistungsseiten — Ablauf/Vorgehen-Listen sind klickbar interaktiv (Grid-Rows-Trick)

### Offene TODOs
- [ ] **404.html** als Custom-Error-Page beim Hoster eintragen
- [ ] **Zertifikats-Badges** auf `index.html` — Akkordeon-Cards (text-only) sind als Platzhalter eingebaut. Badge-Bilder liegen in assets/ bereit (`badge-sponsored-ads.avif`, `badge-marketing-cloud.png`), werden aber erst eingebaut wenn bessere/offizielle Bilder gefunden wurden. PDFs nicht verlinkt (Datenschutz). Credly nicht verfügbar (kein Zugriff auf alten Arbeitgeber-Account).
- [ ] **Newsletter / E-Mail-Automation** — Brevo (brevo.com, kostenlos bis 300 Mails/Tag, EU-Server). Signup-Formular als neue Section einbauen, Double Opt-In in Brevo aktivieren, automatisierte Welcome-Sequenz aufbauen. **Datenschutzerklärung muss dann um Brevo-Abschnitt ergänzt werden.**
- [ ] **PageSpeed Insights** nach Go-Live prüfen (reale Core Web Vitals)

## Technische Besonderheiten

- **Akkordeons** (FAQ, Cert-Badges, Step-Items): Grid-Rows-Trick `0fr → 1fr`, kein `max-height`. Step-Akkordeons zusätzlich mit `translateY`-Fade auf `.step-desc`.
- **Parallax**: `data-parallax="<factor>"` Attribut, `intensity = (mob?0.08:0.12)*factor`, cap 56/32px
- **Scroll-Blur**: +0.6px auf bestehenden filter während Scroll, 200ms Debounce
- **Wellen**: 4 SVG-Pfade, requestAnimationFrame, pausiert bei `document.hidden`
- **Reveal**: IntersectionObserver bi-direktional (kein `once`), threshold 0.10
- **Mobile**: Zwei Breakpoints — 1100px (Nav vereinfacht) und 900px (Layout kollabiert)
- **Tweaks-Panel**: React/Babel UMD, Hero-Feintuning live im Browser

## Workflow-Regeln

**Commits:** Jede inhaltliche Änderung bekommt einen eigenen Commit (gut für Nachvollziehbarkeit).

**Push-Zeitpunkt:** Erst am Ende eines logischen Themenblocks pushen, nicht nach jeder Einzeldatei.
Ausnahmen: explizites „push" vom User (Live-Test gewünscht) oder Sessionende.
**Beim Verlassen des Arbeitsplatzes immer pushen** — als Backup und für sauberen Stand beim nächsten Start.

**Nach jedem Push:** CLAUDE.md TODOs aktualisieren + erledigte Notion-Tasks abhaken.

**Session-Log (automatisch):** Am Ende jeder erkennbar abgeschlossenen Claude Code Session wird ein strukturierter Eintrag an die heutige Daily-Briefing-Seite in Notion angehängt.
- Notion Daily Briefings DB: `65db8b3231bd450c9d5c5f90f821362e`
- Format: `📌 Session [HH:MM] — [Thema in 5 Worten]` + Bullets: Erledigt / Geändert (Dateien/Repos) / Offen geblieben
- Nur wenn etwas Konkretes umgesetzt wurde — keine Logs für reine Beratungs-Sessions ohne Änderungen
