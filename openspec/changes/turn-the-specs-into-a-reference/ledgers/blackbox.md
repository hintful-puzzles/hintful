# Ledger: blackbox

Base: bb004490

Where every rule of Black Box's spec went in the reference form: every rule
kept, stated once, a requirement held to the tool's 500 characters.
`scripts/checks/spec-ledger.mjs` checks this file.

## Black Box game implements the Game interface

| Rule | Where it went |
| --- | --- |
| A registered `blackbox` game implements `Game` over its six types, a deduction puzzle of hidden balls and lasers | spec: Black Box game implements the Game interface |
| It provides `statusbarText`, `solve`, `hint` and `findMistakes`, and no `textFormat` | spec: Black Box game implements the Game interface |
| Params are `w`, `h`, `minballs`, `maxballs`, encoded `w{w}h{h}m{minballs}M{maxballs}`, with a lenient decode | spec: Black Box params are a size and a ball range |
| The presets, by name | spec: Black Box offers its presets |
| "The 5 upstream presets" | figure; history |
| The type summary reads `{w}x{h}, {n} balls` or `{min}-{max} balls` | spec: The type summary names the size and the ball count |
| The summary always says `balls` | untrue: the `no-of-balls` field's label in `src/games/blackbox/index.ts` writes `ball` when the count is exactly `1`, so the requirement now states the singular |
| The `no-of-balls` annotation key is mapped in the worker adapter | untrue: no worker adapter maps it. `no-of-balls` is the `kw` of a `paramConfig` field in `src/games/blackbox/index.ts`, whose `label` in the `tail` slot `describeParams` (`src/engine/param-label.ts`) composes into the summary |
| `validateParams` rejects `w` or `h` below 2 or above 255 | untrue: `validateParams` in `src/games/blackbox/state.ts` has no size check. The size fields declare `bounds: { min: 2, max: 255 }` in `paramConfig`, and the engine's `paramsError` (`src/engine/params.ts`) refuses a value outside them |
| `validateParams` rejects `minballs < 1`, `minballs > maxballs` and `minballs >= w*h` | spec: Black Box refuses params that cannot be played |
| `maxballs` above the ball limit is rejected only when the params are about to deal a board | spec: Only a deal is bound by the ball limit |
| The limit is `blackboxBallLimit(w, h)` | untrue: the function is `ballLimit(w, h)`, exported from `src/games/blackbox/state.ts`, and no `blackboxBallLimit` exists in the tree |
| Scenario: params round-trip and lenient decode | spec: Black Box params are a size and a ball range |
| Scenario: the ball-count type summary reflects a range | spec: The type summary names the size and the ball count |
| Scenario: invalid params are rejected | spec: Black Box refuses params that cannot be played |

## Black Box descriptions are obfuscated ball-layout bitmaps

| Rule | Where it went |
| --- | --- |
| A desc is `[w, h, ball1x, ball1y, …]` as a byte-per-value bitmap, masked by `obfuscateBitmap` and hex-encoded by `encodeBalls` | spec: Black Box descriptions are obfuscated ball-layout bitmaps |
| `newState` recovers the layout by hex-decoding and de-obfuscating | spec: Black Box descriptions are obfuscated ball-layout bitmaps |
| The shared codec lives at `src/engine/obfuscate.ts` | spec: Black Box descriptions are obfuscated ball-layout bitmaps |
| The verdict rejects a wrong length, a header that mismatches `w` or `h`, and a ball outside the arena | spec: A damaged Black Box description is refused |
| Scenario: a description round-trips through obfuscation | spec: Black Box descriptions are obfuscated ball-layout bitmaps |
| Scenario: a corrupted description is rejected | spec: A damaged Black Box description is refused |

## Black Box traces lasers through the arena deterministically

