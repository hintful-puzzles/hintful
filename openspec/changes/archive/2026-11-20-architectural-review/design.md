## Context

The review read the tree on 2026-11-20 at `9faabdf61` along four lines: what
games still repeat, how the engine and its contract are shaped, which
cross-game guards keep game-keyed lists, and what the tests, tooling and
guides cost to work with. Every count below is dated to that commit and comes
from the query written beside it, run from the repository root; re-run it
before relying on it. `fl P` sums the lines of each function whose first line
matches `P`, through the next `^}`. "Games" counts distinct directories under
`src/games/` (65 at the time).

Ranking weighs the payoff at dozens to hundreds of games
(`docs/doctrine.md` § "The goal"). A cost every new game pays, or every
cross-game guard pays, ranks above a one-off cost in a large file, however
large. The owner picks; each pick is its own change.

## Goals / Non-Goals

**Goals:** a ranked list, each item with what, where, what it eases, what it
costs, and measured evidence.

**Non-Goals:** making any of the refactorings here; player-visible change.

## The ranked list

### 1. The engine owns the board's redraw loop and the palette's slots

- **What.** Nearly every `render.ts` hand-assembles the same tile-cache
  redraw: a draw state with `started`/`tileSize` and an
  `Int32Array(n).fill(-1)` cache; a first-frame block; a y/x loop that packs
  a key, skips on a cache hit unless `ds.hint.stale(i)`, else `drawTile`,
  `drawUpdate`, store, `ds.hint.commit(i)`; then the win flash, cursor and
  hint-mark bookkeeping. Beside it, each declares `const COL_X = n` slots and
  a `colors(bg)` that writes the same roles (flash, hint, error, background,
  cursor) slot by slot. The engine supplies the parts (`OverlaySidecar`,
  `HintMarks`, `winSlot`, `sweepStep`, `color/palette.ts`) but not the
  assembly.
- **Where.** `src/games/*/render.ts`, `src/skeleton/grid/render.ts`, a new
  engine module beside `src/engine/draw.ts`.
- **Eases.** A new game writes only `drawTile` and its own colors. A change
  to how the cache, hint marks or flash work is made once instead of 60
  times. This is the biggest per-game repetition in the tree.
