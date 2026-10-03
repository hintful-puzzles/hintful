# blackbox Specification

## Purpose
Black Box, the puzzle of locating balls hidden in a rectangular arena by firing
lasers in from its edge and reading whether each one hits a ball, is reflected
back, or emerges, and where. This capability specifies its port to the TS
engine, centered on the deterministic laser tracing that every reveal and every
verdict on the player's guess rests on.

## Requirements

### Requirement: Black Box game implements the Game interface

The engine SHALL provide a registered `blackbox` game implementing
`Game<BlackboxParams, BlackboxState, BlackboxMove, BlackboxUi,
BlackboxDrawState, Point>`: a deduction puzzle in which the player locates hidden
balls in a `w`×`h` arena by firing lasers from the surrounding range and
observing how they hit, reflect, or exit. Params SHALL be `w`, `h`, `minballs`,
`maxballs`, encoded `w{w}h{h}m{minballs}M{maxballs}` with lenient decode (unknown
letters ignored). The 5 upstream presets — `5×5, 3 balls`, `8×8, 5 balls`, `8×8,
3-6 balls`, `10×10, 5 balls`, `10×10, 4-10 balls` — SHALL be offered. The
preset/custom **type summary** SHALL read `{w}x{h}, {n} balls` (or `{min}-{max}
balls`) via a `no-of-balls` annotation key mapped in the worker adapter.
`validateParams` SHALL reject `w < 2` or `h < 2`, `w > 255` or `h > 255`,
`minballs < 1`, `minballs > maxballs`, and `minballs >= w*h`, and, only when the
params are about to deal a board, `maxballs` above `blackboxBallLimit(w, h)`. The
game SHALL provide `statusbarText`, `solve`, `hint` and `findMistakes`, and SHALL
NOT provide `textFormat`.

#### Scenario: Params round-trip and lenient decode

- **WHEN** params `{ w: 8, h: 8, minballs: 3, maxballs: 6 }` are encoded
- **THEN** the result is `w8h8m3M6`
- **AND** decoding `w8h8m3M6` round-trips those params

#### Scenario: The ball-count type summary reflects a range

- **WHEN** the worker adapter decodes params `w8h8m3M6` for the type summary
- **THEN** the `no-of-balls` annotation value is `"3-6"` (rendered `3-6 balls`)
- **AND** for `w8h8m5M5` the value is `"5"` (rendered `5 balls`)

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is called with `minballs: 0`, or with
  `minballs > maxballs`, or with `minballs >= w*h`
- **THEN** it returns a non-null error string

### Requirement: Black Box descriptions are obfuscated ball-layout bitmaps

A desc SHALL encode `[w, h, ball1x, ball1y, …]` as a byte-per-value bitmap,
apply the shared `obfuscateBitmap` SHA-1 masking, and hex-encode the result
(`encodeBalls`). The verdict on a desc SHALL reject one of wrong length or one
whose de-obfuscated header mismatches `w`/`h` or whose ball coordinates fall
outside the arena. `newState` SHALL recover the ball layout by hex-decoding and
de-obfuscating the desc. The shared codec SHALL live at
`src/engine/obfuscate.ts`.

#### Scenario: A description round-trips through obfuscation

- **WHEN** a generated desc is decoded by `newState`
- **THEN** the recovered ball cells are the balls the generator placed, as many
  as the params allow

#### Scenario: A corrupted description is rejected

- **WHEN** `validateDesc` is given a desc of the wrong length, or one that
  de-obfuscates to a ball outside the arena
- **THEN** it returns a non-null error string

### Requirement: Black Box traces lasers through the arena deterministically

The laser engine SHALL, for a beam entering at a range cell in a given
direction, reproduce upstream's rules: an **instant hit** when a ball sits
directly ahead of the entry cell; an **instant reflection** when a ball sits
diagonally ahead-left or ahead-right of the entry cell (hit prioritized over
reflection); otherwise stepping forward, turning clockwise when a ball is
ahead-left and anticlockwise when a ball is ahead-right, returning **hit** when a
ball is directly ahead, **reflect** when the beam exits its own entry cell, and
otherwise the exit range index. A fired non-hit/non-reflect laser SHALL number
its entry and exit cells with a shared incrementing laser number.

#### Scenario: A clear beam exits the far side and pairs its endpoints

- **WHEN** a laser is fired across an arena with no ball in its path
- **THEN** it exits at the opposite range cell, and both the entry and exit
  cells carry the same laser number

#### Scenario: A head-on ball produces a hit

- **WHEN** a laser is fired directly at a ball with no earlier deflection
- **THEN** the result is a hit (the entry cell shows `H`)

#### Scenario: An adjacent ball reflects the beam at entry

- **WHEN** a laser enters a cell with a ball diagonally ahead of the entry point
- **THEN** the result is an instant reflection (the entry cell shows `R`)

### Requirement: Black Box marks, fires, locks, and reveals via moves

A `BlackboxMove` SHALL be one of: toggle a guessed ball at an arena cell, toggle
a per-cell lock, lock/unlock a whole column or row, fire a laser at a range
cell, reveal/verify the current guesses, or solve (guess the real balls and
reveal).
`executeMove` SHALL be pure (returning a new state) and SHALL reject an illegal
move by throwing. Toggling a ball SHALL be disallowed on a locked cell and SHALL
update the guess count. Firing an already-fired laser SHALL be rejected.
Revealing SHALL be allowed only when the guess count is within
`[minballs, maxballs]`. A whole-column/row lock SHALL set every cell locked iff
fewer than half are currently locked, else unlock them.

#### Scenario: Toggling a ball updates the guess count

