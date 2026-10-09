# Verdicts: flood

## keep `flood`: Flood's hint plan follows the player's fills

`engine-hints`, "A player move is classified against the stored plan", says what the midend does with each verdict and leaves the verdict to the game. Which fill completes a step and that nothing is ever `onTrack` is Flood's answer (`hintKeepTrack` in `src/games/flood/index.ts`), and everything a hint does stays in the game's spec, the plain case included.

## keep `flood`: Flood's Solve refuses a finish past the move limit

The game's spec is the home of a game's own Solve refusal: it is where a session changing Flood's solver looks. The shared requirement states the rule for every game and uses Flood as its example.

## keep `ts-engine`: A Solve installs no route and reveals no loss

Its Flood scenario is the requirement's only scenario and the one case that shows "a game whose solver finds no finish from the player's position SHALL refuse". Removing it for the sake of a single home would leave the shared rule with no scenario; the example and the game's own requirement agree.

## keep `flood`: Flood refuses params it cannot deal

A declared bound is a copy of data only where nothing rests on it. The ten-color ceiling is what keeps a cell one digit in the description (`parseDesc` in `src/games/flood/state.ts` reads one digit a cell), so it is a promise to saved games, and the requirement is short.

## note flood: the description format is not in the spec

No requirement states the description: one color digit for each cell in row-major order, a comma, then the move limit (`parseDesc` in `src/games/flood/state.ts`). A description format stays in a spec by the prune brief, so a later change should add it. The other two gaps the entry names need nothing: a hint on a completed grid is refused by the midend (`engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game"), and "Flood offers a solver-backed hint plan" already says a step is narrated by its color and highlights the squares its fill absorbs.
