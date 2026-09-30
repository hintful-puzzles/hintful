# Tasks

- [x] Find the file that leaves the real module in the worker's graph
      (`help-command-links.test.ts`, `puzzle-command-homes.test.ts`), and
      reproduce by forced order under one worker
- [x] Check the other `vi.mock` user for the same exposure (`errors.test.ts`:
      reproduced behind `puzzle-worker-start.test.ts`)
- [x] Replace the mocks in `puzzle-screen.test.ts` and `errors.test.ts` with
      spies on the real exports, restored after each test
- [x] Replace the vacuous "writes no autosave" test with an assertion in the
      test that drives the real handler; show it fails with a move made
- [x] Replace `no-duplicate-module-mocks.test.ts` with `no-module-mocks.test.ts`;
      show it fails on a planted `vi.mock`
- [x] Repoint `vitest.config.ts` and `puzzle-command-homes.test.ts` comments
- [x] Spec delta: REMOVED the one-mocker rule, ADDED "No test file mocks a module"
