# scaffold-a-game-that-passes-the-gate

Filed 2026-11-16 from a review of the `add-norinori` session's transcript;
the owner agreed to it the same day.

## What the work found

A new game starts from a skeleton (`src/skeleton/`). Norinori's build hit
each of these, one at a time:

- **The typecheck is red from the start.** `pins: {}` in the hint test fails
  `TS2740` until `hint-scan` has run, which was nearly an hour, from 03:41 to
  04:35. The agent filtered the typecheck's output to work around it.
- **Stale copies**: the skeleton's frame and hint-sentence snapshots, and its
  `soundness.json` entries, were copied as they stood.
- **`skip_specs: true`** in the change's `.openspec.yaml` was only refused at
  the verdict, once the spec existed.
- **`npm run game` needs `git add -N`** on new files, and nothing says so
  where it fails.
- **Menu-shape rules come one verdict at a time** (about 167 s each). First:
  `0 of 2 sizes are rectangles`. After adding 8x6: the rectangle must be
  portrait. The skeleton's presets hold neither.
- **The first `npm run game` came 73 minutes in.** `docs/testing.md` says to
  run it after each concern. Its first run reported ten failures, plus lint,
  format, unused exports, spec subjects and openspec.

## What this change does

- The scaffold step gives a tree that typechecks and validates. A pin not
  yet scanned is typed so the typecheck passes, and the hint test fails
  with "run hint-scan" instead. Snapshots and soundness entries are not
  copied. The change's `.openspec.yaml` has no `skip_specs` once a spec
  delta exists.
- The skeletons' presets include a portrait rectangle, and the menu checks
  report every shape rule in one message.
- `npm run game` finds a game's untracked files itself, or says to add them.
- `docs/new-game.md`'s route has the first verdict run right after the
  scaffold, so the checks arrive early and together.
- Settle in the design whether a scaffold command (`npm run new-game`) is
  the place for this, or the skeletons and their README.

## Before it starts

- Re-check each item at HEAD. Scaffold a throwaway game in a scratchpad
  worktree and list what fails, and keep that list as the change's measure.
