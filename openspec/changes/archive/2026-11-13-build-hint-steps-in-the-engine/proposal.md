# build-hint-steps-in-the-engine

**Status: filed on the owner's word (2026-11-10), ready to start.** The first
of the changes
[`derive-hint-steps-from-the-description/report.md`](../archive/2026-11-10-derive-hint-steps-from-the-description/report.md)
§ "The plan" lists, and the one the others stand on. It changes no word a
player reads.

## Why

A compiled ladder gives a described game its firings. Between a firing and
the step a player reads, each game writes the same four things by hand, and
the report measured them at about half of all hint code (its buckets A, C
and D, roughly 17,000 of 34,000 lines, 2026-11-10):

- **A reason**: a callback that copies a technique's binding into an object,
  and computes what the sentence needs beside it. A callback cannot call a
  `define`, so Boats, Bridges, Sticks and Tracks restate their own
  description in TypeScript to have the values.
- **The marks**: which bound element is ringed, outlined or striped, the
  evidence less the targets, and the cells the walk reads.
- **The dispatch**: a switch from a reason's kind to its sentence, and a
  hand-kept `*_RUNGS` list of the kinds.
- **The step**: grouping a firing's facts, `hint`, `hintKeepTrack`,
  `refreshHintStep`, `hintGesture`.

A new described game pays all of it again, and none of it is about the
puzzle.

## What Changes

- **A technique names the terms its step speaks of.** Each is a formula over
  the binding, read on the marks before the firing's facts are made, and
  under the technique's own `with` where it has one. The compiler, which
  already evaluates terms, compiles them into the module, and a firing
  carries its binding and its terms whole. The reason callbacks and the
  restated definitions go.
- **A conclusion's arms are named.** Where a technique concludes several
  things that read differently (Unequal's `sign`, Singles' `corner`, Light
  Up's `square`), each arm has a name, and a firing says which arm made each
  fact. The kinds a hint can speak are then the module's, and the `*_RUNGS`
  lists go.
- **A technique says which of its names are marked and how.** Targets are
  the firing's facts; evidence is what the roles name, less the targets;
  what the walk reads is what the roles name.
- **A technique says how its firing is shown**: one step, one step a fact,
  or one journey with later legs; or not at all, for a technique whose
  strikes a player cannot see.
- **A game declares one adapter**: its state read as the description's
  marks, and a fact as the move that makes it. From that and the module the
  engine builds `hint`, the plan loop, `hintKeepTrack`, `refreshHintStep`
  and `hintGesture`.
- **A game's sentences stay where they are**, as functions of an arm's typed
  terms and marks. Their words do not change; `hint-text.ts` stays until
  `state-hint-sentences-in-the-description`.

## What it must not become

Three earlier attempts to declare a game were withdrawn
(`archive/2026-10-29-investigate-a-language-for-puzzle-games/design.md`
§ "What the earlier withdrawals bind"): a language must not generate a
game's state, its clone or its codec, and a definition object compiled into
a `Game` was refused because no declaration needed another. Read those
before designing the adapter. What differs here is that the adapter is
consumed: the engine runs it to build five hooks, and a game without it has
no hint. If the design finds the adapter saying nothing a helper would not,
it is a helper.

## Before it starts

1. **Build it on three games** and measure the lines that go: Unruly (fixed
   sentences, one arm a technique), Singles (arms, and marks that depend on
   the facts), and Boats or Bridges (terms that replace restated
   definitions). The catalog follows only if these three lose what the
   report predicts.
2. **Decide the comparison first**: every step of every hint walk, words and
   marks, the same before and after. A difference is a defect of the change,
   or a defect it found in the game, said which.

## What it touches

`describe/` (the compiler and the schema), `engine/ladder-runtime.ts`, the
engine's hint modules, every described game's `solver.ts`, `hint.ts` and
`index.ts`, `docs/descriptions.md` and `docs/hints.md`. The specs are
`described-ladder`, `engine-hints` and `engine-candidate-hints`.

## What it leaves

- A game's own plan machinery (the report's bucket E), which
  `explain-a-firing-by-its-witness-and-parents` takes.
- Steps that are not deductions and moves that are not the facts, which stay
  the game's, each written as the override it is.

## Fixed in passing

Mines' count arm handles region members its solver never produces, and
Loopy's `lineReason` throws on `closed` (the report's § "Found in passing").
Check each, and fix what is real.

## Acceptance

Every hint walk speaks the same words and paints the same marks as before.
The three trial games, then the catalog, lose the hint code the trial
predicted. A new game's hint is its description, its adapter and its
sentences.
