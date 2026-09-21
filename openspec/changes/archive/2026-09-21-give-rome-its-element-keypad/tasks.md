# give-rome-its-element-keypad — tasks

## 1. Decide the scope before building

- [x] 1.1 Classify all four keypad-less note games rather than assuming the rule
      is universal (`AGENTS.md`: *can we say what a game would legitimately want
      to do differently?*). **Rome** yes — four arrows, an enumerable per-cell
      set, already typeable. **Loopy** and **Slant** no — their marks are
      positional and relational (*which corner*, *which pair of squares*), so
      there is no element for a button to name and both already place theirs by
      tapping. **Map** enumerable but set by the drag's *origin*, so element keys
      mean giving it key entry it has never had for colors either; left open.

## 2. Rome

- [x] 2.1 Four arrow keys plus Clear, sending the character codes
      `DIGIT_DIRS` already answered — no new input path.
- [x] 2.2 **A tap that commits nothing selects the square, in both modes.** This
      is what the panel rests on: its keys enter at the cursor, and a touch
      player has no arrow keys to move one with. Additive by construction —
      both arms (a tap in notes mode, a release back onto the arrow already
      there) were bare no-ops, so nothing that made a move stopped making one.
- [x] 2.3 Clear clears what the mode is entering, not always the arrow.
- [x] 2.4 Tests pinning all three, and the panel's contents. Proved failing by
      reverting the selection: **two** of them go red, which is the point —
      without it the keys are unreachable rather than awkward.
- [x] 2.5 Ran the app: tapped an empty square and placed an arrow by button;
      armed Marks, tapped a square, toggled two marks by button, with the
      pencil indicator lit. Neither needed a drag.

## 3. What was deliberately not built

- [x] 3.1 **No cross-game guard**, and the reason is measured rather than
      assumed. The property — every element a cell's notes can hold is
      reachable from the panel — needs a shared *select this cell* primitive
      that does not exist: games select by tapping their own geometry, and
      `CURSOR_SELECT` does not show the cursor in several of them. A first probe
      pressing at `(0, 0)` reported **ten games with no reachable element**, all
      false; tracing Keen showed its `CURSOR_SELECT` returns `null` and leaves
      the cursor hidden, so the probe never selected anything
      (`AGENTS.md` § "Check the instrument before the finding" — and the shape
      this repo has produced a fictional multi-game defect from before).

      Recorded in `docs/games/input.md` as a rule for the next game plus what
      the probe got wrong, rather than shipped as a weaker proxy that would pass
      over the thing it claims to check.
- [x] 3.2 **Map's element keys are an open question**, stated in the proposal
      rather than filed as work: it changes how the game is played, not how its
      notes are reached, so it is the owner's call.
