# Verdicts: combi

## note The cut of "Enumeration correctness is asserted in closed form, not by replay" stands

It is not in the regrouped spec and is not restored. The refusal it carried is
held by a requirement, not only by a guide and a test header: `testing`, "A
C-recorded fixture is kept for what cannot be derived, not as a quality bar",
keeps a C capture only for a fact with no independent derivation, and combi's
enumeration has one. docs/test-strength.md § 4a gives the test to apply, and
the header of `src/engine/combi/combi.test.ts` says why combi has no corpus and
that the reason does not generalize. Its scenario (count, order, distinctness)
is in "TypeScript combi module enumerates subsets in lexicographic order".

## reword `combi`: Combi refuses an invalid (r, n) at construction

The spec named two of the three preconditions the constructor enforces.
`src/engine/combi/index.ts` also throws a `RangeError` on `r < 0`, and
`combi.test.ts` ("throws when r < 0") holds it; a caller reading the spec for
which `(r, n)` are refused should find all three. Nothing else changes.

### Requirement: Combi refuses an invalid (r, n) at construction

The implementation SHALL enforce the preconditions `0 <= r <= n` and `n >= 1`
by throwing on construction.

#### Scenario: precondition violations throw

- **WHEN** the implementation is constructed with `r < 0`, `r > n` or `n < 1`
- **THEN** construction throws

## keep `combi`: Advancing past exhaustion returns false and does not throw

The entry raised no question. It is the contract a caller's `while (c.next())`
loop rests on, and it is a different promise from what `reset()` does, so the
two stay apart.

## keep `combi`: TypeScript combi module enumerates subsets in lexicographic order

R combi 2 is already settled in the regrouped spec: the clause "The module
SHALL live under `src/engine/`, because it is an engine library" is gone from
this requirement, and `repo-layout`, "A shared library lives under
`src/engine/`", states it and names `combi/`. What is left names the file only
to say what it enumerates.
