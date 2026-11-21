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
- [x] 2.2 Send a subagent to stamp a game from a skeleton reading only the
      trimmed route, and record what it found missing.
      It stamped "Even Shade" (a parity-and-count shading game, in a
      throwaway clone) to every verdict line but the spec and the icons, with
      a hint step read in Chrome; params, status, mistakes, input, rendering,
      soundness and pins needed nothing past the route. What it found, and
      what became of each:
      - The scaffold wrote two imports of modules `3aabd6c01` had moved, so
        no game stamped since compiled (found by the first, stopped run):
        fixed, and the skeleton's test resolves every import it writes.
      - The skeleton's census counted by says-kind, so a placed kind with
        arms failed it: both skeletons count by ladder id.
      - The `grid` skeleton stated its count by hand, against the route: it
        places `count.both`.
      - Unsaid: `shape:` against `rules:` (`descriptions.md` § "The answer
        check"); a size that cannot carry a tier leaves the generation test
        too (the skeleton's comment); the verdict raced by an edit
        (`testing.md` § "A game's verdict in one command").
      - Wrong: `mechanics.md` § "Difficulty is a declared contract" owed every
        deducing game Unreasonable; `new-game.md` assumed an `add-<game>`
        change.
      - Two guards whose snapshot a new game writes cited sections the route
        never sends a game to: they cite the verdict's section.
      - Left as they are: `spec-subjects`' "too few to trust" line beside the
        missing spec (the refusal it accompanies is the true one), and the
        scaffold's display name from the id (the catalog is written by hand
        next).

## 3. Finish

- [x] 3.1 Record the route's figures before and after. Commit, push,
      archive.
      `node scripts/checks/guide-sections.mjs --route`, lines a kind
      (2026-11-21; "after" at `37e635a2a`), about a fifth less for every kind:

      | Kind | `04494aa27` | `4cd46b6b0` (start) | after |
      | --- | --- | --- | --- |
      | Cells with notes | — | 4,328 | 3,371 |
      | Cells marked by state | — | 4,259 | 3,316 |
      | Edges and loops | — | 4,347 | 3,415 |
      | Moves and search | 3,662 (least) | 3,692 | 3,070 |
      | Hidden answer and feedback | 4,811 (most) | 4,843 | 3,864 |

      What is left is mostly the guides' openings and their tables (about
      a hundred lines a guide), which the route reads before any section.
