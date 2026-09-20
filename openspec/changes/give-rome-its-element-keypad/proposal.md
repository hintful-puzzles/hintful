# give-rome-its-element-keypad

## Why

**Rome's notes could only be dragged.** Every other note game in the collection
with an enumerable per-cell element set puts those elements on the keypad —
select a cell, tap a value, and in notes mode the same key toggles it as a mark.
Rome had no keypad at all, so its marks (and its arrows) were reachable only by
a drag, which is a different motion for the same job and the one thing a player
has to learn twice (owner, 2026-09-21: *"I know I can drag the note arrows too,
but I think I'd prefer to be consistent here"*).

## What changes

Rome offers four arrow keys and Clear. They send the character codes Rome's
typed entry already answered, so no new input path was needed — what was needed
was **a way to reach the cursor**.

- **A tap that commits nothing now selects the square.** A panel key enters at
  the keyboard cursor and a touch player has no arrow keys to move one with, so
  every key would have been dead. Rome's taps were bare no-ops in exactly the
  two cases that matter — a tap in notes mode, and a release back onto the arrow
  already there — so selecting there is additive and nothing that made a move
  stopped making one.
- **Clear clears what the mode is entering.** It emptied the square's arrow even
  in notes mode, which is the one thing a player in notes mode did not ask for.

## Where the line is, and why three games stay without element keys

The rule is **elements on the panel wherever a game's notes are an enumerable
per-cell set**. Three games are deliberately outside it, and the reason is a
property of their notes rather than an omission:

- **Loopy** marks *which corner* of a face, or *which pair of edges*;
- **Slant** marks *which two adjacent squares* slant alike.

Both are indicated by pointing at them, so there is no element for a button to
name — the mark's identity *is* the thing pointed at, and both games already
place theirs by tapping.

- **Map**'s mark is "possibly this color", which is enumerable — but it is set
  by dragging *from* a colored region, so which bit it sets comes from the
  drag's origin. Giving Map element keys means giving it key-based entry it has
  never had for colors either. That is a change to how the game is *played*
  rather than to how its notes are reached, and it is left as an open question
  rather than folded in here.

## What this does not do

- **Not a cross-game guard.** The property to enforce is "every element a cell's
  notes can hold is reachable from the panel", and checking it behaviorally
  needs a shared *select this cell* primitive the harness does not have: games
  select by tapping their own geometry, and `CURSOR_SELECT` does not show the
  cursor in several of them. A first probe that pressed at `(0, 0)` reported ten
  games unreachable, all of them false — the instrument, not the games
  (`AGENTS.md` § "Check the instrument before the finding"). The rule is written
  into `docs/games/input.md` instead, with what the probe got wrong.
