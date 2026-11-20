## 1. Split

- [x] 1.1 Re-measure; list each file's seams from reading it, and any file
      that has grown past these since. (2026-11-20: the five match the
      table within 13 lines, and no other file has passed them. A split
      follows the call graph's strongly connected components, since
      `module-layering.test.ts` refuses a runtime import cycle; a component
      stays one module, as `compile-expr.ts` does.)
- [ ] 1.2 Split one file per commit, the export surface unchanged; verify by
      the diff's shape (moves, not edits) as well as the suite.
- [ ] 1.3 Run `feedback-probe.mjs --verify` after each move of engine code.

## 2. Finish

- [ ] 2.1 Guides cite the new files. Run the app once for the shell files.
      Commit, push, archive.
