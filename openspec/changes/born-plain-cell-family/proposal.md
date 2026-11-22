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
| Magnets | 3,423 | `count`; a dealt partition of tiles |
| Sticks | 1,642 | `block`, `length`, `joins` |
| Undead | 3,353 | `mirror`, `sees` |

That is 22,437 lines. Each game's TypeScript goes. Its tests become one
file of hint pins plus what only it decides, as for the pilots. Game IDs
and links keep loading. Saves are expected to break, as the pilots' did;
the owner is asked once for the whole family (task 1.2).

Out of scope:
- Map, whose colors fill regions, not cells.
- Games with candidate notes or a keypad (Crossing, Seismic, the Latin
  games), which are the candidate family's own change.
- Games whose answer is on edges or links.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `described-fill-game`, for each capability a game adds.
- Each moved game's own spec, where the born game differs.

## Impact

- `src/engine/fill/`, `src/describe/` and `src/games/<game>/` for the
  eleven games.
- The `game-lines` ceiling falls by each game's lines.
- Saves of the moved games, if the owner confirms the break.
