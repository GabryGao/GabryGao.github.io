---
name: AI Safety Index
description: A live "days since last incident" works board for AI safety, in the language of industrial safety signage.
colors:
  ground: "#121614"
  rail: "#181d1a"
  line: "#2a322e"
  ink: "#eceee9"
  muted: "#a3aea7"
  safe: "#086a41"
  safe-deep: "#054d2f"
  safe-ink: "#e9f6ee"
  safe-muted: "#cfe8da"
  enamel: "#f3f2ec"
  enamel-ink: "#121614"
  warn: "#f0c233"
  alarm: "#ff6b5e"
  tag-fill: "#26302b"
  dim-figure: "#5b6660"
  placeholder: "#7d8982"
typography:
  plate-numeral:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(108px, 11vw, 164px)"
    fontWeight: 800
    lineHeight: 1
  figure:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "26px"
    fontWeight: 800
    lineHeight: 1
    fontFeature: "tnum"
  board-headline:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(26px, 2.6vw, 36px)"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-0.01em"
  page-title:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "clamp(28px, 3vw, 40px)"
    fontWeight: 700
    lineHeight: 1.1
  section:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.2
  title:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.3
  body:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.55
    fontFeature: "tnum"
  body-strong:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.4
  label:
    fontFamily: "Archivo, PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, system-ui, sans-serif"
    fontSize: "12.5px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  board: "6px"
  control: "5px"
  chip: "4px"
  tag: "3px"
  inner-rule: "3px"
  bar: "2px"
spacing:
  page-x: "32px"
  page-x-sm: "16px"
  gutter: "24px"
  section: "40px"
  page-end: "64px"
  row-y: "14px"
components:
  board:
    backgroundColor: "{colors.safe}"
    textColor: "{colors.safe-ink}"
    rounded: "{rounded.board}"
    padding: "36px 40px 28px"
  board-compact:
    backgroundColor: "{colors.safe}"
    textColor: "{colors.safe-ink}"
    rounded: "{rounded.board}"
    padding: "22px 24px 20px"
  enamel-plate:
    backgroundColor: "{colors.enamel}"
    textColor: "{colors.enamel-ink}"
    typography: "{typography.plate-numeral}"
    rounded: "{rounded.board}"
    width: "clamp(92px, 9vw, 132px)"
    height: "clamp(132px, 13vw, 188px)"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.enamel-ink}"
    rounded: "{rounded.control}"
    padding: "10px 18px"
  button-primary-hover:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.enamel-ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 17px"
  segment-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.enamel-ink}"
    rounded: "{rounded.tag}"
    padding: "6px 12px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.muted}"
    rounded: "{rounded.chip}"
    padding: "5px 9px"
  chip-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.enamel-ink}"
  tag:
    backgroundColor: "{colors.tag-fill}"
    textColor: "{colors.ink}"
    rounded: "{rounded.tag}"
    padding: "0 6px"
  tag-incident:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.enamel-ink}"
  input:
    backgroundColor: "{colors.rail}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "9px 11px"
  notice-warning:
    backgroundColor: "{colors.warn}"
    textColor: "{colors.enamel-ink}"
    rounded: "{rounded.board}"
    padding: "16px 20px"
---

# Design System: AI Safety Index

## Overview

**Creative North Star: "The Works Safety Board"**

The site is the board at a plant gate that counts days since the last incident. A graphite ground carries every page; safe-condition green panels are the boards; white enamel plates carry the count; warning yellow marks incidents and the reader's current focus; signal red appears only as a cap or a negative. Everything else is ruled lists and tables in ink and muted grey on the dark ground.

Density is that of an operations dashboard: ruled rows, tabular figures, compact labels, one green board per page as its signature. Headings and numerals use Archivo at condensed widths, so figures read like stencilled signage; UI and prose stay at normal width. The site is bilingual (Chinese default, English by switch) and renders CJK text in the system sans.

**Key Characteristics:**
- Dark graphite ground (single dark theme, `color-scheme: dark`), no light mode.
- One green board panel per page, framed by an inset 2px rule, holding the page's key count or boundary.
- Enamel number plates with a centre seam and a top rivet for headline counts and date/year group heads.
- Condensed 800 numerals everywhere a number is the point; tabular figures site-wide.
- Ruled tables and lists opened by a 2px ink top rule; rows divided by 1px lines.
- Motion limited to plates turning and bars rising, both off under reduced motion.

