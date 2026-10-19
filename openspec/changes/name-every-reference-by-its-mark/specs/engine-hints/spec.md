## ADDED Requirements

### Requirement: A hint's reference names a thing and its mark

Every reference in a hint step's words SHALL be a noun phrase for a thing on
the board, and SHALL say which mark it is: by its role's word, by a value only
one marked thing has, by a phrase the game's legend teaches for the role, or as
"this" with a noun, or a relation to a named thing, that no other reference in
another role shares. A bare "here", "this" or "it", or a clause, SHALL NOT be
a reference. The hint-quality walk SHALL hold every bound game's steps to it.

#### Scenario: Tracks names the square it decides

- **WHEN** a Tracks step reasons that a square without track would leave its
  row short
- **THEN** its words name that square with its mark's word, so the sentence
  can be read against the board without pressing a pill

#### Scenario: The verb is outside the reference

- **WHEN** a step concludes that the squares it rings must be mines
- **THEN** its reference says "the ringed squares", and "must all be mines" is
  outside it

### Requirement: The ring's word is "ringed" in every game

A ring reference SHALL use "ringed" as its role's word in every game, the
legend's term for what a step decides, whatever shape the game draws it in.
Where the game's drawing would make "ringed" mislead, the game's legend SHALL
teach the phrase its sentences use for the mark instead.

#### Scenario: Flood's ring is dots

- **WHEN** a Flood step names the squares a fill would join
- **THEN** it names them in a phrase its ring legend contains
