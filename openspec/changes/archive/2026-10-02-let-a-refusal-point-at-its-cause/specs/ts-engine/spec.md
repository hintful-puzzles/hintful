## MODIFIED Requirements

### Requirement: The engine supports an ephemeral, opt-in mistake-checking hook

The engine SHALL support a UI-only, ephemeral mistake-checking facility,
shaped like the Hint System. The `Game` interface SHALL define an
optional `findMistakes(state)` method returning the cells of the current
state that contradict the puzzle's unique solution as game-specific
highlight data (an empty result means no detectable mistakes). The
method SHALL be pure (no state mutation).

A game whose state carries **candidate/pencil annotations** (e.g. Towers) MAY
report **annotation-level** contradictions as mistakes, consistently with how a
placed value is reported: a non-empty candidate set that **excludes** the cell's
unique-solution value (the player has crossed out the correct answer) is a
contradiction and MAY be returned, whereas a candidate set that merely holds
extra, non-solution candidates is ordinary mid-solve state and SHALL NOT be
reported. The solution such a game checks against SHALL be derived from the
committed placements only, never from the annotations themselves (an annotation
can be wrong — that is precisely what is being checked). This makes pencil notes
first-class markings, so the existing Check-&-Save gate (which refuses a save
while `findMistakes` is non-empty) refuses a board carrying an invalid note
exactly as it refuses a wrong placed value.

The `Midend` SHALL, on `findMistakes()`, call the game's hook, store the
result as `activeMistakes` (midend-only, never in game state, never
persisted), pass it to the game's `redraw`, and return the **count** of
flagged cells. `activeMistakes` SHALL be displayed until the next state
transition and SHALL be cleared on the same events that clear an active
hint (a player move, undo, redo, restart, new game, solve, and reaching
the solved state). A game that does not implement `findMistakes` SHALL
report it as unavailable.

The engine surface SHALL expose `canFindMistakes` (true iff the game
implements the hook) in its static attributes, and SHALL reach the hook through
`check()`, which asks it first. For a game that does not implement the hook,
`canFindMistakes` SHALL be false, the midend's `findMistakes()` SHALL return 0,
and `check()` SHALL report that no mistakes were checked.

#### Scenario: Checking a board with mistakes

- **WHEN** the user invokes `findMistakes()` on a game that implements
  the hook and the current state has cells contradicting the solution
- **THEN** the midend stores those cells as `activeMistakes`, schedules a
  repaint that draws them highlighted, and returns the count (> 0)
- **AND** the highlight remains until the next state transition

#### Scenario: Checking a clean board

- **WHEN** the user invokes `findMistakes()` and no cell contradicts the
  solution
- **THEN** the count returned is 0 and nothing is highlighted

#### Scenario: A transition clears the mistake display

- **WHEN** `activeMistakes` is displayed and the user makes a move,
  undoes, redoes, restarts, starts a new game, or solves
- **THEN** the midend clears `activeMistakes` and the next repaint draws
  no mistake highlights

#### Scenario: A game without the hook reports no capability

- **WHEN** the active game does not implement `findMistakes`
- **THEN** `canFindMistakes` is false and `findMistakes()` returns 0,
  and the app shell offers a check only if the game has a hint to ask

#### Scenario: A candidate annotation that excludes the solution is a mistake

- **WHEN** a game with pencil/candidate annotations reports mistakes on a state
  where an undecided cell's non-empty candidate set excludes that cell's
  unique-solution value
- **THEN** `findMistakes` includes that cell
- **AND** a cell whose candidate set still contains the solution value (with or
  without extra candidates) is not included
- **AND** Check-&-Save refuses to quick-save the board while such a cell exists

### Requirement: A hint refusal SHALL be one of the collection's own

`HintResult`'s error SHALL be a `HintRefusal`: the union of the literal types of
the collection's refusal constants, plus a sentence made by `puzzleDeadEnd` or
`markedDeadEnd`, the named escapes. A game SHALL NOT be able to return a
sentence it typed. The set SHALL distinguish, at minimum: the board is
inconsistent but **no individual entry can be shown to be wrong**;
deduction has run out; a bounded search is past its reach; for a game that
teaches no technique, no move would help; and the game is over.

This is required because the help teaches "there is a mistake on the board" and
"deduction has run out" as a *pair* whose responses are opposite, and a player
cannot learn a pair whose members are worded differently in each puzzle.

