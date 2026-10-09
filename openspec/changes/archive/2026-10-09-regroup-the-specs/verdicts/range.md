# Verdicts: range

## keep `range`: Range generates uniquely solvable symmetric boards

Both outcomes are what the generator promises of a board, which stays, and both hold in the code: `stripClues` in `src/games/range/solver.ts` first empties every clue opposite a black square of the solution, then tries each symmetric pair once and restores it unless the three rules still finish. Fewer clues never deduce more, so a pair restored once stays needed, and the board is left with no removable pair. A session changing the generator would break one of them without noticing, which is why they are stated as promises and not as steps.

## keep `range`: A Range hint is refused only when the rules force no cell

It is the one refusal Range's own `hint` gives (`src/games/range/index.ts` returns `DEDUCTION_EXHAUSTED` on an empty plan), and a hint's refusals stay. It is not reached on a board that loads: "Range loads only a board its three rules finish" keeps such boards out, and the hint walk fails on a refusal in a game with no tier that permits search (`engine-hints`, "Deduction runs out only where the tier permits search"). The requirement still says what `hint` answers when called on such a state, and that it has no other refusal.

## keep `range`: Range checks mistakes against the solution

That a wrong white mark is a mistake is the game's choice: the cross is a note the player need not make, and Range checks it like an entry. `ts-engine`, "A mistake check compares with the one answer, hidden or not", does not say which marks count.

## keep `range`: Range's Solve searches where deduction stalls

`solve` and `findMistakes` both run `fullSolve`, which searches (`src/games/range/solver.ts`), and "Range loads only a board its three rules finish" explains its own existence by this: `solve` keeps the first completion it meets and cannot tell a board with several answers from a dealt one. The one-move result and its solve flag are the contract of the move. A session removing the search, on the ground that every loadable board is finished by the rules, would be making a decision this requirement lets it see.

## keep `range`: Range hint color legend

It is not the same rule as "A shaded premise, a run and a clue each take their own mark". This one says the legend is stable across deductions, that no mark is a fill hiding content, and that which cell takes which mark is read from the step's words; the other says which mark each element takes. Merged they would exceed the length bound, so they stay two.

## keep `range`: A shaded premise, a run and a clue each take their own mark

See "Range hint color legend": this holds the marks themselves, and a hint's marks stay.

## keep `range`: Range's keyboard cursor marks white with shift

The case the entry found, a shifted arrow on a hidden cursor only revealing it, is covered: the scenario's condition is "the visible cursor", and `engine-input`, "One arrow press reveals the cursor and moves it", says a modified arrow that marks reveals instead of acting on a hidden cursor, which its second scenario describes. `interpretMove` in `src/games/range/index.ts` does that.

## note range: the hint's refusal and the untiered rule

`engine-hints`, "Deduction runs out only where the tier permits search", says a hinting game with no difficulty contract "SHALL NOT be able to emit" the deduction-exhausted refusal. Range has no difficulty contract and its `hint` can return `DEDUCTION_EXHAUSTED`; what holds the rule is the walk failing on any such refusal, and the loader refusing the boards that would produce one. "Able to emit" reads as a type-level guarantee the code does not give. The shared requirement's wording, or Range's fallback (a throw would say the same thing more loudly), is for whoever owns `engine-hints` to settle.
