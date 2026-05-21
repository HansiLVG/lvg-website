# DESIGN-SYSTEM.md
**Projekt:** Leon-Vincent Gamradt — Amazon PPC Spezialist (One-Pager)
**Quelle:** `index.html` (single-file Build), Assets in `assets/`
**Stand:** Mai 2026
**Sprache:** Deutsch (`<html lang="de">`)

> Dieses Dokument beschreibt **nicht** ein Idealbild, sondern die tatsächlich im Code implementierten Werte. Es ist so präzise gehalten, dass eine neue Session den Stand exakt reproduzieren kann.

---

## 1 · Grund-Setup

### 1.1 Schriften (Web-Fonts)
**Selbst gehostet** (kein Google-CDN — wegen Performance & DSGVO). Eingebunden in `<head>`:

```html
<link rel="stylesheet" href="assets/fonts/fonts.css" />
```

`assets/fonts/fonts.css` definiert drei `@font-face` (latin-Subset, `font-display: swap`):

| Familie            | Datei                              | Schnitte                | Verwendung                         |
| ------------------ | ---------------------------------- | ----------------------- | ---------------------------------- |
| Instrument Serif   | `instrument-serif-regular.woff2`   | 400 regular             | Headlines, Peak-Sätze, Zahlen, CTA |
| Instrument Serif   | `instrument-serif-italic.woff2`    | 400 italic              | Akzent-Italics                     |
| Inter              | `inter-latin.woff2`                | variable 300–500        | Body, Labels, Buttons, Nav, FAQ-Q  |

Stacks (CSS-Variablen):
```css
--serif: "Instrument Serif", "Iowan Old Style", "Apple Garamond", Georgia, serif;
--sans:  "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
```

### 1.2 Body-Defaults
```css
html { scroll-behavior: smooth; }
body {
  font-family: var(--sans);
  background: var(--paper);     /* #fafafa */
  color: var(--ink-soft);       /* #4a4a4a */
  line-height: 1.5;
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
}
```
Body trägt `data-screen-label="01 LVG Landing Page"`. Jede Section trägt zusätzlich ein eigenes `data-screen-label` (`Hero`, `Vertrauen`, `Leistungen`, `Über mich`, `Ablauf`, `FAQ`, `CTA`).

---

## 2 · Design-Tokens (CSS-Variablen)

Alle Tokens leben in `:root` in `index.html`. **Werte 1:1 aus dem Code:**

### 2.1 Farben — Paper / Ink
| Token            | Wert                       | Zweck                              |
| ---------------- | -------------------------- | ---------------------------------- |
| `--paper`        | `#fafafa`                  | Haupt-Hintergrund                  |
| `--paper-2`      | `#f4f4f4`                  | Sekundär (Ablauf-Section)          |
| `--ink`          | `#0a0a0a`                  | Stärkstes Schwarz, Headlines       |
| `--ink-strong`   | `#1a1a1a`                  | Bold-Subzeilen (Leistungen/Ablauf) |
| `--ink-soft`     | `#4a4a4a`                  | Standard-Body-Text                 |
| `--ink-muted`    | `#6e6e6e`                  | Labels, Meta, Footer (WCAG-AA ≥4,5:1) |
| `--ink-faint`    | `#c0c0c0`                  | Reserve (im Markup ungenutzt)      |
| `--border`       | `rgba(10,10,10,0.08)`      | Default-Linien                     |
| `--border-strong`| `rgba(10,10,10,0.18)`      | Reserve                            |

### 2.2 Farben — Akzent (Berg-Grün)
| Token           | Wert                       | Zweck                              |
| --------------- | -------------------------- | ---------------------------------- |
| `--accent`      | `#2d5f3f`                  | Italic-Wörter, Triangles, Ziffern  |
| `--accent-soft` | `#4a7c59`                  | Button-Hover, Stat-Hover-Triangle  |
| `--accent-glow` | `rgba(45,95,63,0.08)`      | Reserve                            |

Akzent erscheint außerdem als Wellen-Stroke `rgba(45,95,63,0.075–0.110)`.

### 2.3 Farben — CTA-Block
| Token       | Wert      | Zweck                       |
| ----------- | --------- | --------------------------- |
| `--cta-dark`| `#0a0a0a` | Dunkler CTA-Hintergrund     |

CTA-Vordergrund: `#fff`, sekundäre Stack-Sätze `rgba(255,255,255,0.45)`.

### 2.4 Layout-Tokens
| Token      | Wert    | Notiz                                                                 |
| ---------- | ------- | --------------------------------------------------------------------- |
| `--maxw`   | `1240px`| Container-Maximalbreite (`.wrap`, `.nav-inner`)                       |
| `--pad-x`  | `64px`  | Container-Innenabstand horizontal — wird unter 900px zu `28px`        |

