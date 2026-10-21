---
name: AI Safety Index
description: Open Madeo-style evidence homepage with compact research routes and shared historical evaluations.
colors:
  primary: '#2b4fa5'
  white: '#ffffff'
  ink: '#182a3a'
  muted: '#52606d'
  rule: '#dce1e5'
  mark: '#edf2fa'
  mint: '#5fc79f'
  home-blue: '#294b9c'
  home-pale: '#e7ecfa'
  home-green: '#205e4a'
  home-mint: '#e2f0e8'
  home-attack: '#a54630'
  home-ink: '#111111'
typography:
  home-display:
    fontFamily: Index Inter, PingFang SC, Hiragino Kaku Gothic ProN, Microsoft YaHei, sans-serif
    fontSize: clamp(40px, 4.7vw, 66px)
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: '-0.035em'
  home-section:
    fontSize: 30px
    fontWeight: 400
    lineHeight: 1.3
    letterSpacing: '-0.025em'
  home-caption:
    fontSize: clamp(20px, 1.8vw, 25px)
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: '-0.015em'
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
  home-column: 44px
  home-row: 64px
  home-stagger: 76px
  home-hero: 58px 0 48px
  home-phone-hero: 42px 0 34px
components:
  home-primary-canvas:
    backgroundColor: '{colors.home-pale}'
    padding: 24px 30px
    rounded: 0
  home-comparison-canvas:
    backgroundColor: '{colors.home-mint}'
    padding: 24px 30px
    rounded: 0
  home-caption:
    typography: '{typography.home-caption}'
    padding: 18px 0 0
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

**Creative North Star: "Find the evidence quickly."**

The homepage adopts the user-approved Madeo composition: white ground, a large open two-line headline, useful search alongside and staggered visual canvases. Actual result graphics and source-linked research recommendations form the work on display. Compact research routes retain their established practical density, typography and resource cards.

The home composition is a surface-specific expression, not a replacement for the compact subpage system. Conceptual covers belong only to research news; evaluation graphics remain explicit, accessible representations of the same historical records used by the dashboard.

**Key Characteristics:**
- Open headline and search above staggered, equal-width home canvases.
- Historical charts with names, numbers, settings and source dates.
- Compact 3/2/1-column research routes with small icons and team initials.
- White ground, flat surfaces and four-language continuity.

## Colors

### Primary

Focus Blue remains the compact-route action and selected-control color. Home Evidence Blue identifies bars, links and focus within the home surface; Home Pale is its chart-canvas ground. These roles supplement the compact palette without changing it.

### Secondary

Home Green and Home Mint identify the paired-setting canvas and default-setting series. Home Attack distinguishes GCG-T points. Names, setting labels and explicit values accompany color. The shared Mint menu trigger and blue native navigation dialog retain their established treatments.

### Neutral

White remains the page ground. Ink, Muted and Rule carry compact-route text and separators; Mark carries pale resource type marks. Home Ink supports the open headline. Local chart labels use their canvas-specific contrast colors from `portal-showcase.css`. Do not recolor the generic page background to match a chart.

## Typography

Inter and the existing CJK sans fallbacks carry headings, controls, cards and tables. Scientific titles, author names and identifiers retain original wording. The blue full-screen menu keeps its established display face.

Home uses the `home-display`, `home-section` and `home-caption` roles above. Its display is weight 400 and deliberately two lines; the search explanation is 17px/1.6 and body captions are 14px/1.7. On tablet (768–1050px), the display is 44px. On phones it becomes clamp(35px, 7vw, 49px)/1.15 with −0.025em tracking; sections become 25px and captions 21px/1.45. Chart values use tabular numerals. News captions are 22px desktop / 21px phone.

Compact subpages retain page titles at 30px/1.35 weight 500 (25px phone), sections at 21px/1.45, resource titles at 16px/1.5 and body copy at 14px/1.65. Tracking stays normal. Metadata is 11–12px; full-results chart labels are 13px (12px phone), values 14px (13px phone).

## Layout

The shared header remains 68px (60px phone). Content spans 90%, capped at 1240px. Compact resource cards retain three desktop columns, two tablet columns and one phone column, 14px gaps and 18px insets. They contain a small 32px type mark, title, useful description, metadata and direct links.

Home's intro pairs a 1.25fr headline with a 1fr search area, separated by 64px and padded 58px above / 48px below. Search sits to the right, capped at 450px, with an underline field and two useful shortcuts. The visual grid has two equal columns, 44px between columns and 64px between rows; even tiles begin 76px lower. Order is primary vertical result chart, first featured news cover, second featured news cover, paired-setting chart. Captions sit below their canvas. The chart canvases use 24px/30px padding; existing news covers use a 1.48 aspect ratio.

