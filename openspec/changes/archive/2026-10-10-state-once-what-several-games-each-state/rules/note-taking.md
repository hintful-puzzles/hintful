# Rules: note-taking

## add `engine-notes`

What each button does to the selection and the mode, with the sticky preference on and off, and the repeat press. True of every member of the note-taking cell: the thirteen games whose `newUi` carries `pencilMode` and `cursorFromKeyboard` (abcd, crossing, group, keen, map, mathrax, rome, salad, seismic, solo, towers, undead, unequal). Eleven call `pressNoteTakingCell` and Map and Rome call `tapNoteTakingCell` at a release that committed nothing; both run one private function in `src/engine/note-taking-cell.ts`, which reads `ui.pencilSticky ?? false`, so Group (no sticky field) reads as off. The sticky secondary press is left to "The sticky pencil toggle is a mode switch, not a selection". The one member the repeat press is false of is Crossing: `src/games/crossing/index.ts` takes a repeat left press in entry mode at a crossing before the shared arm and flips `ui.dir` (its "The fill direction is remembered and set by three gestures"). The rule is of a press that commits no move, because three members spend some presses on one before the shared arm is reached: Crossing drops a held clue number on a left press and leaves the mode alone (`interpretMove`, the `ui.heldNumber` arm), and Rome and Map reach `tapNoteTakingCell` only from a release that committed nothing (Rome's tap on the player's own arrow clears it).

after: The engine owns what a press and an entry do to the highlight

### Requirement: The button and the sticky preference decide the mode a press selects for

