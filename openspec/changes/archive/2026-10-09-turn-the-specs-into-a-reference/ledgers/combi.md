# Ledger: combi

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Upstream combi-test.c is ported to Vitest

| Rule | Where it went |
| --- | --- |
| A TypeScript translation of `combi-test.c` drives a handful of `(r, n)` cases against a hand-spelled expected output | spec: Upstream combi-test.c is ported to Vitest |
| The C test's output format is reproduced so the test reads as a direct translation | spec: Upstream combi-test.c is ported to Vitest |
| This layer keeps a reader-checkable enumeration in the file | spec: Upstream combi-test.c is ported to Vitest |
| The closed-form properties cover count and order for every `(r, n)` while a hand-spelled case shows a first-time reader the answer | reason |
| Scenario: the ported test covers a hand-spelled (3, 5) case, and Vitest reports it passing under `npm run test:run` | spec: Upstream combi-test.c is ported to Vitest |

## TypeScript combi module enumerates subsets in lexicographic order

| Rule | Where it went |
| --- | --- |
| Every `r`-element subset of `{0, …, n-1}` is enumerated exactly once in lexicographic order | spec: TypeScript combi module enumerates subsets in lexicographic order |
| At minimum the surface the sole consumer, Light Up's solver, uses is exposed: construction, advance, read of the current tuple | spec: Combi exposes construction, advance, read and reset |
| The C surface may be exposed under idiomatic TypeScript names, a permission that binds nothing | history |
| Advancing past exhaustion returns the falsy sentinel the API documents, `null` or `false`, which is `false`, and does not throw | spec: Advancing past exhaustion returns false and does not throw |
| The preconditions `r <= n` and `n >= 1` are enforced by throwing on construction | spec: Combi refuses an invalid (r, n) at construction |
| The requirement is stated as the mathematics and not as agreement with a recording | spec: Enumeration correctness is asserted in closed form, not by replay |
| It was once "reproduces C output byte-for-byte", asserted by replaying a frozen corpus | history |
| The module lives under `src/engine/` because it is an engine library | spec: TypeScript combi module enumerates subsets in lexicographic order |
| It was a top-level `src/native/combi/` with its own capability, for an 81-line class with one call site | history; figure |
| Scenario: a hand-spelled enumeration matches | spec: TypeScript combi module enumerates subsets in lexicographic order |
| Scenario clause: the call after the final tuple returns the falsy sentinel | spec: Advancing past exhaustion returns false and does not throw |
| Scenario: reset rewinds the iterator, asserted by a test driving `reset()` directly | spec: Combi exposes construction, advance, read and reset |
| Scenarios: `r == 0` yields one empty tuple and `r == n` yields one full tuple | spec: TypeScript combi module enumerates subsets in lexicographic order |
| Scenario: precondition violations throw | spec: Combi refuses an invalid (r, n) at construction |

## Enumeration correctness is asserted in closed form, not by replay

| Rule | Where it went |
| --- | --- |
| The guarantee is asserted by properties: exactly `C(n, r)` tuples, in lexicographic order, each a distinct `r`-element subset | spec: Enumeration correctness is asserted in closed form, not by replay |
| The hand-spelled enumerations and the degenerate cases are asserted as well | spec: Enumeration correctness is asserted in closed form, not by replay |
| The properties are exhaustive over a small grid of `(r, n)` and not sampled | spec: Enumeration correctness is asserted in closed form, not by replay |
| This is the one frozen C corpus a closed-form property states better, and the reason does not generalize | reason; held: src/engine/combi/combi.test.ts "There is deliberately no C-recorded corpus" |
| A per-game differential and `random`'s corpus assert facts that cannot be derived, so they are kept | spec: A frozen fixture is retired only where every fact it asserts is derivable |
| The recorded enumeration showed only that C and TypeScript both implement combinations | reason |
| `AGENTS.md` used this function as its example of a property test worth having | history |
| The replaced ceremony was a `__fixtures__` directory, a capability and a never-re-baseline rule, not the 4 KB of JSON | history; figure |
| Retiring a fixture is scoped by whether every fact it asserted is derivable, not whether its subject is | spec: A frozen fixture is retired only where every fact it asserts is derivable |
| The corpus block was the only place `reset()` was driven, an assurance that would have been lost in silence | spec: Retiring a fixture accounts for everything it covered |
| Scenario: the count and the order are asserted directly | spec: Enumeration correctness is asserted in closed form, not by replay |
| Scenario: a derived fact is not preserved by replay, and underivable fixtures are kept whatever the state of upstream compatibility | spec: A frozen fixture is retired only where every fact it asserts is derivable |
| Scenario: retiring a fixture gives a direct test to everything only its replay exercised, in the same change, and names the replacement | spec: Retiring a fixture accounts for everything it covered |
