# prove-no-solution-cheaply-in-the-games-that-search

**Status: filed 2026-10-10 by the session that archived
`refuse-a-board-with-no-solution-in-a-game-with-no-mistake-check`, which found
it. What it says of the code was true that day; re-check before relying on
it. Each board below was opened in the running app.**

## Why

Eight games with no mistake check still open a board nobody can finish.
`src/engine/no-solution-load.test.ts` holds one such game ID for each, under
`LET_THROUGH`, and a game leaves that list by gaining `Game.hasNoSolution`: a
proof, cheap on every board, that `loadDesc` refuses a board for.

What each says today when its board is opened (`/<game>?id=<the ID>`):

| Game | Hint | Show solution |
| --- | --- | --- |
| Flood | names a fill, on a board the limit cannot be met on | the same |
| Inertia | "The ball can no longer reach the outlined gem. Undo…" | "No solution can be found from this position. Undo…" |
| Netslide | "This game ID doesn't include its solution…" | the same |
| Pegs | "The outlined pegs are cut off… Undo until a peg can still land beside each." | "This puzzle has no solution." |
| Same Game | has none; the status bar says "Cannot move! Score: 0" | has none |
| Slide | nothing | "This puzzle has no solution." |
| Sokoban | "The outlined barrel is jammed… Undo until it can." | "This puzzle has no solution." |
| Twiddle | nothing | "Auto-solved", on a board no turns reach |

Three of these already hold the proof, inside the hint: Pegs' cut-off pegs,
Sokoban's jammed barrel, Inertia's gem out of reach. Each tells the player to
undo, at move 0, where there is nothing to undo.

## What Changes

- Each game that has a cheap proof states it as `hasNoSolution`, and its
  pinned board moves from `LET_THROUGH` to `REFUSED`.
- **The engine owns what a proof means, wherever it is asked.** The hook is
  about a position and not only the opening one: in a game that can be lost
  it holds for a dead position too. Today each such hint finds its own dead
  position and words the refusal through `searchRefusal`; Solve asks its
  search again. With the hook the midend can refuse a hint and a Solve from
  a position it holds for, in one place, and a game's hint keeps only what is
  the puzzle's: which pegs, which barrel, which gem to outline. Settle this
  on Pegs and Sokoban, which share `search-outcome.ts`, before a third game.
- The games with no cheap proof stay in `LET_THROUGH`, each with its reason
  in the comment on its entry.

## What to settle first

- **Is each proof cheap, and is it a proof.** Candidates, none measured:
  - Pegs, Sokoban, Inertia: what the hint computes today. Time it on the
    largest preset and on a board one edit from a dealt one. The measure to
    beat is the slowest load in the collection, 155 ms (Galaxies 15x15) when
    this was filed.
  - Flood: a lower bound on the fills left against the limit. The colors on
    the board other than the corner's each need a fill, which is sound and
    weak.
  - Twiddle: the invariants its turns keep. A block of odd side keeps every
    tile on its checkerboard color, and a block of side 3 or 4 is an even
    permutation; orientable tiles and the rows-only numbering add their own.
    Claim only what is proved, as Sixteen claims parity only for two odd
    sides.
  - Netslide: a net over `n` squares has `2(n - 1)` arm ends, which a tile
    count checks.
  - Slide: none is known. Its only proof is the search of every position.
- **For the owner: Same Game.** A checkerboard has no move and is not
  cleared, and a color with one tile can never be removed. Both are cheap
  proofs. But upstream's generator deals boards that may not be clearable when
  its "ensure solubility" option is off (`samegame.c`, the legacy generator),
  and an ID written that way is one a player may hold. Upstream writes the
  option as a trailing `r` in the full params only, so a board ID does not
  say which generator dealt it, and this app's codec does not read the `r`.
  Refusing such a board is a compatibility break, and whether a board played
  for score that cannot be cleared is a defect at all is the owner's call.
  The game already says "Cannot move!" in its status bar. Leave Same Game in
  `LET_THROUGH` until answered.

## Capabilities

### Modified Capabilities

- `engine-params`: nothing new for load. `engine-hints` or `ts-engine` if the
  midend takes over the refusal of a hint and a Solve from a proved position.

## Impact

- `index.ts` and the solver or hint of each game that gains the hook,
  `src/engine/no-solution-load.test.ts`, and `src/engine/midend.ts` with
  `src/engine/search-outcome.ts` if the engine takes the refusals.
- `src/capability-surface.test.ts` re-baselines for each game that gains the
  hook.
