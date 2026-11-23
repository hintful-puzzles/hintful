## Context

Filed 2026-11-23 by `born-candidate-note-family` at its archive
(`openspec/changes/archive/2026-11-23-born-candidate-note-family/`), whose
design.md holds the gap list this change starts from (§ "The gap list
(1.1)", read at `153e4cf43`), its § "Shared" table of which capability
each later game takes from whom, and the figures it was judged by. The
population is the same query's, less what moved:

```sh
git grep -l -E 'note-taking-cell|candidate-hint' -- 'src/games/*.ts' \
  | cut -d/ -f3 | sort -u
```

with Magnets, whose notes are its own. At filing that leaves the nine of
proposal.md; Ascent went to lines and loops.

What the predecessor built, each tested on a fixture of its own under
`src/engine/testing/fixtures/` (`docs/descriptions.md` and
`docs/hints-candidates.md` say each): notes on the fill board with
mark-all, auto-pencil and the four prefs; `play.numbers` and its keypad,
reaching the board in play; the candidate walk built from the compiled
module, its regions the units and each partition the rules hold distinct;
givens from `given:`; a Latin answer; clues at edges, slots, corners and a
dealt partition's parts; done marks on any clue; a partition divided before
the answer and the answer searched under it; a ruleset by a bare letter; a
kind precedence switched by letters; a hide in turn, from a tier up, whole,
and ordered by a formula (`deal.hideBy`).

## Goals / Non-Goals

**Goals:**

- Every game of the nine played from its description, its directory holding
  no TypeScript but tests.
- The family judged by `docs/descriptions.md` § "Judging a family moved
  onto its description", with the predecessor's figures beside these.

**Non-Goals:**

- Answers on edges or partitions: a game that needs one waits for the
  regions group, and the gap list says so.

## The rules

The predecessor's design.md § "The rules", unchanged: a gap list first; a
game a commit, run in the app before it is done; every capability
adoptable; a game may change to fit the engine, never significantly worse,
each difference listed; judged by the criteria against a worktree of this
change's baseline; a flip moves the game's tests to its `cases.yaml`; no
game stays hand-written.

Learned there, for this order: the share of a flip's needs met by what is
built rises within a clue universe and falls at each new one (its § "The
figures (3.1)", criterion 3). An order that takes the games on a universe
already built first (Solo on parts and a divided partition, Salad and
Undead on slots, Magnets on edges) and a new universe's games together
meets more of each flip from the one before.

## Open Questions

- **Group's header drag, dividers and diagonal multifill**: they are
  Group's alone and kept in its saves. Kept, they are an engine capability
  one game uses (reordering a table's rows and columns); dropped, Group's
  controls change. The owner's call, asked when this change reaches Group.

## Risks / Trade-offs

- [Nine games and some 29,000 lines is a large change] → the gap list's
  order may split it again, as the predecessor's did.
- [Map's cells are a partition's parts] → its own capability; the gap list
  says whether the regions group builds it first.
