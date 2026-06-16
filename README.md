# Food Match

A short food quiz that maps your taste and lets you compare results
with a friend. Vanilla HTML, CSS, and JavaScript with no build step,
no framework, no dependencies. The dataset comes from the
[Epicure](https://arxiv.org/abs/2605.22391) research project on
ingredient pairings in real recipes.

## Run locally

Static-serve the repo root. Anything works as long as it's a real
HTTP server (the app fetches `data/epicure.json`, which fails under
`file://` due to CORS).

```sh
python3 -m http.server 8000
# then open http://localhost:8000/
```

Alternatives: `npx serve`, `php -S 0.0.0.0:8000`, the Live Server
VS Code extension.

## File layout

| File | Role |
|---|---|
| `index.html` | Page shell. Loads styles and `app.js`. |
| `app.js` | All logic. One IIFE, ~3700 lines. Start here. |
| `styles.css` | All styles. |
| `data/epicure.json` | Static dataset, loaded once at boot. |
| `ARCHITECTURE.md` | Read this before editing `app.js`. |

## Debug toggles

All off by default; end users never see them. Turn on with a URL
flag or a localStorage entry, then reload.

| Toggle | Effect |
|---|---|
| `?debug=1` | Enable tagged console logger and `window.__fm` REPL. |
| `localStorage.setItem("food-match-debug", "1")` | Same as `?debug=1`, sticks across reloads. |
| `?seed=N` | Seed the PRNG so profile IDs (and any future randomness) are reproducible. |
| `?route=results&fixture=adventurous` | Jump straight to the results screen with a canned quiz log. |
| `?fixture=NAME` | Replay a saved answer sequence (`adventurous`, `picky`, `vegetarian`, `empty`). |
| `?answers=PAYLOAD` | Replay a URL-safe base64 answer log (see `encodePayload`). |

Full spec: `ARCHITECTURE.md` → Debug toolkit.

## Contributing

- Match existing style: 2-space indent, semicolons, `"use strict"`,
  IIFE-scoped, `SCREAMING_SNAKE_CASE` for module constants at top.
- Don't add dependencies or a build step.
- All randomness must go through `dbgRng()`, not `Math.random()`,
  so seeded runs stay deterministic.
- New high-value log sites should use the existing `dbg.<tag>(...)`
  API. Resist adding logs everywhere; pick state transitions.

## Known weirdness

- `app.js` is one ~3700-line file by design. Read `ARCHITECTURE.md`
  first to navigate it.
- `data/epicure.json` is large and loaded eagerly at boot.
- No automated tests. Use the debug fixtures to repro states.
- Saved profiles live in `localStorage["food-match-v3"]`,
  cap of 12. Clearing site data resets them.
