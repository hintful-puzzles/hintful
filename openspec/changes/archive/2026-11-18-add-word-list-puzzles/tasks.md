# Tasks

The findings and the decisions behind these are `design.md`.

## 1. Settle the plan

- [x] 1.1 Find word lists the app can ship, with their licenses and sizes, and confirm Wend's rules from a primary source
- [x] 1.2 Bring the owner the choice of list, Wordle's guess bound and the two games' names, with what was found; record the answers in `design.md` § "Asked of the owner"
- [x] 1.3 State each game's rules in its description and run the inheritance report on it (`candidates/`, `design.md` § "What each inherits")
- [x] 1.4 Write the rest of this list from `docs/new-game.md` § "The route by kind of game", for the word list and each game
- [x] 1.5 Declined: bring the inheritance report's guards into the gate. They broke unseen when names became required, but `research/` is read by no test, build or gate step, and `src/gate-scope.test.ts` proves it so that a commit touching only it skips vitest; a tool run by hand that fails on every line at its next run is not worth that

## 2. The word list (an engine asset)

- [x] 2.1 A script under `scripts/` that builds the answers and guesses lists from the pinned SCOWL release and 12dicts, applies the filter, and writes the module; the sources' versions and hashes are recorded beside it, and the output is committed (`scripts/word-list.ts`; `design.md` § "The word list, as built")
- [x] 2.2 The notices: SCOWL's verbatim in `licenses/`, 12dicts and LDNOOBW credited in `CREDITS.md` and About
- [x] 2.3 The engine module: lookup by length, membership, a seeded draw from the answers; its entry in `docs/engine-catalog.md` (`src/engine/word-list/`)
- [x] 2.4 Done 2026-11-18: the game worker grew to 3.58 MB with the list, so the precache limit went to 5 MiB in `vite.config.ts`; checked on `vite preview` in Chrome with offline use ticked (319 entries, the worker among them), then offline: reload, new game, a guess scored. Precache: the list is in the service worker's manifest, and the app works offline with it. The list ships in the game worker's bundle once a game imports it, and the build's `precacheCoverage` check already fails a build that leaves an emitted file out of the manifest, so no new test is owed; what is owed is a build with Wordguess in it, and a game dealt offline

## 3. Wordguess (Guess's kind: moves and search, answer hidden)

- [x] 3.0 Decided: an engine module, `src/engine/code-rows.ts`, with Guess moved onto it first (`design.md` § "What Wordguess shares with Guess"). Decide, before scaffolding, what Wordguess shares with Guess. Both have rows of guesses submitted one at a time, a working row in the `Ui`, an answer row of per-slot rule-outs that Check & save judges, a Submit key, and a hint that rules out of the answer row (`src/games/guess/index.ts`, `state.ts`). They differ in the score (per slot here, counts there), the keys (26 letters, better laid out as a keyboard, and the keypad itself could carry each letter's known status), the answer row's picture (26 candidates a slot against Guess's ten colors), a guess refused when it is not a word, and no holds. Doctrine: where two games would write the same thing, the engine owns it. Weigh an engine piece for the row-and-answer-row mechanic against a Wordguess written beside Guess, and record the choice and its reason in `design.md`
- [x] 3.1 Scaffold (`scripts/new-game.sh`), first verdict (`npm run game`); its description from `candidates/wordguess.description.yaml`
- [x] 3.2 Params (`paramConfig`): word length, the guess bound as the owner decides, a hard-mode variation if wanted (every revealed letter reused); presets and Custom
- [x] 3.3 State and moves: guesses typed on a letter keypad and the keyboard, a guess not in the guess list refused with its reason, the answer row of candidate letters, Check & save over it
- [x] 3.4 Rendering on Guess's shape, the collection's palette; marks for in place, elsewhere and absent that do not lean on color alone
- [x] 3.4a Done 2026-11-18 (`design.md` § "The keypad (task 3.4a)"): QWERTY rows through `KeyLabel.row`, each key's status through `Game.keyStatus`, a full non-word row declining letters, and `decodeUi` given the state; checked in Chrome on a phone (touch) and a desktop, light and dark, and Solo's keypad unchanged. The keypad as a keyboard: the panel lays keys out by count (`game-controls.ts`, `keys.ts`), so QWERTY rows need a panel extension a game can ask for; and whether each letter key may show its known status, which `requestKeys` (params only) cannot carry. Also decide whether a letter typed on a full row that is no word should overwrite its last letter, as `code-rows.ts`'s cursor fallback does now, or be ignored, as Wordle does
- [x] 3.5 Done 2026-11-18 (`design.md` § "The hint (task 3.5)"): six per-slot techniques, sound with every plant caught; Guess's six add no step; the guess searched so that following the hint wins every common word of every preset, hard mode included. Hint: the per-slot rungs (`design.md` § "What each inherits"), Guess's six inherited techniques where they add a step, then the probe over the answers that still fit; checked sound
- [x] 3.6 Done 2026-11-18: the help's Hints section and legend read on a fresh dev server; the hint played to the end by taps alone on a phone-sized touch screen, and by mouse and the keyboard's letters on a desktop, strikes, stripes, outlines and ringed squares checked against each sentence; a fresh subagent read 39 steps over six games and found every claim true and every mark matching, and its wording points were taken (`design.md` § "The hint (task 3.5)"). Help page, spec, icons; play it in the app with pointer, keyboard and touch, and a hint at every stage; a fresh subagent reads the hints against the board

## 4. Wordtrail

- [x] 4.1 Split into its own change, `add-wordtrail`, on the owner's word (2026-11-18: wrap up Wordguess here and archive; Wordtrail later, not a priority), with its findings and candidate description

## 5. Close

- [x] 5.1 `npm run test:hint-sweeps` after the shared changes (2026-11-18: 621 passed); push
- [x] 5.2 Archived on the owner's word (2026-11-18: wrap up Wordguess and archive, Wordtrail in `add-wordtrail`); their look at the running app comes with the deploy. The owner's acceptance in the running app; archive
