# deal-or-refuse-large-tracks-boards

**Status: approved by the owner (2026-10-09)**, on the recommendation of the
session that archived
`2026-10-09-triage-what-the-spec-rewrite-found-in-the-code`. Second in the
order that session set, after `give-a-canceled-press-its-own-signal`.

## Why

While fixing Tracks' completion flash, that session called the generator
directly at sizes larger than the presets (2026-10-09). `newDesc` threw
`RetryLimitExceeded` after 10,000 attempts, in 0.3 to 2 seconds, on every
seed tried at 24x24, 30x30, 40x12 and 60x8 Easy. `validateParams` refuses
none of those sizes. In fifteen deals from 15x15 to 20x30 the longest track
was 193 squares, so some sizes in between do deal.

**This was seen from the generator, not in the running app**, and not
measured: how many seeds, which tiers, and where between 20x30 and 24x24 a
deal starts to fail are all unknown. A player who asks for such a size in
the Custom dialog presumably gets the engine's "no board" answer every time,
where `engine-difficulty` asks that an offered size generates or is refused
with a reason.

## What Changes

Not known until it is measured. One of:

- the generator is why (a bound or a layout step that does not scale), and it
  is fixed so those sizes deal;
- such sizes cannot carry a board in reasonable time, and `validateParams`
  refuses them with a reason, as other games do for a size too rare to deal.

Refusing a size a player can ask for today changes what the Custom dialog
accepts. If measurement says that is the answer, the bound and its cost are
put to the owner before it ships.

## Capabilities

### Modified Capabilities

- `tracks`: its parameters requirement, whichever way it goes.

## Impact

- `src/games/tracks/generator.ts` or `src/games/tracks/state.ts`.
- No save format. A game ID of a size that is newly refused would stop
  loading, which is the compatibility question to ask if it comes to that.
