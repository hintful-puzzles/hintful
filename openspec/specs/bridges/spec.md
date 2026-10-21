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

### Requirement: Rules: Bridges links every island into one network

A Bridges board SHALL be solved when the numbered islands on a `w × h` grid are
connected with horizontal and vertical bridges so that each island carries
exactly its number of bridge-ends, at most `maxb` bridges join any pair of
islands, bridges run only between two islands directly in line and never cross
an island or another bridge, and all islands form a single connected group.

#### Scenario: Two finished groups are not a solution

- **WHEN** every island carries exactly its number of bridge-ends and the
  islands form two groups with no bridge between them
- **THEN** the board is not solved

### Requirement: Rules: Bridges draws provably wrong state red

`redraw` SHALL draw in red, as the board is played, an island that can no
longer reach its count, when `allowloops` is false the bridges that complete a
forbidden loop, and a group of islands that all have their full count and join
only one another while other islands are left out.

#### Scenario: A loop is red only where loops are forbidden

- **WHEN** the player's bridges close a loop
- **THEN** the loop's bridges are drawn red on a board with
  `allowloops = false`, and closing a loop is not what turns anything red on a
  board that allows loops

### Requirement: Rules: Bridges findMistakes reports every span the unique solution contradicts

`findMistakes` SHALL solve the board again from its island clues and return
every span whose player marks that solution contradicts: a bridge where the
solution has none, a count exceeding the solution's, or a limit below the
solution's count, the cross included. It SHALL also return every island marked
complete short of its count.

#### Scenario: A wrong bridge is flagged

- **WHEN** the player places a bridge the unique solution does not contain,
  without yet over-committing an island
- **THEN** `findMistakes` includes that bridge

#### Scenario: An island marked complete too soon

- **WHEN** an island is marked complete while it has fewer bridges than its
  count
- **THEN** `findMistakes` returns that island, and the same mark on the island
  once its bridges are all drawn returns nothing

### Requirement: Rules: Bridges lets the player limit a span

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

### Requirement: Rules: A Bridges limit never drops below the bridges drawn

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

### Requirement: Params: Bridges takes its params, their encoding and its label words from its declarations

