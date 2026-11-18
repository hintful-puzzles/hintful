# Tasks

- [x] 1.1 Measure, per judging game, how many chained verdicts name a start now (default board, every answer mark alone from the board as dealt): 104 of 1,245 (`design.md`)
- [x] 1.2 For each builder, decide whether its `reads` is the premise's own (no wider); record the finding per builder in a `design.md`: none is, and the formula's reads were tried and dropped, so a replay decides (`design.md` § "Decision: a replay decides, not the reads")
- [x] 1.3 Each builder hands the judge its trace (`Judging.traced`: graph, firings taken, fresh marks); the judge replays the walk leaving out one candidate at a time and names the earliest the move needs, bounded by `MOST_TRIED` and `MOST_OFFERS`
- [x] 1.4 Guards in `move-judge.test.ts`, "where a chain began": a named start is the one the replay names (seen failing with the earliest candidate named regardless); a start the move does not rest on is not named for what a later firing needed (seen failing with a refused firing ending the replay); a read as wide as the board names only what the replay confirms
- [x] 1.5 Measure 1.1 again (626 of 1,245); run the app on a chained move: Mosaic's square a number's count shades two steps on reads "…starting from one number's count on its own" (none named before)
