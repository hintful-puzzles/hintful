# Owner directives in `AGENTS.md`, and where each one goes (task 2.2)

Written for the owner to read beside the draft of the new `AGENTS.md`. Every passage of
`AGENTS.md` at commit `1f597366` that states something the owner decided is
here once. The paragraph numbers are `sort.md`'s.

A quotation and its date are kept only where the wording is the rule. That is
none of these: each survives as a rule in the present tense.

## Kept in the root file

| # | Directive | Root section |
| ---: | --- | --- |
| 2 | Do not make this file longer unless there is no better way | opening |
| 8 | Do not write a summary of the record anywhere | What this is |
| 14, 78 | User-facing value first; diverging from upstream is the point | What the project is for |
| 15 | Dozens to hundreds of new games sets the scale | What the project is for |
| 16 | No progression features | What the project is for |
| 18, 19 | Convention over configuration; no decision that is not about the puzzle | What the project is for |
| 21 | A game that does not fit is first a question about the convention | What the project is for |
| 22, 102c | The framework owns a shared idiom; refactor as you go | What the project is for |
| 23, 24 | Declare what the engine consumes; refuse a second copy | What the project is for |
| 88 to 94 | Nothing is sacred; internal is yours, player-visible is asked first | What the project is for; Rules |
| 72 | Every game has a hint, and a game without one is a draft | What the project is for |
| 70 (6) | A hint relies only on marks the player can make | What the project is for |
| 30 to 34 | No merges; boards never seeds; upstream descs best-effort; notices verbatim | What the project is for |
| 44 | Ids, types and references over regexes | Method |
| 46 | No census of the tree in this file | Method |
| 52 to 54 | The acceptance bar | Rules |
| 57d, 64a | Never bypass the gate | Rules |
| 61 | A test earns its runtime | Code |
| 65 | Chrome only, through `playwright-cli` | Specific to a coding agent |
| 102b | Own everything in the repo | Rules |
| 102d, 125 | Continue by default | Rules |
| 115, 116 | Persisted by a commit, or it did not happen | Rules |
| 118 to 122 | No approval gate; archive your own work; acceptance where genuinely unsure | Rules |
| 126 | Hand the next ready change to a fresh session | Specific to a coding agent |
| 149b | Push when a task is done | Rules |

## Kept in a guide only

The root file's map sends a session to each of these guides.

| # | Directive | Guide |
| ---: | --- | --- |
| 20 | The test for whether a decision is real | `docs/doctrine.md` |
| 24 | More declaration of the consumed kind; a game missing a section is a draft | `docs/doctrine.md`, `docs/games/mechanics.md` |
| 32 | What "best-effort" covers for upstream game IDs | `docs/doctrine.md` |
| 64b to 64f | The four things that keep test retirement honest | `docs/games/testing.md` |
| 70 | The Palisade bar, points 1 to 5 and 7; Inertia as the non-deductive exemplar | `docs/games/hints.md` |
| 72 | The framework leads; hintless games are pulled in one at a time | `docs/work-management.md` |
| 81 | No requirement asks for C compatibility | `docs/games/solver-and-generator.md` |
| 122 | Player-visible does not automatically mean stop and ask | `docs/work-management.md` |
| 123 | Testing may be deferred to the end of an arc, only when said | `docs/work-management.md` |
| 6d | "Maintained by", never "by"; lineage credited in the About dialog only | the header comment of `src/project-identity.ts` |
| 96c | The deploy does not wait on the full suite | the comment at step 1c-i of `scripts/gate.sh`, where it already is |

## Cut, for the owner to confirm

Each of these stops being written anywhere outside the archive and the git log.

1. **"The goal is every game hinted by the end of October 2026"** (paragraph
   72). The rule that a game without a hint is a draft stays. The date goes:
   it is a target, and a later session orders its work by the open changes.
2. **"Aspirational next step: lift Fifteen/Sixteen hints … to a
   Palisade-grade why"** (paragraph 73, flagged 2026-06-15). The prompt audit
   found `src/games/fifteen/hint-text.ts` now narrates "into place", "out of
   the way" and "leaving the hole between it and its home". If Sixteen still
   falls short, that is a change to scaffold, not a line in the brief.
3. **"I'm perfectly ok with cleanly rejecting saved games that are no longer
   valid in a new version of the code"** (paragraph 93). The root file says a
   compatibility break is allowed and is the owner's call, which asks again
   each time. If this was meant as a standing permission for stale saves, it
   needs a line and should say so.
4. **The openspec precautions** (paragraphs 127 to 130, 132): which delta verb
   to use, checking a `REMOVED` or `MODIFIED` heading against the live spec as
   a whole line, treating an archive warning as a failure, confirming which
   requirement holds the sentence a delta means to change. The owner asked
   for all openspec detail to go; design.md § "Risks" records that this
   accepts a later session may repeat one of these. The gate still runs
   `openspec validate --all --strict` and the version floor.
5. **The threat attached to "never bypass"** (paragraph 57d: "immediate
   termination and legal action"). The rule stays, unconditional and first in
   the list. The prompt audit's reason for dropping the threat is that it
   states no behavior and makes a model over-cautious elsewhere.
6. **`../puzzles-web/` as a diff reference** (paragraph 105). Useful while
   porting; the root file names only `../puzzles/`.
7. **"Old C-format saves are expendable by decision"** (paragraph 66). No
   such save can reach the app today.

## Two things the owner may want to move

- **The byte bound.** The draft is 9,809 bytes against 20,000. The bound could
  come down to 12,000 and still leave room; design D1 chose 20,000 as 200
  lines at 100 characters.
- **§ "Method" in the root file.** Nine one-line rules, 21 lines. They are the
  rules the old file said were broken most often, which is the case for
  keeping them in every session. The case against is that each is a pointer
  to `docs/method.md` and the map already has one.
