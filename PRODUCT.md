# Product

<!-- impeccable:product-schema 1 -->

## Platform

web (the download site). The product itself is a macOS desktop app built with Electron.

## Stack

Download site: Vite + React + TypeScript + Tailwind CSS + Motion (motion.dev); Zustand/Valibot only if needed. Lives in `website/`. Hosted on GitHub Pages; the installer is a GitHub Release asset on the same public repo.

## Users

Public visitors. Mainly people who write structured data in Google Docs with ArchieML (archieml.org): newsroom and interactive-graphics teams, content editors who fill in data docs, and the developers who build the pages that read them. Editors are often non-developers; developers want to check data before publishing.

## Product Purpose

Archie Editor is a Mac app for writing ArchieML in Google Docs. It shows a Google Doc beside a sidebar of ArchieML tools, turns the doc into data as you type, flags mistakes, and can preview the real project page and publish the JSON. Success: editors produce valid data without a separate debug tool, and developers stop debugging bad docs.

## Positioning

An all-in-one ArchieML tool that works inside the real Google Doc (no typing ArchieML by hand, no Apps Script, no copy-paste, no new editor to learn), signed in with the user's own Google account. Live preview loads the project's own test page fed with the unpublished doc, so the project's own validation runs before anything ships.

## Operating Context

Writers work in Google Docs; ArchieML turns doc text into JSON for web pages. Pages often read either a published JSON file or the doc directly through debug URL settings (`debug-content=doc`, `debug-gdoc-id`). Data is published as a .json file, often over SFTP.

## Capabilities and Constraints

Confirmed features:
- Sign in with Google inside the app; open any doc, recent docs list.
- Insert ArchieML snippets (values, objects, arrays, freeform, commands) at the cursor; each ends with a new line; wrap highlighted text; filter snippets; quick insert (⌘⇧K); save your own snippets; block name fills in names.
- Templates: a guided builder (name, shape, label, fields with help text) and a fill-in form that writes the ArchieML; fill from highlighted text; export/import to share; in quick insert.
- Colors in the doc: keys and {}/[] lines get their own text color and highlight color (each on or off), optional bold; applied on insert or to highlighted text. Plain text is unchanged.
- Data tab: the doc as JSON, live; Copy JSON; Export .json.
- Issues tab: unclosed blocks, stray closers, duplicate keys, :skip/:end mistakes, keys with spaces; click to jump to the line.
- Outline tab: every object and array, click to jump.
- Live Preview (⌘⇧P): the project's QA/test page beside the doc, reading the unpublished doc; private docs work because the app passes the doc through the user's login.
- Publish tab: SFTP with password or SSH key, saved servers, browse or type a path, name the file, replace with confirmation; "Publish again" one click; passwords encrypted on the Mac; server identity checked on first connect.
- Resizable sidebar and preview; light and dark mode.

Constraints:
- macOS only (universal: Apple Silicon and Intel). About 220 MB download.
- Not signed with an Apple Developer ID yet: first launch needs System Settings → Privacy & Security → Open Anyway. Say so plainly.
- Open source on GitHub (license not decided). Do not call it "free" in copy.
- Not affiliated with Google or ArchieML's authors; do not use their logos or imply endorsement.

## Brand Commitments

Look: International-style (Swiss) poster: strict grid, giant black type, one signal orange. The owner rejected a wood type-case world and a plain conventional page before choosing this. Name: Archie Editor. App icon: signal-orange (#d62e0b) rounded square with a white document showing `{a}` and `[*]` in black and orange (build/icon.svg), matching the site. Do not use any employer branding on the public site.

## Evidence on Hand

App icon (build/icon.svg, build/icon.png). No user testimonials, customer logos, download counts, or press: do not invent any. No product screenshots suitable for the public site yet (real ones show private docs); illustrate with drawn UI instead.

## Product Principles

1. Stay in the real doc: the tool goes to the writer, not the other way round.
2. All in one: snippets, templates, data, checks, preview and publishing in one app, instead of typing ArchieML by hand or building Apps Script tools. Mistakes are flagged in plain language.
3. One app replaces the debug dashboard for content checks.
4. Honest about rough edges (unsigned app, Mac only).

## Accessibility & Inclusion

WCAG AA contrast, keyboard access, reduced-motion support on the site.
