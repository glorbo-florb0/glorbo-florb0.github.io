# glorbo-florb0.github.io

Personal cybersecurity portfolio: static site built with [Vite](https://vite.dev), plain
JavaScript modules and CSS, deployed to GitHub Pages by GitHub Actions. An optional
Docker stack (nginx, API, MongoDB) is included for self-hosting.

Live: https://glorbo-florb0.github.io/

## Project layout

```
index.html, 404.html      page entry points (Vite builds both)
src/
  main.js                 entry: fonts, styles, nav, content, render
  js/                     api.js, render.js, nav.js, clipboard.js, dom.js, format.js
  styles/                 tokens, base, layout, components (imported by main.css)
  data/content.json       all site content (edit this)
public/                   copied as-is: favicon, og-image, robots.txt, sitemap.xml, security.txt
tests/                    Vitest unit tests
server/                   optional Express + MongoDB API (self-hosting only)
deploy/nginx/             nginx config for the self-hosted stack
docs/DOCKER-SECURITY.md   network segmentation (OWASP Docker D03)
.github/workflows/        CI and Pages deploy
```

## Develop

Requires Node 20+ (`.nvmrc` pins 22).

```bash
npm install
npm run dev        # local dev server
npm run check      # lint + format check + tests + production build
npm run preview    # serve the production build locally
```

## Edit content

Change `src/data/content.json`, then commit and push. Cards and posts whose `url` is `"#"`
render as plain cards with no link. The Blog section stays hidden until `posts` has entries:

```json
{ "t": "Post title", "date": "2026-11-01", "d": "One-line summary.", "url": "https://..." }
```

## Deploy (GitHub Pages)

Pushes to `main` run `.github/workflows/pages.yml`: lint, format check, tests, build, deploy.

One-time setup: repo **Settings > Pages > Build and deployment > Source: GitHub Actions**.
The repo must be named `glorbo-florb0.github.io` for the site to live at the root URL.

## Self-host (optional)

```bash
cp .env.example .env        # fill in the secrets
docker compose up -d --build
./scripts/verify-network.sh
```

See [docs/DOCKER-SECURITY.md](docs/DOCKER-SECURITY.md).

## Security notes

- Strict Content-Security-Policy (meta tag on Pages, header when self-hosted); no inline
  scripts or styles; fonts are self-hosted.
- All rendered content is HTML-escaped and links are restricted to http(s) and mailto.
- `.well-known/security.txt` lists a contact for reports.
