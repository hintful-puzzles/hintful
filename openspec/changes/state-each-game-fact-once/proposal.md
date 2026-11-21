## Why

`architectural-review-blue-sky` stage 0 (owner, 2026-11-21). Facts a game
declares in its description are held a second time in code, and the copies
have drifted. Measured at `717626277` (queries in the review's design.md,
§ "Declared facts, restated by hand"):

- 31 fill games keep `DIFF_*` index constants beside the description's
  `tiers`, and in about 17 they name other tiers: Tents' `DIFF_TRICKY` is
  "Normal", Towers' `DIFF_HARD`/`DIFF_EXTREME` are "Normal"/"Tricky", and
  Bricks has a `DIFF_TRICKY = 2` beside tiers `[Easy, Unreasonable]`.
- The description's `sizes` reaches no runtime code, and `paramConfig`'s
  bounds disagree with it: Wordtrail 1–12 against 2–8, Crossing 1 against
  2; 21 descriptions write a placeholder `max: 99999`.
- `name` is in both the description and `catalog.ts`; `family` is in both
  under two taxonomies (Tents: `shading` and `objects`).
- 6 games write an `interpretMove` that only calls `interpretTargetVerbs`
  though they declare `targetVerbs`; 34 write `animLength: () => 0`.

## What Changes

- Tier indices come from the description's `tiers`; no `DIFF_*` constant
  names a tier the description does not. The params codec's letters stay,
  since game IDs hold them.
- `sizes` either builds `paramConfig`'s bounds or leaves the description;
  the drifted bounds are settled by measurement. A bound a player meets in
  the Custom dialog may change, which is pre-approved for consistency.
- One `name`, and `family` with one meaning or two names.
- The engine supplies `interpretMove` for a game whose `targetVerbs` say
  everything; `animLength` is absent rather than `() => 0`.

## Capabilities

### Modified Capabilities

`engine-params`, and the game specs that state a size bound, if `sizes`
becomes what bounds a field.

## Impact

`src/games/*/state.ts`, `index.ts`, `catalog.ts`, the descriptions,
`src/describe/`, `src/engine/game-id/`, `src/engine/midend/`.
