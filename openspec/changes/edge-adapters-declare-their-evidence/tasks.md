# Tasks

## 1. The shell

- [x] 1.1 Pearl: one `sentence`, `marks.reads` and `outline` declared, the keep-track from a codec; compared by the fingerprint
  - Engine: `say` may be one function; `plan` defaults to `EDGE_PLAN` (40); `keepTrackBy(codec)` in `engine/hint-track.ts` (`foreign`, `execute`, `targets`, `changesOf`, `key`, `want`, `valueOf`, `narrowed`, `ring`)
  - Pearl declares `reads` on every technique but `closed`; `premise`, the `reads` hook, the sentence table and `PLAN_CAP` are gone. Pearl outlines nothing, so no `outline`
  - **The fingerprint is blind to `reads`**: its 8 Pearl boards never reach `earlyThrough`, and a planted wrong `earlyThrough` reads set passed every test. The comparison that counts is a dump (2026-11-14): 6x6/8x8/10x10 at both tiers, 14 boards each, 0/15/35/60% of the solution's edges played, every recomputed plan listed: 309,960 lines `cmp` identical to `HEAD`, `earlyThrough` reached 556 times; the same plant moved 1,349 lines. Do the same for each game with `research/hint-walk-dump/` (its header says how), run in a scratchpad worktree of `HEAD` (symlink `node_modules`; copy the harness in where `HEAD` predates it) and in the tree
- [x] 1.2 Tracks and Magnets the same
  - [x] Tracks (2026-11-14): `reads` declared on all eleven techniques, one `say`, `keepTrackBy`, no `PLAN_CAP`. The hint names the first short column before any row while the description's `lines` are rows first, so `finishEarly` reads "the first short column, else the first short row" (`cols`, `rows`, `first`). The dump (`research/hint-walk-dump/`, `DUMP_GAME=tracks`): 34,267 lines identical to `HEAD`, every rung reached (`finishEarly` 63); a planted `strand` reads moved 324
  - [x] Magnets (2026-11-14): one `say` (its `step` already refuses the hidden premise). Its reads were already declared, so no dump was needed. **Its keep-track stays its own**: a step is one domino reached by a cycle of presses (`+`, `−`, neutral, `?`), judged one press short of the goal, which is no set of targets a board diff settles
- [ ] 1.3 The other edge games the same, a commit each
- [ ] 1.4 `PLAN_CAP` the engine's default; ask the owner before changing any of the four exceptions (12, 20, 24, 24)
  - The default is `EDGE_PLAN` (40) since 1.1. Of the edge games, three differ (2026-11-14; the fourth number in the proposal is Ascent's 24, which is not an edge game): Bridges 12 and Magnets 24, whose comments give only the generic UX reason every cap shares, and Galaxies 20, whose comment gives its own (a dot's forced cell recurs unshown, and a longer plan costs a slower press). Each game, as it moves, drops its own copy of the generic comment and keeps its number until the owner answers
  - **Question for the owner**: a plan's length is how many steps follow before the hint recomputes, so it sets where the plan can change course mid-walk, and what a press costs. Drop Bridges' 12 and Magnets' 24 to the default of 40 (their stated reason is the generic one), and keep Galaxies' 20 for its cost reason? Recommendation: yes to both

## 2. The evidence

- [ ] 2.1 Tracks: `shut`, `lineSquares`, `holds`, `empty` declared as terms
- [ ] 2.2 Pearl: `pieceOf` from `through(...)`
- [ ] 2.3 Record Magnets' `whyNot` as the one exception
