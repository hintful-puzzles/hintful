## Why

The rest of stage 2 of the route (`describe-the-whole-catalog`, task 1.2):
the candidate-note games that `born-candidate-note-family` left for its
successor when its gap list split the family (its design.md § "Decisions"
7). The first six (Unequal, Adjacent, Keen, Towers, Mathrax, Seismic) built
the notes layer, the board of numbers, the candidate walk from a
description and four clue universes (edges, parts, slots, corners) with a
partition dealt before the answer. The nine left stand on those pieces, and
each is still hand-written.

## What Changes

The nine move onto their descriptions, one commit a game, in the order this
change's gap list (task 1.1) sets from its predecessor's. At filing
(2026-11-23), lines of TypeScript, tests excluded, as the predecessor's gap
list read them at `153e4cf43`:

| Game | Lines | Stands on |
|---|---|---|
| Solo | 3,780 | Keen's parts and block structure, Seismic's divided partition |
| Salad | 3,545 | Towers' slots, the alphabet past 9 |
| Group | 2,516 | the alphabet; its own header drag (§ Open Questions) |
| ABCD | 2,334 | a clue per value at a slot |
| Undead | 3,353 | slots seen through mirrors, done marks at slots |
| Magnets | 3,423 | edges, a domino partition, notes of its own |
| Rome | 2,871 | arrows as a value a cell, areas grown |
| Crossing | 3,923 | a list of numbers at the board |
| Map | 3,468 | a space whose cells are a partition's parts |

The gap list (design.md, 2026-11-23) split the nine again: this change
moves Solo, ABCD, Salad and Group, the Latin squares of numbers or letters,
and its successor, filed at its archive, moves Undead, Rome, Magnets,
Crossing and then Map, whose space of parts it builds itself.

Saves of every moved game break, pre-approved by the owner for the whole
initiative (`docs/descriptions.md`). Game IDs and links keep loading.

## Capabilities

### New Capabilities

None expected: each extends `described-fill-game`.

### Modified Capabilities

- `described-fill-game`, for each capability a flip adds.
- `engine-notes` and `engine-candidate-hints`, where the fill board takes
  over what each game wired.
- Each moved game's own spec, where the born game differs.

## Impact

- `src/engine/fill/`, `src/describe/`, `src/engine/hint/`.
- `src/games/<game>/` for each game moved; the `game-lines` ceiling falls
  by each game's lines.
- Saves of the moved games break.
