## Why

The first time a player opens a game, the puzzle screen shows a card with
the game's rules (`app-shell` § "A game's first open shows its rules
once"). The rules are words; a newcomer learns faster from seeing what a
finished board looks like. The owner asked for it, 2026-11-23: on the first
open, show a solved board beside the rules.

## What Changes

- **The first-open card shows a solved board of the game**, so the rules
  are read against a picture of what they ask for.
- **Play deals the board the player plays**: the solved board is shown,
  never played; Play (or any other way of closing the card) leaves the
  player at an unsolved board.
- **A board the player brought is never spent on it.** The card also opens
  over a shared link's board and over a board remembered from before the
  card existed (`app-shell` § "A game shows its first-open card once,
  whoever opens it"); that board stays the player's, unsolved and
  unchanged.
- **The solved board counts for nothing**: no win flash, no "solved"
  status, no timer, and it is not remembered as the player's board.

The owner leans toward solving the board already dealt behind the card
(its "Show solution"), then dealing another on Play, and leaves the
approach to the session that takes this up. Its constraints are in
`tasks.md` § 1.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `app-shell`: the first-open card shows a solved board, and closing it
  leaves the player at a board to play.

## Impact

`src/components/first-open-card.ts`, `src/screens/puzzle-screen.ts`
(`showFirstOpenCard` and the first deal), possibly the midend or a
second, off-screen drawing of a board, the help page's "How to play"
words if they mention the card, and the first-open card's tests.
