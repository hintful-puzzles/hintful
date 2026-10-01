# derive-completion-from-the-position: design

## Task 0: the populations, and the falsifier

Taken 2026-10-01 at `34790801` by reading every game's source by shape (a
completion record under any name: `completed`, `solved`, `reveal`, a move count,
a clue counter), not by grepping `completed`.

### 1. Writes: latched or recomputed

| Behavior | Games |
|---|---|
| **Latched, and a solved board accepts moves that break it** (the population the owner's decision changes) | 43: ABCD, Ascent, Bricks, Bridges, Clusters, Crossing, Dominosa, Filling, Galaxies, Group, Rome, Salad; Keen, Light Up, Loopy, Magnets, Map, Mathrax, Net, Pattern, Pearl, Range, Rect; Seismic, Signpost, Singles, Slant, Solo, Spokes, Sticks, Subsets, Tents, Towers, Undead, Unequal, Unruly; Fifteen, Sixteen, Netslide, Slide, Twiddle, Sokoban, Flip |
| **Recomputed, breakable**: a broken solved board already reads unsolved | 5: Boats, Palisade, Separate, Tracks (as upstream), Untangle (upstream latches; nothing records why the port diverged) |
| **A finished board takes no move that could break it**: latch and recompute agree | 9: Flood, Same Game, Inertia, Black Box, Mosaic, Mines, Guess, Pegs, Cube |

The proposal named four recomputing games. There are five breakable ones, and
two of the four it named (Flood, Same Game) cannot be broken at all.

**`newState`** hard-codes "unsolved" in every game except Slide, Mosaic,
Untangle, Inertia (it counts the gems) and Palisade (and Palisade only for the trivial `k === w*h` board). A
game ID typed in already solved therefore reads "ongoing" at move 0 in Fifteen,
Sixteen, Netslide, Twiddle and Net, and could in any other game whose desc can
carry a finished board.

**The solve move** is written three ways: `completed = true` without checking
(ABCD, Filling, Group, Salad, Keen, Palisade, Pattern, Range, Separate, Solo,
Towers, Undead, Unequal, Unruly), `completed = check(next)` (Crossing, Rome,
Boats, Mathrax, Seismic), or a fall-through to the ordinary check (the rest).
**The cheat flag** is set unconditionally on Solve in most games, but only when
the solve finished the board in Boats, Rome, Mathrax, Seismic, Spokes, Sticks
and Subsets. Bridges spells it `solved`. Pegs, Sokoban, Cube and Same Game have
no Solve.

### 2. Reads outside `status`, `flashLength` and `statusbarText`

- **The predicate answers them** (is the board finished now): `interpretMove`
  guards (Mosaic, Mines, Guess, Black Box, Inertia), `executeMove` guards
  (Flood, Cube's paint swap), redraw (Flood, Same Game, Guess, Black Box),
  hint planners on scratch states (Ascent, Rect), hint refusals (Fifteen,
  Sixteen, Netslide, Flood, Guess, Inertia).
- **A "became solved" transition**: `changedState` hiding the cursor (ABCD,
  Ascent, Light Up, Magnets, Signpost, Singles); Dominosa clears its hover in
  `flashLength`. The engine sees the transition, so these are engine facts.
- **"The solver was used"**: Net's status bar hides its Active counter on
  `cheated || completed`.
- **First-solved history**: Flip stops counting moves once solved.

### 3. The flash

The trigger is always a status transition the engine sees, except for:

- **Outcomes that are not statuses**: Same Game's stuck board, and the deaths
  in Inertia and Mines. Status stays "ongoing" (as upstream; Mines holds the
  timer with `timerHolds`).
- **Black Box flashes on Solve**, which `winFlash` suppresses (as upstream).
- **Two outcomes**: Flood (won and lost).

What is about the board is the **duration**: it scales with board size in
Ascent, Net, Netslide, Flood and Flip, Galaxies triples it, and Map reads it
from a preference.

### 4. Status-bar words that are not `completionStatus`

- **The game's own phrases**: Guess ("Solved in N guesses."), Flood ("FAILED!"),
  Same Game ("Cannot move!"), Inertia and Mines ("DEAD!", "Deaths: N"), Black
  Box, Mosaic ("Clues left"), Galaxies (difficulty), Net, Rect, Palisade
  ("Region size"), Separate ("letters per region"), Salad (its symbol range).
- **History**: the frozen "Moves: N" in Fifteen, Sixteen, Netslide, Slide,
  Twiddle, Cube and Flip, and "Moves since auto-solve" in Fifteen, Sixteen,
  Netslide and Twiddle. Fifteen counts tiles and Slide merges repeated drags,
  so neither counter is the history index. **The engine fact is therefore the
  state at first-solved and at solver-used, not a move number**; the game reads
  its own counter off that state.
- **No completion words at all**: Salad, Separate and Palisade never say
  `COMPLETED!`.

### Falsifier: it does not fire

No game's won or lost needs the history of how it was reached. Three facts
look like history and are not: each is visible on the board and stays in the
state as part of the position.

- **Black Box's `reveal`**: the arena is open.
- **Guess's revealed answer**: the answer row is shown.
- **Mines' layout and first click**: already part of the position through
  `supersededDesc`.

Inertia's death is a ball on a mine, so it is a position too. The shape stands.

### What the census found wrong today

- **Loopy's `checkCompletion` writes `lineErrors` into the state**, so it
  cannot be called from a pure `status` as it stands.
- **Mosaic's solve move sets its clue counter to 0 without counting.**
- **Galaxies' `statusbarText` writes its cached difficulty into the state.**
- **Inertia's dead ball and Same Game's stuck board run the timer**, where
  Mines' identical death holds it.
- **Sixteen's Solve keeps the move count**, where Fifteen, Netslide and Twiddle
  reset it to 1.
