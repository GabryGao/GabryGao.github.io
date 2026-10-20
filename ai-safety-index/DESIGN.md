---
name: AI Safety Index
description: White research portal with clear sans typography and flat topic blocks.
colors:
  primary: "#2563eb"
  button-blue: "#285de5"
  blue-hover: "#1d4ed8"
  link-blue: "#24549e"
  hero-violet: "#6d28d9"
  white: "#fff"
  ink: "#101010"
  slate-ink: "#111827"
  muted: "#475569"
  line: "#e2e8f0"
  pale-blue: "#eff6ff"
  soft-surface: "#f8fafc"
  announcement: "#0f172a"
  mint: "#dceee6"
  lilac: "#e9e4f5"
  topic-blue: "#e0eaf4"
  peach: "#f6dfd2"
  rose: "#f2e1e8"
  citrus: "#ecedcf"
typography:
  display:
    fontFamily: "'Index Inter', 'PingFang SC', 'Hiragino Kaku Gothic ProN', 'Microsoft YaHei', sans-serif"
    fontSize: "60px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-.04em"
  headline:
    fontFamily: "'Index Inter', 'PingFang SC', 'Hiragino Kaku Gothic ProN', 'Microsoft YaHei', sans-serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.15
    letterSpacing: "-.03em"
  page-title:
    fontSize: "46px"
    fontWeight: 500
    lineHeight: 1.15
    letterSpacing: "-.035em"
  resource-title:
    fontSize: "22px"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "-.025em"
  body:
    fontFamily: "'Index Inter', 'PingFang SC', 'Hiragino Kaku Gothic ProN', 'Microsoft YaHei', sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.65
  intro:
    fontSize: "20px"
    lineHeight: 1.5
  button:
    fontSize: "16px"
    fontWeight: 500
    lineHeight: "22px"
  label:
    fontSize: "13px"
  footer-brand:
    fontSize: "22px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "-.035em"
rounded:
  flat: "0"
  field: "6px"
  blog-cover: "8px"
  topic-panel: "12px"
  pill: "999px"
spacing:
  small: "8px"
  action-gap: "16px"
  card-padding: "24px"
  grid-gap: "28px"
  section-gap: "48px"
  section-block: "80px"
components:
  button-primary:
    backgroundColor: "{colors.button-blue}"
    textColor: "{colors.white}"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  button-primary-hover:
    backgroundColor: "{colors.blue-hover}"
  button-secondary:
    backgroundColor: "{colors.white}"
    textColor: "#111"
    typography: "{typography.button}"
    rounded: "{rounded.pill}"
    padding: "14px 32px"
  contact-field:
    backgroundColor: "{colors.white}"
    textColor: "{colors.slate-ink}"
    rounded: "{rounded.field}"
    padding: "11px 12px"
  resource-card:
    backgroundColor: "{colors.topic-blue}"
    textColor: "{colors.ink}"
    rounded: "{rounded.flat}"
    padding: "24px"
  navigation:
    backgroundColor: "{colors.white}"
    textColor: "{colors.slate-ink}"
    height: "70px"
  topic-link:
    textColor: "#4f6255"
    size: "11px"
  status-notice:
    backgroundColor: "{colors.pale-blue}"
    padding: "20px 24px"
---

# Design System: AI Safety Index

## Overview

**Creative North Star: "Clear public research entrance"**

The chosen visual world is a clear, public research entrance: white space, decisive sans headings and source-linked collections. The homepage carries the user-selected AstroWind framework; resource pages adapt Madeo's flat color blocks to dense research metadata. These are the established references, not permission to import unrelated agency content.

Dark text and cool slate copy keep the reading calm. Blue controls make paths visible, solid violet gives the hero a single point of emphasis, and pale topic fields organize collections without implying research quality. Inter and CJK sans fallbacks replace the earlier editorial serif identity throughout shared headings and wordmarks.

**Key Characteristics:**

