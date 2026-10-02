# judge-rivals-for-search-hints

**Status: scaffolded, waiting for its trigger (2026-10-02).** Proposed after
`add-pegs-hint`; the owner asked for it to be scaffolded.

## Trigger

**The next search game to get a hint** (Cube, Same Game, Slide or Sokoban;
re-take the population from `hintless-games-in-reserve`). Pegs is the only user
today, and extracting for one user fits the helper to Pegs. Do this change
together with that game's hint, not before it.

## Why

Pegs' hint (`add-pegs-hint` design D6, D7) found a way for a search hint to
teach rather than just point: set the offered move against its rivals. Nothing
in that is Pegs-specific:

- **Plan one step per request**, so what the step says about the rivals is
  about the board on display.
- **Judge each rival** (finishes, lost, or unsettled) within an allowance
  counted in positions, never in time, so the same position always gets the
  same sentence. In Pegs: a narrow beam, a wider one, then a capped proof of
  loss (`judge` in `pegs/solver.ts`).
- **Speak only from settled verdicts**: "only the moves with arrows can still
  finish" when every rival was settled, "one of them" when several finish, and
  no claim about an unsettled rival.
- **Measure where the budget buys nothing.** In Pegs' middle game most rivals
  stay unsettled at any affordable budget, and the hint falls back to a
  visible fact instead (stranded pegs).

The second search game will need the same loop, allowance and verdict-to-words
mapping. Written twice, it would drift the way the candidate games' loops did
before `runCandidatePlan` took them (AGENTS.md § "A consistent idiom is not the
finish line").

## What

An engine helper that takes a position, the offered move, the legal moves and
a game's judge, and returns the verdicts within one allowance, plus the
relation and arrow marks those verdicts imply. The game keeps its search, its
judge and its visible-fact fallback, since those are about the puzzle.

**The relation should come from the verdicts, not from the game.**
`give-a-hint-sentence-its-parts` made a searching game's "so" declare
`rivals: "lost"` (`hint-words.ts`'s `Relation`), and the hint-quality walk fails
a forced step without it. That is the mechanical half of rule 3, and it is a
statement the game writes by hand and only a check reads: Pegs' `only` and
Guess's deductions each type it where their code judged the rivals. Once the
helper returns verdicts, it should hand back the relation as well, `forced`
with `rivals: "lost"` exactly when every rival was settled lost and `oneOf`
when some finish, so the claim is built from the judging rather than beside
it, and a game cannot write "so" over rivals nobody judged.

## Hints to pull in

Same Game, the reserve search game with the most good moves per position, which
is the case "one of them" and the arrows exist for. If another search game
reaches its hint first, that game is the trigger instead.
