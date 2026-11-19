## 1. Typecheck

- [x] 1.1 Put `research/` TypeScript in a typechecked project; fix or delete
      what fails, recording which. Already so since 2026-10-29 (a807bcef6
      added `research` to `tsconfig.node.json`), and `typescript-projects`
      holds it; nothing failed. The proposal's premise was stale: the
      2026-11-18 break was the description compiler refusing a nameless
      technique at run time, which no typecheck sees, so the guards (2.1)
      are the half that would have caught it.
- [x] 1.2 See the gate refuse a planted type error in `research/`: an unknown
      field in `inherit.ts`'s description literal, TS2353 from the gate's
      `tsc -p tsconfig.node.json`.
- [x] 1.3 Settle `research/`'s place in the documentation-only list and
      correct the gate's comment about it. It stays: the prefix's typecheck
      runs before the shortcut, and the guards run in CI. The comment no
      longer says Python.

## 2. Guards and progress

- [x] 2.1 Run the research guards in CI's gate workflow:
      `npm run test:research-guards` over `research/**/*.guard.test.ts`
      (`inherit.guard.test.ts`, `sightline.guard.test.ts`), held there by
      `src/gate-scope.test.ts`. The original defect planted again (no
      `names`) fails it. A third guard, every library technique a game
      places is in its words, catches a second break the work found: since
      2026-11-15 the compiler refuses a technique's words where the
      candidate has a step of its name, and the report filed Latin's `set`
      in Solo and Towers as "not in its words". Sources now carry only a
      technique's reading; the planted `says` fails the guard on both.
- [x] 2.2 Make the long research runs print progress as they go; see it on
      a real run. Vitest 5.0.5 shows no `console` output from a piped
      passing file; `process.stderr.write` streams. One helper,
      `research/progress.ts`, and biome's `noConsole` on `research/**`. The
      Solo inheritance report printed its lines over 45 s as each check
      finished.

## 3. Record

- [x] 3.1 `build-pipeline` spec delta; the guide that names `research/`
      (`docs/descriptions.md`), and both tools' READMEs.
