const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  PageBreak, AlignmentType, BorderStyle, WidthType, ShadingType,
  HeadingLevel, Header, Footer, PageNumber, UnderlineType,
  LevelFormat, ExternalHyperlink
} = require('C:/Users/Leon/workspace-lvg/projects/website-main/node_modules/docx');
const fs = require('fs');

// ─── Farben ────────────────────────────────────────────────────────────────
const BG        = "0e1117";   // Seitenhintergrund
const BG_CARD   = "131820";   // Karten-Hintergrund
const BG_ELEV   = "1a2030";   // Erhöhte Karten
const TEXT      = "f0f0f0";   // Haupttext
const TEXT_SOFT = "a0a8b0";   // Sekundärtext
const TEXT_MUTED= "606878";   // Gedämpfter Text
const ACCENT    = "22c55e";   // Grün
const ORANGE    = "FF9900";   // Data-Orange
const BORDER_C  = "1e2a3a";   // Rahmenfarbe

// ─── Seiten-Einstellungen (A4 in DXA) ─────────────────────────────────────
const PAGE_W = 11906;
const PAGE_H = 16838;
const MARGIN = 1134; // ~2cm
const CONTENT_W = PAGE_W - MARGIN * 2;

// ─── Hilfsfunktionen ───────────────────────────────────────────────────────
const txt = (text, opts = {}) => new TextRun({
  text,
  color: opts.color || TEXT,
  bold: opts.bold || false,
  size: opts.size || 22,
  font: opts.font || "Arial",
  italics: opts.italics || false,
  ...opts
});

const para = (children, opts = {}) => new Paragraph({
  children: Array.isArray(children) ? children : [children],
  spacing: { before: opts.before || 0, after: opts.after || 120 },
  shading: opts.bg ? { fill: opts.bg, type: ShadingType.CLEAR } : undefined,
  indent: opts.indent ? { left: opts.indent } : undefined,
  alignment: opts.align || AlignmentType.LEFT,
  ...opts
});

