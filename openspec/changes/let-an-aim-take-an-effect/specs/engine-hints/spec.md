## MODIFIED Requirements

### Requirement: A subgoal prefixes any form of sentence

A subgoal SHALL prefix any form as "Working on A:". The *serves* relation, a
move toward a subgoal, SHALL be written by the engine as "Working on A: M.".
A subgoal with the *effect* relation and no look SHALL read as one sentence
with one colon.

#### Scenario: A step serves a stable subgoal

- **WHEN** a game hands over a subgoal and a move with the serves relation
- **THEN** the step's words read "Working on <subgoal>: <move>."

#### Scenario: A subgoal and an effect, with no look

- **WHEN** a game hands over a subgoal, a move and an effect, and no look
- **THEN** the step's words hold one colon, and name the subgoal, the move
  and the effect
