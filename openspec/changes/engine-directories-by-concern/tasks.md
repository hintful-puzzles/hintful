## 1. The layout

- [x] 1.1 Re-measure the engine; propose the directories from its import
      graph and concerns, and the layering between them. Record the
      proposal here before moving anything.
- [x] 1.2 Check what keys on engine paths (gate scoping, the commit hook's
      test selection, the probe, guides) so a move does not silently narrow
      what runs.

### The proposal (measured 2026-11-20 at `1566a2afb`)

`src/engine/` held 120 flat modules and 7 directories (`color/`, `grid/`,
`random/`, `word-list/`, `describe-runtime/`, `edge-clue-latin/`,
`testing/`). The directories, **bottom to top**: a module imports *at run
time* only from its own directory or one below it. A type-only import goes
anywhere, because the contract names every concern's types, and it forms no
runtime edge. Measured over the runtime edges of every non-test module with
this assignment: none goes up.

| Directory | What it holds | Modules |
| --- | --- | --- |
| `color/` | the palette (stays) | as now |
| `contract/` | the `Game` contract and the vocabulary its members return | game, types, catalog, sections, assert-never, difficulty, desc-error, solve-failure, hint-refusal, deal-census, retry-limit, hint-words, wording-rules, hint-track |
| `random/` | the RNG (stays) | as now |
| `board/` | a board's structure: geometry, edges, union-find, loops, sorted sets, shuffles, planar grids | dsf, square-edges, geometry, grid-text, findloop, n-times-root-k, sorted-multiset, shuffle, candidate-bits, `grid/` |
| `input/` | pointer, keyboard, keypad | pointer, key-map, key-labels, hint-gesture, touch-help, target-verb |
| `game-id/` | descs and params | desc-reader, decimal, run-length, wall-runs, dot-runs, desc-alphabet, obfuscate, params-codec, params, param-label, preset-grid, ruleset, only, config-narrowing, modifier, param-help |
| `render/` | drawing, the tile cache, the hint's marks, animation | draw, drawing-rules, tile-cache, overlay-sidecar, win-wave, easing, pencil-indicator, path-arrow, ring, hint-mark, hatch, piece, region-walls, spread-colors |
| `mechanics/` | a mechanic several games share, input to look to hint | border-grid, border-grid-render, border-grid-hint, line-drawing, edge-hint, note-taking-cell, code-rows, wires |
| `generate/` | random partitions, tilings and placements | divvy, divide, redivide, mend-division, laydomino, symmetric-blacks, loopgen, region-fill, `word-list/` |
| `solve/` | the deduction ladder and what compiled descriptions run on | deduction-fixpoint, step-budget, hint-frontier, ladder-runtime, position-runtime, permutation-planner, describe-runtime (+ `describe-runtime/`), fact-graph, deduction-record, marks-made, wing, latin (+ its descriptions), hint-finishes, answer-search, square-tiling |
| `hint/` | the planners, judges and sentences of a hint | hint-plan, described-hint, described-firing-hint, described-rules-out, described-edge-hint, move-judge, candidate-hint, candidate-plan, candidate-judge, entry-mistakes, latin-hint, latin-notes, hint-text, stated, stated-clauses, step-voice, apart-by-position, rival-judging, best-by, search-outcome, finish-search, slide-planner, position-store, pencil-prefs |
| `edge-clue-latin/` | the board Unequal and Adjacent share (stays) | as now |
| `midend/` | what drives a game: undo, deal, save, the registry | midend, midend-animation, midend-params, midend-prefs, midend-save, save, deal, registry, completion-status, ui-snapshot, same-value, rules-out |
| `testing/` | the in-process harness (stays) | + fake-game |

Choices the graph forced, each with the edge that forced it:

- `difficulty`, `desc-error`, `retry-limit`, `deal-census`, `solve-failure`
  and `hint-refusal` are the contract's: `grid/` reads `desc-error` and
  `retry-limit`, `desc-error` reads `difficulty`, and `answer-search` reads
  the refusals. Each is a value a contract member returns or throws.
- `hint-words` and `wording-rules` are the contract's: `overlay-sidecar`
  (render) and the midend read them, and a `HintStep` holds a `Sentence`.
- `hint-track` is the contract's: `edge-hint` (a mechanic) reads it, and it
  is `trackHint`'s helper.
- `hint-frontier` is `solve/`'s: `deduction-fixpoint` reads it.
- `mechanics/` sits below `hint/`: `candidate-hint` reads `note-taking-cell`
  and `hint-text` reads `border-grid-hint`. `generate/` sits above it:
  `redivide` reads `border-grid`'s directions.
- `edge-clue-latin/` stays its own directory above `hint/`: it reads
  `candidate-hint` and `latin-hint`.
- `rules-out` is the midend's: only the midend and its preferences read it.

File names stay as they are, so a guide's `dsf.ts` still names the file.

**Tests.** A test named for a module moves with it, even one that sweeps the
games to test it. A test named for no module whose population is the games
(drawn from `testing/enrollment.ts`, `hint-games.ts`, the registry or a glob
of game source) is a cross-game guard and moves to `src/guards/`, with its
snapshots. Any other test goes to the directory of what it tests. The guards
move first, so no file moves twice.

**What keys on engine paths** (1.2), repointed by the codemod
(`scripts/move-modules.mjs`) where it is a path from the root, and checked by
hand where it is not: `vitest.config.ts` (the heavy files, the snapshot
serializer), `package.json`'s `test:hint-sweeps`, `scripts/checks/
select-tests.ts`'s self-checks, `reach.ts`, `engine-catalog.mjs` (lists
`src/engine/` one level deep: must learn the directories),
`feedback-probe.mjs` (walks recursively; its cases name module paths),
`stryker.config.mjs`, `spelling-table.mjs`, `unused-exports.mjs`'s ledger,
`src/describe/sources.ts` (the runtime paths the compiler emits; a moved
description compiles to a moved module), `module-layering.test.ts`, the
globs in tests (repointed by their static prefix), and every guide and spec.

## 2. Move

- [ ] 2.3 Move the cross-game guards into their own directory (first, so no
      file moves twice).
- [ ] 2.1 Move one concern per commit with a codemod; verify by the diff's
      shape. Run `feedback-probe.mjs --verify` after each.
- [ ] 2.2 Retire the barrel.
- [ ] 2.4 Add the layering guard; plant a forbidden import and see it fail.

## 3. Finish

- [ ] 3.1 Rewrite `docs/engine-catalog.md`'s placement rule and trim what the
      layout now says. Commit, push, archive.
