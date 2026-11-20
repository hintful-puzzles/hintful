## Why

`architectural-review` item 2 (owner's go-ahead for the obvious items,
2026-11-20). For several concerns the engine already has the shared helper,
and only some games use it. Measured at `9faabdf61` with
`git grep -l -E '<helper>\(' -- 'src/games/*/*.ts' ':!*.test.ts' | cut -d/ -f3 | sort -u | wc -l`:

| Concern | Helper | Users | Hand-written |
| --- | --- | --- | --- |
| Params encode and decode | `paramsCodec` | 41 | 24 |
| Mistakes found by comparing with the answer | `entryMistakes` / `clearEntries` / `revealEntry` | 15 | 31 `findMistakes` |
| Solve from the answer | `solveFromAnswer` | 18 | 46 `solve` |
| Desc differential tests | `describeDescDifferential` | 38 | 8 hand-rolled |
| Click and keyboard input | `interpretTargetVerbs` | 31 | 34 |

A porter meets two ways to do one thing, and a fix to a helper misses the
holdouts. The doctrine's measure is one obvious way.

## What Changes

- One concern at a time, in the order above. Each holdout either moves onto
  the helper or, where its shape genuinely differs, keeps its own form with a
  comment saying why. The helper is widened first where the holdouts share a
  shape it lacks.
- **Params encodings stay byte-identical.** An encoding is a game ID, so
  every preset's encoding and every desc that loads today keeps loading
  (`params-stability.test.ts`, `upstream-descs.test.ts`).
- `validateParams` bodies that only restate `paramConfig`'s bounds are
  derived from it where the codec can. The repeated
  `solveAtCap: (p, desc, cap) => solveX(newState(p, desc), cap)` (29 games)
  becomes a default where it fits.
- Target verbs go last, and only for games whose input is "aim at a target,
  apply a verb". Sorting the 34 holdouts by input shape is that step's first
  task. Planning games (Untangle, Sokoban, Fifteen) are expected to stay as
  they are.
- No player-visible change: same moves, same mistakes shown, same IDs.

## Impact

The holdout games' `state.ts`, `index.ts` and `solver.ts`; `params-codec.ts`,
`entry-mistakes.ts`, `answer-search.ts`, `target-verb.ts` where a helper
widens; `docs/mechanics.md` and `docs/engine-catalog.md` where they describe
the older forms.
