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
