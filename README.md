# Repo Sentinel

A private dashboard for my GitHub repos and websites, hosted free on GitHub Pages:
**https://sandeep-miriyala.github.io/repo-sentinel/**

The page is public, but the data is not. A separate private repo, [repo-monitor](#how-it-works), collects the numbers every hour, encrypts them with AES-256-GCM and publishes one file, `public/data/data.enc`. The browser asks for a passphrase and decrypts it locally. Without the passphrase, the file is unreadable noise.

## What it shows

- Websites: up or down, response time, uptime over the last 24 checks
- Repos: stars (with new stars this week), forks, open issues, security state
- Issues and pull requests changed in the last 7 days
- Dependabot and secret-scanning alerts
- npm and PyPI weekly downloads with trend lines
- XERJ Corpus Hub contributor stats
- A short Telugu summary written by GitHub Models

## Features

- **Encrypted end to end.** PBKDF2-SHA256 (600,000 rounds) and AES-256-GCM via the browser's Web Crypto API. The passphrase never leaves the device.
- **Remember on this device.** Optional. Stores a non-extractable key in IndexedDB, so the passphrase itself is never saved. **Lock** forgets it.
- **Installable and offline.** A PWA with a small hand-written service worker. Offline, it shows the last data it saw (still encrypted at rest).
- **Ask in Telugu.** In desktop Chrome with built-in AI, you can ask "ఈ వారం ఏమైంది?" and Gemini Nano answers on the device. Nothing is sent anywhere.
- **WebMCP.** After unlocking, browser AI agents can call the read-only tools `get_status`, `list_sites`, `list_repos` and `list_recent_activity`.
- **Accessible.** Tested with axe-core against WCAG 2.2 AA, with keyboard support, screen-reader labels and reduced-motion support.
- **Not indexed.** `noindex` plus `robots.txt` keeps search engines away.

## Stack

| Part | Choice |
| --- | --- |
| Site | Astro 7 (static output) |
| UI | React 19 islands, TanStack Query, TanStack Table v9 |
| Styling | Tailwind CSS v4 |
| Language | TypeScript 7 |
| Tests | Vitest (decrypts a file made by the Python backend), Playwright with axe-core |
| Hosting | GitHub Pages via GitHub Actions |

## How it works

```
repo-monitor (private, Python + uv, GitHub Actions, hourly)
  └─ collects → encrypts → PUT public/data/data.enc into this repo
        └─ push triggers deploy.yml → GitHub Pages
              └─ browser: passphrase → decrypt → dashboard
```

## Develop

```bash
npm ci
npm run dev          # http://localhost:4321/repo-sentinel/
npm run typecheck
npm test             # unit tests
npm run build
npx playwright install chromium && npm run test:e2e
```

Test data lives in `tests/fixtures/`. Its passphrase is `correct horse battery staple` and is for tests only.

## Licence

MIT
