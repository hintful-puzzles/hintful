## MODIFIED Requirements

### Requirement: A cross-game guard bounds its cost on the axis the game varies

Where a cross-game guard walks a game's presets, it SHALL slice them on the axis
that game actually varies, and it SHALL derive any cost exemption from a
property the game already has rather than from a list of game ids.

A hint that plans by **searching** pays for board size twice over — one full
search per move, and more moves to make on a bigger board — while a guard that
recomputes a hint after every move multiplies exactly that. Such games SHALL be
sliced by board size in the gate and walked in full in the slow tier, with the
population derived from the game's own source (`SEARCH_PLANNING_GAMES` reads
each game for a call to the shared slide planner) rather than declared.

Which games the hint-resume walk excuses its completion promise is a separate
population, `SEARCH_REACH_GAMES`: the games whose own code names
`SEARCH_OUT_OF_REACH`, the refusal that admits a search ran out. A game may
search without the slide planner, and keying the excuse on the planner left
such games unexcused.

The reason a member is excused, and the test that still covers its largest
board on every commit, SHALL be recorded **per member**, with the derivation
asserted to be exactly the ledger — so a game that later joins the mechanic
fails the guard until someone writes that sentence.

#### Scenario: A game joins the searching-hint population

- **WHEN** a new game's hint calls the shared slide planner
- **THEN** it is enrolled by the derivation automatically, and the ledger's
  equality assertion fails until its entry names what covers its largest board
- **BECAUSE** an exemption roster rots exactly as quietly as the membership
  roster it replaced

#### Scenario: A game that searches without the slide planner may refuse past its reach

- **WHEN** a game's hint can say `SEARCH_OUT_OF_REACH` from a search of its own
- **THEN** the hint-resume walk excuses it by the same derivation, and its ledger
  entry is required before the guard passes
