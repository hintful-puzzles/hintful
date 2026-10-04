## 1. Build

- [ ] 1.1 `scripts/hint-scan.mjs` and the `npm run hint-scan` entry, in the
      build-side project so the typechecker sees it.
- [ ] 1.2 Keep a hand-kept pin on "not found"; any indent; several blocks.
- [ ] 1.3 The harness reports an empty pin in scan mode and does not throw
      at collection.
- [ ] 1.4 Prove each on a planted case: a kind with no pin, a block inside a
      `describe`, a kind the scan cannot reach.

## 2. Close

- [ ] 2.1 The failing pin's message names the new command.
- [ ] 2.2 `docs/games/testing.md` § "Pinning a hint's positions" and
      `AGENTS.md` § "Build commands".
