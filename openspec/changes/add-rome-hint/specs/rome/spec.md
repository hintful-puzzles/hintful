# rome — delta

## REMOVED Requirements

### Requirement: Rome mistake-checking covers arrows that break no rule

**Reason**: the requirement states that "a pencil mark SHALL NOT be reported as a
mistake however it disagrees with the solution, because Rome's pencil marks
carry no fixed meaning", and its scenario "Pencil marks are never mistakes"
holds that in place. Rome's marks now carry a meaning — a mark claims the arrow
is still possible — because both a Mark-all press that fills every legal arrow
and a hint that teaches the player to cross arrows off are only coherent under
that reading, and Rome's solver has always read the same array that way. A
candidate-elimination hint additionally cannot deduce from a note it cannot
trust: a naked single read off a mark that has crossed out the answer places a
wrong arrow.

**Migration**: replaced by "Rome mistake-checking covers arrows and marks that
break no rule" below, which keeps both surviving scenarios verbatim and adds the
mark case. A saved game is unaffected — the save format does not change and an
existing board still loads; what changes is that Check & Save now refuses a
board whose marks have ruled out an answer, in the same way it already refused a
wrong arrow. `help/games/rome.md` states the meaning where it previously said
the marks "can be used for any purpose".

## ADDED Requirements

### Requirement: Rome mistake-checking covers arrows and marks that break no rule

Mistake-checking SHALL report both the rule violations the board already shows
as the player works — an arrow pointing off the grid, an arrow duplicated inside
an outlined region, and an arrow that forms a loop — and, separately, any arrow
the player has placed that contradicts the puzzle's unique solution even though
it breaks no rule. The unique solution SHALL be re-derived from the fixed clues
alone, never from anything the player has entered, and when the board is not
deducible from those clues no contradiction SHALL be reported.

An empty square carrying no marks SHALL NOT be reported as a mistake. A pencil
mark SHALL claim that its arrow is still possible for that square, so an empty
square whose marks are non-empty and exclude the solution's arrow SHALL be
reported as a mistake of its own kind, exactly as every other note-taking game
in the collection reports one.

#### Scenario: A legal-looking arrow that contradicts the solution is flagged

- **WHEN** an arrow is placed that breaks no rule but differs from the unique
  solution's arrow for that square
- **THEN** it is reported as a mistake and Check & Save is hard-blocked

#### Scenario: A duplicate arrow in a region is flagged as a mistake

- **WHEN** two squares in the same outlined region hold the same arrow direction
- **THEN** `findMistakes` flags both squares and Check & Save is hard-blocked

#### Scenario: Marks that rule out the answer are a mistake

- **WHEN** an empty square carries pencil marks that exclude the solution's
  direction for that square
- **THEN** a `note` mistake is reported for that square and Check & Save is
  hard-blocked

#### Scenario: A square with no marks at all is not a mistake

- **WHEN** an empty square carries no pencil marks
- **THEN** no mistake is reported for it, because it is claiming nothing

### Requirement: Rome fills and cleans candidate marks in one press

Rome SHALL answer the Mark-all press and declare `canMarkAll`. The press SHALL
be adaptive: while any empty square has no marks it SHALL fill every such square
with the arrows that square could legally hold, and otherwise it SHALL strike
from each empty square every arrow already placed in that square's own outlined
region, returning no move when there is nothing left to strike.

The set of arrows a square can legally hold SHALL be **per square** — all four
less any that would point off the grid — and SHALL be the same set the solver
seeds its candidates with and the hint's populate step fills. The fill SHALL be
additive: a square the player has already narrowed keeps its marks.

#### Scenario: The first press fills only what the grid's edges allow

- **WHEN** Mark-all is pressed on a board with unmarked empty squares
- **THEN** every such square gains the arrows it could legally hold, a top-row
  square gains no up arrow, and a square the player had already narrowed is left
  bit-for-bit alone

#### Scenario: A later press removes only, and converges

- **WHEN** Mark-all is pressed repeatedly on a fully marked board
- **THEN** each press only ever removes marks, and a press on a fully cleaned
  board is a true no-op that adds no history entry

### Requirement: Rome explains its next deduction

Rome SHALL provide an explained `hint()` meeting the project's hint quality bar,
built on the shared candidate-elimination plan. A hint SHALL refuse on a solved
board and on a board the mistake check flags, and SHALL otherwise narrate the
next forced move by the premise that forces it, in Rome's own vocabulary of
arrows, squares and areas.

Every sentence SHALL rest only on facts the player can see on the board or
record with Rome's own marks. A step's evidence SHALL be shaded and the square
it acts on SHALL be ringed rather than filled. Where a firing's premise is a
**walk** — an arrow chain that leads back to the square being struck — the chain
SHALL be shaded in order, numbered, so the claim the sentence makes is one the
player can follow square by square; the chain SHALL be computed rather than
assumed.

The hint SHALL derive its script from a recording projection of Rome's own
solver. That projection SHALL NOT change any deduction the solver makes, because
the generator keeps a blanked clue only while the solver still finishes the
board and so every published description depends on the solver's verdict on
every intermediate clue set.

#### Scenario: A deduction is narrated by its premise, not by its move

- **WHEN** the hint's next step strikes an arrow that would close a loop
- **THEN** the sentence states that following the arrows from the named
  neighboring square leads back to this one, and the arrow chain is shaded in
  order with each square's place in the walk drawn on it

#### Scenario: The recorder changes nothing the solver decides

- **WHEN** a board is solved with the recorder attached and again without it
- **THEN** both runs finish with the same grid and the same candidate set,
  square for square

#### Scenario: A hint can be followed to a finished board

- **WHEN** the hint's move is applied repeatedly from any mid-game position
- **THEN** the board reaches a solved state, and every step changes the board
  when it is reached
