# Tasks

## 1. The words

- [x] 1.1 The population, from the references (proposal § "What says a color today")
- [x] 1.2 One state says "shaded"; the pair's words declared beside its shapes, not derived from its colors
  - [x] One state: `SHADED_NAME` is "shaded"; controls say "shade it"; the
        help pages of Pattern, Mosaic, Range, Singles, Bricks and Norinori say
        "shaded", Cube's says "painted" (its hint's word), Separate's and
        Tracks' say "filled with color"; `describe/lint.ts` takes the words
        from `piece.ts`
  - [x] The pair (Unruly, Clusters, Flip, Sokoban): `PAIR_NAMES` in
        `piece.ts`, `TWO_NAMES` retired; the `{color term}` clause role is
        `{piece term}`, and a game's `piece` hook gives the member, never a word
- [x] 1.3 Two-state sentences in each game with a shape word; shown to the owner before settling it
      (owner, 2026-11-16: "block", with "must hold a block")
- [x] 1.4 A guard: no hint names a piece by a color word (`hint-quality.test.ts`,
      population from each game's palette; `piece.test.ts` holds the words apart
      from every named color; `help-coverage.test.ts` the pages). Seen to fail
      with `PAIR_NAMES[0]` planted as "purple".
- [x] 1.5 Hint snapshots, pins and help pages; `npm run test:hint-sweeps`
      (walk fingerprints of Clusters, Mosaic, Range, Singles and Unruly moved
      in their hashes alone; step counts and rung tallies unchanged)
  - [x] The catalog's objectives said "black" for Mosaic's and Singles' shaded
        squares and "black and white" for Unruly's pieces (`catalog-data.ts`)
  - [x] Seen in Chrome: Unruly's rules dialog and its first hint
- [x] 1.6 The hints guide's vocabulary section
