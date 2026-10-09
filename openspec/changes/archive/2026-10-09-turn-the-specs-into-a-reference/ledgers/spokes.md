# Ledger: spokes

Base: bb004490

Where every rule of Spokes' spec went in the reference form: every rule kept,
stated once, a requirement held to the tool's 500 characters.

## Spokes explains why each hinted move is forced

| Rule | Where it went |
| --- | --- |
| The hint hooks, the argument narrated, premises before the conclusion, every claim checked | spec: Spokes explains why each hinted move is forced |
| The hint is derived from the solver's deduction engine, so no hinted move is beyond the solver | spec: Spokes' hint is a projection of its solver |
| No shipped board can require a step the hint cannot explain | untrue: `nextSpokesFiring` in `src/games/spokes/solver.ts` leaves out the unbounded look-ahead the `Unreasonable` solver uses, as "Spokes' hint stops at bounded reasoning" requires, so the rule is stated with that exception in spec: Spokes' hint is a projection of its solver |
| Several spokes forced by one deduction are one multi-leg journey in one color | spec: A deduction that forces several spokes is one journey |
| A plan is stable across recomputation | spec: A Spokes hint plan is stable across recomputation |
| A line is preferred to a rule-out, and a rule-out that helps no hub is not hinted | spec: A Spokes hint prefers a connection and never hints a useless rule-out |
| Scenario: a useless rule-out is never hinted | spec: A Spokes hint prefers a connection and never hints a useless rule-out |
| Scenario: a saturated hub is explained by its count | spec: A deduction that forces several spokes is one journey |
| Scenarios: the two-ones rule, and a contradiction states its hypothesis | spec: Spokes explains why each hinted move is forced |

## Spokes refuses to hint from a position it cannot vouch for

| Rule | Where it went |
| --- | --- |
| The whole requirement and its scenario | spec: Spokes refuses to hint from a position it cannot vouch for |

## A diagonal line automatically rules out its crossing

| Rule | Where it went |
| --- | --- |
| Drawing marks the crossing, erasing clears it, the blocked crossing is inert, the mark is real and never hinted | spec: A diagonal line automatically rules out its crossing |
| Asking the player or a hint to mark it is noise | reason |
| Scenario: drawing a diagonal blocks its crossing | spec: A diagonal line automatically rules out its crossing |

## Spokes game implements the Game interface

| Rule | Where it went |
| --- | --- |
| `src/games/spokes/` implements `Game` and is registered | spec: Spokes game implements the Game interface |
| The parameters, what validation requires, and the game ID round trip | spec: Spokes' parameters |
| The top tier is named `Unreasonable` and keeps its key and its difficulty character | spec: Spokes' top tier is named Unreasonable |
| The tier was upstream's `Hard`, and the bounds match upstream | history |
| Uniquely solvable, and declares `findMistakes` so Check & Save flags a wrong board | spec: Spokes game implements the Game interface |
| Scenario: every preset produces a soluble board | spec: Spokes game implements the Game interface |
| Scenario: a game ID round-trips | spec: Spokes' parameters |
| Scenario clause: the top tier's character is the one it had | spec: Spokes' top tier is named Unreasonable |

## Spokes descriptions use one clue character per cell

| Rule | Where it went |
| --- | --- |
| One character a cell in row-major order, a clue digit or the hole marker, no run-length | spec: Spokes descriptions use one clue character per cell |
| Validation rejects too few, too many and a foreign character, telling short from long | spec: A Spokes description is validated against the board's cells |
| Scenario: a generated description round-trips | spec: Spokes descriptions use one clue character per cell |
| Scenario: the wrong number of characters is rejected | spec: A Spokes description is validated against the board's cells |

## Spokes ports the tiered deductive solver and solver-gated generator

