# Food Match — Agent Instructions

Local rules for this repo. Global kit at `~/Documents/Coding Projects/agent-ready-repo-kit/AGENTS.md` still applies; this file takes precedence on conflict.

Read `ARCHITECTURE.md` before editing `app.js`.

## Project shape

- Vanilla HTML + CSS + JS. No build step, no framework, no runtime deps.
- All logic lives in one IIFE inside `app.js`.
- Shared restriction helpers in `restrictions.js` (browser + Node).
- Static dataset at `data/epicure.json`, loaded once at boot.
- Deploys to GitHub Pages via `.github/workflows/deploy.yml`.

## Hard constraints

- Do not add dependencies, package managers beyond `node:test`, or a build step.
- All randomness must route through `dbgRng()`, never `Math.random()`. Seeded runs (`?seed=N`) must stay deterministic.
- Routes flow through the URL hash. Do not introduce History-API routing without updating the share-payload format.
- `data/epicure.json` schema changes require updates to `buildIndex` and the schema section of `ARCHITECTURE.md`.
- Debug toolkit (`?debug=1`, `window.__fm`, tagged logger) is off by default. Never ship behavior that relies on debug flags being on.
- Profile storage key is `localStorage["food-match-v3"]`, cap `MAX_PROFILES = 12`. Bumping the key is a migration.

## Testing

- Run: `npm test` (uses `node --test test/*.test.js`).
- Add tests for new logic in `restrictions.js` and any pure helpers extracted from `app.js`.
- For UI / quiz-engine changes, use debug fixtures (`?fixture=adventurous|picky|vegetarian|empty`) to repro states.

## Style

- 2-space indent, semicolons, `"use strict"`, IIFE-scoped.
- `SCREAMING_SNAKE_CASE` for module constants at top of file.
- Centralize repeated strings / numbers / config as named constants.
- Keep new log sites behind the `dbg.<tag>(...)` API.

## Workflow

- Worktrees: merge into `main` when done, or delete the branch. Do not leave them hanging.
- Volatile facts (file line counts, current metric values) do not belong in durable docs.
