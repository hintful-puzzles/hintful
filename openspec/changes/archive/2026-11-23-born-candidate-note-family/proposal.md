## Why

Stage 2 of the route (`describe-the-whole-catalog`, design.md § "The
order"): the hand-written games whose player pencils candidate notes into a
cell. They are the route's largest group. The engine already shares much of
what they need: the Latin solver, the candidate hint, note-taking and
`engine/edge-clue-latin/`. None of it is on the fill board yet, so every one
of these games is still hand-written. Every one already has a description
(`produces: latin`, `numbers` or `coloring`, `freedom: { kind: fill }`)
whose ladder, rules and hint words the engine runs.

## What Changes

The candidate-note family moves onto its description, one commit a game, in
the order the gap list (task 1.1) sets. Who is in the family is read with
the query in design.md § "Context". At filing (2026-11-23), with lines of
TypeScript and tests excluded:

| Game | Lines | Note |
|---|---|---|
| Unequal | 611 | on `edge-clue-latin` |
| Adjacent | 535 | on `edge-clue-latin` |
| Keen | 1,958 | |
| Towers | 2,103 | |
| Mathrax | 2,066 | |
| Group | 2,516 | a group's table |
| Salad | 3,545 | Latin with blanks |
| Solo | 3,780 | |
| Undead | 3,353 | sent by `born-plain-cell-family` |
| Magnets | 3,423 | sent by `born-plain-cell-family` |
| Map | 3,468 | notes over colors, on regions |
| ABCD, Ascent, Crossing, Seismic | 2,334, 5,696, 3,923, 2,138 | the route's "Numbers": the gap list places each |
| Rome | 2,871 | in the route's lines group, but takes notes: the gap list places it |

The gap list (design.md § "The gap list (1.1)") split the family: this
change moves the first six, Unequal, Adjacent, Keen, Towers, Mathrax and
Seismic, which build the notes layer and the clue universes on the Latin
core; its successor, filed when this change is archived, moves Solo, Salad,
Group, ABCD, Undead, Magnets, Rome, Crossing and Map. Ascent goes to lines
and loops.

The engine gains, as the gap list finds them: candidate notes on the fill
board, which the ladder reads as facts; mark-all; the keypad; what each game's
clues need. Each capability is one another game could adopt. A game may
change in play to fit the engine, made consistent with games already moved
and never significantly worse, and its flip lists each difference. Each flip
moves the game's tests to its `<game>.cases.yaml`.

Saves of every moved game break, pre-approved by the owner for the whole
initiative (`docs/descriptions.md`). Game IDs and links keep loading.

## Capabilities

### New Capabilities

None expected: notes on the fill board extend `described-fill-game`.

### Modified Capabilities

- `described-fill-game`, for each capability a flip adds.
- `engine-notes` and `engine-candidate-hints`, where the fill board takes
  over what each game wired.
- Each moved game's own spec, where the born game differs.

## Impact

- `src/engine/fill/`, `src/describe/`, `src/engine/mechanics/`,
  `src/engine/hint/` and `src/engine/edge-clue-latin/`, which the flips may
  fold into the fill board.
- `src/games/<game>/` for each game moved; the `game-lines` ceiling falls
  by each game's lines.
- Saves of the moved games break.
