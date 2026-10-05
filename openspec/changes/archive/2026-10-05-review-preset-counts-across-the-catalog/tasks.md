## 1. Measure

- [x] 1.1 Re-take the census: per game, the number of leaves, the sections,
      and which of its `paramConfig` fields the menu varies and over how many
      values. (`census.md`)
- [x] 1.2 Sort the menus by shape (grid, ladder, author's pick) by reading
      them, and say which games fit none. (`census.md`)

## 2. Decide, with the owner

- [x] 2.1 The length a menu aims for, and what a game past it does: twelve
      lines a section, a cap on lines and not on sizes.
- [x] 2.2 What a leaf's title says inside a section
      (`leave-the-headings-word-off-a-preset`). A modifier has one line,
      after the grid. Whether a ruleset's section may hold groups did not
      come up: Ascent's fits in ten lines.
- [x] 2.3 The default shape is a grid, built by `presetGrid` from the boards
      a game names.

## 3. Apply

- [x] 3.1 The convention: `engine/preset-grid.ts`, and
      `docs/games/mechanics.md` § "The preset menu is a grid".
- [x] 3.2 Each menu that did not follow it, changed (`menus.md`). Salad's
      Normal presets stay, each after its shape's Easy line.
- [x] 3.3 For each configuration a menu stopped offering, what still deals it
      (`menus.md`).
- [x] 3.4 `preset-menu-shape.test.ts`. Each of its rules failed on the menus
      as they stood before 3.2: the cap on Solo and Ascent, the run on Boats,
      Keen and Solo, the tiers on Group, Loopy, Mathrax and Unequal, the
      modifier on eight games, three boards on Fifteen, Guess and Sticks.
- [x] 3.5 Every preset of the eleven tiered games changed, dealt three times
      and its lowest solving cap read. Five cells came out below their tier
      and are off the menus (`deal-the-tier-a-custom-size-asks-for`).
- [x] 3.6 The per-game specs that stated a preset list.
