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

## Behavior that changes for players

- **Net:** Space rotates clockwise (was: lock). A click parks the hidden cursor
  on the clicked tile. The first key on a hidden cursor only shows it.
- **Flood, Flip, Twiddle:** a click parks the hidden cursor; the first Enter on a
  hidden cursor only shows it (Flip and Flood acted on it). Flood's Space fills
  like Enter. A click off Flip's grid no longer repaints.
