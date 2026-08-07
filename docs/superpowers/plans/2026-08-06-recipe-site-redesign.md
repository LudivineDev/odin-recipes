# Recipe Site Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn Odin Recipes into a mobile-friendly, searchable, modern-food-blog-styled static site, matching the approved mockup, without changing recipe content beyond what the restyle requires.

**Architecture:** Same static-file structure as today — `index.html`, `style.css`, `recipes/*.html`, `images/`. One new file, `search.js`, does client-side filtering of the cards already in the DOM. No build step, no framework, no backend.

**Tech Stack:** Plain HTML5, CSS (custom properties, Grid/Flexbox), vanilla JS (ES6+). No dependencies.

**Design source of truth:** the approved mockup at
https://claude.ai/code/artifact/b34aaf44-ad64-4df0-9754-36c90d3a474a and the spec at
`docs/superpowers/specs/2026-08-06-recipe-site-redesign-design.md`. Reuse its exact tokens:
`--bg:#FAFAF7 / #15140F(dark)`, `--accent:#E4572E / #FF7A50(dark)`, gradient thumbnails, sticky
search header, card grid `repeat(auto-fill, minmax(230px,1fr))`.

## Global Constraints

- Plain HTML/CSS/vanilla JS only — no build tools, no framework, no backend.
- Preserve all existing recipe content (ingredients/instructions) — restyle markup, don't rewrite copy.
- Flat list + search only — no category filter UI (category text may still appear as card meta).
- No automated test suite exists in this repo (static site) — verification is manual, in-browser, at both a phone width (~375px) and a desktop width (~1200px).

---

### Task 1: Design tokens and shared base styles

**Files:**
- Modify: `style.css` (full rewrite)

**Interfaces:**
- Produces: CSS custom properties (`--bg`, `--surface`, `--surface-2`, `--ink`, `--ink-soft`, `--ink-faint`, `--accent`, `--accent-ink`, `--accent-soft`, `--line`, `--radius`, `--shadow`) on `:root`, redefined under `@media (prefers-color-scheme: dark)`. Utility classes `.mono`, `.wordmark`, `.recipe-count`. All later tasks style against these tokens/classes instead of hardcoded colors.

- [ ] **Step 1: Replace `style.css` with the token system + base reset**

```css
:root{
  --bg:#FAFAF7; --surface:#FFFFFF; --surface-2:#F1EEE8;
  --ink:#1C1B18; --ink-soft:#6E6A62; --ink-faint:#A29C90;
  --accent:#E4572E; --accent-ink:#FFFFFF; --accent-soft:#FCE7DF;
  --line:#E8E4DC; --radius:14px;
  --shadow: 0 1px 2px rgba(28,27,24,.04), 0 8px 24px -12px rgba(28,27,24,.16);
}
@media (prefers-color-scheme: dark){
  :root{
    --bg:#15140F; --surface:#1E1C16; --surface-2:#26231B;
    --ink:#F2EFE7; --ink-soft:#A79E90; --ink-faint:#726A5C;
    --accent:#FF7A50; --accent-ink:#1B1108; --accent-soft:#3A2317;
    --line:#332E23;
    --shadow: 0 1px 2px rgba(0,0,0,.3), 0 12px 28px -14px rgba(0,0,0,.6);
  }
}
*{box-sizing:border-box;}
html,body{margin:0;}
body{
  background:var(--bg); color:var(--ink);
  font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Helvetica,Arial,sans-serif;
  -webkit-font-smoothing:antialiased;
}
a{color:inherit;}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace; font-variant-numeric:tabular-nums;}
img{max-width:100%; height:auto; display:block;}
```

- [ ] **Step 2: Add the shared header/search styles** (used by `index.html` in Task 2)

```css
header.site{
  position:sticky; top:0; z-index:20;
  background:color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter:blur(10px) saturate(1.1);
  border-bottom:1px solid var(--line);
}
.site-inner{max-width:1080px; margin:0 auto; padding:16px 20px 14px;}
.wordmark-row{display:flex; align-items:baseline; justify-content:space-between; gap:12px; margin-bottom:14px;}
.wordmark{font-size:22px; font-weight:800; letter-spacing:-0.01em; margin:0;}
.wordmark span{color:var(--accent);}
.recipe-count{font-size:12.5px; color:var(--ink-soft); white-space:nowrap;}
.search-wrap{
  position:relative; display:flex; align-items:center;
  background:var(--surface); border:1px solid var(--line); border-radius:999px;
  padding:0 6px 0 14px; height:46px; box-shadow:var(--shadow);
}
.search-wrap svg{flex:none; color:var(--ink-faint);}
#search{flex:1; border:0; outline:0; background:transparent; color:var(--ink); font-size:15px; padding:0 10px; height:100%;}
#search::placeholder{color:var(--ink-faint);}
#clear-btn{
  flex:none; width:32px; height:32px; border-radius:50%; border:0;
  background:var(--surface-2); color:var(--ink-soft);
  display:none; align-items:center; justify-content:center; cursor:pointer;
}
#clear-btn.show{display:flex;}
```