### 2.5 Hero-Tokens (final eingebrannt in `:root`)
Die früher über das Tweaks-Panel gesteuerten Hero-Werte sind inzwischen als finale Werte direkt in `:root` eingebrannt:

| Token                  | Wert      | Beschreibung                              |
| ---------------------- | --------- | ----------------------------------------- |
| `--hero-right-top`     | `6vh`     | Vertikaler Offset der Hero-Rechtsspalte   |
| `--hero-right-offset`  | `-80px`   | Horizontaler Offset der Hero-Rechtsspalte |
| `--hero-bg-opacity`    | `0.64`    | Deckkraft des Bergbild-Hintergrunds       |
| `--hero-scrim`         | `0.38`    | Paper-Schleier hinter Hero-Text           |
| `--ueber-photo-mask`       | `27%`  | Über-Mich-Portrait — Maske links          |
| `--ueber-photo-mask-right` | `17%`  | Über-Mich-Portrait — Maske rechts         |

### 2.6 Selection
```css
::selection { background: var(--accent); color: #fff; }
```

---

## 3 · Typografie — wie wirklich implementiert

Alle Größen sind **absolute px** außer den drei `clamp()`-Skalen für Hero/CTA. Keine globale Type-Scale, sondern Per-Komponent-Werte.

### 3.1 Display & Headlines (Serif italic-fähig)
| Stelle               | Family | Style/Weight | Size                                  | Line-h | Letter-sp  | Color       |
| -------------------- | ------ | ------------ | ------------------------------------- | ------ | ---------- | ----------- |
| `.hero h1`           | serif  | 400 regular  | `clamp(56px, 8vw, 96px)` (mobile `clamp(40px, 11vw, 56px)`) | 1.05   | `-0.015em` | `--ink`     |
| `.hero h1 .accent`   | serif  | 400 italic   | inherit                               | inherit| inherit    | `--accent`  |
| `.peak`              | serif  | 400 italic   | `clamp(36px, 4.6vw, 56px)`            | 1.12   | `-0.008em` | `--accent`  |
| `.stat-num`          | serif  | 400          | `56px`                                | 1.0    | `-0.01em`  | `--ink`     |
| `.cta-stack`         | serif  | 400          | `clamp(28px, 4.2vw, 48px)`            | 1.18   | `-0.005em` | `rgba(255,255,255,0.45)`, `.last` = `#fff` |
| `.cta-close`         | serif  | 400 italic   | `clamp(40px, 6.6vw, 72px)`            | 1.05   | `-0.012em` | `#fff`      |
| `.ueber-paragraphs p:first-child` | serif | 400 (NICHT italic) | `26px`                  | 1.35   | `-0.005em` | `--ink`     |
| `.ablauf-num`        | serif  | 400          | `28px`                                | 1.0    | —          | `--accent`  |
| `.nav .brand`        | serif  | 400          | `22px`                                | 1.0    | `0.005em`  | `--ink`     |

### 3.2 Body (Sans)
| Stelle                  | Weight | Size      | Line-h | Letter-sp | Color/Opacity                  |
| ----------------------- | ------ | --------- | ------ | --------- | ------------------------------ |
| `.hero-sub`             | 300    | `17px`    | 1.6    | —         | `--ink-soft` @ `opacity 0.85`  |
| `.leistung-bold`        | 500    | `19px`    | 1.5    | —         | `--ink-strong` @ `0.92`        |
| `.leistung-text`        | 300    | `15px`    | 1.7    | —         | `--ink-soft` @ `0.85`          |
| `.ueber-paragraphs p`   | 300    | `17px`    | 1.8    | —         | `--ink-soft` @ `0.85`          |
| `.ablauf-title`         | 500    | `19px`    | normal | —         | `--ink-strong` @ `0.92`        |
| `.ablauf-desc`          | 300    | `15px`    | 1.7    | —         | `--ink-soft` @ `0.85`          |
| `.ablauf-note`          | 300 italic | `14px`| 1.7    | —         | `--ink-muted` @ `0.85`         |
| `.vertrauen-close`      | 300    | `15px`    | 1.7    | —         | `--ink-soft` @ `0.85`          |
| `.stat-label`           | 400    | `13px`    | normal | `0.01em`  | `--ink-muted`                  |
| `.faq-q-text`           | 500    | `17px`    | 1.4    | —         | `--ink` @ `0.85` (Hover → 1)   |
| `.faq-a`                | 300    | `15px`    | 1.75   | —         | `--ink-soft` @ `0.85` wenn offen |
| `.cert-badge-body`      | 300    | `14px`    | 1.65   | `0.002em` | `--ink-soft`                   |
| `.cert-badge-body .cert-note` | 300 italic | `12px` | normal | — | `--ink-muted` @ `0.75`         |
| Footer `.foot-text`     | 400    | `12px`    | normal | `0.02em`  | `--ink-muted` @ `0.85`         |

