## 1. Split

- [x] 1.1 Re-measure; list each file's seams from reading it, and any file
      that has grown past these since. (2026-11-20: the five match the
      table within 13 lines, and no other file has passed them. A split
      follows the call graph's strongly connected components, since
      `module-layering.test.ts` refuses a runtime import cycle; a component
      stays one module, as `compile-expr.ts` does.)
- [ ] 1.2 Split one file per commit, the export surface unchanged; verify by
      the diff's shape (moves, not edits) as well as the suite.
  - [x] `compile.ts`, `describe-runtime.ts`: whole statements moved.
  - [x] `puzzle-screen.ts`: its styles and its hint words
        (`hint-spans.ts`) moved out. Its dialog launchers stay: the
        saved-game flows read and write the screen's private saved-game
        state, and moving ~160 lines out would mean exposing that state.
  - [ ] `puzzle.ts` and `midend.ts` are each one class (`Puzzle`, 1,377
        lines; `Midend`, 2,623 lines and ~60 private fields), so no
        statement moves whole. Their split is collaborator classes, each
        owning its fields, which the class holds and delegates to, its
        public surface unchanged. `Puzzle`: checkpoints (`_checkpoints`,
        `checkpointsLeft`, `boardSerial`, follow and purge), the pending
        deal (`_dealPending`, `dealsAsked`, `dealStoppable`, `_dealWaited`,
        `dealLastMs`), hint presentation (flash, marks, explanation).
        `Midend`: params and preferences (custom params, prefs, palette,
        size), then save and load; the hint section reads most of the core
        state, so weigh it last. `scripts/stryker.config.mjs` names
        `midend.ts` as a mutation target, and `feedback-probe-cases.mjs`
        anchors in it.
- [ ] 1.3 Run `feedback-probe.mjs --verify` after each move of engine code.
      (Done after the two moves so far.)

## 2. Finish

- [ ] 2.1 Guides cite the new files. Run the app once for the shell files
      (done for `puzzle-screen.ts`: the styles and a hint's words render).
      Commit, push, archive.
