## ADDED Requirements

### Requirement: Generated boards place gems only where the ball can go and come back

The generator SHALL fill the grid with one fifth walls, one fifth stop-squares and
one fifth mines plus one start square, the remainder blank, and shuffle it; then
find the **gem candidates** — the squares for which some direction is reachable
both *from* the start and *back to* the start, computed by two breadth-first
searches over the `w · h · 8` square-plus-direction space — and reject the grid if
there are fewer candidates than the required gem count. It SHALL further reject a
grid in which some square is geometrically further than a threshold from the
nearest candidate (the threshold starting at 2 and relaxing by one every 50
rejections), so that reachable squares stay spread over the board. It SHALL then
place `⌊w·h/5⌋` gems on a shuffled subset of the candidates.

Searching square-plus-direction pairs rather than squares is required for
correctness: a square may only be enterable heading one way and only leavable
heading another, so a gem there could be collected but never returned from.

#### Scenario: Every generated board is completable

- **WHEN** a board is generated for any preset
- **THEN** the route solver finds a route from the start that collects every gem

### Requirement: Solve installs a computed route the player follows

`solve` SHALL compute a route — a sequence of directions from the ball's current
position that collects every remaining gem — by building the move graph (a vertex
at every square the ball can come to rest, plus a *directed* vertex at every gem
the ball can slide through, since a gem passed through in one direction cannot be
left in another), growing a tour that splices in a detour to one as-yet-uncollected
gem after another until none remain, and then repeatedly replacing redundant
sections of the tour with shortest paths until it stops shrinking. It SHALL return
an error when some remaining gem is unreachable.

The tour is an approximate solution to a traveling-salesman problem, not a
deduction. Two tours SHALL be grown — one reaching for the nearest uncollected
gem, one for the farthest — and the shorter kept.

The solve move SHALL **install** that route into the game state rather than
completing the game: the game remains in progress until the player collects the
last gem, and the status bar SHALL report that the auto-solver was used. While a
route is installed:

- the renderer SHALL draw an arrow on the ball pointing along the route's next
  direction;
- Enter/Space SHALL play that direction;
- a move that follows the route SHALL advance it;
- a move that deviates SHALL cause the game to **re-solve** from the new position
  and install the new route, or discard the route when the new position admits no
  route;
- death, or the collection of the last gem, SHALL discard the route.

#### Scenario: Following the route advances it

- **WHEN** a route is installed and the player plays the direction the arrow shows
- **THEN** the route advances to its next step and the arrow points along it

#### Scenario: Deviating from the route re-solves

- **WHEN** a route is installed and the player plays some other legal direction
- **THEN** the game installs a freshly computed route from the resulting position

#### Scenario: A computed route collects every gem

- **WHEN** a route is computed for a board whose gems are all reachable
- **THEN** following it collects every gem without the ball dying

#### Scenario: Solve does not finish the game

- **WHEN** the player invokes Solve on a board with gems remaining
- **THEN** the ball has not moved, the gems are still uncollected, and the game
  reports itself as still in progress

## REMOVED Requirements

### Requirement: Generated boards place gems only on round-trip-reachable squares

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. Its scenario required `newDesc` to equal the desc the C generator produced for each recorded preset and seed; a `MODIFIED` block cannot drop that scenario.

**Migration**: Replaced by "Generated boards place gems only where the ball can go and come back", identical without that scenario. `inertia-differential.test.ts` stays as a refactoring net.

### Requirement: Solve installs a route the player follows

**Reason**: Matching upstream's C output was a porting-era aid, retired by the owner on 2026-09-13 as no longer a concern. It measured the route against the C reference's — "no longer than C's on every board of the differential fixture" — with a scenario asserting it.

**Migration**: Replaced by "Solve installs a computed route the player follows", which keeps the two-tour construction, the installed route and a scenario that the route collects every gem.
