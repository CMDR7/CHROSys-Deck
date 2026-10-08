# CHROSys Deck Architecture

## Runtime model

CHROSys Deck is a static client-side application. There is no backend and no build step.

```text
index.html
   │
   ├── css/chrosys.css
   │
   └── js/functions.js  ← function registry / taxonomy
          │
          └── js/app.js  ← state, rendering, commands, navigation
```

## Function registry

`js/functions.js` contains the curated initial matrix. Each entry has:

- stable local ID
- display name
- internal URL
- sector/category
- short description
- technical detail
- supported target platforms
- risk classification

The runtime can also retain imported URLs in `localStorage` without modifying the source registry.

## Platform model

The first-run selector establishes a target environment:

- `desktop`
- `android`
- `webview`

The selection remains visible and can be changed at any time. If the user chooses **Remember**, the value persists locally.

## Navigation model

The dashboard deliberately does not attempt to bypass Chromium security boundaries. `START FUNCTION` opens an execution request first. The user can then attempt native navigation or copy the exact internal URL.

Because Chrome may reject privileged URL navigation from ordinary web content, successful navigation is browser-dependent.

## Matrix ingestion

The Import Matrix control accepts pasted text or HTML containing `chrome://` and `chrome-untrusted://` URLs. The parser:

1. extracts matching schemes;
2. removes duplicates;
3. compares them with the seeded registry;
4. stores previously unknown targets locally;
5. labels imported entries as restricted/experimental until reviewed.

This makes the application resilient to Chrome URL inventory changes without requiring an API or server.

## Design principles

1. **Dependency-free**: no framework, CDN, package manager, or external runtime service.
2. **Browser-honest**: never imply that a privileged Chrome surface can be opened when browser policy may prevent it.
3. **Data-driven UI**: function cards are generated from the registry rather than duplicated in markup.
4. **Local-first**: favorites, recent targets, platform selection, and imported matrix data stay in the browser's local storage.
5. **Mobile-first**: the interface is usable on Android while retaining a dense desktop matrix.
6. **Progressive enhancement**: clipboard, native navigation, and visual effects degrade without breaking the core registry.
7. **Public-project safety**: no secrets, API keys, credentials, or private telemetry belong in the repository.
