## Why

The owner was playing Ascent by hand, asked for one hint about halfway
through, and went back to playing by hand. Hints then kept appearing without
being asked for (owner, 2026-10-12).

Reproduced the same day in the app, on
`6x7mOde:a42_5_6_11e10c1g22d30_21d31h`: Hint and Apply the hint, twice, then
12 typed into the top-right square by hand. The status then read "Step 2 of 9:
13 must sit next to 12…", and each further number placed by hand brought the
next sentence, eight in a row on that board.

The cause is the midend's, and Ascent only makes it frequent. A plan outlives
the hint that was asked for: it is kept, hidden, so the next press carries on
from it. When the player's own move was the plan's next step, the midend
advanced and then showed the following step wherever that step was flagged
`continuesPrevious`, without asking whether anything had been on screen. A move
partway through a step (`"onTrack"`) showed the step outright. Ascent flags
every later number of a run it has begun, so a correct move by hand nearly
always landed on the hidden plan.

Measured on 2026-10-12, three dealt boards for each Ascent preset, the plan's
next move made by hand as its own gesture, from every step of each plan (1,452
positions): a sentence appeared unasked from 122 positions reached by applying
a hint and from 123 reached by showing one, and the longest run of unasked
sentences was 23.

The second of those figures was the rule as written: a journey shown as one
hint stayed on screen through its legs (`engine-hints`, "A journey stays on
screen through its legs", and a Sixteen board of the owner's from
2026-06-10). The owner's word on it now (2026-10-12): a new hint sentence never
appears unless Hint is pressed again.

## What Changes

- A move of the player's own never puts a hint sentence on screen. A step that
  completes hides the hint, whatever the next step is flagged as; the plan is
  kept, and the next press of Hint shows the next step from it.
- A move partway through a step keeps that step on screen only where it was on
  screen already. A hidden plan stays hidden.
- `continuesPrevious` no longer decides when a step is shown. It still says
  which steps are one journey, which is what "Step 2 of 9" counts and what
  auto-play runs back to back.
- Auto Hint is as it was: it was asked to play on, and previews each next step.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `engine-hints`: a player's move never shows a step; the requirement that a
  journey stays on screen through its legs is removed.
- `fifteen`: its hint requirement no longer gives "the hint stays displayed
  while it is followed" as the reason for returning a whole plan.

## Impact

- `src/engine/midend.ts`, in the classification of a player's move against
  the stored plan. No game is edited.
- Every game whose hint flags journey steps plays differently by hand: the
  list is `git grep -l continuesPrevious -- src/games src/engine`. Sixteen and
  Netslide are the ones a player will notice, since "move it to row 2, then
  column 5" now needs a press for the second leg.
- The help already says it: "plays that one step in slow motion and stops
  there. Ask again for the next" (`help/features.md`, Hints).
