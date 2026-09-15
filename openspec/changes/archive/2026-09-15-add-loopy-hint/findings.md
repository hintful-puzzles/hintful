# add-loopy-hint — the measurement

Taken 2026-09-15. Line counts are raw `git diff --numstat` and `wc -l` on
production files, as the last three changes' `findings.md` §1 were taken. Loopy's
baseline before the change: `cursor` 169, `dlines` 86, `generator` 184,
`grid-build` 82, `index` 489, `params` 237, `render` 319, `solver` 1,110, `state`
419 = **3,095 production lines**.

## 1. The number

| row | Loopy | Seismic | Bridges | Tracks |
| --- | --- | --- | --- | --- |
| narration and step building (`hint-text.ts`, `hint.ts` from `fromDot` down) | **+522** | +137 | +405 | +345 |
| **the deduction projection** (`record.ts`, `solver.ts`, `hint.ts` down to `deduceLoopyPlan`) | **+805 / −29** | +335 | +377 / −9 | +536 / −19 |
| the overlay (`render.ts`) | **+316 / −6** | +84 / −17 | +331 / −51 | +220 / −19 |
| wiring (`index.ts`, `state.ts`) | **+37 / −2** | +27 / −7 | +44 / −8 | +31 / −1 |
| **game total** | **+1,680 / −37** | +583 / −24 | +1,157 / −68 | +1,132 / −39 |
| **engine** (production) | **0** | +87 / −31 | 0 | 0 |

Engine *tests* moved by 29 lines: the resume guard's state key (§5), one
`LONG_NARRATIONS` entry and the mark guard's renderer count.

**The most expensive hint of the four, and the rows say where.** Seismic halved the
cost by reading its premises off notes the player can see. Loopy is the opposite
case: from Normal up, every premise it reasons from is something the board cannot
show, so the projection has to carry what Tracks' did (a reason per premise,
captured in-rung, and a per-premise return gated on the recorder) and **a
provenance graph on top of it**: each corner bit and each relation records the
facts it came from, so a step can draw the chain it rests on. That graph is most of
`record.ts` and a good share of the +427 in `solver.ts`. The overlay row is the
other half of the same fact: a clue outline, a dot ring, an edge band, a wedge and a
connector, each drawn from grid geometry with no tile to hang it on.

## 2. The Check/Tactic/Search reading

**Easy and Normal are Checks with visible premises.** Below Tricky every dline bit
comes from the dot itself: "a line already arrives here from outside this face"
(at most one) or "this dot has one line and only these two edges open" (at least
one). Both can be re-derived from the drawn lines at any moment, so a Normal step
is one sentence: *"This 3's other edges can give it only 2, as the marked corner's
dot already has a line, so this edge must be a line."*

**Tricky and Hard are Tactics of a kind the collection had not met.** Nothing is
assumed. The rungs derive corners from clue counts and from the corner across a
dot, and pairs from the parity of a face or dot with two edges open; every one of
those is a glanceable local rule. What makes it a chain is that a line can rest on
several. Measured over 48 generated boards (squares at every tier, triangular,
Cairo, Penrose and hats at Hard; persistent recorder, one plan per board):

- 83–96% of all steps are Easy, and every Normal step rests on exactly one corner
  fact its dot shows.
- About 71% of Tricky and Hard steps rest on two facts or fewer.
- On Hard, the facts behind a step reach p99 about 20 and at most 28; a step
  resting on more than eight comes once or twice a board.

The owner chose (2026-09-15, asked with the frequencies) to draw every such fact
and number it, rather than cite the chain's origin or cap chains at generation.
So a step a sentence can carry names its corner in words, and every other step
numbers its corners and pairs 1 to n and names the ones it concludes from.

## 3. What the proposal's questions came to

- **`findMistakes`: added.** It compares every marked line and ruled-out edge with
  the unique solution, which is what lets the plan take the player's marks as
  facts: Seismic's soundness shape, on lines. Check & save now highlights Loopy,
  which it did not before, and `lineErrors`' rule highlighting stays beside it.
  `capability-surface.test.ts`'s snapshot was re-baselined for exactly this: Loopy
  gains `findMistakes`, `hint`, `hintKeepTrack` and `refreshHintStep`, and no other
  game's surface moved.
