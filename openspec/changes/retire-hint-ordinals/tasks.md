# Tasks

## 1. Classify the chains (design D4, D5)

- [x] 1.1 List every rung that shows a chain, derived from the code (the `order` declarations, `forcingChainArea`, Path's lookahead, Map's chain), and every other rung below Unreasonable that tries a hypothesis
- [x] 1.2 For each, decide whether every link writes a mark the player can make, with a real board for each verdict, the owner's Path 7×9 Normal kind first
- [x] 1.3 Record the table in design.md (D6); bring the owner any verdict that is not clear-cut (design § "Open question")

## 2. Markable chains become ordinary steps

- [ ] 2.1 Split each markable chain into steps that each write their mark, in the order that forces them (Rome's walk is the only markable chain, and is already one step over marks on the board; waits on the open question for the rest)

## 3. Supposition chains move to Unreasonable

- [ ] 3.1 Gate each supposition rung off the tiers below Unreasonable, in the ladder and the generator's difficulty certifier (waits on the open question)
- [x] 3.2 Measure boards dealt and dealing time per tier, before and after (design D6); bring the owner any tier that becomes hard to fill
- [ ] 3.3 Write the game spec deltas for the moved rungs (`path` and others the table names)

## 4. Retire the ordinal

- [x] 4.1 Remove `drawHintOrdinal`, the `order` a link declares, the edge hint's ordinal, `testing/hint-chain-pins.ts` and the guards that read them
- [x] 4.2 What still names a chain names it without numbers, its ends as references of their own (design D2); Rome's walk is "the outlined arrows"
- [x] 4.3 Map: region numbers stay shown; its chain journey is re-worded, with its `map` spec delta
- [x] 4.4 Help legends that mention numbers on a chain

## 5. Verify and document

- [ ] 5.1 Run each changed game's hint in the app, with each pill pressed
- [x] 5.2 `docs/hints-marks.md`, `docs/hints.md`, `docs/testing.md`, `docs/engine-catalog.md` (§ "The forcing boundary" against D4 waits on the open question)
- [ ] 5.3 After the archive, `spec-citations` resolves every citation of the renamed walk requirement
- [ ] 5.4 The gate, green
