## ADDED Requirements

### Requirement: Group's table order and subgroup lines have keyboard routes
Every change Group's pointer makes to the table's arrangement SHALL also be reachable by the keyboard alone:

- Shift+Left or Shift+Right SHALL move the element of the cursor's column one place along the order, and Shift+Up or Shift+Down the element of its row, making the same move as dragging that heading one place; the cursor SHALL stay on its element. On a hidden cursor the first such press SHALL only show it.
- `|` SHALL toggle the subgroup line after the cursor's column, and `-` the line below its row, making the same move as clicking between the two headings; at the last column or row there is no line, and the key SHALL do nothing.

#### Scenario: Shift+Right moves a column as dragging its heading does
- **WHEN** the cursor shows on a column and the player presses Shift+Right
- **THEN** the move is the one dragging that column's heading one column right makes

#### Scenario: `|` toggles the line a click between headings toggles
- **WHEN** the cursor shows on a column and the player presses `|`
- **THEN** the move is the one clicking between that column's heading and the next makes
