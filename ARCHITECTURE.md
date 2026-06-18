# Food Match — Architecture

Single-page vanilla-JS app. No build step, no framework, no runtime
dependencies. All UI logic lives in one IIFE inside `app.js`. Pure
restriction helpers are factored into `restrictions.js` and covered
by `node:test` unit tests under `test/`. Data is a static JSON file
shipped under `data/`.

This doc is the first thing a coding agent (or new contributor)
should read before touching the code. Line numbers point at the
state of `main` when this doc was written; treat them as hints,
not contracts.

## File layout

| File | What's in it |
|---|---|
| `index.html` | Page shell. Mounts `#app`, loads `styles.css`, `restrictions.js`, and `app.js`. |
| `app.js` | Everything: constants, state, data load, quiz engine, scoring, sharing, rendering, debug toolkit. One IIFE. |
| `restrictions.js` | Pure dietary-restriction helpers. Shared with the Node test runner. |
| `styles.css` | All styles. |
| `data/epicure.json` | Static dataset of ingredients, modes, cuisine provenance. Loaded once at boot. |
| `test/restrictions.test.js` | `node --test` unit tests for `restrictions.js`. |

## Screen flow

```
                       ┌────────────────────┐
   ?route=/?fixture=── │  parseQueryParams  │── falls through ──┐
                       └────────────────────┘                   │
                                                                ▼
                          ┌────── #take=  ─────────────► quiz (with incomingProfile)
            parseRoute() ─┼────── #profile=  ──────────► profile
            (hash router) ├────── #compare=A.B ────────► compare
                          ├────── #corpus ─────────────► corpus
                          └────── (empty hash) ────────► quiz (fresh)

  quiz ─ answers ──► quiz ─ phase=done ──► finishQuiz ──► profile
  profile ─ "Compare" ──► take= URL ──► friend takes quiz ──► compare
  any screen ─ brand-lockup ──► quiz (reset)
```

Routes (`state.route` values): `quiz`, `profile`, `compare`,
`history`, `corpus`. The `quiz` route additionally renders
onboarding, setup, or a quiz card depending on `state.quiz` and
`state.onboardingComplete`.

## State shape

`const state` is declared once near the top of `app.js`. All
mutations happen by direct assignment; there is no reducer.

| Field | Type | Persistence | Meaning |
|---|---|---|---|
| `route` | string | in-memory | Current screen. Reset to `"quiz"` on reload. |
| `quiz` | object \| null | in-memory | Active quiz: queue, position, responses, phase. |
| `profile` | object \| null | in-memory | Result for the current viewer. |
| `compareProfiles` | [profile, profile] \| null | in-memory | Two profiles being compared. |
| `incomingProfile` | profile \| null | in-memory | Friend's profile decoded from `#take=`. |
| `onboardingStep` | integer | in-memory | 0..2, drives intro screen. |
| `onboardingComplete` | boolean | in-memory | True after user finishes intro or jumps in via share URL. |
| `toast` | string | in-memory | Active toast message. |

Saved profiles persist in `localStorage` under `STORAGE_KEY =
"food-match-v3"`. Cap is `MAX_PROFILES = 12`. The `state` object
itself is not persisted; only profiles are.

## Data schema (`data/epicure.json`)

```json
{
  "ingredients": ["abalone", "abalone_mushroom", ...],
  "modes": [
    {
      "id": "nova_level/M0",
      "property": "nova_level",
      "label": "Cocktail spirits and liqueurs",
      "kind": "continuous" | "binary" | "factor",
      "members": ["grenadine", ...],
      "n": 131,
      "z": 1.29
    }
  ],
  "cuisineProvenance": {
    "East_Asian": ["nova_level/M2", "cf_sweet/M2", ...],
    ...
  }
}
```

After `loadEpicure()`, `buildIndex(data)` adds derived indexes:
`modeById`, `ingredientModes`, `ingredientSpecificity`,
`modeCuisines`, `quizModes` (subset usable for quiz cards). The
indexed object is assigned to the IIFE-scoped `epicure` variable.

## Quiz engine

Pipeline:

1. `newQuiz(name, restrictions)` — seeds the queue with cuisine
   cards (one per `CUISINES` entry). Sets `phase = "cuisines"`,
   `pos = 0`.
2. `respondToCard(quiz, value)` — records the answer, injects
   probe cards when answering a mode card, advances `pos`, and
   refills the queue when it runs out. Drives the phase
   transition: `cuisines → modes → ingredients → done`.
3. `currentCard(quiz)` reads `quiz.queue[quiz.pos]`.
4. When `quiz.phase === "done"` or `answered >= QUIZ_TARGET` (35),
   the render loop calls `finishQuiz`, which calls `buildProfile`,
   saves it, and shows the done-panel.

Card types: `cuisine`, `mode`, `ingredient`, `ingredient-probe`.
Card id prefixes (used as keys in `responses`): `c:<cuisineId>`,
`m:<modeId>`, `i:<ingredientName>`.

## Scoring flow

`buildProfile(quiz)` wraps `quiz.responses` into a versioned
profile object with a random ID. From there:

- `buildCuisineEvidence(profile)` accumulates per-cuisine scores
  from three sources, each with its own weight constant:
  - Direct cuisine answer (`c:*`) — `CUISINE_DIRECT_WEIGHT = 2`
  - Mode answer (`m:*`) — `CUISINE_MODE_WEIGHT = 0.8`, distributed
    across the mode's official + inferred cuisines.
  - Ingredient answer (`i:*`) — `CUISINE_INGREDIENT_WEIGHT = 0.25`
    divided by the number of evidence modes (top 4).
