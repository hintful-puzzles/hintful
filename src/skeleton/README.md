# The game skeletons

A new game starts as a copy of one of these directories, made by
`scripts/new-game.sh <gameId> [kind]`. The requirement is "A scaffolding
script stamps out a new game from the skeleton" in
[`repo-layout`](../../openspec/specs/repo-layout/spec.md).

| Kind | For |
| --- | --- |
| [`grid`](./grid) | A square grid of cells the player marks, solved by deduction. |
| [`edges`](./edges) | Lines the player draws along the edges between squares, solved by deduction with connectivity. |

**A skeleton is a small game that plays**, written the shared way for every
concern that has one: params, presets, the desc, input, the solver's ladder,
the generator's tier gate, the mistake check, the hint and its marks, the
renderer's tile cache, and the tests. Its puzzle is only there to make those
run. A copy is the author's own from the moment it is made: nothing in a game
refers back here, and the engine does not know these directories exist.

**It is source, so the gate holds it.** The typecheck reads it, so a change
to `Game` or to an engine helper that it does not follow fails before any
game is stamped, and its tests run with the suite.

**It is not a game of the collection.** It does not call `registerGame`, has
no catalog entry and no icon, and nothing the app imports reaches it, so it
is not in the bundle. Leave it that way: the suite shares one registry across
a worker's test files, and a registered skeleton would fail
`catalog-registry.test.ts` by file order.

## Changing one

- **Keep it on the shared way.** When a concern gains a shared helper, the
  skeleton moves to it in the same change, since it is what the next game is
  copied from.
- **The word "skeleton" is the rename.** The script replaces `skeleton`,
  `Skeleton` and `SKELETON` in file names and contents with the game's id, so
  the word appears in a skeleton only as its own name.
- **A comment there is read in the copy.** It describes the code it sits on,
  as any comment does, and never the fact of being a skeleton.
- **Stamp a copy, register it and run the gate's guards against it** when the
  change is more than a rename: the source scans that read `src/games/*` do
  not read this directory, so a copy is how they are asked. Delete the copy
  afterward.
