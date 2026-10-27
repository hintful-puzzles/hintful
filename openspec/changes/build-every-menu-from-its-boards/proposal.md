# Proposal: build-every-menu-from-its-boards

## Why

`presetGrid` (`engine/preset-grid.ts`) builds the conventional preset menu
from the boards a game names, and `docs/mechanics.md` § "The preset menu is a
grid" tells a game to use it. On 2026-10-27, 19 of the 59 games call it and
the other 40 write their menu by hand: 25 of them tiered and 15 without tiers
(query: the game directories under `src/games/` with no `presetGrid(` in
their `.ts` files). `preset-menu-shape.test.ts` holds every menu to the
shape, so the hand-built ones are not wrong. They are each game writing out,
board by board and tier by tier, what the engine can write from a list of
sizes. That is the "several games write the same thing" case
(`docs/doctrine.md`).

The owner (2026-10-27), while `pearl-deals-promptly` moved Pearl onto the
builder: "please also write up a followup change (if needed) to do this
across all other games".

## What Changes

- Every game's menu is built by the engine from the boards the game names.
  The likely shape: `Game` declares its boards, and the tier and variant
  options `presetGrid` takes, in place of `presets()`. The midend then builds
  the menu, so a hand-built menu can no longer be written, and no source scan
  is needed to keep it that way. Whether the declaration replaces `presets()`
  or a game still calls the builder is the design's first question.
- No player-visible change: every menu is the same list, in the same order,
  before and after. The `params-stability` snapshot's menu lines must not
  move, and a line that moves is a defect in the migration, not a re-baseline.
- Rulesets: `presetMenu` (`engine/param-label.ts`) already splits a flat
  list into a section per ruleset. Loopy, Solo and Singles have menus with
  several `submenu`s; each is read before deciding whether the builder needs
  an option, or the game a reason it cannot use one.

## Capabilities

### Modified Capabilities

- `engine-params`: "The preset menu is a grid" says the engine builds
  every menu from its boards, not that it offers a builder to call.

## Impact

- `src/engine/game.ts` (the `presets` member), `engine/preset-grid.ts`,
  `engine/param-label.ts`, the midend's menu, and each game's `state.ts` or
  `index.ts`, where `presets()` lives today.
- `docs/mechanics.md` § "The preset menu is a grid", and the skeleton's
  `state.ts`, which is its exemplar.
