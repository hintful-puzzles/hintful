## REMOVED Requirements

### Requirement: Bridges renders islands, bridges, marks and the win flash

**Reason**: Its scenario "A drag over an empty span draws no line" states the
behavior this change ends: a drag now draws the bridge its release would
leave.

**Migration**: Replaced by "Bridges renders islands, bridges, marks, a drag's
preview and the win flash", which keeps the cursor scenario unchanged.

## ADDED Requirements

### Requirement: Bridges renders islands, bridges, marks, a drag's preview and the win flash

The renderer SHALL draw islands as circles bearing their count, bridges, the
no-line and completed-mark indicators, the keyboard cursor as a wash on its
island's face, and the win flash. While a drag points at an island it SHALL
recolor the two islands' rims and draw the span between them as the release
would leave it, in the same color, derived from the move the release plays.
A drag that points at no island SHALL recolor its own island's rim alone.

#### Scenario: The cursor is on the island's face

- **WHEN** the keyboard cursor is shown on an island that has no error
- **THEN** that island's face is the cursor wash, and its rim and count stay in
  ink

#### Scenario: A drag over an empty span previews the bridge

- **WHEN** a drag from an island points at an in-line neighbor across a span
  that carries no bridge, and has not been released
- **THEN** the rims of the two islands are recolored and one bridge is drawn
  between them in the same color

#### Scenario: A drag that would remove shows the span empty

- **WHEN** a drag points along a span that carries as many bridges as its
  limit allows
- **THEN** no bridge is drawn on the span while the drag points there, and
  the bridges are drawn again in ink if the drag turns away

#### Scenario: A secondary drag previews the limit it would write

- **WHEN** a secondary drag points along a span with no limit on a `maxb = 2`
  board
- **THEN** `≤1` is drawn mid-span in the drag's color, and along a span
  already limited to one with no bridge the pair of crosses is drawn instead

#### Scenario: A drag that turns leaves no trail

- **WHEN** a drag that pointed at one island turns to point at another
- **THEN** the first span is drawn as the board has it and the second carries
  the preview
