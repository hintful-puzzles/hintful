## MODIFIED Requirements

### Requirement: A plain left-click chords without a false-uncover preview

A left-click on a number SHALL chord (clear around it when its flags are satisfied).
The 3×3 mouse-down "pressed" preview is drawn identically to opened cells, so it
SHALL be shown exactly where the release will chord: while the left button is
held on a number whose flags are all placed, having been pressed on a number. On a
not-yet-satisfied number it would flash a false uncover that reverts on release,
and it SHALL NOT be shown there, nor while a press that opens a covered square is
dragged over a number. A left-press over a covered square SHALL keep its
single-cell "about to open" highlight. There is no separate chord button: the
left click chords wherever chording applies, for a mouse and a finger alike.

#### Scenario: Clicking a not-yet-satisfied number

- **WHEN** the player presses the left button on a number whose mines are not all flagged
- **THEN** no 3×3 preview appears, so nothing looks uncovered and nothing re-covers on release

#### Scenario: Pressing a number with all its flags previews the chord

- **WHEN** the player presses the left button on a number whose flags are all placed
- **THEN** the 3×3 around it shows as pressed, and releasing there opens the unflagged squares
