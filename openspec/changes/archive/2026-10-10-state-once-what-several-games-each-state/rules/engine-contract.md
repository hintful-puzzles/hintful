# Rules: engine-contract

## add `engine-params`

Every board a game offers passes validation for generation. The population is
every registered game: `src/engine/params-declared.test.ts` walks
`registeredGameIds()` and asserts `paramsError(g, g.defaultParams(), true)` is
null ("bounds are a range, and the defaults are inside them") and
`paramsError(g, leaf.params, true)` is null for every leaf of `g.presets()`
("every preset is valid and has a label of its own"). Nothing in the engine
makes it so; the guard holds it. No requirement of `engine-params` has the
subject: "Params validity is the engine's check" says who decides, "A
generation-only bound is gated on full" says where such a bound is written,
and "Every default and preset draws no wider than tall" is about shape.
Stated by ABCD, Seismic and Slide, each of its own bound.

after: A generation-only bound is gated on full

### Requirement: Every default and preset passes validation for generation

A game's default params and every leaf of its preset menu SHALL pass
`paramsError(game, p, true)`: no item's `bounds`, no choice's list and no rule
of the game's `validateParams`, generation-only or not, SHALL refuse a board
the game itself offers.

#### Scenario: A generation-only bound is tightened past a preset

- **WHEN** a game lowers the largest area its `validateParams` will generate
  below the area of one of its presets
- **THEN** the guard fails, naming the game, and the preset or the bound is
  changed before a player can choose a board the game refuses to deal

## reword `abcd`: The bound admits every preset and is asserted in both directions

The sentence "Every shipped preset SHALL pass validation for generation" and
its scenario restate `engine-params`, "Every default and preset passes
validation for generation", which holds it for every game. What is ABCD's own
is that its measured bound is asserted from both sides
(`src/games/abcd/abcd.test.ts`, "abcd generable-size bound": the `admits` rows
and the `refuses` rows). The title named the part removed, so it changes; no
source or guide cites it (`spec-citations.mjs --list`). The scenario is new,
about what remains.

### Requirement: ABCD's bound is asserted in both directions

The bound on generable boards SHALL be asserted in both directions: that it
admits configurations measured generable as well as refusing those measured
un-generable.

#### Scenario: A tightened bound cannot bar a generable board

- **WHEN** a configuration measured generable is validated for generation
- **THEN** it is accepted, so a bound drawn tighter than the measurements
  fails as one drawn looser does

## edit `seismic`: A preset is never a long wait

