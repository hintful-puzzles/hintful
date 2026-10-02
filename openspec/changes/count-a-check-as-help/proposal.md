# count-a-check-as-help

**Status: scaffolded, not started (2026-10-02).** Filed from
`play-only-boards-with-one-answer`, where the owner said of Check & Save: *"I'm
not against saying that check&save will count as help, but it should be
consistent across games"*.

## Why

Check & Save compares the player's marks with the board's answer in every game
with a mistake check, Black Box and Mines included since
`play-only-boards-with-one-answer`. So it can tell a player something the board
has not shown them: whether a guessed mark is right. A hint marks a board as
helped (`Midend.hinted`, shown by the timer's `assisted` readout and the end
notification), and Solve marks it solved with help; a check that catches a
mistake does neither.

## What

Open, for the owner:

- Whether a check counts as help at all, or only a check that **found**
  something (a clean check tells the player only that nothing is wrong yet,
  which is arguably what a save should be free to say).
- Whether Check without saving and Check & Save count alike.

Whatever is chosen is one rule in the midend's `check()`, never a per-game
switch: the owner's condition is that it be consistent across games.

## Not in scope

Progression of any kind (AGENTS.md § "No progression features"): this only
changes what the existing "helped" mark on one board says.
