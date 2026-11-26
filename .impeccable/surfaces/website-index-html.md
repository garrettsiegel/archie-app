---
version: 1
slug: "website-index-html"
primary_target: "website/index.html"
related_targets: ["website/src/App.tsx"]
---

# Surface brief: Archie Editor download site

Scope: public download page for Archie Editor (website/). Mode: Persuade.
Audience: people who write ArchieML data in Google Docs (editors, often non-developers) and developers who build pages from it.
Action: Download for Mac (GitHub Release .dmg), with honest install steps for the unsigned first launch.
Proof: a working demo of the real app UI with sample data; real features from PRODUCT.md. No invented claims, users, or numbers.
Constraints: macOS only; ~220 MB universal; first launch needs Open Anyway; not affiliated with Google or ArchieML.
Unresolved: GitHub repo name/URL (download link is one config constant), license.
History: a type-case (wood and lead) world was built and rejected by the owner; they chose the category standard.

## Direction contract

THESIS: The category standard, executed impeccably: a clean Mac-app download page whose hero is the product itself, a working Archie Editor window. Refuses themed costumes and generic feature-card rows standing in for the product.

OWN-WORLD: Near-white ground (#fafaf9) with true ink (#111312) text, cool gray structure lines, and the app's own green (#2f6f4f, light tint #e6f0ea) as the single accent for actions and valid states; one warm red for issues. Apple system type (SF Pro via the system stack) for display and text, system mono for code. Real macOS window chrome, soft layered shadows, 12px radii.

STORY: Visitor sees the app working on a doc, believes it keeps them in Google Docs and catches mistakes before publishing, downloads for Mac, and knows the one-time Open Anyway step.

FIRST VIEWPORT: Centered headline and one-line pitch, Download for Mac (version and size beside it), then a large drawn app window: sidebar with Insert/Data/Issues tabs and snippet buttons, a Google-Docs-like page of ArchieML, status pill. Clicking snippets edits the doc; the status flips from issue to valid.

FORM: canon (category standard, the standing exit), chosen after the dealt type-case direction was rejected. seed:0e2c790497827eec

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
