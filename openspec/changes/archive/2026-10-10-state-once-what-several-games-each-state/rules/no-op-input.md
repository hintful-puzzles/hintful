# Rules: no-op-input

## not-shared an input that would change nothing makes no move

No shared requirement, because the code does not make it true of every game
and no line divides the games it holds for from the others.

What I read. `Midend.interpret` and `Midend.commitMove` in
`src/engine/midend.ts`: a move `interpretMove` returns is executed and
recorded in the history unconditionally, and the midend never compares the
board it leaves with the one before. `interpretTargetVerbs` in
`src/engine/target-verb.ts`: a verb's `apply` is the game's function and its
answer is returned as it is, so the declarative form drops nothing either.
`noOpEntryResult` in `src/engine/note-taking-cell.ts` only says what a no-op
entry does to the highlight; `engine-notes`, "A game in the mechanic keeps its
puzzle and its own move", leaves "the predicate that decides whether a
keystroke is a no-op" with the game. `src/engine/testing/input-probe.ts` has
no question about it and no cross-game test asks one. The rule is therefore
each game's own code, as `docs/games/mechanics.md` § "interpretMove and
UI_UPDATE" tells a porter ("Suppress no-op moves locally here — never by
comparing states").

Then I looked for a game it is false of, with a scratch sweep outside the
tree: every registered game on its default board through `probeBoard`, a real
`Midend`, about 4,500 to 9,000 inputs a game (a click, the same click again
and a drag out and back at every probe point with each button, then 400
random arrows, clicks and keys, each key twice, once with notes mode on),
counting every input that moved the move counter and left the state's digest
as it was. Seven games made such a move; they are in the note below. Fifty
made none, of which Pegs (no move at all) and Slide (five moves) were hardly
exercised.

So the games keep their sentences: `pearl` "A Pearl input that changes
nothing makes no move", `tracks` "A Tracks interaction that changes nothing
makes no move", `salad` "A Salad move that would not change the board is a
no-op", `abcd` "An ABCD entry that changes nothing is no move", `rome` "An
input that changes nothing adds no history", `net` "No-op inputs are
suppressed locally", `sticks` "A block takes no line, and a no-op is not a
move", and the sentence of it in `tents`, `rect`, `unruly`, `separate`,
`slant`, `towers`, `unequal`, `mathrax`, `keen`, `seismic`, `crossing`,
`undead`, `map`, `clusters`, `sokoban`, `lightup` and `slide`. Each is that
game's promise and nothing shared holds it. Mosaic's spec does not state
rule 1 at all (its note was about the margin).

`engine-input`, "The on-screen key probe primes the board", calling Clear on
an empty cell "a legitimate no-op" is not a departure: it says such a key
rightly makes no move there, which is this rule, and warns a probe not to
convict the key for it.

## note the midend records every move it is handed and compares no boards

The one thing about rule 1 that is the engine's and true of every game: the
midend records every move it is handed and compares no boards
(`Midend.interpret` calls `executeMove` and then `commitMove`, which calls
`record` with no test of the state; `src/engine/midend.ts`). A session
writing `interpretMove` reads this requirement for what its three answers
mean, and today it does not learn that returning a move always costs the
player a step of Undo. The seven games of the note below show the behavior.
`record` pushes the state, the move and the join flag and reads none of them.

