# norinori-larger-boards

Filed 2026-11-16 from `add-norinori`, for the game the owner asked for by
name: its menu stops at 8x8 Easy because larger boards and harder tiers
deal slowly.

## What the work found

Measured 2026-11-16 under vitest (about twice Chrome's time), the generator
of `add-norinori`'s last commit:

| Board | Easy | Normal | Tricky |
| --- | --- | --- | --- |
| 6x6 | under 1.2 s | under 4.3 s | under 1.4 s |
| 7x7 | under 2.6 s | 0.8 to 19 s | 0 to 24 s |
| 8x8 | about 1 s, 5 at worst | 9 to 13 s | 0.1 to 43 s |
| 10x10 | 2.6 to 37 s | one of six met the retry limit | |

Where the time goes, from a profile of an 8x8 Normal deal: 94% is
`mendDivision`, and 65% of the deal the second-answer search
(`solvedPositions`) the mend's judge asks, each position a ladder run.
About one mend in a hundred comes right.

Why mends fail (200 draws at 8x8 Easy and 150 at Normal, sorted by what the
search says of the board where the mend gave up): every failure had more
than 20 of 64 squares open, under the whole ladder as well as the tier's,
and most still had a second answer. A trace of the open count through each
mend's moves is flat (50, 50, 50, …) or jumps up when a move breaks a
second answer: the deductions get no foothold, so the mend's hill climb has
no slope to follow, and it gives up after `STALL` moves without a new best.

What did not help: dominoes one for every four squares rather than five;
a cap on region size at every tier (at Normal it made boards come out Easy,
and an 8x8 deal met the retry limit; it stays at Easy, where it helps).

## What this change does

Make a board of 10x10 deal in a few seconds at every tier, and put the
sizes that do on the menu. Directions, to be measured before one is taken:

- **A judge with a slope**: count what the ladder decides beyond open
  squares (a region's room, a shaded square's partners), so a move that
  narrows without deciding is kept.
- **Build the foothold into the draw**: regions of three round a domino and
  one square, which the Easy rungs read at once, before the mend.
- **A ladder rung the stalled positions ask for**, read from the boards the
  mend gave up on (the instrument is the stuck-position dump this change's
  parent used; it lived in a scratch test and was not kept).

The deal walk's census (`DEAL_WALK_CELLS=presets npm run deal-walk --
norinori`) gives each preset's draws thrown away by stage and how each mend
ended, with the fewest squares it left open. On 2026-11-16 the joins that
stop short of the count of regions threw away the most draws.