### 3.3 Labels (Caps-Eyebrows)
Eine einheitliche Klasse `.label`:
```
Inter 500, 12px, letter-spacing 0.18em, UPPERCASE, color var(--ink-muted)
inline-flex, gap 12px (zum Dreieck)
```
Varianten mit eigener Größe:
- `.leistung-title` → 13px, `0.10em`
- `.cert-badge-head` und `.badge` → 11px, `0.08em`
- `.nav-links a` → 11px, `0.14em`
- `.nav a.cta-link` → 12px, `0.16em`
- `.scroll-cue` → 10px, `0.22em` (mobile 9px)

### 3.4 Triangle-Icon `.tri` (Akzent-Glyph)
Reines CSS-Dreieck nach oben, gefüllt mit `--accent`:
```css
.tri      { border-left:4px solid transparent; border-right:4px solid transparent;   border-bottom:6px solid var(--accent); }
.tri-large{ border-left:5px;  border-right:5px;  border-bottom:7px; }
.tri-mini { border-left:3.5px; border-right:3.5px; border-bottom:5px; }
```
Erscheint vor jedem Eyebrow-Label, vor Ablauf-Ziffern und (als 5px-Variante `.open-tri`) im offenen FAQ-Item links neben dem Frage-Text.

---

## 4 · Spacing, Container, Grid

### 4.1 Container
```css
.wrap, .nav-inner { max-width: 1240px; margin: 0 auto; padding: 0 64px; }
```
Unter `900px` wird `--pad-x` auf `28px` reduziert.

### 4.2 Vertikales Section-Padding
```css
.section-pad { padding: 112px 0; }
@media (max-width: 900px) { .section-pad { padding: 80px 0; } }
```
Hero: `padding: 120px 0 80px` (mobil `96px 0 56px`).
CTA-Inhalt: `padding: 140px 0 120px` (mobil `100px 0 80px`).
Footer: `padding: 40px 0`.

### 4.3 Anchor-Offset
```css
section[id] { scroll-margin-top: 72px; }
```
(Nav-Höhe 64px + 8px Luft.)

### 4.4 Grid-Systeme pro Section
| Section         | Grid                                                | Gap                       |
| --------------- | --------------------------------------------------- | ------------------------- |
| Hero            | `grid-template-columns: 55fr 45fr`                  | `56px`                    |
| Vertrauen Stats | `grid-template-columns: repeat(3, 1fr)`             | nur Border, kein Gap      |
| Badges          | `grid-template-columns: 1fr 1fr`                    | `16px`                    |
| Leistung-Row    | `grid-template-columns: 220px 1fr`                  | `40px`                    |
| Ablauf-Step     | `grid-template-columns: 88px 1fr`                   | `32px`                    |
| FAQ-Q           | `grid-template-columns: 1fr auto`                   | `20px`                    |
| Cert-Q          | `grid-template-columns: 1fr auto`                   | `20px`                    |

Alle Grids kollabieren auf `1fr` unterhalb `900px` (Stats werden Spalten → Reihen mit Bottom-Border).

### 4.5 Peak-Sentence-Abstand
```css
.peak { margin: 22px 0 64px; max-width: 22ch; }
```

---

## 5 · Komponenten

### 5.1 Navigation (`nav.nav`)
- **Position:** fixed top, `height: 64px`, `z-index: 100`.
- **Hintergrund:** `rgba(250,250,250,0.85)` + `backdrop-filter: saturate(140%) blur(12px)`.
- **Border-Bottom:** `1px solid var(--border)` + sehr feiner Schatten `0 1px 0 rgba(10,10,10,0.02), 0 8px 24px -16px rgba(10,10,10,0.10)`.
- **Inner:** `max-width 1240px`, gap `32px`, drei-Spaltig (Brand · Links · CTA-Link).
- **Links:** `nav-links` flex, `gap: 28px`, zentriert. Hover: `color → --ink` + Underline-Linie wächst von links nach rechts (`right: 100% → 0`, `transition: 0.35s cubic-bezier(0.22,1,0.36,1)`).
- **CTA-Link rechts** (`Gespräch buchen`) hat identische Underline-Animation, ist aber von Anfang an in `--ink`.
- **Mobile:** Unter `1100px` wird `.nav-links` `display:none` (Brand + CTA bleiben sichtbar — **es gibt kein Burger-Menü**).

### 5.2 Buttons (`.btn`)
Gemeinsam:
```
font: Inter 500, 13px, letter-spacing 0.01em
padding: 14px 22px
border-radius: 7px
border: 1px solid transparent
gap (icon): 8px, inline-flex, white-space: nowrap
transition: transform/bg/color/border 0.2s
```
Hover-Default: `transform: scale(1.04)` (alle Varianten).

