## 1. Measure

- [x] 1.1 Per game in the table: whether every combination of its candidate
      fields is a board, read from `validateParams`, the generator and a deal
      of each combination, not from the docs. All 34 are.
- [x] 1.2 Which fields are rules a player follows and which are limits or
      givens. Done from the whole list of choices and checkbox fields and
      their `doc`s, not from every game's help page; the proposal names the
      fields left as settings and the one that is a judgment.

## 2. Decide

- [x] 2.1 The fields that become rulesets because they exclude each other.
      None: 1.1 found no two that do.
- [x] 2.2 The declaration, and what the engine builds from it. With the
      owner: the help's list and the title's words; the menu is left alone.
      Group's identity and Bridges' maximum are modifiers; Guess's blanks is
      a setting.

## 3. Build

- [x] 3.1 `engine/modifier.ts` and its consumers.
- [x] 3.2 The thirteen fields in nine games moved onto it, and their help.
