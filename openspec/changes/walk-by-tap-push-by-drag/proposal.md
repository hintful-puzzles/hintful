# walk-by-tap-push-by-drag

**Status: implemented (2026-10-03), awaiting the owner's play on a real device.**

## Why

A push is the one move in Sokoban a player can come to regret, and a walk
never is. Upstream gives both to the same click: a click steps the player one
square toward it, pushing whatever it walks into, so a slightly misaimed tap on
a phone pushes a barrel into a corner. Walking anywhere took one tap per
square, and the hint's walk to a push was a journey of a dozen taps.

## What Changes

Owner's design (2026-10-03), with a push that can go several squares:

- **A tap walks** to any square the player can reach, the shortest way round,
  as one move and one undo. It never pushes: a tap on a barrel, a wall or a
  square out of reach does nothing.
- **A drag from the player pushes.** Pressing on the player and dragging
  toward a barrel beside it previews an arrow, in the aim color Inertia's swipe
  uses, from the barrel to where it will stop: one square further for each tile
  the drag reaches, never past a wall or another barrel, and no further than a
  pit. Letting go pushes it that far, as one move; letting go back on the
  player, or off the board, calls it off. Only a drag from the player pushes.
- **The keyboard is unchanged**: a step at a time, pushing what it walks into.
- **The hint's step** is a tap behind the barrel (when the player is not
  already there) and a drag onto it, rather than a tap per square.

Two move kinds are added, `walk` and a `push` that carries its length; the
step move and its saves are unchanged.

## After the owner's first play (2026-10-03)

- **A drag can start from a barrel too**, the way it should go. Letting go
  walks the player round behind it first, and a barrel the player cannot get
  behind shows no arrow. The hint's step becomes one such drag.
- **Every move animates**: the player along the route it walks, a pushed
  barrel with the player once it is behind it, an undo backward. About 0.06 s
  a square, at least 0.1 s and at most 0.45 s a move, so a long walk does not
  hold up play. Solve still changes the board at once.

## From the owner's phone screenshot (2026-10-03)

- **Dark-mode walls** stood 0.03 of lightness off the floor and could not be
  told apart. `wallColor` (Sokoban's and Inertia's) now authors its dark value,
  0.11 darker than the floor, held by `wall-contrast.test.ts`. The same
  collapse in other games' colors is `keep-colors-apart-in-dark-mode`.
- **A push that frees the player** was offered with no reason. Where it opens
  at least four times as much of the board to the player, the step says
  "Barrels box you in. Push this barrel right: that lets you out." Measured
  over hint-guided play: 17 of 796 steps, a tenth of those that gave no
  reason.
- **A ghost barrel** marks the square an aimed push stops on, a barrel-sized
  ring in the aim color: a one-square arrow was too short to notice under a
  finger.
