# Design

Decided and built 2026-10-10. Every figure here was measured that day, on the
default deal of each of the 57 registered games through a real `Midend`, by
the sweep that is now `inputAnswers` in `src/engine/testing/input-probe.ts`
(about 11,000 to 60,000 inputs a game). Re-measure before relying on one.

## Context

`Midend.interpret` asks the game for a move, calls `executeMove`, and hands
the state to `commitMove`, which records it. `applyMove` and the Solve path
reach `commitMove` too, and a load replays a save's moves through it. The
engine had no way to ask whether two states are the same board.

## Decisions

### 1. Two boards are the same when they hold the same thing, part for part

`sameValue` in `src/engine/same-value.ts`: plain objects (same prototype, same
own keys), arrays, typed arrays, maps and sets, compared by value, with a part
both states share by reference equal at once and a value that holds itself
ended. A kind it cannot read (a `Date`) throws by name. No game writes
anything, and no hook was added to `Game`: no game's state held a kind the
comparison could not read.

- *The same object* was not enough: none of the seven returns the state it
  was given.
- *Agreement.* Over every `executeMove` the sweep made (about 170,000 pairs)
  it gave the same answer as the test probe's digest (`ProbeBoard.board`)
  every time.
- *Cost.* On a real move, a mean of 0.2 to 6.4 microseconds a game (Loopy the
  dearest), since `executeMove` shares what it does not change. The worst
  case, two equal boards that share nothing, on each game's largest preset
  that deals in under four seconds: 0.46 ms (Loopy, 9x11 of its largest
  tiling), and under 0.12 ms everywhere else. It runs once an input.

### 2. A state that differs where the picture does not has changed

The comparison is of the state, so a move that changes only what the state
keeps unseen is a step still. That is not this defect, and the requirement
says so. No game was found whose state changes on every move by bookkeeping
alone (a counter, a last-move marker), which would have kept the comparison
from ever firing: the seven of the proposal are all caught.

**Untangle was the one of the seven the comparison did not reach in the
running app**, and is the one game edited for it. A vertex is held as a
fraction; picking one up with Enter reads it at the pixel the tile size on
screen gives, and putting it down wrote that pixel back. At the probe's tile
size the two are one value, which is why the sweep saw the same board. At the
size Chrome drew, they are not, so Enter, Enter, Enter moved a vertex by less
than a pixel and cost a step. The put-down arm now places a vertex that was
not nudged back as it was held. A pointer press on the very pixel of a vertex
and a release there still rounds it; the press one pixel off always moved it.

Six games made moves that changed the state and left the frame of a fresh
`Ui` as it was. They are not fixed here and are listed for whoever reads
those games next: Magnets (`countsDone`, 540 of the moves the sweep made),
Subsets (`ruledOut`, 18), Tracks (`sflags`, 11), Salad (`pencil`, 8), Undead
(`hintsDone` and `pencil`, 6), Rome (`pencil`, 5). Some of these paint under
a `Ui` the measurement did not use (a mode, a cursor), so this is where to
look and not a finding.

### 3. Who drops a move

- **The player's input drops it** (`Midend.interpret`).
- **A hint's gesture drops it too** (`playHintGesture`), by the same test. A
  step whose only move changes nothing therefore never completes, and the
  gesture throws "does not complete its step" as it does for any hint that
  asks for what the pointer does not do. Nothing is hidden: the defect is
  thrown where it was silently recorded before.
- **Solve does not need to.** The midend refuses Solve on a solved board
  before asking the game, and throws on a move that does not leave one, so a
  Solve move always changes the board's status.
- **A load's replay and `playMoves` record what they are given.** A save
  written before this change may hold such a move, and its position counter
  counts it: it loads with every move where the save has it, and saves again
  byte for byte. The fixture in `midend-unchanged-move.test.ts` was written
  by the build before the midend changed. `playMoves` is a harness's setup,
  authored move by move.
- **A drag's joined moves.** A mark of a declared sweep that changes nothing
  is dropped and the sweep carries on. The join is "a later mark of this
  drag", which the sweep counts by marks made; with a dropped first mark that
  would have joined the drag to the move before it, so the midend joins only
  where an earlier move of the same gesture is in the history.

