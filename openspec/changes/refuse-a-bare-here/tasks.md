# Tasks

## 1. The lint

- [ ] 1.1 Add "here" and place-naming "there" to `UNBOUND` in `engine/hint-words.ts`, with the existential exception; a unit test refuses "a line here would" and builds "there is only one way left", and is seen to fail with the lint reverted
- [ ] 1.2 Run every game's hint tests and the hint-quality walk; the refusals they throw are the work list for 2 (compare it with the proposal's audit, and say what differs)

## 2. The sites

- [ ] 2.1 Reword each supposition's "a … here would" so its place is the pill (Loopy, Pearl, Bridges, Black Box, Light Up, Salad, Rome, Towers, Sticks, Tracks); each game's hint tests pass and its pinned sentences read correctly
- [ ] 2.2 Reword each "there" / "here" after a pill (Tents, Signpost, Slide, Dominosa, Netslide, Salad, Subsets, Ascent, Clusters), and Palisade's, Same Game's, Cube's and Inertia's; tests pass
- [ ] 2.3 Reword the shared Latin `dup` sentence and Solo's and Towers' `dupWhere`; the Latin games' hint tests pass
- [ ] 2.4 Fix the unmarked pronouns the lint cannot see: Solo "the rest of it", Mines "the squares they share" and "those squares'", Group "its row and column", Unruly "every other empty one in it", Slant "slants away from it", Mosaic "the left one's"; tests pass
- [ ] 2.5 Read every moved pinned-sentence snapshot: only words move, every sentence within 120 characters

## 3. Guides and verification

- [ ] 3.1 `docs/hints.md` § "Bind the words to the marks" names "here" and "there" in what throws
- [ ] 3.2 Run the app on three of the reworded games and read a hint of each against the board
- [ ] 3.3 The gate, green

## Workflow follow-up

- Commit, push, archive
