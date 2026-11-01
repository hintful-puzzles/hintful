# describe-components-and-open-domains

**Status: filed by `describe-moves-and-finishes` (2026-11-01)**, the third
part of step 3 of `describe-the-whole-catalog`'s plan (`design.md` § "The
plan"), split from it by move shape (`describe-moves-and-finishes/design.md`
§ "The split"). It files step 4, `describe-the-king-move-games`, when it is
archived.

## Why

The position runtime compiles a planning game's moves, finish and dead-end
claims from its description (`docs/descriptions.md`). Five games need what no
construct states yet: a finish or a move over a component of the position,
or a domain that is not finite.

## What Changes

- **Reach and components on a concrete position**: Netslide's finish (every
  tile powered from the source, through wires that meet and no barrier),
  Flood's move (recolor the region joined to the corner), and Same Game's
  (remove a group, then let the rest fall and close up). These run on a
  position, never on the marks, so they are not step 8's incremental
  connectivity, and step 8 may build on them.
- **Same Game's finish and last-of-a-color test stated once**; they are
  written three times today (`describe-the-whole-catalog/design.md`
  § "Corrections"). `finish-search` fed its compiled moves where fast enough.
- **Netslide's slides** on the permutation runtime and `slide-planner`, as
  Sixteen's are.
- **Numgame's integers and Untangle's points** run on concrete positions; the
  checker's reach is bounded by them, and the change says what it cannot
  check.

## Acceptance

Each of the five has a description its runtime executes: its moves'
legality and its finish compiled and called, its hand-written copies removed
or kept with the reason and the measurement; every dead-end claim checked
sound on small boards, or named as beyond the checker with the reason; every
fixture, deal and hint walk unchanged, or each difference reported; the
guides updated; step 4 filed.
