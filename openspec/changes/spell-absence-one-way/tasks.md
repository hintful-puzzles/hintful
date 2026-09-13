# spell-absence-one-way — tasks

Not started. Read `design.md` first: D1 says what the measurement can and
cannot see, D2 holds the undecided convention and its recommendation.

## 1. Re-take the measurements before building on them

- [ ] 1.1 Re-run the census `proposal.md` describes (compiler API, declared
      return types, non-test `src/`). Check the instrument first: it must
      find `digitValue` as `| undefined`, report its file and node counts, and
      agree in direction with a line-based `git grep` written with
      `[[:space:]]` (D1). Record the re-taken table here.
- [ ] 1.2 Read the bodies of `Midend.setPreferences`, `solve`, `hint`,
      `executeHint` and `formatAsText`, and record which mean "an error, or
      nothing" and which mean "nothing to say". `proposal.md` verified only
      `setParams`, `setCustomParams`, `loadGame` and `newGameFromId`.
- [ ] 1.3 Classify every engine row by meaning — error-or-nothing,
      nothing-to-say, lookup-miss, three-state — by reading it, not by its
      name. This classification is D2's input.
- [ ] 1.4 Grep `openspec/specs/` for `| null` and `| undefined` in signatures,
      and note which requirement holds each: those are the `MODIFIED` deltas
      this change will owe.
- [ ] 1.5 Measure how many games spell the entry-key logic `keyLetter` and
      `keyDigit` share (D3), keyed on its shape.

## 2. Decide

- [ ] 2.1 Choose A, B or C (D2) and write the decision and its reason into
      `design.md` D2, including the benefit beyond consistency for each part
      kept. Read `interpretMove`'s `Move | null | UiUpdate` handling in the
      midend before choosing A.
- [ ] 2.2 Write the spec delta: an `ADDED` `ts-engine` requirement stating the
      convention and its override, plus a `MODIFIED` block for each
      requirement 1.4 found. Grep the live spec for each sentence before
      modifying it. Remove `skip_specs` from `.openspec.yaml`.

## 3. Implement

- [ ] 3.1 The contracts: `Game` and `EngineCore`, then `Midend`, the worker
      adapter and `puzzle.ts`. Let the typechecker enumerate the
      implementations; read each, do not sweep.
- [ ] 3.2 `keyLetter` and `keyDigit`: name the "clear" state (D3), extracting a
      shared helper only if 1.5 supports it.
- [ ] 3.3 `DynamicContent.addItem`: declare what it returns.
- [ ] 3.4 Helpers, to the extent task 2 chose.

## 4. Verify

- [ ] 4.1 No narration, snapshot or frozen fixture moves; no stored value's
      meaning changes (D5).
- [ ] 4.2 Verify by shape: every changed line respells an absent value,
      converts a platform `null` at a contract boundary, or names a state. Read
      the exceptions.
- [ ] 4.3 Re-read every `EngineCore` result consumer outside the engine and
      confirm each still tests truthiness (D5).
- [ ] 4.4 Run the app: an invalid game ID in the Enter Game ID dialog, an
      invalid Custom type, a corrupt save imported, and in Abcd and Crossing a
      cursor-entered value, a clear, and a key that is neither.

## 5. Keep it

- [ ] 5.1 Write the rule, its reason and its override into
      `docs/games/mechanics.md`, and link it from the section
      `type-the-absent-digit` added ("Not a digit" is outside the type).
- [ ] 5.2 Build the guard D4 describes if its exceptions can be derived; prove
      it fails on a planted signature. Otherwise say in the docs that nothing
      enforces the rule.
