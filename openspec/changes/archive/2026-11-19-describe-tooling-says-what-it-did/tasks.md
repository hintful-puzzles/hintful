## 1. No silent skip

- [x] 1.1 `describe` names a file with steps that it does not compile, and why.
- [x] 1.2 Settle `techniques: []`: accept it alone or refuse with the fix;
      document the idiom in `docs/descriptions.md`. Accepted alone: the
      parser already defaults `tiers` to `[]`, and a technique naming an
      undeclared tier is refused there.

## 2. The dev server follows the schema

- [x] 2.1 Reload the description schema in dev on change; check a help page
      after a schema edit without restarting the server. The schema was
      already a config dependency, so Vite restarts on it; the trap was a
      restart failed by a description that did not compile, which left the
      old schema. `describeFirst` now lets a restart through, printing the
      failure (planted on a dev server of my own: 500 under a schema that
      refused the game, 200 once reverted, no manual restart).

## 3. The checker and the lint say enough

- [x] 3.1 The soundness checker prints board clue fields by name.
- [x] 3.2 The length lint measures a supplied word at its longest; see it
      refuse a planted over-long Wordtrail sentence. Read from the word
      list's own lengths, so it cannot drift from the list.

## 4. Record

- [x] 4.1 Spec delta where a requirement changes.
