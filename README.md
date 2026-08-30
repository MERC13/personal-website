# personal-website

Source for [merc13.github.io/personal-website](https://merc13.github.io/personal-website/).

No frameworks, no build step, no dependencies. Three files plus assets, served
straight from the repo root by GitHub Pages.

```
index.html          all content, static semantic HTML
assets/style.css    design tokens + components, single file
assets/script.js    theme toggle and footer year — nothing else
assets/fonts/       self-hosted Inter Variable (OFL, licence included)
assets/img/og.png   1200×630 social preview
```

## Local preview

```sh
python -m http.server 8000
```

Then open <http://localhost:8000>.

## Editing content

Everything lives in `index.html` as ordinary markup — there is no data file and
no renderer. Copy an existing `<article class="entry">` block to add a role or a
project, or an `<li class="archive__item">` to add a one-line entry.

Two rules worth keeping:

1. **Every project entry links to something** — a repo, a live site, or a paper.
   An entry a reader cannot verify in one click belongs in the prose of an
   experience entry instead, not in its own block.
2. **Check the links before deploying.** The previous version of this site
   shipped seven dead GitHub links for months after a repo was reorganised.

## Conventions

- Light theme is authored first; dark is derived via `light-dark()`. Verify both.
- No `box-shadow` anywhere. Structure comes from hairline rules and whitespace.
- State is expressed with ARIA and `data-` attributes, not CSS classes.
- Breakpoints are literal values (`40rem`, `56rem`) — custom properties do not
  work in media conditions.

## Not in this repo

The résumé PDFs are deliberately kept out. They carry a phone number, and
anything committed to a public repo persists in history and in forks even
after it is deleted. The site is meant to stand on its own instead.
