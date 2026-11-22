## Why

`born-unruly-norinori-and-mosaic` moved three plain-cell games onto
`fillGame`. Each removed more hand-written code than the engine gained, and
no player sees the time difference. The owner judged it a success
(2026-11-22) and asked for the rest of the family to follow.

## What Changes

The rest of the plain-cell family moves onto `fillGame`, one commit a game.
The family is every hand-written game whose answer is a small value on each
cell, with no candidate notes and no links. Its lines of TypeScript,
tests excluded, as of 2026-11-22:

| Game | Lines | Clue kinds the description names |
|---|---|---|
| Star Battle | 1,429 | none; a dealt partition |
| Singles | 1,166 | `number` |
| Light Up | 1,684 | `wall`, `number` |
| Pattern | 2,066 | `runs` |
| Range | 1,381 | `number` |
| Boats | 2,949 | `n`, `seg`, `fleet` |
| Clusters | 1,506 | `dot` |
| Bricks | 1,838 | `hole`, `number` |
| Sticks | 1,642 | `block`, `length`, `joins` |

That is 15,661 lines. Each game's TypeScript goes. Its tests become one
file of hint pins plus what only it decides, as for the pilots. Game IDs
and links keep loading. Saves break, as the pilots' did. The owner
approved breaking saves for this whole initiative on 2026-11-22: this
change, and every later one that moves a game onto its description (the
candidate family's included), breaks them without asking.

Out of scope:
- Map, whose colors fill regions, not cells.
- Games with candidate notes or a keypad (Crossing, Seismic, the Latin
  games), which are the candidate family's own change. Undead and Magnets,
  listed here first, have candidate notes too (design.md § "The gap list
  (1.1)"), and go with them (the owner, 2026-11-22).
- Games whose answer is on edges or links.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `described-fill-game`, for each capability a game adds.
- Each moved game's own spec, where the born game differs.

## Impact

- `src/engine/fill/`, `src/describe/` and `src/games/<game>/` for the
  nine games.
- The `game-lines` ceiling falls by each game's lines.
- Saves of the moved games break.
