# Verdicts: map

## keep `map`: What Map draws

Most of the list has no other home: the two triangles of a split cell, the pencil-mark stipples, the lines on region boundaries, the outline of a flagged region, the floating drag blob and the choice of flash style are stated nowhere else in the spec. Only the error diamonds, the selection band and the region numbers have requirements of their own, and cutting three words from a list of ten would save nothing. A session changing `src/games/map/render.ts` checks the list.

## keep `map`: Solve uses the generator's answer when it has one

The fallback is a promise and not a test's. `ts-engine`, "The midend retains generator aux info for Solve", clears the aux for a pasted game ID and for a loaded save, and says a game whose solver needs aux then reports the solution as unknown. This requirement is what says Map does not: it re-solves from the clues, and the player's own colors do not enter the answer. "Every game with Solve is solved by a test" says that Solve works and not from what.

## keep `map`: Map's board has no border of its own

The growth is `engine-notes`, "A board that occupies the indicator's corner grows a margin on every side". "With no border of its own" and "by nothing else" are Map's own look, which `src/games/map/render.ts` records at its head, and a session adding a frame or a second margin would check it here.

## keep `map`: Dots that leave out a region's color are a mistake

`ts-engine`, "A candidate note that excludes the answer is a mistake", applies only "where a game ... reports them as mistakes". This requirement is Map doing so, and "A blank region's colors are read from its dots" rests the hint's soundness on it by name.

## keep `map`: Map refuses params that describe no map

The cut of the `paramConfig` minimums stands. The bounds (`min: 2` for the width and height, `min: 5` for the regions, in `src/games/map/index.ts`) are data the engine reads and refuses from: `engine-params`, "Params validity is the engine's check". A shared link is held by the encoding, which "Map's parameters" states, and by the rule that raising a bound is a compatibility break, which is the owner's call whatever the spec lists. What only `validateParams` can say stays here.

## note map: the cut of "The generator does not call the hint" stands

It is not a standing refusal. The requirement recorded that one refactor, splitting the solver's rungs into functions the hint reads, moved no verdict and no dealt board. `src/games/map/generator.ts` imports the solver and not the hint, and nothing in the collection forbids a generator the hint: Rectangles' generator calls its own (`rungsFinish`). What still binds is in "The hint's deductions are the solver's three rungs".

## note map: the cut of "Check & Save refuses a Map board with a mistake" stands

The rule is the app's for every game that can check, and in the regrouped specs it is `quick-save`, "Check & save gates the checkpoint on a clean board" and "A refused Check & save leaves the slot intact and says why". Map's part, which regions and which dots count as a mistake, is in "Map reports completion and mistakes" and "Dots that leave out a region's color are a mistake".
