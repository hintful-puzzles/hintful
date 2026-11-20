## 1. Census

- [ ] 1.1 Re-take the hook counts at run time from the registry (a `git grep`
      misreads `notApplicable` keys). Record which hooks every game has,
      which serve one to five games, and the hint fields each builder
      produces.

## 2. The contract

- [ ] 2.1 Make the universal hooks required; remove the fallbacks at their
      call sites.
- [ ] 2.2 One hint capability object; the builders return it whole and each
      game hands it over.
- [ ] 2.3 Derive `hintGesture` from `targetVerbs` where a game's body only
      restates it; plant a wrong gesture in one game and see the guard fail.
- [ ] 2.4 The draft rule keys on the standard refusal; the skeletons stamp
      a game that is a draft until its hint is written.
- [ ] 2.5 Decide each rare hook: keep, fold into a capability, or replace by
      a declaration. Record each decision here.

## 3. Finish

- [ ] 3.1 Guides describe the contract as it is. Run
      `npm run test:hint-sweeps`; commit, push, archive.
