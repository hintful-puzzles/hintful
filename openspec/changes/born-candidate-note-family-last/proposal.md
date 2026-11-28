## Why

The last of stage 2 of the route (`describe-the-whole-catalog`, task
1.2): the five candidate-note games `born-candidate-note-family-rest`
left for its successor when its gap list split the nine (its design.md §
"Decisions" 1). That change moved the Latin squares (Solo, ABCD, Salad,
Group); these five need what none of those did: notes on painted values
(Undead, Rome), a clue at the board (Undead, Crossing), whole-part moves
and marks (Magnets), and a space whose cells are a partition's parts
(Map). Each is still hand-written.

## What Changes

The five move onto their descriptions, one commit a game, in the order
this change's gap list (task 1.1) sets, Map last. Its predecessor's gap
list, read at `0b0727c9d` (its design.md § "The gap list (1.1)", in the
archive), is the start: the four flips since built some of what it names
new (the walk with no region, a clue per value in a margin, letters, slot
orders, a glyph segment), so 1.1 reads it again against this tree.

Saves of every moved game break, pre-approved by the owner for the whole
initiative (`docs/descriptions.md`). Game IDs and links keep loading.

## Capabilities

### New Capabilities

None expected but Map's space of parts, which may be one.

### Modified Capabilities

- `described-fill-game`, for each capability a flip adds.
- Each moved game's own spec, where the born game differs.

## Impact

- `src/engine/fill/`, `src/describe/`, `src/engine/hint/`.
- `src/games/<game>/` for each game moved; the `game-lines` ceiling falls
  by each game's lines.
- Saves of the moved games break.
