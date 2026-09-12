## MODIFIED Requirements

### Requirement: Palisade offers a deduction-based hint

The `palisade` game SHALL implement `Game.hint()` and `Game.hintKeepTrack()`,
surfacing its deductive solver as a narrated, highlighted hint plan.

`hint(state)` SHALL seed the solver from the player's current state — the
player's walls copied into the solver's borders, and every player no-wall mark
(`DISABLED` bit) pre-merged into the solver's DSF — then run the six deductions
to a fixpoint, recording in discovery order every edge the deductions force: a
**wall** for each newly-set `disconnect`, and a **no-wall** for each
individually-forced `connect` (a clue whose walls are all placed, two edges to
one region the clue cannot afford as walls, or an under-sized region whose
single growth target is reached by exactly one undecided edge). Each recorded
edge SHALL carry the **firing** (the single logical deduction) that produced it.

The plan SHALL be built so that **all edges forced by one firing form one
journey** (per the engine's hint-authoring convention): the `equivalentEdges`
pair, and each `numberExhausted` sweep that resolves several of a clue's sides,
become a contiguous run of `HintStep`s — the first leg unflagged with the full
explanation, the remaining legs flagged `continuesPrevious` with abbreviated
narration. Single-edge firings remain single steps. Distinct firings remain
separate hints. The full chain SHALL be returned as the plan, so a single
request shows the next deduction (all its legs) and auto-hint can play the whole
chain.

Each leg's move SHALL be the two-sided `edges` edit that sets its edge to the
forced state. Each leg's explanation SHALL name the rule that fired, phrased as
advice that has **not** yet been applied ("must be a wall" / "can't be a wall",
never "is a wall" / "has none"). For a multi-edge firing the first leg SHALL
state why the moves are forced *together* — for `equivalentEdges`, that the two
highlighted edges border the same region and therefore **share a fate** (both
walls or both open), which together with the clue's count forces the result;
for `numberExhausted`, that the clue's count leaves its remaining edges with a
single possible state — and SHALL phrase the conclusion across the set ("clear
this one, then the rest" / "both"). Each leg's highlights SHALL identify every
element it references: the action edge, the firing's other not-yet-acted edges
as sibling edges, and the referenced cells (a clue pair, the clue cell, or the
region the deduction reasons about).

`hint()` SHALL refuse — returning `{ ok: false }` with a readable reason —
when the board is already solved, or when `findMistakes(state)` reports any
mistake, so a hint is never derived from a wrong wall or mark. When the clue set
is not uniquely solvable (so no deduction is found) it SHALL likewise return an
error rather than a plan.

`hintKeepTrack(move, step, state)` SHALL return `"completed"` when the player's
`edges` move toggles the step's hinted edge into its forced state (side- and
button-checked: a wrong-button click on the same edge does not complete the
step), and `"off"` otherwise.

The renderer SHALL paint **every** edge the current step's firing forces — the
action edge and the firing's other forced edges alike — in `COL_HINT`: they
share a fate (all walls or all open), so they share a color, signaling the
player to treat them as one set. It SHALL outline every referenced cell in
`COL_HINT_CELL`, inset inside the cell body because the cell's border is where
walls and the hint's forced edges are drawn, folding the highlight into the
per-tile cache so it
appears when shown and clears when the midend drops the plan. For the
`equivalentEdges` deduction the outlined cells SHALL be the region the edges
border, **not** the clue cell that decides the edges. Seeding the hint from the
player's state SHALL NOT mutate that state, and running the solver without a
recorder SHALL behave exactly as before (the `solve`, `findMistakes`, and
generator paths are unchanged).

#### Scenario: Next deduction is surfaced and solves the board

- **WHEN** `hint()` is called on a fresh, uniquely-solvable Palisade board
- **THEN** it returns a non-empty plan whose steps are forced edges in
  discovery order
- **AND** applying every step's move in order brings the board to a solved state

#### Scenario: A coupled deduction is one multi-leg journey

- **WHEN** the next deduction is an `equivalentEdges` firing (two edges of a
  clue that border the same region)
- **THEN** the plan contains both edges as a contiguous run: the first leg
  unflagged, the second leg flagged `continuesPrevious`
- **AND** the first leg's explanation states that the two edges share a fate
  (both walls or both open) and names the clue that decides them
- **AND** the first leg's highlights include the other edge as a sibling and the
  shared region as referenced cells

#### Scenario: A player no-wall mark is not re-hinted

- **WHEN** the player has marked an edge "no wall" that the solver would also
  deduce as no-wall
- **THEN** that edge does not appear as a step in the returned plan (its fact is
  already seeded into the solver's DSF)

#### Scenario: Hint refuses on a mistaken or solved board

- **WHEN** `hint()` is called on a board carrying a wall the unique solution
  lacks, or on an already-solved board
- **THEN** it returns `{ ok: false }` with a human-readable error and no plan

#### Scenario: Following the hinted edit advances the plan

- **WHEN** a hint step is displayed and the player makes the exact hinted edge
  edit
- **THEN** `hintKeepTrack` returns `"completed"`
- **AND** a wrong-button click on the same edge, or an edit on a different edge,
  returns `"off"`

#### Scenario: The hint highlights a firing's edges as one set

- **WHEN** `redraw` is given a displayed multi-edge firing step (an action edge,
  the firing's other forced edge, and referenced cells)
- **THEN** both forced edges are painted in `COL_HINT` (the same color, since
  they share a fate)
- **AND** every referenced cell is outlined in `COL_HINT_CELL`
- **AND** with no hint step the tiles draw without any of those hint colors

### Requirement: Palisade hint color legend

When a Palisade hint is displayed, `redraw` SHALL distinguish the element types
the deduction names using a stable color legend, each color paired with a
non-color cue:

- The **forced edge(s)** (the move) SHALL be drawn `COL_HINT` as wall segments on
  the relevant cell borders. A firing that forces several equivalent edges draws
  them all in the same `COL_HINT` (equivalent moves share one color — the legend
  governs element *types*, not distinct cells of one type).
- A cited **region** the deduction reasons over SHALL be outlined in
  `COL_HINT_CELL`, each of its cells outlined inside the cell body.
- A cited **clue** is identified by its **drawn digit** on the (outlined) cell — it
  is not given a separate fill color, the same way a number premise is treated
  elsewhere; the digit is the non-color cue.

No Palisade hint cites a *decided cell* that would otherwise collide with the
move color, so no premise ring color is needed. The legend SHALL be consistent
across the deduction rules.

#### Scenario: Forced edges and cited region are distinct

- **WHEN** a `notTooBig`/`notTooSmall`/`equivalentEdges` hint names a region and
  the edge(s) it forces
- **THEN** the forced edge(s) draw `COL_HINT` and the cited region is
  outlined in `COL_HINT_CELL`, in different colors

#### Scenario: Equivalent forced edges share one color

- **WHEN** one firing forces several edges that share a fate (e.g. all remaining
  edges of an exhausted clue)
- **THEN** every forced edge draws the same `COL_HINT`, not distinct colors