- White canvas and open margins.
- Clear sans hierarchy with balanced headings.
- Flat topic fields with original source metadata.
- Restrained, progressive motion with visible default content.

## Colors

Blue actions, a solid violet hero emphasis and six light topic fields sit on white. The frontmatter is normative; inherited compatibility variables are not a second palette.

### Primary

- **Action Blue** (`primary`): focus outlines, active navigation marks, timeline strokes and control accents.
- **Pill Blue** (`button-blue`): the actual primary action fill; **Deep Action Blue** (`blue-hover`) supplies its hover state.
- **Research Link Blue** (`link-blue`): text links and the compatibility editorial accent.

### Secondary

- **Hero Violet** (`hero-violet`): the emphasized span of the homepage headline, as a solid fill.
- **Topic fields:** mint maps to data/privacy; lilac to foundation models; topic blue to agents/software; peach to physical AI; rose to human/societal safety; citrus to AI+X/science. Color supplements visible labels. Benchmark and collaboration blocks may cycle the established blue/lilac/mint surfaces without claiming a topic.

### Neutral

White is the base and the topic-panel surface. Ink/slate ink carry headings; muted slate carries supporting copy; the light line token defines separators. Pale blue grounds vision and status notices; the soft surface grounds the reserved blog area. The dark announcement strip is a compact utility band.

**The White Canvas Rule.** White is the page base; pale fills organize sections and topic blocks rather than replacing it.

## Typography

Self-hosted Inter is exposed as **Index Inter**. The main fallback stack is in the tokens. Japanese switches the fallback order to Hiragino Kaku Gothic ProN, Yu Gothic, then sans-serif. Headings and body share the sans family; the legacy serif variable is intentionally aliased to it.

The desktop hero uses the display role; at phone width it becomes (48px, line-height 1), and at (360px) or below (43px). Japanese mobile hero line-height is (1.15). Homepage section headings use the headline role, becoming (30px) on phones. Resource page titles use the page-title role, becoming (36px, line-height 1.2). Paper titles use the resource-title role, becoming (26px, line-height 1.35) on phones. News titles share the desktop size with a slightly more open (1.4) line-height, becoming (25px) on phones.

The hero introduction uses the intro role and a (768px) maximum measure; resource page descriptions cap at (72ch). Metadata is generally (10–13px). Dates and scores use tabular numerals. The header wordmark is (23px); the footer wordmark is explicitly the footer-brand role and must not inherit the older editorial font/size.

**The Original Title Rule.** Scientific titles wrap in full; retain the source wording and let block height grow.

## Layout

The shared desktop header has a (1280px) maximum container, (70px) minimum height and a white surface. The announcement is (36px) minimum height. At (1080px) and below, navigation becomes a vertical menu below the header; at (767px) and below the header is (72px), announcement is hidden and search icon is removed. The footer has four desktop columns; on phones its brand spans a two-column link grid.

Homepage hero copy and artwork cap at (1024px); the artwork retains its original (16:9) aspect ratio. The hero's outer container caps at (1152px). Homepage sections use (80px) vertical padding, becoming (48px) on phones. Main section content uses a (1072px) container including horizontal padding. Features use two columns with (48px 32px) gaps; vision uses two columns with a (64px) desktop gap. Both become one column on phones. Primary/secondary hero actions sit side by side, then stack within a (320px) maximum width on phones.

The timeline alternates around a central one-pixel rule on desktop, with (48px) circular markers and an (80px) text gap. On phones it becomes a left-aligned rail with (42px) markers and (64px) text inset. Blog and preview blocks use three desktop columns and one phone column.

Resource containers cap at (1280px) including (48px) horizontal padding. Paper, news, benchmark, topic and method grids have three columns above (1080px), two from (768px) through (1080px), and one at (767px) and below. Desktop resource gaps are (34px 28px); phone gaps are (30px). Container side padding becomes (32px) at medium width and (20px) on phones. Paper/news blocks use (24px) padding on desktop and (26px) on phones. Published score comparisons remain horizontally scrollable tables rather than cards.

