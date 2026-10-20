# Hint marks

How a hint step is shown on the board: the ring, the outline and the stripes,
the colors they take, what counts as evidence, how a chain is numbered, and
the notation a game gives its player so that a step rests only on marks the
player can make. It also holds two things that are not about drawing: how a
firing is grouped into a step or a journey of legs (§ "Group one firing into
one step" and the sections after it), and which facts a hint may rest on
(§ "Give the facts a notation"). The words of a step are
[`hints.md`](./hints.md)'s. The
normative rules are in
[`engine-hints`](../openspec/specs/engine-hints/spec.md), and a game's own
marks are in its spec.

## What every game does

Each step names the file of [`src/skeleton/grid/`](../src/skeleton/grid) that
already does it.

1. Write every sentence in `hint-text.ts` with `phrase` and a `mark`
   reference wherever it points at the board: a ring on what the step
   decides, an outline on what it reasons from, stripes on the line or region
   it names (`hints.md` § "Bind the words to the marks").
2. Declare the roles the steps name as `hintMarks.roles` in `index.ts`, and
   put `{{hint-marks}}` in the `## Hints` section of `help.md`.
3. In `render.ts`, export a `COL_HINT` slot holding `HINT_RING` and a
   `COL_HINT_CELL` slot holding `HINT_OUTLINE`, and draw each mark in its
   role's ink and nothing else (§ "The engine colors the marks").
4. In `redraw`, read the marks with `stepMarks(hint)` and from nowhere else,
   and fold them into the draw state's `OverlaySidecar`, so that `stale` and
   `commit` put them in the tile's diff key.
5. Say where a cell's mark sits with a `markBand` (§ "Where the band goes,
   and who rubs it out").
6. Call `HintMarks.eraseBeforeTiles` before the tile loop and
   `HintMarks.paint` after it, outside any clip.
7. Draw the target as a ring around what the cell already shows, never as
   the move's result (§ "Highlight, never perform").
8. Where a sentence names a line or region, stripe it under the content
   (§ "Hatch the line the sentence names").
9. When keep-track shrinks a step, narrow its words with it, as
   `skeletonKeepTrack` does in `hint.ts` (§ "Group one firing into one
   step").
10. Assert the frame in `<game>-hint.test.ts` as `skeleton-hint.test.ts`
    does, then run the app and read each kind of step against its sentence.

## Sections

| Section | Read it when |
| --- | --- |
| Highlight, never perform | your renderer draws the cell a step acts on |
| Echo the move's shape in the hint color | your game's moves come in more than one visible kind, or decide something that is not a cell |
| Shade vs ring | you choose the mark for a target or for evidence |
| – A mark on something that is not a cell | your game decides edges, spans, regions or faces |
| – A piece is ringed as one shape | a step's target or evidence is a piece of several squares |
| – A square the move brings along takes a lighter mark | one move decides a deduced square and another that follows from it |
| – Why a fill cannot work, whatever color it is | you are about to fill a hinted cell |
| – Where the band goes, and who rubs it out | you write `markBand`, or a mark is left behind or painted over |
| – Outline the evidence | you draw the evidence cells |
| – Guarding the mark's shape | you test a hint frame, or `hint-mark.test.ts` fails |
| Show the evidence as an area | a step reasons over more than one cell |
| – Evidence for a count is what rules the other squares out | a premise says a line or region needs N more and only N can supply one |
| – Whether the target belongs in its own evidence | you filter the acted-on cell out of the evidence |
| – A deictic promises a number of marks | a sentence says "this", "these" or a count |
| – A claim over many elements names the unit the player can check | a sentence says no other number, piece or run can go here |
| – A mode that changes what is visible is narrated in its own unit | a game mode draws something the other modes do not |
| – Off-board evidence | a deduction reasons over a clue list, palette or tray |
| – Honest non-local evidence | a technique's reason is not a local area |
| – Evidence for a connectivity deduction | a technique reasons over what is joined to what |
| Hatch the line the sentence names | a sentence says "this row", "this column" or names a region |
| – Two regions in one sentence take two mark shapes | a sentence names two regions |
| The engine colors the marks | you draw a mark, recolor a clue, or are about to pick a hint color |
| A hint that suppresses a game's aid dismisses on a UI update | a displayed hint hides or takes over something the game draws |
| Number a chain's cells in order | a step shows a chain of forced consequences |
| Show the what-if walk statically | a step's reason is a hypothesis followed to a contradiction |
| Marks on tiles vs marks on cells | your game's pieces move, and the hint marks one |
| Placement animation as hint motion | your game has no move animation and Auto-Hint looks frozen |
| Group one firing into one step | one deduction forces several cells |
| – A journey completes leg by leg | a journey's `hintKeepTrack` never advances |
| – A move must not reach past the squares the step claimed | a move fills an area and not a named set of cells |
| – Read what a firing did from a before/after comparison | a firing's cells come from a rule's return codes or progress flags |
| – Bound a plan by the steps it offers | you cap a plan |
| – A run the player writes in one go is one journey | a step starts a sequence the player would finish at once |
| – A move with side effects ends the plan | a move can change more than the square it names |
| Re-derive the named technique | the solver returns forced cells with no reason |
| Read the reason off the validator | the solver forces a move by contradiction |
| A deduction the player can run with a gesture is its own rung | an existing control already shows the player a forced move |
| Give the facts a notation | a deduction rests on a fact the board does not show |
| – Check a game for facts the player cannot mark | you audit a hint, or add a rung that keeps state |
| – Measure what the recordable facts reach first | you are about to design a notation |
| – Rebuild the reading before every firing when no mark is needed | the measurement says the hidden state is never needed |
| – Design the mark from what the solver derives | the measurement says a mark is needed |
| – Place a note beside the step that cites it | the plan places notes |
| – Place the notes a fixpoint rests on | the notation exists and the plan concludes past it |
| – Rule-outs as board marks | the game's own moves include a "cannot be" annotation |
| – A right mark is not yet a premise | the player can mark something the board alone does not prove |
| – A solver's silent bookkeeping is the player's work | the solver's data structure carries a fact from one element to another |
| – Notation and goal are different move sets | the win condition does not read the marks the deduction is about |

## Highlight, never perform

**A displayed hint marks the cell to act on and does not draw the move's
result.** Ring the target in `COL_HINT`, keep the cell's own number or state
visible inside the ring, and let the narration say which mark to place. Do
not fill the cell with the black square, circle, color or digit the move
would place: it hides what the cell holds, and it reads as already done when
the move is still the player's to make.

The move is made for real only when the hint is played: `executeHint` sends
the step's gesture through the game's `interpretMove` and applies nothing
itself (requirement "executeHint sends the gesture and never applies the
move"), and the cell then draws as the actual mark with its placement
animation. The Hint
button's show-then-apply alternation is the midend's and needs nothing from a
game's `hint()` (requirement "The toolbar Hint button alternates show and
apply"). It does mean a player meets the plan one step at a time, so the
grouping of § "Group one firing into one step" is what makes it read well.

## Echo the move's shape in the hint color

**Where a game's moves come in more than one visible kind, the hint draws the
shape the game already draws for that action, recolored `COL_HINT`.** It
never invents a shape the player has to translate, and never shows the shape
of the wrong action: a line drawn for a rule-out says "connect these", the
opposite of its sentence.

This is the converse of § "Highlight, never perform": the hint shows where
and which action, in the hint color, without performing it. A uniform tint
cannot express an orientation or a kind.

Exemplars: the line-bit and mark-bit branches of
[`spokes/render.ts`](../src/games/spokes/render.ts), where a forced line is
a `COL_HINT` line and a forced rule-out a `COL_HINT` ring round the dot at
the spoke's rim; Sticks draws its forced square as a bar in the forced
orientation.

## Shade vs ring

**The acted-on cell is ringed in every game, with no exceptions, and an
evidence area is outlined.** Both marks sit on the cell's border and never
behind its content.

The engine gives [`engine/hint-mark.ts`](../src/engine/hint-mark.ts):
`MarkBand` says where a cell's band sits, `HintMarks` paints the ring and the
outline around the tile loop, `MarkOutlines` gives each cell's sides.
Requirements "A hint mark is drawn on the cell's border" and "A hint marks
beside the content, never behind it" are the rule. Exemplars:
[`keen/render.ts`](../src/games/keen/render.ts) (`markBand` and the block
after the tiles) for a game with a gutter between cells,
[`filling/render.ts`](../src/games/filling/render.ts) for one whose cells
tile exactly, [`galaxies/render.ts`](../src/games/galaxies/render.ts) for a
mark inset in the cell.

The target is ringed even where a fill would hide nothing: one mark means one
thing across the collection, and in a shading game the move is "give this
cell a color", so a solid fill says with the board what the narration is
still proposing. A candidate game rings the cell on a strike step too, so the
player does not hunt for the strikethrough.

### A mark on something that is not a cell

**`hint-mark.ts` draws a band on a cell's border box, so use it for a cell
and only for a cell.** Where the decided element is something else, ask what
shape the game already draws for the action and recolor that (§ "Echo the
move's shape in the hint color"). That is a first-class answer and not a gap.

| The element | The mark | Exemplar |
| --- | --- | --- |
| A side between two squares | the game's own stub or cross, while its squares take the band | `tracks/render.ts` |
| A span between two elements | the thing it would become, with only the added part in the action color | `bridges/render.ts` |
| An element wider than its tile | its own rim and glyph recolored, since a band on the tile would cut across it | `drawIsland` in `bridges/render.ts` |
| An edge, face or dot of a tiling | a band under the edge, an outline inset in the face, a ring under the dot, from `engine/grid/` geometry | `loopy/render.ts` |
| A region that is not a set of whole cells | the band the game draws inside the region's boundary for its selection, in the hint colors | `map/render.ts`, and `hints-candidates.md` § "A graph, not a grid (Map)" |

A game whose every decided element is a cell uses the band whole
([`seismic/render.ts`](../src/games/seismic/render.ts)). Edge games on the
border grid take their marks from `hintTileBits` in
[`engine/border-grid-render.ts`](../src/engine/border-grid-render.ts).

### A piece is ringed as one shape

**A target spanning several squares is one ring around the piece, not a box a
square with a double bar across its middle** (requirement "A piece a hint
acts on is ringed as one shape"). The game says only which squares belong
together: `HintMarkStyle.joinTargets(a, b)` for the target, and
`joinEvidence` where evidence is whole pieces, so that two pieces side by
side do not merge into a shape that is not on the board. Omitted, targets
never join and evidence always does.

The relation may come from the hint and not the board: a piece not yet placed
joins the two squares of a placement and leaves the two sides of a barrier
apart ([`dominosa/render.ts`](../src/games/dominosa/render.ts)). A game that
keys its own tile word and passes a join relation takes the sides from
`MarkOutlines.packed`, because a target whose partner leaves keeps its role
while its sides change (requirement "A joined mark inside the content box
keys its repaint on its sides"). `expectPieceRing` in
[`engine/testing/mark-shape.ts`](../src/engine/testing/mark-shape.ts) holds
the six sides of a two-square piece. Population:
`git grep -l joinTargets src/games`.

### A square the move brings along takes a lighter mark

**When one move decides a square by deduction and another by a symmetry or
rule the player already knows, mark the deduced one more heavily and still
mark the other.** Marking both alike makes "this cell" ambiguous, and
dropping the second mark breaks another rule: a step may not change a square
it never marked.

- Leave the lighter mark's surroundings alone. Filter only the acted-on cell
  out of its own evidence; taking the partner out too puts its outline on
  bare board, where it reads louder, and makes a described area false.
- A one-pixel stroke is not a highlight. Weight comes from a filled halo with
  the element repainted on top, which also keeps the element's own color for
  the sentence to name.
- Do not ring what the step has just filled in the action color: name that
  element by position in the sentence, and skip its ring in the renderer, the
  two changing together.

Exemplar: [`galaxies/hint-marks.ts`](../src/games/galaxies/hint-marks.ts),
where the deduced cell is ringed twice and its 180° partner once.

### Why a fill cannot work, whatever color it is

**Do not fill a hinted cell, and do not try to fix a fill by recoloring.** A
fill pale enough for content to read through it is invisible on the dark
board, and the only hues that clear the bar sit beside `ERROR_WASH`, which
would make the cell a hint points at look like the cell that is wrong. The
measurements are in the header of
[`engine/hint-mark.ts`](../src/engine/hint-mark.ts). The palette carries no
fill role for the action color (requirement "The palette carries no fill for
the acted-on color"), so the question is not reopened by retuning.

A mark on the border is read against a surface and not through it, so it can
take a strong color, as the engine's are.

### Where the band goes, and who rubs it out

**Give the band the width of the border it replaces, and place it by what the
cell's border means in your game.** It reads as a highlight by color, not by
weight. `MarkBand` is the cell's content box plus how far the band reaches
outside it (`outer`) and inside it (`inner`), and that choice decides who
undoes the mark.

- **Outside (`outer > 0`)**, where there is a gutter between cells. Call
  `HintMarks.eraseBeforeTiles(…, gutterColor, overlaps)` before the tile loop
  and dirty the tiles `overlaps` names; `paint` after the loop restamps every
  mark every frame, because a neighbor repainting for its own reasons can
  paint over a side. Erase before the tiles, because no color painted after
  them is right everywhere a band reaches. The erase runs when the marks'
  shape changes, so the game keys nothing on it. Exemplar:
  [`keen/render.ts`](../src/games/keen/render.ts).
- **Inside (`outer = 0`)**, where cells tile exactly and draw their own
  outline, or where the gap between cells is what walls are made of. Nothing
  needs erasing: the cell whose overlay changed repaints and takes its mark
  with it, so the mark may be drawn from `drawTile`. A cell whose outline
  changed while it stayed evidence counts as changed; `OverlaySidecar.pack`
  puts the outline sides in its diff key, with nothing to wire. Exemplar:
  [`filling/render.ts`](../src/games/filling/render.ts). A game with no
  notes passes `pack` no `markBits`, and its ringed notes are not asked for
  ([`starbattle/render.ts`](../src/games/starbattle/render.ts)).
- **Both**, a pixel of real gutter plus some of the cell's own edge. The
  `outer` part makes it an outside-band game, and the erase covers the inside
  part too. Exemplar: [`clusters/render.ts`](../src/games/clusters/render.ts).
- **Inset**, inside the cell body, where the cell border is where a wall
  lives and a mark there would read as one. Exemplar:
  [`galaxies/render.ts`](../src/games/galaxies/render.ts).

Bound the inner reach by the content, by arithmetic on the glyph's geometry
and not by eye, and record the bound at the game's `markBand`. Requirement "A
mark outside the content box is driven by the drawstate".

### Outline the evidence

**Outline the evidence, never wash it**: its cells carry what the player has
to read, and even an empty cell's surface is part of its premise (Light Up's
unlit square is told by not being yellow). `outlineSides` paints a side
wherever the neighbor across it is not also evidence, so a contiguous region
comes out as one contour and a scattered set as one ring a cell.

- **One shape for one role.** Do not outline one kind of evidence cell and
  mark another some other way.
- **Never drop the evidence mark.** Where a sentence says "this cage" and the
  target sits in a different one, the mark is the only thing saying which.
- **The chain ordinal takes the outline's ink**, being an index into the
  evidence and not a role of its own.
- **A line or region the sentence names is not evidence**: it is striped
  (§ "Hatch the line the sentence names").

### Guarding the mark's shape

**Test the shape of a mark, not its color.** "Some rect is `COL_HINT`" is
what a fill also satisfies.

- [`hint-mark.test.ts`](../src/engine/hint-mark.test.ts) walks every hinting
  game and fails on a rect in a hint color that is cell-sized and thick in
  both directions. It finds a game's hint colors by reading the `COL_HINT`
  and `COL_HINT_CELL` exports of its `render.ts`, so export those names for
  the ring's and the outline's slots and for nothing else
  ([`method.md`](./method.md) § "A scan that keys on a name").
- In the game's own test,
  [`mark-shape.ts`](../src/engine/testing/mark-shape.ts) gives `expectRing`
  (four thin rects, none solid), `expectContour` (`2w + 2` sides for a
  `w`-cell row, where a ring a cell would give `4w`) and `expectPieceRing`.
- The hatch draws no rect, so this guard does not see it; its own guards are
  in § "Hatch the line the sentence names".

## Show the evidence as an area

**Mark the whole area a deduction reasons over, not one premise cell, and
make the words and the picture agree**: if the narration says "the striped
run", a run is striped. The target stays the one ring.

- **Compute each step's area against the board as that step fires**, not the
  board the hint was asked on. The plan is computed once and a frozen area
  goes stale. Thread the solver's working grid through each recorded move and
  build the marks from that snapshot; the snapshot has the move applied, so
  see § "Whether the target belongs in its own evidence". Exemplar:
  `markedOf` in [`range/index.ts`](../src/games/range/index.ts).
- **Assert in the game's test that each deduction's evidence is non-empty.**
  The cross-game walk in `hint-quality.test.ts` asks only that a step shows
  something, marks or words. A filter is the usual cause of an empty area: a
  connectivity rule that treats every non-black cell as white must mark the
  non-black neighbors, not only the cells marked white.
- **Where a sentence states a number, give the evidence exactly that many
  entries and assert it**: a run's length, the room left, the sides a clue
  has. The player checks it every time they look, and it fails when a later
  edit marks a convenient approximation.

### Evidence for a count is what rules the other squares out

**A premise of the form "this line needs N more and only N can still supply
one" rests on every other square being ruled out, so mark what rules each one
out, and stripe the line itself.** Outlining the line's leftover squares says
nothing about why they are out.

- **A leg can be forced by the leg before it** when the solver places a
  firing's moves in one sweep. Read each leg against the board with the
  earlier legs applied.
- **Ring what the leg's sentence concludes**, not every square the journey
  still has to decide. The legs one sentence can conclude together go first,
  named with their number ("these 2 squares").
- **A count of pieces says why it is not a count of squares.** A piece lying
  along the line has two open squares and gives it one, so the sentence says
  "one per" piece.
- **Name a group of ruled-out squares as pieces only when every one is a
  whole marked piece.**
- **Name a piece in the help page's own words for it**, not the word the code
  inherited.
- **Where a reason varies by row and column, merge the axes** ("its row or
  column") before reaching for the long-narration ledger.

Exemplar: `tellCount` in [`magnets/hint.ts`](../src/games/magnets/hint.ts),
with requirement "A Magnets count premise marks what rules each square out"
in its spec. Its test pins boards as descs for the plural case, which a
seeded sample rarely deals.

### Whether the target belongs in its own evidence

**Decide for each technique whether the acted-on square is part of the area
reasoned over; do not filter it out as a house rule.** A run whose length is
the argument contains the target. A clue's already-counted neighbors do not.
Filtering everywhere empties the step whose counted span is the target
itself, and the non-empty assertion of § "Show the evidence as an area" is
what catches it. Exemplar: the `unreachable` rung in
[`sticks/index.ts`](../src/games/sticks/index.ts).

### A deictic promises a number of marks

**"These cells" promises several marked places and "this square" promises
one of its kind.** A plural over a single mark cannot be followed at all, and
a singular beside two rings of one kind leaves the player to guess.

- Count the distinct places a step marks, not its role fields: two roles
  naming one cell are one mark.
- Where the plural is true and the frame lacks the set, record the premise
  and mark it: the region a count was taken over, the cells a pattern is
  locked into.
- A second ring is acceptable where it is tied by kind: a mark of another
  shape beside the one the sentence names, both halves of "this tile", or a
  partner the same sentence names.
- `scripts/checks/hint-deixis.test.ts` looks only at steps with two marks, so
  it sees neither case. Highlight fields differ by game, so the check lives
  in the game's own hint test, beside the vocabulary that can judge it.

The rule for two marks under one "this cell" is [`hints.md`](./hints.md)
§ "Two marks of one kind: tie them, and never by color".

### A claim over many elements names the unit the player can check

**"No other X can go here" is a claim over a population, so find the unit the
player can check it in, and measure that the unit carries the claim.**

- **Group the rivals by what the board shows.** Name the one group that
  reaches the square and stripe what it can reach.
- **Name the one rival a player would think of, and only when it is the only
  close one.** With two or more, naming one implies it was the only
  contender.
- **When the roll call is too long, keep the clause that carried the
  deduction** and mark what it cites. A picture standing in for a sentence
  that ran long has to say why this value and not its neighbor.
- **Name only what the player can see**: values on the board and the one the
  step places (`hints.md` § "Name elements by what the player can see").
- **Name a run by its placed ends**; its members follow from them.

Exemplar: [`ascent/hint.ts`](../src/games/ascent/hint.ts) and its
`hint-text.ts`, with requirement "Ascent's hint names only numbers the player
can see" in its spec; `ascent-hint.test.ts` holds a named rival to being the
only close one and scans every sentence for a number that is neither on the
board nor placed by the step.

### A mode that changes what is visible is narrated in its own unit

**Where a mode draws something the others do not, the same reasoning is
narrated in the unit that mode's player sees, by techniques offered only in
that mode.** The modes share one model of the premise and differ in what a
sentence groups its rivals by.

When adding techniques to one mode, hold the others to their old plans by
construction, the techniques being absent from their ladder, and check plan
for plan against the previous commit. Proving the ladder unchanged is cheaper
than a census of its output. Exemplar:
[`ascent/hint-edges.ts`](../src/games/ascent/hint-edges.ts) and
[`ascent/premises.ts`](../src/games/ascent/premises.ts).

### Off-board evidence

**A deduction that reasons over a clue list, palette or tray marks that
surface as well as the grid.** The cells are the area; the listed items the
step reasons over get a patch behind their text, and the one a placement
writes takes the target color.

- **Share the layout.** `interpretMove`, `redraw` and the hint read one
  layout function. If the surface is laid out inline in `redraw`, extract it
  first.
- **Fold the hint into that surface's own cache key.** The `OverlaySidecar`
  covers the grid only
  ([`rendering.md`](./rendering.md) § "The tile cache and the diff key"
  applies to each surface).
- **Draw under an existing aid, do not replace it.** Where the list already
  colors its entries, the hint's patch goes beneath that ink.
- **Guard**: the step names at least one listed item, and a hint-colored rect
  lands outside the grid.

Exemplar: `layoutNumbers` and the panel painter in
[`crossing/render.ts`](../src/games/crossing/render.ts), with
`crossing-hint.test.ts`.

### Honest non-local evidence

**Where a technique's reason is global, state every mechanism it rests on and
do not fabricate a tidy area.** Assert the visible-evidence invariant for the
local techniques only, and relax it to explanation plus target for the global
one. Showing the step honestly beats omitting it, which would break the
plan's path to the solution. Exemplar: candidate elimination in
[`filling/index.ts`](../src/games/filling/index.ts), and "every region-based
step shows non-empty evidence, never its own targets" in
`filling-hint.test.ts`.

### Evidence for a connectivity deduction

**Mark the connected component together with the squares touching each point
the step rules out.** A dead-end firing traps a point that may have nothing
placed on it, so the component alone comes back empty and the step shows no
evidence.

- Seed the recording solver by replaying the player's marks through the same
  function that keeps the connectivity structures in step. Copying the grid
  leaves the union-find behind. The recorder and the seed are both optional
  arguments the generator never passes.
- A clue firing groups as `continuesPrevious` legs, each carrying the
  necessity voice, so the voice guard passes on every leg.

Exemplar: `componentSquares` and `incidentSquares` in
[`slant/hint.ts`](../src/games/slant/hint.ts), and `seedFrom` in
[`slant/solver.ts`](../src/games/slant/solver.ts).

## Hatch the line the sentence names

**A step whose sentence names a row or column stripes that line**:
translucent diagonal bands over its squares and on through its clue slots, in
the engine's stripes ink ([`engine/hatch.ts`](../src/engine/hatch.ts)). **A region
the sentence is about is striped the same way**: a cage, a block, a run, an
area. Requirements "A hint hatches the one line its sentence names" and "A
hint hatches the region its sentence is about".

- **At most one line a step**: "this row", "this column", or the one line a
  step about a single piece names as "its column". An outline of a line and
  an outline of the squares a reason rests on are the same mark, so a line is
  never outlined, and an outline then only ever marks particular things.
- **The sentence says "this cage" or "the striped area", never "the outlined
  …"**. What stays outlined is a piece or particular squares.
- **Several lines are striped only as one counted set**: "these 3 columns",
  parallel and playing the same part, the claim being about every square of
  each.
- **A second line is named by where it lies, never as "this"**: "the column
  beside it", with its clue recolored. A step about one piece that names two
  lines stripes neither and recolors both clues as reasons.
- **A recolored clue digit is an outline, not a role of its own**, drawn in
  `HINT_OUTLINE`: a count the sentence reads and a clue cited as a reason are
  both outline references, told apart by their nouns. A clue slot outside the
  grid is a kind of its own (requirement "A recolored clue is an outline
  reference"). Its hatch, where its line is striped, follows the stripes and
  not the clue: hiding the clue's reference must leave the stripes drawn.
- **No line is named by a number the board does not draw.** Say "this row"
  over the stripes, or name a destination by the mark on it;
  `hint-quality.test.ts` rejects "row 3" in any sentence.

To draw it: a game on `OverlaySidecar` names the cells as stripes in its
words and calls `ds.hint.drawHatch(dr, i, rect, ts)` after the
cell's background and before its content
([`rome/render.ts`](../src/games/rome/render.ts)). A game with its own tile
word calls `dr.drawHatch(tileRect, hatchPeriod(ts))` at the same
point and puts the flag in the tile's diff key (`drawTileCol` and `drawNum`
in [`magnets/render.ts`](../src/games/magnets/render.ts)). The bands are laid
on the canvas and not the rect, so tiles striped one at a time join. A clue
slot on the line paints even when its clue was stripped, since stripes can
arrive on it and leave.

`HATCH_OPACITY` is 0.3, and two guards in `puzzle/hatch-contrast.test.ts`
bracket it: a floor near 0.27, stripes visible on every hatching game's board
in both schemes, and a ceiling near 0.35, no symbol losing more than a
quarter of its contrast unless it stays at 4.5:1. The app repaints stripes at
the hatch's own coverage, so the bars hold for every stripes color a
reference can take, and a game's legibility check under the hatch measures
each. It goes in that file, because the app's palettes are built in
`src/puzzle/`, which no game may import. The same file holds the cross-game
guard "a step that names a line or region draws it, and only then". Stripes
work where a flat tint cannot because half the surface keeps its own color
and the content is drawn over the bands.

### Two regions in one sentence take two mark shapes

**Stripe the first region and outline the second, and say so** ("the striped
and outlined regions"). Outlining both reads as one blob, because an outline
draws no boundary between two areas that touch. A lone square is named by
what it holds. Two regions that cross at the target, and are named by their
direction, may both be striped, since the crossing tells them apart
(`crossRuns` in [`crossing/hint-text.ts`](../src/games/crossing/hint-text.ts)).
The border grid's hint layer
([`engine/border-grid-hint.ts`](../src/engine/border-grid-hint.ts), folded in
by `border-grid-render.ts`) carries both marks. Exemplar:
[`separate/hint-text.ts`](../src/games/separate/hint-text.ts).

## The engine colors the marks

**A game draws its marks' shapes, and the engine decides their colors and
edges.** While a hint shows, the app repaints each reference's marks in a
color of its own from `HINT_REFERENCE_COLORS`
([`engine/color/colors.ts`](../src/engine/color/colors.ts)), the color its
words are tinted with, edged in black or white so that it reads on whatever
lies under it (`edgeFor` and `edged` in
[`puzzle/mark-flash.ts`](../src/puzzle/mark-flash.ts)). Copy image lays the
same repaint over the board (`Puzzle.getImage`). The normative rule is
[`app-shell`](../openspec/specs/app-shell/spec.md) requirement "The engine
colors every hint mark".

- **Draw a ring in `HINT_RING` and an outline in `HINT_OUTLINE`**, each in a
  palette slot of its own, and a mark in nothing else. A recolored clue digit
  is an outline. [`hint-ink.test.ts`](../src/engine/hint-ink.test.ts) hides
  each reference of the steps every hinting game opens with, and fails on a
  mark drawn in another role's ink or in a slot only a hint uses.
- **Stripes are the engine's**: `drawHatch` takes no color, and draws in the
  stripes ink `resolvePalette` adds to every palette.
- **A mark that restyles the content keeps the content's color**, as a struck
  candidate stays `COL_PENCIL`; the repaint finds it by what it changes.
- **Pick no hint color, and add no keyline.** The app finds an ink's marks by
  drawing the inks in black and then white, so a mark is found whole on
  content of any color, and it keeps the ink's own coverage: stripes stay as
  translucent as the hatch.
- **Color is never the only carrier**, and a color's name goes neither in a
  sentence nor in the `hintMarks` legend (requirement "A legend color is
  never the only cue"). A reference's color depends on the step, so the words
  tell references apart by their nouns, and the marks by their shapes.

Until a step's marks are measured, through a move's animation, the board
shows the inks. Each is its role's first reference color, so a step with one
reference of each role looks the same before and after.

## A hint that suppresses a game's aid dismisses on a UI update

**When a displayed hint hides or takes over something the game also draws,
implement `Game.uiUpdateClearsHint(step, state, ui)`.** `hintKeepTrack` is
consulted for moves only. In a game where a click is a `UI_UPDATE` (a
selection), nothing else dismisses the hint, and the player who touches the
suppressed surface sees no change at all and no way out.

The midend calls the hook on every `UI_UPDATE` while a plan is stored, with
the `ui` after `interpretMove` has moved the cursor, and drops the plan when
it returns true.

- **`() => true`** dismisses on any UI change. It is enough when the hint
  marks nothing the player has to select in order to follow it.
- **Answer by step** to keep the hint while the player works inside it. A
  step that is followed by touching the suppressed surface stays, by its kind
  ([`subsets/index.ts`](../src/games/subsets/index.ts)); a step followed by
  selecting its squares stays while the selection is on one of them, and its
  marks already say where that is, so nothing new is stored
  ([`crossing/index.ts`](../src/games/crossing/index.ts)).
- **If it answers false anywhere the hint marks, the selection must still
  read there.** A ring leaves the square's background to the selection, so
  the two show together; a hint that took the background would need a
  foreground cue in a color that reads against it. Test both halves: the
  selection draws the same with the hint up as without, and only the hinted
  frame carries the ring (`crossing-hint.test.ts`, "keeps the cursor visible
  on a square the hint has marked").
- Dropping the plan costs nothing when the deduction is deterministic and
  cheap; weigh it when the hint is expensive.

The trigger is suppression, not selection: a selection game whose hint
suppresses nothing does not set the hook. Population:
`git grep -l uiUpdateClearsHint src/games`.

## Number a chain's cells in order

**A step that shows a chain of forced consequences declares each link's
position, and the shared mechanism draws it as a small number in the cell's
corner.** A set of marks is not a chain: a sentence saying "each forces the
next" over unordered marks can be checked only by redoing the deduction,
which `hints.md` § "The forcing boundary" forbids. Requirement "A chain's
order is declared and drawn as an ordinal".

- **Declare the order as data.** A link carries `order` (`OrderedCell`,
  [`engine/overlay-sidecar.ts`](../src/engine/overlay-sidecar.ts)); the
  renderer never numbers by array index.
- **Wire it in the tile painter.** Take `ds.hint.order[i]` and pass it to
  `drawHintOrdinal` ([`engine/hint-ordinal.ts`](../src/engine/hint-ordinal.ts))
  with the game's outline slot. Unwired, the chain is outlined, the
  sentence cites "cell 3", and no number shows.
- **Bottom-right, in every game**, the one corner free wherever a chain is
  drawn, so the mark is learned once. Pass `inset` where a ring shares the
  corner.
- **A number, never an arrow.** An arrow claims that one link forces the
  next, which is false of chains found in discovery order, and every game
  draws the weakest claim every chain can make.
- **A game without tiles says where the number goes** and hides anything else
  numbered there while a chain shows. Exemplar: the label point in
  [`map/render.ts`](../src/games/map/render.ts).
- **Pin a position.** `hint-quality.test.ts` fails on a numbered chain from a
  game with no entry in `testing/hint-chain-pins.ts`, and
  `hint-ordinal.test.ts` checks the number is drawn there. Find a position
  with `npm run hint-scan -- src/engine/hint-ordinal.test.ts`.

The numbering also ties the sentence to its cells (`hints.md`
§ "Bind the words to the marks"). Exemplars: `forcingChainArea` in
[`engine/latin-hint.ts`](../src/engine/latin-hint.ts) with
`forcingChainPremise` in [`engine/hint-text.ts`](../src/engine/hint-text.ts),
and `buildHighlights` in
[`clusters/index.ts`](../src/games/clusters/index.ts).

## Show the what-if walk statically

**A hypothesis followed to a contradiction is one step that shows the whole
walk in its marks; hypothetical marks are never journey legs.**
`HintStep.move` is required, playing a hint makes every leg's move for real,
and a plan may hold no dummy moves, so the legs cannot be hypothetical.

- **The target keeps its ring** ("suppose this cell were …"). Each cell the
  hypothesis would force carries a small center mark of its forced color,
  unlike a placed piece in size so it reads as hypothetical. That is not the
  pre-placement § "Highlight, never perform" forbids, which is about the
  target.
- **The cell where the contradiction lands takes a double ring**, the visual
  language of a live-error outline doubled: "would break" beside "breaks
  now".
- **One ring role.** Where every premise cell is beside the target or the
  contradiction, drop the premise ring so "ringed" means one thing, and
  assert the word is spoken exactly when that mark is set.
- **Take the shortest chain, not the first.** At a stall, evaluate every
  candidate firing's propagation and take the shortest, ties broken in scan
  order so a recompute gives the same step.
- **Number the chain** (§ "Number a chain's cells in order").
- **Lead the sentence with the hypothetical, and say why it fails.** When
  several hypotheticals share one sentence, every count and verb is true of
  each of them, not of their union.
- **Measure how often boards need the walk before planning to reject them at
  generation.** Where more than a third do, rejecting is not available.

Exemplars: `chainToContradiction` in
[`clusters/solver.ts`](../src/games/clusters/solver.ts), `narrate` in
[`clusters/index.ts`](../src/games/clusters/index.ts), and requirement "A
lookahead deduction is one step showing its whole forcing chain" in its spec.

A rung that hypothesizes a value and runs the whole deduction from it is a
Search, not a technique: its chain is unbounded, so there is no walk to show.
The hint refuses there, in words the player can act on, and never narrates
"this one survived" (requirement "A Search is refused and never narrated",
and [`solver-and-generator.md`](./solver-and-generator.md) § "Check, Tactic,
Search"). A refusal that tells the truth beats a step that reveals an answer.

## Marks on tiles vs marks on cells

**First ask whether the hint marks a moving piece by identity or by
position.** A mark keyed on a stable piece identity, painted as the piece's
own background wherever the piece is drawn, rides any animation and cannot go
stale ([`sixteen/render.ts`](../src/games/sixteen/render.ts)). The rules
below are for anonymous pieces, where the hint must name a cell index.

- **A mark on a tile rides the animation**: paint it as part of the tile,
  which is drawn offset from its cell while it moves.
- **Mid-animation, the displayed step's cell indices still refer to the board
  just left.** The midend advances the plan when the animation ends. Resolve
  the tile's cell in the board being drawn: where it lands while this step's
  own move is animating, where it stands otherwise.
- **A mark on a cell does not ride the animation.** Draw cell marks in a pass
  of their own after every tile, at the cell's unshifted position, which also
  stops a sliding tile covering them. Keep the mark's bit in the tile's cache
  word all the same, so the tile under a stale outline repaints when the hint
  moves on.
- **Test at a mid-animation frame**: call `redraw` with the state before the
  move as `prev`, the state after it, and half the animation time, and assert
  the drawn coordinates of each mark. The still frames either side are
  correct, so a snapshot of them cannot catch this.

Exemplar: [`netslide/render.ts`](../src/games/netslide/render.ts) and
[`netslide-hint.test.ts`](../src/games/netslide/netslide-hint.test.ts);
requirements "The tile mark travels with the tile during a slide" and "The
destination mark stays on its cell during a slide" in its spec.

## Placement animation as hint motion

**A game with no move animation gives a single-cell change a short geometric
one, so a played hint reads as motion.** Return a small `animLength` for a
single-cell change and 0 for a bulk solve or a no-op; being above zero, it is
stretched by the midend to the uniform hint duration.

`drawRect` takes a palette index and not RGB, so do not tween the color: grow
the new color from the cell's center over `animTime`, with the previous color
beneath, and let animating cells bypass the tile cache
([`rendering.md`](./rendering.md) § "Animation and flash"). Exemplar:
`animLength` in [`unruly/index.ts`](../src/games/unruly/index.ts) and the
grow branch in [`unruly/render.ts`](../src/games/unruly/render.ts).

## Group one firing into one step

**When one deduction forces several cells at once, emit one `HintStep` whose
move makes all of them, and ring them all.** The other form of "one firing is
one journey" is `continuesPrevious` legs
(requirement "One deduction firing is one journey").

- **Find the whole forced set of a firing**, against the board as handed in.
  A set that appears only after applying the first cell is a chain, and
  chains stay separate steps. An early-returning solver cannot tell you
  whether one firing is one move: scan boards and count.
- **Say whether the group completes the thing or only must be part of it**,
  and let its count drive singular and plural.
- **Plan by applying a group, recomputing and repeating** on a working board,
  so each step's words and marks reflect the board as it fires. Keep a
  single-cell fallback so the plan still finishes the board, and test that
  every generated board's plan solves it. Replanning from the board is only
  as complete as the rules are monotone
  ([`solver-and-generator.md`](./solver-and-generator.md) § "No option
  switches the generator's checks off").
- **`hintKeepTrack` handles a partly made step.** A move that sets the hinted
  value into a subset of the step's cells and nothing else is `"completed"`
  when it makes the last one, and otherwise `"onTrack"` with the step shrunk
  in place, its move and its words both, so a later play does not repeat
  what is done. A cell outside the step or a wrong value is `"off"`.
  `trackTargets` in [`engine/hint-track.ts`](../src/engine/hint-track.ts)
  gives the verdict and the targets left; the game rebuilds the shrunk move
  from them.
- **Take the changes from a board diff**, `executeMove` on the state before
  the move, and not from the move's ops, so a toggle that takes a mark back
  off answers itself. A board with one value a cell diffs with
  `changedCells`; another kind of element keys its own, and an element stored
  in two places is keyed once.
- **A step or a journey?** The numbers in the narration decide. Where each
  forced square has a different figure to quote, each is a leg with its own
  sentence; where one sentence is true of all, they are one step.
- **For legs from a shared helper**, thread the recorder through the helper
  that fills the line, so its first cell opens a journey and the rest
  continue it (`fillRow` in
  [`unruly/solver.ts`](../src/games/unruly/solver.ts)).

Exemplars: `nextRegionGroup` in
[`filling/solver.ts`](../src/games/filling/solver.ts), the plan and
`hintKeepTrack` in [`filling/index.ts`](../src/games/filling/index.ts), and
`skeletonKeepTrack` in the skeleton's `hint.ts`.

### A journey completes leg by leg

**`hintKeepTrack` judges the leg: the squares this step's own move asks
for.** The midend advances on `"completed"` and holds the same step on
`"onTrack"`, so a hook that asks whether all of the journey's squares are
placed never completes leg 1, and playing the hint repeats it forever. The
journey's full marks may still ride on every leg, so the picture does not
shrink mid-hint.

A game whose input is a press cycle answers `"onTrack"` for a press that is
on the way to the leg's value, or the first press drops the plan
(`magnetsKeepTrack` in [`magnets/hint.ts`](../src/games/magnets/hint.ts)).
`verbClicks` hands the same judge each button's click and takes the one that
completes the step, then one that shrinks it, so a press only on the way is
never the gesture's.
Guard: walk a real journey and assert each leg's verdict is `"completed"`
(`boats-hint.test.ts`, "completes a journey leg by leg").

### A move must not reach past the squares the step claimed

**Where a move fills an area, every square whose decidedness it changes is
one of the step's targets.**

- **Widen a span only when every square in it is a target or already
  decided**, checked against the board as this step fires, each firing
  carrying its own grid snapshot.
- **Keep the plan's board and the player's board reconcilable.** Anything the
  deduction decides as a side effect is either a firing of its own or part of
  the step's move and required for completion. The deduction never knows
  something the player was not told.
- **Guard**: apply each step and assert every square whose decidedness
  changed is in that step's targets. Compare decidedness, not raw cell
  values, since a move may rewrite a placed value into a resolved form.

Exemplar: "never asks for a square the step did not claim" in
`boats-hint.test.ts`.

### Read what a firing did from a before/after comparison

**Compute the set a firing decided by comparing the board before and after
it, not from the rules' return codes.** A rule that also settles a cell's
partner makes the partner report "nothing to do" at its own turn, and the
step then says "this cell" while its move fills two.

Mask scratch state out of the comparison: a rung that rewrites a scratch bit
whether or not it fires otherwise reports a firing at the end of every plan.
Decide whether a rung fired from its return value, and what it did from the
masked diff. Exemplars:
[`galaxies/hint.ts`](../src/games/galaxies/hint.ts) and
[`magnets/hint.ts`](../src/games/magnets/hint.ts).

### Bound a plan by the steps it offers

**Cap a plan by the steps it will show, never by the firings it runs.** A
firing the game cannot show re-derives on every recompute, and enough of them
in a row spend a firing budget and turn it into a refusal on a board with
moves left. Any bound on a plan is a bound on its output. Never let a cap cut
a journey in half. Requirement "Hidden firings spend the step budget and not
the plan cap"; exemplar: the cap in
[`galaxies/hint.ts`](../src/games/galaxies/hint.ts).

### A run the player writes in one go is one journey

**After a step starts a sequence the player would write down at once, ask the
same techniques about that sequence alone, none harder than the one that
began it, and make the placements one journey of legs, each with its own
sentence.**

Where the whole sequence has exactly one arrangement, say so once: one step
placing all of it, drawn as the game's own line in the hint color. Count the
arrangements; never infer uniqueness from the deductions that found the
members, and recount by brute force in the test. A neighbor left without room
is a count too: the step may fire when exactly one arrangement leaves the
neighboring sequence at least one. Whenever a technique finds a placement,
ask first whether its whole sequence is forced.

Exemplar: `runRoutes` and `leavesRoom` in
[`ascent/hint.ts`](../src/games/ascent/hint.ts), with requirements "Ascent's
hint follows a run" and "Ascent's hint places a run with one route in one
step" in its spec.

### A move with side effects ends the plan

**A step whose move changes more than its own target is the plan's last.**
What the side effect wrote is the player's to vouch for, so the next hint
reads the result after the mistake check has seen it. Exemplar: a number
landing at the end of a drawn line in
[`ascent/hint.ts`](../src/games/ascent/hint.ts).

- **Marks a declared rule-out brings end the plan without the game's
  help.** With the `auto-cross` preference on, the midend cuts a plan after
  its first step that brings marks, and judges each step by the player's
  move alone (`Game.rulesOut`, `docs/mechanics.md` § "Preferences"). The
  game's hint plans as if the preference were off.

## Re-derive the named technique

**Where a solver returns which cells are forced and carries no reason,
compute the recognizable techniques directly, and keep the full solver as a
named bottom rung.** A line solver that intersects every legal placement is
the case.

- **Derive the named techniques from the extreme placements**: a cell every
  placement of one run covers is forced one way, one firing a run; a cell no
  run can cover is forced the other, one firing a contiguous segment.
- **The bottom rung is a real technique, narrated in the necessity voice**:
  "whichever way this row's runs fit, these cells must be …". Never "only one
  arrangement fits", which is a different and false claim.
- **Measure how often the bottom rung fires before enriching it**; rarity is
  what justifies keeping it over rejecting the boards that need it.
- **Keep the hint's functions separate from the generator's solver**, so the
  generator is untouched by construction.
- **Word a premise without a flat state-of-being verb** ("has nowhere to
  slide", not "is pinned"); a guard aimed at the conclusion clause catches
  "is", and the guard is not loosened for it.
- A move over an arbitrary set of cells lets one firing group cells that do
  not touch and lets `hintKeepTrack` shrink it in place.

Exemplars: `packLeft`, `packRight` and `analyzeLine` in
[`pattern/solver.ts`](../src/games/pattern/solver.ts), and `fillCells` in
[`pattern/index.ts`](../src/games/pattern/index.ts).

## Read the reason off the validator

**Where the solver forces a move by contradiction and the validity check
already says which rule broke and where, build the reason from the rejected
trial's errors.** No separate recorder is needed, and the evidence cells are
the flagged positions.

- **The reason is in the rejected trial, not the accepted move.** Set the
  trial value, validate into an errors array, classify, restore. A fixed
  priority picks the clearest when several rules break.
- **The classifier is total.** Mirror the validator's own decision sequence,
  so every place it returns invalid has a branch, the ones that set no flag
  included. A trial skipped as unclassifiable silently empties a tier.
- **End in a true catch-all, never in "no reason"**, and pair it with a
  coverage sweep by technique over generated boards, so a rung that never
  fires is visible.
- **Name a flag by what it means.** A reason lifted off a flag inherits the
  flag's exact meaning; read where it is set.
- **Keep the recording functions beside the untouched solver**, out of the
  generator's path.
- **For a lookahead rung**, the first form is a proof by contradiction: the
  hypothesis on the target, the contradiction ringed from the sub-solve's
  final errors, narrated. Showing the walk is § "Show the what-if walk
  statically".

Exemplars: `nextForcedMove` in
[`bricks/solver.ts`](../src/games/bricks/solver.ts) with
[`bricks/index.ts`](../src/games/bricks/index.ts), and the classifier ending
in `unfinishable` in
[`boats/hint-solver.ts`](../src/games/boats/hint-solver.ts). This fits any
game whose `findMistakes` or live-error check marks which rule each cell
breaks.

## A deduction the player can run with a gesture is its own rung

**Where an existing control already shows the player that a move is forced,
give the hint a rung that says so**, hint-only, so no board changes. It is a
shorter story than the general argument that otherwise covers those cases.

Measure that the control and the deduction agree before making the claim: a
control's predicate may be more lenient than the solver's, and "only one
lights up" is then false at firings the general rung makes. Adding the rung
is what makes the claim true wherever it is made. Exemplar: the cell-to-dot
drag rung in [`galaxies/hint.ts`](../src/games/galaxies/hint.ts).

## Give the facts a notation

**A hint relies only on marks the player can make.** If a tier's deductions
need a kind of mark, the game gives the player that mark and the hint's steps
make it. A hint never draws a fact the player cannot record, however clearly,
because the point of a hint is that the player can do the next one alone.
Requirement "A hint relies only on marks the player can make".

**The fallback is the tier, not the hint.** If the notation a deduction needs
would be too hard to manage, the difficulty that needs it becomes
`Unreasonable`: its boards may need trial and error, and its hint refuses
with `DEDUCTION_EXHAUSTED` (`hints.md` § "The forcing boundary", and
[`solver-and-generator.md`](./solver-and-generator.md) § "Check, Tactic,
Search"). Try the notation first, and say what made it unmanageable.

The order of work is the order of the sections below: check, measure, then
either make the hint forgetful or design a mark and place it. Exemplar of a
full notation: [`games/loopy/`](../src/games/loopy/), with requirement "Loopy
explains the next deduction from notes the player can make" in its spec.

### Check a game for facts the player cannot mark

**Read what each sentence cites, and ask whether an earlier deduction found
that fact and nothing on the board records it.** The shapes to look for:

- **An arm whose comment says the notes lag the solver.**
- **A recorder state that persists across the plan and is not the board**: a
  union-find, a candidate cube. Where the game has a shallow derivation from
  the board alone, check each firing's premise against it.
- **Every arm that reads that state**, not only the one whose sentence gave
  it away. Search the solver for reads of the field.
- **A state field the solver writes and no player move does.** No sentence
  need name it: the steps leaning on it are ordinary sentences, false only on
  the player's board.

**The guard, for any game whose hint runs on a working copy**: replay only
the shown steps onto a player's board through the real `executeMove`, and
before each shown step compare that board with the one the deduction reasons
from. Anything the deduction holds and the player does not is a fact a
sentence may lean on unseen, so the guard needs no knowledge of the premises.
Exemplar: "every step stands on the board the player can see" in
`bridges-hint.test.ts`.

Before seeding a recording pass from the player's marks, list what the
solver's state implies that the marks do not say. Each item is a rung or a
missing notation.

### Measure what the recordable facts reach first

**Before designing a notation, run the deduction on the facts the player can
already record, and measure how far it gets.** The table is what makes the
notation a decision and names its size.

- **List the writers of the hidden state, and every rule that reads it**,
  and ask of each what the board already says about its conclusion; record
  only what the board cannot derive. If every writer is a rule over
  things already drawn, state that reading in one module and hold every bit
  the solver sets to it in a test. Only then may the hint hide the firings
  that set them (`hints.md` § "Show only what the board does not already
  say"). Exemplar: [`magnets/reading.ts`](../src/games/magnets/reading.ts).
- **Ask whether the hidden fact is ever needed, not only whether it exists.**
  Build the forgetful solver, which re-reads everything off the board before
  each firing, and compare its verdicts with the real one on the boards the
  generator visits.
- **Measure in layers.** Between forgetting the fact and keeping it lies what
  the board shows at a glance, and chaining that reading once or twice. The
  layers say what a notation would carry and how often.
- **Measure with the order the hint will use**: one placement a step, easiest
  technique first. A solver that places every find at once has different
  facts in place when a technique is asked.
- **Widen past the presets**: custom options no preset carries can bring a
  rung back. A stall that shows one human pattern every time is a technique
  to add.
- **Grow the reading before adding a mark.** A fact the board shows with no
  chain behind it belongs in the reading and in the help, not in the
  notation. Measure what is left after that.
- **Where the recorded facts still fall short, the generator can close the
  gap**: it keeps only boards the hint's own engine finishes
  ([`solver-and-generator.md`](./solver-and-generator.md) § "Guess-free
  generation"). Exemplar: `finishes` in `src/games/net/`.
- **A hint that has to patch the solver's reading has found a solver
  defect.** Fix the solver, since it is grading boards wrongly, and delete
  the patch.

A game whose input is the target-verb model spells its hint's moves through
its declared verbs ([`input.md`](./input.md) § "Targets and verbs"), so the
hint needs no move of its own and cannot ask for something the controls do
not do.

### Rebuild the reading before every firing when no mark is needed

**Where the measurement says nothing rests on the hidden state, make the hint
forgetful by construction: reset the solver's state from the board before
each firing.** Then no step can rest on a fact the board does not show.

- **A step is "strike and settle", never "strike now, use later".** A
  narrowing a rung makes counts only through what it settles on the board in
  the same firing; one that settles nothing is taken back.
- **Guard the invariant itself**: every firing's `before` snapshot equals the
  board re-read from scratch. "Recomputing gives the same step" cannot see a
  leaked fact, because the recompute's scan re-derives it. See it fail with
  the reset removed.
- **Each technique is a solver rung over a fresh reading**, and a placing
  rung stops at its first placement while recording.
- **The reading is the premise, and a notation extends it.** A sentence may
  cite what the reading shows, drawn or not; only a fact past the reading
  becomes a step that draws a note.
- **State each technique's tier once** and hold every step to its board's
  tier, in the board's own mode.
- **Count the notes the reading leans on, and have the plan place them.** A
  note the reading reads is a premise: the hint places each one its
  deductions rest on, seeds the player's own as facts, and `findMistakes`
  vouches for it.

Exemplars: `pearlRecordingPass` in
[`pearl/hint.ts`](../src/games/pearl/hint.ts) with the snapshot test in
`pearl-hint.test.ts`; `reading` in
[`ascent/hint.ts`](../src/games/ascent/hint.ts) with `techniqueTier`;
`TentsBoard.readLinks` in [`tents/solver.ts`](../src/games/tents/solver.ts).

### Design the mark from what the solver derives

**Measure what the solver derives before designing the mark, and give the
mark exactly that reach.**

- **A mark the game already has may be the notation.** A step that leaves
  nothing a later step reads is not a step, and the notation's reach is the
  hint's reach: what it cannot record is where the rungs stop short of the
  solver. Exemplar: the `line` rung in
  [`rect/hint.ts`](../src/games/rect/hint.ts).
- **A state field the solver already keeps can be the notation**, set by a
  player's move, so the firing that wrote it becomes a step that writes it.
  Exemplar: the span limit in `src/games/bridges/`.
- **Where the game already lists a location's values, make the list
  editable** before reaching for a notes mode and a new glyph. Exemplar: the
  tally in `src/games/subsets/`.
- **Read what the mark must express off the chains, not the links.** Links
  may all join neighbors while a step rests on their composition, which joins
  distant elements. Place a chain one link at a time so no step cites more
  than two. Exemplar: `chainPair` in
  [`loopy/hint.ts`](../src/games/loopy/hint.ts).
- **A fact inside a premise need not be a mark if every link of it is on the
  board.**
- **Narrate the pattern the facts make, not the facts one by one.** Take a
  census of the shapes the marks make before shortening; a common shape gets
  a name, the help teaches it (`hints.md` § "Rules belong in the help"), and
  the code refuses the name over a shape it does not fit. Exemplar: `vLine`
  in [`slant/hint.ts`](../src/games/slant/hint.ts).
- **Record why each fact holds where it is derived**, with its premise and
  its parents. A union-find answers only that two things are joined, so a
  cited chain is a shortest path through the recorded merges. Exemplars:
  [`loopy/record.ts`](../src/games/loopy/record.ts), `SlantTrace`.
- **Let the notation's gesture carry the placement it explains**, where the
  player would make both at once; a player who makes the placement alone is
  on track, and the step shrinks to the note. Exemplar: the link in
  `src/games/tents/`.
- **Geometry the mark depends on is checked on every tiling.** A dot's edge
  order is not a direction; choose a corner's angle by the face it belongs
  to. Exemplar: [`loopy/notes.ts`](../src/games/loopy/notes.ts) and
  `loopy-notes.test.ts`.
- **The mistake check vouches for the notation**: `findMistakes` compares
  every note with the unique solution, so the plan may take notes as facts
  (`hints-candidates.md` § "Deduce from the notes when the mistake check
  vouches for them").

### Place a note beside the step that cites it

**Each fact the player must record is a step of its own with one sentence,
placed just before the first step that cites it.** A chain the player cannot
mark is a missing notation, not a display problem (`hints.md` § "Cognitive
load: one step per hint"). Requirements "A note a hint asks for is placed
beside the step that uses it" and "Notes placed together are split into their
derivations".

- **Branch on whether the sentence can expire, not on the kind of fact.** A
  fact only accumulates, so a deferred note is always still derivable; what
  goes stale is a sentence that quotes the board. Slot an expiring note at
  the latest position its sentence still holds. A premise that only grows as
  the board fills needs no expiry check, so ask first whether yours can
  expire at all. A note never precedes a note it cites.
- **A journey is one derivation.** Split the notes placed at one position
  into the derivations they make, facts joined by what they cite, each its
  own journey, ordered so each leg follows from the one before. A line
  resting on one derivation is its last leg; a line combining several stands
  alone after them.
- **Place only what some later step rests on.** The recorder derives more
  than any step uses. Test the claim: the firing after a note-only step could
  not have fired before it.
- **Seed the player's notes as facts whose premise is "on the board"**, so a
  resumed plan cites them and never places one again. A resumed plan may
  place a note the first plan did not; the test holds each note to being
  placed once and where it is true, not to equality with the first plan.
- **Read every step against the plan's board at that step.** Walk a working
  copy while building steps, and test by walking whole plans, not step one.
- **A board need not carry its tier.** Try the easiest tier's rungs to
  exhaustion, then the next; facts a higher tier derived stay recorded.
- **Measure a chain shortener before keeping it.** A rung that already
  returns the shallowest move it can leaves the long tail unchanged.

Exemplars: `planSteps`, `sentenceExpires` and `sentenceHolds` in
[`loopy/hint.ts`](../src/games/loopy/hint.ts) with `seedNotes` in its
solver; `syncToBoard` and `canHold` in
[`subsets/solver.ts`](../src/games/subsets/solver.ts), where one predicate
answers the aid, the hint's premises and "is this already on the board";
`drawLinkFor` in [`tents/solver.ts`](../src/games/tents/solver.ts).

### Place the notes a fixpoint rests on

**When the notation exists and the plan concludes from a stronger engine's
fixpoint, trace the conclusion back to the marks it needs and place those
first.** A sentence resting on rule-outs held only in the fixpoint is true
and cannot be checked.

- **Read the notes as the board.** That is sound because `findMistakes` flags
  a note that excludes the answer; on a board the check cannot judge, the
  notes are the player's premises and the hint reasons from them as given.
- **Record provenance for each rule-out**: which narrowing removed it and
  what that narrowing rested on. A second kind of narrowing has a second kind
  of support, and the trace follows the kind.
- **Emit the oldest narrowing in the support, then recompute.** The oldest
  rests only on the board, so its sentence is checkable as it stands. No
  recorded script is replayed.
- **Writing notes into an empty element needs a move that only adds**, as a
  strike only removes: a toggle is not idempotent. Its keep-track and refresh
  are the game's, since the shared candidate helpers know only strikes.
- **Measure the notes placed, not the steps affected.**

Exemplar: `support` in
[`crossing/hint-solver.ts`](../src/games/crossing/hint-solver.ts), with
requirement "A placement the board does not yet support waits for its notes"
in its spec.

### Rule-outs as board marks

**A game whose own moves include a "this cannot be" annotation emits its
rule-out deductions as steps that draw the annotation**, so the next
placement leans on a visible mark and its sentence stays short.

- **Placements lead.** The finder checks for a determined piece not yet
  placed before running the rule-out deductions, and returns at the first
  firing.
- **Do not seed annotations that carry no validity.** Where the mistake check
  does not vouch for the player's annotation, the recorder re-derives every
  rule-out; one the player already drew is skipped for display while the
  solver state still advances. Where the check does vouch, the marks are
  replayed (`seedFrom` in [`slant/solver.ts`](../src/games/slant/solver.ts)).
- **Easy boards come out all placements**, so the annotation appears only
  where a harder tier needs it. Assert the annotation path on a hard board in
  the game's own test.
- **Gate the recorder**, so the generator's path does not run it.

Exemplar: `firstFiring` and `seedFromDominoes` in
[`dominosa/solver.ts`](../src/games/dominosa/solver.ts), with requirement "A
barrier step draws the edge a technique rules out" in its spec.

### A right mark is not yet a premise

**Where a player can mark something the board alone does not prove, the hint
deduces from the proved facts only.** The midend refuses a hint while
`findMistakes` finds anything, so a hint never meets a wrong mark and writes
no step to undo one; a game with a hidden answer is no exception, its check
comparing the board with the answer as every other does. But a mark the
check passes may be a guess, and reasoning from it would teach the guess: a
mark counts once a deduction proves it, and the plan places it in an earlier
step if the player had not.

A game without tiers cannot refuse on a board its generator promised
solvable (`hint-resume.test.ts`). Run the narrated ladder beside the
generator's certifier over a sample of boards, widen it rung by rung until it
never stalls where the certifier finishes, and record the sample in the
change's design.

Exemplar: [`mines/hint.ts`](../src/games/mines/hint.ts), "never cites a flag
it has not proved" in `mines-hint.test.ts`, and requirement "Mines ships an
explained deductive hint from proved facts" in its spec.

### A solver's silent bookkeeping is the player's work

**A fact a solver's data structure carries for free can be a move the player
still has to make; give it a rung.** Where a merge makes one element inherit
another's relations silently, the player's board still shows the inherited
boundary open, and a plan that narrates only the solver's own firings ends on
a board that is never solved. The rung narrates as a real deduction and
writes only state the generator does not read.

A rung that is not monotone, whose choices can grow as the board fills, owes
a test from the player's positions: the cross-game resume walk follows only
the hint's own moves, so walk from random correct partial boards as well.

Exemplars: `walled-apart` in
[`separate/solver.ts`](../src/games/separate/solver.ts) and
`separate-hint.test.ts`; the pinned partial boards in `filling-hint.test.ts`.

### Notation and goal are different move sets

**Where the completion check reads one kind of move and the deduction is
about another, the plan has a rung that turns the notation into the answer.**
A plan of notation alone is sound, teachable and never finishes the board,
which the resume guard catches.

Rung order is a narration decision, and measurement picks it. Where solver
order lets the hardest rule win every race, split it into rungs and demote
the hard one to last, as a parameter that defaults to the solver's behavior
so the generator's path is unchanged. Exemplar: the wall rungs in
[`galaxies/hint.ts`](../src/games/galaxies/hint.ts), with requirement "The
hint plan finishes the board with walls" in its spec.