With the sticky pencil preference off, a primary press that commits no move
SHALL select the pressed cell for a value and turn pencil mode off, and a
secondary one SHALL select it for pencil marks and turn the mode on. With it
on, a primary one SHALL select in the mode that is on and change no mode. Such
a press on the cell the highlight shows on, in the mode it selects for, SHALL
put the highlight away, unless the game gives the repeat press its own meaning
(Crossing's change of direction).

#### Scenario: A primary press keeps a latched pencil mode

- **WHEN** a secondary press has switched pencil mode on under the sticky
  preference, and another empty cell is then pressed with the primary button
- **THEN** that cell is selected for a pencil mark and pencil mode stays on

#### Scenario: A primary press on a cell selected for pencil marks, sticky off

- **WHEN** the sticky preference is off, a secondary press has selected an empty
  cell for pencil marks, and the same cell is pressed with the primary button
- **THEN** the cell is selected for a value and pencil mode is off, and the
  highlight is not put away

#### Scenario: A second primary press under the sticky preference

- **WHEN** a cell selected by a primary press is pressed again with the primary
  button under the sticky preference, in either mode, in a game that gives the
  repeat press no meaning of its own
- **THEN** the highlight is put away and pencil mode is as it was

## reword `engine-notes`: The sticky pencil toggle is a mode switch, not a selection

It said what the toggle does on a cell that can take no mark and not what it does on one that can, and the copies shortened below said it (Towers: "toggle a persistent pencil mode and move the highlight to the clicked cell, unless that cell can take no pencil mark"). Read from the private press function of `src/engine/note-taking-cell.ts`: a sticky secondary press flips `pencilMode`, returns unmoved only when `canMark` is false, and otherwise moves the highlight to the pressed cell like any press. True of all thirteen members, Map and Rome through `tapNoteTakingCell`. The old sentence and scenario stay; one sentence and one scenario are added.

### Requirement: The sticky pencil toggle is a mode switch, not a selection

With sticky pencil mode on, a secondary press SHALL switch pencil mode. On a
cell that can take a mark it SHALL also move the highlight there, and on a cell
that could take no mark it SHALL leave the highlight where it is, because the
toggle is a mode switch rather than a selection.

#### Scenario: The sticky toggle does not double as a selection key

- **WHEN** a player presses the secondary button on a filled cell, with sticky
  pencil mode on
- **THEN** pencil mode toggles
- **AND** the highlight is exactly where it was, shown or hidden as it was

#### Scenario: The sticky toggle on an empty cell

- **WHEN** with sticky pencil mode on and pencil mode off, a player presses the
  secondary button on an empty cell the highlight is not on
- **THEN** pencil mode is on and that cell is selected for pencil marks

## reword `engine-notes`: Every member offers the keep-highlight preference, defaulted the same way

The requirement said the defaults agree and not what they are. Read from each member's `newUi`: `pencilKeepHighlight: true` in all thirteen (and `note-taking-cell.test.ts` walks the derived members for it); `pencilSticky: true` in the twelve that offer `stickyPencilPref` (every member but Group); `autoPencil: false` in the five that offer `autoPencilPref` (keen, mathrax, solo, towers, unequal). Nothing but each game's `newUi` holds the sticky and auto-pencil defaults: no cross-game test reads them.

### Requirement: Every member offers the keep-highlight preference, defaulted the same way

Every game in the mechanic SHALL offer the keep-highlight pencil preference, on
by default, so one gesture does one thing across the family and the player who
wants the other still has it. A member that offers the sticky pencil preference
SHALL start with it on, and a member that offers auto-pencil SHALL start with
it off, which leaves cleaning the notes to the Mark-all press and the hint.

#### Scenario: The family answers a preference question once

- **WHEN** a player makes the same mouse-driven pencil mark in any two games of
  the mechanic, having changed no preferences
- **THEN** the highlight behaves the same way in both

#### Scenario: A first secondary press latches

- **WHEN** a player who has changed no preference presses the secondary button
  on an empty cell, in a member that offers the sticky preference
- **THEN** pencil mode is on and stays on through the next primary press

#### Scenario: A placement with no preference changed

- **WHEN** a player who has changed no preference places a value, in a member
  that offers auto-pencil
- **THEN** the pencil marks of every other cell are as they were

## add `engine-notes`

The select key as a way into pencil marks. True of the eleven members whose press is their selection: each calls `toggleNoteTakingMode` (`src/engine/note-taking-cell.ts`) after its pointer and arrow arms and before its entry arm, and that helper toggles on `CURSOR_SELECT` only while `ui.cursor.visible`, sets `cursorFromKeyboard`, and never reads the sticky field. I read the order of the arms in all eleven `interpretMove`s; no cross-game test presses the key. False of Map and Rome, which do not call it: Map's select keys pick up and drop a color (`src/games/map/index.ts`) and Rome's Enter arms arrow placement (`src/games/rome/index.ts`); both toggle on the Marks key by their own line. "One way into note-taking across the collection" only permits the gesture; it does not require it.

after: Putting the highlight away never changes pencil mode

### Requirement: The select key on a showing highlight toggles pencil mode

In a game whose press is its selection, the select key (Enter) pressed while
the highlight shows SHALL toggle pencil mode, the same with the sticky
preference on or off, and SHALL hand the highlight to the keyboard. The rule
SHALL NOT bind a game whose press starts a drag, where the select key belongs
to the game's own keyboard gesture (Map's pick and drop, Rome's arming of a
placement).

#### Scenario: The select key after a pointer selection

- **WHEN** the pointer has selected an empty cell, the select key is pressed and
  a value is then typed
- **THEN** the value is toggled as a pencil mark and the highlight stays, as a
  highlight the keyboard placed does

#### Scenario: The select key in a game whose press starts a drag

- **WHEN** the cursor shows on a colored region in Map and the primary select
  key is pressed
- **THEN** the color is picked up and pencil mode is as it was

## reword `engine-notes`: Mark-all is adaptive in a game with uniqueness regions

The population was "a game that supplies a per-game region provider", and the fill-then-strike press is also what a game with a rule of its own does: ABCD and Salad and Rome build it with `adaptiveMarkAll` (`src/engine/candidate-hint.ts`), the six Latin games (group, keen, mathrax, solo, towers, unequal) with `adaptiveMarkAllMove`, and Map with its own `markAll` (`src/games/map/hint.ts`), which fills the dotless regions and otherwise removes the dots its neighbors' colors rule out. So the title changes; no source or guide cites it (`spec-citations.mjs --list`). Two more corrections: the fill changes no noted cell, in every one of these (each `executeMove` skips a cell with notes, and `mark-all.test.ts` holds every `canMarkAll` game to it); and the list of regions said "its row and column" of every region game, which is false of Rome, whose provider gives the outlined region alone.

