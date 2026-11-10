# explain-a-firing-by-its-witness-and-parents

**Status: draft, filed on the owner's word (2026-11-10), for later.** Third
in the plan of
[`derive-hint-steps-from-the-description/report.md`](../archive/2026-11-10-derive-hint-steps-from-the-description/report.md).
It waits for `build-hint-steps-in-the-engine`, whose firings it extends, and
its clauses are written in the words `standardize-hint-vocabulary` settles.
The session that takes it up writes its tasks.

## Why

Once the engine builds a step from a firing, what is left of a game's hint
code is its own plan machinery, about 7,800 lines, 6,500 of them in fifteen
games (the report's § "What the plan machinery is", 2026-11-10). Most of it
answers one of two questions the firing does not:

- **What exactly broke?** A technique that supposes a value says only that
  some rule would break. The game works out again which rule and where, to
  have words for it: Path's `clashOf`, Spokes' `breakOf`, Bridges'
  `tooMany`, Boats' `classifyBreach`, Tracks' `finishEarly`, Signpost's
  `why`, Rect's `fitReason`, Pearl's `noStraight`.
- **What does this rest on?** A firing that only makes a mark is not a step.
  Loopy and Slant keep each as a fact with the facts it rests on, place it
  as a note before the step that cites it, and drop it where nothing does,
  in about 1,600 lines between them; Crossing, Map, Tents and Subsets each
  have their own version. And where a player cannot write a candidate at
  all, the game re-derives from the visible board why it was struck:
  Magnets' `reading.ts`, Ascent's readings, Filling's `bitmap`, Salad's
  markers.

## What Changes

- **A firing carries its witness.** On the hint path the compiled technique
  reports which arm of an `or` held and which member of an `exists` it held
  for, the rule a `with` broke and the element it broke at. The solve path
  pays nothing.
- **A firing carries what it read**, so the engine keeps the facts a walk
  makes as a graph: each fact, the firing that made it, and the facts that
  firing rests on.
- **The engine places a note where it is needed.** A firing that only makes
  a mark becomes a step just before its first consumer, never before a note
  it cites itself, grouped with what it serves as one journey, and no step
  at all where nothing cites it. A note whose sentence quotes the board is
  placed while the sentence still holds.
- **A candidate a player cannot write is spoken by its parents.** Each
  technique that strikes has a clause ("beside another +", "its row has all
  its +s"), and a step that rests on a struck candidate says the clauses of
  the firings that struck it.
- **The engine answers "what does this fact rest on?"** for any fact from
  any position, which is the question `check-the-last-move` asks.
- **The candidate plan runs on any space**, so Map and Undead use the
  engine's and drop their own.

## Before it starts

1. **Read the three models side by side**: Loopy's `record.ts`, Slant's
   trace in `solver.ts`, and `engine/candidate-hint.ts`. Write one model
   that serves all three before building any, and say what each game's
   would lose.
2. **Sort the `exists fill` cases apart.** Why each filling of a line fails
   (Net's `explain.ts`, Pattern's packings, Tents' `lineCount`, Pearl's
   square) is harder than a witness. Ask first whether stating the specific
   technique ahead of the general one is simpler: Pattern's overlap as a
   technique of its own, before `line`.
3. **Measure the walk's cost with reads recorded**, on the games whose walks
   are long, against the commit before.

## What stays a game's

A step that is not a deduction (Guess's probe, Black Box's laser and its
layout search, Mines' first click, Ascent's whole run), and a move that is
not the facts (Rect's drag, Boats' fills, Bridges' two drags). Each stays
as an override that says why.

## What it touches

`describe/compile.ts` (the hint path), `engine/ladder-runtime.ts`,
`engine/candidate-hint.ts`, the hint code of the fifteen games, and
`docs/hints-marks.md`, `docs/hints-candidates.md` and `docs/descriptions.md`.

## Acceptance

To be written when it starts. At least: every hint walk still finishes, each
step's words are the same or accepted by the owner, the games named lose
the machinery the model replaces, and a solve costs what it did.
