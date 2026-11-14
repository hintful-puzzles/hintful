## ADDED Requirements

### Requirement: A described technique is a rung read off the notes

A game whose description states its techniques SHALL offer each as a rung of
the walk that runs the compiled technique over the marks the board's notes
show (`techniqueRung`), once the notes are set up, and SHALL build a step's
reason from the terms the technique says. A technique the board's tier would
not run SHALL offer nothing.

#### Scenario: A technique past the board's tier

- **WHEN** a hint is asked on a board whose tier is below a technique's
- **THEN** no step of the plan is a firing of that technique

### Requirement: A technique waits in its ladder's order

A technique after its ladder's first SHALL wait until every earlier rung of
the walk is empty, as the solver reaches it only once those before it are
spent. One of a tier harder than the ladder's easiest MAY offer, while it
waits, a firing that continues the plan's latest steps.

#### Scenario: A harder technique continues the work in hand

- **WHEN** a single is on the board, and a technique of a harder tier than the
  ladder's easiest, within the board's tier, has a firing that rests on the
  cell the last step decided
- **THEN** the plan may take that firing before the single

### Requirement: A game's placing technique may lead

A game whose signature deductions are placements MAY mark such a technique as
leading. A leading technique SHALL be offered wherever the board supports it,
from the note-free opening on, waiting neither for the notes to be set up nor
for an earlier rung; the board's tier still bounds it.

#### Scenario: A leading placement before any note

- **WHEN** a hint is asked on a board with no notes where a leading
  technique's firing is supported by the values placed
- **THEN** the plan may take that placement before any note is written

### Requirement: A hint deduces from the notes only where the mistake check vouches for them

A game on the candidate walk SHALL run its techniques on the player's notes
only where its `findMistakes` flags every empty cell whose notes have crossed
out its answer, so that wherever a hint is given every cell's notes still hold
its answer. A note outside the cell's full note set SHALL be read as no
candidate.

#### Scenario: A note that crossed out the answer

- **WHEN** a cell's notes no longer hold its answer and the player asks for a
  hint
- **THEN** the hint refuses as on any board with a mistake, and no step rests
  on those notes

### Requirement: A plan stops below the tier that searches

