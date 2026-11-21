## 1. Census and design

- [ ] 1.1 List every live-error checker in the games (the review's query,
      then by reading `render.ts`), what each highlights, and the
      description statement it restates.
- [ ] 1.2 Design the violation: what a statement form reports on a partial
      board, how it reaches the renderer, and the soundness check for it.
      Pilot on Tents, which breaks a shape, a clue and a pairing rule.

## 2. Build and move

- [ ] 2.1 Compile violations; check them sound.
- [ ] 2.2 One engine path from violations to the live error marks.
- [ ] 2.3 Move the games in batches; each checked in the app, render
      snapshots explained where they move.
- [ ] 2.4 Plant a broken rule and see its mark appear in a game that wrote
      no checker.

## 3. Finish

- [ ] 3.1 Spec deltas; guides (`descriptions.md`, `rendering.md`).
- [ ] 3.2 Commit, push, archive.
