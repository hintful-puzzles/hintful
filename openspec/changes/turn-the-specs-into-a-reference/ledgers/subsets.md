# Ledger: subsets

Base: bb004490

Where every rule of Subsets' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Subsets game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/subsets/` implements `Game` and is registered | spec: Subsets game implements the Game interface |
| Parameters are a width, a height, a universe size and a tier, and only 4×4 with `n = 4` is accepted | spec: Subsets' parameters |
| "Matching upstream" | history |
| A tier naming no rung is rejected, never substituted | spec: A tier naming no rung is refused |
| One preset per tier | spec: Subsets' parameters |
| A game ID encodes every parameter, round-trips, and is distinct per tier | spec: Subsets' parameters |
| A Custom dialog is offered for the tier alone, the shape having one legal value | spec: The Custom dialog offers the tier alone |
| A unique solution, so a `findMistakes` hook | spec: Subsets game implements the Game interface |
| It declares `Game.difficulty`, and so falls under the cross-game guards and not per-game ones | spec: Subsets declares the difficulty contract |
| Scenario: the preset produces a soluble board | spec: Subsets game implements the Game interface |
| Scenario: a game ID round-trips | spec: Subsets' parameters |
| Scenario: unsupported parameters are rejected | spec: Subsets' parameters |
| The refusal is upstream's "only 4x4 supported" message | untrue: `validateParams` in `src/games/subsets/state.ts` returns "Currently only 4x4 puzzles are supported.", which the scenario now quotes |
| Scenario: an unrecognized difficulty character is rejected | spec: A tier naming no rung is refused |

## Subsets descriptions use the per-cell arrow encoding

| Rule | Where it went |
| --- | --- |
| One comma-separated token per cell in row-major order, a set number or an underscore, then its arrow markers | spec: Subsets descriptions use the per-cell arrow encoding |
| What validation rejects: the wrong number of cells told apart, a number out of range, a missing separator, an unexpected character, an off-grid arrow, contradicting arrows | spec: A Subsets description is validated |
| Scenario: a generated description round-trips | spec: Subsets descriptions use the per-cell arrow encoding |
| Scenario: the wrong number of cells is rejected | spec: A Subsets description is validated |
| Scenario: contradicting arrows on one edge are rejected | spec: A Subsets description is validated |

## Subsets input, marking, mistakes and completion

| Rule | Where it went |
| --- | --- |
| The two cycles, Backspace, and a given slot that does not change | spec: Subsets is played by toggling letter slots |
| A keyboard cursor navigates slots, skipping the gaps | spec: The keyboard cursor walks the letter slots |
| A move is a discriminated union, not a string | spec: Subsets is played by toggling letter slots |
| The three kinds of mistake, the wrong rule-out drawn in the mistake color | spec: Subsets flags mistakes for Check & Save |
| Solve fills the board unless it is invalid, and completes as solved-with-help with no win flash | spec: Solve fills the board without the win flash |
| A deliberate divergence from upstream, whose solve move omits the completion bookkeeping | history |
| The board is formattable as text | spec: What Subsets draws |
| Rendering shows the slots, the arrows, the tally and a completion flash, with no move animation | spec: What Subsets draws |
| The tally shows every set-value with its placement count | untrue: `redraw` in `src/games/subsets/render.ts` draws no count, it colors an entry by whether the set is placed never, once or more than once |
| Scenario: toggling a letter slot cycles its state | spec: Subsets is played by toggling letter slots |
| Scenario: completing the grid wins and flashes | spec: Subsets game implements the Game interface |
| Scenario: a duplicated placement is flagged | spec: Subsets flags mistakes for Check & Save |
| Scenario: a wrong rule-out is a mistake | spec: Subsets flags mistakes for Check & Save |

## Subsets provides an explained hint

| Rule | Where it went |
| --- | --- |
| `hint()` plans from the player's marks and rule-outs and narrates each firing as the deduction that forces it | spec: Subsets provides an explained hint |
| The recorder narrates every deduction the solver may use, the higher tier's included, with its reason | spec: The hint narrates every deduction the solver may use |
| The higher rules are reached for only once the cheaper are exhausted, and the equivalence is asserted against a capped recorder, with its reason | spec: The hint reaches for the higher rules last |
| A step rests only on what the board shows, and its highlights and claims are read off the board as it is shown | spec: A hint step rests only on what the board shows |
| A firing's rule-outs are earlier steps of its journey, narrated by the horseshoe, each after its own premise's, and none unused | spec: A firing's rule-outs are placed before it |
| Scenario: a hint narrates an arrow deduction | spec: Subsets provides an explained hint |
| Scenario: a hidden single is shown with its placement spotlight | spec: Subsets provides an explained hint |
| Scenario: a deduction deciding several letters reads as one journey | spec: Subsets provides an explained hint |
| Scenario: a mistaken board is refused honestly | spec: Subsets provides an explained hint |
| Scenario: a board above the lowest tier is fully narratable | spec: The hint narrates every deduction the solver may use |
| Scenario: the lowest tier's plan is unchanged by the higher rules | spec: The hint reaches for the higher rules last |
| Scenario: a collapse rests on rule-outs the plan placed | spec: A firing's rule-outs are placed before it; spec: A hint step rests only on what the board shows |

