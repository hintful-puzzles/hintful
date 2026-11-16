# Tasks

## 1. The deal

- [x] 1.1 Rebuild the instrument: sort failed mends by what the search says, and trace the open count
  - The deal walk's census was enough; no scratch dump was kept.
- [x] 1.2 Try the directions in the proposal, measured each against the last
  - Measured 2026-11-16, deal walk, six deals a cell (8x8 Easy, 8x8 Normal,
    10x10 Easy median; baseline 5 s, 15 s, 82 s with 2 of 6 given up):
    - A judge scored by the squares the ladder must be given to finish: 26 s,
      27 s. Mends stalled as often, each judgment dearer. Dropped.
    - Regions built by revealing squares into a solved board: almost no
      board revealed whole at 8x8, none at 10x10. Dropped.
    - Moves aimed at the frontier of what the ladder decided: 8 s, 13 s,
      62 s. No better. Dropped.
    - Half the regions shrunk to three or four squares: 14 s, 29 s, 56 s.
      Dropped.
    - A shorter stall (12 moves): 5 s, 18 s, 53 s. Dropped.
    - No second-answer search: 9 s, 7 s, 70 s. Dropped.
    - Closed dominoes spread apart rather than placed at random: 6 s, 8 s,
      22 s with none given up. Kept.
    - Dominoes packed by remove-one-and-refill (sen-ltd/norinori, MIT), from
      36% of the squares shaded to 45%: 0.1 s, 0.2 s, 0.7 s. Kept; with the
      spread, 10x10 Easy is 0.3 s. The proposal's "one domino for every four
      squares" never ran: the greedy placement stops at 36% under any cap.
    - The Easy cap on region size, at the new density: no difference within
      noise. Removed.
- [x] 1.3 Time every size to 10x10 at every tier; the menu from it (`state.ts`)
  - Twenty deals a cell: 10x10 median 0.2 to 0.5 s, 2 s at worst under
    vitest; 12x12 9 s at worst, so left as a Custom size. The menu is 6x6,
    6x8, 8x10 and 10x10 at every tier: half its sizes rectangles and twelve
    lines at most (`preset-menu-shape.test.ts`), so 8x8 is a Custom size.
- [x] 1.4 Hint pins and generation tests still pass; `npm run game -- norinori`
  - The generation test deals every shape in every run now that a deal is
    cheap, and adds 10x10 Normal and Tricky, where `claimed` and `fullRegion`
    fire.

## 2. Credit and guidance

- [x] 2.1 Credit sen-ltd/norinori in the code, `CREDITS.md` and About's credits
- [x] 2.2 AGENTS.md: look for prior art, and credit what is taken (owner's ask)
- [x] 2.3 `docs/solver-and-generator.md`: a mend's places to start and small regions come from the draw
