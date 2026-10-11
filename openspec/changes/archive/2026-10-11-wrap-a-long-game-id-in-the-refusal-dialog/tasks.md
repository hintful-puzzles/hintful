# Tasks

- [x] 1. Reproduce at a desktop's width and a phone's, with the ID in the
  proposal and a short one. Reproduced at 1280 px and 390 px on 2026-10-11:
  the long ID ran out of the dialog's right edge at both. A short one
  (`3x3:zz`) fits either.
- [x] 2. Read `showAlert`'s other callers for a long unbroken string. Three
  more can carry one: the type alert beside this one (`type=<params>`), the
  import alert (`<file name>: <error>`), and the two that show
  `String(error)`. So the wrapping is the dialog's, for every caller.
- [x] 3. The reason first, and the ID wrapped or shortened; run the app at
  both widths and in both color schemes. Decided: the ID whole and wrapped,
  after the reason, smaller and quieter. Whole, because a link cut short in
  transit is the likely cause and its end is where that shows. `showAlert`
  takes a `detail` for it, which the type alert uses too. Measured in Chrome
  at both widths and both schemes for the proposal's ID, a short one, a
  6,000-character one and a refused type: the message and the detail end
  inside the dialog in all sixteen, and the 6,000-character one scrolls in
  the dialog's body under a reason that is on screen when it opens.
- [x] 4. The spec delta for the shell's refusal alert, validate, the gate,
  commit, push, archive.
