# own-the-mark-all-press-in-the-engine

**Status: asked for by the owner, 2026-10-11, of the two things
`make-the-help-pages-say-what-the-code-does` found and did not file.**

## Why

Each of the twelve games with the Mark-all press reads the letter `M` in its
own `interpretMove`, and three of them answer it differently from the rest,
as found on 2026-10-11:

- **The Fill marks button types a number.** The button sends the letter `M`.
  On a Solo grid of 22 numbers or more `M` is the number 22, so with a square
  selected the button enters 22 there (`src/games/solo/index.ts`, the letter
  arm above the Mark-all arm).
- **Group answers a capital `M` only**, on every board, because a small `m`
  is an element on a board of 13 or more. On a smaller board the `m` key does
  nothing.
- **Seismic's second press does nothing**, where ten games cross out what the
  board already rules out. Its hint has the same clean as a step of its own
  (`cleanObvious`), from a reach the press never read.

Undead's second press does nothing either, and that one is the puzzle's: a
monster placed in one square rules nothing out of another.

## What the engine does so that no game has this

- **The press is a button code of its own**, `MARK_ALL_BUTTON`, as the Marks
  key is `PENCIL_MODE_BUTTON`. The Fill marks button and a hint's gesture send
  it, and it is no letter, so no game can read it as one.
- **The move is a hook, `Game.markAll(state)`**, which replaces the
  `canMarkAll` flag: the midend calls it for the button, and a game's
  `interpretMove` never sees the press. A game cannot declare the control and
  not answer it, which is what `mark-all.test.ts` had to probe for.
- **The letter `M` is the engine's too.** The midend makes the press for `M`
  or `m` when the board's keypad (`requestKeys`) has no such letter. Where it
  has, the letter types and the button fills.
- **Seismic's hook cleans** with `obviousCandidateMarks` over the reach its
  hint already uses.

## What changes for a player

- Solo, 22 numbers or more: the button fills marks whatever is selected. `M`
  typed with no square selected no longer fills; it did, as a fall-through.
- Group, 12 elements or fewer: `m` fills marks, as `M` does. 13 or more:
  neither case fills from the keyboard (capital `M` did); the button does.
- Seismic: a press on a board whose empty cells all have marks crosses out
  the numbers each cell's area already holds and the numbers too near it.

No save, game ID or preference changes: the moves made are the ones the games
already have.
