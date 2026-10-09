# Verdicts: bridges

## reword `bridges`: Bridges params are size, bridge limit, density, expansion, loops and difficulty

The requirement listed the fields and left out the encoding, which is the
promise a shared link depends on, so the field list alone was close to a copy
of the `BridgesParams` type. The encoding is added from `paramsCodec` in
`src/games/bridges/state.ts` and from `src/games/bridges/bridges.test.ts`,
which pins `7x7i30e10m2d2` in full and `7x7m2L` short. The round-trip scenario
now states the string, so it says what `engine-params` "Encode and decode are
mutual inverses over the corpus" does not: that requirement promises the
round trip for every game, and not what Bridges writes.

### Requirement: Bridges params are size, bridge limit, density, expansion, loops and difficulty

Params SHALL be `w`, `h`, `maxb`, `islands` (the percentage of squares that are
islands), `expansion` (a percentage), `allowloops` (boolean) and `difficulty`
(Easy, Normal or Tricky). They SHALL be encoded `{w}x{h}`, then `m{maxb}`, then
an `L` when loops are not allowed. The full form SHALL add `i{islands}` and
`e{expansion}` before the `m`, and `d` with the tier's number, from 0, at the
end.

#### Scenario: Params round-trip

- **WHEN** params `{ w: 15, h: 15, maxb: 2, islands: 30, expansion: 10, allowloops: true, difficulty: 2 }`
  are encoded in full
- **THEN** the result is `15x15i30e10m2d2` and decoding it round-trips the
  params
- **AND** the same params with loops not allowed encode in short as `15x15m2L`

#### Scenario: Invalid params are rejected

- **WHEN** `validateParams` is given, in full, a board whose island target is
  three at a tier above Easy (e.g. `3×3` Normal at the default density)
- **THEN** it returns a non-null error string

## keep `bridges`: An island's room along a span never grows as bridges are drawn

A session changing the solver checks against this one and not against the
grade requirement. "One grade in every island order" says what must hold; this
says what makes it hold, the one definition of room that is monotone, and it
is the thing a new deduction that counts room another way would break without
any single board showing it.

## keep `bridges`: Bridges grades a board the same however its islands are listed

The second scenario says something the first does not. The first is one
pinned board solved in every order; the second is the case the requirement's
last clause is about, the state the generator grows against the state loaded
from the description, over dealt boards. A fix that special-cased the pinned
board would pass the first and fail the second.

## keep `bridges`: A Bridges hint's ladder is capped at the board's own difficulty

Not a collection rule. Searched the regrouped `engine-hints` and
`engine-difficulty` for a cap on a hint's ladder: there is none, and the games
differ. `loopy` "The hint plan is the solver's own rungs, easiest tier first"
runs the whole ladder whatever tier the board was dealt at. The cap is
Bridges's choice (`src/games/bridges/hint.ts` passes
`state.params.difficulty`), with its reason.

## keep `bridges`: Bridges explains the next deduction

The misfiled first sentence, the midend's refusal on a solved or wrong board,
is already gone from the regrouped requirement. The refusal that is left, the
unlocalized contradiction on a board `findMistakes` passes, is the game's own
`hint` speaking and stays.

## note the cut of "The game SHALL NOT map any editor-only move letter" stands

Read upstream's `../puzzles/bridges.c`: it has no editor. `interpret_move`
ends at the `g`/`G` toggle of the possible-bridge lines, which the port keeps
(`src/games/bridges/index.ts`), and `execute_move` reads only `L`, `N`, `M`
and `S`. The sentence first appears in the ports of other games
(`git log -S"editor-only move letter" -- openspec` ends at Pattern and Light
Up) and was carried into Bridges as boilerplate. It withheld no key and was no
decision of the owner's.