No rung of a candidate plan SHALL be a technique of the tier that searches,
so no step is a trial (`engine-hints`, "A Search is refused and never
narrated"). On a board of the `Unreasonable` tier the plan SHALL hold what
the techniques beneath it make from the player's board, and `candidateHint`
SHALL refuse with `DEDUCTION_EXHAUSTED` only where the plan holds no step.

#### Scenario: A hint on an Unreasonable board

- **WHEN** a hint is asked for on a board of the `Unreasonable` tier
- **THEN** no step of the plan is a firing of the tier that searches, and the
  plan holds what the techniques beneath it make up to where a trial would be
  needed

#### Scenario: Nothing left to deduce

- **WHEN** no rung fires on the player's board and the plan has no setup step
  to make
- **THEN** `candidateHint` refuses with `DEDUCTION_EXHAUSTED`

### Requirement: A step's premise names every cell its deduction reads

The premise of every firing a candidate hint plan offers SHALL name every cell
whose candidates or placed value its deduction reads, including a cell read
for what it does not hold: a hidden set or a fish reads the rest of its lines,
and a claim that only one mark leads somewhere reads every mark that could.

#### Scenario: A fish names the rest of its lines

- **WHEN** a set in the value slice strikes a value because, in some columns,
  the value can only sit in cells of certain rows
- **THEN** the step's premise holds every other cell of those columns

### Requirement: A reason carries the cells its words do not name

Where the game's words for a step do not name a cell its deduction reads, the
step's reason SHALL carry it in `reads`, and the walk SHALL add those cells to
the step's premise as it adds the game's own.

#### Scenario: Only one mark leads into a group

- **WHEN** a Rome step says only one mark leads into a group
- **THEN** the step's `reads` hold every square around the group

### Requirement: Every single a plan takes is one the notes show

No hint narration SHALL exist for a single the notes show as neither a naked
nor a hidden single: the walk reads every single it takes off the notes it
shows, and a placement a technique makes carries that technique's reason. The
family has no `forcedSingle` reason, and Salad no `forcedCross` or
`forcedCircle`.

#### Scenario: A single is one the notes show

- **WHEN** a plan takes a single
- **THEN** the notes the walk shows hold the value as the cell's only
  candidate, or as the value's only home in a region that holds every value

### Requirement: A placement is read against the candidates the board shows

A hint plan SHALL read a placement against the candidates the board shows: a
written note as written, stale or not, and a blank cell with no notes as every
value not already placed in its regions, so that a hidden single is claimed only
where the board shows one. The plan SHALL strike every stale note, the player's
or its own, before it takes a technique's strike, and SHALL strike each value it
places, including every leg of a multi-leg placement journey, from its lines'
notes.

#### Scenario: A player's stale note is struck before a technique's strike

- **WHEN** a Group hint is requested on a board whose notes still carry a value
  the player has since placed in the same row
- **THEN** a single the plan places first is a naked or hidden single in the
  notes as written, and the plan strikes the stale note before it takes any
  technique's strike

#### Scenario: A note-free board's placements are narrated by what the board shows

- **WHEN** a Group hint places values before any notes exist
- **THEN** every "In this row" or "In this column" placement is one where no other empty
  cell of that line could take the value given its own row and column

### Requirement: The walk owns a ladder of singles and the game's rungs

The walk SHALL own the ladder: the singles the notes show, naked and hidden,
then the game's own rungs. Until the setup is done it SHALL offer the
note-free opening, in which a rung that reads the notes offers nothing, and
after it the whole ladder. It SHALL own the signal a rung needs that every
earlier rung came up empty, and the step budget and the iteration cap.

#### Scenario: The opening holds the note-reading rungs back

- **WHEN** a plan starts on a board whose notes are not set up, and a rung of
  the game's own that needs no notes has a firing
- **THEN** a firing of the opening is taken before the setup's next step, and
  no technique reading the notes is taken until the setup is done

## MODIFIED Requirements

### Requirement: A firing is offered only when the board shows its premise

The game SHALL own which firings of its own rungs are available, and the walk
which singles are. A firing SHALL be offered to the frontier only when the
working board already shows its premise: a technique's rung SHALL run it on
the notes the walk shows and the values placed, so what it finds rests on
nothing the board has yet to show.

#### Scenario: a firing is offered only when the board shows its premise

- **WHEN** a technique's strike would rest on a note a premise cell still shows
- **THEN** the strike is not offered to the frontier until that note is struck

### Requirement: A candidate hint distinguishes naked and hidden singles

Every game on the candidate walk SHALL narrate a single by the deduction that
forces it, which the walk reads off the notes it shows and hands the game's
`singleReason`. The walk SHALL consider only empty cells as competitors for a
value. A placement a technique of the game makes SHALL keep that technique's
reason.

#### Scenario: A clue-forced placement keeps its reason

- **WHEN** a Towers plan takes a facing-clue placement
- **THEN** the step narrates the facing clue and is not narrated as a single

#### Scenario: The naked-single phrasing is never used on a multi-candidate cell

- **WHEN** a game on the walk narrates a placement as a naked single, in the
  shared narrator's "ruled out in this cell" or in words of its own
- **THEN** the cell's working notes are a single candidate, a true naked single,
  and a hidden single uses its own narration

### Requirement: A firing is emitted whole

A firing SHALL be emitted whole, its later legs flagged `continuesPrevious`, so
no game tracks which firing a step belongs to.

#### Scenario: A firing is one journey

- **WHEN** one firing of a technique strikes candidates the game's narration
  must show as several legs (several heights in Towers, both ends of a sign in
  Unequal, several cells of a cage in Keen)
- **THEN** the legs are consecutive steps, the first unflagged and the rest flagged
  `continuesPrevious`, with no other firing's step between them

### Requirement: The implicit reading opens only on a stale note

Under the implicit reading the candidate-plan walk's setup SHALL count as done while no
note on the working board is one the obvious clean would strike, so a board with no
stale note has no note-free opening and every rung competes from the first step. While
a stale note remains, the note-free opening SHALL run as under the populate reading,
ending with the clean.

#### Scenario: a fresh board competes every rung from the start

- **WHEN** an implicit-reading plan is built on a board whose notes hold nothing a
  placed value rules out
- **THEN** a technique's strike may be taken before the singles and clue lines are
  exhausted

#### Scenario: a stale note still lets a single go first

- **WHEN** an implicit-reading plan is built on a board whose notes still carry values
  the placed ones rule out, and a naked single is on the board
- **THEN** the plan places the single before it cleans the stale notes

### Requirement: The solver says which lines confine a value

The technique that makes such a firing SHALL say which lines confine the value.
Where a firing can be read two ways, as some columns confined to as many rows or
as the remaining rows confined to the remaining columns, a solver without
repeated values SHALL name whichever is fewer lines.

#### Scenario: The fewer lines are named

- **WHEN** the shared Latin solver confines a value in two columns of a board
  five cells wide, which is also three rows confined to three columns
- **THEN** the step's reason names the two columns

### Requirement: The game keeps what carries its meaning

A game on the walk SHALL keep what carries its meaning: its ladder's
techniques, as rungs over the notes, the words and evidence of its steps,
how a firing splits into legs, which what the narration names singular
dictates, its own rungs, the
deviations the walk names as optional hooks, each stating the game-shaped
fact that needs it, and its regions where those are a decision the game
makes and not one its family has already answered.

#### Scenario: The strike axis follows the narration

- **WHEN** a game's narration names one cell at a time and it splits a firing's
  strikes by cell
- **THEN** the firing becomes one leg per cell, in the order the cells first
  appear in it

### Requirement: A row/column Latin square answers no question its regions already settle

The engine SHALL provide a preset over the candidate-elimination plan walk
(`runLatinCandidatePlan`) supplying every plan field whose answer is forced once
a game's cells' no-repeat regions are exactly a row and a column, so that a
plain Latin game supplies its own techniques' rungs and its own words and
nothing else; the Latin library's set, fish and wing are rungs the engine
builds (`latinStrikeRungs`). Every game SHALL remain free to call the general
entry point, and a game that does SHALL say why.

#### Scenario: A plain Latin game declares no regions

- **WHEN** a candidate-elimination game whose cells' no-repeat regions are exactly a row
  and a column walks its hint plan
- **THEN** it passes no region function, no single-reason function and no hidden-single
  evidence area, and its hidden singles are still classified in, narrated by and shaded
  along the correct line

## REMOVED Requirements

### Requirement: No narration exists for a placement the notes cannot explain

**Reason**: The walk reads every single off the notes it shows, so there is no
recorded placement for the notes to fail to explain, and no classifier to
throw when one is skipped.
**Migration**: "Every single a plan takes is one the notes show".

### Requirement: A placement is classified against the candidates the board shows

**Reason**: Restated without recorded strikes, under a new title since its
scenario named one.
**Migration**: "A placement is read against the candidates the board shows".

### Requirement: The walk owns the ladder

**Reason**: The ladder held the recorded strikes and placements, which no
plan has any more; restated under a new title since its scenario named them.
**Migration**: "The walk owns a ladder of singles and the game's rungs".

### Requirement: A recording solve reads the placed entries and never the notes

**Reason**: No game's plan records any more; every candidate game runs its
ladder's techniques on the notes, which its mistake check vouches for.
**Migration**: "A hint deduces from the notes only where the mistake check
vouches for them".

### Requirement: A recording solve stops below the tier that searches

**Reason**: No game's plan records any more.
**Migration**: "A plan stops below the tier that searches", which bounds the
techniques run on the notes the same way.

### Requirement: The marks a recorded firing waits on

**Reason**: No game's plan records any more, so no firing waits on marks a
recording made ahead of the board; a technique run on the notes finds only
what the board already shows.
**Migration**: "A firing is offered only when the board shows its premise".

### Requirement: No recorded firing waits on its place in the recording

**Reason**: No game's plan records any more.
**Migration**: The walk reads every single off the notes it shows ("The walk
owns the ladder").

### Requirement: A placement's bookkeeping is not a firing to teach

**Reason**: No game's plan records any more, so there is no recorded `dup`
strike to leave out; the walk strikes a placement's cull itself.
**Migration**: None.

### Requirement: A game's rung reads the walk's recorded placements

**Reason**: With nothing recorded, the placements the walk handed a rung were
only the singles its own rung offers, which Group's opening rung repeated.
**Migration**: "A game's placing technique may lead".

### Requirement: A recorded firing's premise SHALL name every cell its deduction reads

**Reason**: No firing is recorded any more; the rule holds for every firing.
**Migration**: "A step's premise names every cell its deduction reads".

### Requirement: A recorded reason carries the cells its words do not name

**Reason**: No reason is recorded any more; a technique's reason carries them.
**Migration**: "A reason carries the cells its words do not name".

### Requirement: The engine audits a premise by replaying its firing

**Reason**: The audit replayed a recording; a technique run on the notes is
the solver's own by construction, and the soundness check holds the technique.
**Migration**: None; `firing-replay.ts` is deleted.

### Requirement: A guard runs the premise audit over every game on the walk

**Reason**: The audit is gone with the recordings it replayed.
**Migration**: None; `firing-replay.test.ts` is deleted.

### Requirement: A technique that reads more than its conclusion rests on is pinned

**Reason**: The ledger was the audit's, which is gone.
**Migration**: None.
