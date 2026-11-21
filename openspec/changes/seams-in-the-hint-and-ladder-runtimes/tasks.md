## 1. Split

- [ ] 1.1 Re-measure the large files; read the two for seams (the call
      graph's components; `module-layering.test.ts` refuses a cycle).
- [ ] 1.2 Split each along a seam with ownership, one file a commit, a move
      verified by the diff's shape; or record why not.
- [ ] 1.3 `npm run probe -- --verify` after each move.
- [ ] 1.4 Re-check the declines of `compile-expr.ts` and the midend's hint
      section; record the answer.

## 2. Finish

- [ ] 2.1 The catalog cites the new files. Commit, push, archive.
