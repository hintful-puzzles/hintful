## 1. Design

- [ ] 1.1 Where analysis keys on spelling: grep the compiler for matches on
      a rule's written form (named sets, `cycleOf`, `pointCycleOf`, and the
      like); for each, the structural reading that replaces it. Write it
      in design.md.

## 2. Normalize

- [ ] 2.1 Named sets inlined (or their analysis shared) before analysis; the
      99b14db8 case is a test.
- [ ] 2.2 Structural recognition for each form 1.1 lists.
- [ ] 2.3 A rule that can never hold refused at compile time, or the deal
      bounded and named; plant 99b14db8's `noLoop` again and see a refusal,
      not a hang.

## 3. Properties

- [ ] 3.1 Property tests: ranges over the full domain, emitted and read
      names, numerals in wording, per-tier clue kinds. Each of the four
      bugs in the proposal, planted again, fails one.

## 4. Fixtures read at their tier

- [ ] 4.1 The capability-fixtures guard asks that a fixture's capability is
      read at the tier its case tests; `cornering` would have failed.
- [ ] 4.2 `docs/testing.md`: an engine fix is verified on a born game that
      reaches it, too.

## 5. Close

- [ ] 5.1 `npm run test:hint-sweeps`; deals that moved listed.
- [ ] 5.2 Archive, and take the next change from
      `describe-the-whole-catalog` § "0. The refactor first".
