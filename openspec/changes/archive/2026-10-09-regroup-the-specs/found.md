# What settling the doubts found and this change did not act on

Written 2026-10-09. The agents that settled the doubtful requirements could
write one verdict file each, so what they found beyond a verdict is a `note`
entry of `verdicts/<capability>.md`. A note that named a stale guide line or
a stale comment was corrected in this change. These are the rest, by kind,
with the file whose notes hold the detail. None is acted on here, and each
was true of the tree on that day.

## A defect a player can reach

- **An untiered game loads a pasted board its own solver cannot finish, and
  a hint on it crashes.** `solverVerdict` in `src/engine/desc-error.ts` reads
  a game with no difficulty contract and no `finishesByDeduction` as able to
  finish every board. Reproduced in Chrome: the game ID `5x5n5:a` opens in
  Palisade, and pressing Hint raises the "Something went wrong" dialog, since
  `Midend.computeHintPlan` throws on a deduction-exhausted refusal from a
  game with no tier that allows search. Read in the code and not run: the
  same load for Signpost, Crossing and Sticks, where Check & Save finds
  nothing wrong and Solve refuses or, in Sticks, fills in a partial
  deduction. `engine-params`, "A board loads only if the game's own solver
  solves it", says none of these should load. Reached only by a game ID
  nobody's generator wrote. `verdicts/palisade.md`, `signpost.md`,
  `crossing.md`, `sticks.md`, `range.md`.

## A rule several games each state, with no shared requirement

Each would be one requirement of a shared capability and a cut in every game
that repeats it. Adding a rule to a shared capability was outside what an
agent settling one game could do.

- A generator given the same params and seed writes the same board
  (`verdicts/rome.md`, `spokes.md`, `tracks.md`, `mathrax.md`, `lightup.md`,
  `boats.md`).
- An input that would change nothing makes no move and no history entry
  (`pearl.md`, `salad.md`, `tents.md`, `mosaic.md`).
- The candidate-walk family: a hint's solve reads the placed entries and
  never the notes, a hint step is never undone by a later one, a struck
  candidate is crossed through, and what the keep-track verdicts are
  (`group.md`, `solo.md`, `keen.md`).
- The note-taking family: what a press does with the sticky preference on
  and off, the preferences' defaults, Enter as the way into pencil marks
  (`towers.md`, `unequal.md`, `undead.md`, `abcd.md`).
- A hint-executed move plays its animation at one duration (`unruly.md`).
- The completion flash that lifts every cell of a quiet-surface board, and
  the shaded-alone use of the two-state pair (`pegs.md`, `separate.md`,
  `pattern.md`).
- A sliding game's several slides for one tile are one journey
  (`netslide.md`).
- Every rung of a ladder fires on a pinned corpus or is named as unreached
  (`solo.md`).
- Every preset passes validation for generation (`abcd.md`).
- A game's move shape is a promise to saves, and no spec states one
  (`untangle.md`).

## A shared requirement that reads wider or narrower than the code

- `engine-colors`, "The figure the player steers takes the cursor's color",
  and Cube (`cube.md`); "The solved flash is one role" and the lifted flash
  (`separate.md`).
- `engine-input`, "One keyboard-cursor vocabulary across games", and Loopy's
  cursor (`loopy.md`); "A pointer drag over a grid has one name across the
  collection", and Pegs' drag (`pegs.md`).
- `engine-notes`, the Mark-all cleanup rules scoped to games with uniqueness
  regions (`abcd.md`).
- `engine-candidate-hints`, "Latin-family hints distinguish naked and hidden
  singles", whose population leaves Seismic out (`seismic.md`).
- `ts-engine`, "A candidate note that excludes the answer is a mistake",
  whose "from the committed placements only" is not what Undead and Rome do
  (`undead.md`).
- `engine-hints`, "Deduction runs out only where the tier permits search",
  and the untiered games whose `hint` can return that refusal (`range.md`,
  `filling.md`, `singles.md`, `palisade.md`).

## Something a game's spec has never stated

By `prune-brief.md` each of these stays in a spec, and none was ever there,
so nothing was cut and nothing could be restored.

- A description format: Net, Twiddle, Cube, Flip, Flood, Mines (both forms),
  Pegs.
- A params encoding: Group, Pegs.
- A params refusal: Keen's multiplication-only 9×9 above Tricky, Galaxies'
  3×3 at Unreasonable.
- Controls: Blackbox, Signpost, Clusters' modifier arrows, Guess's label
  toggle, which corner each Twiddle letter turns.
- A hint: Mosaic, Signpost, Boats' techniques and their order, four of
  Towers' clue techniques, Mines' order.
- Words a player reads: the status bars of Mosaic and Blackbox; what
  Netslide's preset titles mean.

## A guard that could exist and does not

- Nothing checks that a game does not import the midend (`ts-engine.md`).
- The against-the-surface measurement of a bevel covers one game
  (`engine-colors.md`).
- No test renders the puzzle screen at a phone width. "The chrome does not
  overflow at a phone width" is restored by this change, and was checked by
  hand in Chrome at 390 pixels on Solo: no element past the edge and no
  label truncated (`app-shell.md`).

## Smaller things

- `FifteenUi.invertCursor` is always false; the preference it stood for is
  not offered (`fifteen.md`).
- With the cursor hidden, a shifted arrow paints in Tents and only reveals in
  Range (`tents.md`).
- The `quick-save` spec says "Quick-load" where the control reads "Back to
  last save" (`quick-save.md`).
- No guide points a session at the three device-acceptance rules of
  `ts-migration` (`ts-migration.md`).
- The four design-fiction requirements of `repo-layout` govern a kind of
  document the tree no longer holds (`repo-layout.md`).
