## ADDED Requirements

### Requirement: The midend SHALL throw when deduction runs out outside an Unreasonable tier

When a game's `hint()` refuses with `DEDUCTION_EXHAUSTED` and the board's tier
is not named `Unreasonable` (a game with no tiers included), the `Midend` SHALL
throw an error naming the game, the move, the tier and the board's full id,
instead of returning the refusal.

The refusal tells the player that the board's difficulty allows positions that
need trial and error. On any other tier the board was promised to solve by
deduction, so the sentence would be false and the board is a defect.
`hint-resume.test.ts` holds the same rule over the boards the generators deal,
which are tiered correctly by construction. A board can still reach the hint
with the wrong tier at runtime, from an id that pins a tier or from a save, and
no test walk can meet those boards. A thrown error goes through the app's
last-resort reporter: the player sees the crash dialog instead of a false
sentence, and the report carries what it takes to reopen the board.

The tier test SHALL be one engine helper (`permitsSearch` in `difficulty.ts`),
read by both the midend and the walk, so the runtime check and the test-time
check cannot disagree about which tiers permit search.

Auto-Hint SHALL stop when a step throws, so the error reaches the reporter
without leaving the loop marked active with nothing driving it.

#### Scenario: A board pinned below the tier it needs

- **WHEN** a board is loaded by an id that pins it to a tier whose rules run out
  before it is solved, and the player follows the hint to that point
- **THEN** the midend throws an error naming the game, the tier and the full id,
  and the player never reads `DEDUCTION_EXHAUSTED`

#### Scenario: An Unreasonable board runs out of deduction

- **WHEN** the hint runs out of deduction on a board whose tier is named
  `Unreasonable`
- **THEN** the midend returns `DEDUCTION_EXHAUSTED` as a refusal and throws
  nothing

#### Scenario: Auto-Hint meets a thrown step

- **WHEN** Auto-Hint is running and a step's hint throws
- **THEN** Auto-Hint stops and the error propagates to the app's reporter
