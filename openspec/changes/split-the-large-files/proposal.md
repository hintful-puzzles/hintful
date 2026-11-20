## Why

`architectural-review` item 7 (owner accepted every item, 2026-11-20). A
session reads the part of a file it changes, and these are where a
description, hint or shell change usually leads. Measured at `9faabdf61`:

| File | Lines | Seam |
| --- | --- | --- |
| `src/describe/compile.ts` | 8,286 | type inference, expression compiler, bindings, quantifiers, geometry calls, stated text, the `call` dispatcher, technique analysis, module emission |
| `src/engine/describe-runtime.ts` | 3,428 | marks and facts, clue lists, spaces, set algebra, connectivity, rays, links, beams, kept store, rectangles |
| `src/engine/midend.ts` | 3,009 | solve, hint and check; save and load; params and preferences |
| `src/puzzle/puzzle.ts` | 1,520 | hint presentation, pending deals, checkpoints |
| `src/screens/puzzle-screen.ts` | 1,995 | dialog launchers, hint words |

Fifth in the owner's order: 8, 1, 6, 10, 7, 11, 9, after the redraw and
contract changes, which rewrite `midend.ts`'s call sites.

## What Changes

- Each file splits along its seams into modules behind the same export
  surface, so importers do not change unless a narrower import reads better.
- The feedback probe's anchors follow the moved code
  (`feedback-probe.mjs --verify`).
- No behavior change and no player-visible change.

## Impact

The five files and their directories, `scripts/feedback-probe-cases.mjs`,
guides that cite a moved function by file.
