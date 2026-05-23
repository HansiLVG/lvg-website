# CLAUDE.md — LVG Website

Persönliche Website von Leon-Vincent Gamradt, Amazon PPC Spezialist Berlin.
Statische HTML/CSS/JS-Website, kein Framework, kein Build-Schritt.

## Projektstruktur

```
Claude Code/
├── index.html                  ← Startseite (One-Pager)
├── ueber-mich.html             ← Neue Unterseite: Über Leon-Vincent
├── faq.html                    ← Neue Unterseite: 10 häufige Fragen
├── account-audit.html          ← Leistungsseite
├── strategie-aufbau.html       ← Leistungsseite
├── kampagnen-management.html   ← Leistungsseite
├── impressum.html
├── datenschutz.html            ← Finalisiert (DSGVO-konform, Mai 2026)
├── 404.html
├── sitemap.xml                 ← Google Search Console
├── CNAME                       ← Custom Domain: lvg-ppc.de
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
--ink-soft: #4a4a4a   --ink-muted: #6e6e6e  --accent-soft: #4a7c59
--maxw: 1240px        --pad-x: 64px (→ 28px mobile)
--serif: "Instrument Serif"    --sans: "Inter"
```

## Aktueller Stand

### Lighthouse-Scores (Desktop / Mobile)
| Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|
| 96 / 74 | 100 / 100 | 100 / 100 | 100 / 100 |

> Stand vor der Kernsanierung. Nach den Mai-2026-Änderungen (Rechner, neue Sektionen) Lighthouse + PageSpeed neu prüfen.

### Kernsanierung Mai 2026 (Commits 31c0585 → 3620b17)
Vollständiger Conversion-/SEO-/Psychologie-Umbau auf Basis des Second-Brain-Wissens:
- **URL-Struktur:** Leistungsseiten sind jetzt Keyword-Ordner-URLs (`/amazon-ppc-audit/`, `/amazon-ppc-management/`, `/amazon-ppc-strategie/`). Alte `.html`-Dateien sind noindex meta-refresh **Redirects**. Asset-Pfade in den Ordnerdateien absolut (`/assets/...`).
- **SEO:** Title/Meta/H1/H2 keyword- und CTA-optimiert; "Dein Budget verdient"-H2-Schema aufgelöst; Nav um "Preise" ergänzt; sitemap.xml + JSON-LD auf neue URLs; ItemList-Schema für Case Studies.
- **Homepage:** Loss-Frame-Hero + Knappheit, **ACOS-Rechner als Lead-Magnet** (Live-Berechnung + E-Mail-Capture, Mailchimp-Platzhalter `data-mailchimp-endpoint`), Cost of Inaction, Rufus-Hook, **Freelancer-vs-Agentur-Sektion**, Case Studies (STAR) direkt nach Leistungen, Cert als **statische Karten** (inkl. AMC), Ablauf 30/60/90 + QBR, P&L-Positionierung, FAQ nach Einwandbehandlung (8 Fragen).
- **Leistungsseiten:** 4-Layer-Audit-Framework + SQP, Flywheel/TACOS/Looker/Events/AMC/KI-Tools, Rufus-Readiness + Honeymoon-Period. Alle > 500 Wörter.
- **Preisseite:** Decoy-Reihenfolge (Scale → Growth → Starter), Competitor-Anchoring, ROI-Rechnung, Umlaut-Fix.

