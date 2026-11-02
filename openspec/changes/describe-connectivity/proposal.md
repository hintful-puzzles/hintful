# describe-connectivity

**Status: filed by `describe-tiles` (2026-11-02)**, step 8 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). It files
step 9, `describe-edges-and-divisions`, when it is archived, or the part of
itself it splits off first.

## Why

Singles, Range, Rome, Slant and Boats each run a hand-written ladder beside
a description that states only its help. What they read that the language
lacks (the catalog's survey, `design.md` § "The constructs"): C,
connectivity over the marks (clear squares connected and their cut
vertices for Singles and Range, a chain along Rome's arrows, acyclic over
Slant's border vertices, Boats' components and fleet); a direction step
(Rome, Boats); border vertices (Slant); relation marks (Slant's alike and
v-shapes); and L or a restatement where a rule is a look.

## What Changes

- **C, a direction step, border vertices and relation marks** in the
  description language, the ladder runtime and the checker, as far as these
  games read them.
- **Each game's ladder stated**, its tiers as it grades them, and its
  hand-written rungs retired. Singles' `solveSneaky` is unsound and stays a
  generator hook, saying why (`design.md` § "Decisions made here"). Boats'
  `hint-solver.ts` is a second ladder; a description makes the two one.
- **Split at the start** if the session finds the step too large, as step 7
  split by game: the proposal is re-scoped to what it takes, and the rest
  filed as a change of its own.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's grading;
the hand-written rungs removed; every technique checked sound; the boards
dealt, their tiers and the hint walks compared with HEAD and each difference
reported, with which saves or links no longer load; the guides updated; the
next step filed.

## What step 7 learned that binds here

- Record the comparison at HEAD before any code moves: a scratch
  `src/scratch-*.test.ts` that deals every preset at several seeds and walks
  each hint to the end by its first step, writing desc, deal time and every
  step's rung, move and words as JSON to the session's scratchpad; run it
  again after, and diff by each square's final mark and rule, keyed by what
  a move decides (Magnets keyed by a move's end read two walks that decided
  the same tile as different), not by step count.
- Two readings a hand-written scan interleaves (each line's full count, then
  its exact one) are one technique bound by the clue
  (`docs/descriptions.md` § "A statement's order is behavior"): stated as two
  rungs, every line's first reading ran before any second, and 287 squares
  of Magnets' walks moved to another rule; stated as one, the walks matched
  HEAD's but for order.
- A hand-written sweep that placed in turn, each placement read by the next,
  is two firings on a hint's walk (§ "What a technique compiles to"); a test
  pinned on the sweep's third leg then reads the next firing's sentence.
- The checker reads marks the game never reaches (an open end beside a
  placed one); a technique that leans on the game's placements is unsound
  there, and the statement states the guard. It cannot divide a count it
  does not fix: state `2 * a = |M|`, not `a = |M| / 2`.
- A technique run on a strike (`on: strike`) keeps a fact's consequence in
  the firing that made it, so a hint never shows it as a step of its own; a
  mark that is a state of the candidates needs no construct (Magnets' `?`).
- A definition is computed at each read, so bind a term a technique reads
  more than once (§ "What a technique compiles to"); profile a deal with
  `node:inspector/promises`' `Session` inside a scratch test, since a worker
  writes no `--cpu-prof`.
- A library name must be spelled apart from every name a description
  defines; grep the descriptions and `compile.ts`' names first. A plant is
  keyed `<game>.<id>` where another game states the id.
- A hint that deduces from the player's notes builds marks from the values
  placed and the notes shown and walks the compiled firings (`ladderWalk`);
  its plan and words stay its own, and its sentences may read a snapshot of
  the marks in the game's own terms (`magnets/hint.ts`' `snapshot`).
- A frozen upstream differential the generator no longer reproduces becomes
  a check that each frozen board validates, round-trips and grades at its
  tier (Magnets', Light Up's `*-differential.test.ts`).

## Figures to re-check

Measured on `describe-tiles`' last commit (2026-11-02), solver and hint
files: Singles `solver.ts` 909; Range `solver.ts` 808; Rome `solver.ts` 938
and `hint.ts` 313; Slant `solver.ts` 904 and `hint.ts` 802; Boats
`solver.ts` 1,026 and `hint-solver.ts` 1,407. `firing-replay.ts` is read by
the ladder runtime, Latin, Seismic and Solo besides Rome, so the plan's
"retires `firing-replay.ts` if Rome was its last reader" does not apply.
Re-measure before designing against any of these, and record the HEAD
baseline at the session's start.
