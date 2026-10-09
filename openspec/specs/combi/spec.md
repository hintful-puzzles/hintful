# combi Specification

## Purpose
The combination enumerator in `src/engine/combi/`, which yields every r-element
subset of n items exactly once and in lexicographic order, for a solver that
searches over subsets. Its correctness is stated as closed-form properties of
the mathematics rather than as a replayed recording.
## Requirements
### Requirement: Upstream combi-test.c is ported to Vitest

The repository SHALL contain a TypeScript translation of upstream's
`auxiliary/combi-test.c` that drives the implementation over a handful of
`(r, n)` cases and asserts that the iteration matches an expected output spelled
out by hand. The C test's output format, `"combi R of N, T elements."` followed
by one space-separated line per tuple, SHALL be reproduced, so the test reads as
a direct translation and keeps in the file an enumeration a reader can check by
eye.

#### Scenario: Ported test covers a hand-spelled (3, 5) case

- **WHEN** the ported test runs `(r, n) = (3, 5)`
- **THEN** the produced output matches the hand-spelled expected output for that
  case
- **AND** Vitest reports the test passing under `npm run test:run`

### Requirement: TypeScript combi module enumerates subsets in lexicographic order

The implementation in `src/engine/combi/index.ts` SHALL enumerate, for a given
`(r, n)`, every `r`-element subset of `{0, 1, …, n-1}` exactly once, in
lexicographic order. The module SHALL live under `src/engine/`, because it is an
engine library.

#### Scenario: A hand-spelled enumeration matches

- **WHEN** the iterator is walked for a small case a reader can check by eye
  (`(3, 5)`, `(2, 5)`)
- **THEN** the sequence of `r`-tuples equals the enumeration spelled out in the
  test

#### Scenario: degenerate r == 0 yields a single empty tuple

- **WHEN** the implementation is constructed with `r = 0` and any `n >= 1`
- **THEN** the iterator produces exactly one `r`-tuple of length zero, then
  exhausts

#### Scenario: degenerate r == n yields a single full tuple

- **WHEN** the implementation is constructed with `r == n`
- **THEN** the iterator produces exactly one `r`-tuple equal to
  `[0, 1, …, n-1]`, then exhausts

### Requirement: Combi exposes construction, advance, read and reset

The module SHALL expose, at minimum, the public surface its sole consumer, Light
Up's solver, uses: construction from `(r, n)`, advance to the next tuple, and
read access to the current `r`-tuple. It SHALL also expose `reset()`, which
rewinds the iterator to the start of the enumeration.

#### Scenario: reset rewinds the iterator

- **WHEN** a `Combi(r, n)` is enumerated to exhaustion, then reset, then
  enumerated again
- **THEN** the second enumeration produces the same sequence of `r`-tuples as
  the first
- **AND** this is asserted by a test driving `reset()` directly, not as a side
  effect of replaying a recording

### Requirement: Advancing past exhaustion returns false and does not throw

Advancing past exhaustion SHALL return the falsy sentinel the API documents,
which is `false`, and SHALL NOT throw.

#### Scenario: The call after the final tuple

- **WHEN** an enumeration has produced its final tuple and is advanced again
- **THEN** the call returns the documented falsy sentinel, `false`
- **AND** a further advance returns it as well

### Requirement: Combi refuses an invalid (r, n) at construction

The implementation SHALL enforce the preconditions `r <= n` and `n >= 1` by
throwing on construction.

#### Scenario: precondition violations throw

- **WHEN** the implementation is constructed with `r > n` or `n < 1`
- **THEN** construction throws

### Requirement: Enumeration correctness is asserted in closed form, not by replay

`Combi`'s guarantee SHALL be asserted by properties that state the mathematics
directly: that it emits exactly `C(n, r)` tuples, in lexicographic order, each a
distinct `r`-element subset of `{0, …, n-1}`. The hand-spelled enumerations and
the degenerate cases SHALL be asserted beside them. The properties SHALL be
exhaustive over a small grid of `(r, n)` and not sampled, since enumerating that
grid costs nothing.

#### Scenario: The count and the order are asserted directly

- **WHEN** the module is enumerated for a range of `(r, n)`
- **THEN** the number of tuples equals `C(n, r)`
- **AND** each tuple is strictly increasing, and each is lexicographically after
  its predecessor
- **AND** no two tuples are equal

### Requirement: A frozen fixture is retired only where every fact it asserts is derivable

Retiring a frozen fixture SHALL be scoped by the question "is every fact this
fixture asserted derivable?", not "is the fixture's subject derivable?". A
fixture SHALL be retired only where what it records follows from a definition
the test can state directly. A fixture recording a fact that cannot be derived,
such as the boards a solver-gated generator produces or the bit sequence a seed
yields, SHALL be kept, whatever the state of upstream compatibility.

#### Scenario: A derived fact is not preserved by replay

- **WHEN** deciding whether a frozen C fixture may be retired
- **THEN** it is retired only where the property it records follows from a
  definition the test can state directly
- **AND** fixtures recording facts that cannot be derived, a generator's boards
  or an RNG's bit sequence, as a per-game differential and `random`'s corpus
  do, are kept, whatever the state of upstream compatibility

### Requirement: Retiring a fixture accounts for everything it covered

When a frozen fixture is retired in favor of properties, every behavior that
only the fixture's replay exercised SHALL be given a direct test in the same
change, and the change SHALL name the replacement, so that no assurance is
dropped silently.

#### Scenario: The replay was the only caller of reset

- **WHEN** a recorded enumeration is retired whose replay was the only place
  `reset()` was driven
- **THEN** the same change adds a test that drives `reset()` directly
- **AND** the change names that test as the replacement
