#!/usr/bin/env python3
"""Erzeugt die BidWolf-Logo-SVGs (Icon + Primary-Lockup) aus einer einzigen
Parameterquelle. Wolf-Pfad + eingebetteter Font stammen aus den vorhandenen
Assets. Nach Anpassung von DIAMOND_RATIO / GAP neu ausfuehren.
"""
import re, pathlib

HERE = pathlib.Path(__file__).parent

# --- Wolfspfad (aus dem Report-Logo, Rohkoordinaten) ---
WOLF = ("M 350 153 L 301 407 L 297 407 L 295 360 L 292 357 L 157 481 L 157 484 "
        "L 229 485 L 166 584 L 165 589 L 438 870 L 442 870 L 562 656 L 701 656 "
        "L 702 690 L 705 691 L 761 649 L 762 646 L 737 646 L 722 664 L 717 667 "
        "L 714 642 L 592 615 L 484 662 L 480 661 L 481 658 L 586 593 L 732 630 "
        "L 787 629 L 867 552 L 867 549 L 675 456 L 668 447 L 622 364 L 467 306 "
        "L 365 170 Z M 537 437 L 590 436 L 615 470 L 571 467 L 538 440 Z "
        "M 371 239 L 432 328 L 432 331 L 350 390 L 349 382 L 367 240 Z")
WOLF_MINX, WOLF_MINY, WOLF_MAXX, WOLF_MAXY = 157, 153, 867, 870
WOLF_W = WOLF_MAXX - WOLF_MINX          # 710
WOLF_H = WOLF_MAXY - WOLF_MINY          # 717
WOLF_CX = (WOLF_MINX + WOLF_MAXX) / 2   # 512
WOLF_CY = (WOLF_MINY + WOLF_MAXY) / 2   # 511.5
GREEN = "#22c55e"

# --- Wortmarke ---
TEXT = "BidWolf"
FONT_SIZE = 110
BASELINE = 155
LETTER_SPACING = -2
TEXT_WIDTH = 431          # gemessene Laufweite aus logo-wordmark.svg
CAP_RATIO = 0.70         # Versalhoehe / font-size (Space Grotesk)
CAP = CAP_RATIO * FONT_SIZE
CAP_TOP = BASELINE - CAP
CAP_MID = (CAP_TOP + BASELINE) / 2

# --- STELLSCHRAUBEN ---
DIAMOND_RATIO = 1.28     # Diamant-Hoehe / Versalhoehe  (Variante B, an Canva-Bild ausgerichtet)
# Abstand Wolf-rechts -> Text-links. Metrisch enger als die Faustregel (eine
# Buchstabenbreite), weil die Schnauze spitz nach rechts auslaeuft: gemessen ab
# der Spitze wirkt jeder Abstand optisch groesser, als er ist.
GAP = 20
PAD = 8                  # viewBox-Rand
TEXT_FILL = "#f0f0f0"    # helle Schrift (dunkle Website)

# Font-defs aus vorhandenem Wordmark ziehen
wm = (HERE / "logo-wordmark.svg").read_text(encoding="utf-8")
DEFS = re.search(r"<defs>.*?</defs>", wm, re.S).group(0)


def fmt(v):
    return f"{v:.3f}".rstrip("0").rstrip(".")


def lockup_svg(text_fill, label):
    """Baut das Lockup (Wolf links, Wortmarke rechts) mit tightem viewBox."""
    diamond_h = DIAMOND_RATIO * CAP
    s = diamond_h / WOLF_H
    wolf_w = WOLF_W * s
    tx = -s * WOLF_MINX                  # linke Kante -> x=0
    ty = CAP_MID - s * WOLF_CY           # vertikal auf Cap-Mitte zentriert
    text_x = wolf_w + GAP

    wolf_top = CAP_MID - diamond_h / 2
    wolf_bot = CAP_MID + diamond_h / 2
    top = min(wolf_top, CAP_TOP)
    bot = max(wolf_bot, BASELINE)
    right = text_x + TEXT_WIDTH
    vb = f"{fmt(-PAD)} {fmt(top-PAD)} {fmt(right+2*PAD)} {fmt(bot-top+2*PAD)}"

    svg = f'''<svg viewBox="{vb}" xmlns="http://www.w3.org/2000/svg" aria-label="{label}">
  {DEFS}
  <g transform="translate({fmt(tx)},{fmt(ty)}) scale({fmt(s)})">
    <path fill="{GREEN}" fill-rule="evenodd" d="{WOLF}"/>
  </g>
  <text x="{fmt(text_x)}" y="{BASELINE}" font-family="Space Grotesk, sans-serif" font-weight="700" font-size="{FONT_SIZE}" fill="{text_fill}" letter-spacing="{LETTER_SPACING}">{TEXT}</text>
</svg>
'''
    return svg, vb, s, diamond_h, text_x


def build_primary():
    svg, vb, s, dh, tx = lockup_svg(TEXT_FILL, "BidWolf Primary Logo")
    (HERE / "logo-primary.svg").write_text(svg, encoding="utf-8")
    print(f"primary: s={fmt(s)} diamond_h={fmt(dh)} cap={fmt(CAP)} text_x={fmt(tx)} viewBox='{vb}'")


def build_report():
    # Report laeuft auf weissem Grund -> dunkle Schrift (Design-Token --text)
    svg, vb, s, dh, tx = lockup_svg("#16202c", "BidWolf")
    (HERE / ".." / ".." / "amazon-ads-reporting" / "vorlage" / "logo.svg").write_text(svg, encoding="utf-8")
    print(f"report:  dunkle Schrift, viewBox='{vb}'")


def build_email_master():
    # dunkle Schrift, fuer Raster-Export (E-Mail-Signatur auf hellem Grund)
    svg, vb, s, dh, tx = lockup_svg("#16202c", "BidWolf")
    (HERE / "_email-master.svg").write_text(svg, encoding="utf-8")
    print(f"email-master: viewBox='{vb}'")


def build_icon():
    pad = 44
    side = WOLF_H + 2 * pad
    tx = side / 2 - WOLF_CX
    ty = side / 2 - WOLF_CY
    svg = f'''<svg viewBox="0 0 {fmt(side)} {fmt(side)}" xmlns="http://www.w3.org/2000/svg" aria-label="BidWolf Icon">
  <g transform="translate({fmt(tx)},{fmt(ty)})">
    <path fill="{GREEN}" fill-rule="evenodd" d="{WOLF}"/>
  </g>
</svg>
'''
    (HERE / "logo-icon.svg").write_text(svg, encoding="utf-8")
    (HERE / "logo-favicon.svg").write_text(svg, encoding="utf-8")
    print(f"icon+favicon: side={fmt(side)}")


if __name__ == "__main__":
    build_primary()
    build_icon()
    build_report()
    build_email_master()
