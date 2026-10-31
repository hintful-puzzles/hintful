# Building from a description

A development tool, never part of the app: an interpreter that reads a
game's rules and techniques from its description and runs them, to compare
what they say with what the game's code does. It was the pilot
(`openspec/changes/archive/2026-10-29-build-a-game-from-its-description/`);
the app now runs the techniques compiled ([`docs/descriptions.md`](../../docs/descriptions.md)),
and this is the reference they are compared against, and the only reader of a
description's rules.

It is run by hand and not by the gate, which compiles it
(`tsconfig.node.json`) and runs none of its tests:

```sh
npx vitest run -c research/describe/vitest.config.ts [file filter]
```

`PILOT_SEEDS=n` sets the boards dealt per params, and `PILOT_LOG=<file>`
writes a line of progress per board.

| Run | What it does |
| --- | --- |
| `answer-check` | each description's answer check on dealt boards, against the game's `status()` and `findMistakes`, and a planted defect in each clue's meaning; writes `results-answer.txt` |
| `ladder` | the stated techniques to a fixpoint at every tier cap, against the game's own solver, cell by cell, and its grade, with three planted defects; writes `results-ladder.txt` |
| `firings` | every firing of the game's recording solver, which its hint narrates, against the technique stated under the firing's rung on the same marks; writes `results-firings.txt` |
| `measure` | the stated ladder's time against the game's solver's; writes `results-measure.txt` |
| `speed-latin` | the generator's time per deal on every Latin game's presets (`SPEED_GAMES` narrows it), each run twice and the second kept: run it on two builds and compare the lines |
| `trace-latin` | every Latin game's deals and hint walks, step by step, to `TRACE_OUT`: run it on two builds of the compiled modules and diff the files |

A build to compare against is a worktree of it in the session's scratchpad,
its `node_modules` a link to this one's.

## The files

Every description lives beside its code (`src/engine/latin.description.yaml`,
`src/games/<id>/*.description.yaml`); the loader, the parser and the
schema are in `src/describe/`.

| File | What it holds |
| --- | --- |
| `bindings.ts` | each game's binding: its state read as an instance of its description |
| `evaluate.ts`, `space.ts` | a formula's meaning on a board, and the library's spaces |
| `description.ts` | reading a description, and one instantiated on a dealt board |
| `answer-check.ts` | the rules on a full board, and a search for every answer that knows only the rules |
| `ladder.ts` | the techniques run as a ladder |

## What the interpreter reads beyond the compiler

The syntax is [`docs/descriptions.md`](../../docs/descriptions.md) § "The
formula syntax". The interpreter also reads what the rules and the
undescribed games need: `subsets(S, k)`, `index(x, L)`, `before(x, L)`,
`nth(L, i)`, `units_of(c)`, `sight(s)`, `opposite(s)`, the
names `slots`, `edges`, `diagonals` and each named partition, and the
library predicate `latin(f, U)`. Inside a clue's `means`, `at` and `v` name
the clue's place and value.
