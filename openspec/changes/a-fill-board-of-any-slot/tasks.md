## 1. Design

- [ ] 1.1 Read the regions and lines groups' games (their specs and the
      upstream C in `../puzzles/`) for what their answers are, and the
      fill engine for where it assumes a cell. Per assumption: its slot
      form. Write it in design.md, with the partition's representation
      and why.

## 2. Generalize

- [ ] 2.1 The board and its slots by sort; cell games unchanged (their
      cases, snapshots and fingerprints pass).
- [ ] 2.2 Each per-cell concept per slot, a registry a commit, as
      task 1.1 orders them.

## 3. Fixtures of the new sorts

- [ ] 3.1 An edge-answer fixture, dealt, drawn, played and hinted end to
      end, and run in the app.
- [ ] 3.2 A partition fixture, the same.

## 4. Close

- [ ] 4.1 `describe-the-whole-catalog`'s design says what the regions and
      lines groups start from.
- [ ] 4.2 `npm run test:hint-sweeps`; the app run on three born games.
- [ ] 4.3 Archive. Then follow `describe-the-whole-catalog` § "0. The
      refactor first" for what comes next.