A scratch run outside the tree drove it through a real `Midend` (Loopy:
Right, then Backspace, on the deal: the move counter goes from 0 to 1 and the
state's digest and the painted frame are the ones before).

The two agents that settled and reviewed this family wrote that behavior into
`ts-engine`, "A UI-only input redraws without a history entry", with a
scenario "A move that leaves the board as it was is still a step". The
session that owns the change took it out: an Undo step that shows no change
is the defect of the note below, a requirement that says the midend SHALL
record it would make the defect the rule, and the change filed for the
defect is where the midend's part is decided. The requirement is left as it
was.

## reword `engine-input`: A target and its cursor belong to the geometry

Rule 2, a press that addresses no target makes no move. Population: every
game that declares `targetVerbs`, for each press it hands to
`interpretTargetVerbs` (derived by who calls it: Black Box, Boats, Bricks,
Clusters, Dominosa, Flip, Flood, Galaxies, Light Up, Loopy, Magnets, Mines,
Mosaic, Net, Palisade, Pattern, Range, Separate, Singles, Slant, Spokes,
Sticks, Subsets, Tents, Tracks, Twiddle, Unruly, which are exactly the games
declaring the hook). What makes it true: `interpretTargetVerbs` in
`src/engine/target-verb.ts` asks `geometry.pointerTarget` first and returns
`null` when it answers `null`, before `pressTarget` parks or hides the cursor
and before any verb's `apply`. `squareGrid`'s `pointerTarget` answers `null`
outside the grid. It is not true of a press an arm of the game's own takes
first (Singles' click outside the grid toggles a preference, Net's press in
the margin of a wrapping grid starts a scroll, Tracks and Slant in notes mode
open their own drag), which `engine-input`, "A verb is the game's function,
and other input is the game's own arm", already allows, so the sentence
excepts it. A game that does not declare `targetVerbs` decides by its own
code and is not covered. No requirement of `engine-input` said this:
"The engine owns a declaring game's press and select keys" speaks of a press
"that applies nothing" on a target, and has no room for more.

The third sentence of the paragraph is the one addition. A reword and not an
edit, for the second scenario: the neighboring requirement has a press that
applies nothing hide a shown cursor, and the case the sentence does not show
is that a press on no target does not. Read again in review: the `null` is
returned before `pressTarget`, before `beginSweep` and before any `apply`,
and a button the game gives no verb never reaches the geometry at all.

### Requirement: A target and its cursor belong to the geometry

A target is whatever the game aims at: a square, an edge between two cells, a
clue beside the grid. Where the cursor is, and how the arrows move it, SHALL
belong to the geometry, and the engine SHALL read only whether the cursor
shows. A press at a point the geometry gives no target SHALL apply no verb,
leave the cursor as it was and make no move, unless an arm of the game's own
took the press first. The declaration SHALL also admit a verb reached only by
keys, with no button.

#### Scenario: A game aims at an edge

- **WHEN** a declaring game's target is an edge between two cells
- **THEN** its geometry says which edge a press addresses and which the cursor
  rests on, and the engine reads from the `Ui` only whether the cursor shows

#### Scenario: A press in the margin leaves a shown cursor showing

- **WHEN** a declaring game with no arm of its own for the press shows its
  cursor on a square, and the player presses in the margin outside the grid
- **THEN** no verb is applied, the cursor stays shown on that square, and undo
  offers no step for the press

## edit `mosaic`: A Mosaic press toggles a cell and a drag repeats it

`engine-input`, "A target and its cursor belong to the geometry", now holds
it. Mosaic's `interpretMove` (`src/games/mosaic/index.ts`) has no pointer arm
of its own: it hands every press to `interpretTargetVerbs`, and its geometry
is `squareGrid`, which gives no target in the margin.

from: A click in the margin SHALL be ignored.
to:

## edit `slant`: A click cycles a square through its three states

`engine-input`, "A target and its cursor belong to the geometry", now holds
it: outside notes mode Slant hands the press to `interpretTargetVerbs` over a
`squareGrid` (`src/games/slant/index.ts`). The notes-mode arm, which is
Slant's own, refuses a press outside the grid too, and "A notes-mode press
marks the nearest side" states that press as one on a square.

from: A click outside the grid SHALL be ignored.
to:

## edit `lightup`: Light Up accepts pointer and cursor input

The half about a click outside the grid is `engine-input`, "A target and its
cursor belong to the geometry": Light Up's `interpretMove`
(`src/games/lightup/index.ts`) is one call of `interpretTargetVerbs` over a
`squareGrid`. The wall stays, since a wall is a target and it is the game's
verb that refuses it.

from: A click on a wall or outside the grid SHALL be a no-op.
to: A click on a wall SHALL be a no-op.

## keep `tracks`: A Tracks interaction that changes nothing makes no move

"Interactions outside the grid" is not the engine's here: Tracks' own press
arm in `interpretMove` (`src/games/tracks/index.ts`) tests `inGrid` and
returns before the hand-off to `interpretTargetVerbs`, so the shared sentence
excepts it. The rest is rule 1, which is not shared.

## keep `net`: No-op inputs are suppressed locally

Net's geometry does answer no target outside the grid and in the gutter, but
arms of Net's own take presses first (the margin scroll of a wrapping grid,
the notes), and the gutter and the locked tile are Net's own cases. It also
states a departure from rule 1's neighborhood that nothing shared says: a
turn that undoes the turn before it is still a move.

