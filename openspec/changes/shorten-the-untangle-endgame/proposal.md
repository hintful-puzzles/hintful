# shorten-the-untangle-endgame

**Status: implemented 2026-09-26; awaiting owner acceptance of the wording, the
marked-point rings and the move counts (tasks 5.3).** Owner-requested,
2026-09-26, from `explain-untangle-hints`. What was built, and where it departs
from the plan below, is `design.md` § "D8".

## Why

Untangle's hint (`explain-untangle-hints`) is now honest and explained, but it
takes far more moves than a person. On the owner's board
`20#343769d2db4f418cccd3b79e00c975d0` it takes 31 moves. The owner followed it
to move 15, then finished in 5 moves of their own: 20 in total.

The trace shows exactly where the moves go (`design.md` § "Where the moves go"):

- **The opening is fine.** Moves 1–13 take the board from about 170 crossings
  to 8, each step removing the most crossings any single move can.
- **The endgame thrashes.** For moves 14–31 the count hovers between 6 and 10,
  each stall-breaking step adding crossings for the next step to take back.

The owner's description of how they play: start much as the hint does, then
"think of the tangle as a balloon I need to inflate" — find the few points
causing the trouble and put them where they belong.

## What changes

A **culprit endgame** for the hint: once the board is nearly untangled, find a
small set of points whose re-placement finishes it, and move each one where its
lines cross nothing. The prototype matched the owner exactly on their board
(20 moves), but it is too slow and fires too rarely to ship (`design.md`
§ "What the prototype showed"). The work is making it fast and making it fire
early:

1. **Culprits.** The points to move are the points of some crossing, chosen
   minimally, **plus the points whose neighbors sit in the wrong circular order**
   compared with the solved layout. The second group can be in no crossing at
   all: a part of the board can be untangled locally yet flipped relative to the
   rest, and then moving only crossing points can never finish the board. That
   was the owner's board at move 13 (D2).
2. **Fast placement by face, not by grid.** Place each culprit inside a face of
   the settled drawing that has all its settled neighbors on its boundary and
   can see them, instead of trying a 24×24 grid with backtracking (D4).
3. **An explanation the player can check.** For example: "Every remaining
   crossing involves one of these 3 marked points. Moving this one here clears
   its lines." (D5; the owner accepts the wording.)

## Impact

- Player-visible: shorter hint walks, and a new kind of step and sentence.
  Owner acceptance is required.
- `untangle` spec: the hint requirement gains the endgame step.
- No save, ID or preference format changes.
