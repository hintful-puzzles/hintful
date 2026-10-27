## MODIFIED Requirements

### Requirement: Only a tier named Unreasonable requires Search

A tier whose boards can require Search SHALL be named `Unreasonable`, and no
other tier name SHALL require it, save a tier that keeps its one supposition
rung (`engine-hints`, "A supposition rung that defines its tier keeps it until
a markable technique fills it").

#### Scenario: A tier that can require guessing says so in its name

- **WHEN** a game's generator can emit, at a given tier, a board whose solution
  needs a propagating trial
- **THEN** that tier is named `Unreasonable`