- **Costs.** Large: a migration of about 60 render files, each checked in the
  running app, plus the render-scenario snapshots that move. Games whose
  board is not a cell grid (Untangle, Cube, Net's rotations) take the
  explicit form. It needs a design pass first: whether the loop's unit is a
  cell, a tile or an edge.
- **Evidence.**
  - `git grep -l -E 'Int32Array\([^)]*\)\.fill\(-1\)' -- 'src/games/*/*.ts' ':!*.test.ts' | cut -d/ -f3 | sort -u | wc -l` → 58.
  - `fl 'export function newDrawState'` → 61 games, 732 lines.
  - `fl 'function redraw'` → 63 games, 9,272 lines.
  - `flash\.win\(` 63 games, `sweepStep\(` 52, `ui\.cursor\.(visible|show)` 57.
  - `^(export )?const COL_[A-Z_]+ = [0-9]+;` → 63 games, 847 lines.
  - `fl 'export function colors\('` → 57 games, 1,243 lines.
  - Roles written in nearly every game: `out\[COL_(FLASH|FLASH_LEAD)\]` 47, `out\[COL_HINT` 44, `out\[COL_(ERROR|WRONG|MISTAKE)` 37.

### 2. Finish the half-done helper adoptions: one way per concern

- **What.** For five concerns the engine already has the shared helper, and
  only some games use it. The rest still hand-write the older form, so a
  reader and a porter meet two ways to do one thing, and a fix to the helper
  misses the holdouts.
- **Where, and the split.**

  | Concern | Helper | Users | Hand-written |
  | --- | --- | --- | --- |
  | Params encode and decode | `paramsCodec` (`params-codec.ts`) | 41 | 24 |
  | Click and keyboard input | `interpretTargetVerbs` (`target-verb.ts`) | 31 | 34 |
  | Mistakes found by comparing with the answer | `entryMistakes`, `clearEntries`, `revealEntry` | 15 | 31 `findMistakes` |
  | Solve | `solveFromAnswer` (`answer-search.ts`) | 18 | 46 `solve` |
  | Differential tests | `describeDescDifferential` | 38 | 8 hand-rolled |

  Add to these `validateParams`, which repeats bounds that `paramConfig`
  already states in many games (`fl 'function validateParams'` → 58 games,
  627 lines; `AREA_TOO_LARGE` 24 games), and the repeated
  `solveAtCap: (p, desc, cap) => solveX(newState(p, desc), cap)` (29 games).
- **Eases.** One obvious way per concern, which is the doctrine's own
  measure. The skeleton and the guides describe only one way.
- **Costs.** Medium, mechanical, per game. Params codec needs care: an
  encoding is a game ID, so a migration must keep every encoding
  byte-identical (`params-stability.test.ts` snapshots hold it). Target verbs
  apply only where a game's input is "aim at a target, apply a verb". Some of
  the 34 holdouts (Untangle, Sokoban, Fifteen) are not that shape, and
  sorting them is the first task.
- **Evidence.** `git grep -l -E '<helper>\(' -- 'src/games/*/*.ts' ':!*.test.ts' | cut -d/ -f3 | sort -u | wc -l`
  for each helper, with `function findMistakes`, `function solve\(` and
  `function decodeParams` for the hand-written side.

### 3. A game registers itself, and its catalog entry lives with it

- **What.** Adding a game means editing, outside its directory:
  - `src/games/index.ts`: an import and a `registerGame` line, for every game.
  - `src/puzzle/catalog-data.ts`: name, description, objective, family,
    collection and similar games, for every game.
  - `help/puzzles.md` and `src/assets/icons/`.
  - Per-game tables in tests, wherever the game is an exception. Wordtrail
    needed `orientation.test.ts`, `warm-repaint.test.ts` and
    `mark-collisions.test.ts`.

  `catalog-registry.test.ts` exists only to hold the first two lists to each
  other: a second copy, with a guard to keep the copies in step.
- **Where.** `src/games/index.ts`, `src/puzzle/catalog-data.ts`,
  `vite.config.ts` (it reads the catalog at config time, so a catalog entry
  must be importable without loading the game's engine), and
  `src/games/<id>/` gaining a small metadata module.
- **Eases.** A new game is its directory and nothing else. The registry and
  catalog are built from a glob, and the guard that keeps the two lists in
  step has nothing left to compare.
- **Costs.** Small to medium. One `catalog.ts` per game, moved from
  `catalog-data.ts` with no change to any field (family order and the
  home-screen order stay the catalog's). A glob registry
  (`import.meta.glob`, eager) replaces the hand list, and the build config
  reads the metadata modules the same way. Player-invisible.
- **Evidence.** `git show --stat f153cae6d` (Wordtrail's commit) touches
  `src/games/index.ts`, `src/puzzle/catalog-data.ts`, `help/puzzles.md`,
  `orientation.test.ts`, `warm-repaint.test.ts` and the icons, besides
  snapshots. `git grep -l -w wordtrail -- . ':!src/games/wordtrail' ':!openspec/changes/archive'`
  lists 16 files.

### 4. Kind-wide exemptions are derived, not kept by game (folds in `derive-hidden-answer-exemptions`)

- **What.** Cross-game tests keep 54 hand-written collections keyed by game
  id. Most hold reasons that really are the game's own (a measured layout
  quirk, an upstream parameter spelling, a fixture). 94 entries hold a reason
  true of a whole kind of game, which the game already declares. The filed
  change covers 4 ledgers; the same hidden-answer reason appears in 5 more
  entries it misses, and other kinds repeat the shape:
  - Hidden answer (`freedom: query`, `WorkingRow`):
    - the filed four;
    - `ALWAYS_SOLVABLE` (`no-solution-load.test.ts`);
    - Mines alone in `untiered-load.test.ts`;
    - `BINDS_A_SHORTCUT_LETTER.wordguess` (`puzzle/shortcuts.test.ts`);
    - `KEYPAD_WITHOUT_PENCIL.filling`;
    - `SETS.guess` in `scripts/checks/color-dark-check.test.ts`.
  - Nothing to deduce: `NARRATES_MOVES` in `hint-quality.test.ts` holds 7
    games, all of which declare `finishesByDeduction = nothingToDeduce`.
  - Beveled tiles: `CLOSE_ON_PURPOSE` in `puzzle/neighbor-contrast.test.ts`
    (Fifteen, Sixteen, Twiddle).
  - Copies of a game's own enum: `color-dark-check`'s `SETS` copies each
    game's palette index ranges by hand.
  - A migration roster: `MOVED` in `hint-walk-fingerprint.test.ts` (40 ids)
    lists the games "moved onto the engine's steps so far". It is derivable
    from how each game builds its hint, as `hint-games.ts` derives its own
    population, or it is finished and can go.
  - Hint-resume's `LATIN` is written twice in one file.
- **Where.** The files named above.
- **Eases.** A new game of a known kind owes no ledger entries. The vision
  names code-breaking and word games as a family to grow.
- **Costs.** Small to medium. Each derivation needs a planted defect in a
  member game to show the guard still sees what the exemption must not hide.
  Not every (a) classification is certain: `MOVED`, `LATIN` and the bevel
  entries are judgment calls, settled in the change.
- **Evidence.** The census queries (the hits were then sorted by hand):
  `ids=$(ls src/games | grep -v index.ts | paste -sd'|' -)`, then
  `git grep -nE "['\"\`]($ids)['\"\`]" -- src scripts ':!src/generated' ':!*.snap' ':!*.txt' ':!src/games/*'`.
  Bare keys used `^[[:space:]]*($ids)[[:space:]]*:`. Totals: 54
  collections, 378 entries, 94 kind-wide, 284 the game's own, 0 in
  production code. The note-taking roster in `note-taking-cell.test.ts` is
  deliberately asserted in full and is not counted as a defect.

### 5. One hint walk for the cross-game hint guards, and one way to find a population

- **What.** At least 8 of the 19 `src/engine/hint-*.test.ts` guards write
  the same walk by hand (for each game in `HINT_GAMES`, each board in
  `gatePresets`, a new `Midend`, then `hint()` up to that file's own limit);
  `hint-ink` and `hint-mark` are near line-for-line copies. Cross-game tests
  find their games 7 ways:
  - `enrollment.ts`: 36 files;
  - `hint-games.ts`: 32;
  - `registeredGameIds()` directly: 28;
  - the catalog: 14;
  - a `?raw` glob over game source: 26;
  - `readdirSync`: 4;
  - a literal list.

  The per-game tests repeat what the cross-game guards already do:
  - 26 games loop `hint()` until solved;
  - 40 save and load through a `Midend`;
  - 24 round-trip their params.
- **Where.** `src/engine/testing/hint-games.ts` (the walk with a per-step
  visitor), the `hint-*.test.ts` guards, `solve-finishes.test.ts`, and the
  per-game `<id>.test.ts` and `<id>-hint.test.ts`.
- **Eases.** A new hint guard is a visitor, not a walk. One population path
  means one place where enrollment is decided. Removing the duplicated
  per-game tests cuts the tests each new game copies from the skeleton.
- **Costs.** Medium. Each walk's own limits and dealt boards must survive
  the merge. Every per-game test removed needs a check that the cross-game
  guard really covers that game's case (`docs/test-strength.md`).
- **Evidence.**
  - `for f in src/engine/hint-*.test.ts; do grep -nE 'for \(const .* of (HINT_GAMES|gatePresets)|new Midend|\.hint\(' $f; done`
  - `git ls-files '*.test.ts' | grep -v '^src/games/' | xargs grep -lE 'registeredGameIds\(' | xargs grep -LE 'testing/(enrollment|hint-games)' | wc -l` → 28.

### 6. The `Game` contract: required where every game has it, grouped where it is one capability

- **What.**
  - `Game` has 57 members, 15 of them required.
  - Eight optional hooks are implemented by all 65 games: `hint`,
    `hintRungs`, `hintGesture`, `hintKeepTrack`, `hintMarks`, `solve`,
    `paramConfig` and `preferredTileSize`. Being optional costs a `?.` and a
    fallback at every call site, and states nothing true.
  - The hint is seven sibling fields on the game object. 37 games produce
    them from one `described*Hint`, candidate or latin builder object, then
    split it apart field by field.
  - About 15 hooks are used by 1–5 games.
  - `hintGesture`'s same 9-line `verbClicks(...)` body is written in 19
    games, and is derivable from `targetVerbs` and the cells of a move.
- **Where.** `src/engine/game.ts`, `src/engine/sections.ts`, `src/engine/midend.ts`,
  every `src/games/*/index.ts`.
- **Eases.** The contract reads as what a game is. A hint builder hands the
  game one object. The draft rule in `sections.ts` reads off required parts.
- **Costs.** Medium: it touches all 65 `index.ts` files, but mechanically,
  and the type checker finds every site.
- **Evidence.** Hook counts were taken at run time from the registry, because
  `git grep` misreads `notApplicable` keys: a `jiti` import of
  `src/games/index.ts`, then for each `registeredGameIds()` count the keys of
  `getTsGame(id)` that are not `undefined`. `verbClicks\(` is used by 19
  games.

### 7. Split the large files along the seams they already have

- **What and where.**

  | File | Lines | Shape | Seam |
  | --- | --- | --- | --- |
  | `src/describe/compile.ts` | 8,286 | 136 functions behind 5 exports | type inference, expression compiler, bindings, quantifiers, geometry calls, stated text, the 485-line `call` dispatcher, technique analysis, module emission |
  | `src/engine/describe-runtime.ts` | 3,428 | 130 exports, 64 games and every generated module import it | marks and facts, clue lists, spaces, set algebra, connectivity, rays, links, beams, kept store, rectangles |
  | `src/engine/midend.ts` | 3,009 | one class | solve, hint and check (about 700 lines), save and load, params and preferences |
  | `src/puzzle/puzzle.ts` | 1,520 | about 90 members | hint presentation, pending deals, checkpoints |
  | `src/screens/puzzle-screen.ts` | 1,995 | one element | dialog launchers, hint words |

- **Eases.** A session reads the part it changes. Every session counts its
  reading against the one-session budget, and these files are where a
  description or hint change usually leads.
- **Costs.** Low risk and mechanical, since the export surfaces are narrow.
  The feedback probe's anchors move (`feedback-probe.mjs --verify`).
  Readers of `git blame` lose a hop. Below items 1–6 because it is a one-off
  cost, not a per-game one.
- **Evidence.** `git ls-files 'src/*.ts' | grep -v test | xargs wc -l | sort -n | tail`.
  The clusters are from reading each file.

### 8. A `textFormat` grid helper

- **What.** 48 games write the same `textFormat` shell: start an empty
  string, loop over y and x, pick a character, add a newline. Only the
  character choice is the game's.
- **Where.** `src/games/*/state.ts`, a helper beside `src/engine/geometry.ts`.
- **Eases.** Small per-game savings, but a new game should write only the
  one-to-three lines that choose a character.
- **Costs.** Small. The output is pinned by tests, so a migration that keeps
  the text identical is safe.
- **Evidence.** `fl 'export function textFormat'` → 48 games, 1,213 lines.
  41 of those files also match `for \(let y`.

### 9. Guides: state each rule once

- **What.** One kind of game ("Cells marked by state") routes its author
  through about 4,400 lines (about 67K tokens) of guides before any source.
  The guides total 16,075 lines, about 235K tokens. Rules are restated in
  full in two or three places:
  - bounding retry loops: `engine-catalog.md` and `solver-and-generator.md`;
  - the difficulty contract: `mechanics.md` and `solver-and-generator.md`;
  - the note-taking cell: `engine-catalog.md`, `mechanics.md` and
    `rendering.md`;
  - one step per hint: `hints.md` and `hints-marks.md`;
  - fixed seeds, twice within `testing.md`.
- **Where.** `docs/`.
- **Eases.** Each rule has one home, and the next edit cannot update one
  copy and leave the other.
- **Costs.** Small. A doc-only gate is fast.
- **Evidence.** `git ls-files 'docs/*.md' | xargs wc -lc`. The route's sum
  is an awk walk over each section `new-game.md` § "The route by kind of
  game" names. Items 1–6 shrink these guides further, since each removes a
  "how every game does X" passage.

### 10. Source scans by regex inside vitest

- **What.** 32 test files read game source through a `?raw` glob, and 24 of
  them match it with regex alone. `docs/method.md` § "A scan that keys on a
  name" names this shape as the fragile one. Where a scan asks a question a
  declaration could answer, items 4–6 replace it. The rest could read the
  AST, as the 8 that import `typescript` do.
- **Where.** `src/**/*.test.ts` using `?raw`, and the text helpers in
  `src/engine/testing/enrollment.ts`.
- **Costs.** Medium, one scan at a time. It is a sweep, so it ranks low.
- **Evidence.** `git ls-files '*.test.ts' | xargs grep -l '?raw' | xargs grep -L 'from "typescript"' | wc -l` → 24.

### 11. Engine layout: directories by concern, one way in

- **What.**
  - `src/engine/` holds 120 flat top-level modules beside 157 test files;
    45 of the modules are hint machinery.
  - The flat layout is the policy in `docs/engine-catalog.md` § "Where a
    promoted helper lands". The grouping lives in that 1,864-line guide
    rather than the filesystem.
  - The barrel `src/engine/index.ts` is imported by 78 files, while 875
    files import engine modules by direct path. It is not a boundary.
  - Nothing layers the engine internally. `module-layering.test.ts` holds
    games and engine apart, but nothing stops rendering from importing a
    hint planner.
  - About 50 engine tests import the games: they are cross-game guards
    living among the unit tests.
- **Eases.** Finding a helper by its concern. A layering rule inside the
  engine. A smaller catalog guide.
- **Costs.** High churn for a modest gain: every import path, the guides'
  paths and the probe anchors. Recommended only after items 1–6, which
  change what the engine holds. Retiring the barrel, so there is one way
  in, is cheap on its own.
- **Evidence.**
  - `ls src/engine/*.ts | grep -v '\.test\.ts' | wc -l` → 120.
  - `ls src/engine/*.test.ts | wc -l` → 157.
  - The barrel's importers came from an import-graph walk of `src`.

### Answered in passing: does the Web Worker still earn its place?

`docs/doctrine.md` § "Open questions" asks it. It does, but not for the
reason it was built: `src/puzzle/deal-ahead.ts` deals the next board in a
second worker, which is what lets a slow generator run while the board in
play is played, and lets the player stop a deal. It is not a maintainability
cost either, since actions reach the worker through a generic path and a new
engine action needs no edit in the worker layer (`revealOne` and
`clearMistakes` appear in `midend.ts` only). Recording this answer in the
doctrine is part of this change.

## Which go ahead without the owner's pick

On 2026-11-20 the owner asked, after the first finding, that work proceed
"to take on this issue and any other obvious ones", with the lower-priority
items left for their review. Obvious means a clear payoff, a design the
evidence already settles, and no player-visible change. These proceed in
order, each its own change, in a sequence of sessions:

1. Item 3, `register-games-from-their-directories`.
2. Item 4, by widening `derive-hidden-answer-exemptions` to every
   kind-wide entry.
3. Item 5, `walk-hints-once-for-the-guards`.
4. Item 2, `finish-helper-adoptions`, one concern at a time with byte-identical
   params encodings.

Items 1 and 6 rank high but each needs a design call the owner may want to
see: the unit of the redraw loop, and the shape of the hint capability
object. Items 7–11 are lower priority. All seven wait for the owner's pick.

## Risks / Trade-offs

- Counts taken by `git grep` over-count where a game's own word collides
  with a pattern. The contract counts in item 6 were taken at run time for
  that reason; the others give their query to re-check.
- The kind-wide classification in item 4 is a judgment per entry, settled
  in that change with a planted defect each.
