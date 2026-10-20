---
name: AI Safety Index
description: Unified MADEO-referenced editorial research site with a white canvas, light display type and conceptual covers.
colors:
  primary: '#2563eb'
  white: '#fff'
  pale-blue: '#eff6ff'
  madeo-blue: '#2b4fa5'
  madeo-mint: '#5fc79f'
  madeo-peach: '#f1a56f'
  madeo-black: '#000'
  madeo-copy: '#333'
  madeo-muted: '#555'
  madeo-rule: '#c9c9c5'
  madeo-field-rule: '#777'
  madeo-pill-rule: '#cccbd0'
  madeo-cover-placeholder: '#f1f1ef'
  madeo-topic-link: '#365052'
  home-action-hover: '#213f88'
  home-action-rule: '#a8a8a3'
  home-secondary-ink: '#111'
typography:
  display:
    fontFamily: '''Index Display'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: clamp(52px,5vw,72px)
    fontWeight: 400
    lineHeight: 1.12
    letterSpacing: -.035em
  headline:
    fontFamily: '''Index Display'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 44px
    fontWeight: 400
    lineHeight: 1.2
    letterSpacing: -.03em
  page-title:
    fontFamily: '''Index Display'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 72px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -.035em
  resource-title:
    fontFamily: '''Index Inter'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -.025em
  subpage-intro:
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -.02em
  subpage-body:
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.7
  subpage-label:
    fontSize: 12px
    lineHeight: 1.7
  subpage-nav:
    fontSize: 17px
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: -.02em
  menu-link:
    fontFamily: '''Index Display'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 78px
    fontWeight: 400
    lineHeight: 1.1
    letterSpacing: -.035em
  mobile-page-title:
    fontFamily: '''Index Display'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 39px
    fontWeight: 400
    lineHeight: 1.154
    letterSpacing: -.025em
  mobile-resource-title:
    fontSize: 22px
    fontWeight: 400
    lineHeight: 1.45
    letterSpacing: -.02em
  body:
    fontFamily: '''Index Inter'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 16px
    fontWeight: 400
    lineHeight: 1.65
  intro:
    fontSize: 19px
    lineHeight: 1.65
  button:
    fontSize: 15px
    fontWeight: 400
    lineHeight: 22px
  label:
    fontSize: 13px
  mobile-home-display:
    fontFamily: '''Index Display'', ''PingFang SC'', ''Hiragino Kaku Gothic ProN'', ''Microsoft YaHei'', sans-serif'
    fontSize: 42px
    fontWeight: 400
    lineHeight: 1.14
    letterSpacing: -.035em
rounded:
  flat: '0'
  pill: 999px
spacing:
  small: 8px
  grid-gap: 28px
  subpage-side: 6vw
  subpage-mobile-side: 5vw
  subpage-column: 28px
  subpage-row: 44px
  subpage-copy: 24px
  subpage-opening: 90px
  subpage-mobile-opening: 60px
  subpage-mobile-grid: 42px
  subpage-mobile-copy: 22px
  home-opening: 90px
  home-mobile-opening: 54px
  home-section: 70px
  home-mobile-section: 48px
  home-intro-column: 60px
  home-hero-copy-bottom: 50px
  home-count-inset: 24px
components:
  button-primary:
    backgroundColor: '{colors.madeo-blue}'
    textColor: '{colors.white}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    padding: 12px 24px
    height: 48px
  button-primary-hover:
    backgroundColor: '{colors.home-action-hover}'
  button-secondary:
    backgroundColor: '{colors.white}'
    textColor: '{colors.home-secondary-ink}'
    typography: '{typography.button}'
    rounded: '{rounded.pill}'
    padding: 12px 24px
    height: 48px
  contact-field:
    textColor: '{colors.madeo-black}'
    rounded: '{rounded.flat}'
    padding: 10px 0
  resource-card:
    textColor: '{colors.madeo-black}'
    typography: '{typography.resource-title}'
    rounded: '{rounded.flat}'
    padding: '0'
  navigation:
    backgroundColor: '{colors.white}'
    textColor: '{colors.madeo-black}'
    height: 90px
    typography: '{typography.subpage-nav}'
  menu-trigger:
    backgroundColor: '{colors.madeo-mint}'
    rounded: 50%
    padding: 17px
    width: 60px
    height: 60px
  menu-close:
    backgroundColor: '{colors.madeo-peach}'
    rounded: '{rounded.flat}'
    padding: 17px
    width: 60px
    height: 60px
  menu-dialog:
    backgroundColor: '{colors.madeo-blue}'
    textColor: '{colors.white}'
    rounded: '{rounded.flat}'
    width: 100vw
    height: 100dvh
  filter-pill:
    backgroundColor: '{colors.white}'
    textColor: '{colors.madeo-blue}'
    rounded: '{rounded.pill}'
    padding: 6px 20px
  filter-pill-active:
    backgroundColor: '{colors.madeo-blue}'
    textColor: '{colors.white}'
  topic-link:
    textColor: '{colors.madeo-topic-link}'
    size: 12px
  source-link:
    textColor: '{colors.madeo-blue}'
    padding: 0 0 3px
