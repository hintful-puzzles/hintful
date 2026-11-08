# describe-loopy-net-pearl-tracks-and-tents

**Status: filed by `describe-bridges-loopy-net-pearl-tracks-and-tents`
(2026-11-08)**, which took Bridges alone. It is the rest of step 10 of
`describe-the-whole-catalog`'s plan (`design.md` § "The plan"). Five games is
more than one session describes. Split at the start by what each game adds to
the language, and take the first group:

1. Loopy's tilings and edge marks.
2. Net's rotations.
3. The line games on the square grid: Pearl, Tracks and Tents.

File the rest. The last of them files step 11,
`describe-the-remaining-number-games`, when it is archived.

## Why

Pearl, Tracks, Net, Tents and Loopy each run a hand-written ladder. Net and
Loopy also order their rungs a second time for the hint (the survey,
`design.md` § "Edge, line and division games"). A description states the
rules and the reasoning once, and the checker proves each technique sound.

## What Changes

- **What these games read** is added to the description language, the
  ladder runtime and the checker: Loopy's tilings and marks on the edges
  (dlines), and Net's rotations.
- **Each game's ladder is stated**, with its tiers as it grades them. Its
  hand-written rungs and the hint's second order are retired. A tier past
  the ladder is dealt where the engine's search finds one answer.

## Acceptance

Each game runs its compiled ladder for its hint and its generator's
grading, and its hand-written rungs are removed. Every technique is checked
sound, each with a planted defect that comes out unsound.

The boards dealt, their tiers and the hint walks are compared with HEAD,
and each difference is reported, with which saves or links no longer load.
Large boards are timed back to back with HEAD. The guides are updated and
the running app is checked.

## What was done (2026-11-08)

**Loopy alone**, the first group. Net, Pearl, Tracks and Tents are filed as
`describe-net-pearl-tracks-and-tents`.

- **The language** gained a tiling space (cells are dots; faces and angles
  are sorts), an edge mark on the angles (Loopy's corners), and a relation
  over the edges, alike or opposite (Loopy's pairs), kept closed by
  `EdgeRelation`; an `exists fill` fills the answer's own sort. The engine's
  `FlipDsf`, which only Loopy's solver used, is retired, and its property
  test now holds `EdgeRelation` to the relations stated.
- **Loopy's 27 techniques** replace its four hand-written rungs and the
  hint's recorder threaded through them. The hint walks the compiled ladder;
  a firing that only narrows a corner or relates two edges becomes a fact
  with its parents, placed as a note where a line cites it, as before.
  `closesLoop` is gone: closing a loop because it meets every clue rests on
  the answer being unique, which is no deduction, and a rule settles that
  edge instead. `related` (reading a pair) is Easy, as HEAD graded it.
- **Boards are HEAD's.** The frozen differential against upstream's C (48
  boards, every tiling and tier) still matches byte for byte, and
  `deal-compare` found every board and every cap's verdict the same on 54
  deals of every preset. No save or link changes.
- **Hint walks** from the empty board, 36 boards over every preset, all
  finish and resume halfway, within a few percent of HEAD's length, with a
  rung mix close to HEAD's.
- **Two traps**, recorded in `docs/descriptions.md`: `parityClue` and
  `parityDot` read their open edges stale after placing one, which only a
  run in place shows (§ "A statement's order is behavior"); and
  `cornerFromClue` strikes both bits of a corner, each fact with its own
  reason and witness.
- **Speed.** Deals are 2–3× HEAD's, most under 300 ms. Over the bar:
  9x14 Triangular Hard (1.24 s mean, 1.5 s worst; HEAD 0.54 s), and 9x9
  Cairo Hard at it (0.85 s, 1.0 s worst). What is left is the fixpoint
  running every technique again from the top after each firing, which is the
  engine's policy for every game; raised with the owner.

## What Bridges learned that binds here

The lessons of `describe-lines-and-loops` (Path),
`describe-pearl-tracks-spokes-bridges-net-tents-and-loopy` (Spokes) and
`describe-bridges-loopy-net-pearl-tracks-and-tents` (Bridges, all archived)
bind here.

- **The speed bar was relaxed by the owner (2026-11-08).** A deal under
  100 ms needs no work, whatever its ratio to HEAD, and a large preset may
  take up to a second. Optimize past that only with a compiler or runtime
  change that clearly pays across many games. Time it with `deal-compare`
  on every game whose compiled module it changes, since a change that helps
  one game can slow another (Mosaic took 1.26 of the time under one).
- **A read along a line holds edge by edge.** The checker allows consistent
  marks that differ along a run, so a line read off one of its edges came
  out unsound in every world. Read a run from its ends, as Bridges' `has`
  and `allows` do, and state a group shut off as one no known line leaves
  (`closed(G)`, `docs/descriptions.md`).
- **A geometry the deal decides can be definitions, not a space.** Bridges'
  spans are runs of edges between squares, named by definitions that read
  no marks and are kept for the board. Weigh that before adding a space
  option.
- **The compiler now keeps more**, so state the reading plainly first and
  measure (`docs/descriptions.md` § "What a technique compiles to"):
  - a definition whose value is an element, for the board;
  - a definition reading the candidates of one or two elements, with loops
    two deep, by the rung reading it until a firing;
  - repeated terms in a technique's binders;
  - a set stated member by member, with no array made.
- **The language has no conditional expression.** Use `sum(z in {c} where
  P of t)` for a value that holds only where `P` does. Use `max(k in
  range(0, n) where k = 0 or (…))` for a clipped least value, and `min(j in
  range(…) where …)` for the least value that passes.
- **A plant must change what the technique concludes.** Bridges'
  `mustReachOut` plant first dropped a premise that small boards never
  reach, and stayed sound at orders 3 and 4. A conclusion that strikes too
  much catches at once.
- **A soundness check is stale if the description is edited after the
  check starts.** Freeze the description, then check
  (`compile.test.ts` names any technique whose recorded verdict is stale).
- **Compare walks on HEAD's boards in one process.** `deal-compare`
  extracts HEAD's `src/` to `.deal-compare/<sha>/`. A scratch test importing
  both trees' games deals with HEAD's generator, grades with both solvers,
  and walks each hint to its end.
