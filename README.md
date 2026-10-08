# CHROSys Deck

**Chrome Internal Systems Development Deck**

A dependency-free Chrome internal systems development and diagnostic dashboard built with vanilla HTML, CSS, and JavaScript.

## What it does

CHROSys Deck turns a Chrome internal URL matrix into a searchable, categorized command-deck interface. Each function includes a concise explanation, technical detail, platform metadata, risk classification, favorites, recent-function history, and a two-stage execution request.

### Current capabilities

- 52 Chrome / `chrome-untrusted://` functions seeded from the initial project matrix
- Desktop Chrome, Android Chrome, and Android WebView target modes
- First-run environment selector with persistent preference option
- Search and sector filtering
- Local command-deck syntax: `search`, `open`, `info`, `category`, `platform`, `favorites`, `recent`, `clear`
- Favorites and recent-function persistence with `localStorage`
- Two-stage launch confirmation
- Clipboard fallback for restricted internal navigation
- Experimental/restricted function warnings
- Import and comparison of a pasted `chrome://chrome-urls` matrix
- Responsive mobile-first HUD interface
- No framework, package manager, CDN, API, or runtime dependency

## Browser security note

Chrome internal pages are privileged browser surfaces. A normal hosted web page cannot be assumed to have permission to navigate to every `chrome://` or `chrome-untrusted://` URL. CHROSys Deck therefore uses best-effort native navigation and provides a clipboard fallback rather than attempting to bypass browser security boundaries.

Availability also varies between Chrome versions, channels, operating systems, policies, and feature flags. The registry is therefore intentionally updateable.

## Project structure

```text
CHROSys-Deck/
├── index.html
├── css/
│   └── chrosys.css
├── js/
│   ├── app.js
│   └── functions.js
└── docs/
    └── architecture.md
```

## Development model

CHROSys Deck is maintained by **Art / CMDR7**. Development is AI-assisted with LYRA for architecture, implementation, research, documentation, and technical review. Changes are reviewed and accepted by the project maintainer.

## License

MIT. See [LICENSE](LICENSE).
