## Why

`a-game-from-its-description-alone` built a fill game from its description
(Kakurasu) and moved Tents onto it. The owner judged the pilot a tentative
pass (2026-11-22): Tents needed six new capabilities to Kakurasu's four,
four of them the link reading only Tents has. The next test is whether
plain-cell games with no links move for little engine work. This is a
second, wider pilot before the plain-cell family moves as a whole.

## What Changes

- Move three plain two-state cell games onto `fillGame`, each with a
  different clue shape and none with links:
  - **Unruly**: no clues but the givens, rules over whole lines (balance,
    no three in a row, optionally unique lines);
  - **Norinori**: regions, each holding two shaded cells that form
    dominoes;
  - **Mosaic**: a number on a cell counting shaded cells round it.
- Each game's TypeScript goes; its tests become one file of pins and what
  only it decides, as Tents' did. Game IDs and links keep loading (the
  upstream-descs guard); saves may break, accepted for Tents on 2026-11-21
  and to be confirmed for these.
- Each gap is closed in `engine/fill/` or the compiler, and counted.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `described-fill-game`, for each capability added.
- `unruly`, `norinori`, `mosaic`, where the born game differs.

## Impact

`src/engine/fill/`, `src/describe/`, `src/games/{unruly,norinori,mosaic}/`.
The `game-lines` ceiling falls by each game's lines.