Bridges' params (a size, a bridge limit, an island and an expansion
percentage, whether loops are allowed, and a tier), their bounds, encoding and
label words SHALL be those its `paramConfig` and its declared codec give
(`engine-params`, "A game declares its params encoding once, and both codec
halves are derived"), and its menu what `presets` builds. A string that leaves
out the tier, the island percentage or the expansion SHALL decode with each as
`defaultParams` has it: Easy, 30% and 10%.

#### Scenario: A short form drops the tier

- **WHEN** `10x10m2L`, the short form of the preset `10x10i30e10m2Ld1`, is
  decoded
- **THEN** it is a 10×10 board with two bridges a line and no loops, at Easy,
  30% islands and 10% expansion, as `defaultParams` has the three it leaves out

### Requirement: Params: Bridges refuses a tier that so few islands cannot need

When a board is to be dealt above Easy, `validateParams` SHALL refuse, as a
board with no such puzzle, one whose island target (the percentage of its
squares, and never under three) is three; at Tricky one of four, or of five
with two bridges a line and no loops made; and at Normal with one bridge a
line one of five or fewer, or one with loops allowed and 100% expansion. No
loops are made where loops are disallowed or the expansion is 0%.

#### Scenario: Four islands at Tricky

- **WHEN** a 4×4 board at 25% islands, whose target is four, is asked for at
  Tricky and at Normal with two bridges a line
- **THEN** the first is refused with "No puzzle of 4 islands is Tricky." and
  the second is not refused

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given, in full, a board whose island target is
  three at a tier above Easy (e.g. `3×3` Normal at the default density)
- **THEN** it returns a non-null error string

### Requirement: Params: Bridges refuses a percentage past its last choice when dealing

When a board is to be dealt, `validateParams` SHALL refuse an island
percentage over 30 and an expansion over 100. A typed ID can carry one that
the engine's check of the field's choices lets by, the few values that fall
to the last choice; the engine refuses the rest, for a deal and for a board
that arrives with its description alike.

#### Scenario: Thirty-two percent islands

- **WHEN** the preset `7x7i30e10m2d0` is asked for with its `i30` written
  `i32`
- **THEN** it is refused with "%age of island squares must be between 1% and
  30%."

### Requirement: Description: A Bridges description that describes no board is refused

`newState` SHALL refuse a desc that overruns the grid or stops short of it,
that holds a character which is neither a count from 1 to 16 nor a run length,
that places two islands orthogonally next to each other, or that has fewer
than two islands.

#### Scenario: A malformed description is rejected

- **WHEN** a desc whose run-lengths overrun the grid is opened
- **THEN** it is refused

### Requirement: Description: A Bridges description gives its islands row-major, a count above nine as a capital letter

The desc SHALL encode the island positions and their bridge counts row-major:
a digit or letter gives an island with that count at the current cell, and a
run letter skips the empty cells between. An island's count SHALL be written
`1` to `9`, then `A` to `G` for 10 to 16. The description SHALL cover every
square of the grid, the empty ones after the last island included.

#### Scenario: A description round-trips

- **WHEN** a generated desc is parsed by `newState` and the islands re-encoded
- **THEN** the re-encoded desc equals the original

#### Scenario: A dealt 7×7 board

- **WHEN** `2d1c1a3a3a2a6a2h5b7b5g2b1b2` is opened as a 7×7 board
- **THEN** its top row holds a 2 in its first square and a 1 in its sixth, and
  its last square holds a 2
- **AND** with that last `2` written `H` it is refused for the character,
  where `G` is read as an island of 16

### Requirement: Generation: Bridges Easy runs the single-island deductions

Easy SHALL run stage 1: force the bridges an island must place because its
remaining count equals its available adjacent space, force one bridge to every
neighbor of an island whose count is more than the others could carry at the
bridge limit, and forbid bridges into a satisfied island.

#### Scenario: An island with exactly enough room is filled at Easy

- **WHEN** an island still needs two bridges and the spans around it have room
  for exactly two
- **THEN** the Easy solver draws both

### Requirement: Generation: Bridges Normal adds direction counting, loops and sealing off

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

### Requirement: Generation: Bridges Tricky adds the connected-group deductions

Tricky SHALL additionally run stage 3, the connected-group deductions beyond
sealing off: an "at most" limit on a span, a bridge that would leave some
island unable to reach its count, and a direction that must carry a bridge
because filling every other direction would seal a group off.

#### Scenario: An "at most" limit is Tricky's

- **WHEN** on a `maxb = 2` board one bridge on a span is safe and a second
  would finish its islands into a group cut off from the rest
- **THEN** the Tricky solver limits that span to one bridge, and the Normal
  solver does not

### Requirement: Solver: Bridges solves with a graded multi-stage deductive solver

The solver SHALL run the stages of its tier and no others, and SHALL be purely
deductive: it SHALL NOT guess and verify.

#### Scenario: A board the stages leave short

- **WHEN** the stages allowed at a tier stop with a span still undecided
- **THEN** the solver reports the board unsolved at that tier, having tried no
  bridge to see what follows

### Requirement: Solver: A Bridges solve ignores and lifts the player's limits

A from-scratch solve SHALL ignore the player's limits, as it ignores their
bridges, and Solve SHALL lift every limit the player wrote.

#### Scenario: Solve leaves no limit behind

- **WHEN** the player limits a span to one bridge on a `maxb = 2` board and
  then uses Solve
- **THEN** that span is no longer limited to one bridge on the solved board

### Requirement: Solver: Bridges grades a board the same however its islands are listed

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

### Requirement: Solver: An island's room along a span never grows as bridges are drawn

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

### Requirement: Controls: Bridges input drags bridges between islands

A left-drag from an island along its row or column to the next in-line island
SHALL add a bridge between them, or one more to those there, wrapping back to
zero once the span's limit is exceeded. The island the drag points at SHALL be
tracked as the pointer moves, and the move SHALL be committed on release. A
drag that does not run cleanly between two in-line islands SHALL be canceled
with no change. What a secondary drag does is "Controls: A secondary drag
lowers a Bridges span's limit by one".

#### Scenario: Dragging cycles the bridge count

- **WHEN** the player left-drags from an island to an in-line neighbor three
  times on a `maxb = 2` board
- **THEN** the bridge count between them goes 1, then 2, then 0

#### Scenario: An off-line drag is canceled

- **WHEN** the player starts a drag on an island and releases where no in-line
  island lies
- **THEN** the board is unchanged

#### Scenario: A drag that overshoots the canvas still draws

- **WHEN** a drag from an island toward its left neighbor runs on past the
  canvas's left edge and is released there
- **THEN** the bridge to that neighbor is drawn

### Requirement: Controls: Bridges has a keyboard cursor that drags

Cursor keys SHALL move a keyboard cursor, and a digit SHALL jump a shown
cursor to the nearest other island bearing that clue. `CURSOR_SELECT` SHALL grab a keyboard drag at
the cursor's island, for an arrow to carry out; a second `CURSOR_SELECT`, or
`CURSOR_SELECT2` with the cursor shown, SHALL drop it and toggle that island's
completed mark, the keyboard's way to mark one. Ctrl with an arrow SHALL drag a
bridge in one key, and Shift with an arrow the secondary drag.

#### Scenario: Select and an arrow draw a bridge

- **WHEN** the cursor is shown on an island with an in-line neighbor to its
  right, the span between them empty and free to take a bridge, and the
  player presses `CURSOR_SELECT` and then the right arrow
- **THEN** one bridge joins the two islands

#### Scenario: Select twice marks the island

- **WHEN** the cursor is shown on an island and `CURSOR_SELECT` is pressed
  twice with no arrow between
- **THEN** the second press makes the move that toggles the island's completed
  mark

### Requirement: Controls: A secondary drag lowers a Bridges span's limit by one

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

### Requirement: Controls: A Bridges arrow steps the cursor to the nearest island that way

A bare arrow SHALL move the keyboard cursor to an island in that direction:
the one least far to the side, and of those the nearest forward, never one
further to the side than forward. It SHALL leave the cursor where it is when
there is none. The letters `A` to `F`, in either case, SHALL
jump to an island of 10 to 15 as a digit does to one of its number, and `0`
to one of 16. `G`, in either case, SHALL switch the possible-bridge lines on
or off, as the `show-hints` preference does.

#### Scenario: The nearest island is off the cursor's row

- **WHEN** the cursor is on an island with no island to its right in its own
  row, and there is one a column to the right and a row down
- **THEN** Right moves the cursor to that island

### Requirement: Preferences: Bridges auto-marks satisfied islands (fork aid)

The `auto-mark-complete` preference of the game's `prefs` SHALL be on unless
set. When on, `redraw` SHALL draw an island whose bridge
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

### Requirement: Preferences: Bridges offers a show-hints preference for possible bridges

With the `show-hints` preference of the game's `prefs` on, `redraw` SHALL draw
a faint line along every span between two in-line islands that carries neither
a bridge nor a cross, in the possible-bridge color, which is not a hint color.

#### Scenario: The show-hints preference toggles the possible-bridge lines

- **WHEN** the `show-hints` preference is turned on
- **THEN** the renderer draws possible-bridge lines that are absent when it is
  off

### Requirement: Hint: A Bridges hint's ladder is capped at the board's own difficulty

The hint's ladder SHALL be capped at the board's own difficulty and not at the
top rung, since that is the tier the generator certified it soluble at.

#### Scenario: An Easy board is not handed a harder argument

- **WHEN** a hint is requested on a board dealt at Easy
- **THEN** every step of its plan is the single-island arithmetic

### Requirement: Hint: One Bridges firing is one hint step

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

### Requirement: Hint: A Bridges hint step is followed one drag at a time

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

### Requirement: Hint: Bridges hint resumes from the player's marks

The hint's working copy SHALL resume from the player's marks and SHALL NOT
clear them. It SHALL first mark as complete every island whose bridges already
meet its clue, so a resumed position is the position the certified ladder was
certified on.

#### Scenario: An island the player filled and did not mark

- **WHEN** the player has drawn every bridge of an island, left it unmarked,
  and asks for a hint
- **THEN** the plan is deduced from a board on which that island is complete,
  and from the player's bridges, crosses and limits as they stand

### Requirement: Hint: Bridges hint hides the bookkeeping mark

Every change a rung makes SHALL be recorded, and the plan SHALL apply to its
working board, but never show, a firing that declares no reason. Exactly one
rule SHALL declare none: stage 1's marking as complete of an island that now
has all its bridges, which is bookkeeping the auto-mark aid already draws and
the win condition does not read.

#### Scenario: A bookkeeping mark is never a step

- **WHEN** a deduction satisfies an island and the solver marks it complete
- **THEN** no step in the plan asks the player to mark it, and the plan still
  reaches a solved board

### Requirement: Hint: No Bridges hint step leans on a fact the player cannot see

No step SHALL lean on a fact the player cannot see. The limit stage 3 derives
is a mark the player can write ("Rules: Bridges lets the player limit a
span"), so the hint SHALL write it as a step of its own, and the board the
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

### Requirement: Hint: A Bridges firing carries which cause forced it

Where a rung can be forced by more than one cause, the firing SHALL carry
which. Stage 3's limit SHALL be narrated as a finished group sealed off or as a
named island left short of its clue.

#### Scenario: A limit forced by a starved island says so

- **WHEN** stage 3 limits a span because one more bridge there would leave
  another island unable to reach its count, and would seal no group off
- **THEN** the step's sentence is about that island left short, and that
  island is the one the step marks as counted

### Requirement: Hint: Bridges marks a hint in its own vocabulary

A step's marks SHALL be drawn as the game's own shapes recolored, because
neither element a Bridges deduction points at is a cell: an island is a circle
wider than its own tile, and a bridge is a span between two islands, which is
no cell's border. No mark SHALL come from `engine/hint-mark.ts`, whose every
mark is a band on a cell's border box.

#### Scenario: Raising a span leaves the bridges already there in board ink

- **WHEN** a step raises a span that already carries a bridge
- **THEN** the frame draws the bundle at the new count with only the added bars
  in the action color

### Requirement: Hint: A Bridges hint asks its stages in order after every step

The hint SHALL ask its stages in this order and take the first that fires,
starting again from the first after each firing: the single-island
arithmetic; from Normal the direction counting with its loop check, then
sealing off; from Tricky the connected-group deductions. Within a stage it
SHALL take the islands in the order the description lists them.

#### Scenario: An Easy deduction is spoken before a Normal one

- **WHEN** on a Normal board one island has exactly enough room left, and
  another needs a bridge one way by counting its other directions
- **THEN** the step is the first island's

### Requirement: Hint: A Bridges hint refuses where its deduction contradicts itself

Where the deduction contradicts itself on a board `findMistakes` finds nothing
wrong with, `hint` SHALL refuse outright and SHALL show no step it derived on
the way.

#### Scenario: A contradiction with no entry to blame

- **WHEN** the stages run into a contradiction on a board whose mistake check
  reports nothing, which can only be a board Solve cannot finish
- **THEN** the hint refuses, and shows no step it derived on the way

### Requirement: Hint: A Bridges hint recolors an island's rim and clue digit as an outline

An island SHALL be marked by recoloring its own rim and clue digit, which is a
ring and not a fill, in `COL_HINT_CELL`: the island a sentence names is a
reference of its own, and the islands it merely counts another. A premise
that counts a group the island belongs to, and does not name the island,
SHALL mark every member alike, so "these N islands" points at N marks of one
reference and not at one mark of each.

#### Scenario: A sealed group is marked as one reference

- **WHEN** a step blocks a bridge because it would shut a group of islands
  into a finished group of their own
- **THEN** every island of that group, the one the bridge would start from
  included, is recolored as one reference

#### Scenario: A hint explains an island with exactly enough room left

- **WHEN** an island's remaining count equals the bridges it can still take and a
  hint is requested
- **THEN** the step's narration states that count, its move draws exactly that
  many bridges, and the island it names is the one the hint recolors

### Requirement: Look: Every Bridges mark is in the tile diff key

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

### Requirement: Look: A Bridges limit is drawn as ≤n at the middle of its span

A limit SHALL be drawn as `≤n` on a patch of background at the middle square of
its span, in the span's own color, so it reads over a bridge already drawn
through that square and turns red with the span when `findMistakes` flags it.

#### Scenario: A limit on a bridged span is read over the bridge

- **WHEN** a span that carries one bridge is limited to one on a `maxb = 2`
  board
- **THEN** its middle square is repainted with "≤1" on a patch of background
  over the bridge, in the color the bridge is drawn in

### Requirement: Look: Bridges tells a settled island by a lifted face

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

### Requirement: Look: A settled Bridges island keeps its rim, count and bridges in ink

An island's rim, its count and the bridges SHALL stay in ink whether or not the
island is settled, and the board between islands SHALL stay the board.

#### Scenario: Only the face changes when an island is marked

- **WHEN** the player marks an island completed and nothing about it is in
  error
- **THEN** its rim and count are drawn in ink as before, and the squares
  between islands are the board's own background

### Requirement: Look: Bridges renders islands, bridges, marks, a drag's preview and the win flash

The renderer SHALL draw islands as circles bearing their count, bridges, the
no-line and completed-mark indicators, the keyboard cursor as a wash on its
island's face, and the win flash. While a drag points at an island it SHALL
recolor the two islands' rims and draw the span between them as the release
would leave it, in the same color, derived from the move the release plays.
A drag that points at no island SHALL recolor its own island's rim alone.

#### Scenario: The cursor is on the island's face

- **WHEN** the keyboard cursor is shown on an island that has no error
- **THEN** that island's face is the cursor wash, and its rim and count stay in
  ink

#### Scenario: A drag over an empty span previews the bridge

- **WHEN** a drag from an island points at an in-line neighbor across a span
  that carries no bridge, and has not been released
- **THEN** the rims of the two islands are recolored and one bridge is drawn
  between them in the same color

#### Scenario: A drag that would remove shows the span empty

- **WHEN** a drag points along a span that carries as many bridges as its
  limit allows
- **THEN** no bridge is drawn on the span while the drag points there, and
  the bridges are drawn again in ink if the drag turns away

#### Scenario: A secondary drag previews the limit it would write

- **WHEN** a secondary drag points along a span with no limit on a `maxb = 2`
  board
- **THEN** `≤1` is drawn mid-span in the drag's color, and along a span
  already limited to one with no bridge the pair of crosses is drawn instead

#### Scenario: A drag that turns leaves no trail

- **WHEN** a drag that pointed at one island turns to point at another
- **THEN** the first span is drawn as the board has it and the second carries
  the preview