**Every refusal SHALL say whether it is a dead end** (`isDeadEnd`): whether its
advice is to go back. The verdict of each kind SHALL be stated in a table typed
over every kind, so a kind added without one fails the typecheck, and the
conformance check SHALL hold each kind's verdict to whether its sentence tells
the player to undo. A contradiction, a game that is over, and nothing found
that finishes from here are dead ends; deduction run out, a search past its
reach, no move worth making and a puzzle that cannot be reasoned about are not.

The escapes are for a dead end only one puzzle has, where naming it is the
substance of the hint (Inertia's dead ball, Pegs' cut-off pegs), and are dead
ends by construction. A sentence two games pass through them is a situation the
collection has, and SHALL become a kind; the conformance check SHALL find the
escapes' calls by their shape, read a template's words with each substitution as
a hole (a `markedDeadEnd`'s through its `phrase` template), and fail a call
whose sentence it cannot read or which does not tell the player to undo.

#### Scenario: Two games refuse for the same reason

- **WHEN** two games decline to hint because no further move can be deduced
- **THEN** the player reads the same sentence in both

#### Scenario: A new phrasing cannot arrive unnoticed

- **WHEN** a game's `hint` returns a sentence that is neither a refusal constant
  nor made by an escape
- **THEN** the typecheck fails

#### Scenario: A game's own dead end shared by a second game

- **WHEN** two games pass the same sentence to an escape
- **THEN** the conformance check fails, asking for a kind

#### Scenario: A kind spelled out through the escape

- **WHEN** a game passes a refusal constant's text to an escape
- **THEN** the conformance check fails

#### Scenario: A board inconsistent with nothing to highlight

- **WHEN** a board `findMistakes` passes is still inconsistent, with no entry
  provably wrong
- **THEN** the game's `hint` refuses with the message that asks the player to
  undo, not with one pointing at a highlight

#### Scenario: A kind whose verdict disagrees with its advice

- **WHEN** a refusal kind is called a dead end while its sentence does not tell
  the player to undo, or the reverse
- **THEN** the conformance check fails

## ADDED Requirements

### Requirement: The check asks the hint whether a position is a dead end

The `Midend` SHALL offer `check()`, the one check behind Check & save and Check
without saving. It SHALL ask `findMistakes` first, displaying any mistakes; on a
board with none, it SHALL ask the game's `hint` for its verdict without showing
a hint, and report a refusal that `isDeadEnd` calls a dead end with that
refusal's sentence. A search past its reach (`SEARCH_OUT_OF_REACH`) SHALL be
reported apart, since it settles nothing. Every other answer SHALL be reported
sound, saying whether `findMistakes` ran. A solved board, and one a stored hint
plan still leads on from, SHALL NOT cost a hint computation. The verdict, not
the marks, SHALL cross the worker boundary: the canvas is painted in the worker.

#### Scenario: A dead end findMistakes cannot see

- **WHEN** `check()` runs on a board `findMistakes` passes and the game's hint
  refuses it with a dead end (Bricks' wrong-but-legal mark, Pegs' cut-off peg)
- **THEN** the verdict is a dead end, carrying the hint's sentence

#### Scenario: Past the search's reach

- **WHEN** the hint refuses with `SEARCH_OUT_OF_REACH`
- **THEN** the verdict says the check could not settle the position

#### Scenario: A sound board shows no hint

- **WHEN** `check()` runs on a board the hint has a plan for
- **THEN** the verdict is sound and no hint step is displayed

### Requirement: A dead end may mark its cause

A game's hint MAY return `markedDeadEnd(words)`: a dead end whose sentence is
its words' text and whose references name the elements that cause it. While it
is the answer on display, from a Hint press or a check, the midend SHALL pass it
to `redraw` as `deadEnd`, never together with a hint step, and SHALL clear it on
the transitions that clear the mistake overlay. The binding walk SHALL hold a
marked dead end's words to the frame as it holds a step's: every element named
is drawn and nothing else is.

#### Scenario: A cut-off peg is outlined

- **WHEN** Check & save runs on a Pegs board with a peg nothing can reach
- **THEN** the save is refused with the hint's sentence and the cut-off peg is
  outlined until the next move

#### Scenario: A renderer that ignores the dead end

- **WHEN** a game returns a marked dead end but its `redraw` paints marks only
  from the hint step
- **THEN** the binding walk reports each named element as not drawn
