# slice-presets-by-the-axes-a-game-varies — tasks

## 1. Take the population before designing

- [x] 1.1 Printed, for **every** hinting game, its leaf presets and the gate
      slice's pick, off the live registry: **35 games, 280 leaf presets, 88 in
      the gate slice.**
- [x] 1.2 Classified by reading each game's `paramConfig` values across its
      presets, not its preset titles. The games whose presets carry a **mode**
      the tier keying de-duplicated away: **Solo** (`x`, `jigsaw`, `killer`,
      `symmetry`), **Loopy** (`type`, eighteen tilings, one walked),
      **Seismic** (`game-mode`: Tectonic), **Unequal** (`mode`: Adjacent),
      **Salad** (`game-mode`: Numbers — *and* its `difficulty` is constant
      across all eleven presets, so the tier keying collapsed the whole game to
      one board), **Group** (`show-identity`), **Keen**
      (`multiplication-only`), **Lightup** (`symmetry`), **Crossing**
      (`symmetric-walls`), **Netslide** (`walls-wrap-around`, already excused by
      the search slice). Everything else varies only scalars.
- [x] 1.3 Instrument checked against known positives: **Subsets** (2 presets,
      slice 2), **Sticks** (2/2) and **Fifteen** (1/1) show a slice equal to
      their preset list, which is what a game that loses nothing must look like.

## 2. Design the derivation

- [x] 2.1 `presetAxes` / `axisSlice` in `src/engine/testing/hint-games.ts`,
      derived from **`paramConfig`** — a list the Custom dialog already
      consumes, which `custom-params.test.ts` already requires every registered
      game to carry, and which is *typed*. No roster, no per-game declaration,
      and difficulty stops being a special case (it is a `"choices"` item).
- [x] 2.2 Bounded by the type, not by a cap: a `"string"` axis is a scalar and
      contributes **its two extremes**; a `"boolean"` / `"choices"` axis is a
      closed set and contributes **every value**. Presets are taken in menu
      order, so each value is claimed by the *smallest* board offering it —
      which is why the mode coverage is nearly free (see 3.1). Cross product
      rejected as 2.2 anticipated: Solo would have gone to ~15 of 18.
- [x] 2.3 `SEARCH_PLANNING_GAMES` still short-circuits ahead of the axis slice,
      so Sixteen and Netslide keep their one smallest preset and the
      `SEARCH_REACH` ledger is untouched.

## 3. Measure, then accept or defer

- [x] 3.1 Measured back to back on one box, **2026-09-20**: `hint-resume.test.ts`
      **25.1 s (88 walks) → 67.0 s (141 walks)**, against 229.6 s for all 280
      presets. Conditions, stated because they matter: 16 GB box, load 3.6–5.1,
      **free memory 125 MB and 18.6 of 19.4 GB of swap in use** — deep in
      paging, so the seconds are upper bounds and the ~2.7× ratio is the figure
      that survives. Per-board attribution (one run, so the ratios are taken
      under identical conditions) puts the split at **~22.4 s of mode coverage,
      18.9 s of which is Loopy's eighteen tilings**, and **~22.5 s of largest
      boards**, of which Mathrax 9×9 is 7.7 s and Keen 9×9 4.9 s. Every
      individually-added mode board outside Loopy costs under 100 ms.
- [x] 3.2 **Accepted per commit, nothing deferred.** The file returns to roughly
      the cost it carried before `retire-tests-that-do-not-earn-their-runtime`
      sliced the two searching games out of it (~69 s, measured 2026-09-08), so
      this is a cost the collection has already lived with, and the deferral
      rules' four conditions are not engaged. Deferring the size half to push
      was considered and rejected on the first condition: a size-dependent hint
      bug is not *decay*, it is the code the commit is changing.
- [x] 3.3 What still covers the presets the slice does not walk is stated at the
      site (`walkedPresets`' doc comment) and in
      `docs/games/testing.md` § "Slicing a preset sweep for the gate": the slow
      tier walks all 280, and `hint-quality.test.ts`'s `lintCases` reads every
      preset of every game per commit at one seed — for *narration*, which is a
      different question and not a substitute.

## 4. Prove it works

- [x] 4.1 Planted a real Killer-only defect — Solo's hint recorder capped at
      `DIFF_KSINGLE` instead of the board's own `kdiff`, i.e. the hint grown
      weaker than the solver that graded the board. **Tier-keyed slice: 111
      passed, green. Axis-keyed slice: red on `solo-3x3 Killer-hr-a`**, with the
      refusal quoted. Restored and re-verified green. (Solo's own
      `solo-hint.test.ts` catches that plant too; what no per-game file asserts
      for most of the collection is this walk's property — convergence from
      arbitrary reached positions.)
- [x] 4.2 Vacuity guards, each **proved to fail** by planting the collapse it
      exists for and watching it go red:
      - `hint-resume.test.ts`'s sweep-wide floor raised **40 → 100**, which is
        the first number above both collapse counts (one board per game is 35,
        the tier keying was 88, the axis slice is 141) rather than merely above
        zero.
      - `hint-games.test.ts` pins the **rule** against a hand-written menu,
        because the collection cannot exercise it: every game's scalar params
        are numeric, so the branch treating a non-numeric `"string"` item as a
        selection is unreachable over real games and would stay green however it
        behaved. Inverting the scalar/discrete split turns three of its ten
        cases red.
      - `hint-enrollment.test.ts` gains three cases on the *instrument*: every
        game has a `paramConfig` to derive from and nearly every game yields an
        axis (red when `presetAxes` returns nothing); every value of every
        discrete axis appears in the slice, recomputed the plain way rather than
        through the greedy (red when `axisSlice` collapses); and a **known
        positive** naming Solo's Killer/X/jigsaw, Unequal's Adjacent and
        Seismic's Tectonic boards **by the params a walked board carries**, so
        rewording a menu entry cannot disarm it.

## 5. Close out

- [x] 5.1 `MODIFIED` delta on `ts-engine` → "The hint walk SHALL cover every
      preset a game offers": the slice clause now reads *per value of every
      axis*, the `paramConfig` derivation and its scalar/discrete rule are
      normative, the three keys tried are tabulated as measurements, the vacuity
      floor gets a rule, and a new scenario covers the mode case. All four
      existing scenarios reproduced; "An untiered game's largest board is walked
      per commit" re-worded from "its last preset" to "the largest board it
      offers" — they differ for Flood, whose last preset is 12×12 at four colors
      (an interior color count, and a leniency an earlier board already claimed)
      while its largest board is the 16×16 the old rule never walked — and
      corrected to name the searching-hint exception it had silently contradicted
      since 2026-09-09. Heading checked against the live spec with `rg -F -x`;
      `openspec validate --strict` passes.
- [x] 5.2 `docs/games/testing.md` gains § "Slicing a preset sweep for the gate"
      beside § "How a cross-game guard finds its population" — the three keys as
      a table, why `paramConfig` is the source, the measured cost split, and what
      still covers the rest. `docs/games/hints.md` § on the resume walk repointed
      to it.
