## ADDED Requirements

### Requirement: The recording path steps the ladder one firing at a time through the engine

The engine SHALL provide, beside the deduction-fixpoint runner, a driver that
runs the same ladder one firing per call, and a hint that records a firing at a
time SHALL use it rather than bending the runner's early-out into a stop
condition. The driver and the runner SHALL share one pass down the ladder, so
the tier cap, the restart rule and the budget cannot differ between the
solver's projection and the hint's.

Each call SHALL run the ladder from its first technique and return the
technique that fired, or nothing when no technique fires or the early-out says
there is nothing left to do. A contradiction SHALL be sticky: once a technique
proves the board inconsistent, the driver SHALL report it and SHALL run no
technique again. The step budget SHALL be required, and its attribution tally
SHALL outlive a single call, so a technique that runs away across many calls is
named.

**The driver SHALL return every firing, including one that changed nothing the
player can see.** Whether a firing is shown is the plan loop's decision, where a
hidden firing still advances the board and is counted; a driver that skipped
such firings would hide them where nothing counts them.

#### Scenario: One firing per call

- **WHEN** a hint calls the driver on a board where two techniques each have
  work to do
- **THEN** each call returns exactly one firing, restarting from the easiest
  technique
- **AND** a call after the ladder is exhausted returns nothing

#### Scenario: A firing with nothing to show is still returned

- **WHEN** a technique fires but records no move the player could make
- **THEN** the driver returns it like any other firing
- **AND** the plan loop's `showable` hides it and counts it as hidden

#### Scenario: A contradiction stops the driver for good

- **WHEN** a technique proves the board inconsistent
- **THEN** the driver reports the contradiction and returns nothing
- **AND** no technique runs on any later call
