## MODIFIED Requirements

### Requirement: Controls: Wordtrail's dictionary lists the words the board can spell

Wordtrail's reference SHALL be titled "Dictionary" and list every common
word of each length the board asks for, A to Z under letter headings, a
group a length, whether or not a trail on the board spells it: placed where
a drawn piece spells it, outstanding where a trail of it still fits the
player's lines and crosses, and ruled out otherwise. It SHALL ask for a
search box, with a "Fits" filter for outstanding words and "Found" for
placed ones. Selecting a word SHALL spotlight the letters of its trails that
still fit, until the board is touched.

#### Scenario: A word no trail spells

- **WHEN** the board asks for four-letter words and no trail spells ABLE
- **THEN** ABLE is listed in the "4 letters" group, ruled out, and hidden
  under "Fits"

#### Scenario: A crossed edge rules a word out

- **WHEN** the only trail spelling TAN runs across an edge the player has
  crossed
- **THEN** TAN is shown ruled out, and an undo of the cross shows it
  outstanding again
