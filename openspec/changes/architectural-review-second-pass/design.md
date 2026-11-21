## Context

The review read the tree on 2026-11-21 at `22ba4e45f`, on the first one's
lines (`archive/2026-11-20-architectural-review/design.md`): what games still
repeat, the engine and its contract, how the cross-game guards find their
population, the describe compiler and the ladder runtime, the app shell, and
the tests, tooling and guides. Every count below comes from the query beside
it, run from the repository root; re-run it before relying on it. "Games"
counts the 65 registered games.

`fl P` sums the lines of each function or method whose trimmed first line
matches the ERE `P`, through the next line at the same indent that starts
with `}`, over `git ls-files 'src/games/*/*.ts' | grep -v '\.test\.ts$'`. It
is an awk walk; the first review's `fl` saw only top-level functions, so
its method counts were low.

Ranking weighs payoff at dozens to hundreds of games (`docs/doctrine.md` §
"The goal"): a cost every new game or every cross-game guard pays ranks above
a one-off cost in a large file.

## Goals / Non-Goals

**Goals:** what the first review's changes left; a ranked list, each item
with what, where, what it eases, what it costs, and measured evidence.

**Non-Goals:** making any of the refactorings; player-visible change.

## What the first review's changes left

| # | Item | Now | Left |
| --- | --- | --- | --- |
| 1 | Redraw loop and palette roles | `TileCache` and `rolePalette` in 57 and 64 games | The walk stayed the game's, by decision: `fl '^(export )?function redraw'` → 63 games, 8,880 lines (was 9,272). Cube, Loopy, Untangle, Numgame and Ball Sort keep the explicit form. Items 3 and 4 below are what the walk still repeats. |
| 2 | Helper adoptions | `paramsCodec` 43 games (was 41), `interpretTargetVerbs` 33 (was 31) | Each holdout sorted with its reason in that change's tasks. `fl '^((export )?function )?validateParams[(]'` → 59 games, 632 lines; see item 7. |
| 3 | Register from the directory | Done: a new game is its directory plus help page and icon | Wordtrail is named in 14 files outside its directory, all the game's own reasons, fixtures or snapshots (`git grep -l -w wordtrail -- . ':!src/games/wordtrail' ':!openspec/changes/archive' ':!src/generated'`). |
| 4 | Kind-wide exemptions | `expectLedger` holds 14 test files both ways | The first review's `NARRATES_MOVES` claim was wrong: Flip declares `nothingToDeduce` and is not listed. Board pins a new game may owe: item 8. |
| 5 | One hint walk, one population | `registeredGameIds()` read directly by 0 guards (was 28) | The walk serves the guards; per-game hint tests still walk by hand: item 5. |
| 6 | The contract | 37 members (was 57), hint one object | `awk '/^export interface Game</,/^}/' src/engine/contract/game.ts \| grep -cE '^  [a-zA-Z]+\??[:(<]'` → 37. `redraw` still takes 11 positional parameters: item 3. |
| 7 | Split large files | Done where a seam had ownership | Declined with reasons: `compile-expr.ts` (one strongly connected component, 3,640 lines), the midend's hint section (`midend.ts` 2,616). See item 9. |
| 8 | `textFormat` helper | `fl '^((export )?function )?textFormat[(]'` → 50 games, 984 lines | What is left is game-specific layout (Flip's 3×3 squares). |
| 9 | Guides, each rule once | Copies folded | The route by kind did not shrink, and that change handed the question here: item 6. |
| 10 | Source scans read the AST | 8 regex-only `?raw` scans (was 24) | The 8 read YAML, help markup or a plugin, where regex is right. |
| 11 | Engine directories | Done; barrel retired; layering held by `module-layering.test.ts` | Nothing. |

The app shell holds no game-keyed branch: the census
`git grep -nE "['\"](<ids>)['\"]" -- src ':!src/games' ':!src/generated' ':!*.test.ts' ':!src/engine/testing/*'`
finds only words that are also game ids (`group`, `range`, `path`), and the
same holds inside the describe compiler.

## The ranked list

### 1. The gate's test time grows with every game, and meets its own budget near 83 games

- **What.** The suite's test CPU was 33.1 reference minutes on the last
  green Gate run, against the suite budget of 40 (`BUDGET.suite = 2400` in
  `scripts/checks/test-cost.ts`, "about ten minutes on four workers"). Half
  of it is the cross-game guards, which every new game pays into. CI's wall
  time doubled in a month: `gate.yml`'s comment cites 9.7 minutes on
  2026-10-27; recent green runs take 19–20 against `timeout-minutes: 30`,
  and the comment's "1.7 times a slow runner's run" no longer holds.
- **Where.** `.github/workflows/gate.yml`, `vitest.config.ts` (`SHARES`,
  `SPREAD`), `scripts/checks/test-cost.ts`, and the dearest guards.
- **Eases.** Adding games without the gate failing on cost. At about 23
  reference seconds a game (the guards' 16 minutes over 65 games, plus the
  game's own files' 8.5 s average), the 6.9 minutes left run out at about
  18 more games. That is a linear model; a guard whose cost grows faster
  reaches the budget sooner.
- **Costs.** Small for the wall: a matrix of `vitest --shard` jobs in CI, so
  wall time stops tracking the suite, with the budget restated per shard.
  Medium for the CPU: the dearest guards (warm-repaint 147 s, hint-resume
  122 s, difficulty-contract 101 s, wrong-entry-check 99 s,
  candidate-reading 89 s, hint-quality 79 s) are cut only where a board
  adds no coverage, judged by `docs/test-strength.md`. Raising the budget is
  the owner's call, since they set it.
- **Evidence.**
  - Gate run 44847177791 (`b9ac9d06e`): "Test CPU time: 33.1 minutes over
    575 files"; "The games' own files: 9.2 minutes over 65 games"
    (`gh run view 44847177791 --log | grep -E 'Test CPU time|games. own files'`).
  - Per directory, from the same log's per-file times: `src/guards/` 64
    files, 1,492 s (49%); per-game tests 284 files, 1,126 s; `src/engine`
    132 files, 238 s.
  - `gh run list --workflow gate.yml --limit 12 --json conclusion,createdAt,updatedAt`:
    green runs of 11, 12, 19, 20, 20 and 33 minutes.

### 2. A deduction game converts its board into its description's givens by hand

- **What.** Before a ladder runs, each deduction game builds its
  description's `Dealt` from its own state: 47 games write a `dealtOf`, most
  the same walk (collect the nonzero squares' positions and values, call
  `clueList`). 29 games wrap the ladder in a function that only calls
  `describedLadder(<module>, dealt)`. 17 write a `spaceOf`, and 16 cache
  both in a `WeakMap`.
- **Where.** `src/games/*/solver.ts`, `src/engine/solve/describe-runtime/`,
  `src/engine/solve/ladder-runtime.ts`.
- **Eases.** A new deduction game writes none of this. Cheapest form: a
  `cluesWhere(values, keep)` beside `clueList`, a default ladder when the
  game names only its compiled module, and the memoization in the runtime.
  Fuller form, a design call: the description declares how its givens read
  from the board, and the adapter is generated.
- **Costs.** Small for the helpers and the default (mechanical, the
  type checker finds every site). Medium to large for the declared form:
  10 of the 47 adapters exceed 20 lines and may be the game's own.
- **Evidence.**
  - `git grep -lE 'function dealtOf' -- 'src/games/*/*.ts' ':!*.test.ts' | cut -d/ -f3 | sort -u | wc -l` → 47; `fl '^(export )?function dealtOf'` → 723 lines.
  - `git grep -lE 'clueList\(at, ?v' -- 'src/games/*/*.ts' ':!*.test.ts' | cut -d/ -f3 | sort -u | wc -l` → 23.
  - `fl '^(export )?function [a-z]+Ladder[(]'` → 43 games, 44 functions, 508 lines, 29 of at most two body lines.
  - `function spaceOf` 17 games; `new WeakMap<` 16 games (`git grep -l` as above).

### 3. `redraw` takes its frame as one object

- **What.** `Game.redraw` has 11 positional parameters
  (`dr, ds, prev, s, dir, ui, animTime, flash, hint, mistakes, deadEnd`).
  Every render file writes the signature, and most name parameters only to
  ignore them. A new frame input is a signature edit in every game, as
  `deadEnd` was.
- **Where.** `src/engine/contract/game.ts`, `src/engine/midend/`, every
  `render.ts` and the skeletons.
- **Eases.** A game destructures what it reads; a frame input is added in
  one place; the per-game signature (about 12 lines) goes.
- **Costs.** Medium and mechanical: 65 files and the skeletons, type-driven,
  no behavior change, no snapshot moves.
- **Evidence.** `git grep -lE "[[:space:]]<param>" -- 'src/games/*/render.ts' | wc -l`:
  `_dir` 54, `_prev` 49, `_animTime` 47; `hint?: HintStep` 59,
  `mistakes?: readonly` 46, `deadEnd?:` 4.

### 4. One way to paint a cell's hint marks

- **What.** 64 games read their marks with `stepMarks`, and then paint them
  in several forms: `HintMarks` with an `OverlaySidecar`, `drawMarkSides`
  inside the tile, `MarkOutlines.packed` in the key, or by hand. The hint's
  marks are the same contract in every game, so a reader and a porter meet
  four ways to do one thing.
- **Where.** `src/engine/render/hint-mark.ts`, `overlay-sidecar.ts`, the
  games' `render.ts`; `docs/hints-marks.md` and `docs/rendering.md`.
- **Eases.** One shape in the guides and the skeletons; a fix to how a mark
  is drawn reaches every game.
- **Costs.** Medium to large, and it needs a census first, as the redraw
  change had: some forms are real variants (a ring around a cell against a
  band inside a tile, marks on edges, on tiles that move). Each moved game is
  checked in the app, and render snapshots must not move.
- **Evidence.** Per game, which of `HintMarks`, `MarkOutlines`,
  `OverlaySidecar`, `drawMarkSides` its non-test sources call
  (`git grep -qE "(new )?$x\(" -- "src/games/$g/*.ts" ':!*.test.ts'`):
  none 26 (four through a shared renderer: Adjacent, Unequal, Palisade,
  Separate), `HintMarks`+`OverlaySidecar` 14, `drawMarkSides` alone 11,
  `OverlaySidecar`+`drawMarkSides` 5, `HintMarks`+`MarkOutlines` 3, other
  mixes 6. Which of the 26 paint by hand and which through a module of
  their own is the census's first task.

### 5. A plan-level hint walk for per-game tests

- **What.** `testing/hint-walk.ts` walks a midend for the cross-game guards.
  No helper walks a game's `plan` alone, so per-game hint tests loop it by
  hand, each with its own stop rule (a status, `validateBoard`, an empty
  plan) and per-step check.
- **Where.** `src/engine/testing/`, `src/games/*/*-hint.test.ts`, the
  skeletons' hint tests.
- **Eases.** A new game's hint test is a visitor; limits and the answer
  check each step are written once.
- **Costs.** Medium: each walk's stop rule and check must survive, and a
  removal is checked against `docs/test-strength.md`.
- **Evidence.**
  - `git ls-files 'src/games/*/*-hint.test.ts' | xargs grep -lE 'for \(let (i|step|n|k) = 0; .*\+\+\) \{' | xargs grep -lE '\.plan\(|hint\(' | wc -l` → 32 of 62.
  - A local `function walk` in 13 (`grep -lE 'function walk[A-Za-z]*\('`).
  - Per-game test volume: 284 files, 94,150 lines, against 160,240 lines of
    game source.

### 6. The route's every-game sections are what a new game reads

- **What.** `state-each-guide-rule-once` found that folding copies did not
  shrink the route, and that its cost is the size of the sections it sends
  every kind to. Each kind reads 3,662 to 4,811 lines (about 223 to 295 KB,
  roughly 55 to 75 thousand tokens) before any source. The guides total
  16,087 lines, as before (16,075).
- **Where.** `docs/`, by the route in `new-game.md` § "The route by kind of
  game"; the every-game block is the target.
- **Eases.** A session's reading budget. The rule "a guide points, and the
  code details" applies: a passage that walks through what the skeleton
  already shows can become a pointer to the skeleton's line.
- **Costs.** Small to medium, doc-only; each cut is weighed section by
  section. Items 2–5 each remove a "how every game does X" passage, so this
  goes after them.
- **Evidence.** `node scripts/checks/guide-sections.mjs --route` (after this
  change's pointer fix, below): notes 4,296; marked by state 4,227; edges
  4,314; moves and search 3,662; hidden answer 4,811 lines. The largest
  sections, by an awk count of lines per `##`/`###` heading: hints.md §
  "Judging the last move" 134; rendering.md § "What a board looks like:
  pieces on a quiet surface" 101;
  mechanics.md § "Pencil marks: the full note-taking UX" 94; hints.md §
  "Bind the words to the marks" 88.

### 7. One bound on a board's area

- **What.** 24 games refuse a large board with `AREA_TOO_LARGE`, under 11
  different bounds (`0x7fffffff`, `Number.MAX_SAFE_INTEGER`, `2 ** 28 - 1`,
  half of `INT_MAX`, one million, ten thousand), most of them upstream's C
  overflow guards, which mean nothing in TypeScript. The other games have
  none.
- **Where.** `src/engine/game-id/params.ts` (`dimensionParamConfig`, used by
  48 games), the games' `validateParams`.
- **Eases.** One rule for what the app can deal and draw, held by the
  engine; a new game writes no overflow guard.
- **Costs.** Small, but **player-visible**: it changes which Custom sizes
  are accepted, and a shared game ID with a very large board could load
  where it did not, or stop loading. The owner's call.
- **Evidence.** `git grep -n -B3 'return AREA_TOO_LARGE' -- 'src/games/*/*.ts' | grep -E 'if \('`;
  `git grep -lE 'AREA_TOO_LARGE' -- 'src/games/*/*.ts' ':!*.test.ts' | cut -d/ -f3 | sort -u | wc -l` → 24.

### 8. Board pins a new game may owe a guard

- **What.** `warm-repaint.test.ts`'s `WRONG` pins a board and the moves
  that make it wrong, for each game whose seeded run never checks a wrong
  board (18 entries). For a game on `entryMistakes`, a wrong board is
  derivable: solve, then change one entry. `no-solution-load.test.ts`'s
  `REFUSED` (14 entries) holds a game ID with no solution for each game that
  proves one without checking mistakes; writing an unsolvable desc is the
  game's own work, so it stays.
- **Where.** `warm-repaint.test.ts`, `src/engine/testing/`.
- **Eases.** A new game of that shape owes no pin.
- **Costs.** Small to medium; each derivation is seen to fail on a planted
  defect, and pins for games not of that shape stay.
- **Evidence.** `grep -c '^  [a-z]*: {' src/guards/warm-repaint.test.ts` → 18;
  `awk '/^const REFUSED/,/^};/' src/guards/no-solution-load.test.ts | grep -cE '^  [a-z]+:'` → 14.

### 9. Large files left by the split

- **What.** `src/describe/compile-expr.ts` 3,640, `src/engine/midend/midend.ts`
  2,616, `src/engine/hint/candidate-plan.ts` 1,540,
  `src/engine/solve/ladder-runtime.ts` 1,381. The first two were declined
  with reasons that still hold. The last two were not looked at for seams.
- **Costs.** One-off; ranks last. Not recommended now.
- **Evidence.** `git ls-files 'src/*.ts' | grep -vE 'test|^src/generated|^src/games/' | xargs wc -l | sort -n | tail`.

## Also measured, no item

- **The description language grows with the games, as it should.** Of the
  31 rule kinds in `src/describe/kinds.ts`, 10 serve one game, and 13 of
  the 46 builtins in `compile-expr.ts`'s `call` appear in one description:
  new vocabulary arriving with new games. Its build is 0.9 s for 69
  modules and 113,744 generated lines (untracked).
- **Rules and ladders never meet in one game.** 50 descriptions have a
  ladder and no `rules`, 15 (the planning games) the reverse. A deduction
  game's moves are "set a cell", so describing them would gain little.
- **Hand-kept tables** are now mostly fixtures (`upstream-params`, the
  store's tests, `deal-ahead`) or the game's own reasons (`orientation`,
  `mark-collisions`); `expectLedger` holds 14 test files both ways.
- **Recent CI failures** were fixed by later commits: Sixteen's midend test
  (`62133d1c5`) and Slant's cost over the game budget (`b5e13f404`).

## Fixed in passing

- `docs/new-game.md` § "The route by kind of game": "Moves and search" now
  reads `descriptions.md` § "A planning game's position and moves"; all 15
  planning games describe their position and moves, and the route sent them
  to no section of that guide.
- `scripts/checks/spec-census.mjs` named `spec-size.mjs`, which no longer
  exists; the bound is `spec-form.mjs`'s.
- `scripts/move-modules.mjs` was named nowhere; `engine-catalog.md` §
  "Where a promoted helper lands" now points to it.

## Which go ahead without the owner's pick

None yet. The first review's owner instruction (proceed with the obvious
ones) was for that list. Items 1–5 and 8 have no player-visible effect and a
clear payoff; item 7 is player-visible; item 1 may raise a budget the owner
set. The owner picks.

## Risks / Trade-offs

- Counts by `git grep` over-count where a game's word collides with a
  pattern; each item gives its query to re-check.
- Item 1's projection is linear in games. Item 4's form counts say which
  helpers a game calls, not how much painting it does by hand.