| Variante        | BG                        | Text         | Border                   | Hover                          |
| --------------- | ------------------------- | ------------ | ------------------------ | ------------------------------ |
| `.btn-primary`  | `--accent` (`#2d5f3f`)    | `#fff`       | `--accent`               | BG/Border → `--accent-soft`    |
| `.btn-secondary`| transparent               | `--ink`      | `rgba(10,10,10,0.6)`     | BG → `rgba(10,10,10,0.05)`     |
| `.btn-ghost`    | transparent               | `rgba(255,255,255,0.95)` | `rgba(255,255,255,0.35)` | BG → `rgba(255,255,255,0.08)`, Border → `0.55` |

`.btn-ghost` wird nur im dunklen CTA-Block verwendet.

### 5.3 Hero
Struktur: `.hero > .hero-bg + .hero-scrim + .hero-vignette + .scroll-cue + .wrap > .hero-grid (left, hero-right)`.
- **`.hero-bg`** — `position: absolute; inset: -8% 0` (Bleed), `background-image: url("assets/hero-background.webp")`, `background-size: cover`, `opacity: var(--hero-bg-opacity, 0.32)`, `filter: saturate(1.05) contrast(1.04) blur(0.8px)`. Trägt `data-parallax="0.7"`.
- **`.hero-scrim`** — Paper-Verlauf von unten (`rgba(250,250,250, --hero-scrim)`) abnehmend zu transparent bei 92%. Stops bei 0/38/68/92 %.
- **`.hero-vignette`** — `radial-gradient(ellipse at center, transparent 30%, rgba(10,10,10,0.10) 100%)`.
- **`.scroll-cue`** — fixierter Anker mittig unten in Hero. Vertikale 1-px-Gradient-Linie `height: 48px`, darauf läuft ein 40 %-hoher Akzent-Streifen (`@keyframes cueRun`, 2.4 s infinite). Pfeil-SVG bouncet (`cueBounce`). Hover: opacity 1, `transform: translateX(-50%) translateY(2px)`, color → `--ink`.
- **`.hero-right`** — `padding-top: var(--hero-right-top, clamp(110px, 20vh, 220px))`, `align-self: start`, rechtsbündig.

### 5.4 Stats (Vertrauen)
- 3-Spalten-Grid mit Border oben/unten/dazwischen, **keine** Hintergrundfarbe.
- Pro `.stat`: `padding: 40px 32px 36px`, Inhalte zentriert (flex column, align/justify center).
- Hover: `.stat-num-wrap` → `transform: scale(1.06)`, dazu wird `.stat-tri` (Outline-Up-Pfeil, 12×10 px, oben rechts an der Zahl, `stroke: --accent` / 1.5) auf `stroke: --accent-soft` und `stroke-width: 2` gehoben.
- **Hinweis:** Im aktuellen HTML ist `.stat-tri` als Markup **nicht eingebaut** — die Styles existieren, die SVG-Pfeil-Instanz fehlt. (Hover-Skalierung der Zahl funktioniert trotzdem.)

