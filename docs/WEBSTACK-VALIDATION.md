# CHROSys Deck // WEBSTACK-X Validation

## Scope
CHROSys Deck v0.2 redesign on `feat/webstack-pwa-redesign`, targeting a localized application shell and PWA-capable deployment while preserving the Chrome internal function registry, local state and matrix ingestion.

## Change-impact review

- Registry source: preserved in `js/functions.js`.
- Imported-target persistence: migrated from `chrosys.deck.v1` into `chrosys.deck.v2` without discarding existing favorites/recent/imported data.
- Direct `chrome://` navigation: retained only as a browser handoff attempt; no privilege bypass added.
- Modal layering: execution flow replaced by a dedicated Target Inspector route; no stacked execution/import modal state is required.
- GitHub Pages compatibility: relative asset paths and hash routing are used; no server-side rewrite is required.
- PWA shell: manifest and service worker are scoped relatively to the repository path.

## Validation matrix

| Check | Status | Notes |
|---|---|---|
| 360x800 | UNVERIFIED | Static responsive rules present; requires device/browser run. |
| 390x844 | UNVERIFIED | Static responsive rules present; requires device/browser run. |
| 430x932 | UNVERIFIED | Static responsive rules present; requires device/browser run. |
| 768x1024 | UNVERIFIED | Two-column matrix breakpoint defined. |
| 1366x768 | UNVERIFIED | Three-column matrix layout defined. |
| 1920x1080 | UNVERIFIED | Max-width shell defined. |
| 2560x1440 | UNVERIFIED | Max-width shell prevents uncontrolled expansion. |
| Zoom 80% | UNVERIFIED | No browser zoom is used as a layout mechanism. |
| Zoom 100% | UNVERIFIED | Baseline target. |
| Zoom 125% | UNVERIFIED | Fluid sizing rules defined. |
| Zoom 150% | UNVERIFIED | Requires browser validation. |
| Chromium | UNVERIFIED | Requires deployed runtime test. |
| Firefox | UNVERIFIED | Requires deployed runtime test. |
| Android Chrome | UNVERIFIED | Requires deployed runtime test. |
| PWA standalone | UNVERIFIED | Manifest/service worker implemented; installation requires runtime validation. |
| Offline shell | UNVERIFIED | Service worker implemented; requires runtime validation. |
| Direct chrome:// handoff | BLOCKED/EXPECTED | Browser privilege boundary remains authoritative. Copy-target fallback is provided. |
| Modal exclusivity | PASS (architectural) | Target Inspector is a route rather than a second stacked execution modal. |
| Registry preservation | PASS (static) | Existing `js/functions.js` remains the registry source. |
| Dependency-free core | PASS (static) | No external runtime libraries introduced. |

## Known deviations

1. Full browser/device validation cannot be honestly marked PASS until the branch is deployed and exercised on the required viewport/browser matrix.
2. PWA icon assets use scalable SVG files because the repository write interface used for this implementation does not provide a binary upload path. Chromium installability should be confirmed on-device; if a target browser requires raster icons, add 192px/512px PNG assets in a subsequent asset-only change.
3. Direct navigation into privileged Chrome internal URLs is not guaranteed from a web/PWA context.
