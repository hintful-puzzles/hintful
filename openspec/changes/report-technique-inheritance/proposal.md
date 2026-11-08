# report-technique-inheritance

**Status: filed on the owner's word (2026-10-31)**, in
`compute-the-cut-by-technique-transfer` (`report.md` § "The owner's decision
(2026-10-31)"), toward growing the catalog by about 200% in a year.

## Why

The cut's word, one game or two, summarizes a table: for each technique of
an existing ladder, whether it stays sound under a candidate's rules. That
table is what a new game in a family costs. Every rung that carries is a
hint step the candidate inherits; every one that breaks is a rung the port
must replace, and every rule of the candidate no rung reads is a technique to
write. Today a port finds this out by writing the game.

## What Changes

- **A report**, run by hand beside the checker: given a candidate's
  description (its rules) and an existing game's stated techniques, each
  technique sound, unsound with a counterexample, or undecided, on the small
  boards in reach.
- **Tried on a candidate the corpus already wrote**, a Latin one first, since
  only the Latin family states its techniques (2026-10-31); its prediction
  compared with what the port then needs.

## Open

- Whether the report runs before every port, which depends on how many
  families state their techniques by then.

## Prior art

Butler, Torlak and Popović (FDG 2017) check Nonogram techniques sound
against a genre's rules with an SMT solver; this report asks the same of
one family's techniques against another game's rules. For a rule of the
candidate no rung reads, a minimal unsatisfiable subset over its rules on a
board where the inherited ladder stalls (Demystify's method, Espasa and
others, 2021) would name what the missing technique must combine; untried.
`docs/descriptions.md` § "What this builds on" lists the works.

## Acceptance

The report run on one candidate, and its table compared with the port.
