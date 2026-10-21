## REMOVED Requirements

### Requirement: Params: The size bound is measured, per mode, and says why

**Reason**: Neither mode has a size bound: a size is not refused for its
rarity or its wait (`engine-difficulty`, "A rare tier is dealt under the
deadline"), and neither bound rested on a board that cannot exist.

**Migration**: None. Every size is dealt, and the deadline answers one that
finds no board in time.

### Requirement: Params: Tectonic's bound is what can be reached

**Reason**: Tectonic has no bound. Measured 2026-10-20 under the deal's
deadline, a 14×14 is dealt in 86 s.

**Migration**: None. A size past 100 cells is dealt.

### Requirement: Params: Seismic's bound is what is possible

**Reason**: The bound rested on deal times and on the fill's failure rate,
not on a board that cannot exist. Measured 2026-10-20 under the deal's
deadline, a 9×9 is dealt in 15 s and a 9×10 in 90 s, while a 10×10 gave up
on four deals of four; the deadline answers that.

**Migration**: None. A size past 64 cells is dealt.

### Requirement: Params: Seismic's two bounds bind a board being dealt only

**Reason**: There are no bounds left to bind.

**Migration**: None. A board that arrives with its description opens at any
size, as before.

## MODIFIED Requirements

### Requirement: Params: A preset is never a long wait

A preset SHALL NOT be a size whose worst observed run is a long wait: it is
offered to everyone who opens the Type menu, so a long generation there is a
wait nobody chose, whereas a Custom size is a wait the player asked for, and
a slow Custom size SHALL be accepted. Every preset SHALL be no larger than
`MAX_PRESET_CELLS`, the largest area whose worst observed run is short, in
either mode, and a test SHALL assert this.

#### Scenario: A size whose worst case is a long wait is kept out of the menu

- **WHEN** presets are enumerated
- **THEN** none of them is a size whose generation tail runs to tens of seconds,
  whatever the Custom dialog admits

#### Scenario: The largest preset may take a moment

- **WHEN** an 8×8 preset is dealt, in either mode
- **THEN** it is offered, though its slowest deal is seconds and not an instant,
  since no observed deal of that area is a long wait