## note seven games make a move that leaves the board as it was

Each enters the history as a step of Undo that shows no change. Found by the
sweep described under the first entry; the sites are in each game's
`index.ts`.

The reviewer reproduced all seven, each from the deal of `probeBoard` (the
default params, a fresh `Ui`) through a real `Midend`, in a scratch file
outside the tree. In each, the last input named takes the move counter up by
one and leaves both the state's digest (`ProbeBoard.board`) and the painted
frame (`ProbeBoard.seen`) as they were. The move it makes is in parentheses.

- **ABCD**: the Marks key (notes mode on), Down, Backspace. The cursor is on
  the empty, unmarked square (0,1) (`enter` there with `letter: null`). Space
  and `0` go the same way. `interpretMove` tests `noOpEntry` only when
  `!ui.pencilMode`. Its own requirement "An ABCD entry that changes nothing
  is no move" says otherwise. With notes mode off the same Backspace makes no
  move.
- **Mathrax**: the Marks key, a left click on an empty, unmarked square that
  is not a given, Backspace (`set` there with `n: 0, pencil: true`). With
  notes mode off the same Backspace makes no move: only an entry equal to
  what the square holds outside notes mode is suppressed.
- **Loopy**: Right (which shows the cursor on an undecided edge), Backspace
  (`set` of that edge to undecided). Delete goes the same way. `nextLineState`
  answers `LINE_UNKNOWN` for an erase key whatever the edge holds, and
  `setEdge` makes the move. A second Backspace on an edge the first cleared
  is the same.
- **Pearl**: a left press in a square, a drag into the square below it, a
  drag back into the pressed square, release there (one move of four `flip`
  ops, each segment flipped twice). Its own requirement "A Pearl input that
  changes nothing makes no move" says otherwise.
- **Galaxies**: a right click on an undecided tile that joins it to a dot
  (a move that changes the board), then a right click at the same point (an
  `assoc` of that tile to the dot it already has).
- **Untangle**: Enter (shows the cursor on a vertex), Enter (picks it up),
  Enter (puts it down) with no arrow between: the third makes a `place` of
  the vertex where it is. The pointer makes the same move only by a press on
  the very pixel of a vertex's center and a release there, or a drag that
  returns to it; a press one pixel off moves the vertex to the pointer, which
  changes the board and is not this defect. The release arm and the keyboard's
  put-down both "always commit".
- **Group**: a left click on an empty, unmarked cell, then Backspace (`set`
  there with `n: 0`); and a left click on a cell, `a`, a left click on it
  again, `a` (the second `set` of the element it holds). The second is partly
  by design (`group`, "A diagonal drag fills a whole diagonal at once":
  "Filling a cell SHALL be idempotent", so a run may cross a cell that already
  holds the element), but a run in which no cell changes still makes a move.

A change that fixes these in the games, and then adds to
`src/engine/testing/input-probe.ts` the question the sweep asked ("did a move
leave the state's digest as it was?", by `ProbeBoard.moves` and
`ProbeBoard.board`), could state rule 1 once in `ts-engine` or `engine-input`
and cut the games' sentences listed under the first entry. Until a guard
holds it the rule is a porter's habit. Group's idempotent fill would be the
one named departure to decide.

## note docs/games/mechanics.md overstates the rule's hold

§ "interpretMove and UI_UPDATE" gives the rule ("Suppress no-op moves locally
here") and says what upstream's games did. Nothing there, and no test, says
that seven of this tree's games do not. Whoever takes the note above should
point the guide at the guard.

## note the sweep hardly reached Pegs and Slide

Pegs made no move and Slide five under the sweep's inputs (a jump and a slide
want a drag aimed at a legal landing), so "no unchanged move found" says
little about either. A guard built from the sweep needs a drag that lands.
