## Why

Filed on the owner's word, 2026-11-19, from the review of the Wordguess and
Wordtrail session logs. The description pipeline (`scripts/describe.ts`,
`src/describe/`) is mostly clear and precise in what it refuses; the logs
found four places where it was silent, or said less than the author needed,
each costing a few minutes of reading its source:

1. **A description it will not compile is skipped without a word.** After
   Wordguess's techniques were cut (2026-11-19, 16:53), `describe` reported
   "68 compiled modules, 0 written" and left the game's generated module
   missing. `compiles()` in `src/describe/sources.ts` needs `techniques` or
   `position`; the agent learned that by reading it. Writing
   `techniques: []` then failed the schema until `tiers` was added too; the
   idiom lives only in a comment in `wordguess.description.yaml`.
2. **A dev server keeps the schema it started with.**
   `src/describe/load.ts` imports `description.schema.json` statically, so
   after a schema edit the running dev server's help pages fail with an
   error about the new property (2026-11-18, 23:23). The agent started a
   second server on its own port.
3. **The soundness checker's model printout hides a board clue's fields.**
   `research/technique-check/describe-check.ts` printed
   `clue trail: -1:-1 -1:-1` for Wordtrail's trails (2026-11-19, 00:39), so
   the reason a technique was judged unsound was not on the screen.
4. **The length lint cannot measure a supplied word.** It reads a slot the
   game supplies at the shortest and the default length a game has said
   (`src/describe/lint.ts`), which is not a word's length; the agent walked
   1,577 hint steps in a scratch test to find the longest sentence.

## What Changes

- `describe` names every description file it found and did not compile, and
  why; `techniques: []` as "this game has no techniques" is either accepted
  on its own or refused with the line to write, and the idiom goes into
  `docs/descriptions.md`.
- The dev server reloads the description schema when it changes (a Vite
  plugin watching it, or the loader reading it per request in dev).
- The soundness checker prints each board clue's fields by name.
- A slot whose words the game supplies declares its longest form, or the
  lint takes it from the game's supplied list, so the length bound is
  checked against the real worst case.

## Impact

`scripts/describe.ts`, `src/describe/sources.ts`, `src/describe/load.ts`,
`src/describe/lint.ts`, `vite-plugins/`, `research/technique-check/describe-check.ts`,
`docs/descriptions.md`.
