## MODIFIED Requirements

### Requirement: Mosaic's hint says a comparison of two numbers

A hint step that compares two numbers SHALL name both by their values, and by
where each sits where the values are equal. It SHALL circle each number,
outline each number's block whole, and ring the squares it decides, which
only one of the two counts. A step that shades SHALL say how many more the
first needs than the second and that it has only that many empty squares
outside the second's block. A step that clears SHALL say that both need the
same.

#### Scenario: The ringed squares belong to one block only

- **WHEN** a step that shades by comparison is shown
- **THEN** every ringed square is in the first number's block and outside the
  other's, and both blocks' perimeters are drawn

#### Scenario: Two 7s side by side

- **WHEN** a step compares two 7s in one row
- **THEN** it says "The left 7 still needs 2 more purple squares than the
  right 7, and only 2 of its empty squares are outside the right 7's block, so
  these squares must be purple.", or the same with left and right exchanged

### Requirement: One Mosaic number alone settles its block

A number whose block already holds as many shaded squares as it counts SHALL
make every empty square of the block clear. A number whose block holds only
as many squares that are not clear as it counts SHALL make every empty square
of the block shaded. The hint step SHALL circle the number, outline its block
and ring the squares it decides, and SHALL say of a 0 that it allows no shaded
squares and of a number equal to its block's size that it needs all of them.

#### Scenario: The three sentences of a small board

- **WHEN** the hint's plan is read on the 3×3 board `d7a2a4`
- **THEN** it says "This 4 needs all 4 of its squares purple, so these squares
  must be purple.", then "This 2 already has its 2 purple squares, so these
  squares must be clear.", then "This 7 needs 7 purple squares, and only 7 of
  its squares are not clear, so these squares must be purple."

#### Scenario: A number on a shaded square

- **WHEN** the number a step names sits on a shaded square
- **THEN** its circle is drawn in the color of the number
