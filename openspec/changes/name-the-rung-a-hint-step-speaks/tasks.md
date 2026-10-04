## 1. Read

- [ ] 1.1 For every hinted game, read where a step is built and say whether a
      stable rung id is in hand there. A table in `design.md`, by reading.
- [ ] 1.2 Take the consumers by reference: who reads `step.explanation` with
      a regex, in tests and in the engine.
- [ ] 1.3 Decide where the id rides (`Sentence`, `HintStep`, or derived).

## 2. Build

- [ ] 2.1 The field and its type, on two games first (Pegs, Galaxies).
- [ ] 2.2 `describeHintPins` takes rung kinds, and a rung with no pin does
      not compile.
- [ ] 2.3 The narration ledger and `hintUntil` key on the rung.
- [ ] 2.4 The rest of the games, a family at a time.

## 3. Close

- [ ] 3.1 `docs/games/hints.md` and `testing.md` say how a new hint names its
      rungs, and `AGENTS.md` § "Method" keeps the rule.
