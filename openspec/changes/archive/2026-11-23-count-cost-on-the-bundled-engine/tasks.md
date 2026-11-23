## 1. Measure the instrument

- [x] 1.1 Count one born game's deals (Light Up) and one hand-written
      game's (one still under `src/games/` with no compiled module) both
      ways: under vitest as `compare-cost` does now, and as a bundle under
      `/usr/bin/time -l`. Record the share the getters take of each, so the
      design says how far the old figures are off and on which side.
      `cut-the-born-deal-cost` left its bundle bench's shape in its
      design.md § "2.2".
      Every game under `src/games/` has a compiled module now, so the
      hand-written side is Light Up's and Boats' own at `75691d811`; what
      is measured is all vitest adds (getters and DEV), the two runs'
      difference (design.md § "The instrument (1.1)").

## 2. Count the bundle

- [x] 2.1 `compare-cost`'s worker as a bundle entry, built per tree by Vite
      with DEV off, run by Node with `--predictable` under the counter. Its
      header says how, and refuses a tree it cannot bundle.
- [x] 2.2 See the new figure move with a planted cost (a loop in a compiled
      technique's runtime call) before trusting it, and see a tree against
      itself stay inside the spread.
- [x] 2.3 `deal-compare` and `deal-profile`: bundled the same way, or a
      header line saying what vitest adds. A header line each (design.md §
      "Decisions").

## 3. Re-count and record

- [x] 3.1 Re-count the three born families against their baselines and
      record the table in design.md; correct `docs/descriptions.md` and
      `docs/method.md` where they read the old figures.
- [x] 3.2 Mend what the re-count found (design.md § "The born families
      re-counted"): `cut-the-born-deal-cost` took Mosaic's 12x15 deals past
      100 ms and its 20x25 Normal from 302 to 883 ms. Most of it is the
      hide keeping a draw whose every clue Easy does not finish and hiding
      from it at Normal (12x15 Normal 88 to 56 ms without it); Light Up's
      deal is why it was kept. Singles' +33% is looked at too.

## Workflow follow-up

- Commit each step; push at the session's end; archive with the last
  commit.
