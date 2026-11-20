## MODIFIED Requirements

### Requirement: Controls: A Netslide arrow slides its line toward its own edge

A left click in the gutter left of a row SHALL slide the row left, and one
right of it right; above a column up, and below it down. The right button
SHALL slide the other way. Netslide SHALL take its presses, its cursor and its
select keys from its `targetVerbs` declaration (`engine-input`, "The engine
owns a declaring game's press and select keys"), so Enter slides as the left
button does and Space as the right button does.

#### Scenario: The arrow left of a row

- **WHEN** the player left-clicks the gutter left of a row
- **THEN** every tile of the row moves one place left and its leftmost tile
  comes back at the right end

#### Scenario: Space at the arrow left of a row

- **WHEN** the cursor shows on the arrow left of a row and the player presses
  Space
- **THEN** the row slides one place right, as a right-click there slides it