---
# Design System: AI Safety Index

## Overview

**Creative North Star: "An open editorial research portfolio"**

The homepage and research routes share one MADEO-referenced editorial identity: open white space, light DM Sans headings, Inter copy, conceptual covers, fine rules and restrained blue actions. Home retains its supplied content and module order, now expressed with a left headline, right introduction and actions, three topic covers and an inline count row. Its previous centered violet AstroWind presentation is superseded.

Research evidence remains readable beside the visual system. Original titles, metadata and source links form the copy hierarchy; conceptual covers provide editorial topic cues. The shared black wordmark, green menu circle and full-screen blue native dialog connect every route without borrowing agency clients, people or contact details.

**Key Characteristics:**

- White canvas, fine rules and generous opening space.
- Light DM Sans headings and Inter supporting copy across home and research routes.
- Three topic covers on home and three-column desktop research collections.
- Two-column tablet collections, single-column phone collections and a compact three-cover home triptych.
- Shared native blue navigation, flat surfaces and reduced-motion alternatives.

## Colors

The frontmatter records the active shared palette and the homepage action variants.

### Primary

- **Portfolio Blue** (`madeo-blue`) fills the full-screen menu, primary home actions, selected pills and contact geometry; it marks source links and navigation states. **Deep Portfolio Blue** (`home-action-hover`) is the home primary hover fill.
- **Focus Blue** (`primary`) remains the root visible-focus token; it is distinct from Portfolio Blue.

### Secondary

- **Menu Mint** (`madeo-mint`) fills the circular shared menu trigger and contact geometry. **Close Peach** (`madeo-peach`) fills the square dialog close control. Pale blue remains a route-curtain destination color.

### Neutral

White is the base and copy surface. Black carries headings; charcoal carries body copy; medium gray carries metadata. Fine gray rules separate the header, home modules and counts. Darker field and pill rules define controls. The cover placeholder is a loading surface. The home secondary action uses its own gray border and near-black text.

**The White Canvas Rule.** Keep the page base white; let editorial images, content spacing and fine rules establish the collection.

## Typography

Home display headings use the self-hosted **Index Display** DM Sans family at the frontmatter clamp, black and regular weight. The home hero becomes (52px) at widths (768–1050px), (42px/1.14) on phones and (38px) at widths up to (360px). Home section headings use the headline token, reducing to (32px/1.25) on phones. The introduction uses (19px/1.65), reducing to (17px); action labels use the button token, reducing to (14px). Home body copy remains Inter.

Subpage display headings use **Index Display**, the self-hosted OFL-licensed DM Sans variable font, with CJK sans fallbacks. Body copy, collection titles and controls use Index Inter and the language-appropriate sans fallback stack. Japanese Inter fallback order remains Hiragino Kaku Gothic ProN, Yu Gothic, then sans-serif. Scientific wording stays in its original language.

The page-title, resource-title, subpage-intro and mobile roles in the frontmatter are normative. Desktop page headings use (72px), with the phone scale unchanged. Topic detail titles use (72px, line-height 1.15) on desktop and (39px, line-height 1.25) on phones. Subpage introductions become (19px, line-height 1.55) on phones. Desktop collection copy uses (14px/1.65); tablet and phone copy uses (15px/1.7). Tablet resource titles retain (26px/1.462). Contact fields use (17px, line-height 1.6), reducing to (16px). Menu links reduce to (64px) at compact width, to the mobile display scale on phones, and grow to (90px) on wide displays. The narrowest page headings reduce to (35px).

