## MODIFIED Requirements

### Requirement: A named color's name is true

Where a color is referenced by name and not by meaning, its name SHALL
describe the color as a player would, in every color scheme. A color whose
value in a scheme a player would call something else SHALL carry that
scheme's word beside its value, and a sentence SHALL say the word of the
scheme it is shown in. A text shown alike in every scheme SHALL name only a
color that has one word.

#### Scenario: A hint names a color

- **WHEN** a hint's explanation refers to a color by name
- **THEN** the word is the one for the scheme in force, and the color is
  recognizably that word in it

#### Scenario: A scheme restyles a named color

- **WHEN** a scheme gives a named color a different value
- **THEN** the value is a different shade of the same color, or the color
  carries that scheme's word for it
- **AND** every explanation that names it is still true

#### Scenario: A dark value leaves its light word

- **WHEN** a hint names Map's yellow and pink regions on a dark board
- **THEN** it calls them brown and maroon, which is what they are drawn as

#### Scenario: The scheme changes under a hint

- **WHEN** the player's scheme changes while a hint is shown
- **THEN** the explanation is re-worded in the new scheme's words, without
  the hint being asked for again

#### Scenario: One text for every scheme

- **WHEN** a help page, a control's description or a hint's refusal names a
  color whose words differ by scheme
- **THEN** it is refused rather than shown in one scheme's words
