# Verdicts: untangle

## reword `untangle`: Crossed edges are Untangle's only mistake feedback

The `findMistakes` decision stays: it is the game's own, and `index.ts`
declares its reason under `notApplicable`. The sentence that Untangle has no
`statusbarText` or `textFormat` goes as `type`: neither is a decision anyone
would revisit. Upstream's Untangle has no status bar, its text format belongs
to the editor build the port leaves out (the header of
`src/games/untangle/index.ts` says so), and `ts-engine` "Solve, the status bar
and text export follow from the game's methods" makes the absence of a method
the whole statement. The scenario is narrowed to the hook that is a decision.

### Requirement: Crossed edges are Untangle's only mistake feedback

Untangle SHALL NOT provide `findMistakes`: any layout with no crossing wins, so
there is no one answer to check a move against, and crossed edges are the
built-in mistake feedback.

#### Scenario: Untangle has no mistake check

- **WHEN** the registered `untangle` game is read
- **THEN** it has no `findMistakes`

## reword `untangle`: The keyboard selects, holds, nudges and cycles a vertex

Filled out, as the doubt asks: a control rule that names no key cannot be
checked against. The keys are read from `interpretMove` in
`src/games/untangle/index.ts` (the arrows choose by quadrant, `CURSOR_SELECT`
picks up and puts down, `CURSOR_SELECT2` or Tab cycles, Shift reverses, and a
cycle is refused while a vertex is held) and agree with
`help/games/untangle.md`, which tells the player the same keys. No rule is
dropped; the scenario is unchanged.

### Requirement: The keyboard selects, holds, nudges and cycles a vertex

An arrow key SHALL select the nearest vertex in that direction. Space or Tab
SHALL step the selection through the vertices in turn, backwards with Shift,
and SHALL do nothing while a vertex is held. Enter SHALL pick the selected
vertex up, the arrow keys SHALL then nudge it, and Enter again SHALL put it
down as a move.

#### Scenario: A held vertex is nudged and dropped

- **WHEN** the player selects a vertex away from the border, presses the select
  key, presses an arrow, and presses the select key again, with snapping off
- **THEN** a move is committed placing that vertex one nudge away in the
  arrow's direction

## reword `untangle`: A hint step marks its vertex, its destination and the crossings it removes

One requirement serves. What a step marks and how `redraw` draws those marks
are one subject, and each of the two listed the same four things. This takes in
"redraw draws a displayed hint in the hint color" whole, with its scenario, and
that requirement is cut below. Every clause of both is kept.

### Requirement: A hint step marks its vertex, its destination and the crossings it removes

Each step SHALL mark the vertex it moves, its destination, where the crossings
the move removes sit, and, on a journey's leg, the marked vertices still to
move after it. For a displayed step `redraw` SHALL draw a hint-colored line
from the vertex to its destination, the vertex and a destination marker in the
hint color, and an unfilled hint-colored ring on each crossing the move removes
and around each marked vertex still to move.

#### Scenario: A journey's first leg marks the others

- **WHEN** the first leg of a journey of three vertices is on display
- **THEN** it marks its own vertex, its destination, and the two vertices
  still to move

#### Scenario: Displayed hint is rendered

- **WHEN** a hint step is on display
- **THEN** `redraw` draws a hint-colored line to, and a hint-colored marker at,
  the suggested destination, and one ring for each crossing the move removes

## cut `untangle`: redraw draws a displayed hint in the hint color

duplicate: merged into "A hint step marks its vertex, its destination and the crossings it removes", reworded above, which now carries this requirement's sentence and its scenario word for word.

## keep `untangle`: Untangle's hint refusals

The added sentence is the other half of the refusal and is true: `hint.ts`
refuses with `NO_MOVE_WORTH_MAKING` only when its plan is empty, and until then
gives the moves that remove crossings, which is what the hand-typed K5 case in
`untangle-hint.test.ts` walks. A refusal that said only "refuses on a
non-planar board" would be wrong about the first few hints. It stays as it is.

## keep `untangle`: executeMove places vertices and refuses a malformed move

The cut of the structured-clone sentence stands, and this requirement loses
nothing by it. Whether a move's saved shape is a promise is not a question
about Untangle: no game's spec states its move shape, and the shared rules
(`ts-engine` "The engine uses a clean TS-native save format", "A move that is
not a union has its fields validated") stop short of it. So nothing is added
here, and the question is in the note below.

## note A game's move shape is a save promise that no spec states

Every save replays a move list, so a renamed move field breaks today's saves,
and for Untangle the move log is the only place the layout lives
(`{ kind: "place", points: [{ i, x, y, d }], solving }`, the fields
`executeMove` reads in `src/games/untangle/index.ts`). No game spec writes its move
shape down and no shared requirement says that a move's fields may not be
renamed without an upgrade. `src/engine/save-round-trip.test.ts` round-trips
within one build, so it cannot see a rename. If the collection wants this held,
it is one requirement in `ts-engine` beside "A save version bump comes with an
upgrade, not a rejection", not a sentence in each game.
