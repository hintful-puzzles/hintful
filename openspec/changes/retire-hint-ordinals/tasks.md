# Tasks

## 1. Classify the chains (design D4, D5)

- [ ] 1.1 List every rung that shows a chain, derived from the code (the `order` declarations, `forcingChainArea`, Path's lookahead, Map's chain)
- [ ] 1.2 For each, decide whether every link writes a mark the player can make, with a real board for each verdict (`npm run hint-scan`), the owner's Path 7×9 Normal kind first
- [ ] 1.3 Record the table in design.md; bring the owner any verdict that is not clear-cut

## 2. Markable chains become ordinary steps

- [ ] 2.1 Split each markable chain into steps that each write their mark, in the order that forces them

## 3. Supposition chains move to Unreasonable

- [ ] 3.1 Gate each supposition rung off the tiers below Unreasonable, in the ladder and the generator's difficulty certifier
- [ ] 3.2 Measure boards dealt and dealing time per tier, before and after; bring the owner any tier that becomes hard to fill
- [ ] 3.3 Write the game spec deltas for the moved rungs (`path` and others the table names)

## 4. Retire the ordinal

- [ ] 4.1 Remove `drawHintOrdinal`, the `order` a link declares, the edge hint's ordinal, `testing/hint-chain-pins.ts` and the guards that read them
- [ ] 4.2 What still names a chain names it without numbers, its ends as references of their own (design D2); Rome's walk is "the outlined arrows"
- [ ] 4.3 Map: region numbers stay shown; its chain journey is re-worded or moved per the table, with its `map` spec delta
- [ ] 4.4 Help legends that mention numbers on a chain or the moved rungs

## 5. Verify and document

- [ ] 5.1 Run each changed game's hint in the app, with each pill pressed
- [ ] 5.2 `docs/hints-marks.md`, `docs/hints.md` (§ "The forcing boundary" against D4), `docs/testing.md`, `docs/engine-catalog.md`
- [ ] 5.3 After the archive, `spec-citations` resolves every citation of the renamed walk requirement
- [ ] 5.4 The gate, green
