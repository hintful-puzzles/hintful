## MODIFIED Requirements

### Requirement: Separate runs its solver as a declared ladder that its hint shares

Separate's solver SHALL run on `runDeductionFixpoint` as three tier-0 techniques,
in order: `shared-letter` (two adjacent components already holding a common letter
are disconnected, and every edge between them walled), `walled-apart` (an open
edge between two disconnected components is walled), and `only-way` (an under-size
component with exactly one legal neighboring square merges with it, marking the
edges between them "no wall"). The working state SHALL carry the same facts as
border-grid bytes, so the generator and the hint run the same techniques on the
same state. The ladder SHALL generate exactly the boards upstream's loop did, and
a firing census over generator runs SHALL assert that every technique fires. The
hand-written loop the ladder replaced SHALL NOT be kept once the adoption is
proved; git holds it.

#### Scenario: The ladder moves no board

- **WHEN** the generator runs on the ladder
- **THEN** the frozen differential's descs are unchanged
- **AND** the firing census over generator runs, which keep one scratch across letter refills, reaches every rung