| Rule | Where it went |
| --- | --- |
| The solver, its three results, its tiers and the rules each applies | spec: Spokes solves with a tiered deductive solver |
| Validity is decided by connectivity | spec: Spokes' solver decides validity by connectivity |
| The look-ahead is deterministic and exhaustive and commits only on a proof | spec: The contradiction look-ahead never guesses |
| Bounded at Normal, unbounded at `Unreasonable`, and so two rungs | spec: The look-ahead runs at two strengths, which are two rungs |
| The bound has one definition, documented as load-bearing | spec: The look-ahead's bound has one definition |
| The generator starts from every line, strips in random order, and is reproducible | spec: Spokes' generator keeps every board uniquely soluble |
| A removal is kept only while the board is no easier than its tier | untrue: `spokesGenerate` in `src/games/spokes/generator.ts` tests a removal at the target tier only and asks "no easier" once, of the finished board, which is spec: Spokes' difficulty tiers bind the boards they generate |
| Scenario: the solver deduces the unique solution | spec: Spokes solves with a tiered deductive solver |
| Scenario: generation is reproducible from a seed | spec: Spokes' generator keeps every board uniquely soluble |

## Spokes marks hubs whose spoke count is met

| Rule | Where it went |
| --- | --- |
| The two surfaces, a pair the collection names in both schemes, never a gray of the game's own | spec: Spokes marks hubs whose spoke count is met |
| Visual only, and a preference turns it off | spec: The satisfied-hub marking is visual only and can be turned off |
| Upstream fills such a hub with white, which the application's background hides | history |
| Scenario: meeting a clue marks the hub | spec: Spokes marks hubs whose spoke count is met |
| Scenario: the marking can be switched off | spec: The satisfied-hub marking is visual only and can be turned off |

## Spokes input, movement and completion

| Rule | Where it went |
| --- | --- |
| Dragging or a keyboard cursor, left for a line and right for a mark, and no change on an invalid gesture | spec: Spokes is played by dragging between hubs or with a keyboard cursor |
| A left drag toggles a line whatever the spoke holds | untrue: `toggleSpoke` in `src/games/spokes/index.ts` clears a spoke that holds a line or a mark under either verb, so a left drag over a mark clears it and draws nothing, and returns no move on a crossing a diagonal line blocks, which is stated in spec: Spokes is played by dragging between hubs or with a keyboard cursor |
| No line along a diagonal that would cross a diagonal line | spec: A line cannot cross a diagonal line |
| What rendering draws, the error coloring, the flash and no animation | spec: What Spokes draws |
| What `findMistakes` flags and what it does not | spec: Spokes' findMistakes compares the board with its one solution |
| Scenario: dragging between two hubs draws a line | spec: Spokes is played by dragging between hubs or with a keyboard cursor |
| Scenario: a crossing diagonal line is refused | spec: A line cannot cross a diagonal line |
| Scenario: completing the board wins | spec: What Spokes draws |
| Scenario: a wrongly drawn line is flagged | spec: Spokes' findMistakes compares the board with its one solution |

## Spokes' hint stops at bounded reasoning

| Rule | Where it went |
| --- | --- |
| Only the bounded look-ahead is narrated, on any tier, and the hint refuses where it runs out | spec: Spokes' hint stops at bounded reasoning |
| The solver retains the unbounded rung, so generation and grading are unchanged | spec: Spokes' solver keeps the unbounded rung |
| Every description is byte-identical to what shipped before | history |
| The guarantee is structural, asserted directly with a control, not a check on wording | spec: The bounded-hint guarantee is asserted structurally |
| What the shared narration names: the hub over-filled, the diagonals crossing, the hubs stranded | spec: Spokes explains why each hinted move is forced |
| Scenario: the top tier's plan equals Normal's | spec: Spokes' hint stops at bounded reasoning |
| Scenario clause: on one sampled board Normal's plan is longer than Easy's | spec: The bounded-hint guarantee is asserted structurally |

## Spokes' difficulty tiers bind the boards they generate

| Rule | Where it went |
| --- | --- |
| A board above the easiest is not soluble at the tier below, checked from an empty position | spec: Spokes' difficulty tiers bind the boards they generate |
| What upstream's check did, and that the divergence changes every description on the two harder tiers | history |
| Scenario: an Unreasonable board needs its own tier | spec: Spokes' difficulty tiers bind the boards they generate |
