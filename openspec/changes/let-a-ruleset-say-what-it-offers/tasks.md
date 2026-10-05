## 1. Measure

- [ ] 1.1 Every `validateParams` refusal that tests the game's ruleset, in
      the games that call `rulesetItem`, with the field or value it refuses.
- [ ] 1.2 The same for modifiers, to decide whether they are in scope.
- [ ] 1.3 How the Custom dialog is built from `ConfigDescription`, and what
      it would take for a field to depend on another.

## 2. Decide

- [ ] 2.1 What a ruleset declares: fields it does not take, choices it
      narrows, bounds it sets.
- [ ] 2.2 Hidden or disabled, with the owner: what a player sees for a field
      the chosen ruleset does not take.

## 3. Build

- [ ] 3.1 The declaration, the dialog reading it, and the refusal derived
      from it.
- [ ] 3.2 Ascent first: `MODE_EDGES_OFF_GRID` removed, its four Edges
      refusals derived. Then the others 1.1 found.
- [ ] 3.3 A test that the dialog cannot submit what the refusal would
      refuse, seen red.
