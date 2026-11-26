---
name: Archie Editor
description: Download site for a free Mac app that writes and checks ArchieML in Google Docs.
colors:
  signal: "#d62e0b"
  paper: "#ffffff"
  ink: "#000000"
  ink-2: "#262626"
  muted: "#555555"
  app-bg: "#1c1c1a"
  app-panel: "#262624"
  app-text: "#ecebe6"
  app-muted: "#a3a198"
  app-line: "#3a3936"
  app-accent: "#7cc09a"
typography:
  display:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.4rem, 7.8vw, 7rem)"
    fontWeight: 900
    lineHeight: 0.94
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.25rem, 4.5vw, 4rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  lead:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.5rem, 2.25vw, 2rem)"
    fontWeight: 750
    lineHeight: 1.12
    letterSpacing: "-0.015em"
  title:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 750
    lineHeight: 1.2
    letterSpacing: "-0.008em"
  body:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  meta:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "0.8125rem"
    fontWeight: 700
    letterSpacing: "0.08em"
    fontVariation: "'wdth' 125"
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "13px"
    fontWeight: 600
rounded:
  none: "0px"
spacing:
  gutter: "16px"
  page-x: "20px"
  page-x-wide: "32px"
  row-gap: "56px"
  row-gap-wide: "80px"
  section-gap: "96px"
  section-gap-wide: "128px"
components:
  button-download:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "14px 20px"
  button-download-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-download-sm:
    backgroundColor: "{colors.signal}"
    textColor: "{colors.paper}"
    typography: "{typography.label}"
    rounded: "{rounded.none}"
    padding: "6px 12px"
  nav-link:
    textColor: "{colors.ink}"
    typography: "{typography.label}"
  nav-link-hover:
    textColor: "{colors.signal}"
  install-band:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.none}"
  app-window:
    backgroundColor: "{colors.app-bg}"
    textColor: "{colors.app-text}"
    rounded: "{rounded.app-window}"
---

# Design System: Archie Editor

## Overview

**Creative North Star: "The Swiss Poster"**

The site is an International-style poster for a Mac app: a strict 12-column grid, giant black Archivo set tight, pure white ground, pure black type and 4px black rules. It says plainly what the product is and then shows the product. Density is low; scale and rule weight do the organizing, not boxes.

Everything that belongs to the page is flat, square and black-and-white. The only soft objects are the app's own images: real dark-theme screenshots, close-up crops of them, and drawn dark-theme fragments and demo, each rounded and shadowed like a macOS window. That contrast (hard poster, soft product) is the system. One signal orange carries the download action and the promise line.

Confirmed rejections: soft SaaS gradients, card rows, themed costumes (a type-case world was built and rejected), and the earlier clean/light system-font look.

**Key Characteristics:**
- Strict 12-column grid; every block snaps to column spans.
- Archivo black (900) display at poster scale with negative tracking.
- Pure #fff / #000 with 4px black rules as the main structural device.
- One signal orange, for the download and the promise.
- Square page chrome; only app imagery is rounded and shadowed.
- Feature rows vary grid placement and crop so no two look alike.

## Colors

Pure black and white, one hot orange, and a quoted dark palette that belongs to the app, not the page.

