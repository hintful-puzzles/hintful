# Tasks

## 1. The words

- [x] 1.1 The population, from the references (proposal § "What says a color today")
- [ ] 1.2 One state says "shaded"; the pair's words declared beside its shapes, not derived from its colors
  - [x] One state: `SHADED_NAME` is "shaded"; controls say "shade it"; the
        help pages of Pattern, Mosaic, Range, Singles, Bricks and Norinori say
        "shaded", Cube's says "painted" (its hint's word), Separate's and
        Tracks' say "filled with color"; `describe/lint.ts` takes the words
        from `piece.ts`
  - [ ] The pair (Unruly, Clusters, Flip, Sokoban): shape words in `piece.ts`,
        `TWO_NAMES` retired
- [ ] 1.3 Two-state sentences in each game with a shape word; shown to the owner before settling it
- [ ] 1.4 A guard: no hint names a piece by a color word
- [ ] 1.5 Hint snapshots, pins and help pages; `npm run test:hint-sweeps`
- [ ] 1.6 The hints guide's vocabulary section