- [ ] **Step 3: Add the card grid + card styles** (used by `index.html` in Task 2)

```css
main{max-width:1080px; margin:0 auto; padding:22px 20px 60px;}
.status-line{font-size:13px; color:var(--ink-soft); margin:0 0 14px; min-height:18px;}
.grid{display:grid; grid-template-columns:repeat(auto-fill, minmax(230px, 1fr)); gap:16px;}
.card{
  text-align:left; background:var(--surface); border:1px solid var(--line);
  border-radius:var(--radius); padding:0; overflow:hidden; cursor:pointer;
  display:flex; flex-direction:column; box-shadow:var(--shadow);
  transition:transform .15s ease;
}
.card:hover{transform:translateY(-2px);}
.thumb{height:118px; position:relative; display:flex; align-items:flex-end; padding:10px;}
.thumb img{width:100%; height:100%; object-fit:cover; position:absolute; inset:0;}
.flag{position:absolute; top:10px; right:10px; font-size:10px; font-weight:700; letter-spacing:.04em; background:rgba(0,0,0,.28); color:#fff; padding:2px 6px; border-radius:6px; z-index:1;}
.card-body{padding:12px 14px 14px; display:flex; flex-direction:column; gap:4px; flex:1;}
.card-title{font-size:15.5px; font-weight:700; line-height:1.25; margin:0;}
.card-meta{font-size:12px; color:var(--ink-soft); display:flex; gap:6px; align-items:center; margin-top:2px;}
.card-meta .dot{width:3px; height:3px; border-radius:50%; background:var(--ink-faint); flex:none;}
.empty{grid-column:1/-1; text-align:center; padding:60px 20px; color:var(--ink-soft);}
.empty b{color:var(--ink); display:block; font-size:16px; margin-bottom:6px;}
```

- [ ] **Step 4: Add the recipe-page (detail) styles** (used by all pages in `recipes/`, Tasks 3–5)

```css
.recipe-hero{padding:28px 20px 22px; color:#fff; background:linear-gradient(135deg,#96685F,#5A332E);}
.recipe-hero h1{margin:0 0 8px; font-size:26px; font-weight:800; letter-spacing:-0.01em;}
.recipe-hero .meta{display:flex; gap:10px; flex-wrap:wrap; font-size:12.5px; opacity:.92;}
.recipe-hero .meta span{background:rgba(0,0,0,.22); padding:3px 9px; border-radius:999px;}
.recipe-hero img{width:100%; max-height:280px; object-fit:cover; border-radius:12px; margin-top:14px;}
.recipe-body{max-width:640px; margin:0 auto; padding:22px 20px 60px;}
.recipe-section{margin-bottom:26px;}
.recipe-section h2{font-size:11.5px; text-transform:uppercase; letter-spacing:.08em; color:var(--ink-soft); font-weight:700; margin:0 0 10px;}
.ing-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:8px;}
.ing-list li{font-size:14.5px; padding:9px 10px; border-radius:10px; background:var(--surface-2);}
.step-list{list-style:none; margin:0; padding:0; display:flex; flex-direction:column; gap:14px; counter-reset:step;}
.step-list li{display:flex; gap:12px; font-size:14.5px; line-height:1.5; counter-increment:step;}
.step-list li::before{
  content:counter(step); flex:none; width:24px; height:24px; border-radius:50%;
  background:var(--accent-soft); color:var(--accent); font-size:12px; font-weight:800;
  display:flex; align-items:center; justify-content:center;
  font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;
}
.home-button{
  display:inline-block; margin:8px 20px 30px; padding:10px 18px;
  background:var(--accent); color:var(--accent-ink); border-radius:999px;
  text-decoration:none; font-size:13.5px; font-weight:700;
}
```

- [ ] **Step 5: Verify no stray old selectors remain**

Run: `grep -nE "\.card\b|\.recipe\b|#index-page" style.css`
Expected: only the new `.card`, `.card-body`, `.card-title`, `.card-meta` selectors from
Step 3 — none of the old `.recipe`, `.title`, `#index-page` selectors from the previous
design.

- [ ] **Step 6: Commit**