## Colors

A signage palette: graphite neutrals, one safety green, one enamel white, and two signal colours whose use is rationed.

### Primary
- **Safe-Condition Green** (safe): the board field. Fills the home board, the mini boards on records and directions, the comparison boundary on results and methods, the evidence ladder on benchmarks, the year board on papers, and the evidence board on detail. Never used for body text or buttons.
- **Deep Green** (safe-deep): the inset ring inside the brand mark square.
- **Board Ink** (safe-ink) and **Board Muted** (safe-muted): text on green; board muted measures 5.15:1 on the green and carries dt labels, dates and legends. Board muted also fills positive deltas and the "best" badge on the results bar chart.

### Secondary
- **Warning Yellow** (warn): the attention colour. As a fill it marks incident days in the strip and week bars, incident tags, the baseline bar, the selected year bar, warning notices and required-field markers. As a line or text it marks the reader's focus: focus outlines (2px), the current sub-navigation underline, link hover colour, checkbox accent, selection background, search highlights (at 28% alpha) and status messages.

### Tertiary
- **Signal Red** (alarm): negative-delta fills in result charts and the border of an invalid field. 6.53:1 on the ground.

### Neutral
- **Graphite Ground** (ground): page background and `enamel-ink`'s twin; enamel-ink is the dark text on enamel, ink-filled and yellow surfaces.
- **Rail** (rail): hover rows, expanded detail panels, inputs, nav hover.
- **Line** (line): all 1px rules and control borders.
- **Ink** (ink): primary text (15.6:1), the 2px top rule of tables and lists, and the fill of pressed controls and primary buttons.
- **Muted** (muted): secondary text, labels and inactive nav; 7.97:1 on ground, 7.46:1 on rail.
- **Enamel** (enamel): number plates and comparison-bar fills; pressed evidence-level buttons on the green board.
- **Tag Fill** (tag-fill): neutral tag background.
- **Dim Figure** (dim-figure): zero counts in tables and the lowest evidence level; only at large condensed sizes, where its 3.05:1 meets the large-text threshold.
- **Placeholder** (placeholder): input placeholder text, 4.7:1 on rail.

### Named Rules
**The Rationed Signal Rule.** Yellow fills mean an incident, a warning or the current selection; red means a negative or an error. Neither colour fills a neutral surface or decorates a heading.

