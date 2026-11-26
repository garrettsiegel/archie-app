---
name: Archie Editor
description: Download site for a free Mac app that writes and checks ArchieML in Google Docs.
colors:
  paper: "#fafaf9"
  panel: "#ffffff"
  wash: "#f2f3f1"
  sidebar: "#f4f3ef"
  ink: "#111312"
  ink-2: "#3c403e"
  muted: "#5f6562"
  line: "#e3e5e2"
  line-strong: "#c9ccc8"
  green: "#2f6f4f"
  green-ink: "#245a3f"
  green-tint: "#e6f0ea"
  red: "#b3261e"
  red-tint: "#fbeae8"
typography:
  display:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "clamp(2.3rem, 5.2vw, 3.9rem)"
    fontWeight: 700
    lineHeight: 1.05
    letterSpacing: "-0.035em"
  headline:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "clamp(1.9rem, 4vw, 2.75rem)"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.03em"
  title:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Display, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 600
    letterSpacing: "-0.02em"
  lead:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.625
  body:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "17px"
    fontWeight: 400
    lineHeight: 1.625
  body-sm:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  caption:
    fontFamily: "-apple-system, BlinkMacSystemFont, SF Pro Text, Segoe UI, Roboto, Helvetica Neue, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  code:
    fontFamily: "ui-monospace, SF Mono, Menlo, Consolas, monospace"
    fontSize: "13px"
    fontWeight: 600
rounded:
  sm: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  3xl: "1.5rem"
  full: "9999px"
spacing:
  gutter: "20px"
  gutter-sm: "32px"
  container: "72rem"
  section: "112px"
  section-sm: "144px"
  spotlight-gap: "80px"
components:
  button-primary:
    backgroundColor: "{colors.green}"
    textColor: "{colors.panel}"
    rounded: "{rounded.full}"
    padding: "12px 24px"
  button-primary-hover:
    backgroundColor: "{colors.green-ink}"
  button-primary-sm:
    backgroundColor: "{colors.green}"
    textColor: "{colors.panel}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  button-quiet:
    backgroundColor: "{colors.panel}"
    textColor: "{colors.ink-2}"
    rounded: "{rounded.md}"
    padding: "4px 10px"
  segmented-tab-active:
    backgroundColor: "{colors.green-tint}"
    textColor: "{colors.green-ink}"
    rounded: "{rounded.md}"
    padding: "4px 8px"
  app-window:
    backgroundColor: "{colors.panel}"
    rounded: "{rounded.xl}"
  ui-fragment:
    backgroundColor: "{colors.sidebar}"
    rounded: "{rounded.xl}"
    padding: "12px"
  install-panel:
    backgroundColor: "{colors.wash}"
    rounded: "{rounded.3xl}"
    padding: "64px 48px"
  step-number:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.panel}"
    rounded: "{rounded.full}"
    size: "32px"
---

# Design System: Archie Editor

## Overview

**Creative North Star: "The Product on a Clean Desk"**

A conventional, quiet Mac-app download page: near-white ground, true ink text, and the app itself as the hero. The page makes no world of its own; the drawn Archie Editor window carries the identity, and everything around it stays out of its way. Density is low, spacing is generous, and the only color that speaks is the app's own green.

The owner tried a themed wood/type-case direction and rejected it in favor of the category standard. Texture, costume, and decorative motifs are out; correctness, restraint, and real product UI are in.

**Key Characteristics:**
- Near-white paper ground with cool gray hairlines.
- One accent (app green) for actions and valid states; red only for issues.
- Apple system type throughout; system mono for ArchieML.
- A working, drawn macOS window as the hero; drawn app fragments as feature art.
- Soft layered shadow on the window only; everything else flat.

## Colors

A neutral, faintly green-gray palette with a single deep green accent and a single red for problems.

### Primary
- **Archie Green** (green): download buttons, skip link, focus ring, valid status dot, snippet labels, highlighted inserted text. The app's own brand color.
- **Deep Green** (green-ink): hover state for green buttons and green text on the light tint (active tab, valid label).
- **Green Mist** (green-tint): active segmented tab, text selection, the fade-in flash on newly inserted doc lines.

### Semantic
- **Issue Red** (red): error dots, issue counts, issue messages, wavy underline on bad lines. Never decorative.
- **Red Mist** (red-tint): defined in the theme for issue backgrounds; not yet used on the page.

### Neutral
- **Paper** (paper): page background and sticky header (at 80% with blur).
- **Panel** (panel): app window body, cards inside fragments, white surfaces.
- **Wash** (wash): window title bar and the install panel.
- **Sidebar Stone** (sidebar): the app sidebar and the issues/publish fragments, matching the real app's sidebar. Currently hardcoded in components, not in the theme.
- **Ink** (ink): headings and primary text; also the dark live-preview pane and step-number circles.
- **Ink 2** (ink-2): nav links, secondary UI text, code in panels.
- **Muted** (muted): body copy under headings, captions, hints.
- **Line / Line Strong** (line, line-strong): hairline borders and dividers; strong for input outlines and quiet-button hover.

### Named Rules
**The One Green Rule.** Green is the only accent. It marks things you can do (download, insert) and things that are right (valid). Nothing else is colored.

**The Red Means Wrong Rule.** Red appears only where the doc has a problem. If nothing is broken, no red is on screen.

## Typography

**Display Font:** SF Pro Display via `-apple-system` (Segoe UI, Roboto, Helvetica Neue fallbacks)
**Body Font:** SF Pro Text via `-apple-system`
**Label/Mono Font:** SF Mono via `ui-monospace` (Menlo, Consolas)