### Primary
- **Signal Orange** (#d62e0b): the download button fill, the hero promise line ("Catch mistakes before they ship."), and the install step numerals. Also the interaction color: link hover text, the focus ring, text selection. White on it passes 4.5:1 (4.94:1), and it passes on white. It does not pass on black for small text (4.25:1), so on the black install band it is used only at numeral scale or as a fill.

### Neutral
- **Poster White** (#ffffff): the page ground and the text on the install band.
- **Poster Black** (#000000): all display and body type, the 4px rules, the 1px feature-row rules, and the inverted install band.
- **Body Graphite** (#262626): feature body copy, one step off black to soften long reading.
- **Footnote Grey** (#555555): version/size line, spec-list descriptions, footer secondary text (7.46:1 on white).

### App Palette (quoted, not page colors)
- **App Charcoal** (#1c1c1a), **App Panel** (#262624), **App Bone** (#ecebe6), **App Stone** (#a3a198), **App Seam** (#3a3936), **App Mint** (#7cc09a): Archie Editor's own dark-theme values, copied from the app's sidebar stylesheet. Used only inside the demo window and the drawn Preview/Publish fragments so they read as the real app.

### Named Rules
**The One Signal Rule.** Orange is the only hue on the page chrome. As a fill it appears only on the download button; as type only on the promise line and the install numerals. Never a tint, gradient, border or decoration.

**The Quoted Palette Rule.** App colors never leave the app imagery. Mint is the app's accent, not a second brand color.

## Typography

**Display Font:** Archivo Variable (with Helvetica Neue, Arial)
**Body Font:** Archivo Variable, medium/bold weights
**Label/Mono Font:** system mono (ui-monospace, SF Mono, Menlo), only inside app imagery

**Character:** One grotesque family in three voices: 900 for display, 750 for titles, 400 for reading, plus a wide cut (125%) for the uppercase header label.

### Hierarchy
Six steps (112 / 64 / 32 / 20 / 17 / 13), set as classes in website/src/index.css.
- **t-hero** (900, to 112px, 0.94, -0.03em): the headline only, broken "The Mac app / for ArchieML in / Google Docs."
- **t-section** (900, to 64px, 0.98, -0.025em): every section head.
- **t-lead** (750, to 32px): the orange promise line.
- **t-title** (750, 20px): feature, spec and step titles; wordmark.
- **t-body** (400, 17px, 1.5): all reading text, measure at most 38rem.
- **t-meta** (400, 13px) and **t-label** (700, 13px, wide, uppercase, tracked).

### Named Rules
**The Six Steps Rule.** No sizes outside the scale on page chrome.

**The Open Display Rule.** Never track display tighter than -0.03em or lead it under 0.94; words and descenders must not touch.

**The One Family Rule.** Archivo carries the whole page. Mono appears only where code or the app appears.

## Layout

A 12-column grid (16px gutter) inside a 1280px max container with 20px side padding (32px from 640px). Every section, header and footer uses the same grid; nested blocks re-declare 12 columns so spans stay aligned.

- **Folio strip:** sticky header closed by a 1px rule.
- **Hero:** headline; 1px rule; promise (4) / pitch (5) / download (3); then a caption (3) beside a flat close-up of the Issues list catching two mistakes (9). Phones get a tighter crop.
- **Features:** the working demo, then one ruled row per feature (title 4 cols, body 8). Hovering a row or a part outlines it and shows a label.
- **Also in the box:** two columns of ruled rows, each with a 96x56 ruled box drawn in one style.
- **Install band:** full-bleed black; four steps under 1px white rules; orange step number inline with its title.
- **Rules:** 4px only to open a section; 1px everywhere else.

## Elevation & Depth

Flat throughout. The app is quoted with a 1px black edge; no shadows.

## Shapes

Square page chrome and square app frames. Radius survives only inside the drawn app UI itself.

## Components

### Buttons
Blunt and loud: a square orange block.
- **Shape:** square (0px).
- **Download (large):** signal fill, white 16px bold text, download icon at 20px, 14px 20px padding. Used in the hero and the install band.
- **Download (small):** same block at 14px text, 6px 12px padding, in the folio strip; label shortens to "Download" on mobile.
- **Hover / Focus:** fill turns black (color transition); focus is the global 3px orange ring.
- There is no secondary button. Secondary actions are bold underlined text links (4px underline offset) that turn orange on hover.

### Navigation
Folio strip: app icon and name in 900 weight, a centered uppercase bold subject line ("ArchieML · Google Docs · macOS") from 640px, then bold 14px links (Features and Install from 1024px, GitHub with icon) and the small download. Links are black, orange on hover. Background is 95% white with a blur so the 4px rule stays crisp over scrolled content.

### Section Head
A 4px black rule, then a headline across 8 columns and an optional 4-column body aside.

### App Imagery (signature)
A real dark-theme close-up (provenance in website/public/screens/PROVENANCE.md) and a working demo in the app's quoted palette, both with a flat 1px edge. On phones the demo shows the doc first, then the sidebar.

## Do's and Don'ts

### Do:
- **Do** use only the six type steps and snap blocks to the 12-column grid.
- **Do** keep 4px rules for section openings.
- **Do** keep orange to the download, the promise line, step numbers and interaction states.
- **Do** record screenshot provenance.

### Don't:
- **Don't** set body text above weight 400 or titles at 900.
- **Don't** round or shadow page chrome or app frames.
- **Don't** show the same view of the app twice.
- **Don't** add a second accent hue, gradients or tinted panels.