That a preset passes validation is `engine-params`, "Every default and preset
passes validation for generation". Seismic's own rule stays: no preset is
larger than `MAX_CELLS_SEISMIC` in either mode, which is tighter than
validation in Tectonic mode (`src/games/seismic/seismic.test.ts`, "bounds each
mode by what limits that mode").

from: Every preset SHALL pass validation and SHALL be no larger than
to: Every preset SHALL be no larger than

## edit `slide`: A Slide board too large to generate is rejected

That the bound admits the largest preset is `engine-params`, "Every default
and preset passes validation for generation", said from the bound's side. The
recording of the measurements is Slide's own and stays.

from: The bound SHALL be at least as large as the largest shipped preset, and the measurements that set it SHALL be recorded with it.
to: The measurements that set the bound SHALL be recorded with it.

## add `ts-engine`

A game's move shape is part of the save format. The population is every game:
`Midend.saveGame` writes each entry of the move log as
`game.serializeMove(move)`, or the move itself where the game has no such hook
(Pegs alone has one), and `Midend.load` hands each back
through `deserializeMove`, or a cast, to `applyMove` and so to `executeMove`
(`src/engine/midend.ts`). `decodeSave` (`src/engine/save.ts`) checks only that
`moves` is an array, and its `upgrade` lifts the envelope's own keys and
never a move. So a renamed move field reaches `executeMove` as a move it does
not know, the load is refused ("A game rejects a move it cannot play, rather
than guessing"), and the player's saved game does not open. The owner's rule
(`docs/work-management.md`, § "What the owner accepts") is that what a
player holds today opens in every later version, and that breaking it is
theirs to allow, asked beforehand with the cost stated; the last sentence
says so in the words `engine-params`, "The recorded params encodings do not
move" uses for a game ID. No requirement of `ts-engine` says this of a move:
"The engine uses a clean TS-native save format" promises a round trip within
one build, and "A save version bump comes with an upgrade, not a rejection"
binds the decoder, which never reads inside `moves`. The words claim no
check, since none exists, and are a rule for a change to a game's moves:
whether every shape a past build wrote still loads was not audited (see the
note below).

after: A save version bump comes with an upgrade, not a rejection

### Requirement: A move a save holds keeps replaying

A save holds each move as its game wrote it: what `serializeMove` returns, or
the move itself where the game has no such hook. A game that renames a move's
field, changes what a field means or stops making a kind of move SHALL keep
reading the earlier shape, in `deserializeMove` or in `executeMove`, so a save
written before the change still loads. Ceasing to read one is a compatibility
decision that SHALL go to the owner beforehand, with its cost stated.

#### Scenario: A move's field is renamed

- **WHEN** a game renames a field its move carries, and a save written before
  the rename is loaded
- **THEN** the game reads the old name as the new one, and the save opens at
  the position it was saved at

#### Scenario: A kind of move the game no longer makes

- **WHEN** a game's input stops producing a kind of move that saves already
  hold
- **THEN** `executeMove` still plays that kind from a save

## keep `pearl`: Pearl leaves the H key to the app

"Upstream's in-place autosolve move SHALL still replay from a saved game" is
an instance of `ts-engine`, "A move a save holds keeps replaying", and names
which move: the shared requirement cannot.

## keep `mosaic`: A Mosaic toggle cycles a mark and a paint fills only unmarked cells

"SHALL make no `paint` move of its own, and SHALL still replay one from a
saved game" names the retired move, as above.

## keep `loopy`: Loopy's notes are state, set by absolute moves

"A save holding only line moves SHALL still load" is the game's own case of a
move union that grew.

## keep `rome`: A replayed off-grid mark leaves no note

An earlier move that is read differently on purpose: the mark is dropped, not
kept. The shared requirement promises that the save loads, which this one
does.

## keep `mines`: A layout with no first square is a board not laid out yet

The older save whose first open brings no layout is Mines' own case, with its
own reading of the private description.

## reword `engine-input`: One keyboard-cursor vocabulary across games

The requirement read as holding every game with a keyboard cursor. The code
holds it of a cursor that is a position on a grid: `GridCursor` is `x`, `y`
and `visible` (`src/engine/pointer.ts`), and the guard
(`src/engine/cursor-vocabulary.test.ts`) walks every registered game's
`newUi` output and finds a cursor by that exact set of keys, so a cursor of
another shape is outside its population by construction and no list excuses
anyone. Two games have a keyboard cursor of another shape, found by reading
the `Ui` of each game that handles arrow keys and constructs no `newCursor`
(Cube, Fifteen, Inertia and Sokoban steer a piece and have no cursor):
Loopy's is a dot index, a chosen edge, the arrow that chose it and `visible`,
under `ui.cursor` (`LoopyCursor`, `src/games/loopy/cursor.ts`); Untangle's is
a vertex index or `-1`, under `ui.cursorPoint`
(`src/games/untangle/state.ts`). The departure is stated by shape, and says
nothing of the field's name, since the two differ. The title is unchanged:
`src/games/loopy/cursor.ts`, `src/games/sixteen/index.ts`,
`src/engine/pointer.ts` and `src/engine/cursor-vocabulary.test.ts` cite it.

### Requirement: One keyboard-cursor vocabulary across games

A game whose keyboard cursor is a position on a grid SHALL hold it in the
engine's shared cursor shape, a position and a visibility flag, under the one
canonical `Ui` field, `cursor`, and SHALL NOT name either itself. The engine
SHALL provide that shape and the verbs for it: constructing one, moving it,
revealing it and hiding it. A game whose cursor has no row and column to be
at, standing on a dot of a tiling or a point of a graph, SHALL hold it in a
shape of its own.

#### Scenario: A game's cursor is the shared shape

- **WHEN** a game has a keyboard cursor on a grid
- **THEN** its `Ui` holds a position and a visibility flag under `cursor`,
  and under no field of the game's own naming

#### Scenario: A cursor with no row and column

- **WHEN** a game's cursor stands on a dot of a tiling and carries the edge an
  arrow chose there
- **THEN** it is held as the dot's index and that edge, in the game's own
  shape, and the shared verbs are not asked to move it

## edit `engine-input`: A cursor outside the canonical field fails the build

The check finds a cursor by the key set of `newCursor()`
(`isCursorShaped`, `src/engine/cursor-vocabulary.test.ts`), so what it fails
on is a cursor of the shared shape under another field. A cursor of a game's
own shape (`engine-input`, "One keyboard-cursor vocabulary across games") is
not found by it, and the requirement read as if it were.

from: for a cursor held anywhere but the canonical
to: for a cursor of the shared shape held anywhere but the canonical

from: and not by matching names.
to: and not by matching names, so a cursor of a game's own shape is outside it.

## keep `loopy`: Loopy's cursor is held under ui.cursor in its own shape

The shared requirement now says a cursor with no row and column is the game's
own shape. This one says what the shape is, that it sits under `ui.cursor`,
and that Loopy's own tests guard it; none of that is shared.

## reword `engine-input`: A pointer drag over a grid has one name across the collection

"Where a pointer drag started and where it is now, as a pair of integer
coordinates" read wider than the code. No guard walks the games for this
requirement: `src/engine/grid-drag.test.ts` tests the helpers and
`src/engine/drag-cancel.test.ts` derives its games from who has a `GridDrag`.
The games that construct one (`newDrag()`: Boats, Bridges, Pattern, Rect,
Tents, Tracks) each hold an anchor and a current position in one space, cells
or half-cells, which is what `GridDrag`'s own comment says of `ex`, `ey`:
"in the same space as the anchor". The games that handle a drag and have
none were read (`isMouseDrag` or a drag code in the source, no `newDrag()`).
Pegs and Signpost hold the start cell and the pointer in pixels, since the
piece or the arrow follows the pointer; Sixteen holds both ends in pixels;
Bricks, Clusters, Sticks and Pearl hold a path of cells; Untangle a vertex and
a rational point; Map the pointer in pixels and the color carried. So the
requirement is true with those outside its population, and the words now say
which population: both ends in one grid space. Pegs is outside it. Two games
are outside it only by the letter, and no code derives the line: Spokes holds
the start cell and the current cell, each as one index with `-1` for none
(`SpokesUi`, `src/games/spokes/state.ts`), and Galaxies holds a source
square, a drop target and a dot, three pairs in half-cell coordinates whose
moving end depends on its drag mode (`GalaxiesUi`,
`src/games/galaxies/index.ts`). The last sentence carries no SHALL: nothing
forbids either from moving to a `GridDrag`. The title is unchanged and nothing
cites it.

### Requirement: A pointer drag over a grid has one name across the collection

A game whose `Ui` remembers where a pointer drag started and where it is now,
each as a pair of integer coordinates in one grid space of the game's own,
SHALL hold that in the engine's `GridDrag` and not in fields of its own
naming, the convention `GridCursor` carries for the keyboard cursor. The
engine SHALL own the anchor, the current position, whether a drag is running,
and the helpers that start, move and end one. A drag held any other
way is outside this rule.

#### Scenario: a game asks whether a drag is running

- **GIVEN** a game that carries a `GridDrag`
- **WHEN** it needs to know whether a drag is in progress
- **THEN** it reads one field whose meaning is the same in every game
- **AND** it does not test a coordinate against a sentinel value of its own
  choosing

#### Scenario: a dragged piece follows the pointer

- **GIVEN** a game that remembers the cell a piece was picked up from and the
  pointer's position in pixels, so the piece is drawn under the pointer
- **WHEN** its `Ui` is written
- **THEN** the two are fields of the game's own, since they are in two spaces
  and a `GridDrag` holds one

## keep `engine-hints`: Deduction runs out only where the tier permits search

It reads true today, and no longer says "SHALL NOT be able to emit". What it
says: the refusal is shown only where the tier permits search, the permission
is derived from the tier's name, and the midend throws otherwise, a game with
no difficulty contract included. Checked: the midend's hint plan
(`computeHintPlan`, `src/engine/midend.ts`) throws when `hint` returns `DEDUCTION_EXHAUSTED` and
`permitsSearch(game, boardParams)` is false; `permitsSearch`
(`src/engine/difficulty.ts`) is `tierNameOf(...) === SEARCH_TIER`, so an
untiered game never permits it; `Midend.check`, the other caller of `hint`,
shows a refusal only where `isDeadEnd` holds, which is false of this one
(`src/engine/hint-refusal.ts`). The untiered games are those with
`finishesByDeduction`, which `registerGame` (`src/engine/registry.ts`) makes
the exact complement of having `difficulty`: Blackbox, Cube, Fifteen, Flip,
Flood, Guess, Inertia, Mines, Netslide, Pegs, Samegame, Sixteen, Slide,
Sokoban, Twiddle and Untangle. Of those only Mines' `hint` can return the
refusal (`src/games/mines/hint.ts`), and "An untiered game's hint runs out
only on a board that does not load" covers that case by `MAY`. Range,
Filling, Singles and Palisade now declare a difficulty, so the notes that
named them describe a tree that is gone.

## note nothing holds a game's move shape across builds

`ts-engine`, "A move a save holds keeps replaying", has no collection-wide
check. `src/engine/save-round-trip.test.ts` saves and loads within one build
and cannot see a rename; `src/engine/save.test.ts` reads literal `v: 1` and
`v: 2` envelopes, with no game's moves in them. There is no frozen corpus of
saves. What exists is per game and per incident: Loopy's "save written before
notes existed" (`loopy-notes.test.ts`), Rome's off-grid mark, Mines' older
layout, Pearl's saved autosolve move. A guard would be a recorded move log
for each game, written once by the build of the day and replayed by every
later one, the shape `src/engine/params-stability.test.ts` has for params
encodings. Whether every move shape a past build wrote still loads today was
not audited: it needs each game's move type through the git log.

## note `engine-notes` holds one sentence of the move-shape rule

"A move dialect writes the fill-all as well as reading it" ends "A game SHALL
NOT rename its move discriminator to suit the engine, because the save format
replays the move log." That is `ts-engine`, "A move a save holds keeps
replaying", said of one field. It was left for whoever settles `engine-notes`:
the sentence could shrink to a reference.

## note citations of the cursor requirement that mean its neighbor

`moveCursor`'s comment in `src/engine/pointer.ts` and the comment in
`src/games/sixteen/index.ts` cite `engine-input`, "One keyboard-cursor
vocabulary across games" for the rule that one press reveals and moves. That
rule is "One arrow press reveals the cursor and moves it". The citations pass
the title check and point a reader at the wrong requirement.

## note "One arrow press reveals the cursor and moves it" is checked only for the shared shape

Its guard in `src/engine/cursor-vocabulary.test.ts` skips a `Ui` whose
`cursor` is not `{x, y, visible}`, so Loopy and Untangle are not walked, and
the requirement names no population. Read from
`src/games/untangle/index.ts`, not run: on a first arrow press with no vertex
lying that way from vertex 0, `interpretMove` sets `ui.cursorPoint = 0` and
returns `null`, so the cursor is revealed with no repaint asked for.

## note drags the engine's cancel cannot see

"The engine cancels a drag the board changed under" is true as written: it
ends every `GridDrag`. A drag held in a game's own fields is ended only by
that game's `changedState`, which Pegs, Signpost and Slide have. Sixteen,
Galaxies, Spokes and Map hold a drag in their own fields and declare no
`changedState`. Whether an undo under a live drag misbehaves in any of them
was not run. Two of them are close to the `GridDrag` population and are code
questions for a session on their input: Spokes holds the start cell and the
current cell as single indices with `-1` for none, and Galaxies holds a
source square and a dot in half-cell coordinates whose roles change with its
drag mode.

## note Untangle's spec does not state its cursor's shape

`untangle` says how the cursor vertex is drawn and picked up and never that
it is a vertex index under `ui.cursorPoint`, a field of the game's own
naming. `loopy` records the like departure in "Loopy's cursor is held under
ui.cursor in its own shape".
