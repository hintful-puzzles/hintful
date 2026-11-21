## ADDED Requirements

### Requirement: Look: Subsets draws in red where the board breaks a rule

The renderer SHALL draw in the error color, always and with no mistake check
asked for (`Game.rules`), every horseshoe and every gap the board already
breaks: a horseshoe whose open end cannot hold a different set holding its
closed end's, and a gap beside which one set holds the other, drawn as a red
cross. A cell counts once its letters are all decided, and an edge is red
once its rules break whatever an undecided neighbor comes to hold.

#### Scenario: The empty set beside a gap

- **WHEN** the player clears every letter of a cell beside a gap
- **THEN** a red cross is drawn in the gap

#### Scenario: Two equal sets across a horseshoe

- **WHEN** the same set is placed on both ends of a horseshoe
- **THEN** the horseshoe is drawn red

## MODIFIED Requirements

### Requirement: Rules: Subsets flags mistakes for Check & Save

The game SHALL flag as mistakes for Check & Save: a set-value placed in more
than one cell; any
edge whose horseshoe relation, or missing-horseshoe disjointness relation, the
board already breaks, its live error; and, when the board has a unique
solution, any
letter marked or crossed out against that solution, and any
set ruled out of the cell that solution puts it in, each of which SHALL be
drawn in the mistake color.

#### Scenario: A duplicated placement is flagged as a mistake

- **WHEN** the same set-value is fully placed in two cells and mistakes are checked
- **THEN** both offending cells are reported as mistakes

#### Scenario: A wrong rule-out is a mistake

- **WHEN** a set is ruled out of the cell the unique solution puts it in
- **THEN** `findMistakes` reports that rule-out and the hint refuses

#### Scenario: A wrong letter that breaks no rule

- **WHEN** on `13RD,_,6R,_,_,_,_D,_UL,_R,12D,_,_DL,_UR,_,3U,10`, whose solution
  puts {D} in the second cell, B is marked present there and Check & Save is
  pressed
- **THEN** one mistake is reported, the B is drawn in the mistake color, and
  the board is not saved

#### Scenario: A wrong cross

- **WHEN** a letter the solution holds in a cell is crossed out there
- **THEN** `findMistakes` reports that slot, and its cross is drawn in the
  mistake color
