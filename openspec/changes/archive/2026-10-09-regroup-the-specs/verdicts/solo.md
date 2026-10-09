# Verdicts: solo

## keep `solo`: A killer region left nothing is a contradiction

It is a deliberate difference from upstream, which the head of `src/games/solo/solver.ts` records as one of two: upstream reported the grade so far, so a wrong guess counted as a solution. A session reading the C beside the port would otherwise put the quirk back.

## cut `solo`: Recording leaves the solve path unchanged

collection: `engine-hints` "The solver and the hint are two projections of one deduction engine" (the generator runs the techniques with the recorder off, the hint with it on) and `engine-candidate-hints` "A shared candidate-elimination hint plan" (the solvers and the generate and solve paths do not change because of the walk) cover Solo with no departure. `pendingRecorder` is set only in `recordSoloDeductions`; `solveSolo`, the generator and `findMistakes` attach none. Group's and Keen's copies of this rule were cut on the same ground, and Unequal's and Towers' are gone too, so the candidate games now agree.

## keep `solo`: Every hint step is monotone progress

The shared walk promises that following hints from any reached position solves the board (`engine-hints` "The hint walk SHALL cover every preset a game offers"; `engine-candidate-hints` "A candidate hint plan reads an unmarked cell the way the player chose", second scenario). No shared requirement says a step is never undone by the hint, nor that a recompute skips what the board already shows. That is hint behavior, so it stays with the game.

## keep `solo`: Solo's hint marks pair each color with a shape

The engine does not draw a struck candidate: `drawPencilMarks` in `src/games/solo/render.ts` draws the line through it, and no shared requirement says a ruled-out candidate is crossed through. The ring, outline and stripes restate `engine-hints` "The engine SHALL own the hint mark roles and the words for them", but the fourth cue is Solo's own statement and the sentence reads whole.

## keep `solo`: The techniques Solo's solver implements

It is the only statement, in a player's words, of what the tiers hold in difficulty order, the killer techniques and bounded recursion included; the ladder requirement names rungs and their run-alone property and says nothing of recursion. One requirement holding both would pass 500 characters.

## keep `solo`: Solo's solver is a certified deduction ladder whose rungs run alone

It holds the rung order and the rule that a rung reads nothing an earlier rung left in the same pass, which the premise audit's replay depends on. The techniques requirement does not say either.

## keep `solo`: A census certifies that every rung fires

The census is a shared harness (`src/engine/testing/ladder-census.ts`) that each ladder game declares in its own `*-ladder.test.ts`, and no shared requirement states it: `testing` "A rung no known board fires is excused by name, with its reason" is about hint-rung pins. Solo's corpus (every variant at every pair of caps and at search) is its own.

## keep `solo`: Solo's hint never narrates a guess

`engine-hints` "A Search is refused and never narrated" says a search is refused; this says where Solo's deduction stops (below `DIFF_RECURSIVE`), which is Solo's own.

## keep `solo`: Solo flags mistakes against its unique solution

`ts-engine` "A candidate note that excludes the answer is a mistake" holds the note rule. What Solo re-solves from (the givens and, for killer, the cage sums) and the empty result on a board that is not uniquely solvable are Solo's (`findMistakes` returns `[]` on `DIFF_IMPOSSIBLE` or `DIFF_AMBIGUOUS`), and no shared requirement states the `"cell"` and `"note"` kinds that `entryMistakes` returns.

## keep `solo`: Solo's hint starts on the implicit reading

This is what was left of "The setup of the notes follows the reading the player chose" once the walk's part went. `engine-candidate-hints` "A game states the reading it starts on" makes the choice the game's to state, and this states it.

## keep `solo`: A single-digit pattern step names the fewer lines

`engine-candidate-hints` "The solver says which lines confine a value" binds only "a solver without repeated values", the shared Latin solver. Solo's solver is its own, so the rule for it is here.

## note The entries' other requirements were already cut

"A hint is refused on a solved or mistaken board", "Solo keeps a displayed plan on track", "A kept step is refreshed before it is shown", "The order Solo's hint prefers" and "Mark-all fills the cells without notes, then clears the obvious" are not in the regrouped `solo` spec. Each shared requirement their cuts named still stands in the regrouped specs: `engine-hints` "The midend SHALL refuse a hint on a finished or wrong board before asking the game", "A player move is classified against the stored plan", "refreshHintStep re-validates a stored step"; `engine-candidate-hints` "The shared track and refresh read a game's move dialect", "The walk owns the ladder", "The walk owns the setup"; `engine-notes` "Mark-all is adaptive in a game with uniqueness regions".

## note `engine-hints` does not say a struck candidate is crossed through

Solo, Keen, Towers and Unequal each say in their own spec that a hint shows a ruled-out candidate with a line through it, and each game's `render.ts` draws it. `engine-hints` "A highlight on a board element stays legible against its cell" says only that it stays visible. A shared requirement stating the cue would let the four games drop the clause.

## note No shared requirement states the ladder firing census

`src/engine/testing/ladder-census.ts` is used by every `runDeductionFixpoint` game's `*-ladder.test.ts`, and the rule that every rung fires on a pinned corpus or is named as unreached is written only in the games (Solo, Pearl). It belongs in `testing` beside "A rung no known board fires is excused by name, with its reason".

## note No shared requirement says a hint never undoes its own step

"Every hint step is monotone progress" stands in Solo, Keen, Towers and Unequal with the same words, and Salad's "Salad's hint plan is recomputable from any position" says the recompute half. `engine-candidate-hints` could state once that a plan's step is never undone by a later one and that a recomputed plan skips what the board already shows.

## note A stale title

`solo` "Solo interprets digit, pencil, and mark-all input" no longer says anything of Mark-all, which is `engine-notes`'s; `keen` "Keen interprets digit, pencil, and mark-all input" likewise, with Keen's Mark-all in a requirement of its own. No entry names either, so both are left.
