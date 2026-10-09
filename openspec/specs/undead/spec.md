# undead Specification

## Purpose
Undead, the puzzle of filling a mirrored grid with ghosts, vampires and zombies
to given totals so that each edge count matches the monsters visible along its
sightline, a ghost counting only after a reflection and a vampire only before
one. Every cell is a fixed diagonal mirror or a monster cell, and the player
places one monster in every monster cell. This capability specifies what is the
game's own: its params and description formats, the sightline rule, what the
generator promises of a board at each tier, its controls, its live legality
errors and mistake check, how it looks, and an explained deduction hint that
stops, rather than searches, where deduction runs out.

## Requirements

### Requirement: Undead's parameters and their encoding

Params SHALL be `w`, `h` and `diff`, a tier of Easy, Normal or `Unreasonable`
held as the values `"easy"`, `"normal"` and `"tricky"`. They SHALL encode as
`{w}x{h}` without `full` and as `{w}x{h}d{c}` with `full`, `c` being `e`, `n`
or `t`.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 5, h: 5, diff: "tricky" }` (the `Unreasonable` tier) are
  encoded with `full = true`
- **THEN** the result is `5x5dt`
- **AND** decoding it round-trips the params
- **AND** encoding with `full = false` yields `5x5`

### Requirement: Undead's top tier is Unreasonable and keeps the letter t

The top tier SHALL be named `Unreasonable`, because its boards can require the
forcing rung, which runs the deduction fixpoint from a hypothesis: a search from
the player's side, which is what the name is reserved for. Its difficulty
character SHALL stay `t`, so an existing game ID names the same board. The two
lower tiers SHALL be plain deduction.

#### Scenario: A game ID with the letter t

- **WHEN** the params string `5x5dt` is decoded
- **THEN** it names the top tier, which the difficulty choice shows as
  `Unreasonable`

### Requirement: Undead's parameter limits

Width and height SHALL each declare a minimum of 3 in `paramConfig`, which the
engine's params check refuses below, and `validateParams` SHALL refuse
`w·h > 54`. A difficulty letter the encoding does not know SHALL decode as the
default tier.

#### Scenario: Invalid params are rejected

- **WHEN** params with `w < 3`, `h < 3` or `w·h > 54` go through the engine's
  params check
- **THEN** it returns a refusal sentence

### Requirement: Undead descriptions encode totals, the mirror grid, and sightline clues

The desc SHALL consist of the three monster totals (`ghosts,vampires,zombies`),
followed by a comma and a grid specification, followed by `2·(w + h)`
comma-prefixed sighting clues. The grid SHALL encode the `w·h` interior cells
in reading order: a run of empty monster cells as a single letter (`a`–`z` for
a run of 1–26), a mirror as `L` (`\`) or `R` (`/`), and a hand-fixed monster as
`G`, `V` or `Z`.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is generated and its desc decoded by `newState`
- **THEN** the mirror layout, monster totals, and sighting clues match what was
  encoded

### Requirement: A malformed Undead description is refused

Reading a description SHALL refuse one with fewer than three leading counts, an
invalid grid character, a grid that does not fill exactly `w·h` cells, a number
of monster cells that differs from the sum of the totals, the wrong number of
sightings, or trailing data.

#### Scenario: Malformed description is rejected

- **WHEN** a description with an invalid grid character, an under- or over-full
  grid, a monster count mismatch, or the wrong number of sightings is read
- **THEN** the engine's description verdict is a non-null error

### Requirement: Undead traces sightlines through the mirror maze

A sightline SHALL start from each of the `2·(w + h)` edge positions (clockwise
from the top-left) and follow a straight path that reflects at each `\` or `/`
mirror until it exits at another edge position. Each line SHALL carry a
sighting clue at both of its ends.

#### Scenario: A column with no mirror

- **WHEN** the line entering at the top of a column that holds no mirror is
  traced
- **THEN** it ends at the bottom edge position of that column, with every cell
  of the column as its monster cells in order

### Requirement: A monster's visibility depends on its type and the reflections before it

A monster's contribution to a sighting count SHALL depend on its type and the
line segment it stands on: a vampire SHALL count only on the segment before any
reflection, a ghost only on a segment after at least one reflection, and a
zombie always.

#### Scenario: Reflected and direct visibility

- **WHEN** a sightline passes a vampire before any mirror and a ghost after a mirror
- **THEN** the sighting count entering at that end includes both
- **AND** the sighting count entering from the opposite end (where the vampire is
  now post-reflection and the ghost pre-reflection) excludes both

### Requirement: Undead solves and generates uniquely-solvable graded boards

`newDesc` SHALL generate a grid of random mirrors and monster cells, rejecting
a grid that is too sparse or too dense in monster cells, or that has a
sightline over the tier's length limit. Every generated board SHALL be uniquely
solvable, verified against the brute-force oracle independently of the grading
ladder.

#### Scenario: Generated board is unique

- **WHEN** `newDesc` returns a board for a given size and difficulty
- **THEN** the brute-force oracle confirms exactly one solution

### Requirement: Undead grades a board by the rung of the ladder it requires

`newDesc` SHALL grade a board by which rung of the deductive ladder is
required: arc-consistency, counting, or forcing. A board's tier SHALL be the
highest rung the ladder needed: Easy for arc-consistency within the pass cap,
Normal for arc-consistency beyond the cap or for counting, and `Unreasonable`
for forcing.

#### Scenario: Generated board is on-difficulty

- **WHEN** `newDesc` returns a board for a given size and difficulty
- **THEN** the deductive ladder solves it uniquely with no recursion
- **AND** the board's grade matches the highest rung the ladder needed

### Requirement: Every Undead board is solved by the ladder without recursion

Every board Undead accepts SHALL be solvable by the deductive ladder alone
(arc-consistency, counting and depth-1 forcing), with zero guessing or
recursion, at every tier. A board that requires recursion (nested
hypothesizing) SHALL be rejected at generation. The forcing rung hypothesizes
one candidate and runs the arc-consistency and counting fixpoint from it, which
is not nested recursion.

#### Scenario: Every tier is free of nested recursion

- **WHEN** any board is accepted for any tier (Easy, Normal, `Unreasonable`)
- **THEN** the deductive ladder (arc-consistency + counting + depth-1 forcing) solves
  it to completion without invoking the brute-force/recursive search

### Requirement: Undead supports monster, pencil, and clue moves with a cursor

`interpretMove` SHALL support a keyboard and mouse highlight cursor that
selects a monster cell. In the highlighted cell it SHALL place a Ghost, Vampire
or Zombie (`G`/`V`/`Z` or `1`/`2`/`3`, or a click on the corresponding count
block) and clear the cell (`E`/`0`/Backspace). In pencil mode (a right-click or
the cursor pencil toggle) it SHALL toggle a pencil note.

#### Scenario: Place and clear a monster

- **WHEN** the player highlights an empty monster cell and places a Zombie, then
  clears it
- **THEN** the cell holds a Zombie after the first move and is undecided after the
  second

#### Scenario: Pencil-mark UX

- **WHEN** the player turns on sticky pencil mode and notes a monster in one
  empty cell and then in another
- **THEN** each note toggles without leaving pencil mode
- **AND** a CapsLock-style indicator shows pencil mode is active

### Requirement: Undead's Mark-all fills the cells that have no notes

A mark-all action (`M`/`m`) SHALL fill every undecided cell that carries no
notes with all three candidate notes. It SHALL leave a placed cell, and a cell
whose notes the player has narrowed, unchanged.

#### Scenario: Mark-all fills candidate notes

- **WHEN** the player invokes mark-all on a board with some empty cells, one of
  them already narrowed to two notes
- **THEN** every undecided cell without notes gains all three candidate notes
- **AND** the narrowed cell and already-placed cells are unchanged

### Requirement: A click on a sighting clue strikes it through

A click on an edge sighting clue SHALL toggle a strike-through "done" mark on
that clue.

#### Scenario: A clue is struck and restored

- **WHEN** the player clicks an edge clue, and then clicks it again
- **THEN** the clue is marked done after the first click and not after the
  second

### Requirement: Undead refuses edits to fixed cells and records no empty move

Fixed cells SHALL reject monster, clear and pencil edits. A move that would not
change state SHALL return no history entry.

#### Scenario: A given monster cannot be edited

- **WHEN** the player tries to place a monster in, or clear, a fixed (given)
  monster cell
- **THEN** both edits are rejected

#### Scenario: Typing what is already there

- **WHEN** the player types the letter of the monster the highlighted cell
  already holds
- **THEN** no history entry is made

### Requirement: Undead is solved when the grid is full and every count holds

The game SHALL be solved when every monster cell is filled and all counts and
sightings are satisfied.

#### Scenario: The last monster goes in

- **WHEN** a move fills the last monster cell so that the three totals and
  every sighting clue hold
- **THEN** the game's status is solved

### Requirement: Undead shows live legality errors

Every move SHALL bring the live legality flags up to date. A monster type whose
placed count exceeds its total, or differs from it once the grid is full, SHALL
flag that count and every placed cell of that type. A sightline whose placed
monsters already exceed its clue, or whose clue can no longer be reached even
by filling every blank, SHALL flag the clue and every cell of the line.

#### Scenario: A sightline that can no longer reach its clue

- **WHEN** the monsters placed on a line leave fewer visible, even with every
  blank on it counted, than a clue at one end asks for
- **THEN** that clue and every cell of the line are flagged

### Requirement: Undead paints a flagged count and a flagged clue red

`redraw` SHALL paint a flagged count block and a flagged sighting clue in the
error color. A flagged cell is tracked for repaint and is not recolored.

#### Scenario: Over-placing a monster type reddens it live

- **WHEN** the player places more zombies than the zombie total
- **THEN** the zombie count renders in the error color

### Requirement: Undead's findMistakes compares the board with its unique solution

The game SHALL implement `findMistakes`: re-solving the board to its unique
solution and returning every placed cell that contradicts it, plus every empty
cell whose non-empty pencil notes have crossed out its solution monster. The
solution SHALL be derived from the description clues only, never from the
player's notes.

#### Scenario: Check & Save flags a wrong placement

- **WHEN** the player places a monster that contradicts the unique solution and
  invokes Check & Save
- **THEN** `findMistakes` reports that cell
- **AND** the save is blocked
- **AND** an empty cell whose notes have crossed out its solution monster is also
  reported, while a cell with merely extra notes is not

### Requirement: Undead renders monsters, mirrors, counts, and sightline hints

`redraw` SHALL draw the monster-count row at the top, three blocks G/V/Z; the
sighting clue numbers around the grid edge, dimmed when struck through and red
on error; and each interior cell as a mirror (a thick diagonal), a placed
monster (a drawn ghost, vampire or zombie shape, or the letter G, V or Z when
the letters display is selected), or a 2×2 grid of pencil notes.

#### Scenario: A struck clue that is also in error

- **WHEN** a clue the player struck through is flagged by the live legality
  check
- **THEN** it is drawn red, not dimmed

### Requirement: Undead's count blocks follow the selected count style

A count block's number SHALL follow the selected count-display style: Total,
Remaining, Placed/Total, or Left/Total (remaining to place over total, e.g.
`3/8`), which SHALL be the default. The number SHALL be dimmed when its type is
complete (0 left) and red on error.

#### Scenario: The default style dims a finished type

- **WHEN** a board is opened with no preference set and every ghost is placed
- **THEN** the ghost block reads in the Left/Total style and is dimmed to gray,
  0 remaining to place

### Requirement: Undead's count style and monster display are preferences

A monster-count display style and a pictures-or-letters monster display SHALL
both be available as preferences. The monster display SHALL also be an in-play
toggle; the count style has no in-play toggle.

#### Scenario: Count-style and letters toggles

- **WHEN** the player chooses another count-display style in the preferences
  dialog and toggles the letters display in play
- **THEN** the count blocks re-render in the new style and monsters render as letters
- **AND** the letters option is also available through the preferences dialog

### Requirement: Undead explained deduction hint

The hint SHALL be purely deductive: it SHALL NOT reveal the known solution and
SHALL NOT narrate a guess or backtracking search. On the two tiers below
`Unreasonable`, a freshly computed plan SHALL solve the board from empty, and
following hints one move at a time SHALL reach a solved board.

#### Scenario: The plan reaches a solved board from any mistake-free position

- **WHEN** a hint is asked repeatedly from a mistake-free board on any shipped
  non-`Unreasonable` tier, each time applying only the first step and recomputing
- **THEN** every hint makes progress (never a no-op and never "give up") and the
  sequence reaches the solved board using only deductive steps (no solution reveal,
  no guess)

#### Scenario: Naked single is surfaced first as a placement

- **WHEN** an undecided cell's surviving candidates have collapsed to a single monster
- **THEN** the hint places that monster (a `set` move) before any elimination step,
  explaining that only that monster keeps the cell consistent

#### Scenario: Total exhaustion is narrated honestly, not as a sightline

- **WHEN** every monster of one type permitted by the totals is already placed and an
  undecided cell still lists that monster as a candidate
- **THEN** the hint emits a `total` strike of that monster from every still-undecided
  cell as one journey, explaining that the type's full count is already placed
- **AND** the narration does not claim a sightline forced the elimination

### Requirement: The forcing rung never reaches an Undead hint

The forcing rung is a search: it assumes a candidate and runs the
arc-consistency and counting fixpoint from it. The hint's recorder SHALL NOT
emit it on any tier, while the solver SHALL retain it, so that grading and
generation are the same with the hint as without.

#### Scenario: The forcing rung never reaches a narration

- **WHEN** hint plans are recorded across every tier and many seeds
- **THEN** no recorded deduction is a forcing one, on any tier

### Requirement: An Unreasonable board's hint stops where deduction stops

On an `Unreasonable` board the plan SHALL stop where deduction stops, and the
hint SHALL then refuse with a message saying so, stating the consequence and
not hiding it. The game's tests SHALL assert both bounds, that such a plan
never reaches a solved board and that it is not empty from the first move, so
neither failure passes quietly.

#### Scenario: An Unreasonable board's hint stops rather than searching

- **WHEN** a player follows hints one move at a time on an `Unreasonable` board
- **THEN** the hints continue while deduction does, and then refuse with a
  message saying deduction has run out
- **AND** the plan neither reaches a solved board nor is empty from the start

### Requirement: A sightline step speaks of the line and its two clues

A sightline step's words SHALL name the sightline and its two clues and say
which monsters they leave no room for in the cell. They SHALL read correctly at
the degenerate clue values, from a count of zero up to the line's full monster
count. The sighting rule itself is taught by the game's help page and is not
restated in the step.

#### Scenario: A sightline elimination is taught as one journey

- **WHEN** a player asks for a hint on a mistake-free Undead board where a path's
  count clues rule a monster value out of one or more of the path's cells, and no
  naked single or total exhaustion is available
- **THEN** the hint returns a journey whose legs strike that monster from those cells
  (one leg per cell, continuation legs flagged `continuesPrevious`), every struck mark
  lying on the narrated path
- **AND** the first leg's explanation names the sightline and its two clues

### Requirement: Undead's hint conclusions use the necessity voice

A hint's conclusions SHALL use the necessity voice: a strike "must cross
out …", a placement "can only be …".

#### Scenario: A strike and a placement

- **WHEN** one hint step strikes a candidate and another places a monster
- **THEN** the first says the player "must cross out" the candidate and the
  second that the cell "can only be" the monster

### Requirement: Undead's pencilStrike clears candidate bits atomically

The game's move set SHALL include a `pencilStrike` move that atomically clears
a list of candidate bits across cells, idempotent and resume-safe, used by the
hint for a multi-strike firing. The single-bit `pencil` toggle and the fill-all
`markAll` move SHALL stay beside it.

#### Scenario: A strike applied twice

- **WHEN** the same `pencilStrike` is executed on a board and then again on the
  result
- **THEN** the second leaves the notes as the first left them, re-adding none

### Requirement: Undead's hint takes no auto-pencil preference

The hint SHALL NOT add an auto-pencil preference and SHALL ignore the optional
`ui` argument, because Undead has no trivial (non-teachable) elimination to
fold away.

#### Scenario: The same board under two Ui states

- **WHEN** a hint is asked for one board with pencil mode off and again with it
  on
- **THEN** the two plans are the same

### Requirement: Undead's hint marks follow the element-type color legend

The hint SHALL render with `COL_HINT` (the placement target or acted-on
marking) and `COL_HINT_CELL` (the sightline evidence) in the palette, following
the element-type color legend. The placement target SHALL be ringed in
`COL_HINT` with no pre-rendered monster glyph, and the sightline evidence SHALL
be outlined in `COL_HINT_CELL`. Both marks SHALL sit on the cell's edge, over
the grid line.

#### Scenario: A sightline step on screen

- **WHEN** a leg of a sightline journey is shown
- **THEN** the whole sightline, mirrors included, is outlined as the evidence
  area while the leg targets a single cell, which is ringed and still shows its
  notes

### Requirement: A struck candidate stays legible

A candidate a hint step strikes SHALL be drawn in its normal pencil color with
a strikethrough, on a background that is not `COL_HINT`, so it stays legible.

#### Scenario: A hint is dismissed

- **WHEN** a step that struck a candidate stops being shown and no move was
  made
- **THEN** the cell repaints with the candidate drawn as an ordinary note

### Requirement: Undead provides on-screen key labels

Undead SHALL implement `requestKeys()` returning four keys in this order: its
three monster-entry keys, `G` labeled `"Ghost"`, `V` labeled `"Vampire"` and
`Z` labeled `"Zombie"`, followed by a clear key (button code `8`, labeled
`"Clear"`). The keys SHALL carry the monster letters whichever of the pictures
and letters displays is selected.

#### Scenario: The keypad is the three monsters plus clear

- **WHEN** the key labels are requested for any Undead board
- **THEN** the result is exactly the buttons `G` ("Ghost"), `V` ("Vampire"),
  `Z` ("Zombie"), and a clear key

### Requirement: Undead draws its cells on a quiet surface and lifts what is fixed

`redraw` SHALL draw every cell the player fills on the collection's cell
surface, with the collection's surface grid line between cells and a frame
round the grid no heavier than that line. A cell holding a mirror, and a cell
holding a monster the puzzle fixed, SHALL sit on the collection's lifted
surface of a given. A monster SHALL be the same drawing on either surface, and
a mirror SHALL stay in ink.

#### Scenario: A mirror is told by the cell under it

- **WHEN** the opening frame of a generated board is drawn
- **THEN** every mirror's cell is the lifted surface and every empty cell is
  the plain cell surface

#### Scenario: The frame is a grid line

- **WHEN** the opening frame is drawn
- **THEN** the line round the grid is one pixel of the surface's grid line, as
  the line between two cells is
