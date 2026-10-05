## 1. Read

- [x] 1.1 For every hinted game, read where a step is built and say whether a
      stable rung id is in hand there. It was, in every game: a reason or
      firing `kind`, or the branch of a non-deductive hint. The answer is the
      code, `Game.hintRungs` in each game, and no table is kept beside it.
- [x] 1.2 Take the consumers: the pins (`describeHintPins` kinds), the
      narration ledger, `hintUntil` predicates, and test code that picked a
      step by matching its sentence.
- [x] 1.3 Decide where the id rides: on `HintStep` (design D1).

## 2. Build

- [x] 2.1 The field and its type, on Pegs (a branching hint) and Towers (the
      candidate walk) first. Galaxies followed with the rest; the proposal
      named it as the second, and the candidate walk was the harder case.
- [x] 2.2 `describeHintPins` takes a pin for every rung, and a rung with no
      pin does not compile; `describeHintKindPins` for a file's further
      positions; `HintKind` takes no `RegExp`.
- [x] 2.3 The narration ledger lists rungs, taken from the guard's own walk;
      `hintUntil` predicates key on the rung.
- [x] 2.4 The rest of the games.

## 3. Close

- [x] 3.1 `docs/games/hints.md` § "Name the rung a step speaks" and
      `testing.md` § "Pinning a hint's positions"; `AGENTS.md` § "Method"
      keeps the rule.

## Found on the way

- Mines: after click, undo, save and load, the hint asked to open `(-1,-1)`.
  Fixed here, with a test that fails without the fix.
- Guess: "The outlined slot account for all 1 peg". Fixed here.
- Salad: the hint throws on a Normal Number Ball board its generator deals.
  Not fixed here: `fix-salad-number-ball-hint-throw`.
