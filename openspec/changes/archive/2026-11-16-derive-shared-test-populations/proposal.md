# derive-shared-test-populations

Filed 2026-11-16 from a review of the `add-norinori` session's transcript;
the owner agreed to it the same day.

## What the work found

Adding Norinori, a described game, still edited lists of games kept by hand
in shared tests. `docs/doctrine.md` says a guard derives its population from
what each game is. The lists:

- **Planted defects**: `research/technique-check/describe-check.test.ts`
  keeps each game's plants centrally.
- **Close colors on purpose**: `src/puzzle/neighbor-contrast.test.ts`'s
  `CLOSE_ON_PURPOSE` took four entries copied from Star Battle. Both games use
  `REGION_FILLS.slice(0, 4)`, a fact of the region fills, not of the game.
- **Long sentences**: `LONG_NARRATIONS` in `src/engine/hint-quality.test.ts`.
  This is taken up for described games by `check-a-description-when-it-compiles`.
- **A false positive**: `palette-source.test.ts` read `const CLOSED_ONE_IN =
  [2, 3, 4]` as a color literal, and the generator's tier tables were
  rewritten to get past it.
- **The `hint-resume` share floor**: adding a game moved the round-robin
  shares (`expected 951 to be greater than 1250`). It was fixed per game in
  that session; re-check that it now holds for the next game.

## What this change does

- The region fills own their exemption: a game that draws regions with
  `engine/region-walls.ts` and the region fills inherits it, and
  `CLOSE_ON_PURPOSE` keeps only a game's own choice.
- A game's planted defects are declared beside it, in its directory or its
  description, and the check finds them by the game.
- The palette guard keys on a value that reaches a color (a palette entry,
  `colors`) and not on the shape of a number triple. See it still catch a
  planted color literal.
- Walk every other shared test a new game touched in the Norinori commit
  (`git show --stat 86c58a880`). Derive each population, or record why it
  stays a list.

## Before it starts

- Re-check each list at HEAD, and find each by reference, not by name.
