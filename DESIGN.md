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
    fontSize: "clamp(2.9rem, 8.4vw, 8.2rem)"
    fontWeight: 900
    lineHeight: 0.86
    letterSpacing: "-0.055em"
  headline:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(2.2rem, 5vw, 4.5rem)"
    fontWeight: 900
    lineHeight: 0.9
    letterSpacing: "-0.05em"
  title:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.6rem, 2.8vw, 2.4rem)"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.04em"
  promise:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "clamp(1.6rem, 2.6vw, 2.1rem)"
    fontWeight: 900
    lineHeight: 1.25
    letterSpacing: "-0.035em"
  numeral:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "3.75rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.05em"
    fontFeature: "tnum"
  lead:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 500
    lineHeight: 1.375
  body:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 500
    lineHeight: 1.375
  body-sm:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
    lineHeight: 1.375
  label:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  caption:
    fontFamily: "Archivo Variable, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  mono:
    fontFamily: "ui-monospace, SF Mono, Menlo, monospace"
    fontSize: "12.5px"
    fontWeight: 600
rounded:
  none: "0px"
  app-window: "12px"
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

**Character:** One grotesque family doing everything, from 900-weight poster headlines down to 500-weight captions. Tight leading and negative tracking at large sizes; body stays medium weight so it holds up against the black display.

### Hierarchy
- **Display** (900, clamp(2.9rem, 8.4vw, 8.2rem), 0.86): the hero headline only, spanning all 12 columns. Oversized on purpose: it is the poster.
- **Headline** (900, clamp(2.2rem, 5vw, 4.5rem), 0.9): section heads ("Everything an ArchieML doc needs.", "Try it here.", "Install in a minute.").
- **Title** (900, clamp(1.6rem, 2.8vw, 2.4rem), 0.98): feature row titles.
- **Promise** (900, clamp(1.6rem, 2.6vw, 2.1rem), tight, signal orange): the single promise line under the hero rule.
- **Numeral** (900, 3.75rem, 1, tabular): install step numbers.
- **Lead** (500, 1.125rem, 1.375): hero pitch and section-head asides.
- **Body** (500, 17px, 1.375, max ~24rem): feature descriptions.
- **Body-sm** (500, 15px): spec-list descriptions; spec-list terms are 18px 900.
- **Label** (700, 14px): nav links, download button (16px on the large button), footer links.
- **Caption** (500, 13px, grey): version, size, architecture line.

### Named Rules
**The Black Weight Rule.** Every heading is weight 900 with negative tracking (-0.02em to -0.055em, tighter as size grows). No light or regular display weights.

**The One Family Rule.** Archivo carries the whole page. Mono appears only where the app itself shows code.

## Layout

A 12-column grid (16px gutter) inside a 1280px max container with 20px side padding (32px from 640px). Every section, header and footer uses the same grid; nested blocks re-declare 12 columns so spans stay aligned.

- **Folio strip:** sticky header, 4-col name / 4-col subject line / 4-col nav, closed by a full-width 4px black rule.
- **Hero:** 12-col headline; a 4px rule; then promise (5 cols) / pitch (4) / download (3); the screenshot below spans 11 then 10 centered columns.
- **Feature rows:** each row opens with a 1px black rule and places text (4 cols) and close-up (4 to 8 cols) differently: text-left or text-right, art narrow or wide, offset starts. No two rows share a placement.
- **Spec list:** 6 short items, 2 per row on mobile, 3 at md, 6 across at lg.
- **Install band:** full-bleed black; four steps in 3-column spans at lg, each topped by a 4px white rule.
- **Rhythm:** sections 96px apart (128px from 640px); feature rows 56px (80px). Everything collapses to 12-col full width on mobile.

## Elevation & Depth

The page is flat. Depth exists only in the app imagery, where it mimics a macOS window.

### Shadow Vocabulary
- **App window** (`box-shadow: 0 0 0 1px rgb(0 0 0 / 0.12), 0 24px 60px -20px rgb(0 0 0 / 0.35)`): the interactive demo window.
- **App fragment** (`box-shadow: 0 24px 40px rgb(17 19 18 / 0.18)`): the drawn Preview and Publish fragments.

### Named Rules
**The Flat Poster Rule.** Page chrome never casts a shadow. Rules and inversion, not elevation, separate content.

## Shapes

Square everywhere on the page: buttons, bands, rules, focus ring (3px orange outline, 3px offset). The 12px window radius belongs to app imagery only (demo window, fragments, and the corners drawn into the screenshots). Rules come in two weights: 4px for section and folio breaks, 1px between feature rows.

**The Square Chrome Rule.** If it belongs to the page, it has no radius. If it has a radius, it is a picture of the app.

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
A 4px black rule, then a headline across 8 columns and an optional 4-column lead aside.

### Feature Row
1px top rule, title plus body in 4 columns, and one close-up crop (Insert list, Data JSON, Issues list) or drawn fragment (Preview, Publish), each placed in a different column range.

### App Imagery (signature)
Real dark-theme screenshots (provenance in website/public/screens/PROVENANCE.md), close-ups cut from the same captures, and drawn fragments and a working demo in the app's quoted palette. The demo is a full window (600px tall, 400px sidebar) with a drawn Google Docs page; inserted lines flash mint for 1.2s unless reduced motion is set.

## Do's and Don'ts

### Do:
- **Do** snap every block to the 12-column grid and vary placements between repeated rows.
- **Do** separate sections with 4px black rules (white on the black band) and feature rows with 1px rules.
- **Do** set all headings in Archivo 900 with negative tracking.
- **Do** keep orange to the download fill, the promise line and the install numerals, plus hover, focus and selection states.
- **Do** show the product with real screenshots or crops, and record their provenance.

### Don't:
- **Don't** round or shadow page chrome; radius and shadow mean "this is the app".
- **Don't** use app palette colors (mint, charcoal) outside app imagery.
- **Don't** add a second accent hue, gradients or tinted panels to the page.
- **Don't** build card rows or repeat one feature-row layout.
- **Don't** set orange small text on black; it fails contrast there.
