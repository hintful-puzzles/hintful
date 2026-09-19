# apply-markable-facts-rule — audit

Every game `engine/testing/hint-games.ts` enrolled on 2026-09-19 (34), read against
`AGENTS.md` § "Hint quality bar" rule 6: **a hint relies only on marks the player can
make.**

## How it was read

Each game's `hint-text.ts` (Untangle's `hint.ts`, which speaks no words) and the
shared arms in `engine/hint-text.ts` were read sentence by sentence, asking what each
premise *is*, not which words it uses. A premise passes when it is one of:

- something drawn on the board: a clue, a placed value, a line, a mark;
- a note or mark the game's own input can make, which the plan places as a step
  before any sentence cites it;
- a fact re-derived from the current board by the step that cites it, such as a
  line's fit in Pattern, or Boats' hidden number, recomputed every time from a
  fully decided line or the last hidden number on an axis (`recoverHiddenNumbers`);
- a hypothesis the step states and refutes on screen. The owner ruled on this in
  `walk-tactic-hint-chains`: holding a hypothesis in mind is fine.

It fails when the step cites a fact that an **earlier** deduction found and nothing
on the board records.

Where the source left a verdict open, the suspect arm's frequency was measured with
throwaway vitest walks that were not committed: every leaf preset, five seeds,
opening plans only. The regexes' known positives were the Slant, Crossing and Group
hits themselves. Subsets was measured separately (see below).

## Verdicts

| Game | Verdict | The fact at issue |
|---|---|---|
| Boats | conforms | |
| Bricks | conforms | |
| Bridges | conforms | |
| Clusters | conforms | a hypothesis, shown numbered and refuted on screen |
| **Crossing** | **does not conform** | the deep tier's rule-outs |
| Dominosa | conforms | every rule-out is placed as a barrier step first |
| Fifteen | conforms | movement game: a step cites the board and the goal tile |
| Filling | conforms | |
| Flood | conforms | objective game |
| Galaxies | conforms | the arrows the plan places are the notation |
| **Group** | **does not conform** | `forcedSingle`: strikes the plan never placed |
| Inertia | conforms | movement game |
| Keen | conforms as measured | speaks the same shared `forcedSingle` arm as Group; 0 hits |
| Light Up | conforms | every rule-out is a no-bulb mark step first |
| Loopy | conforms | `add-loopy-notation` |
| Netslide | conforms | movement game |
| Palisade | conforms | a region is cells joined across no-wall marks, which the player makes |
| Pattern | conforms | |
| Range | conforms | |
| Salad | conforms as measured | `forcedCross` / `forcedCircle` have Group's shape; 0 hits |
| Seismic | conforms | notes, vouched for by the mistake check |
| Singles | conforms | |
| Sixteen | conforms | movement game |
| **Slant** | **does not conform** | the equivalence step: a slant lock |
| Solo | conforms as measured | shared `forcedSingle` arm; 0 hits |
| Spokes | conforms | rule-out marks are moves |
| Sticks | conforms | |
| **Subsets** | **does not conform** | cube eliminations: set-values ruled out of undecided cells |
| Towers | conforms as measured | shared `forcedSingle` arm; 0 hits |
| Tracks | conforms | blocked sides and empty squares are the player's own marks |
| Undead | conforms | notes |
| Unequal | conforms as measured | shared `forcedSingle` arm; 0 hits |
| Unruly | conforms | |
| Untangle | conforms | speaks no words |

### Slant — the equivalence step (task 1.2)

*"This square is locked to the same slant as the ringed one by the clues around
them"* cites a class in the solver's equivalence union-find, merged by a pairing or
v-shape argument several fixpoint passes earlier. Slant has no mark for "these two
squares slant alike".

**It is Slant's only nonconforming arm.** The clue arms cite a clue and the diagonals
touching it, the loop arm a chain of drawn diagonals, and the dead-end arm points
whose remaining ways out are read off the drawn diagonals. All of those are on the
board.