### Requirement: Mark-all is adaptive in a game with an obvious-candidate rule

For a game with an obvious-candidate rule (a region provider, or a rule of its
own) the action SHALL be adaptive. While any empty cell has no notes, it SHALL
fill every such cell with all its candidates and change no other. Otherwise it
SHALL remove the obvious candidates: with a region provider, every penciled
value equal to a value placed in one of the cell's uniqueness regions,
whichever the game has of row, column, sub-block, X-diagonal, and a cage or
outlined region that forbids repeats.

#### Scenario: A second press on a fully-noted board removes obvious candidates

- **WHEN** every empty cell is already fully noted and the player activates the
  mark-all control on a game whose uniqueness regions are its rows and columns
  (and blocks and diagonals where it has them)
- **THEN** the action removes exactly the penciled values already placed in
  each cell's regions, leaving every still-possible candidate

#### Scenario: A narrowed cell beside a note-less one

- **WHEN** one empty cell has been narrowed to two notes, another carries none,
  and the player activates the control
- **THEN** the cell with no notes takes all its candidates and the narrowed cell
  keeps its two

## reword `engine-notes`: The Mark-all cleanup is one pencilStrike, or no move

It opened "In a game with uniqueness regions", and `adaptiveMarkAll` does the same for a game that passes its own rule: marks computed in `interpretMove`, one strike move, `null` when there are none. The strike is the game's own `pencilStrike` in each of the nine games that call the helper (Rome's through its `CandidateMoveAdapter`). Map does not call it and has no `pencilStrike`: its clean is one move of dot toggles computed in `interpretMove` (`regionsMove`), and no move when `markAll` returns `null`. So the rule that holds of all ten is "one move, computed at `interpretMove` time, or none", and the title changes with it; nothing cites the old one.

### Requirement: The Mark-all cleanup is one move, or none

In a game with an obvious-candidate rule, the cleanup SHALL be emitted as one
move, with the marks it removes computed at `interpretMove` time, so replay and
undo are exact. A game that builds the press with `adaptiveMarkAll` or
`adaptiveMarkAllMove` SHALL emit it as its `pencilStrike`. When there is
nothing to fill and nothing to strike, the action SHALL produce no move at all,
a true no-op that adds no undo entry, rather than an empty strike.

#### Scenario: Replaying the cleanup

- **WHEN** every empty cell is already noted, the player activates the
  mark-all control on a game with an obvious-candidate rule, and the move is
  replayed
- **THEN** the action emitted one move, and replaying it reproduces the cleaned
  board

## reword `engine-notes`: Repeated Mark-all presses converge

"minus the values placed in its regions" is the region games' rule only. Convergence, no re-fill and the kept last note hold of every game with an obvious-candidate rule: `obviousCandidateMarks` keeps a cell's lowest note (the six Latin games, Salad, Rome), `abcdObviousMarks` (`src/games/abcd/solver.ts`) never strikes a cell's last candidate, and Map's `markAll` keeps a region's lowest dot. `mark-all.test.ts` presses every `canMarkAll` game to a no-op on every sliced preset.

### Requirement: Repeated Mark-all presses converge

The cleanup SHALL be idempotent and a pure function of the placed values. On a
board whose notes the player has not narrowed, repeated presses SHALL converge
to and remain at every empty cell noted with all its candidates minus those the
game's obvious-candidate rule strikes. There SHALL be no fill-then-clean toggle,
and a cleaned board SHALL NOT silently re-fill. A clean SHALL NOT empty a cell
of its last note, which keeps idempotency unconditional on a mistaken board.

#### Scenario: Repeated presses are idempotent (no re-fill, no toggle)

- **WHEN** the player activates the mark-all control a third time, after a fill
  and a clean, with no board change in between
- **THEN** the cleaned board is unchanged: the action produces no move (a true
  no-op, no undo entry) and does not re-fill any cell

