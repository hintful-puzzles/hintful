## 1. Measure the instrument

- [ ] 1.1 Count one born game's deals (Light Up) and one hand-written
      game's (one still under `src/games/` with no compiled module) both
      ways: under vitest as `compare-cost` does now, and as a bundle under
      `/usr/bin/time -l`. Record the share the getters take of each, so the
      design says how far the old figures are off and on which side.
      `cut-the-born-deal-cost` left its bundle bench's shape in its
      design.md § "2.2".

## 2. Count the bundle

- [ ] 2.1 `compare-cost`'s worker as a bundle entry, built per tree by Vite
      with DEV off, run by Node with `--predictable` under the counter. Its
      header says how, and refuses a tree it cannot bundle.
- [ ] 2.2 See the new figure move with a planted cost (a loop in a compiled
      technique's runtime call) before trusting it, and see a tree against
      itself stay inside the spread.
- [ ] 2.3 `deal-compare` and `deal-profile`: bundled the same way, or a
      header line saying what vitest adds.

## 3. Re-count and record

- [ ] 3.1 Re-count the three born families against their baselines and
      record the table in design.md; correct `docs/descriptions.md` and
      `docs/method.md` where they read the old figures.

## Workflow follow-up

- Commit each step; push at the session's end; archive with the last
  commit.
