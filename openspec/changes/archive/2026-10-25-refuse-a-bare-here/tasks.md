# Tasks

## 1. The lint

- [x] 1.1 Add "here" and place-naming "there" to `UNBOUND` in `engine/hint-words.ts`, with the existential exception; a unit test refuses "a line here would" and builds "there is only one way left", and is seen to fail with the lint reverted
  - The exception is "there would be", not "there would": the latter let "a bulb there would…" through, the shape this change refuses (design, Decisions)
- [x] 1.2 Run every game's hint tests and the hint-quality walk; the refusals they throw are the work list for 2 (compare it with the proposal's audit, and say what differs)
  - The run (2026-10-23) threw 35 distinct literals across every game the audit named, and none it did not; Salad's "the X here" is a reference's words, which the lint does not read, and was reworded with the rest

## 2. The sites

- [x] 2.1 Reword each supposition's "a … here would" so its place is the pill (Loopy, Pearl, Bridges, Black Box, Light Up, Salad, Rome, Towers, Sticks, Tracks); each game's hint tests pass and its pinned sentences read correctly
  - The move says "it" of the place where nothing else in the premise is "it"; where the premise's "it" is the clue (Sticks' "too long for it", Bridges' outlined island), the move names the place again ("this 2", "the line")
- [x] 2.2 Reword each "there" / "here" after a pill (Tents, Signpost, Slide, Dominosa, Netslide, Salad, Subsets, Ascent, Clusters), and Palisade's, Same Game's, Cube's and Inertia's; tests pass
  - Tents' "grass must go there" agreed with one square or several as keep-track narrows the step; "every ringed square must be grass" is a reference, so it re-renders instead
- [x] 2.3 Reword the shared Latin `dup` sentence and Solo's and Towers' `dupWhere`; the Latin games' hint tests pass
- [x] 2.4 Fix the unmarked pronouns the lint cannot see: Solo "the rest of it", Mines "the squares they share" and "those squares'", Group "its row and column", Unruly "every other empty one in it", Slant "slants away from it", Mosaic "the left one's"; tests pass
  - Mines' two are reworded ("the shared squares", "the left 2's other squares'"), not marked: they occur only when both sides of a pair are derived regions, 2 sentences in 26,685 steps over 300 16×16 boards (2026-10-23), and marking them would take a second striped set in one sentence
  - Slant's "one" is now the outlined placed square
- [x] 2.5 Read every moved pinned-sentence snapshot: only words move, every sentence within 120 characters

## 3. Guides and verification

- [x] 3.1 `docs/hints.md` § "Bind the words to the marks" names "here" and "there" in what throws
- [x] 3.2 Run the app on three of the reworded games and read a hint of each against the board
  - Tents `noTree`, Light Up `discountUnlit` and Loopy `deadEnd`, at their pins in Chrome (2026-10-25): each pill lights the mark it names, and each "it" can mean only the place
- [ ] 3.3 The gate, green

## Workflow follow-up

- Commit, push, archive