#### Scenario: Every note of a cell is ruled out

- **WHEN** a wrong placement leaves every note of an empty cell obvious, and the
  control is activated
- **THEN** the cell keeps one note, and the press after that is no move

## reword `engine-notes`: A game with no obvious-candidate rule keeps a fill-only Mark-all

It did not say the fill leaves a narrowed cell alone. The fill-only games are Seismic and Undead: each answers `M` only while some empty cell has no notes, and its `executeMove` fills only a cell whose `pencil` is 0 (`src/games/seismic/index.ts` `pencilAll`, `src/games/undead/index.ts` `markAll`). `mark-all.test.ts` narrows one cell, blanks another and presses, in every `canMarkAll` game. The old scenario restated the sentence.

### Requirement: A game with no obvious-candidate rule keeps a fill-only Mark-all

A game that supplies neither a region provider nor an obvious-candidate rule of
its own (Undead, for one) SHALL keep the fill-only behavior: its press SHALL
fill every empty cell that has no notes with all that cell's candidates, SHALL
leave a cell whose notes the player has narrowed as it is, and on a board with
no note-less empty cell SHALL produce no move.

#### Scenario: A narrowed cell beside a note-less one

- **WHEN** in a fill-only game one empty cell has been narrowed to two notes,
  another carries none, and the control is activated
- **THEN** the cell with no notes takes all its candidates and the narrowed
  cell keeps its two

#### Scenario: A press on a fully noted board

- **WHEN** every empty cell of a fill-only game carries a note, some of them
  values already placed beside it, and the control is activated
- **THEN** no move is made, and no note is removed

## reword `ts-engine`: A candidate note that excludes the answer is a mistake

"From the committed placements only" admits the player's own placed values as a source, and no game uses them. I read `findMistakes` in every game that reports a note: the thirteen that call `entryMistakes`/`entryMistake` (`src/engine/entry-mistakes.ts`) each re-solve from the clues and the fixed cells alone (Keen from its cages; Towers, Unequal, Group, Solo, Mathrax, Seismic, Undead, Map from the immutable cells and the clues; ABCD and Crossing from `answerOf` over the clues; Rome from `boardFromClues`; Salad from `scratchBoard`), and Guess compares its rule-outs with the code the board hides (`state.solution`). Loopy, Net and Slant, whose notes are not candidate sets, also solve from the clues. So the sentence true of all of them is "from what the puzzle fixes, never from anything the player entered".

### Requirement: A candidate note that excludes the answer is a mistake

Where a game whose state carries candidate or pencil notes reports them as
mistakes, a non-empty candidate set that excludes the cell's unique-solution
value SHALL be the contradiction it reports, and a set that merely holds extra,
non-solution candidates SHALL NOT be reported. The answer such a game checks
against SHALL come from what the puzzle fixes, its clues and givens or the
answer the board hides, and never from anything the player has entered,
whether a placement or a note.

#### Scenario: A candidate annotation that excludes the solution is a mistake

- **WHEN** such a game reports mistakes on a state where an undecided cell's
  non-empty candidate set excludes that cell's unique-solution value
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose candidate set still holds the solution value, with or
  without extra candidates, is not included
- **AND** Check & save refuses to quick-save the board while such a cell
  exists, as it refuses a wrong placed value

#### Scenario: A wrong placement is not evidence

- **WHEN** the player has placed a wrong value, and a neighboring cell's notes
  hold its true value and leave out the one the wrong placement would force
- **THEN** the placed cell is reported and the neighbor's notes are not

## edit `towers`: Towers offers a sticky pencil mode

