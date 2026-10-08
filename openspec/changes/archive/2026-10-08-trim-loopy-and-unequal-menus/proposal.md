# trim-loopy-and-unequal-menus

Asked for by the owner (2026-10-08), who left which lines go to the session.

## Why

`order-ascent-rulesets-by-neighbors` capped a whole menu at eighteen lines.
Loopy had 25 and Unequal 23, and stood in the test's ledger as the two games
over it.

## What changes

- **Loopy, 25 lines to 18.** The squares keep both sizes at every tier, and
  the four tilings beside them stay. Under "More..." six tilings stay, one of
  each family: Penrose (kite/dart), Honeycomb, Octagonal, Floret, Dodecagonal
  and Hats. Penrose (rhombs), Spectres, Great-Hexagonal, Kagome and the three
  larger dodecagonal tilings are the Custom dialog's. No tiling is removed
  from the game.
- **Unequal, 23 lines to 15.** Each ruleset keeps 5x5 from Easy to Hard and
  7x7 from Tricky to Unreasonable, and Unequal its 4x4. 6x6 is the Custom
  dialog's in both.
- **The cap has no ledger**: every game is under it.
- Loopy's keyboard-walk test read its boards off the menu, which was every
  tiling. It names the seven the menu no longer holds, and checks that its
  boards cover every tiling.

No params encoding moves, and every board removed from a menu still opens
from a save, a game ID or the Custom dialog.

## Capabilities

### Modified Capabilities

- `engine-params`: the whole-menu cap holds in every game.
