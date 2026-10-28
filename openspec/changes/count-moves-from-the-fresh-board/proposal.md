# Proposal

## Why

The owner (2026-10-28), on **Start over** adding a move to the counter
("Move 14 of 14" after 13 moves), against the help's "Start over is a move
like any other" (`help/features.md`, "Taking back Start over or a New
game"):

> It is definitely conceptually not a move like any other. I don't really
> care how we handle the undo internally, but to a user it must not be shown
> as a move. [...] my intuition here in general is that we maintain our
> internal undo log somewhat separately from what is shown to the user. For
> example, we've previously agreed that pressing "New game" is an undoable
> action too, which seems to work great, and obviously this sets the moves
> to 0. Can't we just use the same functionality in both? Also, currently,
> we only allow a New game undo immediately, but I don't see a good reason
> to not keep the New game and Start over actions in our undo log for
> longer - e.g. have an undo log of `min(this game run's actions, 100
> actions)` - this is what it seems to me that games like Patrick's Parabox
> and Order of the sinking star do. In any case, I'll leave the details to
> you [...], as long as we both keep our internal undo functionality
> working, and have the player see the number of moves from the game's last
> fresh board draw.

## What is there now (2026-10-28, `f3257d36`)

- **Start over is a `Restart` entry of the move log** (`src/engine/midend.ts`,
  `restartGame`, after upstream's `movetype = RESTART`). Undo crosses it back
  to the played board; the counter counts it as a move. A save carries it
  (`restarts` in the save envelope), and `save.test.ts` reads saves from
  before a restart was a step.
- **New game keeps the board it replaced, one deep and only until the next
  move** (`app-shell`, "Undo reaches back across a Restart and a replaced
  board", and "The timeline names a restart and the boards kept either
  side"), and the new board's counter starts at 0.

## What Changes

- **The counter counts moves since the last fresh board**: the board as a
  New game, a loaded or shared game, or a Start over drew it. Start over is
  not shown as a move.
- **Start over and New game are one mechanism**: each makes a fresh board
  and keeps the one it put away, undoable, the way New game already does.
- **What Undo can reach is the game run's actions, up to a bound** (the
  owner's example: `min(this run's actions, 100)`), across Start overs and
  New games alike, not only until the next move. The bound and its exact
  unit are the session's to choose and record.
- **Saves**: a save written today, with `restarts`, still opens, and resumes
  with the same board and the same undo it had; an older app need not read
  a newer save. Whether the save format changes is the session's
  call, said in its design.
- The help section and the two `app-shell` requirements say the new rule;
  "Start over is a move like any other" goes.

## Impact

`src/engine/midend.ts` (the move log, `restartGame`, the kept boards, the
counter it reports), the timeline and history panel, the save envelope and
`save.test.ts`, `help/features.md`, `app-shell`.
