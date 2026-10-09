# bridges Specification

## Purpose
Bridges (Hashiwokakero), the puzzle of linking every island into one network
with bridges that never cross, at most a set number (usually two) between any
pair, each island carrying as many bridges as its number. This spec holds the
rules, the description format, the controls, what each difficulty tier's
solver may deduce, the live errors and mistake check, the limit a player can
write on a span, the optional lift of satisfied islands that locks nothing,
and the hint: what it explains, in what steps, and how it marks them in the
game's own vocabulary.

## Requirements

### Requirement: Bridges links every island into one network

A Bridges board SHALL be solved when the numbered islands on a `w × h` grid are
connected with horizontal and vertical bridges so that each island carries
exactly its number of bridge-ends, at most `maxb` bridges join any pair of
islands, bridges run only between two islands directly in line and never cross
an island or another bridge, and all islands form a single connected group.

#### Scenario: Two finished groups are not a solution

- **WHEN** every island carries exactly its number of bridge-ends and the
  islands form two groups with no bridge between them
- **THEN** the board is not solved

### Requirement: Bridges params are size, bridge limit, density, expansion, loops and difficulty

Params SHALL be `w`, `h`, `maxb`, `islands` (the percentage of squares that are
islands), `expansion` (a percentage), `allowloops` (boolean) and `difficulty`
(Easy, Normal or Tricky).

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 15, maxb: 2, islands: 30, expansion: 10, allowloops: true, difficulty: 2 }`
  are encoded in full and decoded
- **THEN** the decoded params equal the original

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given, in full, a board whose island target is
  three at a tier above Easy (e.g. `3×3` Normal at the default density)
- **THEN** it returns a non-null error string

### Requirement: Bridges descriptions encode the island clue grid

The desc SHALL encode the island positions and their bridge counts row-major: a
digit or letter gives an island with that count at the current cell, and a
run-length letter skips that many empty cells.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the islands re-encoded
- **THEN** the re-encoded desc equals the original

### Requirement: A Bridges description that describes no board is refused

`newState` SHALL refuse, so that `validateDesc` reports with a reason, a desc
that overruns the grid or stops short of it, that holds a character which is
neither a count from 1 to 16 nor a run length, that places two islands
orthogonally next to each other, or that has fewer than two islands.

#### Scenario: A malformed description is rejected

- **WHEN** `validateDesc` is given a desc whose run-lengths overrun the grid
- **THEN** it returns a non-null error string

### Requirement: Bridges input drags bridges between islands

A left-drag from an island along its row or column to the next in-line island
SHALL add a bridge between them, or one more to those there, wrapping back to
zero once the span's limit is exceeded. The island the drag points at SHALL be
tracked as the pointer moves, and the move SHALL be committed on release. A
drag that does not run cleanly between two in-line islands SHALL be canceled
with no change. A secondary drag is Requirement: A secondary drag lowers a
Bridges span's limit by one.

#### Scenario: Dragging cycles the bridge count

- **WHEN** the player left-drags from an island to an in-line neighbor three
  times on a `maxb = 2` board
- **THEN** the bridge count between them goes 1, then 2, then 0

#### Scenario: An off-line drag is canceled

- **WHEN** the player starts a drag on an island and releases where no in-line
  island lies
- **THEN** the board is unchanged

### Requirement: Bridges has a keyboard cursor that drags

Cursor keys SHALL move a keyboard cursor. `CURSOR_SELECT` SHALL grab a
keyboard drag at the cursor's island, for an arrow to carry out, and a second
`CURSOR_SELECT` SHALL drop it.

#### Scenario: Select and an arrow draw a bridge

- **WHEN** the cursor is shown on an island with an in-line neighbor to its
  right, the span between them empty and free to take a bridge, and the
  player presses `CURSOR_SELECT` and then the right arrow
- **THEN** one bridge joins the two islands

### Requirement: Bridges draws provably wrong state red

`redraw` SHALL draw in red, as the board is played, an island that can no
longer reach its count and, when `allowloops` is false, the bridges that
complete a forbidden loop.

#### Scenario: A loop is red only where loops are forbidden

- **WHEN** the player's bridges close a loop
- **THEN** the loop's bridges are drawn red on a board with
  `allowloops = false`, and closing a loop is not what turns anything red on a
  board that allows loops

### Requirement: Bridges findMistakes reports every span the unique solution contradicts

Because a generated board is uniquely solvable, the game SHALL implement
`findMistakes`: it SHALL solve the board again from its island clues and
return every span whose player marks that solution contradicts: a bridge where
the solution has none, a count exceeding the solution's, or a limit below the
solution's count, the cross included. A board that is not uniquely solvable
SHALL yield no mistakes.

#### Scenario: A wrong bridge is flagged

- **WHEN** the player places a bridge the unique solution does not contain,
  without yet over-committing an island
- **THEN** `findMistakes` includes that bridge and Check & Save refuses to save

### Requirement: Every Bridges mark is in the tile diff key

The `findMistakes` overlay SHALL be drawn in the live-error red, with no
palette entry of its own. The live errors, the mistake overlay, an island's
face, a span's limit and the hint marks SHALL each be part of the tile cache's
diff key, so each is painted on a frame later than the move that drew the
board and repaints clean when it clears. An island's recolored hint rim SHALL
reach the four tiles its arcs intrude into.

#### Scenario: A mistake overlay repaints on a later frame

- **WHEN** a bridge is drawn, then `findMistakes` flags it on a subsequent frame
  without that bridge's own value changing
- **THEN** the mistake overlay is painted on that later frame

#### Scenario: A displayed hint repaints an otherwise unchanged frame

- **WHEN** the board is painted, a hint is displayed, and `redraw` runs again
  with nothing else changed
- **THEN** the frame carries the step's marks

### Requirement: Bridges auto-marks satisfied islands (fork aid)

The game SHALL offer an `auto-mark-complete` boolean preference through
`Game.prefs`, default on. When on, `redraw` SHALL draw an island whose bridge
count equals its clue with the face of a completed island, with no player
action, and SHALL revert it when a bridge is removed. The aid SHALL be purely
visual: it SHALL NOT set the completed mark or lock the island's bridges, and
a click on an island SHALL still mark and lock it. The face SHALL NOT replace
the live-error red, on the rim and count.

#### Scenario: A satisfied island grays only when the preference is on

- **WHEN** the player brings an island's bridge-count up to its clue with
  `auto-mark-complete` on
- **THEN** that island is drawn with the completed face, while the same state
  drawn with the preference off shows no completed face, and in neither case
  is the island marked completed (its bridges stay editable)

### Requirement: Bridges explains the next deduction

`hint(state)` SHALL return the forced deductions from the player's own marks as
an ordered plan, each step narrating why its moves are forced from premises the
sentence itself states. Where the deduction contradicts itself on a board
`findMistakes` finds nothing wrong with, it SHALL refuse with the collection's
unlocalized-contradiction wording.

#### Scenario: A hint explains an island with exactly enough room left

- **WHEN** an island's remaining count equals the bridges it can still take and a
  hint is requested
- **THEN** the step's narration states that count, its move draws exactly that
  many bridges, and the island it names is the one the hint recolors

#### Scenario: A hint says so honestly when the annotation is what is wrong

- **WHEN** an island is marked complete before it is, so `findMistakes` reports
  nothing and the deduction still contradicts itself
- **THEN** the hint refuses with the collection's unlocalized-contradiction
  wording, which asks the player to undo rather than promising a highlight

### Requirement: A Bridges hint's ladder is capped at the board's own difficulty

The hint's ladder SHALL be capped at the board's own difficulty and not at the
top rung, since that is the tier the generator certified it soluble at.

#### Scenario: Following the plan solves the board at every tier

- **WHEN** a hint is requested, its first step applied, and the hint requested
  again, repeatedly, on a board of any tier
- **THEN** deduction never runs out before the board is solved

### Requirement: One Bridges firing is one hint step

One firing SHALL be one step. When a recorder is attached, a stage SHALL stop
at the first island that moved, and a rung holding more than one teachable
rule SHALL return at the first of them that changed the board, so a stage that
sweeps the whole board cannot pile several independent deductions into one
step. Where one premise forces bridges on several spans, the step's move SHALL
carry them all.

#### Scenario: One premise that forces two spans is one step

- **WHEN** an island needs two more bridges and has room for exactly one in
  each of two directions
- **THEN** one step's move draws both bridges, and no other island's deduction
  is in that step

### Requirement: A Bridges hint step is followed one drag at a time

Where the player's move does part of what a step asks, `hintKeepTrack` SHALL
verdict `"onTrack"` and shrink the step in place. It SHALL judge a bridge count
as progress when it moves toward what the step asks for, because one drag adds
one bridge and not the whole count, and SHALL accept the span from either end,
because the player drags from either island. A step that limits a span SHALL
be followed the same way, by the limit the drag leaves: lowering toward the
step's limit is progress.

#### Scenario: The first of two bridges keeps the step

- **WHEN** a step asks for two bridges on an empty span and the player drags
  one, from either of its islands
- **THEN** the verdict is `"onTrack"` and the step still asks for that span

#### Scenario: A limit lowered part of the way keeps the step

- **WHEN** a step asks for the cross on an empty span with no limit on a
  `maxb = 2` board, and the player's secondary drag leaves it limited to one
- **THEN** the verdict is `"onTrack"`

### Requirement: Bridges hint resumes from the player's marks

The hint's working copy SHALL resume from the player's marks and SHALL NOT
clear them. It SHALL first mark as complete every island whose bridges already
meet its clue, so a resumed position is the position the certified ladder was
certified on.

#### Scenario: A hint runs from the player's own bridges

- **WHEN** the player has drawn correct bridges of their own and asks for a hint
- **THEN** the plan is deduced from those bridges and its first step is a
  deduction that follows from them

### Requirement: Bridges hint hides the bookkeeping mark

Every change a rung makes SHALL be recorded, and the plan SHALL apply to its
working board, but never show, a firing that declares no reason. Exactly one
rule SHALL declare none: stage 1's marking as complete of an island that now
has all its bridges, which is bookkeeping the auto-mark aid already draws and
the win condition does not read.

#### Scenario: A bookkeeping mark is never a step

- **WHEN** a deduction satisfies an island and the solver marks it complete
- **THEN** no step in the plan asks the player to mark it, and the plan still
  reaches a solved board

### Requirement: No Bridges hint step leans on a fact the player cannot see

No step SHALL lean on a fact the player cannot see. The limit stage 3 derives
is a mark the player can write (Requirement: Bridges lets the player limit a
span), so the hint SHALL write it as a step of its own, and the board the
deduction reasons from SHALL never hold a bridge, a cross or a limit the
player's board does not.

#### Scenario: A hint writes the limit a later step counts

- **WHEN** a Tricky board's plan concludes that a span can take at most one
  bridge, and a later step counts the room that leaves
- **THEN** the limit is a step of its own that writes "≤1" on the span in the
  action color, with a sentence of the shape "Two bridges here would shut
  these 2 islands into a finished group of their own, so at most one can run
  this way.", and every later step's board matches the player's in bridges,
  crosses and limits

### Requirement: A Bridges firing carries which cause forced it

Where a rung can be forced by more than one cause, the firing SHALL carry
which. Stage 3's limit SHALL be narrated as a finished group sealed off or as a
named island left short of its clue.

#### Scenario: A limit forced by a starved island says so

- **WHEN** stage 3 limits a span because one more bridge there would leave
  another island unable to reach its count, and would seal no group off
- **THEN** the step's sentence is about that island left short, and that
  island is the one the step marks as counted

### Requirement: Bridges marks a hint in its own vocabulary

`redraw` SHALL draw the displayed step's marks from `BridgesHighlights` as the
game's own shapes recolored, because neither element a Bridges deduction
points at is a cell: an island is a circle wider than its own tile, and a
bridge is a span between two islands, which is no cell's border. No mark SHALL
come from `engine/hint-mark.ts`, whose every mark is a band on a cell's border
box.

#### Scenario: No hint mark is a fill

- **WHEN** any frame of a hint plan is captured
- **THEN** no rect in either hint color is tile-sized in both directions

### Requirement: A Bridges hint draws a span as what the step makes of it

A span the step decides SHALL be drawn as the bridge bundle it would become,
with the bars the step adds in `COL_HINT` and the bars already there in the
board's own color, or as the game's own pair of crosses in `COL_HINT` when the
step blocks it.

#### Scenario: Raising a span leaves the bridges already there in board ink

- **WHEN** a step raises a span that already carries a bridge
- **THEN** the frame draws the bundle at the new count with only the added bars
  in the action color

### Requirement: A Bridges hint recolors an island's rim and clue digit

An island SHALL be marked by recoloring its own rim and clue digit, which is a
ring and not a fill: `COL_HINT` for the island a sentence names,
`COL_HINT_CELL` for one it merely counts, and never both for one island. A
step SHALL recolor an island in the action color only when its sentence names
it. A premise that counts a group the island belongs to, and does not name the
island, SHALL mark every member alike, so "these N islands" points at N marks
of one color and not at one mark of each.

#### Scenario: A sealed group is marked in one color

- **WHEN** a step blocks a bridge because it would shut a group of islands
  into a finished group of their own
- **THEN** every island of that group, the one the bridge would start from
  included, takes the evidence color and none takes the action color

### Requirement: Bridges solves with a graded multi-stage deductive solver

The solver SHALL run its stages gated by difficulty, and SHALL report whether
it solved the board. It SHALL be purely deductive and SHALL NOT guess and
verify.

#### Scenario: A generated board is uniquely solvable at its difficulty

- **WHEN** a board generated at difficulty `d` is solved from the clue-only state
- **THEN** the solver returns solved at `d`, and a Normal/Tricky board is not fully
  solved at the tier below it

### Requirement: Bridges Easy runs the single-island deductions

Easy SHALL run stage 1: force the bridges an island must place because its
remaining count equals its available adjacent space, and forbid bridges into a
satisfied island.

#### Scenario: An island with exactly enough room is filled at Easy

- **WHEN** an island still needs two bridges and the spans around it have room
  for exactly two
- **THEN** the Easy solver draws both

### Requirement: Bridges Normal adds direction counting, loops and sealing off

Normal SHALL additionally run stage 2: a bridge in each direction the island's
count cannot do without, given the most its other directions can hold, and,
when `allowloops` is false, no bridge that would complete a premature loop.
Normal SHALL also run sealing off: forbid a first bridge in a direction when
that one bridge would finish the island and its neighbor into a group cut off
from the rest, as two neighboring 1s would.

#### Scenario: Two neighboring 1s are kept apart at Normal

- **WHEN** a Normal board's only way to finish an island is a bridge to a
  neighbor that the same bridge would finish, sealing the pair off
- **THEN** the Normal solver blocks that bridge, and the Normal hint narrates it
  as a finished group sealed off

### Requirement: Bridges Tricky adds the connected-group deductions

Tricky SHALL additionally run stage 3, the connected-group deductions beyond
sealing off: an "at most" limit on a span, a bridge that would leave some
island unable to reach its count, and a direction that must carry a bridge
because filling every other direction would seal a group off.

#### Scenario: An "at most" limit is Tricky's

- **WHEN** on a `maxb = 2` board one bridge on a span is safe and a second
  would finish its islands into a group cut off from the rest
- **THEN** the Tricky solver limits that span to one bridge, and the Normal
  solver does not

### Requirement: Bridges refuses to generate Tricky with one bridge per line

Generating a Tricky board with `maxb` 1 SHALL be refused with a reason, because
with one bridge per line no "at most" limit can exist and sealing off is
Normal's, so Tricky has almost nothing a Normal board could not need. A board
already dealt that way SHALL still load.

#### Scenario: Tricky with one bridge per line is refused

- **WHEN** a Tricky board with `maxb` 1 is asked to be generated
- **THEN** the params are refused with a reason, and a `params:desc` id with
  those params still loads

### Requirement: Bridges renders islands, bridges, marks and the win flash

The renderer SHALL draw islands as circles bearing their count, single and
double bridges (horizontal and vertical), the in-progress drag as its two
islands and the bridges between them recolored, the no-line and completed-mark
indicators, the keyboard cursor as a wash on its island's face, and the win
flash.

#### Scenario: The cursor is on the island's face

- **WHEN** the keyboard cursor is shown on an island that has no error
- **THEN** that island's face is the cursor wash, and its rim and count stay in
  ink

### Requirement: Bridges offers a show-hints preference for possible bridges

The game SHALL expose a `show-hints` boolean preference through the
`Game.prefs` hook. When it is on, `redraw` SHALL draw a faint line along every
span between two in-line islands that carries neither a bridge nor a cross, in
the possible-bridge color, which is not a hint color.

#### Scenario: The show-hints preference toggles the possible-bridge lines

- **WHEN** the `show-hints` preference is turned on
- **THEN** the renderer draws possible-bridge lines that are absent when it is
  off

### Requirement: Bridges lets the player limit a span

A player SHALL be able to write on any span between two in-line islands the
most bridges it may carry, as a mark the board keeps: the limit. No limit is
the board's own `maxb`, and a limit of none is the no-line cross, so the cross
is the bottom of the same scale and not a separate mark. A limit SHALL be
stored in the state's per-span maximum, which a bridge drag wraps at.

#### Scenario: A limited span wraps at its limit

- **WHEN** a span limited to one carries one bridge and the player left-drags
  along it
- **THEN** the span is cleared, having taken a single bridge and no second

#### Scenario: A wrong limit is a mistake

- **WHEN** the player limits a span below the bridges the unique solution puts
  there
- **THEN** `findMistakes` reports that span

### Requirement: A secondary drag lowers a Bridges span's limit by one

The secondary drag (the right button, a touch hold promoted to it, or the
keyboard's Shift+arrow) SHALL lower the span's limit by one: no limit, then
each limit down to one, then the cross, then no limit again. Every stop is
weaker than the one after it, so a player heading for "at most one" or for the
cross never passes through a mark that claims more than they mean.

#### Scenario: A right-drag lowers a span's limit

- **WHEN** the player right-drags between two in-line islands with no bridge
  between them three times on a `maxb = 2` board
- **THEN** the span is limited to one bridge, then crossed with the limit
  lifted, then free again

### Requirement: A Bridges limit never drops below the bridges drawn

A limit SHALL never drop below the bridges already drawn on the span: over a
bundle the secondary drag's cycle SHALL stop at the bridges drawn and wrap to
no limit without reaching the cross, and a full bundle with no limit on it
SHALL have nothing to lower. `executeMove` SHALL reject a limit below the
bridges drawn, above `maxb`, or of none.

#### Scenario: A limit never falls below the bridges drawn

- **WHEN** a span carries one bridge on a `maxb = 2` board and the player
  right-drags along it twice
- **THEN** the span is limited to one bridge, then free again, and is never
  crossed

### Requirement: A Bridges limit is drawn as ≤n at the middle of its span

A limit SHALL be drawn as `≤n` on a patch of background at the middle square of
its span, in the span's own color, so it reads over a bridge already drawn
through that square and turns red with the span when `findMistakes` flags it.

#### Scenario: A limit on a bridged span is read over the bridge

- **WHEN** a span that carries one bridge is limited to one on a `maxb = 2`
  board
- **THEN** its middle square is repainted with "≤1" on a patch of background
  over the bridge, in the color the bridge is drawn in

### Requirement: A Bridges solve ignores and lifts the player's limits

A from-scratch solve SHALL ignore the player's limits, as it ignores their
bridges, and Solve SHALL lift every limit the player wrote.

#### Scenario: Solve leaves no limit behind

- **WHEN** the player limits a span to one bridge on a `maxb = 2` board and
  then uses Solve
- **THEN** that span is no longer limited to one bridge on the solved board

### Requirement: Bridges grades a board the same however its islands are listed

The solver's verdict at every difficulty SHALL be a function of the board: the
clues, their places and the params. It SHALL NOT depend on the order the state
lists its islands in, so the state the generator grows and the state loaded
from that board's description get one grade.

#### Scenario: A board has one grade in every island order

- **WHEN** the islands of `11x11i5e10m3d2:4b7f2zzf2zn3b2g` are listed in any
  order and the board is solved from its clues at Easy, Normal and Tricky
- **THEN** every order solves it at all three

#### Scenario: A dealt board has one grade in every island order

- **WHEN** boards are dealt at `11x11i5e10m3d2` and each is solved at every
  difficulty with its islands listed in several shuffled orders
- **THEN** no board gets two verdicts

### Requirement: An island's room along a span never grows as bridges are drawn

So that the grade does not depend on island order, the room an island has along
a span SHALL be the least of what the island still needs and what the span can
still take, where what the span can still take is its capacity (the lesser clue
at its ends, and its limit) less the bridges already on it. Room counted that
way never grows as bridges are drawn, so a deduction available on an emptier
board is not lost on a fuller one.

#### Scenario: A bridge drawn comes off the span's whole capacity

- **WHEN** a span whose capacity is two carries one bridge and an island at its
  end still needs three
- **THEN** that island's room along the span is one

### Requirement: Bridges tells a settled island by a lifted face

`redraw` SHALL draw the face of an island that still has bridges to take as
the collection's cell surface, and the face of an island the player has marked
completed, or one the auto-mark aid marks, as the collection's lifted surface,
the one a given sits on elsewhere. The band under a bridge that a completed
island has locked SHALL be the same lifted surface. Settled SHALL be told by
that pair of surfaces the collection names, which hold in both schemes, and
SHALL NOT be told by a bevel shade.

#### Scenario: An island with bridges to take has the cell surface

- **WHEN** a freshly dealt board is drawn
- **THEN** every island's face is the cell surface and none is the lifted
  surface

#### Scenario: A completed island is lifted

- **WHEN** the player marks an island completed
- **THEN** that island's face is the lifted surface

### Requirement: A settled Bridges island keeps its rim, count and bridges in ink

An island's rim, its count and the bridges SHALL stay in ink whether or not the
island is settled, and the board between islands SHALL stay the board.

#### Scenario: Only the face changes when an island is marked

- **WHEN** the player marks an island completed and nothing about it is in
  error
- **THEN** its rim and count are drawn in ink as before, and the squares
  between islands are the board's own background
