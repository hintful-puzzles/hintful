## ADDED Requirements

### Requirement: Map offers Mark-all and the player's reading of an undotted region

Map SHALL declare `canMarkAll` and answer the `M` key with an adaptive Mark-all: while
some blank region has no dots, the press SHALL dot all four colors into every such
region and change no other; once none is left, it SHALL remove from each blank region
the dots of the colors its neighbors show, keeping a region's last dot rather than
emptying it; and a press with nothing to do SHALL be no move.

Map SHALL offer the shared `hint-notes` preference through a `candidateReading` field
in its `Ui`, defaulting to `implicit` with the reason stated in `newUi`. Under
`implicit` the hint SHALL plan as the requirement "Map explains the next deduction"
states. Under `populate` the plan SHALL open with the Mark-all press's moves, the fill
and then the clean, each only when the board needs it, as one journey, and SHALL then
plan from the dotted board by the same rungs. A player move equal to a setup step's
move, such as the Mark-all press itself, SHALL complete that step.

#### Scenario: Two presses dot each region with what its neighbors leave

- **WHEN** the player presses Mark-all twice on a fresh board
- **THEN** every blank region shows as dots exactly the colors no neighbor shows, and
  a third press is no move

#### Scenario: The press never refills a region the player narrowed

- **WHEN** some blank regions carry the player's dots and others carry none, and the
  player presses Mark-all
- **THEN** only the regions with no dots gain dots, and every other region's dots are
  unchanged

#### Scenario: The populate reading opens with the press

- **WHEN** the player has chosen "Every candidate first" and asks for a hint on a
  fresh board
- **THEN** the first step dots all four colors into each blank region, the second
  continues it by removing the colors neighbors show, and pressing Mark-all while the
  first is shown completes it

#### Scenario: The implicit reading never fills

- **WHEN** a hint is requested under the default reading
- **THEN** no step adds dots to more than one region
