# Building from a description

A development tool, never part of the app: an interpreter that reads a
game's rules and techniques from its description and runs them. It was the
pilot (`openspec/changes/archive/2026-10-29-build-a-game-from-its-description/`);
the app now runs the techniques and the rules compiled
([`docs/descriptions.md`](../../docs/descriptions.md)), and the soundness
checks under `research/technique-check/` read a description through it.

The runs here are by hand and not by the gate, which compiles them
(`tsconfig.node.json`) and runs none of their tests:

```sh
npx vitest run -c research/describe/vitest.config.ts [file filter]
```

| Run | What it does |
| --- | --- |
| `speed-latin` | the generator's time per deal on every described game's presets (`SPEED_GAMES` narrows it), each run twice and the second kept: run it on two builds and compare the lines |
| `trace-latin` | every Latin game's deals and hint walks, step by step, to `TRACE_OUT`: run it on two builds of the compiled modules and diff the files |

A build to compare against is a worktree of it in the session's scratchpad,
its `node_modules` a link to this one's.

## The files

Every description lives beside its code (`src/engine/solve/latin.description.yaml`,
`src/games/<id>/*.description.yaml`); the loader, the parser and the
schema are in `src/describe/`.

| File | What it holds |
| --- | --- |
| `evaluate.ts`, `space.ts` | a formula's meaning on a board, and the library's spaces |
| `description.ts` | reading a description, and one instantiated on a dealt board |

## What the interpreter reads beyond the compiler

The syntax is [`docs/descriptions.md`](../../docs/descriptions.md) § "The
formula syntax". The interpreter also reads what the rules and the
undescribed games need: `subsets(S, k)`, `index(x, L)`, `before(x, L)`,
`nth(L, i)`, `units_of(c)`, `sight(s)`, `opposite(s)`, the
names `slots`, `edges`, `diagonals` and each named partition, and the
library predicate `latin(f, U)`. Inside a clue's `means`, `at` and `v` name
the clue's place and value.
