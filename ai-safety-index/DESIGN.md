---
name: AI Safety Index
description: Practical compact research portal with shared evidence, readable cards and interactive evaluations.
colors:
  primary: '#2b4fa5'
  white: '#ffffff'
  ink: '#182a3a'
  muted: '#52606d'
  rule: '#dce1e5'
  mark: '#edf2fa'
  mint: '#5fc79f'
typography:
  page-title:
    fontFamily: Index Inter, PingFang SC, Hiragino Kaku Gothic ProN, Microsoft YaHei, sans-serif
    fontSize: 30px
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: 0
  section:
    fontSize: 21px
    fontWeight: 500
    lineHeight: 1.45
  card:
    fontSize: 16px
    fontWeight: 500
    lineHeight: 1.5
  body:
    fontSize: 14px
    fontWeight: 400
    lineHeight: 1.65
  metadata:
    fontSize: 12px
    lineHeight: 1.6
rounded:
  control: 6px
  mark: 6px
  avatar: 50%
spacing:
  header: 68px
  phone-header: 60px
  container: 90%
  max-width: 1240px
  card: 18px
  column: 14px
  section: 30px
components:
  compact-resource:
    padding: 18px
    rounded: 0
    backgroundColor: '{colors.white}'
    textColor: '{colors.ink}'
    typography: '{typography.card}'
  compact-action:
    backgroundColor: '{colors.primary}'
    textColor: '{colors.white}'
    padding: 9px 16px
    rounded: '{rounded.control}'
  compact-avatar:
    backgroundColor: '{colors.mark}'
    textColor: '{colors.primary}'
    rounded: '{rounded.avatar}'
    width: 48px
    height: 48px
---

# Design System: AI Safety Index

## Overview

**Creative North Star: Find the evidence quickly.**

The portal serves practical research discovery. Search, actual evaluation values and source-linked recommendations occupy the homepage's first screen. A restrained white interface uses Inter, small type marks, fine borders and compact resource cards. Only research news may use conceptual covers. Large topic images, decorative project-gallery treatments and empty blog placeholders are superseded.

## Colors

Portfolio blue (#2b4fa5) identifies actions and selected controls. White remains the page ground; ink (#182a3a), muted copy (#52606d) and fine rules (#dce1e5) carry hierarchy. Pale blue type marks identify resource classes. The inherited green menu trigger and blue navigation dialog remain the shared signature. Developer colors identify evaluation series: Anthropic #aa513c, OpenAI #26775f, Meta #356bb0, Mistral AI #956a21. Names and numbers remain explicit; color never carries a result alone.

## Typography

Inter and the existing CJK sans fallbacks carry product titles, controls, cards and tables. Page headings are 30px/1.35 at weight 500, 25px on phones; section headings are 21px/1.45, resource titles 16px/1.5 and body copy 14px/1.65. Tracking stays normal. Source metadata is 11–12px; chart labels are 13px (12px phone) and values 14px (13px phone), with tabular numerals. Scientific titles and authors retain original text. The blue full-screen menu preserves its established display face and accessible dialog behavior.

## Layout

The shared header is 68px, or 60px on phones. Content spans 90%, capped at 1240px. Desktop resource cards use three columns, tablet two and phone one, with 14px gaps and 18px inset. Resource cards have a small 32px type mark, title, useful description, source metadata and direct links; they contain no large images.

Home opens with the same 30px/500 page heading and stacked 15px explanation used by resource pages, an underline search control and four shortcuts. Fine top rules divide the evaluation and recommendations; the two recommendations use the same compact bordered-card vocabulary as resources, with 16px titles and 12px metadata. Below, a 2:1 grid places a same-data evaluation preview beside two manually selected research posts. The preview shows three named models out of the nine recorded historical results, actual values, selectable setting, source/date, historical state and a full-dashboard link preserving the selected metric. At 1280×720, all three values remain visible without scrolling (last value below y576). Phone columns stack. Six compact topics follow, then shared research posts, separately labeled collection/news updates, a short mission and expandable real construction history. No empty blog appears.

Evaluation defaults to #results through primary navigation and the full-screen menu. Three internal tabs are Dashboard, Catalog and Methods; Upload is the right-hand heading action on all three. Dashboard order: heading, tabs, direction and protocol filters, developer/model filters, horizontal bars, source-linked table, sharing and methods/source explanation. Table overflow stays inside its own region. Source date is visible per row. Choose-displayed-model controls are inline disclosures; they update the same dataset used by chart, table and CSV.

Topic directories are three-by-two compact cards. Topic pages default to papers, expose subtopic filters and four resource views, and collapse framework definitions and evaluation boundaries. News offers latest, commentary and research-showcase categories, year/topic/search filters, actual curated picks and 12-record pages. Empty commentary/showcase categories contain a truthful empty state, not fabricated posts.

## Components

Type marks use the existing authored stroke icons, not decorative cover images. Confirmed team members use small letter initials because portraits have not been supplied. Cards display only confirmed name, institution and role; research interests, responsibilities and personal links await input. External research picks do not imply team membership.

The resource form distinguishes additional resources from research recommendations. It collects public links and descriptions; result entries reveal required benchmark/version, setting, metric and original-report fields. Email is optional and private. The receiving service is unconfigured: the submit button is disabled and the draft action explicitly downloads local data. There is no successful-submission claim without a validated pending-review receipt from a configured backend.

## Motion and States

The desktop mint cursor dot is 6px, expanding only to 9px over links; touch and editable controls retain native behavior. Keep existing reduced-motion behavior, native focus, Escape support, menu focus return and interruptible route curtain. Query, selection, language and pagination changes do not replay it. Static bundled result records render synchronously; do not fake loading. Changing benchmark/direction clears invalid subordinate conditions; unavailable data removes the previous chart and shows a sourced empty state. Search results and sharing have visible empty/success/fallback states. Submission failures preserve inputs.

## Assets

No new raster is required. Six original concept covers and font licenses remain in assets/madeo with provenance; covers are used only in news and do not depict paper figures or team identities. Historical illustrations and legacy font licenses remain attributed in their existing source records. Chart data comes from the recorded 2024 Stanford CRFM report, not screenshot transcriptions of unverified current models.

## Rules

- Prioritize source-backed evidence and resource access over decoration.
- Keep chart, table, export and home preview on shared result records; clearly label three-of-nine preview scope and ×100 scaling.
- Preserve four-language routes, filters, comparison selections and drafts.
- Use no large images outside news; initials are identity marks, not claimed portraits.
- Preserve old resource/detail links. Old contact root becomes the dashboard, join links become team and resource links become upload.
- Submission is not operational until a real private review receiver is supplied and verified. Keep that limitation visible.

Implementation: portal-compact.js/css, portal-search.js, resource-submission.js, portal-results.js. Earlier portfolio/home-triptych specifications are superseded by the user's compact portal brief.
