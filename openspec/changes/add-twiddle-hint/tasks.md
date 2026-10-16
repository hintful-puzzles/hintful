# Tasks

## 1. Decide

- [x] 1.1 The plan's shape, and whether the shared slide planner can take
      rotations; record the answer and its reason in `design.md`.
- [x] 1.2 The integer every hinted move lowers; run
      `src/engine/hint-resume.test.ts` on Twiddle.

## 2. Build

- [x] 2.1 `hint()`, `hintGesture` and the marks, for every variant
      (`orientable`, rows-only, `movetarget`). Orientation with an odd block
      (custom only) can run out late in the game: `design.md` § "Known limit",
      the owner's call.
- [x] 2.2 The help page's `## Hints` section.
- [x] 2.3 Hint tests and a render scenario for a step.
- [ ] 2.4 File, as the engine's, any planner generalization the work found
      (`design.md` § 5), once this change is archived.

## 3. Acceptance

- [x] 3.1 Run the app and walk a plan (4×4 n3: a four-turn run, each leg's
      words and ring checked, tiles 1 and 2 in place after it).
- [ ] 3.2 The owner plays it, and decides the known limit.
