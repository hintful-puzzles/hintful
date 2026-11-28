## MODIFIED Requirements

### Requirement: Params: Undead's top tier is Unreasonable and keeps the letter t

The top tier SHALL be named `Unreasonable`, because its boards may need a
search by trial and error over the deductions, which is what the name is
reserved for; it SHALL be the board one answer the search proves and Normal
cannot finish. Its difficulty character SHALL stay `t`, so an existing game
ID names the same tier. The two lower tiers SHALL be plain deduction.

#### Scenario: A game ID with the letter t

- **WHEN** the params string `5x5dt` is decoded
- **THEN** it names the top tier, which the difficulty choice shows as
  `Unreasonable`

### Requirement: Description: Undead descriptions encode totals, the mirror grid, and sightline clues

The desc SHALL consist of the three monster totals, a comma and the grid,
and `2·(w + h)` comma-prefixed sighting clues, clockwise round the grid
from the top left. The grid SHALL encode the `w·h` cells in reading order:
a run of empty cells as one letter (`a`–`z` for 1–26), and a mirror as `L`
(`\`) or `R` (`/`); a monster fixed in the grid SHALL be refused. An empty sighting SHALL be read as a clue the board does not show.

#### Scenario: Description round-trips through generate and decode

- **WHEN** a board is dealt and its desc read back
- **THEN** the mirror layout, monster totals, and sighting clues match what was
  encoded, and it writes back as the same desc

#### Scenario: A fixed monster

- **WHEN** a desc whose grid holds a `G` is read
- **THEN** it is refused, naming the `G`

### Requirement: Description: A malformed Undead description is refused

Reading a description SHALL refuse one with fewer than three leading counts,
an invalid grid character, a grid that does not fill exactly `w·h` cells, a
sighting out of range, the wrong number of sightings, or trailing data; and
one whose totals or sightings no filling of its monster cells meets SHALL be
refused as contradictory.

#### Scenario: Malformed description is rejected

- **WHEN** a description with an invalid grid character, an under- or
  over-full grid, totals that do not sum to its monster cells, or the wrong
  number of sightings is read
- **THEN** the engine's description verdict is a non-null error

### Requirement: Generation: Undead solves and generates uniquely-solvable graded boards

The deal SHALL place mirrors at random, rejecting a grid too sparse or too
dense in monster cells, fill the sightlines first and keep the clues its tier
needs. Every dealt board SHALL have one answer, proved by the engine's search
independently of the grading ladder.

#### Scenario: Generated board is unique

- **WHEN** a board is dealt for a given size and difficulty
- **THEN** the search confirms exactly one answer

### Requirement: Generation: Undead grades a board by the rung of the ladder it requires

A board SHALL be graded by the techniques `undead.description.yaml` states,
and then by the search. A board's tier SHALL be the highest the ladder
needed: Easy where `single` and `sightline` solve it within the passes
Easy's `most` allows; Normal where it needs more passes or a monster's count
(`total`); and `Unreasonable` where Normal cannot finish it and the search
proves one answer. The order sightlines are tried in SHALL be fixed, since
the passes an Easy board takes depend on it.

#### Scenario: Generated board is on-difficulty

- **WHEN** a board is dealt at Easy or Normal
- **THEN** the ladder capped at that tier solves it with no search
- **AND** the ladder capped one tier lower does not

#### Scenario: Sightlines are tried in a fixed order

- **WHEN** a sightline pass runs
- **THEN** it tries the sightlines from the one with the fewest monster cells up
- **AND** those of one length in clockwise order round the grid from the top left

### Requirement: Generation: Every Undead board is solved by the ladder without recursion

Every Easy and Normal board SHALL be solvable by the ladder alone, with no
search. An `Unreasonable` board SHALL be one the ladder capped at Normal
leaves unfinished and the search proves has one answer.

#### Scenario: Every tier is free of nested recursion

- **WHEN** any board is accepted for Easy or Normal
- **THEN** the ladder solves it to completion without invoking the search
- **AND** a board accepted for `Unreasonable` is one the search proves has
  one answer

### Requirement: Solver: Undead's solver is a certified deduction ladder

Undead's rungs SHALL be the ladder `undead.description.yaml` states, its
hint's and its grading's alike. Each technique SHALL be checked sound, and a
planted defect of each found unsound. Above the ladder SHALL be the engine's
search, the same as every born game's.

#### Scenario: A silenced technique fails

- **WHEN** every solve of the census is capped at Easy
- **THEN** the census reports `total` as never fired

### Requirement: Controls: Undead supports monster, pencil, and clue moves with a cursor

The keyboard and mouse highlight cursor SHALL select a monster cell. In the
highlighted cell a key SHALL place a Ghost, Vampire or Zombie (`G`/`V`/`Z` or
`1`/`2`/`3`, or a click on the monster's count beneath the grid) and clear
the cell (`0`, Backspace, Space or Delete); typing the monster a cell
already holds SHALL leave it. In pencil mode it SHALL toggle a pencil note.
Shift or Ctrl with an arrow SHALL mark done the clue at that end of the
cursor's row or column.

#### Scenario: Place and clear a monster

- **WHEN** the player highlights an empty monster cell and places a Zombie,
  then clears it
- **THEN** the cell holds a Zombie after the first move and is undecided
  after the second

### Requirement: Preferences: Undead's count blocks follow the selected count style

A count's number SHALL follow the selected count-display style: Total,
Remaining, Placed/Total, or Left/Total (remaining to place over total, e.g.
`3/8`), which SHALL be the default. The number SHALL be gray when every
monster of its kind is placed and red on error.

#### Scenario: The default style dims a finished type

- **WHEN** a board is opened with no preference set and every ghost is placed
- **THEN** the ghost count reads in the Left/Total style and is gray, 0
  remaining to place

### Requirement: Hint: Undead's hint is a plan of the game's own

Undead's hint SHALL be the candidate walk of the collection's boards of
notes, over the techniques its description states: the singles, the
monster counts (`total`) and the sightlines (`sightline`), run on the
player's pencil marks.

#### Scenario: Naked single is surfaced first as a placement

- **WHEN** an undecided cell's surviving candidates have collapsed to a
  single monster
- **THEN** the hint places that monster before any elimination step, saying
  every other monster has been ruled out there

#### Scenario: Total exhaustion is narrated honestly, not as a sightline

- **WHEN** every monster of one type permitted by the totals is already
  placed and an undecided cell still lists that monster as a candidate
- **THEN** the hint strikes that monster from every still-undecided cell,
  saying none of them are left to place
- **AND** the narration does not claim a sightline forced the elimination

### Requirement: Hint: A sightline step speaks of the line and its two clues

A sightline step's words SHALL name the sightline and its clues and say
which monsters they leave no room for in the cell, the sightline striped and
its clues outlined. They SHALL read correctly at the degenerate clue values,
from a count of zero up to the line's full monster count, and where one of
its two clues is not shown. The sighting rule itself is taught by the game's
help page and is not restated in the step.

#### Scenario: A sightline elimination is taught as one journey

- **WHEN** a player asks for a hint on a mistake-free Undead board where a
  sightline's clues rule a monster out of one or more of its cells, and no
  single or count applies
- **THEN** the hint returns a journey whose legs strike that monster from
  those cells, every struck mark lying on the striped sightline
- **AND** the first leg's explanation names the sightline and its clues

### Requirement: Hint: Undead's hint conclusions use the necessity voice

A hint's conclusions SHALL use the necessity voice: struck monsters "must
go", a placement "can only be" the monster, with its article.

#### Scenario: A strike and a placement

- **WHEN** one hint step strikes a vampire and another places a ghost
- **THEN** the first says the struck vampire must go and the second that the
  square can only be a ghost

### Requirement: Hint: A ringed Undead cell shows no monster ahead of the move

What the ring, the stripes and the outline of a step stand for SHALL be the
legend's (`hint.marks`). The cell a step places in SHALL be ringed with no
pre-rendered monster glyph.

#### Scenario: A sightline step on screen

- **WHEN** a leg of a sightline journey is shown
- **THEN** the sightline's squares are striped and its clues outlined, while
  the leg targets a single cell, which is ringed and still shows its notes

### Requirement: Hint: Undead's hint fills a cell when a monster has exactly the cells it needs

When the empty cells that can still hold a monster number exactly those of
it left to place, the hint SHALL place it, ringing the square, with the
words "Exactly as many squares can still hold a ghost as there are ghosts
left to place" and "this square can only be a ghost", in the monster's name.
What a cell can hold SHALL be read off the board: the monsters its pencil
marks list.

#### Scenario: Two cells left for two vampires

- **WHEN** the total is three vampires, one is placed, and exactly two empty
  cells have a vampire among their pencil marks, every other empty cell being
  marked without one
- **THEN** a step places a vampire in one of the two, and a later one places
  one in the other

#### Scenario: A count the board does not show yet

- **WHEN** a hint is asked on a board as dealt, with no pencil marks, where
  the clues leave a monster exactly the cells it needs
- **THEN** no step places by that count until the strikes that leave those
  cells have each been shown and made

### Requirement: Hint: Undead's hint pencils every monster in before its first strike

A strike crosses out pencil marks, so before the first strike of a plan the
hint SHALL give one step that pencils all three monsters into every empty
cell with no marks, by the Mark-all move, saying "Start by penciling every
candidate monster into each empty square." It SHALL give that step only when
some empty cell has no marks, and a cell the player has narrowed SHALL keep
its marks.

#### Scenario: A board already marked

- **WHEN** a hint is asked on a board whose every empty cell carries a
  pencil mark
- **THEN** no step of the plan is the fill, and the first strike crosses out
  only marks that are on the board

### Requirement: Hint: Undead's hint tries a single, then a counted placement, then a strike

At each step the plan SHALL take the first that applies of: a cell whose
pencil marks are down to one monster, placed; then the description's
techniques in the order its ladder states them, the monster counts before
the sightlines, starting again from the singles after each one found.

#### Scenario: A count and a sightline both strike

- **WHEN** nothing can be placed, every ghost is on the board while an empty
  cell still lists a ghost, and a sightline's clues also rule a vampire out
  of a cell
- **THEN** the ghost is crossed out first, for the count, and the sightline's
  strike follows

### Requirement: Look: Undead renders monsters, mirrors, counts, and sightline hints

The board SHALL draw the monster-count row beneath the grid, each count a
monster's picture and its number; the sighting clue numbers around the grid
edge, dimmed when struck through and red on error; and each interior cell
as a mirror (a thick diagonal), a placed monster (a drawn ghost, vampire or
zombie shape, or the letter G, V or Z when the letters display is
selected), or the cell's pencil notes.

#### Scenario: A struck clue that is also in error

- **WHEN** a clue the player struck through is flagged by the live legality
  check
- **THEN** it is drawn red, not dimmed

## ADDED Requirements

### Requirement: Controls: Space and Delete clear an Undead cell

With a cell highlighted for an entry, Space and Delete SHALL clear it as `0`
and Backspace do. A clear SHALL take the cell's pencil marks with its
monster. In pencil mode the same keys SHALL clear a cell that has pencil
marks and do nothing to one that has none, and a count click SHALL toggle
that monster's mark like its letter.

#### Scenario: Space on a zombie

- **WHEN** a cell holding a zombie is highlighted for an entry and Space is
  pressed
- **THEN** the cell is empty

#### Scenario: Space in pencil mode on a monster with no marks

- **WHEN** pencil mode is on, the highlight is on a cell that holds a zombie
  and no pencil marks, and Space is pressed
- **THEN** the zombie stays and no move is made

### Requirement: Hint: The search never reaches an Undead hint

The search is no deduction a person can follow. The hint SHALL NOT read it
on any tier: where the ladder stalls, it says that the board allows
positions that need trial and error.

#### Scenario: The search never reaches a narration

- **WHEN** hint plans are walked across every tier and many seeds
- **THEN** no step is the search's, and an Unreasonable plan the ladder
  cannot finish ends on the words for trial and error

## REMOVED Requirements

### Requirement: Controls: Space, Delete and a second count click clear an Undead cell

**Reason**: A press on a count types its monster's key, as the keypad does,
and typing the monster a square holds leaves it, as on every board of
numbers; so a second press no longer clears.

**Migration**: Space, Delete, Backspace or `0` clear the square
(§ "Controls: Space and Delete clear an Undead cell").

### Requirement: Hint: The forcing rung never reaches an Undead hint

**Reason**: Undead has no forcing rung; its top tier is the engine's search.

**Migration**: § "Hint: The search never reaches an Undead hint".

### Requirement: Hint: An Unreasonable Undead board's plan is neither empty nor complete

**Reason**: A born game's hint on a tier with a search is the engine's,
held for every such game by the hint walks (`hint-walk-fingerprint`), which
record Undead's Unreasonable plan stopping short of a solved board.

**Migration**: None; `src/guards/__snapshots__/hint-walk-undead.txt` records
the plan.
