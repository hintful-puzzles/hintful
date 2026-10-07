## MODIFIED Requirements

### Requirement: Boats explains its next deduction

Boats SHALL provide an explained hint that computes a plan of forced moves from
the player's current board and narrates each one by the deduction that forces it,
meeting the project's hint quality bar: the narration SHALL state *why* the move
is forced — the premise that singles out this conclusion — and not merely what to
place.

The hint SHALL be derived from the same deduction engine as the solver, replayed
one firing at a time, and SHALL NOT alter the solver, the generator or the
description codec.

The hint SHALL replay the deduction at the **lowest** cap at which the board
solves, so that a board generated at an easy tier is taught the easy technique
that suffices.

A hidden border number the deduction recovers is new to every cheaper
technique, so the hint SHALL ask them again before it tries a harder one.

Every named technique SHALL be narratable — Boats guesses at no tier, so the hint
SHALL NOT fall back on an unexplained "this is the only possibility" step.

#### Scenario: A hint names the technique that forces the move

- **WHEN** a hint is requested on a board where a row already shows all the ships
  its number allows
- **THEN** the remaining squares in that row are offered as water, and the
  explanation states that the row's number is already met

#### Scenario: A hint on an easy board teaches an easy technique

- **WHEN** a hint is requested on a board generated at the easiest difficulty
- **THEN** a plan is produced, and it is the deduction that difficulty admits
  rather than a harder refutation reaching the same square

#### Scenario: A recovered number feeds a line count

- **WHEN** the only progress on a board with hidden border numbers is that one
  of them can now be worked out, and with it a line is one boat square short
  with one square free
- **THEN** the hint offers that square, and does not report that deduction has
  run out

#### Scenario: A refutation names the rule the alternative would break

- **WHEN** a square is forced only because the opposite placement immediately
  contradicts the board
- **THEN** the explanation names the specific rule that would break — a line's
  number, two boats touching, or a boat the fleet cannot hold — rather than
  asserting the square is forced without reason

### Requirement: Boats solves with a four-tier deductive solver

Boats SHALL provide a solver that finds the fleet placement by deduction, or
reports that no deduction completes it. The solver SHALL apply progressively
harder named technique tiers — Easy, Normal, Tricky, Hard — and SHALL report the
highest tier a board actually requires. The solver SHALL NOT guess or backtrack at
any tier, so that every generated board is solvable by pure deduction and Boats
satisfies the guess-free-generation policy at every named difficulty.

Boat connectivity SHALL be computed over the shared disjoint-set structure. Where
the solver needs a boat's first square (whether a boat is finished, and which way
an unfinished one must grow) it SHALL ask for the smallest element of the boat's
class, and SHALL NOT read the class's root, which union-by-size leaves on a
boat's second square.

The solver SHALL be monotone in its difficulty cap, as every capped solver is.
A consumer that solves a board of unknown difficulty — Solve, and the mistake
check — solves once at the highest cap.

A boat that has an end cap on one side and an undecided square on the other
SHALL be grown into that square once every boat of its present length is
finished, at the second tier.

The generator SHALL use the solver to guarantee a unique solution at exactly the
requested difficulty: it SHALL place a random fleet, derive the border clues,
optionally hide border numbers while the board stays soluble, and reject any board
not solvable at exactly the target difficulty. Generation from a given seed SHALL
be reproducible.

#### Scenario: The solver reports the required difficulty

- **WHEN** a soluble board is solved
- **THEN** the returned tier equals the hardest technique tier the deduction
  needed, and the completed grid is the unique solution

#### Scenario: A finished boat is seen as finished

- **WHEN** the largest boats of the fleet are all placed and bounded by water
- **THEN** the solver does not report a contradiction, and a board that solves
  at the easiest cap solves at every cap above it

#### Scenario: An unfinished boat that cannot stop grows

- **WHEN** a boat of two squares has water beyond one end and an undecided
  square beyond the other, and every two-square boat of the fleet is finished
- **THEN** the solver places a boat segment in the undecided square, and the
  hint gives that as its reason

#### Scenario: Generation is reproducible from a seed

- **WHEN** the same seed is used twice for the same parameters
- **THEN** both runs produce the identical board description
