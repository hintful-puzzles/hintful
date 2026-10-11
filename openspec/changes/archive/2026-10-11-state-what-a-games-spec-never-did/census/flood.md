# flood

| Kind | Item | Verdict | Where |
| --- | --- | --- | --- |
| desc | the description format: a digit a square, a comma, the move limit | gap | "Flood descriptions are a digit a square and the move limit" (new) |
| desc | what `newState` refuses | gap | "Flood descriptions are a digit a square and the move limit" (new) |
| params | `WxH`, and a bare `W` as a square | stated | "Flood params are a size, a color count and a leniency" |
| params | the `c` and `m` letters, left out of the short form | stated | "Flood params are a size, a color count and a leniency" |
| params | refusals: under two squares, colors outside 3 to 10, a negative leniency | stated | "Flood refuses params it cannot deal" |
| pref | none of the game's own (`prefs` is absent) | not-owed | `ts-engine`: "The engine supports per-game user preferences" |
| control | a click on a square | stated | "Flood input fills with the chosen square's color" |
| control | the arrows, and Enter or Space on the cursor's square | not-owed | `engine-input`: "The engine owns a declaring game's press and select keys" |
| control | the secondary button, a held finger | not-owed | `engine-input`: "A game with no secondary meaning is not given a synthetic one" |
| hint | `fill`: the solver's next fill, its color named and the squares it joins dotted | stated | "Flood offers a solver-backed hint plan" |
| hint | the order: one technique, the solver's fills in turn | stated | "Flood offers a solver-backed hint plan" |
| hint | following and leaving the plan | stated | "Flood's hint plan follows the player's fills" |
| hint | a hint on a lost board that is not one color | not-owed | `engine-hints`: "The midend does not refuse a hint on a lost board" |
| hint | the refusal on a grid made one color after the limit | gap | "Flood's hint refuses a grid flooded after the limit" (new) |
| words | the status bar: moves against the limit, `FAILED!` | stated | "Flood's status bar counts moves against the limit" |
| words | the preset titles Easy, Medium and Hard | gap | "Flood's Easy, Medium and Hard name the extra moves" (new) |

## Defects

None.

## Notes

- The refusal on a grid flooded after the limit was run by the reviewer
  through the midend on `facts.json`'s board: 24 fills alternating the corner
  between colors 0 and 1 (the bar then reads `FAILED! 24 / 23 moves`, and a
  hint still gives `Fill with green: it joins the dotted squares to your
  region.`), then the hint's own fills to the end (`FAILED! 42 / 23 moves`).
  There the hint refuses with `This game is over. Undo to play on, or start a
  new one.`, and Solve refuses with the same sentence, which is the midend's
  refusal of Solve on a lost board (`hint-refusal.ts`, `GAME_OVER`). So the
  tree's "Flood's Solve refuses a finish past the move limit", which has
  Solve say that no solution can be found from this position, is what a
  player reads only while the board is not yet lost.
- `validateParams` (`src/games/flood/state.ts`) refuses only a grid under two
  squares. Nothing refuses a color count the description alphabet cannot
  write beyond the `paramConfig` bound of 10, which is what keeps a color a
  single digit; the description requirement leans on that bound.
