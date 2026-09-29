# sweep-target-verb-input — design

Started 2026-09-29 at `74a07eb2`. Every figure is history the moment it is
written.

## Task 0: the misfits, answered

### Net

**Space was the question, and the answer is the convention.** Net put its lock
on Space and its clockwise rotation on D. Neither a key map nor a fourth verb
slot is needed: no puzzle explains a lock on Space, and 23 games agree that
Space does what the right button does. So Net's Space now rotates clockwise, as
its right button does, and the lock keeps S and the middle button (or
Shift-click). A player-visible change, decided rather than asked, because one
answer is plainly the collection's and the old one was an inherited binding.

**The walk past 2,000 positions was not the Ctrl-arrows.** The walk presses only
bare arrows. Net's `Ui` carried the jumble RNG, seeded from `crypto` entropy on
every `newUi`, so every replay produced a `Ui` digest never seen before and no
position ever repeated. The RNG is neither the player's position nor anything
replay reads (a jumble is recorded as its expanded ops), so it moved to a
lazily-seeded module variable, and the walk now closes at the grid's 25
positions.

**What the model grew for Net**, and nothing else:

- `keyOnly` verbs: a verb with keys and no button (F, half a turn). The
  paragraph writes "Press F to …", and the guard asserts each such key reaches
  some board, since it has no button to agree with. Proven red with F's `apply`
  returning `null`.
- `pointerTarget` receives the `Ui`: Net draws a wrapping grid scrolled by an
  origin the `Ui` holds, so which tile a press lands on depends on it.

And one for every game with a middle verb: the paragraph says "Middle-click it
(or Shift-click it)", because the frontend sends a Shift-click as the middle
button (`view-interactive.ts`). Net's page said so by hand before.

### Flood, Flip, Twiddle

Declared with no model change beyond one: `squareGrid`'s `border` receives the
state, because Twiddle's target is a block's *center* and the catchment's inset
grows by (n−1) half-tiles with the block size. Twiddle's corner and numpad keys
stay an arm above the hand-off. Flood gains Space as a second Enter (the
convention for a game without a second verb).

### What the rest of the members needed from the model

Read across the remaining members before changing anything, so the model grew
once for all of them:

- **`apply(state, target, ui)`, returning a move, `UI_UPDATE` or `null`.**
  Slant's **Mouse button order** preference swaps what each button does (so
  Enter and Space, which do what the buttons do, swap with them); Mines counts
  a death in its `Ui` when a square opens onto a mine; Black Box re-flashes a
  laser already fired, which changes nothing but the screen.
- **The model reads only `ui.cursor.visible`.** Loopy's cursor is a dot and an
  edge, not a square; where a cursor is belongs to the geometry.
- **The guard presses keys only where the cursor rests on a target.** The
  instrument pressed keys at every walked position and clicked only from the
  opening one, so any state a cursor walk reaches and a click cannot — Subsets'
  tally band, entered with a cell in focus — read as the keyboard doing more.
  What a key does off every target is an arm's business, and the paragraph the
  guard checks says nothing about it. `boardsReached` takes a `keyAt` filter,
  and the guard asserts the filter left more than one position.

### Magnets

The clue ring is part of the geometry: targets run from −1 to `w` and `h`, and
the cursor walks the ring (skipping the four corners, which hold no clue), so
a keyboard player can mark a clue done — the gap the survey measured (52
boards by click, 30 by Enter). Left-click and Enter on a clue mark it done; the
right button does nothing there. The clue slot draws the cursor's wash.

### Palisade, Separate: one model of the edge

`interpretBorderGridInput`, `selectEdge` and the pointer half of `pointerEdge`
became `borderGridGeometry` and `borderGridVerbs` (the game supplies only
`toMove`). The two models had disagreed on one case the pilot's instrument
never saw, because it primed nothing: Space on a **wall** cleared it, while a
right-click turned it straight into a not-a-wall mark (and Enter on a
not-a-wall cleared it where a left-click made a wall). One verb per button
settles it on the pointer's cycle, which is also one press shorter.

### Dominosa

Its half-grid cursor is the same idea as the border grid's but addresses a
*pair of numbers* (the domino between them), so it has its own geometry with
the half-grid position carried in the target, which is what lets a press park
the cursor there. The number-highlight right-click in a square's middle, the
digit keys and the reference-spotlight dismissal stay arms of Dominosa's own.

### Slant

Notes mode is an arm (a tap marks a side, the keyboard pins and marks), because
the verbs are the lines. `\`, `/` and Backspace/Delete are key-only verbs.

## Behavior that changes for players

- **Net:** Space rotates clockwise (was: lock). A click parks the hidden cursor
  on the clicked tile. The first key on a hidden cursor only shows it.
- **Flood, Flip, Twiddle:** a click parks the hidden cursor; the first Enter on a
  hidden cursor only shows it (Flip and Flood acted on it). Flood's Space fills
  like Enter. A click off Flip's grid no longer repaints.
- **Magnets:** the cursor reaches the clues; Enter marks one done.
- **Palisade, Separate:** Space on a wall makes it a not-a-wall mark, and Enter
  on a not-a-wall mark makes it a wall, as the buttons always did (both used to
  clear the mark). A click parks the cursor only on an edge it hits.
- **Dominosa:** the first Enter or Space on a hidden cursor only shows it.
- **Slant:** with the buttons swapped, Enter and Space swap too. `\`, `/` and
  Backspace on a hidden cursor show it first. An arrow against the edge no
  longer repaints.