Supporting descriptions cap at (65ch), page introductions at (72ch). Authors, topic links and record metadata occupy separate lines, generally (12–13px), reducing where explicitly defined on phones. Tabular numerals remain for dates and scores.

**The Original Title Rule.** Scientific titles wrap in full below the media; preserve wording and let block height grow.

## Layout

**Homepage.** The original introduction, four value propositions, source-linked news, vision and six topic links, four milestones, planned blog categories and contact action retain their order. Main home containers use (88%) width capped at (1160px), changing to (90%) on phones. The hero opens with (90px) top padding, reduced to (54px) on phones. Its text grid uses (1.1fr/1fr) columns with a (60px) gap; phone content stacks. Three equal cover links use (28px) gutters and (1.35) images; phones keep all three, with (10px) gutters, square images and (12px) captions. Counts sit inline between rules, with (24px) vertical inset. Sections use (70px) vertical padding, reducing to (48px). Feature icons are plain blue strokes beside ruled copy. Vision and planned blogs stay white with square covers. The timeline is a ruled date-and-copy list, stacking its date above copy on phones. Planned blog previews become one column on phones.

**Shared shell.** Every route uses a sticky white header of (90px), with a rule inside an (88%) container: (6vw) side margins. The first heading begins after the documented opening padding, approximately (y180) at a (1280px) viewport. The user requested a smaller overall scale after the first reference rebuild. Header navigation hides at compact-subpage width while the green menu remains available at all widths. Research content caps the (88%) container at (1160px); the shared header retains its wider reference rule.

**Collections.** At widths of (1024px) and above, three equal columns use (28px) gutters and (44px) row gaps. Six research directions form two rows. At (1280px), covers are approximately (357px) wide. Tablet widths of (768–1023px) retain two columns and phones retain one. Desktop collection titles use (22px/1.45), with (14px/1.65) descriptions. Collection covers use aspect ratio (1.35), followed by a (24px) copy interval; cards have no internal panel padding. News covers also use aspect ratio (1.35); items align in straight rows on desktop; tablet even items shift down (60px) without changing chronological DOM order. Desktop direction/benchmark detail covers retain aspect ratio (2.1), capped at (400px) height, and the detail copy uses asymmetric columns. Team cooperation cards form a horizontal gallery with (35.2vw) items and a (30px) gap; these are not person profiles. Contact begins with two equal entry panels and a separate two-column draft area.

**Phones.** At the phone breakpoint, the header is (65px), the container is (90%) with (5vw) margins, and page opening padding is the mobile token. Collections become one column with the mobile grid/copy intervals. News loses its vertical stagger. The search/filter disclosure occupies its own normal-flow row below the pill group; expanded controls stay in flow. Detail covers use aspect ratio (1.2), and detail/contact areas stack. Team cards use (83vw) with a (20px) gap to show continuation. Published score tables keep a (670px) minimum width inside their own horizontal scroll container.

## Elevation & Depth

Subpage cards, fields, header and full-screen menu are flat. Media, white space, type and rules create hierarchy; the native blue dialog has no shadow. Home actions and shared navigation are flat too. Unrelated legacy dialogs retain their functional overlay shadow; it does not establish a resource-card elevation style.

Cover images zoom only for precise pointers. The cover transition and contact geometry timing live in the sidecar; reduced motion cancels both. Language changes update content in place without replaying entrances. Route/topic changes use an interruptible curtain: (480ms) entry, (200ms) hold and (420ms) exit, with a (2400ms) fail-safe. A newer route cancels stale commits. Same-route filters/pagination do not play the curtain. Reduced motion bypasses the spatial sequence. Default content remains visible without animation.

**The Flat Collection Rule.** Subpage cards remain transparent and unboxed; use the media-to-copy interval and row gap for separation.

## Shapes

Subpage covers, cards, fields and the blue dialog have square corners. The green trigger is circular; the peach close control is square. Filters are outlined pills, filling blue when selected. Contact and catalog controls use a single bottom rule. Homepage action pills share the rounded control language; home topic lists, feature areas and blog covers are square and unboxed.

