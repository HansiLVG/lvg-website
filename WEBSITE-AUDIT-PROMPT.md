# Website Audit: lvg-ppc.de — Vollständiger Conversion & Design Audit

## Deine Aufgabe
Führe einen strukturierten, kritischen Audit der Website von Leon-Vincent Gamradt (lvg-ppc.de) durch. 
Das Ziel: herausfinden ob das aktuelle Design und die aktuelle Kommunikation für die Zielgruppe 
maximal optimiert sind — oder ob ein Neuaufbau sinnvoller wäre.
Leon ist bereit, die Website komplett neu aufzusetzen wenn nötig.

---

## Schritt 1: Kontext lesen (alles, bevor Du analysierst)

Lies diese Dateien in dieser Reihenfolge:

### Zielgruppe & Positionierung (Second Brain)
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\03 Wissen\` — suche nach Notizen zu 
  "Zielgruppe", "Positionierung", "ICP", "Wunschkunde" oder ähnlichem
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\02 Kunden\Kunden.md` — wer sind aktuelle Kunden?
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\04 Projekte\Website lvg-ppc.de.md` — 
  Projektkontext und Ziele

### Wissensbasis (Dein Bewertungsrahmen)
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\03 Wissen\Webdesign\Freelancer-Website-Pattern.md`
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\03 Wissen\Webdesign\Conversion-Optimierung.md`
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\03 Wissen\Webdesign\Core Web Vitals.md`
- `C:\Users\Leon\workspace-lvg\🧠 second-brain\03 Wissen\Webdesign\Typografie & Farb-System.md`

### Website-Dateien
- `C:\Users\Leon\workspace-lvg\projects\website-main\DESIGN-SYSTEM.md`
- `C:\Users\Leon\workspace-lvg\projects\website-main\index.html` (vollständig lesen)
- `C:\Users\Leon\workspace-lvg\projects\website-main\ueber-mich.html`
- `C:\Users\Leon\workspace-lvg\projects\website-main\account-audit.html`
- `C:\Users\Leon\workspace-lvg\projects\website-main\strategie-aufbau.html`
- `C:\Users\Leon\workspace-lvg\projects\website-main\kampagnen-management.html`

---

## Schritt 2: Audit nach diesen 6 Dimensionen

Bewerte jede Dimension mit **Score 1–10** + konkreter Begründung + spezifischen Beispielen 
aus dem Code (Zeilen-Referenzen).

### A. Zielgruppen-Fit (Gewichtung: 30%)
- Spricht die Website die Zielgruppe aus dem Second Brain direkt und spezifisch an?
- Werden deren konkreten Schmerzpunkte benannt (nicht generisch "ACOS senken", 
  sondern spezifische Situationen)?
- Tonalität: Passt sie zu dem Entscheider-Typ den wir ansprechen wollen 
  (Startup-Founder vs. etablierter Brand-Owner vs. Agentur)?
- Welche Aussagen klingen nach "jeder Freelancer sagt das" und welche sind spezifisch für Leon?

### B. Conversion-Optimierung (Gewichtung: 25%)
Vergleiche Sektion für Sektion mit dem `Freelancer-Website-Pattern.md`:
- Hero-Headline: Ist sie zielgruppen-spezifisch, outcome-fokussiert, nicht generisch?
- Seitenstruktur: Folgt sie dem bewährten Pattern (Problem → Lösung → Prozess → 
  Social Proof → FAQ → CTA)?
- CTA-Qualität: Text, Platzierung, Sichtbarkeit auf Mobile
- Social Proof: Wie spezifisch und glaubwürdig (Zahlen, Namen, Ergebnisse)?
- Einwand-Handling: Werden die 5 häufigsten Kaufhindernisse adressiert?
- Gibt es Conversion-Killer aus der `Conversion-Optimierung.md`?

### C. Design & visuelle Identität (Gewichtung: 20%)
- Wirkt das aktuelle Design (monochrom Paper/Ink + Waldgrün, Instrument Serif) 
  premium und vertrauenswürdig für B2B-Entscheider im E-Commerce-Bereich?