| Rule | Where it went |
| --- | --- |
| An instant hit for a ball directly ahead of the entry cell, an instant reflection for one diagonally ahead, hit prioritized | spec: A laser's entry is judged before it moves |
| Otherwise step forward, turn clockwise for a ball ahead-left and anticlockwise for one ahead-right, and return hit, reflect or the exit index | spec: Black Box traces lasers through the arena deterministically |
| A fired laser that neither hits nor reflects numbers its entry and exit with a shared incrementing number | spec: A laser that exits numbers both its ends |
| "Reproduce upstream's rules" | history |
| Scenario: a clear beam exits the far side and pairs its endpoints | spec: Black Box traces lasers through the arena deterministically; spec: A laser that exits numbers both its ends |
| Scenario: a head-on ball produces a hit | spec: A laser's entry is judged before it moves |
| Scenario: an adjacent ball reflects the beam at entry | spec: A laser's entry is judged before it moves |

## Black Box marks, fires, locks, and reveals via moves

| Rule | Where it went |
| --- | --- |
| The kinds of `BlackboxMove` | spec: Black Box marks, fires, locks, and reveals via moves |
| `executeMove` is pure and rejects an illegal move by throwing | spec: Black Box marks, fires, locks, and reveals via moves |
| Toggling a ball updates the guess count | spec: A ball toggle updates the guess count, and a locked cell takes none |
| Toggling a ball is disallowed on a locked cell | spec: A ball toggle updates the guess count, and a locked cell takes none |
| That refusal, read as one `executeMove` makes | untrue: `executeMove` in `src/games/blackbox/index.ts` toggles a ball on a locked cell without complaint. The lock is kept at the input, where the primary action's `apply` returns `null` on a cell with `BALL_LOCK`, so the requirement now states that the primary action makes no move |
| Firing an already-fired laser is rejected | spec: A laser is fired once |
| Revealing is allowed only with the guess count within `[minballs, maxballs]` | spec: A reveal is gated on the ball count |
| A whole-column or whole-row lock sets every cell of the line locked or unlocked together, by how many are locked now | spec: A line lock follows the majority of its cells |
| It locks iff fewer than half are locked, else unlocks | untrue: `toggleLineLock` in `src/games/blackbox/index.ts` unlocks only when more than half are locked, so a line exactly half locked is locked where the old sentence unlocked it, and the requirement states the code's threshold |
| Scenario: toggling a ball updates the guess count | spec: A ball toggle updates the guess count, and a locked cell takes none |
| Scenario: firing a laser records its result | spec: A laser is fired once |
| Scenario: reveal is gated on the ball count | spec: A reveal is gated on the ball count |

## Black Box verifies guesses, and a reveal is a win

| Rule | Where it went |
| --- | --- |
| The verify runs `checkGuesses`, comparing the guess with the real layout by the lasers | spec: A verify shows one laser that tells the guess from the answer |
| A contradicting fired laser or a distinguishing un-fired one is flagged, one, chosen deterministically from the grid, with `justwrong` set and no reveal | spec: A verify shows one laser that tells the guess from the answer |
| Otherwise the guess is the answer, accepted as the real balls and revealed | spec: A guess no laser tells from the answer is accepted |
| Solve guesses exactly the real balls and reveals | spec: Solve guesses the real balls and reveals |
| `status` is `"solved"` when revealed and `"ongoing"` before, and a board is never lost | spec: Black Box verifies guesses, and a reveal is a win |
| A wrong verify increments a session error counter shown in the status bar | spec: A wrong verify is counted for the session |
| Scenario: a correct reveal is solved | spec: A guess no laser tells from the answer is accepted; spec: Black Box verifies guesses, and a reveal is a win |
| That scenario's "the status bar reads a success message" | untrue: `statusbarText` in `src/games/blackbox/index.ts` returns the empty string once revealed, plus the error count if there is one, with the comment "A reveal is a win, which the engine's own words announce". The requirement now says the game's own text does not announce the win and holds only the error count |
| Scenario: an inconsistent verify shows one error and does not reveal | spec: A verify shows one laser that tells the guess from the answer; spec: A wrong verify is counted for the session |
| Scenario: Solve replaces the guesses with the answer | spec: Solve guesses the real balls and reveals |

## Black Box's hint SHALL reason only from the lasers fired

