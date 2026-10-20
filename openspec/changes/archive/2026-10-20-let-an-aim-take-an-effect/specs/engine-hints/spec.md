## MODIFIED Requirements

### Requirement: A subgoal prefixes any form of sentence

A subgoal SHALL prefix any form as "Working on A:", or as "Working on A," where
the words after it open on a sentence with a colon of its own, so that no
sentence holds two colons. The *serves* relation, a move toward a subgoal,
SHALL be written by the engine as "Working on A: M.", and a subgoal with the
*effect* relation and no look as "Working on A, M: E.".

#### Scenario: A step serves a stable subgoal

- **WHEN** a game hands over a subgoal and a move with the serves relation
- **THEN** the step's words read "Working on <subgoal>: <move>."

#### Scenario: A subgoal and an effect, with no look

- **WHEN** a game hands over a subgoal, a move and an effect, and no look
- **THEN** the step's words read "Working on <subgoal>, <move>: <effect>."