The presses with the preference on and off are `engine-notes`, "The button and the sticky preference decide the mode a press selects for" and "The sticky pencil toggle is a mode switch, not a selection"; the default is `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way"; that the keyboard is the same either way is `engine-notes`, "The select key on a showing highlight toggles pencil mode". What stays is that Towers offers the preference.

from: preference, on by default. With it on, a right-click SHALL toggle a persistent pencil mode and move the highlight to the clicked cell, unless that cell can take no pencil mark, and a left-click SHALL only move the highlight, preserving the current pencil or real mode. With it off, a left-click SHALL revert to real entry and a right-click SHALL be a per-cell pencil select. The keyboard path SHALL be the same with sticky mode on or off.
to: preference.

## drop-scenario `towers`: Towers offers a sticky pencil mode

`engine-notes`, "The button and the sticky preference decide the mode a press selects for" states the sticky-off primary press. The other scenario stays, with the indicator it mentions.

scenario: Sticky mode off, a left-click reverts to real entry

## edit `towers`: Towers selects a cell by pointer or by keyboard cursor

`engine-notes`, "The select key on a showing highlight toggles pencil mode" holds the Enter rule. The 3D hit-testing is Towers' own.

from: From the keyboard, Enter (`CURSOR_SELECT`) while the highlight shows SHALL switch the highlight between real entry and pencil marks.
to:

## edit `towers`: Towers auto-pencils row/column eliminations on placement

The default is `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way".

from: an auto-pencil preference, off by default: when
to: an auto-pencil preference: when

## edit `towers`: Towers checks for mistakes against the unique solution

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered. What Towers re-solves from stays.

from: clues and givens, never from the player's pencil notes, and return
to: clues and givens and return

## cut `solo`: Solo selects a cell by pointer or keyboard

Every sentence of it is the family's. The presses with the sticky preference on and off, and the repeat press, are `engine-notes`, "The button and the sticky preference decide the mode a press selects for" and "The sticky pencil toggle is a mode switch, not a selection"; that Solo starts sticky is `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way"; the select key is `engine-notes`, "The select key on a showing highlight toggles pencil mode"; and the cursor keys are `engine-input`, "One arrow press reveals the cursor and moves it". Solo's `interpretMove` hands the press to `pressNoteTakingCell` and the key to `toggleNoteTakingMode` and adds nothing. Its three scenarios are the shared requirements' own.

## edit `solo`: Solo exposes pencil-mark preferences

The three defaults are `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way". Which preferences Solo offers stays, and the scenario stays as the requirement's one.

from: a sticky-pencil-mode preference (default on; right-click toggles a persistent pencil mode), an auto-pencil preference (**default off**), and a keep-mouse-highlight-after-pencil preference (default on).
to: a sticky-pencil-mode preference, an auto-pencil preference, and a keep-mouse-highlight-after-pencil preference.

## edit `solo`: Solo flags mistakes against its unique solution

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered.

from: cage sums), never from the player's notes, to the unique
to: cage sums) to the unique

## edit `keen`: Keen selects a cell through the shared note-taking cell

`engine-notes`, "The select key on a showing highlight toggles pencil mode" holds the select key.

from: The cursor-select key on a showing highlight SHALL toggle pencil mode, and the cursor keys SHALL move the highlight.
to: The cursor keys SHALL move the highlight.

## edit `keen`: Keen exposes pencil-mark preferences

The defaults are `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way". Which preferences Keen offers stays, and the scenario stays as the requirement's one.

from: a sticky-pencil-mode preference (default on: right-click toggles a persistent pencil mode) and an auto-pencil preference (default off, so the player cleans notes with the mark-all control or a hint).
to: a sticky-pencil-mode preference and an auto-pencil preference.

## cut `keen`: Keen's mark-all key fills, then cleans

Nothing in it is Keen's alone. The fill of the note-less cells, the narrowed cell left as it is and the strike of what a row or column already holds are `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule"; that a cage is no reason to strike is `engine-notes`, "An obvious candidate is judged only against placed values", which names Keen's cage; the key is `engine-notes`, "The Mark-all action is the M key". Keen's `interpretMove` passes its row and column regions to `adaptiveMarkAllMove` and decides nothing else.

## edit `keen`: Keen flags mistakes against its unique solution

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered.

from: unique solution, deriving it from the clues only and never the player's notes, and return
to: unique solution and return

## edit `salad`: Salad selects a square and enters a symbol or a marker

