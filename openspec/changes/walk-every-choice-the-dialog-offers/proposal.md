# walk-every-choice-the-dialog-offers

**Status: scaffolded, not started (2026-10-05).** A follow-up from
`fix-salad-number-ball-hint-throw`.

## Why

Every cross-game guard that deals a board deals it from a game's presets
(`engine/testing/presets.ts`: `leafPresets`, and `axisSlice` for the per-commit
slice). A value the Custom dialog offers and no preset holds is therefore dealt
by none of them. `presetAxes` says so in as many words ("the game offers no
way to reach a second value from the presets menu, so a slice cannot walk
one. Salad's `difficulty` is the standing case"), and that standing case is
where Salad's hint threw on 71 of 1,195 Normal boards with the whole suite
green.

The population, taken 2026-10-05 by reading each registered game's
`paramConfig` against its `leafPresets` (a `"boolean"` or `"choices"` item,
and each of its values no preset holds). 27 items in 16 games:

- **A whole difficulty tier**: Salad Normal (given presets by
  `offer-salad-normal-presets`); Loopy Tricky; Mathrax Unreasonable; Unequal
  Easy and Unreasonable; Group Easy, Hard and Unreasonable.
- **A rule or mode**: ABCD without diagonal touching; Ascent's rectangle
  without diagonals, and symmetrical clues; Boats with numbers removed;
  Bridges without loops, and with 1, 3 or 4 bridges a direction; Guess with
  blanks, and without duplicates; Mathrax with each of its six clue kinds
  switched off; Tracks allowing consecutive 1 clues; Unruly with unique rows
  and columns; Same Game's second scoring system (no hint).
- **A generator's taste**, which a hint is unlikely to read: Bridges' island
  and expansion percentages, and the symmetry choices of Light Up, Solo and
  Sticks.

The query is the census's own, and it is short: for each item of
`game.paramConfig` that is not `"string"`, the values of `item.get` over
`leafPresets(game)` against `[false, true]` or the indices of `item.choices`.

## What is known and what is not

- **A probe found no second throw, at low power.** For each value above, the
  game's first preset with that one field written, 8 boards from fixed seeds,
  hint-guided play to the end: every hinted game solved all 8, except the
  three Unreasonable tiers, which refused on the first request as they are
  meant to, and ABCD, whose first preset the field's own validation refuses
  (it needs 5 letters). Salad's fault ran at 2% to 24% of boards by shape, so
  8 boards would have missed it at most shapes. This says the gap is not
  hiding an obvious crash; it does not say the gap is empty.
- **Writing one field onto the first preset is the form `presets.ts` warns
  against** when it *replaces* the presets ("it writes the tier field and
  nothing else, so it never produced a Killer board"). Here it would be in
  addition, for a value no preset reaches at all. Whether that is the right
  board, or the value wants a preset, is the first design question.
- **Not measured**: what the walk would cost per commit. 27 more boards a
  guard is the upper bound, at the smallest size.

## What Changes

One of these, decided per item and recorded:

- **The value gets a preset.** Right where a player would want it on the menu
  anyway: a tier is the plain case, and a game whose menu stops short of a tier
  it deals is an omission inherited from upstream's list.
- **The guards deal it without one.** `gatePresets` gains the values no preset
  holds, each on the smallest preset that accepts it, so a game is walked on
  everything its dialog offers by having a `paramConfig`, with no list to
  keep.
- **The value is excused**, in a ledger beside the derivation, one entry a
  value, with the reason (a symmetry choice the hint cannot read), asserted to
  be exactly the values the derivation finds and nothing walks.

## Hints to pull in

None. Every game named here but Same Game has its hint.

## What would show it worked

The census above returns nothing that is neither dealt by a cross-game guard
nor excused by name, and planting a throw in a hint arm only an unoffered tier
reaches (Unequal's Easy-only path, say) turns a cross-game guard red.