- **Rung versus premise.** Four rungs hold 14 narrated premises. Every premise
  returns at its first line change on the recording path, and `nextFiring` starts
  again from the cheapest rung. Two premises fire on no board in the corpus and are
  ledgered in `loopy-hint.test.ts`, with their sentences read by direct tests: the
  edge dsf's propagation, which parity on three open edges always gets to first,
  and a loop-closing edge that meets every clue, which the clue and dot rules
  always draw before the loop rung looks.
- **A board need not carry its tier.** A shared game ID omits the difficulty, so
  the hint tries Easy's rungs to exhaustion, then Normal's, and so on. That is
  also the easiest-first order a hint wants.
- **Cost on the largest boards.** Measured at load average 5–6 with swap nearly
  full (12.1 of 13.3 GB), so an upper bound: one hint recompute averaged 2.8 ms
  over 8,424 recomputes on 48 boards, and the slow tier's resume walk over all 23
  presets, one recompute per move, took 17 s of wall clock including vitest
  startup. No plan cap is needed.

## 4. The refactoring survey: taken and declined

| candidate | outcome | why |
| --- | --- | --- |
| shortest chain among a tier's firings (Clusters' remedy) | **built, measured, removed** | A long-chained firing's lines were set aside, its edges frozen and the tier asked again, keeping the firing resting on the fewest facts. On generated Hard boards every tiling's p99 and count of steps over eight facts were unchanged, and steps over four fell only 25→25, 15→12, 11→11, 4→3, 3→3. A rung already returns the shallowest line it can set. The measurement is in `nextFiring`'s doc comment. |
| a fresh solver per step instead of one recorder across the plan | declined | Re-deriving facts against the board as it stands left chain sizes within one of the persistent recorder's on every tiling, at two to three times the cost. |
| a recorder shared with Lightup, the other bespoke loop | declined | Lightup records forced cells with a reason; Loopy's projection is dominated by the provenance of facts no other game has. The common part is the gated early return, which is two lines. |
| marks on `engine/grid/` geometry as an engine helper | declined | `npm run refs` finds Loopy the only game drawing on `engine/grid/` beside the grid tests, and a population of one is not a shared shape. |
| `drawHintOrdinal` for chain numbers | not applicable | It places a number in a tile's corner. Loopy has no tiles, so a number goes inside its wedge. |
| clue-count narration shared with Palisade and Slant | declined | Palisade counts walls around a cell, Loopy counts lines around a face that corners count as one; the premise differs in the word that does the work. |
| loop-closure narration shared with Tracks | declined | Tracks forbids every loop; Loopy forbids one that leaves lines out or clues unmet, and the sentence has to say which. |
| a whole-frame renderer's hint plumbing | nothing to build | Written into `rendering.md`: the marks are drawn from the displayed step every frame, and what such a game owes is the z-order. |

## 5. Defects found while it was written

- **`hint-resume.test.ts` could not fingerprint Loopy's state.** Its state key
  JSON-serialized the whole state, and Loopy's shares a cyclic grid. An object met
  again is now written as a reference to its first position, so every field is
  still read once and a change to shared structure still changes the key.
- **The keyboard help called a dot a corner.** The hint needs "corner" for two edges
  at a dot around one face, the usual Slitherlink sense, and a help page
  disagreeing with its hint is worse than either, so the keyboard section now says
  dot.
- **A hairline wedge vanished.** In the app at triangular tile sizes, the outlined
  "at most one" wedge sat inside the dot ring and disappeared among the edge bands
  and the clue outline. It is now a band of the angle starting outside the ring,
  stroked at the line width.

## 6. Guards proven to fire

Four defects were planted at once and each turned its guard red: a flipped corner
step (the solution check, at step 0), chain numbers starting from 0 (the numbering
and the count guards), a dead-end step without its dot ring (the deixis guard), and
a mistake cross skipped with faint lines off (the mistake render test).

## 7. In the app (Chrome)

`7x7t0dt#accept-3` (squares, Tricky): the corner Check and a two-fact numbered
chain, the classic diagonal pair of 3s. `10x10t16dh#accept-hats` (hats, Hard): a
corner step on a reflex hat corner. On both, every mark matched its sentence and
read at a glance.

`12x10t1dh#accept-tri2` (triangular, Hard), move 78: the marks matched the
sentence, but at the app's default size the triangles are about 53 pixels on a
side and the outlined wedge, beside the ring and the clue outline, is small; it is
plainly legible only once the canvas is enlarged. This is the frame to look at
first in acceptance.
