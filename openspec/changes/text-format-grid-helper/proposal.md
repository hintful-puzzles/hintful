## Why

`architectural-review` item 8 (owner accepted every item, 2026-11-20).
Measured at `9faabdf61`: `fl 'export function textFormat'` → 48 games,
1,213 lines, 41 of them a `for (let y` loop. Every game writes the same shell
(an empty string, a y/x loop, a character, a newline), and only the character
is the game's.

First in the owner's order: 8, 1, 6, 10, 7, 11, 9.

## What Changes

- An engine helper beside `src/engine/geometry.ts` that walks a grid and
  joins rows, taking the game's per-cell character (and, where a game draws
  edges or clue rows, the shapes the migration finds several games share).
- The grid-shaped `textFormat`s move onto it with their output
  byte-identical. A game whose text is not a grid keeps its own and says why.
- The skeletons write the helper's form.
- No player-visible change: the text a player copies is unchanged.

## Impact

`src/engine/` (new helper), `src/games/*/state.ts` or wherever each
`textFormat` lives, `src/skeleton/*/`, `docs/` where a guide shows the shell.