const h1 = (text, accentPart = "") => new Paragraph({
  children: [
    txt(text, { bold: true, size: 40, color: TEXT }),
    ...(accentPart ? [txt(accentPart, { bold: true, size: 40, color: ACCENT })] : []),
    txt(" ↗", { bold: true, size: 32, color: ACCENT }),
  ],
  spacing: { before: 200, after: 160 },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const h2 = (text) => new Paragraph({
  children: [txt(text, { bold: true, size: 28, color: TEXT })],
  spacing: { before: 280, after: 120 },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const eyebrow = (text) => new Paragraph({
  children: [txt(text.toUpperCase(), { size: 16, color: ACCENT, bold: true })],
  spacing: { before: 0, after: 80 },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const sectionLabel = (text) => new Paragraph({
  children: [txt("— " + text.toUpperCase(), { size: 16, color: TEXT_MUTED, bold: true })],
  spacing: { before: 240, after: 80 },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const bodyText = (text) => new Paragraph({
  children: [txt(text, { size: 20, color: TEXT_SOFT })],
  spacing: { before: 0, after: 120 },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const boldBodyText = (parts) => new Paragraph({
  children: parts.map(([t, bold]) => txt(t, { size: 20, color: bold ? TEXT : TEXT_SOFT, bold: !!bold })),
  spacing: { before: 0, after: 120 },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const pageBreak = () => new Paragraph({
  children: [new PageBreak()],
  shading: { fill: BG, type: ShadingType.CLEAR },
});

const fehlerTag = (n) => new Paragraph({
  children: [txt(`FEHLER ${n.toString().padStart(2,"0")} / 07`, { size: 16, color: ACCENT, bold: true })],
  spacing: { before: 0, after: 120 },
  shading: { fill: BG_CARD, type: ShadingType.CLEAR },
  border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C } },
});

// ─── Box-Elemente ─────────────────────────────────────────────────────────
const boxedParagraph = (label, labelColor, bgColor, lines) => {
  const border = { style: BorderStyle.SINGLE, size: 1, color: BORDER_C };
  return new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [
      new TableRow({ children: [
        new TableCell({
          borders: { top: border, bottom: border, left: { style: BorderStyle.SINGLE, size: 6, color: labelColor }, right: border },
          width: { size: CONTENT_W, type: WidthType.DXA },
          shading: { fill: bgColor, type: ShadingType.CLEAR },
          margins: { top: 120, bottom: 120, left: 180, right: 180 },
          children: [
            new Paragraph({
              children: [txt("↗  " + label.toUpperCase(), { size: 15, color: labelColor, bold: true })],
              spacing: { after: 80 },
            }),
            ...lines.map(line =>
              new Paragraph({
                children: typeof line === 'string'
                  ? [txt(line, { size: 19, color: TEXT_SOFT })]
                  : line,
                spacing: { after: 60 },
              })
            ),
          ],
        })
      ]})
    ]
  });
};

const beispielBox = (lines) => boxedParagraph("Beispiel aus dem Audit", ORANGE, BG_CARD, lines);
const bonusBox    = (lines) => boxedParagraph("Bonus-Tipp", ACCENT, BG_ELEV, lines);

// ─── Nummerierte / Bullet-Listen ───────────────────────────────────────────
const listItem = (text, num = null) => new Paragraph({
  children: [
    txt(num !== null ? `${num}.  ` : "↗  ", { color: ACCENT, bold: true, size: 20 }),
    txt(text, { size: 20, color: TEXT_SOFT }),
  ],
  spacing: { before: 60, after: 60 },
  shading: { fill: BG, type: ShadingType.CLEAR },
  indent: { left: 360 },
});

// ─── Footer ────────────────────────────────────────────────────────────────
const makeFooter = (pageNum) => new Footer({
  children: [
    new Paragraph({
      children: [
        txt(String(pageNum).padStart(2, "0"), { size: 18, color: TEXT_MUTED }),
        txt("          lvg-ppc.de", { size: 18, color: TEXT_SOFT, bold: true }),
      ],
      border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C } },
    })
  ]
});

// ─── Divider ───────────────────────────────────────────────────────────────
const divider = () => new Paragraph({
  children: [],
  spacing: { before: 160, after: 160 },
  border: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C } },
  shading: { fill: BG, type: ShadingType.CLEAR },
});

// ─── Seiten-Eigenschaften ─────────────────────────────────────────────────
const pageProps = {
  page: {
    size: { width: PAGE_W, height: PAGE_H },
    margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
    pageNumbers: { start: 1 },
  },
};

const makeSectionProps = (pageNum) => ({
  ...pageProps,
  footers: { default: makeFooter(pageNum) },
  properties: {
    ...pageProps,
    background: { color: BG },
  },
});

// ─── Inhalte ───────────────────────────────────────────────────────────────

// SEITE 1: COVER
const cover = [
  new Paragraph({
    children: [txt("LVG PPC", { size: 72, bold: true, color: TEXT, font: "Arial" })],
    spacing: { before: 0, after: 80 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Paragraph({
    children: [txt("Amazon PPC Spezialist · Berlin", { size: 22, color: ACCENT })],
    spacing: { before: 0, after: 320 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Paragraph({
    children: [txt("Amazon PPC · Checkliste 2026", { size: 18, color: ACCENT, bold: true })],
    spacing: { before: 0, after: 200 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Paragraph({
    children: [
      txt("7", { size: 80, bold: true, color: ACCENT }),
      txt(" Amazon PPC-Fehler, die dich jeden Monat ", { size: 56, bold: true, color: TEXT }),
      txt("4-stellig", { size: 56, bold: true, color: ACCENT }),
      txt(" kosten. ↗", { size: 56, bold: true, color: ACCENT }),
    ],
    spacing: { before: 0, after: 240 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Paragraph({
    children: [txt("Eine ehrliche Checkliste für Brands mit 5.000 bis 30.000 Euro Ad Spend pro Monat. Keine Theorie. Keine Tool-Werbung. Nur die Fehler, die in echten Konten Geld verbrennen.", { size: 22, color: TEXT_SOFT })],
    spacing: { before: 0, after: 400 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [Math.floor(CONTENT_W/3), Math.floor(CONTENT_W/3), CONTENT_W - Math.floor(CONTENT_W/3)*2],
    rows: [new TableRow({ children: [
      ...[
        ["100+", "Accounts in DE, UK, IT, ES, FR, NL, US, CA betreut"],
        ["5+ Jahre", "Senior PPC Manager Erfahrung, ehemals Agentur"],
        ["2×", "Amazon Ads Certified: Sponsored Ads Advanced + AMC"],
      ].map(([num, label]) => new TableCell({
        borders: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C }, bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C }, left: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C }, right: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C } },
        width: { size: Math.floor(CONTENT_W/3), type: WidthType.DXA },
        shading: { fill: BG_CARD, type: ShadingType.CLEAR },
        margins: { top: 160, bottom: 160, left: 200, right: 200 },
        children: [
          new Paragraph({ children: [txt(num, { size: 36, bold: true, color: ACCENT })], spacing: { after: 60 } }),
          new Paragraph({ children: [txt(label, { size: 17, color: TEXT_SOFT })], spacing: { after: 0 } }),
        ],
      }))
    ]})]
  }),
  new Paragraph({
    children: [],
    spacing: { before: 280, after: 80 },
    border: { top: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C } },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Paragraph({
    children: [
      txt("Leon-Vincent Gamradt", { size: 24, bold: true, color: TEXT }),
      txt("          Ausgabe Mai 2026", { size: 18, color: TEXT_MUTED }),
    ],
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  new Paragraph({
    children: [txt("Amazon PPC Spezialist · Berlin · lvg-ppc.de", { size: 18, color: TEXT_MUTED })],
    spacing: { after: 0 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
];

// SEITE 2: ÜBER MICH
const ueber = [
  eyebrow("Wer schreibt das hier?"),
  h1("Kurz zu mir, bevor du loslegst."),
  new Paragraph({
    children: [txt("Mein Name ist Leon-Vincent Gamradt. Ich bin Amazon PPC Spezialist aus Berlin und arbeite seit über fünf Jahren ausschließlich an Amazon-Werbekonten.", { size: 22, bold: true, color: TEXT })],
    spacing: { before: 0, after: 160 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  bodyText("Vor meiner Selbstständigkeit war ich bei einer der größten deutschen Amazon-Agenturen als Senior PPC Manager angestellt, dort habe ich über 100 Accounts in DE, UK, IT, ES, FR, NL, US und CA mitgesteuert. Mein Fokus liegt heute auf mittelständischen Marken zwischen 50.000 und 500.000 Euro Monatsumsatz auf Amazon, die ein echtes Sparring auf Augenhöhe wollen statt eines Junior-Managers in einer Agentur-Pipeline."),
  bodyText("Diese Checkliste basiert nicht auf Theorie aus einem Kurs. Jeder einzelne der sieben Fehler ist mir in den letzten Jahren in echten Konten begegnet, oft mehrfach pro Woche. Manche kosten 200 Euro im Monat, manche fünfstellige Beträge."),
  bodyText("Wenn du nach dem Lesen Fragen hast oder ein Audit deines Kontos willst, findest du den Link am Ende."),
  divider(),
  new Paragraph({
    children: [txt("Ein Wort zur Ehrlichkeit. Diese Checkliste ist nicht alles, was ich weiß. Aber sie ist alles, was du brauchst, um in deinem Konto den Großteil der Lücken zu finden. Wenn dir das reicht und du nichts weiter von mir hörst, ist das auch in Ordnung.", { size: 19, color: TEXT_MUTED, italics: true })],
    spacing: { before: 0, after: 0 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
];

// SEITE 3: WIE NUTZEN
const anleitung = [
  eyebrow("Anleitung"),
  h1("Wie du diese Checkliste nutzt."),
  sectionLabel("Lies sie nicht in einem Rutsch"),
  bodyText("Jedes Kapitel ist eigenständig. Mein Vorschlag: Du loggst dich in dein Seller Central ein, öffnest den Werbekonsole-Tab, und gehst Fehler für Fehler durch. Pro Fehler brauchst du 10 bis 20 Minuten, um zu prüfen, ob du betroffen bist."),
  sectionLabel("Am Ende: Quick-Diagnose-Bogen"),
  bodyText("Am Ende findest du einen Quick-Diagnose-Bogen mit allen sieben Fragen als reine Ja/Nein-Liste. Wenn du dort drei oder mehr \"Ja\" stehen hast, hast du wahrscheinlich eine vierstellige Spend-Lücke, die du in zwei bis vier Wochen schließen kannst."),
  sectionLabel("Kein Teaser, keine Hidden Sales"),
  bodyText("Diese Checkliste ist kein Teaser für irgendeinen Kurs. Es ist die Liste, die ich selbst nutze, wenn ich ein neues Konto übernehme. Wenn du sie ehrlich durchgehst, brauchst du mich für viele Sachen nicht."),
  new Paragraph({ children: [], spacing: { before: 160 }, shading: { fill: BG, type: ShadingType.CLEAR } }),
  bonusBox(["Fehler 1 (TACOS-Blick) → Fehler 3 (Negatives) → Fehler 4 (Auto-Harvesting). Das sind die drei größten Hebel für sofortige Einsparung. Die anderen vier baust du danach in den Wochen 2 bis 4 ein."]),
];

// FEHLER 1–7
const fehler = [
  {
    n: 1,
    title: "Du steuerst nur nach ", accent: "ACOS.",
    fehler: "Du optimierst dein Konto ausschließlich nach ACOS und schaust nie auf TACOS oder den Anteil deines organischen Umsatzes.",
    warum: "ACOS misst nur, wie effizient deine Werbung isoliert läuft. Er sagt dir nichts darüber, wie abhängig dein Business von bezahlter Werbung ist.",
    beispiel: ["Kunde im Bereich Haushaltswaren, ", ["12.000 Euro Spend", true], ", stabile 22 Prozent ACOS. TACOS bei 17 Prozent. Sobald die Kampagnen pausierten, brach der Umsatz um zwei Drittel ein."],
    erkennen: ["Kannst du aus dem Stand deinen TACOS der letzten 30 Tage nennen?", "Weißt du, welcher Prozentsatz deines Umsatzes über Ads kommt?", "Wenn du deine Kampagnen heute für eine Woche stoppen würdest, würdest du wissen, was passiert?"],
    beheben: ["Rechne deinen TACOS aus: Gesamter Ad Spend geteilt durch Gesamtumsatz (PPC + organisch).", "Tracke TACOS ab sofort monatlich. Steigender TACOS bei stabilem Umsatz ist ein Warnsignal.", "Definiere einen Ziel-ACOS aus deiner Marge, nicht aus dem Bauch."],
    bonus: ["Schau dir den ", ["Brand Purchase Share", true], " im Search Query Performance Report an. Wenn dein Anteil bei Brand-Keywords über 80 Prozent liegt, zahlst du wahrscheinlich für Klicks, die du organisch sowieso gewinnen würdest."],
  },
  {
    n: 2,
    title: "Brand- und Generic-Keywords in ", accent: "derselben Kampagne.",
    fehler: "Deine Brand-Keywords laufen im gleichen Topf wie deine Generic-Keywords. Beide kämpfen ums selbe Budget.",
    warum: "Brand-Keywords haben fast immer den niedrigsten ACOS im Konto. Wenn beide in derselben Kampagne laufen, fressen die Generic-Keywords morgens das Budget weg.",
    beispiel: ["Kunde im Bereich Tiernahrung, ", ["80 Euro Tagesbudget", true], " auf einer Mischkampagne. Budget regelmäßig um 16 Uhr erschöpft. Entgangener Umsatz: rund 2.400 Euro pro Monat."],
    erkennen: ["Gibt es in deinem Konto ein eigenes Portfolio nur für Brand-Keywords?", "Hast du den ACOS deiner Brand-Suchen separat im Blick?", "Sind deine Brand-Kampagnen vor 20 Uhr regelmäßig im Budget-Limit?"],
    beheben: ["Neues Portfolio anlegen: \"Brand Defense\".", "Neue SP-Exact-Kampagne nur für Brand-Keywords.", "Eigenes Tagesbudget, das niemals erschöpft sein darf. Faustregel: Tages-Spend auf Brand mal 2.", "Fixed Bids, niedrig (oft 0,30 bis 0,60 Euro).", "Optional eine SB-Kampagne als Banner-Schutz darüber."],
    bonus: ["Setze die generic Variante deiner Brand-Keywords als ", ["Negative Phrase", true], " in deinen Discovery-Kampagnen. Sonst harvesten deine Auto-Kampagnen weiterhin auf Brand-Begriffe."],
  },
  {
    n: 3,
    title: "Negative Keywords sind seit Monaten ", accent: "unberührt.",
    fehler: "Dein Suchbegriffs-Bericht zeigt seit Wochen dieselben irrelevanten Suchbegriffe, die Geld verbrennen, ohne jemals zu konvertieren.",
    warum: "Das ist der mit Abstand häufigste Fehler. Praktisch jedes Konto hat hier eine offene Flanke.",
    beispiel: ["Kunde mit ", ["8.000 Euro Spend", true], " hatte über 1.500 Euro pro Monat auf Suchbegriffen versenkt, die in 90 Tagen keinen einzigen Verkauf gebracht hatten. Drei Negative Phrase Keywords hätten das Problem in zwei Minuten gelöst."],
    erkennen: ["Wann hast du das letzte Mal den Search Term Report deiner Auto-Kampagnen heruntergeladen?", "Gibt es in deinem Konto eine Account-Level Negative Keyword List?", "Könntest du in 5 Minuten die Top-10-Suchbegriffe mit null Verkäufen ziehen?"],
    beheben: ["Werbekonsole → Reports → Search Term Report → letzte 30 Tage herunterladen.", "Excel-Filter: Klicks ≥ 3, Bestellungen = 0, Spend > Ziel-CPA mal 1,5.", "Offensichtlich irrelevante Begriffe als Negative Exact hinzufügen.", "Branchenausschlüsse als Account-Level Negative Keyword List.", "Routine alle 14 Tage wiederholen (dauert nach dem ersten Mal nur 15 Minuten)."],
    bonus: ["Wenn ein Keyword in deiner Exact-Kampagne gut performt, setze es als ", ["Negative Exact", true], " in alle anderen Kampagnen. Sonst kannibalisierst du dich selbst und treibst deinen eigenen CPC nach oben."],
  },
  {
    n: 4,
    title: "Deine Auto-Kampagne läuft seit 18 Monaten ", accent: "unverändert.",
    fehler: "Deine Auto-Kampagne wurde beim Launch gestartet und nie wieder angefasst.",
    warum: "Eine Auto-Kampagne ist eine Discovery-Engine, kein Dauerläufer. Du baust keinen Pool eigener Exact-Keywords auf, und der ACOS steigt schleichend.",
    beispiel: ["Kunde im Bereich Outdoor-Equipment, Auto-Kampagne seit zwei Jahren, ", ["60 Euro Tagesbudget", true], ". 14 profitable Keywords in eigene Kampagne gehoben: ACOS fiel von 41 auf 19 Prozent."],
    erkennen: ["Wie viele Exact-Kampagnen hast du im Verhältnis zu Auto-Kampagnen? (Gesund: 1 Auto, 3 bis 5 Exact pro Produkt.)", "Wann hast du das letzte Mal aus der Auto-Kampagne Keywords in eine Exact-Kampagne übernommen?", "Welche Begriffe haben in den letzten 30 Tagen mindestens 2 Conversions gebracht?"],
    beheben: ["Search Term Report der Auto-Kampagne (60 Tage) ziehen.", "Filter: Bestellungen ≥ 2, ACOS unter deinem Ziel.", "Diese Keywords in neue Exact-Kampagne. Startgebot: Suggested Bid minus 15 Prozent.", "Dieselben Keywords als Negative Exact in die Auto-Kampagne setzen.", "Routine: einmal pro Woche 20 Minuten Harvesting."],
    bonus: ["Splitte die Auto-Kampagne in ", ["vier separate Auto-Kampagnen", true], " mit je einer aktiven Targeting-Gruppe: Close Match, Loose Match, Substitutes, Complements."],
  },
  {
    n: 5,
    title: "Du bezahlst PPC für ein Listing, das ", accent: "nicht konvertiert.",
    fehler: "Dein Listing konvertiert unterdurchschnittlich, und statt das Listing zu fixen, drehst du an Geboten und Budgets.",
    warum: "Mehr Werbebudget rettet kein Listing, das schlecht konvertiert. Wenn deine CVR bei 5 Prozent liegt statt bei 12, zahlst du für jeden Verkauf mehr als doppelt so viel.",
    beispiel: ["Kunde im Bereich Küchenzubehör, ", ["ACOS von 48 Prozent", true], ". CVR bei 4,8 Prozent (Benchmark: 11 Prozent). Hauptbild getauscht, Bullets neu sortiert. CVR stieg auf 9,4 Prozent. ACOS fiel auf 26 Prozent. Ersparnis: 2.100 Euro pro Monat."],
    erkennen: ["Kennst du die Unit Session Percentage (CVR) deiner Hauptprodukte?", "Liegt sie über oder unter 10 Prozent?", "Search Query Performance Report: Hohe Click Share aber niedrige Cart Add Share → Bullets, Preis, Bewertungen."],
    beheben: ["CVR deiner Top-5-Listings aus Business Reports ziehen. Alles unter 8 Prozent = Alarm.", "Funnel-Gap-Diagnose mit Search Query Performance Report.", "Schwächsten Punkt zuerst: niedrige Click Share → Hauptbild/Titel/Preis.", "Veränderungen einzeln testen, nicht alles auf einmal."],
    bonus: ["Listing-Fix ist die ", ["höchste ROI-Maßnahme", true], " bei CVR unter 8 Prozent. Reihenfolge: Hauptbild, Titel, Bullets, A+ Content. Pro Änderung mindestens 7 Tage warten."],
  },
  {
    n: 6,
    title: "Match Types laufen wild ", accent: "durcheinander.",
    fehler: "Du hast dasselbe Keyword in Broad, Phrase und Exact, ohne Negative-Verknüpfung.",
    warum: "Wenn du Match Types vermischst ohne klare Trennung, bietest du gegen dich selbst und treibst den CPC hoch.",
    beispiel: ["Kunde im Bereich Beauty hatte \"Vitamin C Serum\" in ", ["9 Kampagnen", true], " in verschiedenen Match Types. CPC war 38 Prozent über Kategorie-Durchschnitt. Nach Bereinigung: CPC fiel um 22 Prozent, gleicher Umsatz."],
    erkennen: ["Hast du eine Bulk-Datei nach Keyword-Duplikaten gefiltert?", "Gibt es eine klare Trennung: Auto/Broad für Discovery, Phrase als Mittelweg, Exact für gewinnende Begriffe?", "Wie hoch ist der Anteil deines Spends auf Exact-Kampagnen? (Gesund: 30 bis 50 Prozent.)"],
    beheben: ["Bulk-Download aller aktiven Kampagnen. Spalte \"Keyword Text\" nach Duplikaten filtern.", "Pro Keyword entscheiden: in welcher Kampagne soll es laufen?", "In allen anderen Kampagnen: dasselbe Keyword als Negative Exact.", "Ziel: 20 bis 30 Prozent Auto/Broad, 30 bis 40 Prozent Phrase, 30 bis 50 Prozent Exact."],
    bonus: ["Für Top-Performer lohnt sich eine zweite Exact-Kampagne mit demselben Keyword, aber niedrigem ", ["Fixed Bid", true], " (rund 0,20 bis 0,30 Euro). ACOS oft 30 bis 50 Prozent unter der Hauptkampagne."],
  },
  {
    n: 7,
    title: "Dayparting und Budget-Pacing werden ", accent: "ignoriert.",
    fehler: "Dein Tagesbudget ist nachts um 3 Uhr morgens genauso aktiv wie abends um 20 Uhr.",
    warum: "Peak-Zeiten liegen abends zwischen 19 und 22 Uhr. Wenn du dein Budget gleichmäßig ausgibst, verbrennst du es in den schwachen Stunden.",
    beispiel: ["Kunde im Bereich Wellness, ", ["120 Euro Tagesbudget", true], ". Budget regelmäßig um 14:30 Uhr erschöpft. Conversion zwischen 18 und 23 Uhr: 14,8 Prozent gegen 6,2 Prozent im Tagesschnitt. Entgangener Umsatz: rund 3.200 Euro pro Monat."],
    erkennen: ["Top-3-Kampagnen → Spalte \"Budget verbraucht um...\". Steht dort etwas vor 18 Uhr, hast du das Problem.", "Hast du Saisonalität für deine Kategorie auf dem Schirm?", "Sind deine Budgets monatlich starr, oder hast du eine Saisonal-Logik?"],
    beheben: ["Betroffene Kampagnen: Budget 7 Tage verdoppeln und beobachten.", "Dayparting via Bulk Operations: morgens Gebote minus 20 Prozent, abends plus 15 bis 20 Prozent.", "Saisonal: für deine wichtigsten Peaks Budgets 4 Wochen vorher um 30 bis 50 Prozent hochfahren."],
    bonus: ["Nutze den ", ["Repeat Purchase Behavior Report", true], " in Brand Analytics. Berechne den Nachkauf-Zyklus und spiele Sponsored Display Remarketing im richtigen Zeitfenster aus. Niedriges Tagesbudget 5 bis 15 Euro."],
  },
];

const buildFehlerPage = (f) => [
  fehlerTag(f.n),
  new Paragraph({
    children: [
      txt(f.title, { bold: true, size: 40, color: TEXT }),
      txt(f.accent, { bold: true, size: 40, color: ACCENT }),
    ],
    spacing: { before: 80, after: 160 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
  sectionLabel("Der Fehler"),
  bodyText(f.fehler),
  sectionLabel("Warum er teuer ist"),
  bodyText(f.warum),
  new Paragraph({ children: [], spacing: { before: 80 }, shading: { fill: BG, type: ShadingType.CLEAR } }),
  beispielBox(f.beispiel.map(p => Array.isArray(p) ? [txt(p[0], { size: 19, color: p[1] ? TEXT : TEXT_SOFT, bold: !!p[1] })] : p)),
  sectionLabel("Wie du ihn erkennst"),
  ...f.erkennen.map(t => listItem(t)),
  sectionLabel("Wie du ihn behebst"),
  ...f.beheben.map((t, i) => listItem(t, i + 1)),
  new Paragraph({ children: [], spacing: { before: 80 }, shading: { fill: BG, type: ShadingType.CLEAR } }),
  bonusBox(f.bonus.map(p => Array.isArray(p) ? [txt(p[0], { size: 19, color: p[1] ? TEXT : TEXT_SOFT, bold: !!p[1] })] : p)),
];

// SEITE 11: QUICK-DIAGNOSE
const diagBorder = { style: BorderStyle.SINGLE, size: 1, color: BORDER_C };
const diagBorders = { top: diagBorder, bottom: diagBorder, left: diagBorder, right: diagBorder };

const diagRows = [
  ["1", "Ich kann meinen TACOS der letzten 30 Tage nicht aus dem Stand nennen."],
  ["2", "Meine Brand- und Generic-Keywords laufen in derselben Kampagne oder ohne eigenes Budget-Portfolio."],
  ["3", "Ich habe in den letzten 14 Tagen keinen Search Term Report ausgewertet."],
  ["4", "Meine Auto-Kampagne läuft seit über 6 Monaten ohne systematisches Keyword-Harvesting."],
  ["5", "Ich kenne die CVR meiner Top-5-Listings nicht oder sie liegt unter 8 Prozent."],
  ["6", "Ich habe nie eine Bulk-Datei nach Keyword-Duplikaten in verschiedenen Match Types gefiltert."],
  ["7", "Bei mindestens einer Kampagne ist das Tagesbudget regelmäßig vor 18 Uhr aufgebraucht."],
];

const colW = [400, CONTENT_W - 400 - 900 - 900, 900, 900];

const diagPage = [
  eyebrow("Quick-Diagnose-Bogen"),
  h1("Beantworte ehrlich. ", "Ja oder Nein."),
  bodyText("Drei oder mehr \"Ja\" bedeuten in den meisten Fällen eine vierstellige Spend-Lücke pro Monat. Bei fünf oder mehr ist ein Audit Pflicht."),
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: colW,
    rows: [
      new TableRow({
        tableHeader: true,
        children: [
          ["#", 0], ["Frage", 1], ["Ja", 2], ["Nein", 3]
        ].map(([label, i]) => new TableCell({
          borders: diagBorders,
          width: { size: colW[i], type: WidthType.DXA },
          shading: { fill: BG_CARD, type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [txt(label, { size: 17, color: TEXT_MUTED, bold: true })], alignment: AlignmentType.CENTER })],
        }))
      }),
      ...diagRows.map(([num, frage]) => new TableRow({ children: [
        new TableCell({ borders: diagBorders, width: { size: colW[0], type: WidthType.DXA }, shading: { fill: BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [txt(num, { size: 20, bold: true, color: ACCENT })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ borders: diagBorders, width: { size: colW[1], type: WidthType.DXA }, shading: { fill: BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [txt(frage, { size: 18, color: TEXT_SOFT })] })] }),
        new TableCell({ borders: diagBorders, width: { size: colW[2], type: WidthType.DXA }, shading: { fill: BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [txt("☐", { size: 20, color: TEXT_SOFT })], alignment: AlignmentType.CENTER })] }),
        new TableCell({ borders: diagBorders, width: { size: colW[3], type: WidthType.DXA }, shading: { fill: BG, type: ShadingType.CLEAR }, margins: { top: 80, bottom: 80, left: 120, right: 120 }, children: [new Paragraph({ children: [txt("☐", { size: 20, color: TEXT_SOFT })], alignment: AlignmentType.CENTER })] }),
      ]}))
    ]
  }),
  sectionLabel("Auswertung"),
  ...[ ["0 bis 2 Ja", "Dein Konto läuft solide. Sieh die offenen Punkte als Feintuning an.", ACCENT],
       ["3 bis 4 Ja", "Du verlierst monatlich vierstellig. Die Maßnahmen passieren nicht von alleine.", ORANGE],
       ["5 bis 7 Ja", "Dein Konto braucht ein systematisches Audit. Hier liegen 2.000 bis 8.000 Euro pro Monat brach.", "ef4444"],
  ].map(([range, desc, color]) => new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [1800, CONTENT_W - 1800],
    rows: [new TableRow({ children: [
      new TableCell({ borders: { top: diagBorder, bottom: diagBorder, right: diagBorder, left: { style: BorderStyle.SINGLE, size: 6, color } }, width: { size: 1800, type: WidthType.DXA }, shading: { fill: BG_CARD, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: [new Paragraph({ children: [txt(range, { size: 20, bold: true, color: TEXT })] })] }),
      new TableCell({ borders: { top: diagBorder, bottom: diagBorder, right: diagBorder, left: diagBorder }, width: { size: CONTENT_W - 1800, type: WidthType.DXA }, shading: { fill: BG_CARD, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: [new Paragraph({ children: [txt(desc, { size: 19, color: TEXT_SOFT })] })] }),
    ]})]
  })),
];

// SEITE 12: NÄCHSTE SCHRITTE
const schrittePage = [
  eyebrow("Was jetzt?"),
  h1("Deine nächsten ", "drei Schritte."),
  ...[
    ["1", "Heute, 30 Minuten.", "Sofort", "Geh in deine Werbekonsole. Lade den Search Term Report deiner umsatzstärksten Kampagne der letzten 30 Tage herunter. Filtere nach Klicks ≥ 3 und Bestellungen = 0. Die ersten 10 irrelevanten Begriffe fügst du als Negative Phrase oder Negative Exact hinzu."],
    ["2", "Diese Woche, 2 Stunden.", "7 Tage", "Geh die anderen sechs Fehler aus dieser Checkliste der Reihe nach durch. Pro Fehler 20 Minuten. Notiere, bei welchem du betroffen bist. Trag dir die Termine im Kalender ein, sonst passiert es nicht."],
    ["3", "Diesen Monat. Optional.", "30 Tage", "Wenn du merkst, dass dir die Zeit oder die Routine fehlt, melde dich. Ich biete ein 2-Stunden-Audit deines Kontos an, in dem ich die Top-3-Quick-Wins identifiziere."],
  ].map(([num, title, meta, desc]) => new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({
      borders: diagBorders,
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: BG_CARD, type: ShadingType.CLEAR },
      margins: { top: 140, bottom: 140, left: 200, right: 200 },
      children: [
        new Paragraph({ children: [txt(num, { size: 40, bold: true, color: ACCENT }), txt("  " + title, { size: 24, bold: true, color: TEXT }), txt("   " + meta.toUpperCase(), { size: 15, color: ACCENT, bold: true })], spacing: { after: 80 } }),
        new Paragraph({ children: [txt(desc, { size: 19, color: TEXT_SOFT })], spacing: { after: 0 } }),
      ],
    })]})],
  })),
  new Paragraph({ children: [], spacing: { before: 160 }, shading: { fill: BG, type: ShadingType.CLEAR } }),
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [CONTENT_W],
    rows: [new TableRow({ children: [new TableCell({
      borders: diagBorders,
      width: { size: CONTENT_W, type: WidthType.DXA },
      shading: { fill: "060810", type: ShadingType.CLEAR },
      margins: { top: 200, bottom: 200, left: 280, right: 280 },
      children: [
        new Paragraph({ children: [txt("Erstgespräch buchen. ", { size: 26, bold: true, color: TEXT }), txt("30 Min, kostenlos, kein Pitch.", { size: 26, bold: true, color: ACCENT })], spacing: { after: 100 } }),
        new Paragraph({ children: [txt("Über das Kontaktformular trägst du in 2 Minuten alle wichtigen Infos ein. Wenn du lieber direkt sprichst, buchst du dort auch einen Termin.", { size: 19, color: TEXT_SOFT })], spacing: { after: 140 } }),
        new Paragraph({ children: [
          new ExternalHyperlink({ link: "https://lvg-ppc.de/kontakt", children: [txt("Termin buchen ↗", { size: 20, bold: true, color: "071a0e" })] }),
          txt("     ", { size: 20, color: TEXT }),
          new ExternalHyperlink({ link: "https://lvg-ppc.de/kontakt", children: [txt("Formular ausfüllen", { size: 20, color: TEXT })] }),
        ], spacing: { after: 0 } }),
      ],
    })]})],
  }),
];

// SEITE 13: KONTAKT
const kontaktPage = [
  eyebrow("Über lvg-ppc.de"),
  h1("Wer ich bin. ", "Was ich mache."),
  sectionLabel("Wer ich bin"),
  bodyText("Leon-Vincent Gamradt, Amazon PPC Spezialist aus Berlin. Über 5 Jahre Erfahrung, ehemals Senior PPC Manager bei einer großen deutschen Amazon-Agentur, heute selbstständig. Zertifiziert für Amazon Sponsored Ads Advanced und Amazon Marketing Cloud."),
  sectionLabel("Was ich mache"),
  bodyText("Ich übernehme als externer PPC-Lead die Verantwortung für dein Amazon-Werbekonto. Kein Junior in einer Agentur-Pipeline, kein Tool-Output ohne Kontext. Direkter Draht, monatliches Reporting, Quarterly Business Reviews."),
  sectionLabel("Kontakt"),
  new Table({
    width: { size: CONTENT_W, type: WidthType.DXA },
    columnWidths: [2000, CONTENT_W - 2000],
    rows: [
      [["Website", "https://lvg-ppc.de", "lvg-ppc.de"],
       ["E-Mail", "mailto:l.gamradt@lvg-ppc.de", "l.gamradt@lvg-ppc.de"],
       ["LinkedIn", "https://www.linkedin.com/in/leon-vincent-gamradt", "linkedin.com/in/leon-vincent-gamradt"],
       ["Termin & Formular", "https://lvg-ppc.de/kontakt", "lvg-ppc.de/kontakt"],
       ["Standort", null, "Berlin, Deutschland"],
      ].map(([label, link, value]) => new TableRow({ children: [
        new TableCell({ borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, width: { size: 2000, type: WidthType.DXA }, shading: { fill: BG_CARD, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: [new Paragraph({ children: [txt(label.toUpperCase(), { size: 16, color: TEXT_MUTED, bold: true })] })] }),
        new TableCell({ borders: { bottom: { style: BorderStyle.SINGLE, size: 1, color: BORDER_C }, top: { style: BorderStyle.NONE }, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } }, width: { size: CONTENT_W - 2000, type: WidthType.DXA }, shading: { fill: BG_CARD, type: ShadingType.CLEAR }, margins: { top: 100, bottom: 100, left: 160, right: 160 }, children: [new Paragraph({ children: link ? [new ExternalHyperlink({ link, children: [txt(value, { size: 20, color: ACCENT, bold: true })] })] : [txt(value, { size: 20, color: TEXT, bold: true })] })] }),
      ]}))[0]
    ]
  }),
  divider(),
  bodyText("In den nächsten Tagen bekommst du von mir vier weitere E-Mails: Eine zur TACOS-Berechnung mit Excel-Vorlage, eine Case Study aus einem realen Audit, einen Profi-Tipp zu Placement-Modifiern, und am Ende ein lockeres Angebot für ein Erstgespräch."),
  bodyText("Danke, dass du bis hier gelesen hast. Wenn die Checkliste dir etwas gebracht hat, freue ich mich über eine kurze Antwort per E-Mail."),
  new Paragraph({
    children: [txt("Leon ↗", { size: 32, bold: true, color: ACCENT })],
    spacing: { before: 240, after: 0 },
    shading: { fill: BG, type: ShadingType.CLEAR },
  }),
];

// ─── Dokument zusammenbauen ────────────────────────────────────────────────
const bgShading = { type: ShadingType.CLEAR, color: BG, fill: BG };

const makeSec = (children, pageNum) => ({
  properties: {
    page: {
      size: { width: PAGE_W, height: PAGE_H },
      margin: { top: MARGIN, bottom: MARGIN + 400, left: MARGIN, right: MARGIN },
    },
  },
  footers: { default: makeFooter(pageNum) },
  children: children.map(c => {
    // Hintergrundfarbe auf alle Paragraphen erzwingen
    if (c instanceof Paragraph && !c.properties?.shading) {
      c.properties = c.properties || {};
      c.properties.shading = bgShading;
    }
    return c;
  }),
});

const doc = new Document({
  background: { color: BG },
  sections: [
    makeSec(cover, 1),
    makeSec(ueber, 2),
    makeSec(anleitung, 3),
    ...fehler.map((f, i) => makeSec(buildFehlerPage(f), i + 4)),
    makeSec(diagPage, 11),
    makeSec(schrittePage, 12),
    makeSec(kontaktPage, 13),
  ],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("C:/Users/Leon/Downloads/7-Amazon-PPC-Fehler.docx", buf);
  console.log("Fertig: C:/Users/Leon/Downloads/7-Amazon-PPC-Fehler.docx");
}).catch(console.error);
