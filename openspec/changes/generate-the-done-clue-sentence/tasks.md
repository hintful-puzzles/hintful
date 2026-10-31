# Tasks

- [x] 1. The placeholder, expanded from `dragMarkVerbs`, refused where owed and missing or written where not owed
- [x] 2. The five pages use it, keeping only their own words after it
- [x] 3. The five pages read in the app
- [ ] 4. The owner accepts the five pages as they read in the app

## Decisions made in the work (2026-10-31)

- **The declaration is a `Game` member, `doneClues`.** `dragMarkVerbs` was
  no `Game` member, so the help build had nothing to read. With it on the
  `Game`, `drag-marks.test.ts` finds the five clue marks the same way and no
  longer names them by hand.
- **Magnets did not use `dragMarkVerbs`**, contrary to the proposal: its clue
  was a target of its `targetVerbs`. It now declares the mark with
  `dragMarkVerbs` and its verbs delegate to it on a clue, so the help and the
  drag test read the one declaration it plays by.
- **`dragMarkVerbs` takes `button: "either"`.** Unequal and Adjacent mark a
  clue with either button but declared only the left, so the generated sentence
  could not say "either" and the drag test never pressed the right button. The
  test now does, and fails when a right-click stops marking a clue.
- **Adjacent says "bar".** Unequal and Adjacent share one drag declaration, so
  it is now built once per `ClueKind`, which names its clue.
- **The sentence names a thing the rules named.** The owner, reading
  Unequal's, could not tell what "clue" meant: its rules called the `<`
  signs "clues" in passing and the page "signs" after. Unequal's noun is
  now "sign". Undead's and Magnets' rules said only "the numbers round the
  grid" while their Controls and Hints said "clue", so their rules now
  name the numbers as the clues. Towers and Adjacent already did.
- **Each page reads the engine's drag sentence** ("Keep the left button down
  and drag to do the same to every clue you pass over that looked the same as
  the first"), the wording every generated Controls paragraph uses, in place
  of each page's own.
