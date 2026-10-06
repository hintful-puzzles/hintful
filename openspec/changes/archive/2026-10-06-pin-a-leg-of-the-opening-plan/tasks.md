## 1. Read

- [x] 1.1 Take the sites again: every kind whose predicate calls the game's
      `hint` or reads `steps[n]` for `n > 0`, and every `hintUntil` left on a
      literal board. Measured 2026-10-06: three predicates asked the hint again
      (Netslide `journey`, Palisade `journey`, Slant `clueWithSecondSquare`;
      Tents no longer did), and five frames walked a literal board (Rome,
      Salad, Slant, and two in Pearl the scaffold did not list).
- [x] 1.2 Say what board a later leg is shown on, from `Midend.executeHint`:
      the one the midend holds after playing each earlier leg's gesture and
      letting it settle. The frame is taken there, through the midend; the
      loader does not rebuild that board from the steps' moves.

## 2. Build

- [x] 2.1 A predicate is given the plan, and a kind may be a `leg`, held by any
      step of the plan. Pearl is the check: its frame's snapshot did not move.
- [x] 2.2 `renderPinnedHint` draws a pin's step at whichever leg it is, and
      every site that fed a pin to `renderScenario` by hand takes it.
      `hintUntil` leaves `RenderScenario`.
- [x] 2.3 Rome, Salad, Slant and Pearl's frames read pins; Netslide, Palisade
      and Slant's predicates read the plan they are given.

## 3. Close

- [x] 3.1 `docs/games/testing.md` § "Pinning a hint's positions", and
      `docs/games/hints.md` § "Verifying a hint in-process".
