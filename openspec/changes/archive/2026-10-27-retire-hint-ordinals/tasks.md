# Tasks

## 1. Classify the chains (design D4, D5)

- [x] 1.1 List every rung that shows a chain, derived from the code (the `order` declarations, `forcingChainArea`, Path's lookahead, Map's chain), and every other rung below Unreasonable that tries a hypothesis
- [x] 1.2 For each, decide whether every link writes a mark the player can make, with a real board for each verdict, the owner's Path 7×9 Normal kind first
- [x] 1.3 Record the table in design.md (D6); bring the owner any verdict that is not clear-cut (design § "Open question")

## 2. Markable chains become ordinary steps

- [x] 2.1 Split each markable chain into steps that each write their mark, in the order that forces them (Rome's walk is the only markable chain, and is already one step over marks on the board)

## 3. Supposition chains move to Unreasonable

- [x] 3.1 Gate the Latin forcing chains (and Solo's) off the tiers below Unreasonable, in the ladder and so in the generator's difficulty certifier (design D7); the tier-defining rungs are filed as `teach-what-if-walks-with-marks` and `teach-map-chains-with-marks`
- [x] 3.2 Measure boards dealt and dealing time per tier, before and after (design D6); bring the owner any tier that becomes hard to fill
- [x] 3.3 Walk every Custom cell of the Latin games (`tier-walk`) at HEAD and after, and refuse or bring the owner any cell that stops dealing (design D7: two refused, on the owner's word)
- [x] 3.4 Write the spec deltas for the moved rungs (`latin-solver`, the seven games, `engine-hints`, `engine-difficulty`, `engine-candidate-hints`)

## 4. Retire the ordinal

- [x] 4.1 Remove `drawHintOrdinal`, the `order` a link declares, the edge hint's ordinal, `testing/hint-chain-pins.ts` and the guards that read them
- [x] 4.2 What still names a chain names it without numbers, its ends as references of their own (design D2); Rome's walk is "the outlined arrows"
- [x] 4.3 Map: region numbers stay shown; its chain journey is re-worded, with its `map` spec delta
- [x] 4.4 Help legends that mention numbers on a chain

## 5. Verify and document

- [x] 5.1 Run each changed game's hint in the app, with each pill pressed (Path, Rome, Map, Clusters, Towers on a former chain board, Keen Hard to the end; Rome's one-arrow walk said "arrows" and outlined the struck square, fixed)
- [x] 5.2 `docs/hints-marks.md`, `docs/hints.md`, `docs/testing.md`, `docs/engine-catalog.md`, and `docs/solver-and-generator.md` § "Check, Tactic, Search" against D4
- [x] 5.3 After the archive, `spec-citations` resolves every citation of the renamed walk requirement
- [x] 5.4 The gate, green
