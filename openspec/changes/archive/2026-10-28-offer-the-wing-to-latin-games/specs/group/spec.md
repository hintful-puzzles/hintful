## MODIFIED Requirements

### Requirement: Generation: Each Group tier adds its own deductions

Normal SHALL add associativity (with `ab`, `bc` and one bracketing of `abc`
known, the other is placed equal to it) and the filling of the identity's row
and column once the identity is known. Tricky SHALL add ruling an element out
as the identity by a filled product of it that is not the other factor, and
the generic set elimination. Hard SHALL add the harder set elimination and
the wing, and Unreasonable forcing chains and guess-and-verify recursion,
none of them Group's own.

#### Scenario: Associativity is used as a deduction

- **WHEN** a partially-filled board has `ab`, `bc` and `(ab)c` known but `a(bc)`
  blank at Normal or harder
- **THEN** the solver places `a(bc)` equal to `(ab)c`
