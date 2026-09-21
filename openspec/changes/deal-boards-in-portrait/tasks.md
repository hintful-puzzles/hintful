# deal-boards-in-portrait — tasks

## 1. Measure the right thing first

- [ ] 1.1 Re-take the census on `computeSize` aspect, not on param names, for
      every registered game's default and every preset leaf. Give it a known
      positive (Magnets 6x5 must read as landscape) and a vacuity count.
- [ ] 1.2 For every landscape entry, write down whether the transpose is simply
      the same game on its side (most rectangular grids), or not (gravity,
      directed tilings, fixed-side goals or clues). Read each game's rules; do
      not guess from its family.
- [ ] 1.3 Raise the two owner points in the proposal (preset titles, and
      remembered sizes under auto-orientation) before building part 3.

## 2. Portrait defaults and presets

- [ ] 2.1 Flip each landscape default and preset to portrait, game by game, with
      preset titles following. Check the Custom dialog still round-trips.
- [ ] 2.2 Help pages: any that name a default size or describe a board's shape
      follow.
- [ ] 2.3 Tests that pin a default or a preset list are re-read and updated for
      the reason they exist; the frozen differentials keep their sizes.
- [ ] 2.4 A guard: no default draws wider than tall on a game that has no
      recorded reason to, keyed on `computeSize`.

## 3. Deal to fit the viewport

- [ ] 3.1 Decide which games may be dealt either way round (task 1.2), derived
      where possible, with a ledger of the reason for each exception.
- [ ] 3.2 At deal time only: choose `w×h` or `h×w` by which gives the larger tile
      in the current board area. Never re-deal or reorient a game in progress,
      a restored autosave, or a shared ID.
- [ ] 3.3 `Puzzle.currentParams` and the type menu match presets up to
      transposition; the Custom dialog shows the dealt size.
- [ ] 3.4 Tier-3 tests for the deal decision (upright, landscape, square board,
      an excluded game), and a Chrome check on a phone-sized viewport both ways
      round.

## 4. Close out

- [ ] 4.1 Spec deltas on each affected game's params requirement, and on the
      app-shell spec for the deal-time orientation.
- [ ] 4.2 `docs/games/mechanics.md` § params/presets: new games default to
      portrait, and how a game opts out of orientation-free dealing.
