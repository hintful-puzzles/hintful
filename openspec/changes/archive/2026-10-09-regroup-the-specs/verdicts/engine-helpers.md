# Verdicts: engine-helpers

## keep `engine-helpers`: A hot constant's placement is decided by the build, not by the suite

The comment rule is wanted as a standing rule and has no other home:
docs/games/testing.md § "Timing anything under vitest: two things to know
first" says the hoist is not to be refused and gives Range's figures, but not
that a constant kept local records its ratio, its control and that the cost
does not reach a player. The comment above `DR` in `src/games/range/solver.ts`
is one instance of the rule, not a statement of it.

## keep `engine-helpers`: A shared deduction-fixpoint scaffold

The convergence sentence is not a finished migration rule. "A game that does
not fit the runner records the promise it breaks" requires each recorded no-go
to be re-derived when the contract changes and to adopt where no new option is
needed, and docs/games/solver-and-generator.md ("A no-go is re-derived when the
contract changes, never carried forward") records no-gos dissolving that way.
Each such adoption is checked against "without changing its techniques, their
order or its verdicts", and so is a new game's.

## keep `engine-helpers`: The record is the game's, and the generation path allocates nothing

"Byte-for-byte unchanged" here is not upstream parity or seed stability, which
are released. It says the hint path's existence leaves what the generator and
solver compute as it was, and that still binds whoever threads a recorder
through a technique: docs/games/hints.md § "The recorder and the soundness
boundary" tells them to gate every reason allocation "so the generator/solve
path is byte-for-byte unchanged (verify with the differential)".

## keep `engine-helpers`: The engine provides a shared permutation-parity helper

It is a shared helper's promise with two consumers (`src/games/fifteen/state.ts`,
`src/games/sixteen/state.ts`), each applying a different correction, which is
the rule the last sentence holds. The catalog's `shuffle.ts` entry says the
same in a parenthesis, and a catalog line is a pointer, not the rule's home.
The signature costs one line and the requirement is well under the bound.

## note The gate-ordering sentence in "The engine catalog names every shared helper there is" has a twin

The entries (R 2, P 2) are settled as "stays" by the plan of moves and no
verdict changes them. The observation still stands for whoever next edits
`repo-layout`: its "The spelling guard runs in the gate's fast prefix, not as a
test" and the catalog requirement's last sentence state one rule about every
check that reads `docs/`, and neither capability states it once for all of
them.
