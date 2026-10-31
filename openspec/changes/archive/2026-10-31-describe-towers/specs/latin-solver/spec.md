## ADDED Requirements

### Requirement: A compiled technique may range over the fillings of a set

A quantifier or aggregate SHALL bind `fill f of S`, each assignment of a value
to every element of `S`, from its candidates where `from cand` is said, read
`f(x)`. The compiled enumeration SHALL give the result of trying every
assignment, while it passes over one that repeats a value in a `distinct`
the `where` states, or that breaks an `f(x) = t` it states, before it is
whole.

#### Scenario: A line's fillings asked cell by cell

- **WHEN** a technique asks, for each cell `c` of a line of 6 and each value
  `d`, whether some filling of the line from its candidates, every value
  once, with `d` in `c`, shows a count
- **THEN** the line's fillings are enumerated once for every question until
  the marks change, over at most the 720 orders of its values rather than
  6⁶ assignments a question, and each answer is the whole enumeration's