### 4. What a dropped move is answered as

A change of `Ui`: claimed, repainted, announced, with no history entry, the
moves ahead kept for Redo, and no animation. The hint on display is treated
as for any UI-only input (`uiUpdateClearsHint`), where the move it was would
usually have been off the plan and put the hint away.

**`changedState` still runs**, against the design as filed. The game asked
for a move, and a game settles its `Ui` there after one: Untangle ends its
drag in `changedState`, and the engine ends every `GridDrag`. Without it a
dropped move leaves the gesture open. This was checked by comparing, input by
input, every game's answer, `Ui` and board under the sweep against the same
sweep at HEAD: 55 games are identical, Net cannot be compared (its jumble is
random, and it differs from itself run to run), and Untangle differs in one
field, `ui.animLength`, which its `animLength` hook writes and which nothing
reads while no animation runs.

## The mirror: a `Ui` changed under "nothing happened"

The sweep's other question found eight games, not one. An input answered
"nothing happened" changed the frame in Untangle (the first arrow), Clusters
(a drag that hides the cursor), Crossing (a key that puts the held number
down), Group (a drag along the legend), Netslide, Signpost and Tracks (a press
that hides the cursor) and Samegame (a press that hides it, a key that shows
it). In each the frame on screen stayed as it was until some later input
painted it.

The same finding in eight games is the engine's. **The midend now copies the
`Ui` before it asks the game, and where the game answers "nothing happened"
and the `Ui` differs, asks for a repaint.** The answer is left as the game
gave it: the input is not claimed and no transition is announced.

- Why not answer it as a UI-only change. The `Ui` holds more than is painted:
  a target-verb game parks its hidden cursor where a press fell, which is
  hundreds of declined presses a game in the sweep. Claiming those would
  change which presses the view tracks and which keys fall through to the
  app's shortcuts, and announcing them would take down a mistake overlay on a
  press the game refused. A repaint is the one consequence that is always
  right.
- Untangle's arrow arm answers `UI_UPDATE` where it shows the cursor, as the
  proposal asked.
- The other seven still give the wrong answer, with the right frame. They are
  named in `input-answers.test.ts`, asserted exact so an eighth fails, and
  `openspec/changes/claim-an-input-that-changed-the-ui` is where the answer
  is settled.

## The guard

`src/engine/input-answers.test.ts`, over every registered game:

- no move that left the board as it was is a step of the history;
- no move that changed the board is left out of it (the risk below);
- the games still make the moves the midend keeps out, which is what the
  sweep is trusted on: the seven of the proposal are pinned as positives;
- no frame a game changed while answering "nothing happened" is unpainted;
- every game makes at least one move under the sweep.

Each half was seen to fail: with the drop switched off the first names
exactly the seven; with the repaint switched off the fourth names the seven
of the mirror; with a comparison that skips a typed array's first element the
second names twenty-eight games.

Pegs and Slide are still hardly reached: 7 and 16 moves, since a jump and a
slide want a drag aimed at a legal landing and the sweep aims at none. The
sweep drags one and two tiles from every probe point and walks at random; a
guard that plays those two games needs their geometry.

It costs about 27 seconds. Dealing afresh for each script made it 270: the
games that prove their board at load take up to 11 ms a deal, so the sweep
rewinds by a restart and the deal's `Ui` put back.

## In the running app

Chrome, 2026-10-10, a new game of each, reading the menu's "Move n of n":
Loopy (Right, Backspace), ABCD (Marks, Down, Backspace), Mathrax (Marks, a
click on three squares, Backspace on each), Group (a click on three cells,
Backspace on each), Pearl (a drag into the square below and back), Galaxies
(a right click that joins a tile, and the same click again) and Untangle
(Up, Enter, Enter) each leave the counter where it was, and in each the move
beside it (an entry, a drag that ends a square away, a nudge before the
put-down) raises it by one and Undo takes it back. Untangle's first Up shows
the cursor.

## Risks

- A comparison that is wrong about a game's state drops a real move, which is
  far worse than the defect → the guard's second half, and `sameValue`
  refuses what it cannot read.
- A comparison on every move slows a large board → measured in 1.
