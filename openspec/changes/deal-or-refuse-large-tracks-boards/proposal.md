# deal-or-refuse-large-tracks-boards

**Status: approved by the owner (2026-10-09)**, on the recommendation of the
session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code`. Second in the
order that session set, after `give-a-canceled-press-its-own-signal`.

## Why

While fixing Tracks' completion flash, that session called the generator
directly at sizes larger than the presets (2026-10-09) and saw `newDesc` throw
`RetryLimitExceeded` at 24x24, 30x30, 40x12 and 60x8 Easy. `validateParams`
refuses none of those sizes, and `engine-difficulty` asks that an offered size
generates or is refused with a reason.

Measured the same day, in the app and from the generator:

- **In the app** a 24x24 Easy dealt in about a second, and a 60x8 Easy got the
  engine's "No puzzle dealt" dialog after a few seconds.
- **The walk does not scale.** Upstream's track is a free random walk that
  leaves when it happens to step off the bottom edge. It is about 25 squares
  long whatever the board's size, and every walk that left a row or column
  without track is thrown away. That keeps one walk in 13 at 8x8, one in 2,000
  at 30x30 and one in 100,000 at 60x8.
- **Nothing else fails.** With the retry bound lifted every size tried, up to
  30x30 and 12x40, dealt at all three tiers, twelve boards of twelve, and
  clue-laying took one to three tracks a board. At the house bound of 10,000
  tries a 30x30 needs about 6,000, so it ran out some of the time.
- **`singleOnes` does not scale either.** Rejecting a track for its 1 clues
  keeps three in five at 12x12, one in fourteen at 60x8 and none in 144 at
  200x8, since a straight run across a thin board is a row of 1s.
- Upstream's C has the same walk and the same rejection with no bound at all,
  so there it never returns.

## What Changes

The generator is why, and it is fixed. No size is refused, so nothing a player
can ask for today is taken away, and there was no bound to put to the owner.
`docs/games/solver-and-generator.md` § "Bound a generator by its tail, not its
median" already says a Custom size is not refused for its wait.

- **The track is laid by construction.** The walk may not leave while a row or
  column is bare, and never steps where the free squares no longer reach every
  bare line and the bottom edge. It finishes about two times in three at every
  square size from 5x5 to 50x50.
- **`singleOnes` is met by bending the track**, not by throwing it away: the
  one step that crosses two offending lines goes round three sides of a square.
- **Tracks' own retry budget for small boards goes.** Its rarest cell, a 5x4 at
  the top tier, went from one try in 5,600 to one in 770.
- **Every seed deals another board**, so Tracks' fixture of upstream's boards
  and its differential test are deleted (owner, 2026-10-09: *"we're really
  long past our need to maintain parity with upstream during the port, and I'd
  be absolutely ok with you removing any such old fixtures"*). The tier
  contract grades what the generator deals.

### What a player sees change

Boards at the preset sizes carry more track and more given rails, since a walk
that cannot trap itself wanders further before it has been everywhere: at
15x15 about 100 track squares and 19 given rails, against 83 and 15. Upstream's
density fell with size (37% of a 15x15, 21% of a 30x30) only because a larger
board kept the barest walks; the new one is 57% of an 8x8, 44% of a 15x15 and
38% of a 30x30. Where a bend was made, the track shows a small square tooth.

A large board costs what its clue-laying costs: about a second at 24x24, one
to seven at 30x30, 15 to 43 at 45x45. That wait is stoppable.

## Capabilities

### Modified Capabilities

- `tracks`: how the generator lays the track and meets `singleOnes`; the two
  scenarios the old walk gave meaning to are retired.

## Impact

- `src/games/tracks/generator.ts`.
- No save format, and no params or desc is newly refused.
- Deleted: `tracks-differential.test.ts` and its fixture.
