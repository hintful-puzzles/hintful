# Tasks

- [x] 1 Measured: which games drop a shifted key they take bare, and which
      read Shift on a key that is not an arrow (the proposal has the figures).
- [x] 2 Tests in `src/engine/midend.test.ts`, seen to fail first: a declined
      shifted key is offered bare; a game that reads Shift is asked once; a
      declined Shift+arrow stays declined; Ctrl is kept.
- [x] 3 `withoutShift` in `pointer.ts`, and the second offer in
      `Midend.interpret`.
- [x] 4 `docs/games/input.md` says where Shift goes.
- [x] 5 Seen in the app: Shift+D and Shift+L in Guess, in notes mode and out.
- [x] 6 Committed, pushed and archived.