### 5.5 Zertifikats-Badges (Vertrauen, expandable)
- 2-Spalten-Grid (`badges`), gap `16px`.
- `.cert-badge` ist **rounded rectangle** (`border-radius: 14px`, statisch — wird **nicht** mit-animiert, um „Oval"-Effekt zu vermeiden), `border: 1px solid rgba(10,10,10,0.30)`, `overflow: hidden`.
- Offen (`.is-open`): BG `rgba(10,10,10,0.025)`, Border `0.45`.
- Head: Inter 500, 11 px, `0.08em` upcase, padding `14px 18px 14px 20px`. Rechts ein `+`-SVG (`.cert-plus`) das beim Öffnen um 45° rotiert (`transition: 0.70s cubic-bezier(0.22,1,0.36,1)`).
- **Höhen-Animation per Grid-Rows-Trick:**
  ```css
  .cert-body-wrap        { display:grid; grid-template-rows:0fr; transition:grid-template-rows 0.70s cubic-bezier(0.22,1,0.36,1); }
  .cert-badge.is-open .cert-body-wrap { grid-template-rows:1fr; }
  .cert-body-inner       { overflow:hidden; min-height:0; }
  ```
  Body fade-in: opacity 0→1, `translateY(-4px)→0`, `transition 0.55s ease 0.08s`.
- JS: Click toggelt `is-open` + `aria-expanded`.

### 5.6 Statische Pill-Badges `.badge`
- `border-radius: 999px` (echte Pill), `border 1px solid rgba(10,10,10,0.30)`, `padding 14px 18px`, Inter 500/11/`0.08em` upcase. Aktuell nicht im HTML platziert — Style vorhanden für spätere Verwendung.

### 5.7 Leistungs-Reihen (`.leistung-row`)
- 2-Spalten (220px + 1fr), `gap 40px`, `padding 36px 0`, Trennlinie `border-bottom: 1px solid var(--border)`. Erste Reihe erbt eine Top-Linie über `.leistungen-rows`.
- Hover-Verhalten: gesamte Body-Spalte `transform: scale(1.02)` (`transform-origin: left center`), Bold-Subtitel wechselt color → `--ink`.
- Hintergrund-Element `.leistungen-detail`: absolut positioniert rechts (`right: -6%`), `width: 46%`, `height: 58%`, `max-height: 64vh`, `min-height: 380px`, `background-image: url("assets/leistungen-detail.webp")`, `opacity: 0.95`, `filter: saturate(1.08) contrast(1.05) blur(0.6px)`, links via Mask weich ausgeblendet (`linear-gradient(to right, transparent 0%, #000 32%, #000 100%)`). Trägt `data-parallax="0.65"`. Wird unter 900px komplett ausgeblendet.

### 5.8 Über-Mich-Paragraphen
- Erster `<p>` ist **stilistisch eine Lead** (Serif 26 px, line-height 1.35, color `--ink`).
- Restliche `<p>` Sans 300/17 px.
- Hover je Paragraph: `transform: scale(1.02)` (`transform-origin: left center`), color → `--ink`, opacity → 1.
- Hintergrund `.ueber-bg`: `water-flow.webp`, `opacity 0.22`, Maske `radial-gradient(ellipse 90% 90% at 50% 50%, #000 35%, #0004 100%)`, `data-parallax="0.55"`.

### 5.9 Ablauf-Schritte
- 3-Spalten-Grid intern: `88px (Nummer) + 1fr (Body)`, `padding 32px 0`, `border-bottom: 1px solid var(--border)`.
- **Ablauf-Num:** Instrument Serif 28/1.0, color `--accent`, **mit Mini-Triangle** (`.tri-mini`, `margin-top: 14px`) **links vor der Ziffer**.
- Step 1 enthält ein **unsichtbares Overlay** `<a class="ablauf-link" href="#cta">` (`position:absolute; inset:0; z-index:3`), das die gesamte Zeile klickbar macht. `.ablauf-step:has(.ablauf-link) { cursor: pointer; }`.
- Hover: Body-Block scale 1.02, Title color → `--ink`.
- Hintergrund `.ablauf-bg`: `valley-mist.webp`, `opacity 0.14`, ähnliche Mask, `data-parallax="0.45"`.
- `.ablauf-section` Hintergrund: `--paper-2` (`#f4f4f4`).

### 5.10 FAQ
- Liste `.faq-list` mit Top-Border, Items mit Bottom-Border.
- Frage-Button (`.faq-q`) ist Grid `1fr auto`, padding `26px 0`. Linker Slot enthält ggf. das `.open-tri` (5×7 px Akzent-Dreieck) — erscheint nur wenn `.is-open`.
- Plus-Icon SVG 24×24, `--ink-muted`, dreht beim Öffnen 45° (`transition: 0.65s cubic-bezier(0.22,1,0.36,1)`).
- Antwort öffnet sich via gleichem Grid-Rows-Trick wie Cert-Badge (`0fr → 1fr`, 0.70s).
- Hover: Frage `opacity 1` + `scale 1.02`, Icon-Color → `--ink`.

### 5.11 CTA-Section (dunkel)
- `background: var(--cta-dark)` (`#0a0a0a`), `color: #fff`.
- `.cta-bg`: `inset: -25% 0` (großer Bleed gegen Parallax-Ränder), `cta-background.webp`, `opacity 0.28`, `filter: saturate(1.08) contrast(1.04) brightness(0.92) blur(0.6px)`, `data-parallax="0.65"`.
- **Top- & Bottom-Fade** je 180px hoch: `linear-gradient` vom CTA-Dark zu transparent → versteckt Parallax-Kanten.
- `.cta-vignette` radial center, dazu `.cta-wave` mit 4 SVG-Pfaden, Stroke `rgba(255,255,255,0.04–0.06)`.
- **Stack-Sätze** (`.cta-stack > span`): Serif 400, `clamp(28px, 4.2vw, 48px)`, line-height 1.18, color `rgba(255,255,255,0.45)` — letzter Satz (`.last`) volles `#fff` mit `margin-top: 4px`.
- **Schluss-Satz** `.cta-close`: Serif italic, `clamp(40px, 6.6vw, 72px)`, line-height 1.05, `margin: 56px 0 44px`, `#fff`.
- Buttons: `.btn-primary` + `.btn-ghost` nebeneinander.

### 5.12 Footer
- `border-top: 1px solid var(--border)`, `padding: 40px 0`, zentriert.
- Inter 400/12 px, `--ink-muted` @ 0.85, Links erben Farbe, Hover → `--ink`.

---

## 6 · Globale Hintergrund-Effekte

### 6.1 Noise Overlay (`.noise`)
- `position: fixed; inset: 0; z-index: 2; pointer-events: none`.
- Inline-SVG mit `feTurbulence baseFrequency="0.9" numOctaves="2" stitchTiles="stitch"` und `feColorMatrix` (Alpha-Multiplier 0.5).
- `opacity: 0.025`, `mix-blend-mode: multiply`.

### 6.2 Wave-Background (`.wave-bg`)
- `position: fixed; inset: 0; z-index: 1`.
- **Seitlich abgeklungen** via Mask: `linear-gradient(to right, 1 → 0.22 → 0.22 → 1)` bei Stops `0/28/72/100 %` → Wellen sichtbar nur in den Gutters, fast unsichtbar hinter Text.
- 4 SVG-Pfade (`#wave1…#wave4`), `viewBox 0 0 1600 1000`, `preserveAspectRatio="none"`. Stroke = Akzentgrün mit Alpha `0.075–0.110`, `stroke-width: 1.25`, `fill: none`.

### 6.3 Wave-Animation (JS)
- 4 Definitionen mit je 6 Kontrollpunkten `[x, y, amp, freq(s), phase]`.
- Pro Frame: `yo = y + sin((t/1000) * 2π/freq + phase) * amp`.
- Pfad-Schema: `M -200 y0  C cp0,cp1,cp2  S cp3,cp4  S cp5,1800 y1`.
- Läuft via `requestAnimationFrame`. Pausiert bei `document.hidden` (Visibility API).
- Identische Pfad-IDs `cwave1…cwave4` werden in der CTA-Section parallel mit demselben `d`-Attribut beschrieben (Code-Pfad teilt sich die Berechnung).

### 6.4 Parallax + Scroll-Blur (JS)
Jedes Element mit `data-parallax="<factor>"` wird beim Scrollen translatiert:
```
intensity = (mobile ? 0.08 : 0.12) * factor
cap       = mobile ? 32 : 56 px
ty        = clamp(-cap, +cap, -dist * intensity)
```
Distanz = Viewport-Center → Element-Center. Anwendung über `transform: translate3d(0, ty, 0)`.

**Scroll-Blur:** Während gescrollt wird (200 ms-Timeout) addiert das Script `+0.6 px` zum bestehenden `blur(...)`-Filter, ohne `saturate/contrast/brightness` zu verlieren. „A feeling, not a blur."

Parallax-Faktoren im Markup:
| Element                | Factor |
| ---------------------- | ------ |
| `.hero-bg`             | 0.7    |
| `.leistungen-detail`   | 0.65   |
| `.ueber-bg`            | 0.55   |
| `.ablauf-bg`           | 0.45   |
| `.cta-bg`              | 0.65   |

---

## 7 · Reveal-System

### 7.1 CSS
```css
.reveal {
  opacity: 0;
  transform: translateY(12px);
  transition: opacity 0.7s cubic-bezier(0.22,1,0.36,1),
              transform 0.7s cubic-bezier(0.22,1,0.36,1);
  transition-delay: var(--reveal-delay, 0s);
  will-change: opacity, transform;
}
.reveal.in {
  opacity: 1;
  transform: none;   /* statt translateY(0) — droppt GPU-Layer */
}
.reveal[data-settled="1"] { will-change: auto; }
```

### 7.2 JS
- `IntersectionObserver` mit `threshold: 0.10`, `rootMargin: "0px 0px -8% 0px"`.
- **Bi-direktional**: kein `once`. Beim Verlassen wird `.in` entfernt und `data-settled` zurückgesetzt → Re-Trigger beim Zurückscrollen.
- Nach `transitionend` (transform/opacity) wird `data-settled="1"` gesetzt, das `will-change: auto` setzt — gegen weiche Serifen-Stroke-Renderings auf GPU-Layern.
- Staffelung pro Section über inline `style="--reveal-delay: 0.10s"` etc. (typische Werte: `0 / 0.10 / 0.20 / 0.30 / 0.40 / 0.50 s`, CTA bis `0.82 s`).

### 7.3 Crisp-Serif-Maßnahme
Headline-Selektoren `.peak, .hero h1, .ablauf-num, .stat-num, .cta-stack, .cta-close` erzwingen `-webkit-font-smoothing: antialiased` + `-moz-osx-font-smoothing: grayscale`, um die Instrument-Serif-Italics scharf zu halten.

### 7.4 Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
  .reveal { opacity: 1; transform: none; }
}
```

---

## 8 · Breakpoints

Nur **zwei** echte Breakpoints:

| Bereich      | Was passiert                                                                                 |
| ------------ | -------------------------------------------------------------------------------------------- |
| `≤ 1100 px`  | `.nav-links` werden ausgeblendet (`display:none`). Brand + CTA-Link bleiben.                 |
| `≤ 900 px`   | `--pad-x: 28px`, `.section-pad: 80px 0`, Hero 1-spaltig, Stats 1-spaltig, Badges 1-spaltig, Leistungs- & Ablauf-Reihen 1-spaltig, `.leistungen-detail` ausgeblendet, `.scroll-cue` kleiner, CTA-Padding reduziert. |

Es gibt **kein** dediziertes Tablet- oder XL-Breakpoint-Layout — alles fluide via `clamp()` und Grid-Frs.

---

## 9 · Tweaks-Panel (Live-Editing)

- React/Babel via UMD-Pins (`react@18.3.1`, `react-dom@18.3.1`, `@babel/standalone@7.29.0`).
- Externe Komponente: `tweaks-panel.jsx` (liefert `TweaksPanel`, `useTweaks`, `TweakSection`, `TweakSlider`, `TweakToggle`).
- **Defaults im `EDITMODE-BEGIN/END`-Block** (persistiert vom Host beim Editieren):
  ```json
  {
    "heroOffsetVh": 8,
    "heroBgOpacity": 0.56,
    "heroScrim": 0.44,
    "heroBlur": 0.6,
    "scrollCue": true
  }
  ```
- Effekt: setzt `--hero-right-top`, `--hero-bg-opacity`, `--hero-scrim` auf `<html>`, baut den `filter`-String von `.hero-bg` mit dem neuen Blur neu, blendet `.scroll-cue` ein/aus.
- Panel-Sektionen:
  - **Hero — Layout:** Slider „Text-Position" (0–42 vh), Toggle „Scroll-Hinweis sichtbar".
  - **Hero — Kontrast:** Slider „Bergbild-Deckkraft" (0–0.7 / step 0.02), „Kontrast-Schleier" (0–0.85 / 0.02), „Bergbild-Unschärfe" (0–3 px / 0.1).

---

## 10 · Assets

| Datei                                  | Verwendung                                  |
| -------------------------------------- | ------------------------------------------- |
| `assets/hero-background.webp`           | Hero-BG (Berg)                              |
| `assets/leistungen-detail.webp`         | Leistungen — Bild rechts (Maske + Parallax) |
| `assets/water-flow.webp`                | Über-Mich-BG (radial-maskiert)              |
| `assets/valley-mist.webp`               | Ablauf-BG (radial-maskiert)                 |
| `assets/cta-background.webp`            | CTA-BG (mit Top/Bottom-Fade)                |

Alle Background-Images werden via `background-image` + `cover`/`center` eingebunden, **nicht** als `<img>`. `data-parallax`-Attribut entscheidet über die Bewegung.

---

## 11 · z-index-Stack (effektiv)

| Layer                                  | z-index |
| -------------------------------------- | ------- |
| Wave-BG (`.wave-bg`)                   | 1       |
| Noise (`.noise`)                       | 2       |
| Main / Sections-Inhalt                 | 3       |
| Scroll-Cue                             | 4       |
| Nav                                    | 100     |
| Footer                                 | 3       |

Innerhalb der Sections: BG-Layers `z-index: 0`, `.wrap` bzw. `.*-content` `z-index: 1–2`, Ablauf-Link-Overlay `z-index: 3`.

---

## 12 · Abweichungen vom Briefing

Quelle: `uploads/Website-Strategie_Leon-Vincent.docx` + `uploads/Website-Copy_Leon-Vincent.docx`.

### 12.1 Strategische Vorgaben → Umsetzung
| Brief                                                            | Umsetzung                                                                                                 |
| ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| „Vertrauenshierarchie 1. Spezialisierung in der Headline"        | ✅ Hero-Headline „Dein Amazon-Budget verdient mehr. Mit mir." + Eyebrow „AMAZON PPC SPEZIALIST · BERLIN".  |
| „2. Erfahrungszahlen direkt unter der Headline"                  | ⚠️ **Abweichung:** Zahlen liegen in **eigener Section „Vertrauen"**, nicht direkt unter der Headline. Reihenfolge ist trotzdem Hero → Vertrauen → … (Headline → Zahlen im Scroll-Verlauf).  |
| „3. Persönliche Betreuung als Kontrast zum Agentur-Modell"       | ✅ Sub-Headline „Kein Generalist. Keine Agentur. Kein Junior." + Über-Mich-Paragraph 3 + FAQ „Unterschied zu einer Agentur". |
| „4. Call oder E-Mail — beide Optionen sichtbar (Calendly + Mail)"| ⚠️ **Abweichung:** Aktuell sind beide Buttons im Hero auf `#cta` verlinkt. Nur die zwei Buttons im CTA-Block zeigen auf `mailto:leon@lvg.de`. **Kein Calendly-Link im Code** — Platzhalter. |
| „Carrd aufsetzen und launchen"                                   | ❌ Stattdessen handgebaute Single-HTML-Seite (keine Carrd-Abhängigkeit).                                  |

