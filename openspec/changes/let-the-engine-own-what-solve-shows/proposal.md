# let-the-engine-own-what-solve-shows

**Status: scaffolded, not started (2026-10-02).** Owner, reviewing
`add-pegs-hint`: *"the main thing for me is that we're consistent with how this
gets applied across games (preferably by the engine deciding), and it seems to
me that the only consistent thing is to just show the one peg, even if it's not
particularly useful."*

## Why

What Solve leaves on the board is each game's own choice today: `Midend.solve`
applies whatever move the game's `solve` returns. Nearly every game returns a
move that leaves the finished board, which is the convention the owner names.
The games whose Solve does not leave a solved board are the ones
`position-status.test.ts` ledgers in `UNBREAKABLE`, which is the population to
work from rather than a list typed here:

- **Plots without playing**: Inertia and Slide install a route and move nothing;
  Flip marks the lights to press and presses none.
- **Reveals as a loss**: Blackbox and Guess show the answer, which ends the
  game lost.
- **Nothing to solve yet**: Mines before its first click.

Since nothing in the engine states the convention, a new game is free to pick
any of these, and a player meets three meanings of one control.

## What

Make "Solve leaves the finished board" the engine's rule: `Midend.solve`
checks that the position its move leaves has status `solved`, and fails loudly
when it does not. A game that legitimately cannot (a reveal that loses, a board
not yet dealt) says so through a declaration the engine consumes, with its
reason, rather than by doing something else silently.

## Decisions for the owner

- **Inertia, Slide and Flip** would change for players: Solve would show the
  finished board instead of a route or the presses to make. That is the
  consistent answer, but each loses the "show me how" its Solve gives today,
  which the hint covers step by step. Confirm per game.
- **Blackbox and Guess**: whether revealing the answer stays a declared
  exception or becomes a solved board.

## Hints to pull in

None.
