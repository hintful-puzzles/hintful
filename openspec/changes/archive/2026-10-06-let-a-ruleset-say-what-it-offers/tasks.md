## 1. Measure

- [x] 1.1 Every `validateParams` refusal that tests the game's ruleset, in
      the games that call `rulesetItem`, with the field or value it refuses.
- [x] 1.2 The same for modifiers, to decide whether they are in scope: two of
      the shape, filed as `let-a-modifier-say-what-it-leaves`.
- [x] 1.3 How the Custom dialog is built from `ConfigDescription`, and what
      it would take for a field to depend on another.

## 2. Decide

- [x] 2.1 What a ruleset declares: the choices it leaves of a field and the
      value it fixes a checkbox at. A bound on a number is declined.
- [x] 2.2 Hidden or disabled, with the owner: disabled.

## 3. Build

- [x] 3.1 The declaration, the dialog reading it, and the refusal derived
      from it. The help's sentence too.
- [x] 3.2 Ascent: `MODE_EDGES_OFF_GRID` removed, three of its four Edges
      refusals derived. The fourth, and Seismic's, Unequal's and Salad's, bind
      a typed number and stay.
- [x] 3.3 A test that the dialog cannot submit what the refusal would
      refuse, seen red (`ruleset-only.test.ts`).
