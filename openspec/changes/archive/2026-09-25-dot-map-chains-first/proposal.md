# dot-map-chains-first

## Why

Owner playtest, 2026-09-25: Map's forcing-chain hint "requires too much
cognitive load … why not use the markings here?" The chain step asked the player
to work out, for every numbered region, which two colors its neighbors leave,
and to hold all of them while following the "if teal…" case. That is the
compressed chain `docs/games/hints.md` § "The forcing boundary" forbids, in a
milder form: the chain was numbered, but its premises were not on the board.

## What changes

- A chain firing becomes one journey: first a leg per numbered region that does
  not already show its two colors as dots, dotting them ("Region 2 touches red
  and purple, so it can only be teal or yellow: dot those."), or removing the
  dots a neighbor's color kills when it has more; then the chain step itself.
- The chain step reads off the dots: "Region 1 is red or teal. If teal, each
  numbered region loses the color the one before it takes, until region 3 is
  red. …"
- `map-hint.test.ts` holds every numbered region to showing exactly its two
  colors when the chain step is spoken.

Owner-requested. No saved data is affected.
