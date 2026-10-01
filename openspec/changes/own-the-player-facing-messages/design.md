# own-the-player-facing-messages — design

Phase 5 of `envision-the-game-contract`. Every figure here was measured on
2026-09-30 at `f5d49e56`, before any edit, by a scratch census that parsed every
non-test file under `src/games/` and `src/engine/` with the TypeScript compiler
API. It collected every string (literal, template, or either branch of a
conditional) that a `return` hands back from a function declared `string | null`
or named `validate*`, and every `{ ok: false, error: … }`. That is a superset,
read by what the code *is* rather than by a function's name; each string was then
classified by the concept it expresses.

## Task 0: the census, and the falsifier

| Concern | Distinct strings | Games | Concepts | Puzzle-specific |
|---|---|---|---|---|
| Solve failures | 31, plus 2 inside conditionals | 45 | 6 | 1 (Mines, not started) |
| Description errors | ~147 (162 less 15 engine/app) | 52 | 7 | about a quarter |
| `validateParams` | 88 | 46 | a handful | about four fifths |
| Status prefixes | 7 spellings | 15 | 4 states | 0 |

**The falsifier** was "if more than about a third are genuinely
puzzle-specific, owning the kinds buys little". It does not fire for Solve,
descriptions or status. **It fires for `validateParams`**: after phase 2's
bounds messages, what remains is cross-field rules ("Region size must divide
grid area", "Fleet does not fit into the grid"), each about its own puzzle. So
params narrow out, with one exception that is not a kind at all but a copy:
"Width times height must not be unreasonably large" was typed out identically in
22 games, and becomes one constant, `AREA_TOO_LARGE` in `params.ts`.

Two measurements corrected the proposal's figures. The old refusal scan read only
bare literals, so Slant's and Tents' `error: impossible ? "…" : "…"` carried two
unapproved Solve failures past it, and Magnets' description parser returned its
errors the same way. And the description figure is 162, not 88: most of the
difference is messages returned by helpers (`validateGridDesc`, `loadGame`,
`validateWireDesc`) that a scan keyed on `validateDesc` itself never saw.

## The shape: types, not sweeps

`hint-refusal.ts` is the model the proposal named, and its guard is a sweep: a
test finds every literal and checks it against a list. A sweep is a one-off
inventory that the next game has not read. Where the engine consumes the value,
a **type** can hold the rule instead, so each concern below is typed first and
guarded second.

### Solve: a union of literal types

`SolveResult`'s error is `SolveFailure`, the union of the literal types of the
constants in `solve-failure.ts`. A game cannot return a sentence of its own:
there is no escape, because no game needed one. Mines' "Game has not been
started yet" is a situation any board dealt on its first move would have, so it
is a kind (`NOT_STARTED`).

| Kind | Meaning | Was |
|---|---|---|
| `ALREADY_SOLVED` | the board is finished | 3 spellings |
| `PUZZLE_NOT_REASONABLE` | the solver could not settle the puzzle | 17 spellings |
| `NO_SOLUTION` | a solver *proved* there is none | 9 spellings |
| `MULTIPLE_SOLUTIONS` | a solver proved there are several | 2 spellings |
| `NO_SOLUTION_FROM_HERE` | the player's moves left no finish the solver can find | 1 |
| `SOLUTION_UNKNOWN` | no aux, and no solver | 1 |
| `NOT_STARTED` | the board is laid out by the first move | 1 |

**A proof, or not.** Each site was read for what its solver established.
Where a `null` verdict conflates "impossible" with "gave up" (Mathrax, Seismic,
Spokes, Crossing, Dominosa, Map's non-impossible branch), the site says
`PUZZLE_NOT_REASONABLE`, which is true either way. Only a solver that returns
a distinct "impossible" says `NO_SOLUTION`. Untangle's is a planarity test, so
a hand-typed K5 is a proof.

**Shared with the hint.** `ALREADY_SOLVED` and `PUZZLE_NOT_REASONABLE` are
`hint-refusal.ts`'s: a finished board and a puzzle that cannot be settled are
the same fact whichever button asked. Inertia's hint and its Solve said
"Unable to find a solution from this starting point" as two copies of one
literal; both now say `NO_SOLUTION_FROM_HERE`, and Netslide's hint and Solve
both say `SOLUTION_UNKNOWN`. `hint-refusal.test.ts` approves those two for hints.

**The midend answers `ALREADY_SOLVED` itself** for a board whose status is
solved, before it asks the game. Three games checked; the rest applied their
solve move to the player's own win and relabeled it solved-with-help. The rail
disables Show solution on a solved board, so a player met this only through the
end notification or a stale control. Slide keeps its own check, because a typed
description can start with the main piece home while its status says ongoing.

**Keen's and Pearl's "invalid char in aux"** was not a message at all: `aux` is
written by `newDesc` in the same process and never saved, so a bad character is
a broken encoder. Both now throw, so Sentry sees it (`AGENTS.md`, "Catch
unrecoverable errors only to log them").

### Descriptions: a branded string

`validateDesc` returns `DescError | null`, and `DescError` is a branded string
made only in `desc-error.ts`: six constants (`DESC_TOO_SHORT`, `DESC_TOO_LONG`,
`DESC_OUT_OF_RANGE`, `DESC_REPEATED`, `DESC_CONTRADICTORY`, `DESC_MALFORMED`),
`descBadCharacter(ch?)`, and `puzzleDescError(sentence)`, the escape for a
reason about the puzzle's own rules.

A brand rather than a union because the escape is real here: about a quarter of
the reasons are the puzzle's (Inertia's two starting squares, Keen's two-cell
operations, Mines' first-click coordinates), and forcing those into a kind
would bend game logic to fit a contract. What the brand buys is that the escape
is *named*. A game cannot return a typed string by accident, and every
sentence it chooses to write passes through one call a guard can read.

**The guard derives what is genuine instead of listing it.** A sentence passed
to `puzzleDescError` by two games is a situation the collection has, so
`desc-error.test.ts` fails on it. That is how `DESC_REPEATED` (Fifteen and
Sixteen) and `DESC_CONTRADICTORY` (Subsets and Unequal) became kinds. No roster
of approved puzzle sentences exists to rot. The guard also fails a sentence
that spells a kind out or leaves the kinds' voice ("This game ID …", one
sentence with a full stop).

**Exact matching has a blind spot, and the migration found it.** Inertia,
Sokoban and Slide each wrote "has no X" and "has more than one X" with their
own noun, so no two sentences were equal and the sharing check passed all six.
It is one situation, a board that needs exactly one of something, so it is
`descNeedsOne(noun, found)`, and the guard fails a puzzle sentence saying "has
more than one". The first cut of that key, "more than one", convicted Rome's
goal in "a region of more than one square", which is a size; the narrower key
is the fix, and the false positive is what showed the check reads the tree.

**`run-length.ts` and `desc-alphabet.ts` do not own the wording**, which is
what the proposal suggested. `run-length.ts`'s doc comment gives the reason:
the scanners report what they read and never what is legal, and two games
reading the same scanner reject different things. The wording belongs one layer
up, in the kinds, and the scanners' callers choose among them.

### Status prefixes: one helper

`completionStatus(completed, cheated, rest)` in `completion-status.ts` returns
the status bar's opening words, then `rest`. There are four states, not three:

| completed | cheated | words |
|---|---|---|
| no | no | (none) |
| yes | no | `COMPLETED!` |
| yes | yes | `Auto-solved.` |
| no | yes | `Auto-solver used.` |

Flip, Flood, Inertia and Slide already said "Auto-solver used." for a helped
board the player had moved off. Net and Rect said "Auto-solved." there, which was
false; Mosaic said "Auto solved"; Same Game said "COMPLETE!"; and Net's
finished board read "COMPLETED! " with a trailing space, because the prefix
carried the separator whether or not anything followed it. The helper takes
booleans because games store "finished" as a flag, a move count, a `-1`
sentinel or a count of clues left, and only the game knows which.

Fifteen, Sixteen, Twiddle and Netslide keep "Moves since auto-solve: N" in
place of the words once the solver has been used. That is a counter, not a
completion word, and it says more than "Auto-solved." would. "DEAD!", "FAILED!",
"CORRECT!" and "Cannot move!" are outcomes a game has, not completion, and
stay.

`completion-status.test.ts` scans every string a game writes for what the words
*say* (`COMPLETED?!`, `Auto[- ]solve(d|r used)`), not for a constant's name,
because the copies it replaced were spelled out.

## Wording, and who accepts it

The wording is player-visible. The kinds are short, say what went wrong from the
player's side, and where there is something to do, say what: a truncated ID
"may have been cut off when it was copied"; `NO_SOLUTION_FROM_HERE` says to
undo; `NOT_STARTED` says the first move lays the board out. None of these calls
is a close one, so they are this change's to make. The owner reviews them with
the rest of the change, and a sentence they want different is a one-line edit
in one place, which is the point of the change.

## Hints to pull in: Pegs

The proposal asked for one check: that the kinds can say what a Pegs hint must
say when it refuses, as the same kind Pegs' `solve` would fail with. Pegs has
neither today (upstream had no solver, and `notApplicable.solve` says so). The
fact a Pegs hint must refuse on is "no sequence of jumps from here clears the
board", and that is `NO_SOLUTION_FROM_HERE`, already approved for hints and
already said by Inertia's hint and Solve for the same fact. So the kinds
express it, and nothing about Pegs changes the kinds. The hint itself is its own
change, `add-pegs-hint`, scaffolded by this one with the design pass the
proposal asked for.

## What stays per game

- A description error about the puzzle's own rules (`puzzleDescError`).
- Every `validateParams` message except the area limit.
- Status words that are an outcome rather than completion.
- A hint refusal that names the game's own dead end (Inertia's dead ball and
  stranded gems), recorded in `hint-refusal.test.ts` with its reason.
