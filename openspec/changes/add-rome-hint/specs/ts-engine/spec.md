# ts-engine — delta

## ADDED Requirements

### Requirement: A note encoding states a cell's full candidate set

`NoteEncoding` SHALL be able to state, per cell, every note a blank cell could
carry — the set a fill-all puts there. It SHALL default to the values `1..values`,
which is the whole board's answer for a Latin game and is why the member went
unstated until a game needed a different one.

Every shared helper that fills notes SHALL read it rather than computing a
board-wide mask of its own. A game whose full set varies cell to cell SHALL
supply it, and the set it supplies SHALL agree with that game's own fill-all
move: a hint plan that populates more than the player's own control does goes on
to teach strikes on notes the player's board never had, which is precisely the
guarantee a candidate hint exists to keep.

#### Scenario: A per-cell candidate set reaches the plan's populate

- **WHEN** a candidate-elimination game whose blank cells differ in what they may
  hold (its board edges or its region sizes bound them) runs a hint plan
- **THEN** the plan's populate step fills each cell with exactly that cell's set,
  and the plan never offers a strike on a note outside it

#### Scenario: A game that says nothing is unaffected

- **WHEN** a game supplies no per-cell set
- **THEN** the populate fills every value of the note alphabet, as it did before

### Requirement: A move dialect writes the fill-all as well as reading it

`CandidateMoveAdapter` SHALL be able to build a game's fill-all move, defaulting
to the canonical `{ type: "pencilAll" }`. Every shared helper that emits a
fill-all — the lazy populate, the adaptive Mark-all press and the plan's default
setup — SHALL build it through the dialect rather than spelling the canonical
shape itself.

This closes an asymmetry rather than adding a capability: the same helpers
already *read* a fill-all through the dialect, so a game whose moves are keyed
differently could be understood by them but not spoken to by them. A game may
not rename its move discriminator to suit the engine, because the save format
replays the move log.

#### Scenario: A game whose moves are keyed differently is emitted correctly

- **WHEN** a candidate-elimination game whose `Move` union is keyed by something
  other than `type` runs a hint plan or answers the Mark-all press
- **THEN** the fill-all move emitted is the game's own, and its `executeMove`
  applies it

### Requirement: A candidate game's regions may come from a partition

The shared candidate machinery SHALL accept a game whose uniqueness regions come
from a disjoint-set partition rather than from row/column arithmetic, with no
engine change: the game supplies `regionsOf` returning each cell's member list
and whether that region holds every value once.

A region SHALL be marked as holding every value only when it genuinely must, and
for a partition that is a property of the region's **size** rather than of the
game. A region that merely forbids repeats SHALL NOT be so marked, because a
value with one home left in it is not thereby forced there.

#### Scenario: A partition-region game classifies its singles correctly

- **WHEN** a candidate-elimination game whose regions come from a partition
  reaches a placement the notes show as a hidden single
- **THEN** the shared classifier names the region that forces it, and a region
  too small to hold every value is not offered as the reason

### Requirement: A deduction over a graph is a reason, not a plan shape

A candidate-elimination game whose solver reasons over a graph — reachability,
connectivity, a cycle that must not close — SHALL express those deductions as
ordinary recorded candidate eliminations carrying a game-specific reason, rather
than as rungs of the plan's own-rungs slot. The own-rungs slot SHALL remain for a
firing whose **move** the canonical placement and strike shapes cannot express.

A premise that asserts a walk SHALL be computed and checked rather than assumed,
and SHALL be presented to the player as an ordered, numbered area so the walk is
one they can follow.

#### Scenario: A reachability deduction needs no plan extension

- **WHEN** a game's solver strikes a candidate because following it would close a
  cycle, or because it is the only candidate that can still reach a required
  cell
- **THEN** the elimination is recorded like any other, the plan narrates it from
  its reason, and the game supplies no rung of its own for it
