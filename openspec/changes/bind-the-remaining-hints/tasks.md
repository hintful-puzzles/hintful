# Tasks

## 0. Decisions

- [x] 0.1 A recolored clue is an outline (design D1); the guide's clue-digit
      table replaced.

## 1. Firing ladders and placement tracking

- [x] 1.1 Unruly (worked example: evidence renamed outline, D2/D3).
- [x] 1.2 Clusters, Filling, Light Up.
- [x] 1.3 Pattern, Range, Singles (Singles says "black", as its rules do).
- [x] 1.4 Slant, Subsets, Tents (Tents' `structuredClone` test fixed).

## 2. Technique ladders

- [x] 2.1 Bridges, Galaxies, Magnets, Pearl, Spokes.

## 3. Their own deduction loops

- [x] 3.1 Boats, Bricks, Dominosa, Sticks, Loopy, Crossing, Undead ("shaded"
      leaves the retired list, D5; Boats' never-touch water clause ledgered).

Batches 1–3 landed as one commit, with Fifteen and Sixteen: the gate tests
the working tree, so the batches were committed when the tree was quiet
rather than one at a time.

## 4. Planners and heuristic hints

- [x] 4.1 Fifteen, Sixteen (a slide's tile and landing are both what the step
      decides, so both are rings).
- [ ] 4.2 Netslide, Inertia, Untangle, Flood, Guess.

## 5. Close

- [ ] 5.1 The binding walk's floor equals the hinted population.
- [x] 5.2 Salad's count-marker legs name the square they ring: "so this
      square and the rest of it must be empty" (design D3).
- [ ] 5.3 Retire `hintMarks.drawn` once renderers draw from the roles, or
      scaffold it as its own change with the reason.
- [ ] 5.4 Run the app on a game from each batch.
