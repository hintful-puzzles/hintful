# slice-the-first-leaf-hint-guards-by-axis

## Why

`slice-presets-by-the-axes-a-game-varies` built `axisSlice` and pointed the one
cross-game guard that already walked presets at it. **Eight others still read
`firstLeaf(game.presets())` — by convention the smallest and easiest board a
game offers — or synthesize params from it with `withTier`, which writes only
the tier field.** None of them has ever seen a board in a second mode.

Verified 2026-09-20 by reading each call site, not by grepping for a word:

- **`firstLeaf` alone** — `hint-mark.test.ts:88`, `hint-overlay.test.ts:38`,
  `hint-text-convention.test.ts:29`, `mark-all.test.ts:92`/`:129`/`:180`, and
  `hint-quality.test.ts:388` ("hint narration form, cross-game").
- **`firstLeaf` then `withTier`** — `hint-quality.test.ts:495` ("no hint leaves a
  chain for the player to carry, at any tier"), `hint-ordinal.test.ts:147`, and
  `scripts/checks/hint-deixis.test.ts:94`.

`firstLeaf(soloGame.presets())` is
`{ c: 2, r: 2, symm: 1, diff: 0, kdiff: 1, xtype: false, killer: false }`, and
`withTier` returns `{ ...p, diff: tier }`. So no board any of these sweeps has
ever run on has had a cage, a jigsaw block, an X diagonal, an Adjacent clue, a
Tectonic region, or any Loopy tiling but Squares — including the two guards
whose whole subject is *narration*, while Killer adds four cage sentences.

This is the trap [`docs/games/testing.md`](../../docs/games/testing.md)
§ "How a cross-game guard finds its population" rule 6 already states — *"your
guard builds its inputs with a `with*`/setter rather than reading them off
something the game offers"* — standing in eight places at once, and the guide's
new § "Slicing a preset sweep for the gate" now names the instrument that fixes
it.

**It has already cost a roster.** `hint-ordinal.test.ts` carries
`BIGGER_BOARD: Record<string, string> = { solo: "3x3 Extreme" }` — a per-game
override naming the preset to use because the synthesized one is too small to
reach a forcing chain. That entry is honest and well-argued, and it is exactly
the hand-maintained shape a derived slice removes: a second game whose first
preset is too small joins it by being remembered.

## What changes

Each of the eight reads the preset population the same way the resume walk now
does, rather than constructing one board out of parts.

The decision is **per guard and it is cost**, not shape — the shape is settled
(`axisSlice`, already in `testing/hint-games.ts`). Three of these sweeps run
five seeds per case, so the slice's 141 cases are not a like-for-like
substitution for the resume walk's measured 88 → 141 / 25.1 s → 67.0 s. Measure
each guard before and after, on an idle box, with free memory and swap recorded
beside the figure, and take the treatments in
`docs/games/testing.md` § "Right-sizing the gate" in order before reaching for
a deferral.

## What this does not do

- **Not a single verdict for all eight.** A guard whose subject genuinely cannot
  vary with the mode should say so and stay narrow — but it has to say which
  property that is, because "the narration is the same on a Killer board" is a
  claim about cage sentences that do not exist on any board it walks.
- **Not `BIGGER_BOARD`'s removal for its own sake.** If the slice reaches a
  forcing chain on Solo without it, it goes; if it does not, the roster is
  telling the truth and the entry stays with its reason.
- **Not a widening of what any guard asserts.** Same assertions, more boards.