### 12.2 Copy 1:1
- Hero, Vertrauen, Leistungen, Über-Mich, Ablauf, CTA-Texte sind **wörtlich** aus `Website-Copy_Leon-Vincent.docx` übernommen (inkl. „Dein Budget verdient mehr"-System auf jeder Section).
- Kleine Ergänzungen, die **nicht** im Brief stehen:
  - **FAQ-Section** mit 6 Fragen (komplett neu — vom Brief nicht vorgesehen).
  - **Zertifikats-Badges** „Amazon Ads Certified — Sponsored Ads" und „… Amazon Marketing Cloud" mit aufklappbaren Beschreibungen. Bodies sind als **Platzhalter markiert** (`<span class="cert-note">Platzhaltertext — finale Beschreibung folgt.</span>`).
  - **Footer-Links** Impressum / Datenschutz mit `href="#"` (noch ohne Zielseite).
  - **Ablauf-Schritt 1** ist als unsichtbarer Link auf `#cta` ausgeführt — Brief sagt nichts dazu.

### 12.3 Designentscheidungen ohne Brief-Vorlage
Diese Aspekte sind im Brief nicht vorgegeben und wurden frei gewählt:
- **Farbsystem** Paper-Weiß + Schwarz + Berggrün-Akzent (`#2d5f3f`).
- **Schrift-Pairing** Instrument Serif (italic für Akzente) + Inter.
- **Animierte Wellen** im Hintergrund (Akzent-Grün, mittels SVG + RAF morphing).
- **Noise + Vignette + Parallax + Scroll-Blur** als Atmosphären-Layer.
- **Bi-direktionales Reveal** anstelle eines einmaligen Einblenders.
- **Tweaks-Panel** für Hero-Feintuning (zur Laufzeit).

### 12.4 Offene Punkte (laut Brief)
> **Hinweis:** §12 beschreibt den ursprünglichen Briefing-Abgleich; die folgenden Punkte sind teils überholt — maßgeblich ist der Stand in `CLAUDE.md`.
- „Sobald erste eigene Kunden laufen, konkrete Ergebnisse nachträglich ergänzen." → derzeit nur agenturweite Zahlen (50+, 7-stellig, 100 %).
- Zertifikats-Badges: Beschreibungen vorhanden, finale Badge-**Bilder** noch ausstehend (siehe `CLAUDE.md` TODOs).
- ✅ Impressum- und Datenschutz-Seiten existieren und sind finalisiert (`impressum.html`, `datenschutz.html`).

---

## 13 · Reproduktions-Checkliste (kurz)

Damit eine neue Session diesen Stand exakt wiederherstellt:

1. `<html lang="de">`, Inter (300–500) + Instrument Serif (400 + 400 italic) **selbst gehostet** via `assets/fonts/fonts.css`.
2. `:root`-Variablen exakt wie in §2 setzen — Tweaks-Block überschreibt Hero-Variablen mit `0.56 / 0.44 / 8 vh / 0.6 px / true`.
3. Container 1240 px, Padding 64 px (28 px <900), `.section-pad` 112/80 px, Anchor-Offset 72 px.
4. Globale Layer in dieser Reihenfolge: `.wave-bg` (z 1) → `.noise` (z 2) → `<main>` (z 3) → `nav` (z 100).
5. Sections in exakt dieser Reihenfolge: Hero → Vertrauen → `<hr class="divider">` → Leistungen → Über-Mich → Ablauf → FAQ → CTA → Footer.
6. Reveal-IO mit `threshold 0.10`, `rootMargin 0 0 -8% 0`, **bi-direktional**.
7. Parallax-Skript: `intensity = (mob?0.08:0.12)*factor`, `cap 56/32 px`. Scroll-Blur +0.6 px (200 ms Timeout).
8. Wellen-RAF mit 4 Defs aus §6.3 — beide SVGs (`#wave1…4` und `#cwave1…4`) erhalten dasselbe `d` pro Frame.
9. Akkordeon-Komponenten (Cert-Badge + FAQ) verwenden **denselben Grid-Rows-Trick** (0fr → 1fr, 0.70 s cubic-bezier(0.22,1,0.36,1)) — nicht `max-height`.
10. Buttons immer `border-radius: 7px`, Hover `scale(1.04)`.
11. `prefers-reduced-motion` schaltet alle Übergänge auf 0.01 ms — implementieren.
