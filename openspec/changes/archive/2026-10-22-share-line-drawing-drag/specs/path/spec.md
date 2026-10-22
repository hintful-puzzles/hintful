# path Specification Delta — share-line-drawing-drag

## MODIFIED Requirements

### Requirement: Controls: The keyboard draws, crosses and walks

The arrows SHALL move a cursor over the squares. Enter SHALL start a line at the cursor, the arrows SHALL carry it as a drag carries one, and Enter again SHALL draw it; Space, Escape, Backspace and Delete SHALL abandon it. Ctrl with an arrow SHALL draw or remove the line in that direction and move the cursor along it, and with Shift as well the cursor SHALL stay; Shift alone with an arrow SHALL cross out or clear that edge. A modified arrow on a hidden cursor SHALL only show it.

#### Scenario: Enter, two arrows and Enter draw a line

- **WHEN** on `4x3de:1_2_1c2e` Enter shows the cursor on the top-left 1, Enter starts a line, Down twice carries it, and Enter draws it
- **THEN** lines are drawn on edges 9 and 13
