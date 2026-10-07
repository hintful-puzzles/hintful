## MODIFIED Requirements

### Requirement: A difficulty-capped solver is monotone in its cap at every tier

A solver that accepts a difficulty cap SHALL be monotone in it: a board solvable
with the ladder capped at difficulty `d` SHALL be solvable at every cap above
`d`. This SHALL be asserted for **every** game declaring a difficulty contract,
by a single cross-game guard, rather than per game by hand.

Non-monotonicity is not theoretical. Boats shipped with a solver that solved
boards at a *lower* cap which it failed at a higher one — its second-tier
disjoint-set check reported a contradiction a board did not have — and that
silently broke Check & Save on Easy boards, because "solvable at Easy" and
"solvable at Tricky" were both true statements about different code paths and
nothing compared them.

**A solver found non-monotone SHALL be repaired, and the contract offers no way
to declare it so.** Every technique is sound and a higher cap only adds some, so
a board that fails at a higher cap convicts a technique or a check. Boats
declared itself non-monotone, and solved at each tier in turn, while the cause
went unlooked for: one read of the disjoint-set root as a boat's first square.
The declaration kept the game out of the tier-binding guard as well, and hid
that the same read left a whole technique unable to fire.

The same cross-game guard SHALL also assert that every declared tier either
generates or is refused with a reason, and that a game's declared tier list
matches the difficulty choices its custom-params form offers, so a game that
gains a tier cannot ship a stale declaration.

The guard SHALL sample **enough boards per tier to catch the defect it names**,
and that sample size SHALL be established by removing a known exemption and
confirming the guard fires — not chosen by judgment. The first version of this
guard sampled one board per tier and did **not** catch Boats, whose solver was
then non-monotone on 7 of 8 of its easiest boards, because the first seed
happened to be one of the eighth. A guard that has never been shown to fail is not
known to work, and sampling is where a cross-game guard silently becomes
decorative.

This property is part of what replaces the retired byte-match oracle: it is a
statement about what a difficulty tier *means* that the byte-match never checked.

#### Scenario: A capped run succeeds where an uncapped run fails

- **WHEN** a game's solver solves a board with its ladder capped at the easiest
  tier but fails the same board with the ladder uncapped
- **THEN** the cross-game monotonicity guard fails, naming the game and seed
- **AND** the solver is fixed: no declaration excuses the game from the guard

#### Scenario: A game declares itself non-monotone

- **WHEN** a game's solver is found to fail at a higher cap what it solves at a
  lower one
- **THEN** its contract has no field to say so, and the guard fails until the
  cause is found and repaired
- **AND** the game is never silently skipped

#### Scenario: A solver is converted to the shared deduction runner

- **WHEN** a game's hand-rolled deduction ladder is moved onto the shared runner
- **THEN** its differential fixture passes unmodified, because a solver reaching
  the same verdicts generates the same boards
- **AND** the cross-game monotonicity guard already covers it, with no bespoke
  per-game test to add or later delete