- `adventureBreakdown(profile)` filters responses to ingredients
  with `controversy >= ADVENTURE_MIN_CONTROVERSY (3)`, credits the
  earned/possible ratio via `ADVENTURE_CREDITS`, scales to 0–100.
- `tasteSignature(profile)` maps each liked `m:*` and `i:*`
  response onto taste dimensions via `mode.property`, sums, scales
  to 0–10.

Compare logic in `compareProfiles(a, b)` produces:
shared likes, conflicts, bridges (one likes / other unknown),
shared directions (overlapping cuisine evidence > 0.1), and a
0–100 match score.

## Sharing flow

URL hash routes carry the payload:

| Hash | Meaning |
|---|---|
| `#take=<encoded>` | Friend's profile; viewer takes quiz then enters compare. |
| `#profile=<encoded>` | Standalone profile view. |
| `#compare=<encA>.<encB>` | Both profiles for compare screen. |
| `#corpus` | Corpus / data screen. |
| `` (empty) | Fresh quiz. |

`encodePayload(obj)` is URL-safe base64 of `JSON.stringify(obj)`.
`decodePayload(str)` is the inverse. `profileUrl`, `inviteUrl`,
`compareUrl` build the hashes. `parseRoute()` reads them on load
and on every `hashchange`.

## Persistence

| Key | Where | Contents |
|---|---|---|
| `localStorage["food-match-v3"]` | profile store | Array of up to 12 saved profiles. |
| `localStorage["food-match-debug"]` | debug toggle | `"1"` to force debug mode without a URL param. |

`saveProfile(p)` dedupes by `id`, caps at `MAX_PROFILES`.
`loadProfiles()` returns the array (empty if missing or corrupt).

## Debug toolkit

Off by default. Turn on with `?debug=1` in the URL or
`localStorage.setItem("food-match-debug", "1")` then reload.

### Query params

| Param | Effect |
|---|---|
| `?debug=1` | Enables logger, `window.__fm` REPL handle, banner. |
| `?seed=N` | Seeds the mulberry32 PRNG behind `dbgRng()`. Deterministic profile IDs and any future randomness. |
| `?route=X` | Lands on `X` after replay (`quiz`, `profile`/`results`, `compare`, `history`, `corpus`). |
| `?answers=PAYLOAD` | URL-safe base64 array of values (or `{id,value}` objects). Replayed against a fresh quiz. |
| `?fixture=NAME` | Use a canned answer sequence from `DEBUG_FIXTURES` (`adventurous`, `picky`, `vegetarian`, `empty`). |

`parseQueryParams()` runs once at boot, before `parseRoute()`. It
clears the query string via `replaceState` once consumed so a
reload doesn't re-seed.

### Tagged console logger

`dbg.<tag>(label, payload)` opens a collapsed console group when
debug is on, and is a no-op otherwise. Off-state is zero cost so
long as callers pass payload objects, not template literals.

Six instrumentation sites today:
- `data` — `loadEpicure` start + end
- `route` — top of `parseRoute`
- `quiz` — top of `respondToCard`
- `score` — start + end of `buildProfile`
- `share` — `encodePayload` + `decodePayload`
- `state` — top of `render`

### Live REPL

`window.__fm` is attached in debug mode and gives access to:
`state`, `epicure`, `dbg`, `fixtures`, `encodePayload`,
`decodePayload`.

## Glossary

| Term | Plain meaning |
|---|---|
| **mode** | A cluster of ingredients that show up together. ~150 of them. Each is one possible quiz card. |
| **property** | The axis a mode lives on (`cf_*` flavor compound, `fg_*` food group, `nova_level` processing, `usda_*` nutrient). |
| **modeById** | Hash from mode ID to mode object. |
| **ingredientModes** | Hash from ingredient name to the list of modes containing it. |
| **ingredientSpecificity** | Number of modes an ingredient appears in. High = generic, low = niche. |
| **modeCuisines** | Hash from mode ID to the cuisines that use it. Inverted from `cuisineProvenance`. |
| **bridge food** | A food one person likes that the other neither likes nor dislikes — a candidate for introducing across taste profiles. |
| **edge / controversy** | A measure of how divisive an ingredient is. High edge = good for probing taste boundaries. |
| **probe** | A follow-up ingredient or mode card injected after a mode answer to test the boundary. |
| **adventure credit** | Score for answering yes to controversial foods. Lives in `ADVENTURE_CREDITS`. |
| **taste signature** | Per-dimension 0–10 scores (umami, fresh, rich, spicy, sweet, earthy, funky, herbal). |
| **cuisine evidence** | Per-cuisine score from direct, mode, and ingredient sources. Higher = stronger lean. |

## Known constraints

- No build step. No deps. Don't add either without a strong reason.
- All randomness must go through `dbgRng()` so `?seed=N` keeps runs reproducible. Today only `buildProfile` uses it.
- All routes except the seeding hook flow through the hash. Don't introduce History-API-based routing without updating the share format.
- The quiz queue mutates in place during answering. Probe injection happens inside `respondToCard`.
- `data/epicure.json` is loaded once on boot. Schema changes require updating `buildIndex` and the schema section here.
