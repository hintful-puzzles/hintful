# leave-the-headings-word-off-a-preset

Split out of `review-preset-counts-across-the-catalog`, which named it the
part to take first.

## Why

The Type menu of a game with rulesets has a heading for each one, and every
line under a heading began with the heading's own word: "Letters: 5x5 A~C
Easy" under "Letters", and "Ascent: 6x7 Easy" under "Ascent" in Ascent. A
line's title was the params label, and the label did not know where it was
shown.

## What Changes

- A leaf of `presetMenu(game)` has two strings. Its `title` is the menu's
  line, which under a ruleset's heading is the label without the ruleset's
  name. Its `label` is the board's whole name.
- The type header reads the `label`, so a board dealt from "5x5 Normal" under
  "Edges" is still headed "Edges: 5x5 Normal", the same as when it is reached
  through the Custom dialog.
- A game whose presets all belong to one ruleset gets no headings, and its
  lines keep the ruleset's name.
- `leafPresets` and the params corpus name a preset by its `label`, so no test
  case is renamed and the params-stability snapshot does not move.
- `params-declared.test.ts` holds, beside "no two presets share a label", that
  no two lines under one heading read the same.

## Compatibility

None. A title is not stored: a saved game and a shared ID carry params.

## What shows it worked

`puzzle-deal-orientation.test.ts` reads Seismic's menu and header through the
real midend and worker adapter. It was seen to fail with the header reading
the menu's line.
