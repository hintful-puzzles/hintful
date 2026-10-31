# Tasks

- [x] 1.1 Read Rect's generator, solver and hint for what shape clues and hidden numbers need; bring the owner the question in `proposal.md` with that
- [x] 1.2 The owner's answer recorded, and the rest of this list written from `docs/new-game.md` § "The route by kind of game"
- [x] 2. The state: a clue's shape beside its size, a hidden size; the ruleset field and its params letter; the desc's shape letters; `getCorrect` checks shape and size
- [x] 3. The solver's placements read a clue's shape and optional size; the answer search checks cover where a size is hidden
- [x] 4. The generator: shapes from the division, then sizes hidden and shapes widened while the board keeps its tier; measured
- [x] 5. The hint: `shapesAround` reads shape and size; a clue drawn all round has no other fit; the words name a clue by its shape
- [x] 6. The look: a shape's frame round the clue's number or `?`, inside the hint's outline
- [x] 7. The menu's Patches section, the catalog alias, the help page; Patches' tests and the spec delta
- [x] 8. The game verdict, green
- [x] 9. Run the app: deal, hint to the end, light and dark, a phone at 10x10
- [x] 10. Commit and push
- [x] 11. The owner's playtest (2026-10-31): a drag from a drawn rectangle resizes it, and each clue takes a region fill, in both rulesets
- [x] 12. The second playtest (2026-10-31): a resize follows the square under the finger, where a drag into the near half of the next square had counted for nothing
- [ ] 13. The owner's answer on what a drawn rectangle claims (a lower bound, or its sides as lines), and the owner's word on the playtest's changes

## Measured (2026-10-31, eight deals a size)

A deal takes a median of 8 to 49 ms at Easy and 11 to 95 ms at
Unreasonable, 6x6 to 10x10; the slowest was 0.9 s (10x10 Unreasonable).
Every board had one answer. The menu's sizes, 7x7, 6x8 and 9x12, are the
three that fit beside Rectangles' twelve lines with upright boards among
them; 9x12 deals in a median of 68 ms Easy and 124 ms Unreasonable, 460 ms
at worst of twelve. The strip leaves about two clues in three
without a number and half of them plain. Over the hint's steps, "one fit"
and "only one clue reaches a square" each do about a third of the work.

## Decisions

- **A ruleset of Rect** (owner, 2026-10-31), as Zip is of Path and Queens of
  Star Battle: found under Rect, in its own section of the Type menu, and
  as "Patches" in the game list's search.
- **Resize** (owner, 2026-10-31): a drag from a square of a drawn rectangle
  resizes it, the corner farthest from the press fixed; it stops at another
  drawn rectangle, which is what the owner chose where LinkedIn's own pages
  said nothing of it. A drag from a grid corner still draws anew, so the
  hint's corner-to-corner drag and a rectangle inside another still work.
- **What a resize takes hold of**: a closed rectangle round exactly one
  clue. The owner's playtest found a blank board resized as one box, the
  board's edge its outline, into a line across it (2026-10-31).
- **Fills** (owner, 2026-10-31): each clue takes one of the first four
  region fills, as Star Battle does; the next four failed the dark scheme's
  contrast floor against the plain cell beside them. Its square
  wears it, and a rectangle the clue allows fills whole with it. The fills
  color the squares nearest each clue, never the answer, so a color says
  nothing of which rectangles meet.
- **For the playtest** (proposed 2026-10-31, the owner's to overrule): the
  strip hides every size and shape the tier allows, so a board shows few
  numbers and many plain `?` clues; a framed clue's text is smaller than a
  plain clue's, since the frame keeps inside the hint's outline.
