## Why

The first time a player opens a game, the puzzle screen shows a card with
the game's rules (`app-shell` § "A game's first open shows its rules
once"). The rules are words; a newcomer learns faster from seeing what a
finished board looks like, and faster still with its parts pointed out.
The owner asked for it, 2026-11-23, for every game: Mines and Guess
especially, where what is expected of the player is least obvious.

## What Changes

- **The first-open card has three buttons**: **Full rules and controls**
  (as now), **Examine a solved example**, and **Play**, which keeps the
  focus (the owner, 2026-11-23).
- **Examine a solved example** closes the card and shows, in the board's
  own place and at its full size, an example board of the game solved.
  It is an example, never the player's board: a board the player brought
  (a shared link, a remembered board) is kept and comes back after.
- **Callouts on the example**, written in the game's description beside
  its help: each names a part of the board by what it is in the
  description (a clue kind, a value, a given), and the engine finds one
  on the example board to point at. Each is highlighted with the hint's
  marks (ring, outline, stripes) when the player picks it, by touch,
  mouse or keyboard, so a callout reads as a hint does. The help page
  shows the same words, from the same source.
- **From the example, Play** deals the board the player plays (or brings
  back the one they brought), and the rules and the example stay a tap
  away in the help.
- **The example counts for nothing**: no win flash, no status, no timer,
  and it is not remembered as the player's board.
- **Every game**, of every kind. A query game's example is a finished
  game, the hidden part revealed and, where the game is a sequence of
  questions (Guess), the questions that found it; a moving-pieces game's
  is its goal position. The session judges in the app whether one of
  those needs more to teach, and asks the owner where it is unsure.

## Capabilities

### New Capabilities

(none)

### Modified Capabilities

- `app-shell`: the first-open card's buttons, and the example view.
- `help-pages`: the callouts appear on the game's help page.
- The capability that holds the description's `help:` (the session names
  it in task 1.2): the callouts' form.

Those two deltas are written once task 1.2 settles the form; `app-shell`'s
is here now.

## Impact

`src/components/first-open-card.ts`, `src/screens/puzzle-screen.ts`, the
puzzle view (an example board shown in the board's place, and back),
`src/describe/` (the callouts in `help:`, and the help page renderer),
`src/engine/hint/` marks reused for the callouts, every game's
description (its callouts), and the first-open card's tests.