| Rule | Where it went |
| --- | --- |
| The hint reads only the lasers fired, where they went and the marks, never the hidden balls, so like boards get the same plan | spec: Black Box's hint SHALL reason only from the lasers fired |
| The midend asks only about a board the check passes, and the steps only ever add marks | spec: The hint's steps only add marks |
| A square is settled by following a fired laser to the first unsettled square, and a numbered laser is followed from either end | spec: A fired laser settles the first unsettled square on its path |
| A settled empty square is marked known and a settled ball guessed, in one step ringing the square and outlining the laser's ends | spec: A settled square is shown by a mark, in one step |
| When nothing more settles, the hint asks for a laser whose path depends on unsettled squares | spec: When nothing more settles, the hint asks for a laser |
| With every laser fired and none settling a square, a bounded search that keeps the player's marks offers balls, and refuses with `SEARCH_OUT_OF_REACH` past its budget | spec: With every laser fired, the hint offers a layout it searched for |
| Once every path is settled, the balls the count still requires go on squares no laser reaches, and the player is asked to check | spec: The hint ends by placing unreached balls and asking for a check |
| Scenario: a square a laser settles | spec: A fired laser settles the first unsettled square on its path |
| Scenario: nothing settles | spec: When nothing more settles, the hint asks for a laser |
| Scenario: the hint gives nothing away | spec: Black Box's hint SHALL reason only from the lasers fired |
| Scenario: following the hint wins | spec: The hint ends by placing unreached balls and asking for a check |

## Black Box plays only boards with one answer

| Rule | Where it went |
| --- | --- |
| A board's answers are the layouts within the ball count that send every laser where the real balls do, counted by the hint's layout search with every laser fired | spec: Black Box plays only boards with one answer |
| The count agrees with trying every layout on boards small enough to try | spec: Black Box plays only boards with one answer |
| `newDesc` deals only a board with one answer, a ball at a time, the last judged against the whole range, starting again when no square of a bounded number keeps it | spec: A board is dealt a ball at a time |
| `solve` says `MULTIPLE_SOLUTIONS` for a board proven to have several answers, so it does not load | spec: A board with several answers does not load |
| A count past its budget settles nothing: the generator builds again and a loaded board loads | spec: A count past its budget settles nothing |
| Scenario: a dealt board | spec: A board is dealt a ball at a time |
| Scenario: four corners hide the middle | spec: A board with several answers does not load |

## Black Box checks marks against its answer

| Rule | Where it went |
| --- | --- |
| `findMistakes` reports a guess on a square with no ball and a known mark on a ball, and nothing once revealed | spec: Black Box checks marks against its answer |
| A mistake is a frame in the error color inside the square, held in the tile's cache key | spec: A mistake is framed in the error color |
| Scenario: Check & Save with a wrong guess | spec: A mistake is framed in the error color |
| Scenario: right marks pass | spec: Black Box checks marks against its answer |

## Black Box draws its balls as pieces and lifts what is settled

| Rule | Where it went |
| --- | --- |
| The board is pieces on a quiet surface with no bevel, a square the plain cell surface, the grid line carried on all four sides so there is no frame | spec: Black Box draws its balls as pieces and lifts what is settled |
| A guessed ball is the disc piece, inset, in a color no mark on the board uses | spec: A guessed ball is the disc piece |
| A known square, a fired laser square and every square after a reveal sit on the lifted surface, and an unfired laser square is the board's own color | spec: What is settled sits on the lifted surface |
| A known square with no ball also holds the ruled-out cross | spec: A known square with no ball holds the ruled-out cross |
| That cross, read as holding after a reveal as well | untrue: `drawArenaTile` in `src/games/blackbox/render.ts` draws the cross only under `known && !gs.reveal`, so a revealed box shows none, and the requirement now says "until the reveal" |
| The cursor is drawn at the corners, beside a ball, and does not recolor it | spec: The cursor and the marks keep clear of a ball |
| A hint's ring and outline and a mistake's frame sit at the edge of the square's surface | spec: The cursor and the marks keep clear of a ball |
| No palette swap for the dark scheme, and no hue named for a ball in hint sentences or the help page | spec: Black Box swaps no palette for the dark scheme and names no hue for a ball |
| Scenario: a covered box is the cell surface | spec: Black Box draws its balls as pieces and lifts what is settled |
| Scenario: a ball is a piece | spec: A guessed ball is the disc piece |
| Scenario: a known square is lifted and marked | spec: A known square with no ball holds the ruled-out cross |
| Scenario: a fired laser square is lifted | spec: What is settled sits on the lifted surface |