The presses are `engine-notes`, "The button and the sticky preference decide the mode a press selects for" and "The sticky pencil toggle is a mode switch, not a selection", and the select key is `engine-notes`, "The select key on a showing highlight toggles pencil mode".

from: With the sticky pencil preference off, a left press SHALL select a cell for ink entry and a right press for pencil entry; with it on, a right press SHALL switch pencil mode and a left press SHALL select in the mode that is on. The arrow keys SHALL move a keyboard cursor and the select key SHALL toggle between ink and pencil entry.
to: The arrow keys SHALL move a keyboard cursor.

## edit `seismic`: Seismic input, note-taking and completion

The presses are `engine-notes`, "The button and the sticky preference decide the mode a press selects for" and "The sticky pencil toggle is a mode switch, not a selection", and the default is `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way". That Seismic offers the preference stays.

from: preference, on by default. With it on, a right press SHALL switch pencil mode and a left press SHALL select the cell in the mode that is on; with it off, a left press SHALL select a cell for number entry and a right press for pencil marks.
to: preference.

## edit `seismic`: Mark-all fills a note-less cell with its region's candidates

`engine-notes`, "A game with no obvious-candidate rule keeps a fill-only Mark-all" now says a narrowed cell is left as it is and that a fully noted board gets no move. What a cell's candidates are in Seismic stays, with its scenario.

from: It SHALL NOT reset a cell whose notes the player has narrowed, and SHALL make no move when no empty cell lacks notes.
to:

## edit `crossing`: Crossing is played by selecting a cell and entering a digit

The presses are `engine-notes`, "The button and the sticky preference decide the mode a press selects for" and "The sticky pencil toggle is a mode switch, not a selection".

from: note-taking cell's: with the sticky pencil preference off, a left click selects for digit entry and a right click for pencil marking, and with it on, a left click selects in the current mode and a right click toggles pencil mode.
to: note-taking cell's.

## cut `crossing`: The arrow keys move a cursor and Enter switches the entry mode

Both halves are shared. Enter is `engine-notes`, "The select key on a showing highlight toggles pencil mode" (Crossing calls `toggleNoteTakingMode` like the rest), and the arrow keys moving the cursor are `engine-input`, "One arrow press reveals the cursor and moves it". What an arrow does that is Crossing's own, setting the fill direction, is in Crossing's "The fill direction is remembered and set by three gestures".

## drop-scenario `mathrax`: Mathrax input and keypad

The case is `engine-notes`, "The button and the sticky preference decide the mode a press selects for", scenario "A primary press keeps a latched pencil mode". Two scenarios of Mathrax's own remain.

scenario: A left-click in pencil mode

## edit `mathrax`: Mathrax offers the sticky pencil and auto-pencil preferences

The default is `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way".

from: sticky pencil preference, defaulting on, and its
to: sticky pencil preference and its

## edit `mathrax`: Mathrax flags mistakes against the unique solution

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered.

from: unique solution, never from the player's entries or notes, and flag
to: unique solution, and flag

## edit `unequal`: Unequal accepts digit, pencil, clue-spent, and solve moves

What each button selects for is `engine-notes`, "The button and the sticky preference decide the mode a press selects for". The parenthesis was also false of Unequal as it starts: with the sticky preference on, the right button switches the mode.

from: by mouse (left button = real-entry highlight, right button = pencil-mark highlight) or keyboard cursor
to: by mouse or keyboard cursor

## edit `unequal`: Unequal exposes pencil-mark preferences

The three defaults are `engine-notes`, "Every member offers the keep-highlight preference, defaulted the same way". Which preferences Unequal offers and what its auto-pencil strikes stay.

from: preference (default on: right-click toggles a persistent pencil mode), an "auto-pencil" preference (default off: when on, placing a number strikes it from the pencil marks of its row and column), and a "keep mouse highlight after changing a pencil mark" preference (default on).
to: preference, an "auto-pencil" preference (when on, placing a number strikes it from the pencil marks of its row and column), and a "keep mouse highlight after changing a pencil mark" preference.

## drop-scenario `unequal`: Unequal exposes pencil-mark preferences

