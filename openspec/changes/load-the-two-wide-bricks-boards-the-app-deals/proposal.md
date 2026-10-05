# load-the-two-wide-bricks-boards-the-app-deals

**Status: scaffolded, not started (2026-10-05).** Found by the tier walk
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

- **Which side is wrong is not known.** The generator may write a board that
  contradicts itself at width 2, or the desc codec or the solver may read a
  sound one wrongly there. The solver runs inside the generator and accepted
  each board, so the two disagree with themselves across a desc round trip,
  which points at the codec or at how a state is rebuilt from a desc.
- Whether the dealt board plays to a solution in the app has not been tried.
- Only widths 2, 3 and 7 and heights 2, 7 and 10 were dealt.
- Counted again the same day by `settle-the-cells-the-tier-walk-still-lists`,
  a thousand deals a cell at Unreasonable: `2x4dn` 446 solved at no cap and
  `2x5dn` 600; `2x3dn`, `4x2dn` and `5x2dn` none. So it starts at a height of
  four.

## What Changes

Once the cause is read: the round trip fixed so every dealt board loads, or
width 2 refused if such a board cannot be dealt soundly. Then a test that
deals at the smallest width and height and loads each board back.

## Hints to pull in

None.

## What would show it worked

The three boards above, or their re-dealt successors, load from their IDs, and
no deal at the Custom dialog's smallest sizes is refused by its own ID.