**The One Green Board Rule.** Green is a panel, not an accent. Each page has one board (the home page's is the large one); green never tints text, borders or buttons on the ground.

**The Inset Rule Rule.** Every green board carries a 2px inner rule in safe-ink at 22% alpha, inset 6 to 10px (10px on the home board, 7px on mobile) with 3px corners, drawn above the fill and ignoring pointer events.

## Typography

**Display Font:** Archivo, condensed 75% at 800 and semi-condensed 87.5% at 700 (self-hosted static faces)
**Body Font:** Archivo, normal width at 400 and 600
**CJK:** PingFang SC, Hiragino Sans GB, Noto Sans SC, Microsoft YaHei, then system-ui

**Character:** A grotesque that narrows into stencil-like figures for counts and headings and stays plain for reading. Four font files only; no other family.

### Hierarchy
- **Plate Numeral** (800, condensed): digits on enamel plates. Scaled down on other boards (70 to 100px) and in group heads (46 to 52px).
- **Figure** (800, condensed, 22 to 40px, line-height 1): table counts, item dates, chart values, direction stats, pipeline step numbers, paper years.
- **Board Headline** (700, semi-condensed, -0.01em, balanced wrap): the home board's sentence.
- **Page Title** (700, semi-condensed): every inner page's h1; detail and direction pages go up to clamp(32px, 4vw, 52px).
- **Section** (700, semi-condensed, 22 to 24px): section and board headings.
- **Title** (700, semi-condensed, 18 to 21px): organisation names, dataset names, direction names, featured paper titles (19px).
- **Body** (400, 15px/1.55, tabular figures): reading text; long prose sits at 62 to 76ch with line-height 1.6 to 1.7.
- **Body Strong** (600): row titles, links in lists, pressed control labels.
- **Label** (400, 12.5 to 13px, muted): metadata, dt labels, field labels, sub-heads. No uppercase tracking; the brand wordmark is the only uppercase text.

### Named Rules
**The Width Carries Rank Rule.** Hierarchy is set by width and weight, not size alone: condensed 800 for numbers, semi-condensed 700 for names and headings, normal width for everything read as prose or operated as UI.

**The Two Languages Rule.** Only Chinese and English. Static strings carry Chinese in markup with `data-en` (and `data-en-placeholder`, `data-en-aria-label`, `data-en-title`); scripted strings use `T(zh, en)`. Long catalogue prose with no English stays Chinese, tagged `lang="zh-CN"` and followed by the "Chinese only" marker.

## Layout

A 1320px container with 32px side padding (16px under 560px). Inner pages open with a page head (title plus a muted lead capped at 70 to 76ch), then the page's green board, then ruled tables or lists. Sections are spaced about 40px apart and pages end with 64px.

The home first viewport is a 7fr/5fr grid with a 24px gap: the green board with plates and the 7-day strip on the left, the signal list on the right, and the organisation scorecard starting below. Records uses a 300px sticky filter rail beside the day-grouped list; detail uses 2fr/1fr.

Responsive rules: at 1040px multi-column grids collapse to one column, the header wraps, and the main nav becomes a full-width horizontal scroll row with hidden scrollbar; the search box shrinks to 150px. At 560px padding drops to 16px, the board padding tightens, the update stamp hides, strips compress (4px gaps, 80px tall) and two-column definition lists stack. Wide tables keep a minimum width (760 to 980px) and scroll horizontally inside their wrapper.

## Elevation & Depth

Flat by default: rows, tables, controls and panels on the ground have no shadow, and depth comes from tonal steps (ground, rail, line). The only lifted objects are the physical signage pieces.

### Shadow Vocabulary
- **Board** (`box-shadow: 0 1px 0 rgba(255,255,255,.12) inset, 0 24px 48px -24px rgba(0,0,0,.6)`): the home green board; a lit top edge and a soft drop beneath.
- **Plate** (`box-shadow: 0 2px 0 rgba(0,0,0,.25), 0 14px 22px -10px rgba(0,0,0,.45)`): enamel plate thickness and lift.
- **Rivet** (`box-shadow: inset 0 1px 1px rgba(0,0,0,.35)`): the 7px rivet head on each plate.

### Named Rules
**The Signage Only Rule.** Shadows belong to boards and plates, the physical objects of the world. UI controls, rows and cards stay flat.

## Shapes

Small, firm corners: 6px on boards, plates and notices, 5px on buttons, inputs and segmented controls, 4px on chips, nav items and the language link, 3px on tags and the inner board rule, 1 to 2px on bars. Lists and tables are open, ruled with a 2px ink rule on top and 1px line rules between rows, never boxed. The "not collected" state is a hatched (135deg, 4px on 9px) column with a dashed border.

## Components

### Buttons
- **Shape:** firm corners (5px).
- **Primary:** ink fill, enamel-ink text, 600 weight, 10px 18px; turns warning yellow on hover; disabled at 45% opacity.
- **Ghost:** 1px ink border, transparent; fills ink on hover.
- **Text button:** muted underlined text (reset, copy link) that turns ink on hover.
- **Focus:** 2px warning-yellow outline, 3px offset, on every link and button.

### Segmented Controls
- **Style:** a 1px line frame (5px) with 3px padding holding borderless 13px buttons (3px corners).
- **State:** pressed is an ink fill with enamel-ink 600 text; a trailing count in 600 at 60% opacity; buttons with a zero count are disabled at 40%.
- **Direction filter:** the six research directions plus "all", in a no-wrap row that scrolls horizontally.

### Chips
- **Style:** 1px line border, 4px corners, muted 13px text; hover lightens the border and text.
- **State:** pressed matches the segmented control (ink fill, enamel-ink 600), with a trailing count.

### Tags
- **Style:** 11.5px on an 18px line, 3px corners, tag fill with ink text.
- **Incident:** warning-yellow fill with enamel-ink 600 text.
- **Chinese-only marker:** an outlined 11px tag in muted text with a #4a5650 border reading "Chinese only", shown only in English mode after untranslated text.

### Inputs / Fields
- **Style:** rail fill, 1px line border, 5px corners, 14px text (15px in the upload form, 17px for the search page box); labels in 13px muted above.
- **Focus:** the border goes transparent and a 2px warning-yellow outline appears at 1px offset.
- **Error:** invalid fields (after interaction) take a signal-red border.
- **Header search:** a 170px rail field in the bar that widens to 230px on focus.

### Navigation
- **Header bar:** 64px, ruled below; uppercase condensed wordmark with a green square mark; nav links in muted text with 4px rail hover, current page in ink; the update stamp in 13px muted; the language link is an outlined 13px 600 pill reading "EN" or "中文".
- **Evaluation sub-navigation:** on results, benchmarks, methods and upload, a ruled row of tabs whose current tab gets ink 600 text and a 2px warning-yellow underline.
- **Mobile:** nav becomes a horizontal scroll row under the brand.

### Ruled Tables
- **Style:** a 2px ink top rule, 12.5px muted 600 headers, 1px line row rules, 14px cell padding, rail hover on rows.
- **Sortable header:** header buttons with a 10px chevron at 35% opacity; the sorted column turns ink, the chevron goes solid and flips for ascending. Numeric columns right-align, and their cells use condensed 800 figures (26px, dim figure when zero).

### Expandable Items
- **Signal item:** a full-width button row (date figure, two-line clamped title, tag and source line, 12px chevron). Hover or open fills rail; open rotates the chevron 180deg and turns it ink. The detail panel below is rail, indented to the title column, with prose at 62ch, tags, and source links that turn yellow on hover. One item open per list.
- **Expandable table row:** the same chevron button in the first cell; the following row opens as a rail definition list.

### Green Board (signature)
Safe-green panel, 6px corners, with the inner rule (see The Inset Rule Rule). The home board holds the headline sentence, the plates with a semi-condensed unit word, a last-incident definition list on a 28%-alpha rule, and the incident strip at the bottom. Inner pages reuse it for their key count or comparison boundary; controls inside it sit above the inner rule.

### Enamel Number Plates (signature)
Two or more enamel tiles, zero-padded, each with a 2px seam across the middle and a grey rivet near the top. On load they turn into place from -88deg on the X axis (0.9s, second plate delayed 0.12s). Small static plates head day groups on records and year groups on papers.

### Daily Incident Strip (signature)
A bar per day for the last 14 days, with the count above and the day of the month below (the month is added on the first column and on the 1st). Incident days are yellow; days without incidents are pale board ink at 35%; days outside the collected range are hatched with a dashed border and a dash for the count. Bars rise from the bottom in sequence (0.7s, 40ms stagger). A legend explains all four states. The scorecard reuses it as a small 14px-column week chart.

### Evidence Squares
A row of 10px outlined squares, filled up to the evidence level; the top level is yellow, the lowest dim.

## Do's and Don'ts

### Do:
- **Do** put each page's key number or boundary on one green board with its 2px inner rule.
- **Do** set every count in condensed 800 Archivo, on enamel plates when it is the page's headline number.
- **Do** open every table and list with a 2px ink top rule and divide rows with 1px line rules.
- **Do** use warning yellow for incidents, warnings, the current selection and focus, and signal red only for negatives and errors.
- **Do** show uncollected days as hatched with a dashed border, never as zero.
- **Do** write every string in Chinese with an English pair (`data-en` or `T(zh, en)`), and mark untranslated Chinese prose "Chinese only" in English mode.
- **Do** keep motion to plates turning and bars rising, inside `prefers-reduced-motion: no-preference`.

### Don't:
- **Don't** use green as a text, border or button colour on the graphite ground.
- **Don't** fill neutral surfaces or headings with yellow or red.
- **Don't** add shadows to controls, rows or cards; only boards and plates are lifted.
- **Don't** add a light theme, a second typeface, or languages other than Chinese and English.
- **Don't** box lists into cards; they are ruled rows on the ground.
