# load-the-two-wide-bricks-boards-the-app-deals

**Status: done (2026-10-05).** Found by the tier walk
(`scripts/checks/tier-walk.test.ts`) while
`deal-the-tier-a-custom-size-asks-for` ran it over every tiered game.

## Why

A Bricks board two squares wide can be dealt and then refused by its own ID.
Measured 2026-10-05, thirty deals a cell from fixed seeds, each board put to
the game's difficulty contract at both caps and loaded back through
`Midend.newGameFromId`:

- `2x10de` (Easy): 12 of 30 solved at no cap.
- `2x10dn` (Unreasonable): 20 of 30.
- `2x7dn`: 18 of 30.
- `3x10de`, `10x2de`, `7x7de`: none of 30.

The contract's verdict on each such board was `impossible` at both caps, and
loading its ID was refused with "The clues in this game ID contradict each
other." Three boards to start from:

- `2x10de:2aa2a4b2a2_2_2aa2a3a1`
- `2x10dn:2aa2a4b2a4aba2_1_1_0_0`
- `2x7dn:1a3a1a4aba2_1_1`

So a player who deals one and shares or saves it by its ID cannot open it
again. Two is the width's lower bound in the Custom dialog; no preset is two
wide, and a board two tall did not show it.

## What is known and what is not

- **The scaffold's reading was wrong, and is kept here as it was written:**
  "The solver runs inside the generator and accepted each board, so the two
  disagree with themselves across a desc round trip, which points at the codec
  or at how a state is rebuilt from a desc." The solver never accepted these
  boards. Nothing in the generator asked it to.
- Only widths 2, 3 and 7 and heights 2, 7 and 10 were dealt.
- Counted again the same day by `settle-the-cells-the-tier-walk-still-lists`,
  a thousand deals a cell at Unreasonable: `2x4dn` 446 solved at no cap and
  `2x5dn` 600; `2x3dn`, `4x2dn` and `5x2dn` none. So it starts at a height of
  four.

## What was found

**The boards have no solution, and the generator wrote them.** Each of the
three boards above was put to every coloring of its blank squares: none
satisfies the rules. The refusal on loading was correct.

The generator numbers a board twice. It lays bricks and numbers every square
without one; then it solves that board at Easy and numbers it again, so that
every square the solve left undecided becomes a number. That second numbering
changes the answer: an undecided square held a brick and now holds a clue.
Where the solve had decided a brick and left both squares beneath it
undecided, the brick is left resting on nothing.

Then it removes numbers, keeping a removal only while the board still solves.
A board that does not solve at the start fails that on every removal, so every
number goes back and the board is written out as it stood. Nothing after the
second numbering asked whether the board solves. At Unreasonable the last gate
asks only that the tier below does *not* solve it, which such a board passes.

`2x7dn:1a3a1a4aba2_1_1` shows it. Its bottom row is two clues of 1, so neither
holds a brick, so no square of the row above can hold one; and each of those
clues then has no neighbor left to count.

Upstream's `new_game_desc` has the same order of steps and the same absence
(read in `puzzles/unreleased/bricks.c` at `a4053b67^`).

**Why two wide.** Not argued from the code. Measured: the committed generator
and the fixed one were dealt side by side from the same seeds, and they differ
exactly on the deals where the new check turned a board away, because the
check draws nothing from the generator's random numbers.

| Cell | Deals | Changed |
| --- | --- | --- |
| `2x3dn` | 300 | 0 |
| `2x4de` | 300 | 19 |
| `2x4dn` | 300 | 135 |
| `2x10de` | 300 | 79 |
| `2x10dn` | 300 | 206 |
| `2x20dn` | 100 | 80 |
| `3x4dn`, `3x10de`, `3x10dn` | 1000 each | 0 |
| `4x10dn`, `10x2de`, `10x3dn` | 500 each | 0 |
| `6x7de`, `6x7dn` | 300 each | 0 |
| `8x10de`, `8x10dn` | 100 each | 0 |

So no board three or more wide moved in 5,300 deals. That count does not show
that none can; it does not need to, because the check holds at every size
whether or not it ever turns a board away there.

## What Changes

- The generator solves the fully numbered board at the difficulty asked for
  before it removes a number, and starts again when that does not complete.
  Removing numbers preserves a board that solves, so every board written out
  now does. A solve that completes puts back exactly the bricks it cleared, so
  a board that passes is dealt as before.
- **Which board a seed deals changes at width two**, for the share of seeds
  the table gives, and nowhere else that was measured. A two-wide board that did have a
  solution still loads from its ID.
- A two-wide deal costs more tries. The slowest of 300 `2x10dn` deals took
  77 ms, and of 100 `2x20dn` deals 431 ms (load average 4 to 6, so upper
  bounds).
- Width two is not refused: it deals soundly.

## What replaces the assurance

Nothing was dropped. Added: `bricks.test.ts` deals 25 boards at each of ten
cells at the smallest width or height and loads every one through
`Midend.newGameFromId`; six of the ten failed before the fix. Three two-wide
cells join `describeDealtTiers`, which holds each board to its tier.

## Hints to pull in

None.

## What would show it worked

The three boards above, or their re-dealt successors, load from their IDs, and
no deal at the Custom dialog's smallest sizes is refused by its own ID.
