# Verdicts: dominosa

## cut `dominosa`: The hint recorder is gated

collection: `engine-hints` "The solver and the hint are two projections of one deduction engine" says it of every logic game: "The generator runs the techniques to a fixpoint with the recorder off ... the hint runs the same techniques with the recorder on". Dominosa has no departure: its recorder is one private flag in `src/games/dominosa/solver.ts`, set only by the hint's pass. What Dominosa does differently, leaving the forcing chain out of the recording, is kept in "The forcing chain grades boards and is never narrated".

## keep `dominosa`: A flagged cell is drawn distinctly from a clash

It is a decision about what a player sees, and not an accident of the overlay: a clash is always on and means a domino placed twice, while a flagged cell appears only on a check and means the solution lacks it. A player has to tell the two apart, and Magnets keeps the same rule for its live errors.

## reword `dominosa`: Dominosa refuses params outside its bounds

Dropped the refusal of a difficulty that is no tier, and the account of which declaration each refusal comes from. `engine-params` "Params validity is the engine's check" refuses a choice outside its list for every game (its scenario is a difficulty index past the tier list), and "A rule that a game rejects params is met by the engine's check" says a stated minimum may be met by an item's `bounds`. Kept what is the game's: the minimum of 1, the overflow bound, and the two tiers no small set reaches.

### Requirement: Dominosa refuses params outside its bounds

Params with `n` below 1 SHALL be refused. `validateParams` SHALL enforce the
bound on `n` that keeps the grid's area from overflowing, and SHALL refuse in
full form a tier above Easy at `n = 1` and a tier above Normal at `n = 2`,
which no board of that size reaches.

#### Scenario: Invalid params are rejected

- **WHEN** params with `n = 0` are checked
- **THEN** they are refused with a non-null error string

#### Scenario: A tier the smallest set cannot reach is refused

- **WHEN** params with `n = 1` at Normal are checked in full form
- **THEN** `validateParams` returns a non-null error string

## cut `dominosa`: A generated Dominosa board needs its tier and no more

collection: `engine-difficulty` "Every tier promises one solution found at its cap" and "A difficulty tier binds the board it generates" together say exactly this of every tiered game, at every size and not only at the presets: one solution, found at the tier's cap, and above the easiest tier not found one tier down. Dominosa has no departure: `src/games/dominosa/generator.ts` rejects a board that does not solve at the tier and one whose hardest deduction used is below it. The guard keyed on presets is a third requirement and is not what this cut rests on.

## note Dominosa's text export does keep upstream's limit

The fifth doubt says `src/games/dominosa/index.ts` has no `n < 1000` condition. It has: `textFormat` returns null when `state.params.n >= 1000`, with a comment naming upstream's `game_can_format_as_text_now`. So the code is not missing the limit, and the requirement that was cut as `type` was true. The limit is narrow enough that only its own test would consult it, so I do not ask for it back.

## note P dominosa 1 needs nothing

"Any pointer tap on the board dismisses the spotlight" stays in `dominosa` as the plan of moves left it. No doubt names it.
