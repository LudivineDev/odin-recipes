# Recipe site redesign — design spec

Date: 2026-08-06

## Goal

Redesign the Odin Recipes static site so it looks like a modern food blog, works well on
phones, and lets you find a recipe by typing instead of scrolling a long list. Approved
mockup: https://claude.ai/code/artifact/b34aaf44-ad64-4df0-9754-36c90d3a474a

## Scope

- Rebuild `index.html` + `style.css` as a responsive card grid with a live search box.
- Restyle the 18 existing recipe pages in `recipes/` to match (hero image/color band, clean
  ingredient/instruction layout, mobile-friendly type), using each page's real content —
  no content changes beyond what's needed to fit the new layout.
- Add a new recipe: **Salade de Pâtes Roquette & Boursin** (pasta, arugula, cured ham, cherry
  tomatoes, sautéed zucchini, garlic-herb cheese cubes) as `recipes/pates-roquette.html`,
  linked from the index.
- Stay plain HTML/CSS/vanilla JS — no build step, no framework, no backend (per prior
  decision).

Out of scope: changing/curating recipe content, adding photos, categorization/filtering
beyond search (flat list + search only, per prior decision).

## Architecture

Same static-file structure as today (`index.html`, `style.css`, `recipes/*.html`,
`images/`), plus one new small file:

- `style.css` — rewritten with the mockup's design tokens (CSS custom properties for
  color/spacing), responsive grid, card styles, and recipe-page styles. Supports light/dark
  via `prefers-color-scheme`.
- `search.js` — small vanilla-JS file included on `index.html` only. Filters the recipe
  cards already in the DOM by title as the user types (no data fetching, no build-time
  data file — the cards themselves are the source of truth, same as today's plain `<li>`
  list).
- `index.html` — card grid markup (image, title, one-line meta), search input in a sticky
  header.
- Each `recipes/*.html` — restyled with the shared `style.css` classes; ingredients/
  instructions markup stays semantic `<ul>/<ol>`, just restyled.

No JS framework, no client-side routing — recipe pages remain separate real HTML pages
(so they keep working as plain links, are shareable, and stay simple to hand-edit).

## Data flow

Search has no external data source: `search.js` reads the recipe cards already rendered in
`index.html` (title text + optional data attributes for category), filters by substring
match on each keystroke, and shows/hides matching cards. An empty-state message appears
when nothing matches.

## Visual design

Carried over from the approved mockup: warm off-white background, bold sans headline type,
one persimmon/tomato accent color (`#E4572E` light / `#FF7A50` dark), card grid with
colored gradient thumbnails, sticky search header. Recipe pages get a matching hero band,
ingredient list, and numbered instruction steps.

## Testing

Manual only (static site, no test framework in this repo):
- Open `index.html` in a browser at a phone-width viewport and a desktop width; confirm the
  grid reflows and the layout doesn't break.
- Type into search; confirm it filters live and the empty state shows for a nonsense query.
- Spot-check a handful of recipe pages (including the new pasta salad and a couple of the
  longer French ones) for readability and that no content was dropped in the restyle.