```bash
cd ~/repos/odin-recipes
git add style.css
git commit -m "Rewrite style.css with redesign tokens, header, grid, and recipe-page styles"
```

---

### Task 2: Redesign `index.html` and add `search.js`

**Files:**
- Modify: `index.html` (full rewrite of `<body>`)
- Create: `search.js`

**Interfaces:**
- Consumes: `.card`, `.thumb`, `.flag`, `.card-body`, `.card-title`, `.card-meta`, `.grid`,
  `.empty`, `#search`, `#clear-btn`, `.status-line` from Task 1's `style.css`.
- Produces: each `.card` in the grid carries `data-title="<recipe title>"` — Task 4/5's
  recipe pages don't need to know about this, but `search.js` and any future task relies on
  this attribute existing on every card.

- [ ] **Step 1: Rewrite `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Odin Recipes</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site">
  <div class="site-inner">
    <div class="wordmark-row">
      <p class="wordmark">Odin <span>Recipes</span></p>
      <p class="recipe-count mono" id="count-badge"></p>
    </div>
    <div class="search-wrap">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
      <input id="search" type="text" placeholder="Search recipes…" autocomplete="off" aria-label="Search recipes">
      <button id="clear-btn" aria-label="Clear search">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
      </button>
    </div>
  </div>
</header>
<main>
  <p class="status-line" id="status-line"></p>
  <div class="grid" id="grid">
    <a class="card" href="./recipes/pizza-dough.html" data-title="Pizza Dough">
      <div class="thumb" style="background:linear-gradient(135deg,#D9AE5C,#A9722E)"></div>
      <div class="card-body">
        <p class="card-title">Pizza Dough</p>
        <div class="card-meta"><span>Bread &amp; Dough</span></div>
      </div>
    </a>
    <!-- one .card per existing recipe link in the current index.html, same pattern,
         each pointing at its existing recipes/*.html file and existing title -->
  </div>
</main>
<footer style="max-width:1080px;margin:0 auto;padding:0 20px 40px;font-size:12px;color:var(--ink-faint);text-align:center;">
  Odin Recipes
</footer>
<script src="search.js"></script>
</body>
</html>
```

Note for the implementer: build one `.card` per recipe currently listed in `index.html`
(18 entries today, listed in the spec/mockup), reusing each one's existing `href` and
title text — this step is a mechanical 1:1 conversion of the existing `<li class="recipe">`
list into `.card` markup, not a content change. Task 5 adds the 19th card.

- [ ] **Step 2: Create `search.js`**

```javascript
const grid = document.getElementById('grid');
const statusLine = document.getElementById('status-line');
const countBadge = document.getElementById('count-badge');
const searchInput = document.getElementById('search');
const clearBtn = document.getElementById('clear-btn');
const cards = Array.from(grid.querySelectorAll('.card'));

countBadge.textContent = cards.length + ' recipes';

function normalize(s){
  return s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
}

let emptyState = null;

function applySearch(){
  const q = normalize(searchInput.value.trim());
  clearBtn.classList.toggle('show', q.length > 0);

  let visibleCount = 0;
  for(const card of cards){
    const title = normalize(card.dataset.title || '');
    const match = q === '' || title.includes(q);
    card.style.display = match ? '' : 'none';
    if(match) visibleCount++;
  }

  if(emptyState){ emptyState.remove(); emptyState = null; }
  if(visibleCount === 0){
    emptyState = document.createElement('div');
    emptyState.className = 'empty';
    emptyState.innerHTML = '<b>No recipes match that search.</b>Try a different dish.';
    grid.appendChild(emptyState);
  }

  statusLine.textContent = q === ''
    ? ''
    : (visibleCount
        ? `${visibleCount} match${visibleCount === 1 ? '' : 'es'} for "${searchInput.value.trim()}"`
        : `No matches for "${searchInput.value.trim()}"`);
}

searchInput.addEventListener('input', applySearch);
clearBtn.addEventListener('click', () => { searchInput.value=''; applySearch(); searchInput.focus(); });
```

- [ ] **Step 3: Verify in browser**

Run: `open index.html`
Expected: header with search box, grid of 18 cards below. Resize the window to ~375px
wide — grid becomes 1 column. Type "soup" — only the two soup cards remain and the status
line reads "2 matches for...". Clear the search — all 18 cards return.

- [ ] **Step 4: Commit**

```bash
cd ~/repos/odin-recipes
git add index.html search.js
git commit -m "Redesign index.html as a searchable card grid"
```

---

### Task 3: Restyle one recipe page as the reference pattern

**Files:**
- Modify: `recipes/tapenade.html`

