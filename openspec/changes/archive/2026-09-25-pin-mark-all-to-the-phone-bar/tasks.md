## 1. The slot

- [x] 1.1 `renderPhoneChrome` renders `mark-all` between Hint and Check & save when `canMarkAll`, captioned Fill marks / Update marks on `hasPencilMarks`, disabled once solved
- [x] 1.2 The bar's captions wrap instead of overflowing: tap floor moved from the button to its caption, shrink ratio 4:1 against the hint
- [x] 1.3 Measured in Chromium at 320/360/390/412px, at rest and armed, in Solo (six slots), Light Up (five) and Net (four)

## 2. Guards

- [x] 2.1 `puzzle-command-homes.test.ts`: the phone bar's commands are a subset of the sheet's (the `app-shell` scenario that had no test)
- [x] 2.2 `puzzle-command-homes.test.ts`: `mark-all` is in the bar exactly when `canMarkAll`
- [x] 2.3 Both seen failing with a planted bar-only command, then restored

## 3. Words

- [x] 3.1 `help/features.md` § "Filling in all the pencil marks" says where the button is on a phone
- [x] 3.2 `app-shell` delta: mark-all holds a phone-bar slot in every game that has it
