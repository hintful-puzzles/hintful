# name-a-games-tiers-once

**Status: filed by `describe-pearl-tracks-and-tents` (2026-11-08).**

## Why

A described game names its tiers twice: in its description's `tiers` and
technique `tier:` fields, and in its menu, through `tierNames` or a list in
`state.ts`. Nothing ties the two together. Pearl's description called its
second tier "Tricky" while the menu, the help and the game ID's letter said
Normal, and every test passed. A reader of the description, a soundness
listing, or a hint that ever names a tier sees a name the player never does.

## The measurement (2026-11-08; re-run it)

For every registered game with a compiled `tiers`, compare that list with the
`choices` of the game's `difficulty` param item (a scratch test over
`import.meta.glob("./games/*/*.compiled.ts")` and `getTsGame`). Of 39 games,
27 agree. The other twelve fall into three kinds:

- **No menu**: Black Box, Guess and Mines have one tier and no difficulty
  item. Nothing to tie.
- **The menu adds a search tier the ladder does not grade**: Clusters and
  Mosaic (`[Easy, Normal]` against `[Easy, Normal, Unreasonable]`).
- **Different names for the same rungs**: Galaxies (`[Normal,
  Unreasonable]` against `[Easy, Unreasonable]`), Unruly (`[Trivial, Easy,
  Normal]` against `[Easy, Normal, Tricky]`), and the Latin games, Adjacent,
  Unequal, Group, Keen and Towers, whose descriptions use the Latin
  library's scale (Trivial … Recursive) while their menus use the
  collection's.

## What Changes

- **The menu's names are read from the description**: a described game's
  difficulty item takes its choices from the compiled `tiers`, with the
  search tier appended where the game grades by search, so there is one
  list. Where a game's ladder tiers and its menu tiers are genuinely
  different scales (the Latin games), the description says how one maps to
  the other, and the menu still reads its names from there.
- **The descriptions whose names drifted are renamed** to the menu's, which
  is what the player sees: Galaxies and Unruly at least. Read each game's
  `state.ts` and help before choosing: the menu's name is the one to keep
  unless the owner says otherwise.

## Acceptance

No described game lists its tier names anywhere but its description. A
description whose tier names differ from what its menu shows fails the
build, without a hand-kept list of games. The menus, help and game IDs are
unchanged.
