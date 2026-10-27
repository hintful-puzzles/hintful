# Design: build-every-menu-from-its-boards

## Context

`presetGrid(paramConfig, boards, opts)` returns a `PresetMenu`, and
`Game.presets()` returns one too, so a game may call the builder or write the
list itself and nothing tells the two apart. `presetMenu`
(`engine/param-label.ts`) post-processes whatever `presets()` returns: it
titles the leaves and, for a game with a ruleset field, splits a flat list
into one section per ruleset.

## The hand-built menus, sorted (2026-10-27)

Read off each game's menu as runs of one board at its tiers (a throwaway
vitest that walked `presets()` for every registered game):

- **A plain list, no tiers**: Black Box, Cube, Fifteen, Flip (two rulesets,
  which `presetMenu` sections), Inertia, Mines, Pegs, Same Game, Sixteen,
  Slide, Sokoban, Twiddle, Untangle.
- **A grid at every tier**: Boats, Bricks, Galaxies, Light Up, Map, Rome,
  Seismic, Singles, Spokes, Undead. Seismic writes its two rulesets
  interleaved tier by tier, and the per-ruleset split puts each section back
  in grid order, so the builder's order gives the same menu.
- **A grid with tiers cut, often with variants**: Bridges, Dominosa, Group,
  Keen, Magnets, Mathrax, Salad, Solo, Unequal. Magnets' symmetric board
  follows each size; it is a board of its own, offered at one tier.
- **Anything else**, two kinds:
  - **A line named by hand**: Flood (upstream's Easy/Medium/Hard, which are
    extra-move allowances), Guess ("Standard", "Super"), Netslide (easy,
    medium, hard, which are barrier and wrapping settings) and Subsets (one
    board; its params' label says only the tier). Upstream gave these lines
    names the params' label does not say, and the menus do not change, so
    the builder takes a `title` for a line.
  - **A section that is not a ruleset**: Loopy's "More..." holds six of the
    tilings. The builder takes `more`, boards in a section of their own after
    the rest. Solo and Singles, named in the proposal, are flat.

## Decisions

- **`Game.menu` declares the boards and the midend builds the menu**; the
  `presets()` member is gone. A hand-built menu cannot be written, and no
  scan is needed to keep it so. Every menu above is expressible, which is
  what task 1.2 waited on: nothing argued for keeping `presets()`. A test
  that wants a game's menu reads `presetMenu(game)`, the same tree the app
  shows.
- **The menu's root has no title.** The midend shows the root's lines and
  never its title, so the titles games gave it ("Type", "Size", the game's
  name) were seen by no player. The params corpus named its cases with it;
  that prefix is dropped first, on its own commit, so the migration's commit
  leaves the snapshot alone and the guard means what it says.
- **The menus do not change.** The `params-stability` snapshot is the guard;
  a moved line is read and fixed, never re-baselined. It passed unchanged
  after the migration, and failed on Tents with two boards swapped.
- **A test reads the menu's lines through `leafPresets`, never a copy.**
  Bridges, Boats, Group, Salad and Seismic exported their menu's lines for
  their tests; those tests now take the lines off the built menu. A test that
  read `presetMenu(g).submenu` for its leaves read nothing on a ruleset game,
  whose top level is its sections: Path's ladder census failed on it, and
  Starbattle's passed over an emptied corpus. Those read `leafPresets` now.
- **Tracks' comment was wrong**: it said the two non-square sizes stop a
  tier short, and 8x8 does too. The menu stays as it was, and the comment at
  its `tiers` says Hard is offered at 10x10 and 15x15 only.
