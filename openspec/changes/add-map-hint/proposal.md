# add-map-hint

**Status: scaffolded, not started.** Owner-requested, 2026-09-21.

## Why now

Map is hintless, and it has just acquired the thing that makes a hint
*teachable* there: after `give-map-element-keys` a player can enter any
candidate with one key press. **Map's `pencil` bitmask literally is the
candidate set** — four bits, one per color — so the markable-facts rule
(`AGENTS.md` § "Hint quality bar" #6) is satisfied out of the box for the two
lower tiers, with no notation to invent. That is rare: Loopy needed a whole
change (`add-loopy-notation`) to reach the same starting line.

`characterize-the-hint-assessment-corpus`'s `audit.md` classifies Map **A2 —
"fits the runner, techniques inline: a ladder that must be split into functions
first"**, and records that the proposal which guessed Map "not a ladder" was
wrong. Its three recommended *instrument* picks — Tracks, Bridges, Seismic —
have all since shipped hints, so the assessment order it set is spent; Map is a
**value** pick, and should be argued as one rather than as a measurement.

## The ladder, read from `solver.ts` (2026-09-21)

Map's tiers are caps on one deduction loop. In its own terms:

| Tier | Rung | Shape |
| --- | --- | --- |
| Easy | a region with exactly one color left | naked single |
| Normal | two **adjacent** regions with the *same* two candidates force both colors between them, so any region neighboring both can be neither | naked pair, over a graph |
| Hard | forcing chains: BFS from a two-candidate region; if ruling out `C` at one end forces `C` at the other, any common neighbor loses `C` | numbered chain |
| Unreasonable | guess and verify | **Search** |

Easy and Normal are Check/Tactic and narrate directly. Normal is the good one —
it is Palisade's "share a fate" premise in a different dress (*"these two
regions are neighbors and both are down to red or blue, so between them they
use both; nothing touching both can be either"*), and getting that premise
**stated** is exactly what `equivalentEdges` taught. Hard is a chain, and
**a chain is numbered, never drawn as a path** — the repo has measured that an
arrow's "this forces that" is false about a third of the time. Unreasonable is
Search: the hint refuses and says deduction has run out.

## What is genuinely hard here, and why it is worth doing

**Map is the collection's first hinted *graph*.** Every shared hint helper is
cell-shaped by construction, and the repo already knows it:
`hint-mark.ts`'s own header says its marks are bands on "a cell's *border
box*", and `hint-ordinal.ts` draws its chain number "inside one tile". A Map
region is a set of **half-cell triangles** with an arbitrary polyomino outline,
so it is not any cell's border. Bridges was picked into the corpus precisely to
test whether that vocabulary generalizes past a cell, for a span; Map is the
harder version of the same axis, and the honest outcome may be that a helper 24
games depend on is a square-grid convention wearing framework clothes — which
`docs/games/hints.md` would then have to say.

**And Map has a deixis problem no grid game has: how do you *name* a region in
a sentence?** There is no "R3C4". What exists is `map.regionx`/`regiony` (label
points, in half-cells) and the `showNumbers` preference, which is **off by
default**. A hint that says "region 17" is unreadable unless the numbers are
on; one that says "the region below the red one" is a claim that has to be
true. This is the `read-the-widened-deixis-report` question arriving in a game
where the answer cannot be borrowed.

## What this change must settle

- **Splitting the inline ladder into named rungs** — the A2 cost, and the
  precondition for any recording projection. Whether it then goes on
  `runDeductionFixpoint` is an outcome, not a premise.
- **How a region is pointed at**, in the text *and* on the board. Sentence and
  mark are one decision: if the board can outline the region unambiguously the
  sentence can lean on it, and if it cannot the sentence carries the whole
  burden.
- **Whether the shared candidate machinery reaches a graph.** `candidateHint`
  and `runCandidatePlan` took six games' rung loops; whether their frontier and
  ordering assume a grid is a question to *ask of the code*, not to assume in
  either direction.
- **What Hard narrates.** A forcing chain is walkable, so it should be a
  numbered chain — but its BFS is written for a verdict, not for a witness, and
  extracting the chain that fired is the real work.

## What replaces the oracle

Nothing here touches the generator, solver verdicts or the codec, so the
differential stands as it is. The hint's own assurance is the standing
cross-game set a game joins by *having* a `hint()` — `hint-resume.test.ts`'s
recompute walk, the narration ledger, the enrollment guards — plus a per-rung
firing census. **A census that finds zero owes a power argument**: Rome's
`naked-pairs` was called dead on 2,896 calls across 36 boards and fires on
about one board in sixty. Pin each rung's firing board as the **desc it
consumes**, never as a seed.
