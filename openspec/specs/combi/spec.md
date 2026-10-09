# combi Specification

## Purpose
The combination enumerator in `src/engine/combi/`, which yields every r-element
subset of n items exactly once and in lexicographic order, for a solver that
searches over subsets. This is what a caller may rely on: the order, the
degenerate cases, what `reset()` and an advance past the end do, and which
`(r, n)` are refused.
## Requirements
### Requirement: TypeScript combi module enumerates subsets in lexicographic order

The implementation in `src/engine/combi/index.ts` SHALL enumerate, for a given
`(r, n)`, every `r`-element subset of `{0, 1, …, n-1}` exactly once, in
lexicographic order.

#### Scenario: A hand-spelled enumeration matches

- **WHEN** the iterator is walked for a small case a reader can check by eye
  (`(3, 5)`, `(2, 5)`)
- **THEN** the sequence of `r`-tuples equals the enumeration spelled out in the
  test

#### Scenario: The count and the order hold for every (r, n)

- **WHEN** the module is enumerated for a range of `(r, n)`
- **THEN** the number of tuples equals `C(n, r)`
- **AND** each tuple is strictly increasing, and each is lexicographically after
  its predecessor
- **AND** no two tuples are equal

#### Scenario: degenerate r == 0 yields a single empty tuple

- **WHEN** the implementation is constructed with `r = 0` and any `n >= 1`
- **THEN** the iterator produces exactly one `r`-tuple of length zero, then
  exhausts

#### Scenario: degenerate r == n yields a single full tuple

- **WHEN** the implementation is constructed with `r == n`
- **THEN** the iterator produces exactly one `r`-tuple equal to
  `[0, 1, …, n-1]`, then exhausts

### Requirement: reset rewinds the enumeration to its start

`reset()` SHALL rewind the iterator to the start of the enumeration, whether or
not it has been exhausted.

#### Scenario: reset rewinds the iterator

- **WHEN** a `Combi(r, n)` is enumerated to exhaustion, then reset, then
  enumerated again
- **THEN** the second enumeration produces the same sequence of `r`-tuples as
  the first

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