## Components

`portal-home.js` wraps the original home renderer after the framework script and before MADEO. `portal-madeo` applies the shared shell through `madeo-subpage` on every route; home additionally receives `madeo-home`. `portal-home.css` loads last and owns home composition overrides.

### Buttons

Homepage primary and secondary pills use the frontmatter blue/white variants, minimum (48px) height and brief pointer feedback; phones reduce to (44px). The shared menu trigger uses its circular mint component, with a dark thin-line icon. Its native dialog close button uses the peach square variant; both become (45px) on phones. Subpage draft/source actions are restrained text actions with a blue bottom rule. Focus remains visibly outlined; menu focus uses white against blue.

### Cards / Containers

A conceptual topic cover leads each research item; a small white cover label explicitly names its editorial role. Full original title, description, authors, topic links, metadata and source action follow on white. Covers fill and crop their region; no fixed title height, clamp, pastel title panel or equal-height text box is used. Keep numeric results in factual tables.

### Inputs / Fields

Catalog search and selects use an unrounded bottom rule, white background and visible labels. Contact fields are transparent, square and ruled, with the documented padding. Textarea resizing remains vertical. The action downloads a local draft; the surrounding text keeps receiver status explicit.

### Navigation

Every route uses the shared header navigation and circular button controlling native dialog `madeo-menu`. The home mobile wordmark reads “AI Safety Index”; other routes expose their page label. The full-screen blue dialog places its large white link column on the right on desktop and above utility links on phones; the peach close square sits at the upper right. The dialog supports Escape, focus return and body-scroll locking. Current links have a thin underline; long destinations wrap. The compact native language selector remains available. Shared header links reveal subcategory disclosures on fine-pointer hover and keyboard focus; ArrowDown enters the links and Escape closes them. Dropdowns are two columns within an (860px) cap. Full-screen menu groups use (42px) plus toggles, reduced to (36px) on phones, to reveal the same real destinations. A custom teal pointer is (18px), growing to (26px) over actions; it is hidden for touch, narrow screens, text inputs, keyboard use and reduced motion.

### Filter pills and news disclosure

Type/topic pills wrap, use the selected blue fill and retain readable labels. Phone pills use (14px) text, (7px 17px) padding and (36px) minimum height. News search/filter options open below them in normal flow on phones. Search, sort, pagination and language changes preserve route state and local drafts.

### Team roster

The confirmed two-person roster uses two ruled columns, stacking on phones. Names use (36px/1.25) DM Sans, (30px) on phones; roles use (16px), institutions (17px), with a (36px) column gap and (70px) gap before the cooperation gallery. User-specified names, roles and affiliations remain product facts; cooperation images remain conceptual.

### Editorial assets

Home reuses the existing privacy, physical and human concept covers for its three topic links, and alignment, agents and human covers for planned blogs. No raster was generated or edited for this refinement. The original AstroWind artwork and license remain historical provenance, not the active home hero. Six generated covers in `assets/madeo/` form a reusable concept system with exact prompts, generation records and roles in `provenance.json`. DM Sans retains its OFL record there. Covers are topic imagery, never research figures or team identities; the geometric contact panel is a separate blue/mint signature.

## Do's and Don'ts

### Do:

- **Do** preserve home content, module order and source links while using the shared editorial identity.
- **Do** use three desktop collection columns, two tablet columns and one phone column; keep the home phone triptych compact.
- **Do** keep full original titles, independent topic/source links and evidence tables readable.
- **Do** label conceptual covers and retain image/font provenance with shipped assets.
- **Do** keep filters and expanded search controls in normal flow on phones.
- **Do** retain visible focus and cancel cover/contact motion for reduced motion.

### Don't:

- **Don't** restore the rejected compact three-column pastel resource cards or former small subpage heading scale.
- **Don't** introduce rounded, shadowed research-card containers.
- **Don't** restore the centered violet hero, cartoon artwork, announcement band or blue icon circles on home.
- **Don't** crop or clamp scientific titles to equalize rows.
- **Don't** present conceptual images as paper figures, project documentation or team portraits.
- **Don't** imply that the local contact draft sends a message or that historical results are current rankings.

