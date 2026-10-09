# Verdicts: blackbox

## keep `blackbox`: A dealt board has one answer across its whole ball range

The promise is the one answer, and the ball-at-a-time build is the current way of meeting it. The comment on `ballLimit` in `src/games/blackbox/state.ts` already says its figures were measured "dealing a ball at a time", with the date, so a session that changes the build is told at the site that the limit must be measured again. The requirement needs no sentence about the build.

## keep `blackbox`: Black Box swaps no palette for the dark scheme and names no hue for a ball

Both halves are decisions about the look. A swap is what a bevel declares (`engine-colors`, "A dark-scheme palette swap keeps its bevel lit from one side"), and the clause records that the flat board has none to exchange, beside "Black Box draws its balls as pieces and lifts what is settled". `engine-hints`, "A narration never identifies an element by its color", covers the hint's sentences only; the help page is covered here alone.

## keep `blackbox`: The type summary names the size and the ball count

`engine-params`, "One describer labels every params set", fixes the order of the slots and leaves the words to each game. The words here are Black Box's own: one field carrying two params as `N` or `N-M` (`ballsText` in `src/games/blackbox/state.ts`), the singular for one ball, and the Custom field reading the same text as the summary.

## keep `blackbox`: A count past its budget settles nothing

`engine-params`, "A board with a mistake check loads only with exactly one answer", says what the engine does with a solver that gives up. This says that Black Box's count is such a solver and what its generator does then, which the shared requirement cannot say. `solve` in `src/games/blackbox/index.ts` refuses only on a count of two.

## note blackbox: the controls and the status bar's words are not in the spec

No requirement says what the secondary action, a drag sweep, the corner verify button or the keyboard cursor do, though `targetVerbs` in `src/games/blackbox/index.ts` declares all of them, nor what the status bar reads before a reveal (`statusbarText`: "Wrong! Guess again.", the count of balls too many, "Click button to verify guesses."). What a control does stays in a spec by the prune brief, so a later change should write them. Nothing was added here.
