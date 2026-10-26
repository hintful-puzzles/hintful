# Tasks

## 1. Decide how forcing is shown (owner)

- [ ] 1.1 Find real Path lookahead steps like the owner's (7×9 Normal) with `npm run hint-scan`, plus a Rome walk, a Latin chain (Keen or Solo) and a Map chain
- [ ] 1.2 Prototype the candidates in design.md § "Open question" on those boards, and screenshot each in the app at phone width, light and dark
- [ ] 1.3 Put the comparison in front of the owner with a recommendation, record the choice as a decision in design.md, and write it into the `path` delta

## 2. Retire the ordinal from the engine

- [ ] 2.1 Remove `drawHintOrdinal`, the `order` a link declares, the edge hint's ordinal, `testing/hint-chain-pins.ts` and the guards that read them
- [ ] 2.2 `forcingChainPremise`: the chain's ends become references of their own (design D2), within the 120-character limit

## 3. The games

- [ ] 3.1 Latin family (Solo, Keen, Towers, Unequal, Group, Mathrax, Salad) and Clusters: no numbers, and sentences re-tied
- [ ] 3.2 Rome: "the outlined arrows"
- [ ] 3.3 Path: the owner's choice from 1.3
- [ ] 3.4 Map: region numbers stay shown; the chain journey is re-worded, and its `map` spec delta is written
- [ ] 3.5 Help legends that mention numbers on a chain, in every game above

## 4. Verify and document

- [ ] 4.1 Run each game's chain step in the app, with each pill pressed
- [ ] 4.2 `docs/hints-marks.md`, `docs/hints.md`, `docs/testing.md`, `docs/engine-catalog.md`
- [ ] 4.3 After the archive, `spec-citations` resolves every citation of the renamed walk requirement
- [ ] 4.4 The gate, green