At 768–1050px, the home intro gap is 36px and top padding 44px; grid gaps become 44px/28px and stagger 54px. At 767px and below, intro and gallery stack, the stagger clears, hero padding is 42px/34px, intro gap 28px, gallery gap 36px and canvas inset 22px. Long translated copy wraps without changing this one-column order.

Six compact directions follow the visuals, then shared research, separately labeled dated collection/news updates, a short two-column mission (stacked on phone) and expandable construction history. Home sections use a fine top rule and open spacing. No empty blog appears.

**The Surface Scope Rule.** Apply the large staggered composition to Home; retain compact resource layouts on other routes.

Evaluation opens #results with Dashboard, Catalog and Methods tabs and a right-hand Upload action. Its order remains heading, tabs, direction/protocol and developer/model controls, horizontal bars, same-record source-linked table, sharing and methods. Tables overflow only inside their own region. Topic directories, filtering and collapsed framework definitions remain compact; news retains actual curated picks and 12-record pages.

## Elevation & Depth

Home, research surfaces, shared header and full-screen menu are flat. Whitespace, fine rules and the two tinted chart canvases establish separation. The inherited legacy-dialog shadow remains limited to existing dialogs that use it; it does not become a home-card token.

**The Flat Surface Rule.** Use spacing, fine rules and chart-specific tonal canvases to separate content; do not add card shadows to Home.

## Shapes

Home canvases are rectangular with square corners. The search field is an underline. Compact controls retain gentle 6px corners, type marks their 6px corners and member initials a circular 48px field. Existing stroke icons, not raster illustrations, mark resource classes. Charts use real HTML/CSS geometry; news alone may use the retained conceptual rasters.

## Components

### Home charts

The primary pale-blue canvas uses vertical bars and a default/GCG-T select. The green canvas uses a horizontal dumbbell for the same model versions, with a labeled two-setting legend and expandable numeric table. Both display three of nine historical HELM Safety v1.0 / HarmBench records, report date 2024-11-08 and source score ×100 on a 0–100 scale. Preserve direct dashboard links and original-report links. These are historical source scores, not current rankings or overall safety percentages. Full-results charts remain horizontal on every viewport.

**The Shared Evidence Rule.** Home charts, the results dashboard, numeric tables and CSV derive from shared records; preserve version, setting, date and ×100 disclosure.

### News and resources

Two existing conceptual covers appear in the featured home news tiles with publisher, date, title, description, topic and original link. They are not paper figures or portraits. Resource cards and further research-sharing cards remain compact. Confirmed team cards use initials with only supplied name, institution and role. Six concept-cover files, prompts and font/source licenses remain in `assets/madeo`; this refresh requires no new raster.

### Controls and navigation

Compact actions keep the existing blue fill, white text, control radius and padding. The home underline search emphasizes focus with its own blue bottom rule. Home links, selects and summaries have a 2px blue focus outline with 5px offset. The green menu trigger, blue native dialog, keyboard focus return and Escape behavior remain shared.

The desktop mint pointer remains 6px and expands to 9px over links; native text, touch and keyboard behavior remain available. The existing interruptible route curtain remains. The home title (320ms) and featured image crop reveal (760ms) run only when the route path changes; locale, metric, query and pagination changes do not replay home entrances. News-cover hover uses scale(1.035) over 600ms. Reduced motion removes these enhancements, and content is visible without the motion module.

### Resource contribution

The heading-right resource action opens a form distinguishing additional resources from research recommendations, with benchmark/version/setting/metric/source fields for results. Its receiver remains unconfigured: official submission is disabled and only a local JSON draft downloads. A successful submission requires an actual configured backend returning `pending_review` and `receipt_id`; failures preserve input. Optional email remains private.

## Do's and Don'ts

### Do:
- Do preserve white ground and use the pale chart fills only within their home canvases.
- Do keep explicit model names, values, 0–100 axes, historical date and source links beside both home charts.
- Do retain compact subpage tokens, horizontal results bars and internally scrolling tables.
- Do preserve visible keyboard focus, reduced motion, route state, locale continuity and form drafts.

### Don't:
- Don't restore the rejected compact dashboard composition on Home.
- Don't expand the home gallery treatment into resource subpages.
- Don't use conceptual covers as paper figures, model evidence or member portraits.
- Don't invent current rankings, overall-safety percentages, posts, team work or submission success.

Implementation authority: `portal-showcase.css` for Home; `portal-compact.js` for shared-record home composition and compact resource routes; `portal-compact.css` for compact subpages; `portal-motion.js` for progressive entrances. The approved direction is recorded in `work/madeo-home-charts/direction.md` outside this project root. Final review captures are `.impeccable/review/desktop.png`, `mobile.png` and `user-555.png`. CLI context/detect was unavailable; no detector result is claimed.
