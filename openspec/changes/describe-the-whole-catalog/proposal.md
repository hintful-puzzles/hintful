# describe-the-whole-catalog

**Status: filed on the owner's word (2026-11-01)**: "I absolutely want
descriptions to be implemented throughout the entire catalog, and any code
that was only needed for the previous approach retired", **before more games
are implemented**. It began as their question whether describing games opens
further significant refactoring, and that survey is this change's first task.

## Why

Nine descriptions state techniques (2026-11-01): the Latin library and
Adjacent, Group, Keen, Mathrax, Salad, Solo, Towers and Unequal. Every other
game writes its ladder by hand. So two ways of writing a ladder live side by
side, and the engine keeps the old way's code for the games still on it. A
game added now would choose between them. The aim of growing the catalog by
about 200% in a year (`compute-the-cut-by-technique-transfer`, `report.md`
§ "The owner's decision (2026-10-31)") wants one way, and the one a
description gives: rules stated once, techniques checked sound against them,
and the solver compiled from them.

Measured 2026-11-01, by game directory under `src/games/` (61):

| How the ladder is written | Games |
| --- | --- |
| Compiled from a description | 8 |
| `DeductionTechnique` and `runDeductionFixpoint` | 24, Solo among them |
| The skeleton's `singleFirings` | 27, many also in the row above |
| The slide planner | 2 |

The query is a `grep -l` of each marker over the games' non-test files. The
rows overlap, and some games appear in none: a game whose hint searches or
walks its solution. The survey counts each game once.

## What Changes

- **A survey and a plan (task 1).** For each game: how its ladder is
  written, its family (the language research's three, in
  `investigate-a-language-for-puzzle-games/collection/`), and what the
  compiler lacks to state it. Across the tree: the code that only the
  hand-written way needs, in the engine and in each game. Also the further
  refactoring a description makes possible, each measured. Candidates seen
  before measuring:
  - a hint sentence carried by the technique's statement, built from the
    firing's binding as its reason already is (Towers keeps its own copy of
    the generic Latin sentences);
  - the pairing table each described game writes (`compiledRung`,
    `uncluedRung`), the same shape eight times;
  - a technique's tier stated in the description, where a game keeps a list
    of its own (Rectangles' `TIER_RUNGS`);
  - the soundness checker ported to TypeScript (found done:
    `design.md` § "What the compiler says today").
- **One change per family, or per vocabulary step**, in the order the survey
  sets (`design.md` § "The plan"). This change files the first; each files
  the next when it is archived. Each describes its games and retires what
  they no longer need.
- **The engine's old layer goes last**, once no game uses it, with a guard
  that refuses a ladder not compiled from a description.

## Order

This change comes before every new game: `add-ball-sort` and
`add-word-list-puzzles` wait for it. `report-technique-inheritance` reads
stated techniques, so it gains from every family this change describes.

## Open

- **What a game with no deduction ladder describes.** That includes a
  sliding or planning game, and one whose hint searches. Its rules can still
  be stated, which buys the answer check and a small-board uniqueness test.
  The language research called Sokoban its expected failure (`language.md`
  § "Sokoban"). The survey brings the owner what each such game's
  description would hold, and what it would retire.
- **Whether a family is worth the compiler's vocabulary.** Where a family has
  one or two games and needs a new construct, the cost is stated, and the
  owner's answer above is the default: describe it.

## Acceptance

Every game's rules, and its techniques where it has a ladder, compiled from
its description. No code left that only the hand-written way needed. A guard
that refuses a ladder written by hand.