- **WHEN** `executeMove` applies a toggle-ball on an empty unlocked arena cell
- **THEN** the new state has a guessed ball there and `nguesses` incremented
- **AND** applying the same toggle again removes it and decrements `nguesses`

#### Scenario: Firing a laser records its result

- **WHEN** `executeMove` applies a fire on an un-fired range cell
- **THEN** the new state's `exits` for that range index is no longer empty

#### Scenario: Reveal is gated on the ball count

- **WHEN** the guess count is below `minballs`
- **THEN** a reveal move is rejected (throws)

### Requirement: Black Box verifies guesses, and a reveal is a win

The verify (reveal) move SHALL run `checkGuesses`, which compares the player's
guessed layout with the real one by the lasers. When the player's already-fired
lasers contradict their guess, or an un-fired laser would have distinguished the
layouts, it SHALL flag one such laser (deterministically chosen from the current
grid) and set `justwrong` without revealing. Otherwise every laser goes where the
real layout sends it, so the guess is the answer: it SHALL accept the guesses as
the real balls and reveal. Solve SHALL guess exactly the real balls and reveal.
`status` SHALL return `"solved"` when revealed and `"ongoing"` before; a reveal
is only ever of a guess proven to be the answer, or Solve's, so a Black Box board
is never lost. A wrong verify SHALL increment a session error counter shown in
the status bar.

#### Scenario: A correct reveal is solved

- **WHEN** the guessed balls exactly match the real layout and the player
  verifies
- **THEN** `status` returns `"solved"` and the status bar reads a success message

#### Scenario: An inconsistent verify shows one error and does not reveal

- **WHEN** the player verifies a guess that a fired laser contradicts
- **THEN** `justwrong` is set, exactly one laser is flagged wrong, the full
  layout is not revealed, and the session error counter increments

#### Scenario: Solve replaces the guesses with the answer

- **WHEN** the player invokes Solve with some balls guessed wrongly
- **THEN** the guesses become exactly the real balls, the arena is revealed, and
  `status` returns `"solved"`

### Requirement: Black Box's hint SHALL reason only from the lasers fired

Black Box SHALL provide a `hint` that reads only what the player can see, the
lasers fired, where they went and the marks on the box, never the hidden balls,
so two boards whose balls send every fired laser the same way get the same plan.
The midend asks it only about a board whose marks the check passes, and its steps
SHALL only ever add marks. It SHALL settle a square by following a fired laser
through the squares already settled to the first one nothing has settled, and
concluding that square holds what does not send the laser somewhere it did not
go; a laser that came out at a numbered square SHALL be followed from either end.
A settled empty square SHALL be shown by marking it known and a settled ball by
guessing it, in one step ringing the square and outlining the laser's ends. When
nothing more settles, the hint SHALL ask for a laser whose path still depends on
unsettled squares. When every laser is fired and none settles a square on its
own, it SHALL offer, found by a bounded search that keeps the player's marks,
balls that send every laser where it went, and refuse with `SEARCH_OUT_OF_REACH`
past the search's budget. Once every laser's path is settled by the balls on the
board, it SHALL put any balls the count still requires on squares no laser
reaches, and ask the player to check the answer.

#### Scenario: A square a laser settles

- **WHEN** a fired laser came out at its other numbered end, and a ball on the first unsettled
  square along its path would keep any ray from running between those ends
- **THEN** the step rings that square, outlines both ends, says the square must be empty, and
  marks it known

#### Scenario: Nothing settles

- **WHEN** no fired laser settles a square and some laser's path still runs through unsettled
  squares
- **THEN** the step rings one such laser and asks the player to fire it

#### Scenario: The hint gives nothing away

- **WHEN** a hidden ball is moved to another square and every fired laser still goes where it
  went
- **THEN** the hint's plan is unchanged

#### Scenario: Following the hint wins

- **WHEN** the player follows every step from a dealt board of any preset
- **THEN** the answer is checked and accepted

### Requirement: Black Box plays only boards with one answer

A Black Box board's answers SHALL be the layouts, within the params' ball count,
that send every laser, fired or not, where its real balls do, counted by the
hint's own layout search with every laser fired, and the count SHALL agree with
trying every layout on boards small enough to try. `newDesc` SHALL deal only a
board with one answer, built a ball at a time: each ball goes on a random free
square where the board so far has one answer at its count, the last judged
against the params' whole range, starting again when no square of a bounded
number keeps it. `solve` SHALL say `MULTIPLE_SOLUTIONS` for a board the count
proves has several answers, so that such a board does not load. A count past its
budget SHALL settle nothing: the generator builds again, and a loaded board
loads.

#### Scenario: A dealt board

- **WHEN** a board is dealt for any preset
- **THEN** its answer count is one

#### Scenario: Four corners hide the middle

- **WHEN** a 3×3 game ID with balls on its four corners is opened under a count
  of 4 to 5 balls
- **THEN** it is refused as having more than one solution, and under a count of
  exactly 4 it loads

### Requirement: Black Box checks marks against its answer

Black Box SHALL implement `findMistakes`, reporting every guessed ball on a
square with no ball and every square marked known that holds a ball, and nothing
once the answer is revealed. The mistake SHALL be drawn as a frame in the error
color inside the square, held in the tile's cache key so it repaints when it
comes and goes.

#### Scenario: Check & Save with a wrong guess

- **WHEN** the player runs Check & Save with a ball guessed on an empty square
- **THEN** that square is framed as a mistake and the board is not saved

#### Scenario: Right marks pass

- **WHEN** every guess is on a ball and every known mark on an empty square
- **THEN** `findMistakes` reports nothing