**Interfaces:**
- Produces: the page structure pattern (`.recipe-hero`, `.recipe-body`, `.recipe-section`,
  `.ing-list`, `.step-list`, `.home-button`) that Task 4 replicates across the other 17
  existing pages and Task 5 uses for the new page.

- [ ] **Step 1: Rewrite `recipes/tapenade.html` body using the Task 1 recipe-page styles**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../style.css">
    <title>Recette de Tapenade</title>
</head>
<body>
    <div class="recipe-hero" style="background:linear-gradient(135deg,#7FA37D,#3F5B3F)">
        <h1>Tapenade</h1>
        <div class="meta"><span>10 min</span><span>Appetizer · Sauce</span><span>FR</span></div>
        <img src="../images/tapenade.jpeg" alt="Tapenade">
    </div>
    <div class="recipe-body">
        <div class="recipe-section">
            <h2>Ingredients</h2>
            <ul class="ing-list">
                <li>60 g de câpres au vinaigre</li>
                <li>50 g de filets d'anchois allongés à l'huile</li>
                <li>400 g d'olives noires dénoyautées</li>
                <li>1 gousse d'ail</li>
                <li>15 cl d'huile d'olive</li>
                <li>Poivre</li>
            </ul>
        </div>
        <div class="recipe-section">
            <h2>Instructions</h2>
            <ol class="step-list">
                <li>Égoutter les câpres et les olives.</li>
                <li>Retirer l'huile des anchois.</li>
                <li>Mettre tous les ingrédients dans un bol.</li>
                <li>Mixer à la girafe ou dans un robot jusqu'à obtenir une texture homogène.</li>
            </ol>
        </div>
    </div>
    <p><a href="../index.html" class="home-button">← All recipes</a></p>
