# Verdicts: tents

## keep `tents`: Tents' solver is a certified deduction ladder

The corpus's shape is a rule and not the test restated. No shared requirement asks a ladder for a census (`engine-helpers` states `runDeductionFixpoint` and `engine-difficulty` the tiers), and `docs/games/solver-and-generator.md` § "Proving an adoption: the fixtures are not enough" says a census walks "a corpus at every cap" without saying which boards. Every preset read from `presets`, a board that is not square and every cap the generator uses are what make the census able to see a rung go quiet, and a session trimming `src/games/tents/tents-ladder.test.ts` for speed would check the trim against this. The rule is the reason for the guard.

## keep `tents`: Tents' line count reads every placement of a line's tents

The sentence is not a duplicate of "Tents' Normal rungs are rungs of their own". That requirement says the reading of the two lines alongside is a rung of its own; this sentence says what it reads, the same enumerated placements as the count, which is the only statement of what that rung computes.

## keep `tents`: Tents places tents and grass by click and drag

No shared requirement says a gesture that changes nothing returns no move. `engine-input`, "A game declines a button it did not act on", is about a button the game has no meaning for, and `ts-engine`, "A UI-only input redraws without a history entry", tells the three results apart without saying which a no-change gesture gives. So the sentence stays with the game.

## reword `tents`: Tents takes a cursor and direct keys

The entry found a control in no requirement: Shift or Ctrl with an arrow paints grass as the cursor moves (`interpretMove` in `src/games/tents/index.ts`). What a key does belongs in the spec, so it is added, with a scenario. Nothing else changes.

### Requirement: Tents takes a cursor and direct keys

Select SHALL set the keyboard cursor's square to a tent, and select2 to a
non-tent, or clear it. The literal keys `T`, `N` and `B` SHALL set the cursor
square directly: to a tent, to a non-tent and to blank. Shift or Ctrl with an
arrow SHALL move the cursor and set the square it leaves and the square it
enters to a non-tent where blank, and with Ctrl where a tent too.

#### Scenario: A letter sets the cursor square

- **WHEN** the cursor is on a blank square and `T` is pressed
- **THEN** the square becomes a tent

#### Scenario: A shifted arrow paints grass

- **WHEN** the cursor is on a blank square and Shift with an arrow moves it
  onto another blank square
- **THEN** one move makes both squares non-tents
- **AND** a tent under either is left alone, where Ctrl would have made it a
  non-tent

## keep `tents`: Tents completion is judged from the board

The sentence the entry names, that the win flash does not play for the Solve command, is already gone from the requirement, and rightly: it is `ts-engine`, "The win flash plays on a forward move that solves the board". What is left is the puzzle's own test of completion.

## note tents: the cut of the hint's refusal on a solved or mistaken board stands

"When it refuses" in the pruning brief covers the refusals a game's own `hint` gives. This one is the midend's: `engine-hints`, "The midend SHALL refuse a hint on a finished or wrong board before asking the game", says it of every game and forbids the game to write either, and "The midend's two refusals are not a game's to give" makes a game returning one a type error. `src/games/tents/hint.ts` writes neither. That a wrong link counts as a mistake, which is what the refusal turns on here, is "A link no pairing holds is a mistake".

## note tents: the cut of "Every Tents overlay is in the diff key" stands

The question was whether the warm-frame comparison reaches Tents' mistake and link-mistake overlays. It need not: the test counts mistake frames and does not require one (`src/engine/warm-repaint.test.ts`; `engine-drawing`, "The warm-frame comparison answers for what it reached"). But the cut rests on the rule and not on the test. `engine-drawing`, "A warm frame matches a fresh paint of the same state", is stated of every registered game and every frame, and `docs/games/rendering.md` § "Overlay sidecars" opens with the rule in the cut requirement's own words. In Tents both overlays are bits of the one packed word the cache compares (`MISTAKE_BIT` and `LINK_MISTAKE_BIT` in `src/games/tents/render.ts`), so there is no key for them to be left out of, and the requirement described that packing. That the overlays are drawn at all is "Tents ships findMistakes" and "A link no pairing holds is a mistake".

## note tents: the description reader does not accept pre-placed squares

The entry reported that the reader accepts upstream's `!` and `-`, a pre-placed tent and non-tent. It refuses them: `parseDesc` in `src/games/tents/state.ts` reads only the run characters, and the comment above the codec says so. No encoder, here or upstream, writes them, so "Tents descriptions use the upstream run-length encoding" is complete as it stands.

## note tents: a shifted arrow paints from a hidden cursor

With the cursor hidden, Shift or Ctrl with an arrow in Tents moves the cursor and paints at once, where Range's shifted arrow only reveals (`src/games/range/index.ts`). `engine-input`, "One arrow press reveals the cursor and moves it", allows either, so it is not a defect by the spec, but the two games differ for no stated reason and a player cannot see where the first stroke lands. Worth a look by whoever next touches either.

## note tents: no shared rule that a gesture changing nothing is no move

Tents, Rectangles and Unruly each say that a click or key that would change nothing produces no move. If `engine-input` said it once for every game, those sentences would be `collection` cuts.
