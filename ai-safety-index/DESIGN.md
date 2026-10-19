# AI Safety Index visual system

Latest user direction (2026-10-19): use Madeo Studio as a layout reference and replace long, one-item-per-line displays with independent blocks. The white background remains an explicit earlier requirement. Preserve the established Newsreader/CJK serif identity and all research data.

## Block layout

`portal-grid.css` is the final stylesheet. Resource libraries, research directions, benchmarks, highlights and method catalogs use two-column desktop grids with 32px gutters and square, flat color fields. At 767px and below, cards become a single column with 24–30px spacing. Standard evaluation score tables remain tabular for comparison.

Paper cards contain a typographic cover (source, publication metadata, full original title, research category), followed by authors, topic links and the original paper link on white. The whole cover is a native link; topic links remain independent. Covers contain no invented paper figures, scores, popularity claims or abstract artwork. Titles wrap in full and are never clamped. Visual order follows DOM order.

Six topic colors are consistent across topic cards and paper covers: mint for data/privacy, lilac for foundation models, blue for agents/software, peach for physical AI, rose for human/societal safety, citrus for AI+X/science. Color supplements visible labels. Content text is dark with no card shadows or rounded containers.

Homepage highlights remain independent from the topic taxonomy. One lead block retains the existing clearly captioned conceptual illustration; two secondary blocks are text-led. This follows Madeo's generous two-column content structure without copying its project content or imagery.

## Existing behavior

Preserve hash routes, direction and publication-type filters, pagination, original sources, provenance and the distinction between inclusion and reproduced results. Chinese, English, Japanese and German switch in place through `locale.js`, preserving page and input state. Original scientific titles and author names retain source wording. Keep keyboard focus visible and honor reduced motion.


## Motion (2026-10-20)

`portal-motion.css` and `portal-motion.js` enhance the block layout without changing data or navigation. The homepage illustration opens through a brief crop reveal. Newly visible resource blocks settle into place once, with a capped sibling delay. Page headings have a short arrival transition; card covers and link arrows provide pointer and keyboard feedback. No loops, paid services or animation libraries are added.

Default content stays visible. Reduced-motion preferences bypass entrances and spatial feedback. Fast route replacement cancels old animations; language text changes do not restart entrances or touch page state. The module watches only direct main-child replacements and uses IntersectionObserver for one-time card arrivals.
