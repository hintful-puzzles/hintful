## ADDED Requirements

### Requirement: Mark-all holds a slot in the phone bar in every game that has it

In a game whose `canMarkAll` is true, the phone's bottom bar SHALL offer the
mark-all command as a slot of its own, between the hint and Check & save. It
stays in the sheet behind `More…` as well, because the bar is a promotion out of
that sheet. In a game without mark-all the slot is absent, not disabled.

The caption is the rail row's wording cut to fit a sixth slot: **Fill marks**
while no cell carries a pencil mark, and **Update marks** once one does, because
from then on the press also narrows marks the placed values have ruled out.

The owner asked for this after playing Solo on a phone (2026-09-24): in a
pencil-marks game this command turns a board of placed digits into candidates
to reason from, and two taps through `More…` was too far for something used
that often.

A sixth slot may not cost the bar its fit. When the bar is squeezed, a caption
wraps onto a second line inside the button's row rather than overflowing onto
its neighbor, and the hint gives up width last.

#### Scenario: A game with mark-all

- **WHEN** the phone chrome renders for a game whose `canMarkAll` is true
- **THEN** the bottom bar contains the `mark-all` command
- **AND** the sheet behind `More…` still contains it

#### Scenario: A game without mark-all

- **WHEN** the phone chrome renders for a game whose `canMarkAll` is false
- **THEN** the bottom bar contains no `mark-all` command

#### Scenario: Six slots with the hint armed on a narrow phone

- **WHEN** a mark-all game shows its phone bar at 360 CSS pixels or wider
- **AND** the hint button reads "Apply the hint" and mark-all reads "Update marks"
- **THEN** the bar does not overflow horizontally, and no caption runs over a
  neighboring button
