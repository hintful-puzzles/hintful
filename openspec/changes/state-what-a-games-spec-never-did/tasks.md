# Tasks

The method is that of `2026-10-09-regroup-the-specs`: one agent writes a
game's missing requirements from the code and a second reads them against
the code. Its `doubts-brief.md` and `design.md` § "How it was carried out"
say how the files were owned and checked.

## 1. The census

- [x] 1.1 For every registered game, what its spec owes and whether it is
  there: the description format (`parseDesc` and what writes one), the params
  encoding (`paramsCodec` or `encodeParams`), each preference key (`prefs`),
  the controls (`targetVerbs`, `interpretMove` and the help page's Controls
  section), and for a hinted game its rungs (`hintRungs`) and their order.
  Derive the population from the registry; do not start from the list in
  `proposal.md`. Check: every item of that list is found by the census, or
  the census is wrong.
- [x] 1.2 Record the count of gaps by kind in `design.md`, with the date.

## 2. The requirements

- [x] 2.1 Description formats and params encodings first. Each requirement
  states the format as the parser reads it, with a scenario that gives a real
  description or params string and what it means, taken from a test or a
  dealt board and not composed.
- [x] 2.2 Preference keys, controls, hints and the words a player reads.
- [x] 2.3 A second agent reads every requirement against the game's code and
  its help page, and runs any string a scenario quotes through the game.
- [x] 2.4 Where the code and the help page disagree, the defect is recorded
  and the requirement states what the code does. Recorded in `found.md`,
  from each game's `census/<game>.md`; where the code was the one at fault
  the requirement states the intended rule (`design.md` § "Requirements the
  code does not meet yet").

## 3. Close

- [x] 3.1 `docs/games/README.md` § on a game's spec says what one holds, if
  it does not.
- [x] 3.2 Remove `skip_specs`, validate, the gate, commit, push, archive.
