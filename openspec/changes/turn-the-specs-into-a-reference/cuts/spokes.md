# Cuts: spokes

Requirements: 28 before, 25 after.

| Requirement or sentence cut | Word | What holds it now, or why it is gone |
| --- | --- | --- |
| "Spokes game implements the Game interface": that `src/games/spokes/` implements `Game`, is registered, and declares a `findMistakes` hook | type | The compiler and the registry say it of every game; `findMistakes` is a field of `spokesGame` in `src/games/spokes/index.ts`, and what it flags stays in "Spokes' findMistakes compares the board with its one solution". |
| "Spokes game implements the Game interface": "SHALL be a uniquely-solvable line-drawing puzzle", and its scenario "Every preset produces a soluble board" | duplicate | "Spokes' generator keeps every board uniquely soluble" promises one solution at the target difficulty; the win condition stays in the scenario "Completing the connected, satisfied board wins". |
| "Spokes' generator keeps every board uniquely soluble": "it SHALL start from every horizontal and vertical line plus a random diagonal per cell, then remove lines in a randomized order, keeping a removal only while..." | how | The construction is `spokesGenerate` in `src/games/spokes/generator.ts`. What it promises of a board stays: one solution at the target difficulty, every hub with at least one line, reproducible from a seed. |
| "Spokes' solver keeps the unbounded rung", and its scenario | duplicate | "The look-ahead runs at two strengths, which are two rungs" requires the solver's sub-solve at `Unreasonable` to be unbounded, and "Spokes' hint stops at bounded reasoning" withholds it from the hint alone. |
| "The bounded-hint guarantee is asserted structurally", and its scenario | process | `docs/games/solver-and-generator.md` § "Check, Tactic, Search" says two strengths of one rung emit the same words, so the guarantee is asserted as equal plans with a control against vacuity. The property itself stays in "Spokes' hint stops at bounded reasoning" and its scenario. |
