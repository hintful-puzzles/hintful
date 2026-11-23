## Context

Filed 2026-11-23 at `2a9b34cc1` by the route, `describe-the-whole-catalog`
(task 1.2). The family is every game whose hand-written code takes candidate
notes from the shared machinery, plus Magnets, which keeps its own:

```sh
git grep -l -E 'note-taking-cell|candidate-hint' -- 'src/games/*.ts' \
  | cut -d/ -f3 | sort -u
```

At filing that gave ABCD, Adjacent, Crossing, Group, Keen, Map, Mathrax,
Rome, Salad, Seismic, Solo, Towers, Undead and Unequal; with Magnets and
Ascent, whose notes are their own, sixteen games. The table in proposal.md
gives their lines. Read the population again with the query at task 1.1;
the list here is for ordering only.

What the engine shares already, read at filing:

- **`engine/solve/latin.ts`**, the Latin solver. Used by Adjacent, Ascent,
  Group, Keen, Map, Mathrax, Salad, Solo, Towers and Unequal.
- **`engine/mechanics/note-taking-cell.ts`** and
  **`engine/hint/candidate-hint.ts`**: the note-taking input, the note
  moves, mark-all and the candidate walk, with `docs/hints-candidates.md` as
  their guide and `engine-notes` and `engine-candidate-hints` as their
  specs. A game wires them by hand, in seven steps the guide lists.
- **`engine/edge-clue-latin/`**: Unequal and Adjacent share their state,
  generator, solver, play and drawing there. That is where the route said
  this group starts.
- **`engine/fill/`**: the fill board, which carries none of the above. Its
  cells hold one value or none; it has no notes, no keypad and no mark-all.

## Goals / Non-Goals

**Goals:**

- Every game in the family played from its description, its directory
  holding no TypeScript but tests, if any.
- Candidate notes as a capability of the fill board, so that a plain-cell
  game could adopt them by a key.
- The family judged by `docs/descriptions.md` § "Judging a family moved
  onto its description".

**Non-Goals:**

- Answers on edges or partitions. A game here that needs one (Rome's
  arrows are a value a cell, so it may not) waits for the regions group,
  and the gap list says so.

## The rules (from the route's design.md § "What every group does")

- **A gap list first**, per game, against the engine at that commit, with
  each need marked met by what is built or new (criterion 3); then an
  order that lets later games reuse what earlier ones built.
- **Each game its own commit**, the hand-written game playing on until its
  flip, and each flip run in the app before it is done: a deal, input,
  hints, live errors, dark mode, a solve to the end.
- **Every capability adoptable** by another game.
- **A game may change to fit the engine**: consistent with games already
  moved, a little worse in play where the engine is simpler for it, never
  significantly worse (the owner, 2026-11-23). Each difference is listed in
  its flip's task.
- **Judged by the criteria**, with `npm run compare-cost` against a
  worktree of this change's baseline, and the figures recorded here.
- **A new game is recommended**, born from its description, to measure what
  a new game of this kind costs (criterion 6). This family moves many games,
  and may skip it, saying so.
- **A flip moves the game's tests to data**, its `<game>.cases.yaml`; a
  capability the family adds is tested on a description of its own.
- **No game stays hand-written.** A game that does not fit gets the
  capability it needs, or moves to a later group that builds it, named in
  the route's tasks.

## Decisions

To be written from the gap list (task 1.1): where notes live in the fill
board's state, how a step that strikes a note is a firing, how the keypad is
declared, and whether `edge-clue-latin` is folded into the fill board or
kept as a layer under it.

## Risks / Trade-offs

- [Sixteen games and about 44,000 lines is too large for one change] → the
  gap list's order splits it, as `born-plain-cell-family` followed its
  pilots: the first change takes the games up to a natural break and files
  the rest as its successor.
- [The candidate walk's words are pinned by many hint tests] → hint
  wording is free to change; a flip's hint pins move with its tests to data.
- [Solo's jigsaw and killer variants, Map's regions] → partitions the fill
  board already deals (`deal.grow`), read by the gap list before assuming
  new work.