## Elevation & Depth

Resource surfaces are flat. Tonal fields, whitespace and rules establish separation. Small pointer lifts and arrow movement provide state feedback without a card shadow. The mobile navigation alone uses a faint lower shadow (`0 12px 24px #0f172a0a`); existing dialogs retain their overlay shadow (`0 24px 100px #102f3a40`). These functional overlays do not establish a decorative card style.

**The Flat Resource Rule.** Research blocks use color and spacing for separation, without card shadows or rounded containers.

Motion progressively enhances already-visible content: brief cover reveals, one-time block arrivals and a capped sibling delay. Cards lift (5px) only for precise pointers; source arrows shift diagonally. Route replacement cancels old motion. Language changes update text in place without replaying entrances. Reduced motion cancels entrances and spatial feedback. Exact timing/easing lives in the sidecar and source motion layer.

## Shapes

Resource blocks have square corners. Homepage actions are pills; field and language controls use the field radius. The white vision topic panel has gently curved corners, reserved blog covers use the blog-cover radius, and feature/timeline icons use circular silhouettes. Boundaries are restrained one-pixel rules, with explicit visible focus outlines rather than ambient glows.

## Components

### Buttons

Primary actions use Pill Blue with white text, a matching one-pixel border and the documented pill padding. Their minimum height is (52px). Secondary actions are white with dark text and a neutral border, changing to the soft surface with a muted border on hover. Both use a short (.2s) transition and a (1px) precise-pointer lift. Focus uses a (2px) Action Blue outline offset (4px).

### Cards / Containers

Paper covers are full original-title source links on pastel topic fields, followed by authors, independent topic links and the original source link on white. Desktop paper covers have a (254px) minimum height. News blocks have a (300px) minimum height and explicit source/date/review labels. Content can expand these blocks. Topic cards and benchmark catalogs share the flat grammar; number comparisons retain tables.

### Inputs / Fields

Contact fields use white, slate text, a one-pixel slate border (`#94a3b8`), the field radius and documented padding. Labels remain visible; textarea resizing is vertical. Input caret and focus use Action Blue. Contact status is a pale blue notice, and the primary action accurately says it downloads a local draft. Search/filter controls retain their compact existing grammar.

### Navigation

The five module links are dark, medium-weight (14px) desktop text with a (70px) line box. Hover and active text use Deep Action Blue; active desktop links gain a (2px) blue underline. Mobile menu links are (18px), stack vertically and wrap normally. The language selector remains a compact native control.

### Topic links and filter chips

Paper topic links are compact (11px) text, wrap independently and do not share the whole-cover hit area. Keyword filters retain their small rectangular border/radius treatment; selected filters use the blue token with pale blue fill. Color never replaces the visible topic or selected-state label.

### Reference artwork and reserved blog covers

The homepage uses the unmodified AstroWind raster and its recorded source/license. Preserve the raster and font provenance in `assets/framework-asset-sources.json`, `assets/AstroWind-LICENSE.md` and `assets/Inter-OFL.txt`. Keep the older conceptual illustration's provenance in `assets/image-provenance.json` and legacy font licenses. Reserved blog covers are simple pastel icon fields with explicit planned-content labels; they do not imply published articles.

## Do's and Don'ts

### Do:

- **Do** keep the base canvas white and use the documented sans family in shared headings and wordmarks.
- **Do** keep topic labels visible alongside their consistent pastel color.
- **Do** preserve full original scientific titles and independent source/topic links.
- **Do** keep content visible before motion and cancel spatial feedback for reduced motion.
- **Do** use the actual button fill token; the primary control/focus token is a distinct blue.

### Don't:

- **Don't** restore the previous serif/news-first homepage identity.
- **Don't** turn resource blocks into rounded, shadowed cards.
- **Don't** use a gradient for the solid violet hero emphasis.
- **Don't** invent paper artwork, research figures, scores or people to fill a block.
- **Don't** hide or clamp scientific titles to equalize card height.