**Character:** The Mac's own voice. Bold, tightly tracked headlines over plain, roomy body text; mono only where ArchieML or file paths appear.

### Hierarchy
- **Display** (700, clamp 2.3–3.9rem, 1.05, -0.035em): the hero headline only; second line in green.
- **Headline** (700, clamp 1.9–2.75rem, 1.25, -0.03em): section headings.
- **Title** (600, 1.5rem, -0.02em): feature spotlight headings; install step titles drop to 1.125rem.
- **Lead** (400, 1.125rem, 1.625): hero pitch, muted, max ~36rem.
- **Body** (400, 17px, 1.625): spotlight copy, muted, max ~28rem. 15px for feature-list and step text.
- **Caption** (400, 13px): version line, demo note, window title.
- **Code** (mono, 12–13px, 600 for labels): ArchieML lines, snippet names, paths.

### Named Rules
**The System Voice Rule.** Use the Apple system stack for all text. Headings balance-wrap, body pretty-wraps.

## Layout

Single centered column, max 72rem, side padding 20px (32px from 640px up). The hero is centered text; everything below is left-aligned. Sections open with 112px of top space (144px from 640px up). Feature spotlights are two-column from 768px with the art alternating sides, 64px column gap, 80–96px between rows. Supporting features sit in a 1/2/3-column definition list under a hairline rule. Install steps run 1/2/4 columns inside a rounded wash panel. Breakpoints are Tailwind's defaults (640, 768, 1024). The header is sticky, 56px tall, translucent paper with a backdrop blur.

## Elevation & Depth

Flat by default. Depth comes from tonal steps (paper, wash, sidebar stone, panel) and hairlines. Shadows are reserved for objects that depict real macOS things.

### Shadow Vocabulary
- **Window** (`0 0 0 1px rgb(17 19 18 / 0.08), 0 2px 4px rgb(17 19 18 / 0.04), 0 12px 24px rgb(17 19 18 / 0.06), 0 40px 80px -20px rgb(17 19 18 / 0.18)`): the drawn app window only.
- **Button** (`0 1px 2px rgb(17 19 18 / 0.2), inset 0 1px 0 rgb(255 255 255 / 0.15)`): green download button; a small lift and top highlight.
- **Doc page** (`0 1px 3px rgb(17 19 18 / 0.12)`): the drawn Google Doc page inside the window.

### Named Rules
**The Only the Window Floats Rule.** The big layered shadow belongs to the product window. Cards, panels, and sections stay flat.

## Shapes

Rounded, Mac-like corners. Pills (full) for action buttons, status counts, and step numbers. 12px for the window and feature fragments, 8px for rows inside them, 6px for tabs and small buttons, 24px for the install panel, 4px for the drawn doc page. Borders are 1px hairlines in line color.

## Components

### Buttons
- **Shape:** pill (full radius).
- **Primary (Download for Mac):** green fill, white 600 text, download icon, 12px x 24px (large) or 6px x 16px (header). Small size shortens to "Download" on phones.
- **Hover / Focus:** fill darkens to deep green; focus shows the global 2px green outline, 3px offset.
- **Quiet (Undo / Reset in demo):** white with hairline border, ink-2 text, 6px radius; border strengthens on hover.
- **Text links:** ink or ink-2, underlined with 4px offset; nav links are plain and darken to ink on hover.

### Segmented Tabs
- **Style:** white track with hairline border, 8px radius, 2px inset; tabs 6px radius, 13px medium.
- **State:** active is green mist with deep-green text; inactive is muted, darkening on hover. Issues tab carries a red pill count when invalid.

### Cards / Containers
- **UI fragments:** sidebar-stone or split panels, 12px radius, hairline border, white 8px-radius rows inside. They are drawn pieces of the real app, not generic feature cards.
- **Install panel:** wash fill, 24px radius, no border, no shadow.

### Navigation
- Sticky header: app icon (28px) and name on the left; Features, Install, GitHub, and a small download button on the right. Section links hide below 640px; GitHub collapses to its icon.

### App Window (signature)
A working drawn copy of Archie Editor: wash title bar with macOS traffic lights (#ff5f57, #febc2e, #28c840), window title, and a live status (green dot + "Valid ArchieML" or red dot + issue count). A 260px sidebar (Insert / Data / Issues) sits beside a drawn Google Doc page on a pale gray canvas. Clicking a snippet appends lines that fade in with a green-mist flash; bad lines get a red wavy underline. Stacks with the doc on top below 768px.

### Motion
Sections reveal once on scroll (fade + 16px rise, 0.6s, ease `cubic-bezier(0.16, 1, 0.3, 1)`). All motion and smooth scrolling turn off under reduced motion.

## Do's and Don'ts

### Do:
- **Do** let the drawn product window be the hero and the drawn app fragments be the feature art.
- **Do** keep green for actions and valid states, and red for issues only.
- **Do** use the Apple system stack for text and system mono for ArchieML.
- **Do** keep surfaces flat; save the layered shadow for the window.
- **Do** keep every motion behind a reduced-motion check.

### Don't:
- **Don't** add themed textures or costume worlds (wood, type cases, paper grain); the owner rejected that direction.
- **Don't** replace the drawn product with rows of generic icon feature cards.
- **Don't** introduce a second accent color.
- **Don't** invent testimonials, logos, or download numbers to fill space.
