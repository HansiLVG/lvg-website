# CLAUDE.md — LVG Website (V2)

Persönliche Website von Leon-Vincent Gamradt, Amazon PPC Spezialist Berlin.
Statische HTML/CSS/JS-Website, kein Framework, kein Build-Schritt.
Live auf [lvg-ppc.de](https://lvg-ppc.de) via GitHub Pages (Branch `main`).

**V2-Design-Sprache:** Dark / Data-First / SaaS-Look. Space Grotesk + Inter, Hellgrün-Akzent, animierter WebGL-Mesh-Hintergrund.

## Projektstruktur

```
website-main/
├── index.html                      ← Homepage (Hero + Leistungen + ACOS-Rechner + …)
├── ueber-mich.html                 ← Über mich
├── faq.html                        ← Häufige Fragen
├── kontakt.html                    ← Kontaktformular + Cal.com
├── leistungen/index.html           ← Leistungs-Übersicht
├── amazon-ppc-audit/index.html     ← Leistungsseite Audit
├── amazon-ppc-management/index.html ← Leistungsseite Management
├── amazon-ppc-strategie/index.html ← Leistungsseite Strategie
├── amazon-seo/index.html           ← Landingpage Amazon SEO
├── preise/index.html               ← Pricing
├── rechner/index.html              ← Rechner-Hub (ACOS, Break-Even, …)
├── blog/index.html                 ← Blog-Übersicht (+ Artikel-Unterordner)
├── glossar/index.html              ← Glossar-Übersicht (+ Begriffs-Unterordner)
├── impressum.html · datenschutz.html · 404.html
├── sitemap.xml · robots.txt · llms.txt · CNAME · site.webmanifest
├── assets/
│   ├── styles.css                  ← Zentrale Styles (alle Seiten)
│   ├── app.js                      ← Interaktion (Cookie-Banner, Reveal, ACOS-Rechner)
│   ├── whatamesh.js                ← WebGL-Mesh-Gradient-Library (lokal gehostet)
│   ├── logo-*.svg                  ← Logo-Varianten
│   └── amazon-ppc-spezialist-berlin.webp ← Portrait (Hero + Über mich)
└── fonts/                          ← Space Grotesk + Inter (lokal, woff2)
```

## Design-Prinzipien V2 (Kurzfassung)

- **Typografie:** Space Grotesk (Headlines, Labels, Zahlen) + Inter (Body, Buttons)
- **Farben:** Dunkler Hintergrund (`#0e1117`), heller Text auf 4 Opazitäten, Hellgrün-Akzent `#22c55e`
- **Daten-Palette:** Orange `#FF9900` · Blue `#3b82f6` · Purple `#8B5CF6` (nur in Charts/Sparklines)
- **Signal-/Statusfarben:** `--signal-warning` (Orange `#FF9900`, Achtung/Geld in Gefahr) · `--signal-danger` (Rot `#f87171`, kritisch/Fehler) · `--signal-caution` (Gelb `#fbbf24`, Optimierungsbedarf). Grün `--accent` = positiv. Orange ist semantisch belegt, nie als reine Deko an positiven Stellen (CTAs, Erfolg).
- **Erweiterte Akzent-Palette (Design):** `--accent-blue` `#3b82f6` · `--accent-purple` `#8B5CF6` · `--accent-amber` `#fbbf24` · `--accent-orange` `#FF9900`, je mit `-dim`/`-border`-Variante. Für farbige Design-Akzente über Grün hinaus (Karten, Badges, Highlights). Blau und Lila sind semantisch frei; Amber und Orange bleiben primär Signalfarben und dürfen dekorativ nur bewusst gesetzt werden.
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

- **WebGL-Mesh-Hintergrund** (`whatamesh.js`, lokal): Hero-Canvas mit animiertem 4-Farben-Mesh, GPU-beschleunigt, `prefers-reduced-motion`-Fallback.
- **Cookie-Banner + Consent Mode:** Akzeptieren/Ablehnen vor GA-Aktivierung.
- **Reveal-Animationen:** `class="reveal"` + optional `--reveal-delay` Inline-Style.
- **JSON-LD-Schema:** Inline pro Seite (Person, ProfessionalService, WebSite auf Homepage; FAQPage, Service, BlogPosting auf Subseiten).
- **Selbst gehostete Fonts:** Space Grotesk + Inter aus `/fonts/`, kein Google-CDN (DSGVO + Performance).

## Stilregeln für sichtbare Texte (HART)

- **Keine Gedankenstriche (— oder –)** in Website-Texten, auch nicht bei Bereichen (`20 bis 30 Prozent` statt `20–30`). Punkt oder Komma stattdessen. Ausnahme nur als gestalterisches Mittel in Überschriften.
- **Keine KI-Floskeln** (sauber, vollständig, nachhaltig, datengetrieben, ganzheitlich, strategisch).
- Korrekte Umlaute (ä, ö, ü, ß) überall.
- Du-Anrede konsequent.

## Workflow-Regeln

- **Commits:** Jede inhaltliche Änderung bekommt einen eigenen Commit mit sprechender Message.
- **Push-Zeitpunkt:** Erst am Ende eines logischen Themenblocks pushen, nicht nach jeder Einzeldatei. Ausnahme: explizites „push" oder Sessionende.
