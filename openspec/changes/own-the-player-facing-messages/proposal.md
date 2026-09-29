# own-the-player-facing-messages

**Status: scaffolded, not started.** Phase 5 of `envision-the-game-contract`.
Read that change's `design.md` first.

## Why

Hint refusals already have the right shape. `engine/hint-refusal.ts` holds the
approved constants. `hint-refusal.test.ts` finds every
`{ ok: false, error: <literal> }` by shape and classifies it. The rest of what a
game says to a player has no such shape. Measured on 2026-09-29:

- **Solve failures:** 27 strings in `hint-refusal.test.ts`'s exceptions, for
  about four concepts. For example: "Unable to solve puzzle." against "Unable to
  solve this puzzle." against "Unable to find a solution"; and "Puzzle is
  already solved" against "Game is already solved".
- **`validateParams`:** 106 distinct messages from a partial probe. "Board too
  small" has at least 18 templates, mixing "2" and "two". Phase 2
  (`declare-params-in-one-place`) generates the bounds messages; this change
  owns the rest.
- **`validateDesc`:** about 88 distinct strings. "Invalid character" has at
  least ten spellings. No guard covers them, and a player sees them on a
  malformed pasted game ID.
- **Status text:** "COMPLETED!" and "COMPLETED! ", "Auto-solved." and
  "Auto-solved. ", "Auto solved", and "Auto-solver used. ".
  `completion-vocabulary.test.ts` unified the code-side flags, not the words.

## What changes

Engine-owned message kinds for each concern, with the game supplying only what
is about the puzzle:

- `SolveResult`'s error becomes a kind (no solution, already solved, solver
  gave up) plus an optional puzzle-specific detail.
- Desc-parse errors come from the shared scanners (`desc-alphabet.ts`,
  `run-length.ts`), which own their wording.
- The completed and auto-solved status prefixes come from the engine.

Each is guarded by shape, not by name, with an exceptions ledger that carries
a reason per entry.

## Tasks, in order

- **Task 0.** Re-take the census by shape across every game, and classify each
  string by the concept it expresses. **Falsifier:** if more than about a third
  are genuinely puzzle-specific, owning the kinds buys little, and the change
  narrows to Solve and status.
- **Player-visible wording.** Choose the wording for each kind once. It is the
  owner's to accept where uncertain.

## Hints to pull in (2026-09-29)

Upstream had no solver for Cube, Pegs, Same Game or Sokoban, so a hint for any
of them needs one, and its refusal ("no solution from this position") is the
same concept as `SolveResult`'s "no solution" kind. That is the overlap this
change should be checked against, with one game: **Pegs**. Its hint's
refusals and its `solve` failures should come from one message kind, through
`hint-refusal.ts`'s shape, not as two wordings for one fact. If the kinds
cannot express what the hint needs to say, that is a finding for this change,
not for the hint.

Pegs is a search game, so its hint is heuristic (docs/games/hints.md §
"Non-deductive (heuristic) hints"): write it in its own change, with a short
design pass on what it can prove first, as Inertia did. The others without a
solver stay in reserve (`hintless-games-in-reserve`).
