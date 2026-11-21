## 1. Measure

- [x] 1.1 Re-run `--route` and list the every-game sections by size.
      At `4cd46b6b0` (2026-11-21) the largest every-game reads were
      `input.md` § "Targets and verbs" with its parts (186 lines),
      `testing.md` § "Pinning a hint's positions" with its parts (135),
      `rendering.md` § "What a board looks like: pieces on a quiet
      surface" (101), `input.md` § "Keyboard cursors" (95), `mechanics.md`
      § "Params are declared once, on `paramConfig`" with its parts (94); in the deduction block,
      `descriptions.md` § "A kind of rule places its techniques" (235) and
      `hints-marks.md` § "Group one firing into one step" (139).

## 2. Trim

- [x] 2.1 For each, largest first: keep the rules, decisions, reasons and
      traps; replace walk-throughs of code with a pointer. One guide a
      commit; `guide-sections.mjs` stays green.
      Two levers: the route reads a section "without its parts" where each
      part has its own "Read it when" row, and a passage that applies to
      some games only became a part with a row of its own (region fills,
      colors told apart, a spent default, a route of lines, the rare
      refusals, the candidate rung stamp). The kind catalog in
      `descriptions.md` restated `kinds.ts`'s comments and went; `fit.flip`
      took the guide's account as its comment. Stale on the way:
      `hintTileBits` (gone with `one-way-to-paint-hint-marks`) was still
      named in three guides.
- [ ] 2.2 Send a subagent to stamp a game from a skeleton reading only the
      trimmed route, and record what it found missing.

## 3. Finish

- [ ] 3.1 Record the route's figures before and after. Commit, push,
      archive.
      `node scripts/checks/guide-sections.mjs --route`, lines a kind:

      | Kind | `04494aa27` | `4cd46b6b0` (start) | after |
      | --- | --- | --- | --- |
      | Cells with notes | — | 4,328 | 3,369 |
      | Cells marked by state | — | 4,259 | 3,314 |
      | Edges and loops | — | 4,347 | 3,413 |
      | Moves and search | 3,662 (least) | 3,692 | 3,069 |
      | Hidden answer and feedback | 4,811 (most) | 4,843 | 3,862 |
