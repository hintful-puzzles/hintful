## 1. Split

- [x] 1.1 Re-measure; list each file's seams from reading it, and any file
      that has grown past these since. (2026-11-20: the five match the
      table within 13 lines, and no other file has passed them. A split
      follows the call graph's strongly connected components, since
      `module-layering.test.ts` refuses a runtime import cycle; a component
      stays one module, as `compile-expr.ts` does.)
- [x] 1.2 Split one file per commit, the export surface unchanged; verify by
      the diff's shape (moves, not edits) as well as the suite.
  - [x] `compile.ts`, `describe-runtime.ts`: whole statements moved.
  - [x] `puzzle-screen.ts`: its styles and its hint words
        (`hint-spans.ts`) moved out. Its dialog launchers stay: the
        saved-game flows read and write the screen's private saved-game
        state, and moving ~160 lines out would mean exposing that state.
  - [x] `puzzle.ts` and `midend.ts` are each one class, so no statement
        moves whole; their split is collaborator classes, each owning its
        fields, the public surface unchanged. `Puzzle` (1,517 → 1,305
        lines): `Checkpoints`, `DealWait`, `HintPresentation`. `Midend`
        (2,998 → 2,611): `ChosenParams`, `Preferences`, `MoveAnimation`,
        and the save written and read as functions (`midend-save.ts`, with
        `Restart` and the run record), since a save owns no field.
        Declined, 2026-11-20: the hint section (~650 lines) and the
        timer. Every hint method reads and writes the history, position,
        `Ui`, overlays and transitions (`commitMove`, `afterTransition`,
        `emitStatusBar`), so a collaborator would need a back-reference to
        the whole midend: a file split with no ownership behind it. The
        timer's elapsed time is a third of the run record a restart swaps,
        and its tick is one line beside the animation's. The palette's
        two methods are already one-line delegations. The probe's new
        modules name `testedVia: midend.ts`, since the midend's tests are
        theirs; the six moved cases are all caught.
- [x] 1.3 Run `feedback-probe.mjs --verify` after each move of engine code.

## 2. Finish

- [x] 2.1 Guides cite the new files. Run the app once for the shell files
      (done for `puzzle-screen.ts`: the styles and a hint's words render;
      for `Puzzle`: a hint's show, explain, reference flash and apply on
      Net; for `Midend`: Fifteen's slowed hint slide mid-flight, the timer
      preference off and on, and a reload restoring the board and its
      time). Commit, push, archive.
