## ADDED Requirements

### Requirement: The family chips give way to a search

While the home screen's search box holds text, the home screen SHALL show no family chip other than the pressed one, and SHALL show every family chip again once the box is empty.

On a phone the chips wrap to several rows between the box and the list, and
with the keyboard up they are what a player sees in place of the results. A
family's label is in what the search matches, so nothing is out of reach
while they are away. The pressed chip stays because it is still narrowing the
list, and a narrowing with no control on screen cannot be undone.

#### Scenario: Typing lifts the list to the box

- **WHEN** a player with no family chip pressed types "solo" into the home
  screen's search box
- **THEN** no family chip is shown, and the list follows the search box and
  the All / Favorites / In progress filter directly

#### Scenario: The pressed chip stays beside a search, and can be released

- **WHEN** a player presses the "Shading" chip and then types into the search
  box
- **THEN** the "Shading" chip is the only family chip shown, still pressed,
  and the list is narrowed by both
- **AND** pressing it releases the family, removes the chip, and leaves the
  focus in the search box

#### Scenario: Clearing the box brings the chips back

- **WHEN** the player empties the search box
- **THEN** every family chip is shown again
