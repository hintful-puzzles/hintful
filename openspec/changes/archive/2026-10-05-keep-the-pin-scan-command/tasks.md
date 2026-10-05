## 1. Build

- [x] 1.1 `scripts/hint-scan.ts` and the `npm run hint-scan` entry, in the
      build-side project (`tsconfig.node.json`) so the typechecker sees it.
- [x] 1.2 Keep a hand-kept pin on "not found"; any indent; several blocks. The
      block is found by parsing the file, not by its indent.
- [x] 1.3 The harness hands a stand-in for a pin that does not load while a
      scan runs, so a read in a `describe` body does not stop collection.
- [x] 1.4 Proved on planted cases in `pegs-hint.test.ts`: a rung with no pin
      read in a `describe` body (an ordinary run fails at collection with the
      command; the command pins it), a stale pin (pinned again), a kind the
      scan cannot reach (`trapSoonOwn`, kept by hand and named), and a file
      with no scan (fails saying so).

## 2. Close

- [x] 2.1 The failing pin's message names the new command.
- [x] 2.2 `docs/games/testing.md` § "Pinning a hint's positions" and
      `AGENTS.md` § "Build commands".
