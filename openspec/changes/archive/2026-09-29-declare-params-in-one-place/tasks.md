## 0. Measure

- [x] 0.1 Every leaf preset through a draft describer (`design.md` § "Task 0"):
      37 games exact, 15 after standardization, 4 named. The falsifier does not
      fire.

## 1. Engine

- [x] 1.1 `ParamConfigItem` gains `doc`, `label` and (text fields) `bounds`.
- [x] 1.2 `describeParams(game, p)` and `presetMenu(game)` in
      `engine/param-label.ts`; a leaf preset's `title` is optional.
- [x] 1.3 `difficultyItem(tiers, field)`; `tierOf` / `withTier` derived from it;
      `DifficultyContract` keeps `solveAtCap` and the declared exceptions.
- [x] 1.4 `paramsError(game, p, full)`: bounds, choice range, then the game's
      optional `validateParams`. Midend and tests call it.
      `mistake-invariant.test.ts` called `contract.tierOf` through a cast the
      typechecker could not see past, and `hint-enrollment.test.ts`'s scan
      keyed on `.withTier(`, a spelling that no longer exists; both fixed.
- [x] 1.5 The midend's `describeParams(params)` feeds the custom header;
      `Game.describeParams`, `decodeCustomParams` and every `describeConfig`
      are deleted.
- [x] 1.6 `vite-plugins/parameters.ts` expands `{{parameters}}` from
      `paramConfig`.

## 2. Games

- [x] 2.1 Every game: labels, docs (moved from its help page), bounds (moved
      from its `validateParams`), `difficultyItem`, untitled presets unless
      named, `{{parameters}}` in its page. Eleven games had nothing left for
      `validateParams` and dropped it. Bricks' retired Tricky tier (`dt`) keeps
      loading through a new `retired` count on a choices item.
      `params-stability.test.ts`'s re-baseline moved 102 labels and not one
      encoding (the multiset of `full=`/`brief=` strings is identical).

## 3. Guards

- [x] 3.1 Every preset label is unique within its game, and a named preset's
      title is not its derived label (`params-declared.test.ts`). Proven red:
      Unequal without its mode label reads "5x5 Tricky" twice.
- [x] 3.2 Every choices field's doc names each of its word choices; every page
      carries `{{parameters}}`. Proven red: Unequal's mode doc without
      "Adjacent".
- [x] 3.3 Every item has a doc; a `{ with }` doc names the item before it.

## 4. Codecs

- [x] 4.1 Hand-written codecs move to `paramsCodec` where
      `params-stability.test.ts` allows. 14 of 38 moved (ABCD, Bridges,
      Crossing, Flip, Galaxies, Inertia, Loopy, Pearl, Salad, Same Game,
      Seismic, Spokes, Sticks, Unruly), each proven by an old-against-new
      differential of 70–658 strings with the stability table untouched.
      `num` gained an `IntAccess` form and `letters` was added, each serving
      three or more games (design D6). The 24 that stay hand-written escape
      the grammar for reasons their batch reports named: floats (Net,
      Netslide, Rect), a leading letter (Cube), multi-character words (Pegs,
      Solo), tails read in any order (Black Box, Dominosa, Flood, Group,
      Guess, Mines, Twiddle), fields outside the dialog or single-game quirks
      (Ascent, Boats, Keen, Light Up, Map, Mathrax, Mosaic, Slide, Subsets,
      Unequal, Untangle).

## 5. Close

- [x] 5.1 Spec deltas re-read against the code; docs guides updated
      (`mechanics.md` params section, `engine-catalog.md`,
      `solver-and-generator.md`).
- [x] 5.2 Ran the app (Chromium, dev server): Map's Type menu reads
      "15x20 Easy, 30 regions"; a custom Map board's header reads
      "20x20 Normal · 40 regions"; the Custom dialog refuses width 1 with
      "Width must be at least 2"; Unequal's help page shows the generated
      list with "It must be between 3 and 31".
