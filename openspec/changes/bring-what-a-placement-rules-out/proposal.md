# bring-what-a-placement-rules-out

**Status: filed 2026-10-15 by `own-what-starbattle-wrote-for-the-engine`
(item 6), at the owner's word that every pain point of writing Star Battle
be written up. It needs no answer from the owner to start; what it gives a
player in Tents and Light Up is theirs to see before it ships (§ "For the
owner").**

## Why

Star Battle's `auto-cross` preference crosses out, with a star, the squares
the star rules out at a glance. It is three pieces a game wires by hand:

1. a verb that reads the `Ui` and appends the brought marks to the move
   (`markWith` and `ruledOutBy` in `starbattle/index.ts`);
2. a keep-track that leaves the brought marks out of its judgment
   (`trackMade` in `starbattle/hint.ts`);
3. a plan that ends at the first placement, since the brought marks are a
   side effect the plan did not make (`starbattleHint`, and
   `docs/hints-marks.md` § "A move with side effects ends the plan").

The candidate games already have the same aid under another name:
`auto-pencil` (`engine/pencil-prefs.ts`), in Group, Keen, Mathrax, Solo,
Towers and others, clears a placed value from the notes it rules out. It is
wired per game too, and each game's hint handles the culled notes its own
way (`rome/hint.ts`, `seismic/hint.ts`).

Other games place a thing and leave the player to cross out what it rules
out at a glance. Tents and Light Up are the first to look at: a tent rules
out the eight squares round it, and a lit number whose lights are all placed
rules out the rest of its neighbors.

## What Changes

- A game declares what a placement rules out at a glance: a function from a
  board and a placed thing to the marks it brings. The engine owns the
  preference, the move it extends, the keep-track's allowance and the plan's
  end, and a guard can find every game that declares it.
- Star Battle moves onto it, and its three pieces go.
- Whether `auto-pencil` is the same declaration over notes is this change's
  to measure first: read each candidate game's culling and hint, and say
  whether one shape serves both or why it does not.
- Tents and Light Up declare it, each with its preference off by default.

## For the owner

A new preference in Tents and Light Up is a change in what a player can
see. Show it in the app before it ships, with the words of each
preference.

## Capabilities

### Modified Capabilities

- `engine-input`, `engine-hints`, and the specs of the games that declare
  it. The session that takes this up names the requirements.

## Impact

`src/engine/`, `src/games/starbattle/`, `src/games/tents/`,
`src/games/lightup/`, and the candidate games if `auto-pencil` joins.
