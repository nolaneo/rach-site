# Rachel Sargent — bio site

A small, elegant, buildless bio site for an editor & writer. Static HTML + CSS +
vanilla JS, styled with Tailwind (via CDN), and deployed to GitHub Pages.

**Live site:** https://nolaneo.github.io/rach-site/

## Editing content

All the words and books live in [`content.json`](content.json). Non-technical
editing instructions are in [`EDITING.md`](EDITING.md). No build step — edit the
JSON, commit, and the site redeploys automatically.

## Project structure

```
index.html            # markup + Tailwind config (CDN)
css/styles.css        # custom polish (fonts, drop cap, grain, animations)
js/main.js            # loads content.json and renders the page
content.json          # ← all editable content (bio, books, writing)
images/portrait.svg   # portrait placeholder
images/covers/        # book cover art (placeholders included)
.github/workflows/deploy.yml   # GitHub Pages deploy action
EDITING.md            # non-technical editing guide
```

## Running locally

Because the page fetches `content.json`, opening `index.html` directly with
`file://` won't work — browsers block that fetch. Serve it over HTTP instead:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Design notes

Editorial / literary aesthetic: warm "paper" background, ink text, a single
oxblood accent, hairline rules, and a Fraunces (display) + Newsreader (body)
type pairing. Fully responsive across mobile and desktop.

## Tech choices

- **No framework / no build** — keeps it maintainable by a non-technical editor.
- **Tailwind via CDN** — utility styling without a toolchain.
- **GitHub Pages via Actions** — every push to `main` redeploys.