</body>
</html>
```

- [ ] **Step 2: Verify in browser**

Run: `open recipes/tapenade.html`
Expected: colored hero band with title, meta pills and the recipe image; ingredients as
soft-background pills; instructions as numbered steps; a pill-shaped "All recipes" link at
the bottom. Resize to ~375px — everything stays single-column and readable, no horizontal
scroll.

- [ ] **Step 3: Commit**

```bash
cd ~/repos/odin-recipes
git add recipes/tapenade.html
git commit -m "Restyle tapenade recipe page as the new detail-page pattern"
```

---

### Task 4: Apply the same restyle to the remaining 17 recipe pages

**Files:**
- Modify: `recipes/pizza-dough.html`, `recipes/pizza-sauce.html`, `recipes/matar-paneer.html`,
  `recipes/super-juice.html`, `recipes/bourbon-cream.html`, `recipes/cream-mushroom.html`,
  `recipes/chicken-liver.html`, `recipes/lobster-roll.html`, `recipes/boulettes-de-viande.html`,
  `recipes/pate-a-crepes.html`, `recipes/hot-sour-soup.html`, `recipes/creme-fraiche.html`,
  `recipes/sourdough-bread.html`, `recipes/gravlax.html`, `recipes/Poulet-farci.html`,
  `recipes/vegetarian-lasagna.html`, `recipes/boeuf-bourguignon.html`

**Interfaces:**
- Consumes: the exact pattern produced in Task 3 (`.recipe-hero`/`.recipe-body`/
  `.recipe-section`/`.ing-list`/`.step-list`/`.home-button`, and the gradient/meta/FR-flag
  approach).

This is the same mechanical transformation as Task 3, applied to each remaining page: wrap
the existing `<h1>` + image in `.recipe-hero` with a gradient background and a `.meta` row
(time estimate, category, `FR` span if the page's `lang="fr"`), move ingredients into
`.recipe-section` > `.ing-list`, move instructions into `.recipe-section` > `.step-list`,
replace the old `.home-button` link with the pill-styled one. **Do not change any ingredient
or instruction text** — only the surrounding markup/classes. Use the gradient/time/category
values already established in the approved mockup for each recipe (e.g. Pizza Dough:
`linear-gradient(135deg,#D9AE5C,#A9722E)`, "6 hr", "Bread & Dough"; Boeuf Bourguignon:
`linear-gradient(135deg,#96685F,#5A332E)`, "3.5 hr", "Main · Beef"; etc. — reuse the
`time`/`cat`/`grad` values from the mockup's `RECIPES` array for every page).

- [ ] **Step 1: Restyle each of the 17 pages** following the Task 3 pattern exactly, one
  file at a time.

- [ ] **Step 2: Verify each page opens without errors**

Run: `for f in recipes/*.html; do echo "$f"; done` then spot-check at least 5 pages
(including the longest ones — `Poulet-farci.html` and `sourdough-bread.html` — and at least
2 French-language ones) with `open recipes/<file>.html`.
Expected: every page shows a hero band, styled ingredient/instruction lists, and the "All
recipes" link; no leftover unstyled `<h1>`/`<ul>` outside `.recipe-body`; no ingredient or
step text is missing compared to the pre-redesign version (diff against git history if
unsure: `git diff HEAD~2 -- recipes/<file>.html`).

- [ ] **Step 3: Commit**

```bash
cd ~/repos/odin-recipes
git add recipes/
git commit -m "Restyle remaining recipe pages to match the redesign"
```

---

### Task 5: Add the new pasta salad recipe

**Files:**
- Create: `recipes/pates-roquette.html`
- Modify: `index.html` (add one `.card`)

**Interfaces:**
- Consumes: the `.recipe-hero`/`.recipe-body` pattern from Task 3, and the `.card` pattern
  from Task 2 (must include `data-title="Salade de Pâtes Roquette & Boursin"` so search
  picks it up).

- [ ] **Step 1: Create `recipes/pates-roquette.html`**

```html
<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="stylesheet" href="../style.css">
    <title>Salade de Pâtes Roquette & Boursin</title>
</head>
<body>
    <div class="recipe-hero" style="background:linear-gradient(135deg,#7FA37D,#3F5B3F)">
        <h1>Salade de Pâtes Roquette &amp; Boursin</h1>
        <div class="meta"><span>25 min</span><span>Salad · Pasta</span><span>FR</span></div>
    </div>
    <div class="recipe-body">
        <div class="recipe-section">
            <h2>Ingredients</h2>
            <ul class="ing-list">
                <li>350 g de pâtes</li>
                <li>3 grosses poignées de roquette</li>
                <li>8 tranches de jambon cru</li>
                <li>350 g de tomates cerise</li>
                <li>2 courgettes, coupées en deux dans la longueur puis en tranches fines,
                    revenues à l'huile d'olive avec de l'ail et des herbes de Provence</li>
                <li>240 g de dés de fromage type Boursin ail et fines herbes</li>
            </ul>
        </div>
        <div class="recipe-section">
            <h2>Instructions</h2>
            <ol class="step-list">
                <li>Cuire les pâtes al dente dans l'eau bouillante salée, égoutter et laisser tiédir.</li>
                <li>Faire revenir les courgettes tranchées à l'huile d'olive avec l'ail et les herbes de Provence jusqu'à ce qu'elles soient tendres et dorées.</li>
                <li>Couper les tomates cerise en deux.</li>
                <li>Mélanger les pâtes, la roquette, les courgettes, les tomates cerise, le jambon cru et les dés de Boursin.</li>
                <li>Servir tiède ou à température ambiante.</li>
            </ol>
        </div>
    </div>
    <p><a href="../index.html" class="home-button">← All recipes</a></p>
</body>
</html>
```

- [ ] **Step 2: Add the card to `index.html`**

```html
<a class="card" href="./recipes/pates-roquette.html" data-title="Salade de Pâtes Roquette & Boursin">
  <div class="thumb" style="background:linear-gradient(135deg,#7FA37D,#3F5B3F)">
    <span class="flag">FR</span>
  </div>
  <div class="card-body">
    <p class="card-title">Salade de Pâtes Roquette &amp; Boursin</p>
    <div class="card-meta"><span>25 min</span><span class="dot"></span><span>Salad · Pasta</span></div>
  </div>
</a>
```

- [ ] **Step 3: Verify**

Run: `open index.html`
Expected: 19 cards, count badge reads "19 recipes". Typing "roquette" or "pâtes" in search
shows the new card. Clicking it opens the new recipe page, styled consistently with the
others.

- [ ] **Step 4: Commit**

```bash
cd ~/repos/odin-recipes
git add recipes/pates-roquette.html index.html
git commit -m "Add Salade de Pâtes Roquette & Boursin recipe"
```

---

### Task 6: Final cross-check

**Files:** none (verification only)

- [ ] **Step 1: Full manual pass**

Run: `open index.html`
Checklist:
- Resize to ~375px and ~1200px wide — grid reflows cleanly at both, no horizontal scroll.
- Search for a nonsense string (e.g. "zzz") — empty state renders, no JS console errors.
- Click through at least 3 recipe cards, including the new pasta salad — each opens its
  own page, styled consistently, with working "All recipes" links back to `index.html`.
- Toggle OS light/dark mode (or devtools `prefers-color-scheme` emulation) — colors switch
  and stay readable in both.

- [ ] **Step 2: Confirm git status is clean**

Run: `git status`
Expected: `nothing to commit, working tree clean`