Measured, the equivalence step fired on 5 of 5 boards at 12x10 Normal (20 of 600
steps), 4 of 5 at 8x8 Normal, 4 of 5 at 12x10 Easy and 0 at 5x5 Easy. It is not a
rarity to be tolerated. **No notation exists, so the fix is a new one.**

### Subsets — the cube

The recorder keeps `cube[cell][set-value]` across the whole plan. Three rules
(`recCubeSingleCount`, `recDisjoint`, `recApplyArrowsAdvanced`) eliminate set-values
with no move attached, as the guide describes (`docs/games/hints.md` § "Narrate by
what survives (Subsets)"). A `collapse` then says *"Only the highlighted sets can
still go in this cell"*, and a `singlePosition` says a set has one cell left. The
player marks letters present or absent. Nothing marks a set-value out of a cell, and
the reference aid is shallow by design: `candidateSets` and `candidateCells` look
only at a cell's marks and its **decided** neighbors.

Measured over 40 boards per tier (4x4, n=4): a collapse was counted as resting on
the cube when the letters it decides do not follow from `candidateSets`, even with
the one board-readable rule the aid does not draw (no horseshoe between neighbors
rules out the empty and full sets) added back in.

| Tier | collapse | … not from the board | singlePosition, all not from the board | boards affected |
|---|---|---|---|---|
| Easy | 291 | 76 (26%) | 4 | 32 / 40 |
| Tricky | 410 | 136 (33%) | 38 | 40 / 40 |

The eliminations behind these are chains. The advanced-arrow rule rules a set out of
a cell because no candidate left in an **undecided** neighbor fits under it, and that
neighbor's candidates were themselves narrowed earlier. **No notation exists, so the
fix is a new one.**

### Crossing — the deep tier

A `deep` firing (*"Once the crossing numbers rule the others out, …"*) rests on the
narrowing fixpoint, where a number dies because *"some crossing run ruled a digit out
of one of its squares"* (`crossing/hint-solver.ts` header). Those digit rule-outs are
exactly what Crossing's pencil notes can record, and the plan never places them.
Measured: 4 steps on 3 of 40 boards (9x9, 13x13 symmetric and 15x15 symmetric). **The
notation exists, so the fix is in the plan**: place the notes before the firing that
cites them.

### Group, and the shared `forcedSingle` arm

`singlePlacementReason` (`engine/latin-hint.ts`) classifies a placement as
`forcedSingle` when it is neither a naked nor a hidden single in the notes. Its own
comment calls that *"deeper combined deductions the notes don't yet reflect"*: that
is, facts the solver holds and the board does not. The sentence (*"Working through
this cell's row and column together, only … can still go here"*) asserts them
without placing them.

Measured, it fired only at Group 8x8 Tricky with the identity hidden: 11 of 481 steps,
on 3 of 5 boards. Those are exactly the three boards whose plan found the identity
(*"… shows g is the identity"*). The two boards where the identity was never found
had no hits, which points at the identity path as where strikes go unplaced. Keen,
Unequal, Towers and Solo speak the same arm, and Salad's `forcedCross` /
`forcedCircle` has the same shape (a marker the cube forces that no recorded strike
explains). All five had 0 hits here, but nothing stops them firing. **The notation
exists (notes), so the fix is in the plan, and it belongs in the shared layer**: a
placement is never narrated past strikes the player has not been shown.

## Follow-ups

One change each, scaffolded under `openspec/changes/`:

- `add-slant-notation`: give players a mark for two squares that slant alike, and
  place it as a step.
- `add-subsets-notation`: give players a way to rule a set-value out of a cell, and
  place the cube's eliminations as steps.
- `note-crossing-deep-eliminations`: place the digit notes the deep tier rests on.
- `strike-before-forced-singles`: find Group's unplaced strikes, and make the shared
  `forcedSingle` / `forcedCross` / `forcedCircle` arms unreachable by placing every
  strike a placement rests on.
