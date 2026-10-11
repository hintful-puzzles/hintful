## Why

Winning looks different in every game. Measured on 2026-10-11, the win flash
runs from 0.13s (Dominosa, Pattern, Rectangles) to 0.7s, and in nearly every
game it blinks the whole board two or three times; Ascent, Net, Netslide,
Flood and Flip each sweep in a way of their own, Signpost spins its arrows,
Map and Signpost each offer a preference between two styles, and Cube has
none. Tracks alone runs a highlight along what the player built, and at a
fixed pace per square, so it takes 2.1s to 3.2s on 8x8 and 5.3s to 9.7s on
15x15 (six boards a preset).

The owner liked the Tracks animation and asked (2026-10-11) for the engine to
give every game that kind of win: a highlight that travels the board, in a
fixed time, along the path or the loop where the game has one.

## What Changes

- The engine owns the win animation: its length (2 seconds on every board, in
  every game), its pace, how much of the board is lit at once, and when it
  plays. A game says only where each of its elements sits along the route,
  and paints an element as lit when the engine says the highlight is on it.
- Four routes, which are one mechanism (a position along a route):
  - **a path**, from its start to its end: Tracks, Ascent, Signpost;
  - **a loop**, from its bottom-left corner, clockwise: Loopy, Pearl;
  - **a spread from the source**, along the connections: Net, Netslide,
    Flood;
  - **a diagonal sweep**, bottom left to top right, for every other game.
- Every game has the animation, Cube and Guess included, which had none.
- The win animation starts when the winning move's own animation has ended.
- A player who asks their system for reduced motion sees the whole board lit
  once, still, and no traveling highlight.
- **BREAKING** (owner's word, 2026-10-11): Map's `flash-type` preference and
  Signpost's `flash-type` preference are removed. A stored value for either
  is ignored.
- **BREAKING** for a game's source, internal: `Game.solvedFlash` is removed,
  and `redraw` takes a `Flash` where it took `flashTime`.
- A flash that is not a win stays the game's own, through `flashLength`: a
  death (Inertia, Mines), a board with no move left (Same Game), a loss
  (Flood).
- Black Box's blink on a reveal was its win flash, a reveal being the one
  move that solves its board, so it takes the sweep. The Solve command now
  reveals with no flash, as it does in every other game.
- Every element the highlight reaches changes: a given that already wears
  the lifted surface drops to the plain one while lit.
- What a lit element looks like stays each game's: the look its flash's lit
  beat has today. Which elements are lit, and when, is the engine's.
- The "Solved!" dialog still waits for the animation, so it opens up to about
  1.9s later than today in the games that blinked.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `ts-engine`: the win flash is the engine's traveling highlight, of one
  length, with no duration from the game.
- `engine-drawing`: what `redraw` is handed for a flash, and how a game asks
  whether an element is lit.
- `engine-colors`: the requirement on a solved flash's color loses its case
  for a flash that is an animation of the game's own.
- Each game whose spec states its flash's shape or length: `tracks`, `map`,
  `signpost`, `cube`, `crossing`, `fifteen`, `flip`, `inertia`, `lightup`,
  `mines`, `mosaic`, `net`, `netslide`, `palisade`, `pegs`, `range`, `rome`,
  `samegame`, `seismic`, `separate`, `singles`, `slant`, `subsets`, `tents`,
  `twiddle`, `unruly`. A spec that says only that the game flashes on
  completion stays as it is.

## Impact

- `src/engine/game.ts`, `src/engine/midend.ts`, a new `src/engine/win-wave.ts`.
- Every game's `render.ts` and `index.ts`.
- The frontend, for the reduced-motion signal: `src/puzzle/`.
- Every test that calls `redraw` directly, and the render snapshots of a
  flash frame.
- `docs/games/rendering.md` § "Animation and flash", and the help pages of
  Map and Signpost where they describe the removed preference.
