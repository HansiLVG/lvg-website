# CLAUDE.md — LVG Website (V2)

Persönliche Website von Leon-Vincent Gamradt, Amazon PPC Spezialist Berlin.
Statische HTML/CSS/JS-Website, kein Framework, kein Build-Schritt.
Live auf [lvg-ppc.de](https://lvg-ppc.de) via GitHub Pages (Repo `HansiLVG/lvg-website`, Branch `main`).

**V2-Design-Sprache:** Dark / Data-First / SaaS-Look. Space Grotesk + Inter, Hellgrün-Akzent, animierter WebGL-Mesh-Hintergrund.

## Projektstruktur

```
website-main/
├── index.html                      ← Homepage (Hero + Leistungen + ACOS-Rechner + …)
├── ueber-mich.html                 ← Über mich
├── faq.html                        ← Häufige Fragen
├── kontakt.html                    ← Kontaktformular + Cal.com
├── leistungen/index.html           ← Leistungs-Übersicht
├── amazon-ppc-audit/index.html     ← Leistungsseite Audit (Keyword-Ordner-URL)
├── amazon-ppc-management/index.html ← Leistungsseite Management
├── amazon-ppc-strategie/index.html ← Leistungsseite Strategie
├── preise/index.html               ← Pricing
├── rechner/index.html              ← Rechner-Hub (ACOS, Break-Even, Max-CPC, Budget; weitere demnächst)
├── blog/index.html                 ← Blog-Übersicht
│   └── amazon-ppc-freelancer-vs-agentur/index.html
│   └── amazon-ppc-tacos-vs-acos/index.html
├── impressum.html
├── datenschutz.html
├── 404.html
├── lead-magnet/index.html          ← PDF-Druckvorlage „7 Amazon PPC-Fehler", noindex
├── sitemap.xml                     ← Google Search Console
├── robots.txt
├── llms.txt                        ← Hinweise für KI-Crawler
├── CNAME                           ← lvg-ppc.de
├── site.webmanifest
├── apple-touch-icon.png
├── android-chrome-{192,512}.png
├── assets/
│   ├── styles.css                  ← Zentraler Styles (alle Seiten)
│   ├── app.js                      ← Interaktion (Cookie-Banner, Reveal, ACOS-Rechner)
│   ├── whatamesh.js                ← WebGL-Mesh-Gradient-Library (lokal gehostet)
│   ├── logo-primary.svg            ← Hauptlogo (Nav, Footer)
│   ├── logo-favicon.svg            ← Favicon-SVG
│   ├── amazon-ppc-spezialist-berlin.webp ← Portrait (Hero + Über mich)
│   ├── badge-sponsored-ads.avif    ← Cert-Badge (geplant einzubauen)
│   ├── badge-marketing-cloud.png   ← Cert-Badge (geplant einzubauen)
│   ├── zertifikat-sponsored-ads.pdf            ← Backup, nicht verlinkt
│   └── zertifikat-amazon-marketing-cloud.pdf   ← Backup, nicht verlinkt
├── fonts/
│   ├── space-grotesk-latin.woff2   ← Variable 300–700
│   └── inter-latin.woff2           ← Variable 300–700
```

Vollständige Spezifikation V2-Design: siehe `../website-v2-dev/DESIGN-SYSTEM-V2.md` im Workspace-Repo.

## Design-Prinzipien V2 (Kurzfassung)

- **Typografie:** Space Grotesk (Headlines, Labels, Zahlen) + Inter (Body, Buttons)
- **Farben:** Dunkler Hintergrund (`#0e1117`), heller Text auf 4 Opazitäten, Hellgrün-Akzent `#22c55e`
- **Daten-Palette:** Orange `#FF9900` · Blue `#3b82f6` · Purple `#8B5CF6` (nur in Charts/Sparklines)
- **Signal-/Statusfarben:** `--signal-warning` (Orange `#FF9900`, Achtung/Geld in Gefahr/Handlungsbedarf) · `--signal-danger` (Rot `#f87171`, kritisch/Verlust/Fehler) · `--signal-caution` (Gelb `#fbbf24`, Optimierungsbedarf). Grün `--accent` = positiv/gut. Orange ist semantisch belegt, nie als reine Deko an positiven Stellen (CTAs, Erfolg).
- **Hero-Hintergrund:** Animierter WebGL-Mesh-Gradient via Whatamesh
- **Hover-Pattern:** `translateY(-1px/-2px)` + `border-color` strong, kein Hintergrundfarbe-Hover
- **Reveal:** IntersectionObserver-basierte Einblend-Animationen mit `--reveal-delay`

## CSS-Tokens (Auszug)

```css
--bg:           #0e1117;
--bg-card:      #131820;
--bg-elevated:  #1a2030;
--text:         #f0f0f0;
--text-soft:    rgba(240,240,240,0.65);
--text-muted:   rgba(240,240,240,0.38);
--accent:       #22c55e;
--accent-dim:   rgba(34,197,94,0.12);
--accent-border:rgba(34,197,94,0.22);
--signal-warning:       #FF9900;   /* Orange: Achtung/Geld in Gefahr */
--signal-danger:        #f87171;   /* Rot: kritisch/Fehler */
--signal-caution:       #fbbf24;   /* Gelb: Optimierungsbedarf */
--border:       rgba(255,255,255,0.07);
--border-strong:rgba(255,255,255,0.14);
--maxw:  clamp(1100px, 80vw, 1440px);
--pad-x: 64px;
--serif: "Space Grotesk", system-ui, sans-serif;
--sans:  "Inter", system-ui, sans-serif;
```

## Technische Bausteine

- **WebGL-Mesh-Hintergrund** (`whatamesh.js`, lokal): Hero-Canvas mit animiertem 4-Farben-Mesh, GPU-beschleunigt. `prefers-reduced-motion`-Fallback.
- **Cookie-Banner + Consent Mode:** Akzeptieren/Ablehnen vor GA-Aktivierung.
- **Reveal-Animationen:** `class="reveal"` + optional `--reveal-delay` Inline-Style, IntersectionObserver-basiert.
- **JSON-LD-Schema:** Inline pro Seite (Person, ProfessionalService, WebSite auf Homepage; FAQPage, Service, BlogPosting auf Subseiten).
- **Selbst gehostete Fonts:** Space Grotesk + Inter aus `/fonts/`, kein Google-CDN (DSGVO + Performance).
- **Print-Stylesheets:** Lead-Magnet hat eigenes `@page A4`-Setup.

## Aktueller Stand

### Deployed
- Vollständige V2-Site live auf lvg-ppc.de (HTTPS via GitHub Pages, Custom Domain).
- 28 HTML-Seiten (Homepage + 3 Leistungs-Ordner-URLs + Preise + Über-mich + FAQ + Kontakt + Blog mit 2 Artikeln + Glossar Tier 1+2+3 mit 20 Seiten (Übersicht + 19 Begriffe) + Legal + 404 + Lead-Magnet).
- Blog-Automation läuft als Remote-Routine (Donnerstags, siehe Routine-ID in Memory).

### Lead-Funnel (Status 2026-05)
- ACOS-Rechner auf Homepage mit E-Mail-Capture via Brevo. Bestätigungsseiten live (`anmeldung-bestaetigen/`, `willkommen/`).
- Lead-Magnet PDF-Druckvorlage: `lead-magnet/index.html` (Browser → „Als PDF speichern"). V2-Hellvariante, 13 Seiten. Drafts der Nurture-Sequenz liegen im Vault unter `04 Projekte/Lead-Funnel Drafts/`.

## Offene TODOs

- [ ] **Brevo fertigstellen** — Nurture-Sequenz aus Vault in Brevo einrichten. Erledigt (29.05.2026): Formular-Bug gefixt (`VORNAME` statt `FIRSTNAME` im fetch), Double-Opt-in läuft end-to-end, Resend-Timer auf Bestätigungsseite, DOI- + Welcome-Mail als helle Templates mit dunklem Logo (`assets/logo-email-light.png`), Datenschutz um Brevo-Abschnitt (Sektion 10) ergänzt. Offen: finaler End-to-End-Test, Nurture-Sequenz.
- [ ] **Cert-Badge-Bilder** einbauen (`badge-sponsored-ads.avif`, `badge-marketing-cloud.png`) sobald die offiziellen Bilder vorliegen.
- [x] **Zertifikate als Lightbox** — cert-cards auf Homepage und Über-mich anklickbar gemacht, öffnen die Urkunde als WebP-Overlay (03.06.2026). Quelle: `assets/zertifikat-*.pdf` nach `assets/zertifikat-*.webp` gerendert (PyMuPDF). Frühere Datenschutz-Bedenken gegen das Verlinken hinfällig: Urkunden enthalten nur Name, Datum und Zertifizierungs-ID, alles ohnehin öffentlich.
- [ ] **Lead-Magnet Live-URL** — entscheiden ob `lead-magnet/` öffentlich verlinkbar oder nur per E-Mail-Versand nach Download. Aktuell `noindex`.
- [ ] **PageSpeed/Lighthouse Benchmark** für V2 neu erheben (V1-Werte aus alter Doku sind nicht mehr aussagekräftig).
- [ ] **WCAG-Kontrast** für `--text-muted` (38% Opacity) auf `--bg` gecheckt: 3,28:1 (rechnerisch). Besteht WCAG AA für Großtext (3:1), fällt unter AA für Normaltext (4,5:1). Bewusste Design-Entscheidung, solange text-muted nur für Sekundärinformationen (Metadaten, Captions) eingesetzt wird.
- [x] **Datenschutz aktualisiert** — Whatamesh-Library (lokal gehostet) als Sektion 7 eingetragen (28.05.2026).
- [x] **Glossar Tier 2** — 7 Kampagnen-Mechanik-Seiten live (28.05.2026): Sponsored Products, Sponsored Brands, Sponsored Display, Match Types, Negative Keywords, Auto vs. Manual Kampagne, Placement Top of Search.
- [ ] **Glossar Search-Console-Submission** — Alle 19 Glossar-URLs in GSC zur Indexierung einreichen.
- [x] **Glossar Tier 3** — Search Term Report, AMC, DSP, Bid Strategy, Bulk Sheet live (28.05.2026).

## Workflow-Regeln

**Commits:** Jede inhaltliche Änderung bekommt einen eigenen Commit. Sprechende Commit-Messages.

**Push-Zeitpunkt:** Erst am Ende eines logischen Themenblocks pushen, nicht nach jeder Einzeldatei. Ausnahmen: explizites „push" vom User oder Sessionende. **Beim Verlassen des Arbeitsplatzes immer pushen.**

**Nach jedem Push:** TODOs hier aktualisieren + erledigte Notion-Tasks abhaken.

**Stilregeln für sichtbare Texte (HART):**
- **Keine Gedankenstriche (— oder –)** in Website-Texten, auch nicht bei Bereichen (`20 bis 30 Prozent` statt `20–30`). Punkt oder Komma stattdessen. Ausnahme nur als gestalterisches Mittel in Überschriften.
- **Keine KI-Floskeln** (sauber, vollständig, nachhaltig, datengetrieben, ganzheitlich, strategisch). Wurden bewusst aus allen Leistungsseiten entfernt.
- Korrekte Umlaute (ä, ö, ü, ß) überall.
- Du-Anrede konsequent.

**Session-Log (automatisch):** Am Ende jeder erkennbar abgeschlossenen Claude Code Session wird ein strukturierter Eintrag an die heutige Daily-Briefing-Seite in Notion angehängt.
- Notion Daily Briefings DB: `65db8b3231bd450c9d5c5f90f821362e`
- Format: `📌 Session [HH:MM] — [Thema in 5 Worten]` + Bullets: Erledigt / Geändert (Dateien/Repos) / Offen geblieben
- Nur wenn etwas Konkretes umgesetzt wurde — keine Logs für reine Beratungs-Sessions.

## V2-Migration (historisch)

Die Website wurde von V1 (hell, editorial, Instrument Serif + Waldgrün) auf V2 (Dark/Data-First, Space Grotesk + Hellgrün) umgestellt. Die V1-Dokumentation, V1-Assets und V1-Dev-Tools wurden 2026-05-27 vollständig entfernt (`assets/` von 28 auf 9 Dateien geschrumpft). Bei Inkonsistenzen oder „komischen Resten" in zukünftigen Audits: gegen diesen Stand prüfen.
