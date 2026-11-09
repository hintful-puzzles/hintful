# Tasks

## 1. Measure

- [x] 1.1 Re-run the comparison of compiled tiers with each menu's, and read
      each disagreeing game's names in its state, help and description
      (2026-11-09: of the described games with a menu, nine disagreed:
      Adjacent, Unequal, Group, Keen, Towers, Unruly and Galaxies by name,
      Clusters and Mosaic by a missing search tier; Black Box, Guess and
      Mines have one tier and no menu)

## 2. One list

- [x] 2.1 A described game's difficulty item reads its names from the
      compiled tiers, with the search tier and any mapping stated in the
      description. No mapping was needed: every game's ladder tiers map to
      its menu's by position, so each description now uses the menu's names,
      and Clusters and Mosaic list Unreasonable as the other search games do.
      `searchTiers` and `searchTierItem` take the compiled names, and
      `difficulty-contract.test.ts` fails where a menu differs from its
      compiled `tiers` (seen failing on Galaxies' old pair)
- [x] 2.2 The drifted descriptions renamed to the menu's names, positionally;
      Unruly's verdicts re-recorded, since its variation's technique carries
      its tier inside the rules fingerprint

## 3. Close

- [x] 3.1 Menus, help and game IDs unchanged (presets seen in the app for
      Unruly, Clusters, Keen and Galaxies); guide updated; archive