### Was implementiert ist
- **Hero:** Animierter Canvas-2D-PPC-Performancegraph (9 Metriken, 12 Monate, Breathing, Floating Chips, Hover-Tooltip, Metric-Pills, Tweak-Panel) — Natur-Foto-Hero ersetzt. Commit: `a017fb0`
- Vollständige Website: Startseite + 3 Leistungsseiten + Impressum + Datenschutz + 404
- Neue Unterseiten: `ueber-mich.html` (basierend auf CV, Businessplan, Arbeitszeugnis) und `faq.html` (10 Fragen: Märkte, Kampagnenformate, Onboarding, proaktives Consulting)
- Nav-Links auf allen Seiten zeigen auf `ueber-mich.html` / `faq.html`; Teaser-Links am Ende der Sections auf index.html
- Fonts selbst gehostet → FCP < 1s (war 3,1s mit Google CDN)
- WCAG AA Farbkontrast-konform
- Google Analytics 4 (`G-CMYKYVVJM3`), Consent Mode v2, anonymize_ip: true, Conversion-Tracking auf CTAs
- Cookie-Banner mit `applyConsent()` — GA wird nur nach Zustimmung aktiviert; GA Consent Mode v2 auf allen Seiten aktiv
- Cookie-Banner, Parallax, Reveal-Animationen (bi-direktional), animierte Wellen
- Wellen: Opacity und Bewegung in Session 3 feinabgestimmt (träger, breiter)
- Datenschutzerklärung finalisiert: GitHub Pages, Formspree, Cal.com, GA4 (Consent Mode v2), LinkedIn, selbst gehostete Fonts
- Zertifikats-Badges als Akkordeon-Cards im Vertrauensbereich auf index.html (text-only, kein PDF-Link aus Datenschutzgründen)
- Step-Akkordeons auf allen 3 Leistungsseiten — Ablauf/Vorgehen-Listen sind klickbar interaktiv (Grid-Rows-Trick)
- Mobile Hamburger-Menü auf index.html + allen Subpages: animiertes Dropdown, schließt bei Outside-Click und Swipe
- Mobile: Portrait-Bild unter Text in der Über-mich-Section; Portrait größer + flush with section bottom
- Staggered Reveal-Animationen + Hover-Interaktionen auf allen Leistungsseiten
- Footer auf allen Seiten vereinfacht (nur Back-Link, Name, Legal-Links — kein Nav/Brand/CTA)
- Datenschutz: Reveal-Animationen deaktiviert (Inhalt sofort sichtbar)
- Impressum: Telefonnummer entfernt
- Copy: KI-Muster (sauber, vollständig, nachhaltig, datengetrieben, Passivketten) aus allen Leistungsseiten entfernt
- Custom Domain **lvg-ppc.de** live mit HTTPS (GitHub Pages, CNAME)
- sitemap.xml erstellt + in Google Search Console eingereicht
- Schema.org Structured Data (JSON-LD) auf allen Content-Seiten:
  - `index.html`: Person + ProfessionalService + WebSite
  - `faq.html`: FAQPage (10 Fragen)
  - `ueber-mich.html`: Person
  - Alle 3 Leistungsseiten: Service-Schema inkl. Preisrange
- **CSS-Extraktion** (Commit `dbe1107`, Mai 2026): ~22.000 Zeilen duplizierter `<style>`-Code aus 8 HTML-Dateien in `assets/styles.css` zentralisiert (-5.228 Zeilen netto). Jede Seite hat nur noch seitenspezifische Overrides inline. `index.html` + `404.html` bewusst ausgelassen (zu unterschiedliche Struktur).

### Aktive Feature-Branches

Keine aktiven Feature-Branches. `feature/hero-data-viz` wurde in `main` gemergt (Commit `a017fb0`).

### Offene TODOs
- [ ] **404.html** als Custom-Error-Page beim Hoster eintragen
- [ ] **Lead-Magnet scharfschalten** (Notion-Task 25.05.) — ACOS-Rechner + E-Mail-Formular sind gebaut. Offen: Mailchimp einrichten, Form-Action in `data-mailchimp-endpoint` (in `index.html`, `#leadmagnet-form`) eintragen, Checkliste-PDF "7 Amazon PPC-Fehler", 5-Mail-Nurture-Sequenz, **Datenschutz um Mailchimp-Abschnitt ergänzen**.
- [ ] **Zertifikats-Badge-Bilder** — Cert sind jetzt sichtbare statische Karten (text-only). Badge-Bilder (`badge-sponsored-ads.avif`, `badge-marketing-cloud.png`) erst einbauen, wenn offizielle Bilder vorliegen. PDFs nicht verlinkt (Datenschutz).
- [ ] **PageSpeed / Lighthouse neu prüfen** nach Kernsanierung (Rechner + neue Sektionen). Mobile war 74.
- [ ] **GSC:** neue Ordner-URLs einreichen, alte URLs werden per Redirect übernommen.
- [ ] **WCAG-Kontrast** für `--ink-muted`/`--ink-soft` auf `--paper` gegenchecken (Ziel 4,5:1).
- [ ] **Blog (Phase 5, ab Monat 2):** BOFU-Artikel Freelancer-vs-Agentur, Audit-Kosten, ACOS senken.

## Technische Besonderheiten

- **Akkordeons** (FAQ, Cert-Badges, Step-Items): Grid-Rows-Trick `0fr → 1fr`, kein `max-height`. Step-Akkordeons zusätzlich mit `translateY`-Fade auf `.step-desc`.
- **Parallax**: `data-parallax="<factor>"` Attribut, `intensity = (mob?0.08:0.12)*factor`, cap 56/32px
- **Scroll-Blur**: +0.6px auf bestehenden filter während Scroll, 200ms Debounce
- **Wellen**: 4 SVG-Pfade, requestAnimationFrame, pausiert bei `document.hidden`
- **Reveal**: IntersectionObserver bi-direktional (kein `once`), threshold 0.10
- **Mobile**: Zwei Breakpoints — 1100px (Nav vereinfacht) und 900px (Layout kollabiert)
- **Mobile Nav**: Hamburger-Button öffnet Dropdown via `grid-rows`-Trick; schließt bei Outside-Click (`document.addEventListener`) und Touch-Swipe nach oben
- **Schema.org**: JSON-LD inline in `<head>`, Typen: Person + ProfessionalService + WebSite (index.html), FAQPage (faq.html), Person (ueber-mich.html), Service inkl. Preisrange (Leistungsseiten)
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