- Ist die visuelle Hierarchie auf jeder Seite klar (was ist H1, was ist unterstützend)?
- Setzt das Grün die richtigen Akzente oder ist es zu zurückhaltend/zu dominant?
- Würde die Zielgruppe dieses Design als "professionell und seriös" einordnen?

### D. Performance & Core Web Vitals (Gewichtung: 15%)
Aktuell: Lighthouse Desktop 96 / Mobile 74.
- Analysiere anhand des HTML-Codes: Was sind die wahrscheinlichen Ursachen für Mobile 74?
  (Hero-Bild, Wellen-Animationen, JS-Größe, Font-Loading?)
- Welche konkreten Code-Änderungen würden den Mobile-Score auf 85+ bringen?
- Gibt es CLS-Risiken (Bilder ohne Dimensionen, FOUT)?

### E. Copy & Messaging (Gewichtung: 10%)
- Headline-Test: Würde jemand, der die erste Zeile liest, in 5 Sekunden verstehen 
  wer Leon ist, wem er hilft und was der Outcome ist?
- Welche Formulierungen sind zu generisch ("Experte", "leidenschaftlich", "nachhaltig")?
- Gibt es konkrete Zahlen, Ergebnisse, Beweise — oder nur Versprechen?
- Ist die Über-mich-Seite menschlich und glaubwürdig?

### F. SEO & Technisches (Gewichtung: 10% — nur wenn Zeit)
- Meta-Descriptions und Titles: Sind sie auf die Zielgruppe ausgerichtet?
- Structured Data (Schema.org) vorhanden und korrekt?
- Interne Verlinkungsstruktur zwischen Service-Seiten sinnvoll?

---

## Schritt 3: Verdict

Nach dem Audit entscheide klar zwischen zwei Pfaden:

### Option A: Optimieren (< 30% Änderungen)
Wenn: Grundstruktur und Design-Richtung stimmen, aber Copy/CTAs/Social Proof 
optimiert werden müssen.

→ Liefere: Priorisierte To-Do-Liste (P1/P2/P3), geschätzte Umsetzungszeit je Task

### Option B: Neu aufsetzen (grundlegende Neuausrichtung)
Wenn: Zielgruppen-Fit grundlegend fehlt, Struktur falsch, oder Design-Sprache 
nicht zur Zielgruppe passt.

→ Liefere:
- Begründung warum Neuaufbau sinnvoller als Patches
- Skizze der neuen Seitenstruktur (Sektionen, Reihenfolge)
- Empfehlung zur neuen Design-Sprache (Farbe, Typografie, Stimmung)
- Neue Headline-Varianten (3 Optionen)

---

## Output-Format

```
## Zielgruppen-Profil (aus Vault)
[Wer ist die Zielgruppe laut Wissensbasis]

## Score-Übersicht
| Dimension | Score | Kritischer Befund |
|---|---|---|
| Zielgruppen-Fit | X/10 | ... |
| Conversion | X/10 | ... |
| Design | X/10 | ... |
| Performance | X/10 | ... |
| Copy | X/10 | ... |
| SEO | X/10 | ... |
| **Gesamt** | **X/10** | |

## Top 5 kritische Findings
[Konkret, mit Zeilenreferenzen, nach Priorität]

## Verdict: [OPTIMIEREN / NEU AUFSETZEN]
[Begründung in 3–5 Sätzen]

## Nächste Schritte
[Konkrete, umsetzbare Liste]
```

---

## Wichtige Hinweise
- Sei kritisch. Leon ist bereit für radikale Änderungen — Schönreden hilft nicht.
- Referenziere konkret: "Zeile 47 in index.html: Die Headline..." statt allgemein.
- Wenn Zielgruppen-Notizen noch fehlen (andere Session noch nicht fertig): 
  Schreibe das Audit trotzdem auf Basis des erkennbaren Kontexts (Amazon PPC Freelancer, 
  Berlin, Start Juni 2026) und markiere Stellen mit [ZIELGRUPPE VALIDIEREN].
