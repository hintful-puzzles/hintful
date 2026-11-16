# say-why-a-region-has-no-room

The owner's answer, 2026-11-16, on `add-norinori`'s open question: outline
the squares that close a region's room, and say "as dominoes".

## What the reader found

A subagent read 69 of Norinori's hint steps against the running app
(2026-11-16). Every sentence was true, but the steps of `neededRegion`,
`blocked` and `crowded` (`norinori.description.yaml`) say "the rest of this
region has no room for 2 shaded squares" where the player sees two open
squares side by side in it. Its cases:

- Normal, `neededRegion`: the rest of the region is two side-by-side
  squares; one touches a shaded square in the next region, so shading both
  would make a run of three. That shaded square has no mark.
- Tricky, `neededRegion`, "no room for 1 more": two open squares remain;
  one more shaded square would need the other as its partner inside the
  region, making three there. The sentence does not say so.
- Tricky, `crowded` with an outline: "loses the outlined squares and lacks
  room for 1 shaded square", with four open squares left; each would need a
  partner inside the region.
- Tricky, `crowded` without an outline: a case split (a square pairs with
  the tried one or is cleared, and either way the region falls short), with
  no mark on the squares that decide it.
- The outline marks shaded squares in every other step and open squares in
  `crowded`, so its color means two things.

## What this change does

- **The room check says what spoiled it.** `fits(S, n)` is a description
  function: a fill of the open squares `S` that holds `n` shaded squares as
  dominoes. Where none exists, each fill was refused by a shaded square
  outside `S` that a placement would touch (a run of three), or by a
  placement with no partner left. The step outlines the outside shaded
  squares that refused a fill, and its sentence says the region has no room
  for its squares "as dominoes" ("beside the outlined squares" where there
  are any).
- How the refusals are gathered is the engine's: a description function
  that reports why it is false, or a second function the step's marks read.
  Settle it in the design against what the describe compiler can already
  carry (`docs/descriptions.md`), and weigh it for any game whose technique asks
  whether a unit still has room.
- `crowded`'s outline of the squares a tried square would clear takes a
  role that is not the evidence outline, or its sentence names them another
  way, so the outline means one thing.
- A sentence over 120 characters is ledgered with its reason
  (`hint-quality.test.ts`, `LONG_NARRATIONS`), as `crowded`'s already is.

## Before it starts

- Pin each case above with `hint-scan` before changing a word, so the
  change shows on the same positions.
- Re-check the soundness verdicts of the techniques touched
  (`describe-check`).
