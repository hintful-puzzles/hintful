# Verdicts: inertia

## keep `inertia`: A hint is a nudge, and only Solve is a commitment

The requirement is in the spec as it stands, and the shared capabilities do not say its rule outright. `ts-engine`, "The engine derives a board's history from its position" and "No game's state records a solve or the solver's use", say who owns the record; neither says a hint leaves it alone, which follows only from `src/engine/midend.ts` setting `cheated` in Solve and nowhere else. Until `ts-engine` says so, Inertia keeps it; see the note below.

## keep `inertia`: Generated boards keep their gem candidates spread

The threshold of 2 is the measure of the promise: it is how far a square of a dealt board may lie from somewhere a gem could be. The relaxing every 50 rejections is what bounds that promise on a hard size, and the scenario turns on the first attempt. `PATIENCE` in `src/games/inertia/generator.ts` holds the number with no reason beside it, so the spec is where the decision is recorded.

## keep `inertia`: Gem candidates are searched as square-plus-direction pairs

Its first sentence is the definition "Generated boards place gems only where the ball can go and come back" rests on, a promise about dealt boards and not only a trap for whoever edits the search. The comment in `src/games/inertia/solver.ts` says the same of the code; a comment is not where a promise about boards is kept.

## cut `inertia`: Inertia has no mistake check

declared: `notApplicable.findMistakes` in `src/games/inertia/index.ts` says it with the reason the engine reads and the help page shows ("Any route that collects every gem wins, so there is no single answer to check a move against"), as `ts-engine`, "A game's contract sections are implemented, not applicable, or absent, and an absent one makes it a draft" and "A not-applicable reason is a fact about the puzzle", require. That reason is the later of the two and the one a player reads; the spec's "a death is undone, not corrected" was an older wording of the same absence and not a second decision. What a dead ball gets from a check is in "The hint refuses honestly when the move to make is undo" and `engine-hints`, "The check asks the hint whether a position is a dead end".

## edit `inertia`: The hint refuses honestly when the move to make is undo

A hint's marks stay in the spec, and the refusal for a gem out of reach draws one the requirement did not mention: `src/games/inertia/hint.ts` returns `markedDeadEnd` with every unreachable gem in the outline role. The dead ball's refusal marks nothing.

from: and each refusal SHALL say that the move to
to: outlining each such gem, and each refusal SHALL say that the move to

## note ts-engine: no requirement says a hint leaves the solver record alone

"Help is the app doing some of the solving" says a shown hint step counts as help for the timer. No requirement says that only Solve sets the record that makes a solved board read solved-with-help, though that is true of every game (`cheated` in `src/engine/midend.ts` is set in the solve path alone). Stated once in `ts-engine`, it would let Inertia's "A hint is a nudge, and only Solve is a commitment" go as `collection`.