The case is `engine-notes`, "The button and the sticky preference decide the mode a press selects for", scenario "A primary press keeps a latched pencil mode". The auto-pencil scenario stays.

scenario: Sticky pencil mode persists across left-clicks

## cut `unequal`: The M key is Unequal's Mark-all

Nothing in it is Unequal's alone: the key is `engine-notes`, "The Mark-all action is the M key", and the fill of the note-less cells followed by the strike of what a row or column already holds is `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule". Unequal's `interpretMove` passes its row and column regions to `adaptiveMarkAllMove` and decides nothing else.

## edit `unequal`: Unequal checks for mistakes against the unique solution

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered.

from: givens and clues, never from the player's notes, and return
to: givens and clues and return

## reword `abcd`: ABCD's fill-all-marks command fills only cells with no marks

Shortened to ABCD's own rule, which is what counts as obvious. The fill of the note-less cells and the narrowed cell left as it is are `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule"; one `pencilStrike` and no move when nothing strikes are `engine-notes`, "The Mark-all cleanup is one move, or none"; the kept last mark is `engine-notes`, "Repeated Mark-all presses converge". ABCD passes `abcdObviousMarks` (`src/games/abcd/solver.ts`) to `adaptiveMarkAll` and does nothing else of its own. The title said what went, so it changes; nothing cites it. This is a `reword` in a game's spec, which the task asked me to avoid: an `edit` cannot change a title, and no other family's rule touches this requirement.

### Requirement: ABCD's obvious marks are a touching letter and a letter its line has in full

The obvious candidates ABCD's fill-all-marks command strikes SHALL be each mark
whose letter a touching cell already holds (diagonally too when that is
disallowed), and each mark whose letter its row or column already holds its
clue's count of.

#### Scenario: A row that has all of its letter

- **WHEN** every empty cell carries marks, a row's clue for `A` is 1, one cell
  of that row holds `A`, and the command is used
- **THEN** the `A` mark is struck from every other cell of that row that carries
  another mark

## edit `map`: Map's Mark-all press is adaptive

The kept last dot is `engine-notes`, "Repeated Mark-all presses converge", and no move when there is nothing to do is `engine-notes`, "The Mark-all cleanup is one move, or none". What Map dots and what it removes stay.

from: neighbors show, keeping a region's last dot and not emptying it; and a press with nothing to do SHALL be no move.
to: neighbors show.

## drop-scenario `map`: Map's Mark-all press is adaptive

The case is `engine-notes`, "Mark-all is adaptive in a game with an obvious-candidate rule", scenario "A narrowed cell beside a note-less one". The two-press scenario stays.

scenario: The press never refills a region the player narrowed

## edit `undead`: Undead's Mark-all fills the cells that have no notes

`engine-notes`, "A game with no obvious-candidate rule keeps a fill-only Mark-all" now says a narrowed cell is left as it is. Undead's three candidates and its `M` key stay, with the scenario.

from: It SHALL leave a placed cell, and a cell whose notes the player has narrowed, unchanged.
to:

## edit `undead`: Undead's findMistakes compares the board with its unique solution

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered. What Undead re-solves from stays, as it does in the other games' copies.

from: clues only, never from the player's notes.
to: clues only.

## edit `rome`: Rome mistake-checking covers arrows and marks that break no rule

`ts-engine`, "A candidate note that excludes the answer is a mistake" says the answer never comes from what the player entered. What Rome re-derives it from, and the undeducible board, stay.

from: fixed clues alone, never from anything the player has entered, and when
to: fixed clues alone, and when

## keep `rome`: A tap that commits no move selects the square

It restates the press in a clause, and keeps what is Rome's: a tap that does commit a move does not select (a tap on the player's own arrow clears it), and why a player without a keyboard needs the tap. Its scenarios are those cases on Rome's squares.

## keep `rome`: Rome fills and cleans candidate marks in one press

It looks like the adaptive Mark-all and says what the shared requirement cannot: a square's candidate set is the four arrows less those pointing off the grid, and the region the cleanup reads is the square's outlined region.