## Subsets offers a two-way placement reference aid

| Rule | Where it went |
| --- | --- |
| The aid is judged shallowly from the visible board, by the listed readings, never from a solver or the solution | spec: Subsets offers a two-way placement reference aid |
| Selecting a set with no undecided cell in focus spotlights its cells, and a placed set's home is a distinct color | spec: Selecting a set shows where it can go |
| Focusing a cell, by its inspect icon or the keyboard cursor, highlights the sets it could hold, and the icon only inspects | spec: Focusing a cell shows the sets it can hold |
| The two directions are exclusive, the spotlight follows the board, and the aid is never persisted | spec: The aid's two directions are exclusive and ephemeral |
| Touching the aid while a hint is displayed dismisses the hint and its status text | spec: Touching the reference aid dismisses a displayed hint |
| That holds for every hint step | untrue: `uiUpdateClearsHint` in `src/games/subsets/index.ts` answers false for a step whose move is a `rule`, so a rule-out step stays up while its cell's inspect icon is tapped |
| Scenario: the reference aid dismisses a displayed hint | spec: Touching the reference aid dismisses a displayed hint |
| Scenario: spotlighting a set's placements | spec: Selecting a set shows where it can go |
| Scenario: a placed set shows where it sits | spec: Selecting a set shows where it can go |
| Scenario: a cell shows the sets it can still hold | spec: Focusing a cell shows the sets it can hold |
| Scenario: a rule-out leaves the cell's list | spec: Subsets offers a two-way placement reference aid |

## Subsets solves by candidate elimination and generates uniqueness-gated boards

| Rule | Where it went |
| --- | --- |
| The solver reports complete, unfinished or invalid, by a candidate-elimination fixpoint applying the listed rules | spec: Subsets solves by candidate elimination |
| The rules run in the upstream order | spec: Subsets solves by candidate elimination |
| The lowest tier is upstream's compiled strength without its disabled branch | spec: The solver takes an explicit difficulty cap |
| The solver takes an explicit cap with no default, with its reason | spec: The solver takes an explicit difficulty cap |
| Above the lowest tier the mirror half of the advanced arrow rule is applied | spec: The higher tier adds the mirror half of the advanced arrow rule |
| Upstream wrote that half, commented it out under `TODO repair this` and shipped without it | history |
| The elimination never removes the solution's set-value, and soundness is checked against the generator's assignment, not the other cap, with its reason | spec: The mirror elimination is sound |
| The generator shuffles once, derives the arrows, and blanks cells while the capped solver still completes | spec: Subsets generates uniqueness-gated boards |
| Above the lowest tier a candidate the tier below solves is rejected and a wholly fresh board redrawn, with its reason | spec: A board above the lowest tier is not solved by the tier below |
| Generation from a seed is reproducible | spec: Subsets generates uniqueness-gated boards |
| Scenario: the solver classifies a board | spec: Subsets solves by candidate elimination |
| Scenario: generation is reproducible from a seed | spec: Subsets generates uniqueness-gated boards |
| Scenario: a board above the lowest tier needs its tier | spec: The higher tier adds the mirror half of the advanced arrow rule |
| Scenario: the restored elimination never removes the true answer | spec: The mirror elimination is sound |

## Subsets players can rule a set out of a cell

| Rule | Where it went |
| --- | --- |
| Any set can be ruled out of any cell, stored per cell, by an absolute `rule` move | spec: Subsets players can rule a set out of a cell |
| A tally press rules out or takes back with an undecided cell in focus, and otherwise spotlights the set | spec: Subsets players can rule a set out of a cell |
| "As before" | history |
| The cursor moves down into the tally band keeping the focus, and the band's keys | spec: The keyboard reaches the tally band |
| The tally strikes through what is ruled out of the cell in focus or the cell a hint step is about | spec: The tally strikes through what is ruled out of its cell |
| Scenario: a tally press rules a set out of the cell in focus | spec: Subsets players can rule a set out of a cell; spec: The tally strikes through what is ruled out of its cell |
| Scenario: the keyboard reaches the tally | spec: The keyboard reaches the tally band |
| Scenario: saves from before rule-outs still load | spec: Subsets players can rule a set out of a cell |

## Subsets tells a slot's state by a letter, a cross or nothing

| Rule | Where it went |
| --- | --- |
| A player's cell is drawn on the cell surface and a given cell on the lifted surface, with the surface grid line between slots | spec: A slot's surface says who decided its cell |
| A slot's state is what it holds, a letter, a cross or nothing, and no state is told by a step of gray | spec: Subsets tells a slot's state by a letter, a cross or nothing |
| On a lit beat of the flash every slot takes the lifted surface, in both schemes, keeping its letter or cross | spec: The completion flash lifts every slot |
| A tally entry placed once and the idle inspect badge take the used-up clue color | spec: A used-up entry takes the used-up clue color |
| Scenario: a given cell is told by the surface under it | spec: A slot's surface says who decided its cell |
| Scenario: a cleared letter holds the cross | spec: Subsets tells a slot's state by a letter, a cross or nothing |
| Scenario: the flash lifts every slot | spec: The completion flash lifts every slot |
