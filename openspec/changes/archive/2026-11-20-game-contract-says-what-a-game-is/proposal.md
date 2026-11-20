## Why

`architectural-review` item 6 (owner accepted every item, 2026-11-20).
Measured at `9faabdf61`, at run time from the registry: `Game` has 57
members, 15 required. Eight optional hooks are implemented by every game
(`hint`, `hintRungs`, `hintGesture`, `hintKeepTrack`, `hintMarks`, `solve`,
`paramConfig`, `preferredTileSize`), so each call site pays a `?.` and a
fallback for a case that does not occur. The hint is seven sibling fields;
37 games build them from one builder object and split it apart field by
field. About 15 hooks serve one to five games. `hintGesture`'s 9-line
`verbClicks(...)` body is written in 19 games and derivable from
`targetVerbs` and a move's cells.

Third in the owner's order: 8, 1, 6, 10, 7, 11, 9.

## What Changes

- Hooks every game implements become required, and their call sites lose
  the fallback.
- The hint becomes one capability object on the game, which the builders
  hand over whole.
- `hintGesture` is derived from `targetVerbs` where a game's body only
  restates it.
- A game still being ported stays a draft: it registers with the standard
  refusal as its hint, and the draft rule in `sections.ts` reads that
  rather than an absent field.
- Hooks used by one to five games are reviewed: kept, folded into a
  capability, or replaced where a declaration says the same.
- No player-visible change.

## Impact

`src/engine/game.ts`, `src/engine/sections.ts`, `src/engine/midend.ts` and
the engine's other call sites, every `src/games/*/index.ts`, the hint
builders, the skeletons, `docs/` where the contract is described.
