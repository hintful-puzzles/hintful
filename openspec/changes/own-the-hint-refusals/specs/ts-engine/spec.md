## ADDED Requirements

### Requirement: The midend SHALL refuse a hint on a finished or wrong board before asking the game

Before it asks a game's `hint` for a plan, the `Midend` SHALL refuse with
`ALREADY_SOLVED` when the board's status is solved, and then with
`FIX_MISTAKES_FIRST` when the game's `findMistakes` reports anything, putting
what it reports on the same overlay Check & Save uses. A game's `hint` is
therefore only ever asked about an unfinished board on which its `findMistakes`
finds nothing, and does not write either refusal.

The refusals SHALL be asked **in order**, because a finished board is not a
wrong board. And `FIX_MISTAKES_FIRST` **promises a highlight**, which only the
code that draws the overlay can keep, so no game says it: it is not a
`HintRefusal`. Forty-two of the forty-eight hinted games wrote this opening, or
called a helper to write it, until the midend took it over; each copy was a
chance to get the order or the promise wrong silently.

The midend SHALL NOT refuse on a lost status, because a lost board is not always
over: Flood plays on past its move limit and its hint still leads home. A game
whose finished board its status does not call solved (Fifteen, Sixteen and
Netslide count a board solved from the move that sorts it, so a game ID typed
already sorted is finished at move 0) refuses that board itself.

Because the walk in `hint-resume.test.ts` asks `hint` directly, it SHALL also
ask `findMistakes` at every position it reaches, as the midend does, and fail if
it reports anything: that is what holds a game's `findMistakes` to a sound board
and a hint to never leading the player into a mistake.

#### Scenario: Asking for a hint on a finished board

- **WHEN** a hint is requested, or played, on a board whose status is solved
- **THEN** the midend returns `ALREADY_SOLVED` and the game's `hint` is not asked

#### Scenario: Asking for a hint on a board with a mistake highlights it

- **WHEN** a hint is requested on an unfinished board for which the game's
  `findMistakes` reports a mistake
- **THEN** the midend returns `FIX_MISTAKES_FIRST`, the game's `hint` is not
  asked, and the next redraw shows the mistake overlay Check & Save populates

#### Scenario: A refusal unrelated to mistakes highlights nothing

- **WHEN** the game's `hint` refuses on a board with no mistakes
- **THEN** the mistake overlay stays empty and no cell is highlighted

#### Scenario: A hint walk meets a mistake

- **WHEN** following a game's hints reaches a position its `findMistakes` flags
- **THEN** the walk fails, naming the seed and the move

### Requirement: A hint refusal SHALL be one of the collection's own

`HintResult`'s error SHALL be a `HintRefusal`: the union of the literal types of
the collection's refusal constants, plus a sentence made by
`puzzleHintRefusal`, the one named escape. A game SHALL NOT be able to return a
sentence it typed. The set SHALL distinguish, at minimum: the board is finished;
the board is inconsistent but **no individual entry can be shown to be wrong**;
deduction has run out; a bounded search is past its reach; for a game that
teaches no technique, no move would help; and the game is over.

This is required because the help teaches "there is a mistake on the board" and
"deduction has run out" as a *pair* whose responses are opposite, and a player
cannot learn a pair whose members are worded differently in each puzzle.

The escape is for a dead end only one puzzle has, where naming it is the
substance of the hint (Inertia's dead ball, and the gems its ball can no longer
reach). A sentence two games pass through it is a situation the collection has,
and SHALL become a kind; the conformance check SHALL find the escape's calls by
their shape, read a template's words with each substitution as a hole, and fail
a call whose sentence it cannot read.

#### Scenario: Two games refuse for the same reason

- **WHEN** two games decline to hint because no further move can be deduced
- **THEN** the player reads the same sentence in both

#### Scenario: A new phrasing cannot arrive unnoticed

- **WHEN** a game's `hint` returns a sentence that is neither a refusal constant
  nor made by `puzzleHintRefusal`
- **THEN** the typecheck fails

#### Scenario: A game's own dead end shared by a second game

- **WHEN** two games pass the same sentence to `puzzleHintRefusal`
- **THEN** the conformance check fails, asking for a kind

#### Scenario: A kind spelled out through the escape

- **WHEN** a game passes a refusal constant's text to `puzzleHintRefusal`
- **THEN** the conformance check fails

#### Scenario: A board inconsistent with nothing to highlight

- **WHEN** a board `findMistakes` passes is still inconsistent, with no entry
  provably wrong
- **THEN** the game's `hint` refuses with the message that asks the player to
  undo, not with one pointing at a highlight

## REMOVED Requirements

### Requirement: A hint refusal is worded once for the whole collection
**Reason**: The wording is held by a type now, not by a sweep of every `{ ok: false, error }` literal against an exceptions ledger, and the mistake refusal's promise is kept by the midend rather than by each game.
**Migration**: "A hint refusal SHALL be one of the collection's own" carries the surviving scenarios; "The midend SHALL refuse a hint on a finished or wrong board before asking the game" carries the highlight's promise.

### Requirement: A deductive hint SHALL open with the shared refusal pair
**Reason**: The midend gives both opening refusals before it asks the game, so there is no opening for a game to write, and `commonHintRefusal`, its ledger and its guard are gone.
**Migration**: "The midend SHALL refuse a hint on a finished or wrong board before asking the game". Bricks', Clusters', Subsets' and Loopy's further check for a board inconsistent with nothing to highlight stays in their hints, under "A hint refusal SHALL be one of the collection's own".

### Requirement: A refused hint surfaces the board's mistakes
**Reason**: The midend no longer asks `findMistakes` after the game refuses; it asks before, and refuses itself.
**Migration**: "The midend SHALL refuse a hint on a finished or wrong board before asking the game", whose scenarios include both of this requirement's.
