# Design: let-the-engine-own-what-solve-shows

Owner, taking the change on (2026-10-02): *"my goal being to make everything here
consistent across all games."* That settles the proposal's two open questions at
once. Inertia, Slide and Flip move to the convention, and Black Box and Guess
stop revealing as a loss. Every game's Solve shows the finished board or refuses.

## D1. The engine holds the rule; no game declares an exception

`Midend.solve` refuses a solved board (`ALREADY_SOLVED`, as before) and a lost one
(`GAME_OVER`, the words a hint already uses there), then computes the state the
game's solve move leaves and **throws before committing it** when its status is
not solved. A throw rather than a refusal because a Solve that leaves anything
else is the game's defect, and Sentry should see it rather than a player reading
a polite sentence that hides it.

The proposal expected a declaration for games that legitimately cannot comply.
With every game moved to the convention there is nothing for such a declaration
to excuse, and a declaration with no consumer is the kind AGENTS.md refuses. So
none was built. If a future game cannot show a finished board, it refuses Solve
with a `SolveFailure` saying why. That is already the contract, and it is what
Mines before its first click does.

## D2. A lost board is refused, and the lost dialog stops offering Solve

The games with a lost status are Flood (past its move limit) and Guess (out of
rows). Black Box no longer has one (D4). No Solve move can make either of those
boards solved under its own rules, and Guess already shows its answer on a loss.
The end-of-game dialog offered "Show solution" on a loss. It now offers what the
refusal says, Restart and Undo, rather than a button that would only show the
refusal.

## D3. Per game

- **Inertia**: the solve move plays the whole route. The installed route
  (`route`/`routePos` on the state, `applyRoute`'s re-solving, Enter/Space to
  step, the route arrow) is gone. The ball jumps to the route's end
  (`distanceMoved: 0`), since one interpolated slide across a many-slide route
  would cross walls. The hint is the step-by-step aid, as it already was for a
  player who did not want to be marked as helped.
- **Slide**: the solve move plays the shortest route. The stored path, the step
  key, the next-piece accent band, the destination shadow and their palette slots
  (`COL_ROUTE`, `COL_ROUTE_SHADOW`, `slideRouteShadow`) are gone. Slide has no
  hint yet, so this removes its only walk-through. It is in
  `hintless-games-in-reserve`, which now says so.
- **Flip**: the solve move presses the solution's squares. The marker bit, the
  `hintsActive` flag and the outline rendering (`COL_HINT`) are gone. Flip has no
  hint either, and is in the same reserve.
- **Black Box**: Solve guesses exactly the real balls and reveals, which is a win.
  This exposed something the scaffold had not seen: the player's own verify is
  always cagey, so it reveals only a guess proven equivalent to the answer. The
  only path to a revealed-but-wrong arena was the old give-up Solve. So the full
  laser-by-laser comparison, `nright`/`nwrong`/`nmissed`, the `"lost"` status,
  the "N wrong and M missed" status text, and the wrong-guess cross and
  missed-ball rendering were all unreachable, and are removed.
- **Guess**: Solve submits the answer as the next guess, an ordinary `guess`
  move. The `solve` move type and the `revealed` field are gone.
- **Mines**: Solve on a dead board shows the finished board, replacing the opened
  mine and any wrong flags as Solve replaces any wrong entry, rather than
  upstream's corrections grid. The corrections-only cell values (`MINE`,
  `WRONGFLAG`) and the cross color (`COL_CROSS`) are gone.
- **Flood**: found by the sweep, not by the scaffold's ledger. Its greedy finish
  can overrun the move limit once the player has spent moves, which leaves a
  *lost* board. Its `solve` now refuses with `NO_SOLUTION_FROM_HERE` when it
  would.

## D4. Saved games

A move log replays through `executeMove`. Where a game's solve move now does
something different and a later move could follow it, the move was **renamed**:
Inertia `route` → `solution`, Flip and Slide `solve` → `solution`, and Guess's
`solve` is gone. An old save containing one is refused cleanly on load, rather
than replaying to a board the later moves no longer fit. That is the owner's
standing call (AGENTS.md § "Nothing is sacred": *"I'm perfectly ok with cleanly
rejecting saved games that are no longer valid"*). It affects only a save in
which Solve was used.

Black Box, Mines and Flood keep `solve`. No move can follow theirs: a revealed
arena and a dead board take none, and a flooded board takes no fill. So an old
save replays to the finished board.

## D5. What replaces the ledger as the guard

`position-status.test.ts`'s `UNBREAKABLE` listed the non-conforming games and was
the population the scaffold worked from. Two instruments now cover it:

- the midend's throw, which every Solve anywhere runs; and
- `solve-finishes.test.ts`, which solves every game from its deal and from
  positions reached by playing its own input. This is the sweep that found
  Flood, which no fresh-board check could have seen. It was proved to fail by
  planting Flood's old Solve back.

Freeing Slide from the ledger exposed a blind spot in the status walk. It dragged
only right and down, and Slide's key block, home in the exit's corner, can only
move left or up. The walk gained a second pass, from a freshly solved board, that
drags the other two ways. It is a separate pass because mixing those drags into
the first walk changed the positions it reached, and Bridges then went unbroken.

## Hints to pull in

None. The change touches Inertia's hint only in its comments and tests.