## keep `map`: A Map selection follows the note-taking cell's rule

It names the shared rule and gives Map's two answers to it: a region takes a color when it is not a clue and a mark when it is blank.

## keep `undead`: Undead supports monster, pencil, and clue moves with a cursor

"In pencil mode (a right-click or the cursor pencil toggle)" names the ways in without stating the rule, and the rest is Undead's keys and count blocks.

## not-shared which members offer the sticky and auto-pencil preferences

Twelve members offer `stickyPencilPref` and Group does not; five (keen, mathrax, solo, towers, unequal) offer `autoPencilPref`. Nothing in the code divides them: no hook or field says why Group has no sticky preference, and auto-pencil is offered by some games with row and column regions and not by others (Group, Salad). `engine-notes`, "An unoffered pencil preference is read from its absence" already says what an absent one means, so each game's "SHALL offer" sentence stays.

## not-shared what the select key does on a hidden highlight

`toggleNoteTakingMode` declines the select key while the highlight is hidden and each game's own code decides what follows. I did not find a game that states it, so there is nothing to share.

## note A press on a Rome clue square is ignored

`src/games/rome/index.ts` `interpretMove` returns `null` for a press on a square with `FM_FIXED`, before any drag or tap, so the highlight does not move there and pencil mode is as it was. `engine-notes`, "A pointer press moves the highlight to the pressed cell" says "whether or not the cell can take what the press offers", and "The button and the sticky preference decide the mode a press selects for" says a primary press with sticky off turns pencil mode off; a press on a given in a game whose press is its selection does both (and Map's tap on a clue region does). Either Rome's tap on a clue should reach `tapNoteTakingCell`, or both requirements want the departure said. Rome's own "A tap that commits no move selects the square" does not mention a clue.

## note Group answers only the uppercase M

`engine-notes`, "The Mark-all action is the M key" says a `canMarkAll` game handles the `M`/`m` key. `src/games/group/index.ts` answers 77 alone, because lowercase `m` is an element in a group of thirteen or more, and no requirement of `group` or `engine-notes` says so. The same requirement's scenario says the press "fills every empty cell", which is the fresh board's case only.

## note Guess reports a slot with every color ruled out

`ts-engine`, "A candidate note that excludes the answer is a mistake" speaks of a non-empty candidate set. Guess's rule-outs are the complement of one, and its `findMistakes` (`src/games/guess/state.ts`) also reports a slot whose every color is ruled out, an empty set; its own requirement "Guess checks the answer row's rule-outs against the code" says so. The shared sentence does not forbid it, and a reader could take it to.

## note No cross-game test holds the select key or the sticky and auto-pencil defaults

The select key's toggle is eleven games each calling `toggleNoteTakingMode` at the right place in its own `interpretMove`, and the sticky and auto-pencil defaults are a literal in each `newUi`. `note-taking-cell.test.ts` walks the derived members for keep-highlight only. A member that took Enter in an earlier arm, or started with sticky off, would fail nothing.

## note A stale comment in `src/engine/candidate-hint.ts`

The doc comment of `adaptiveMarkAllMove` lists its callers as "Keen/Towers/Solo/Mathrax/Unequal/Undead". Undead does not call it (its Mark-all is fill-only, by its own code) and Group does.

## note Salad keeps a resetting `markAll` move

`src/games/salad/index.ts` `executeMove` still plays a `markAll` move that resets every square's marks, beside the additive `pencilAll`. Nothing emits it today (`interpretMove` and the hint emit `pencilAll`), so it is reachable only from a saved move log. No requirement of `salad` names it.

## note Each game's findMistakes requirement restates more of the shared rule than was removed

Group's "Group's Check & Save flags pencil marks that have crossed out the answer", and the note half of the mistake requirements of ABCD, Crossing, Keen, Map, Mathrax, Rome, Salad, Solo, Towers, Undead and Unequal, each say that a note set without the answer is a mistake and one with extras is not, which is `ts-engine`, "A candidate note that excludes the answer is a mistake". Only the clause about where the answer comes from was this family's to remove.
