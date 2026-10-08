## 1. The direction

- [x] 1.1 Measure the current chrome at eight window sizes and record the figures in `design.md`
- [x] 1.2 Draw the alternatives and have the owner choose on sight; the canvas link and the decisions, dated, are in `design.md`

## 2. One list, two panels

- [x] 2.1 Replace `rail.ts` with one ordered command list and the two components that draw it (the Bar's leading entries, the Menu's suffix); verify by a test that the Menu's commands are exactly the list minus the Bar's, in order, at three Bar lengths
- [x] 2.2 Regroup the Menu as Help, Board, Share & files and App, and rename `Start over`, `Save as…` and `Open saved…`, in the rows, the dialogs, the toasts and the help pages; verify with `git grep` that the old wording is gone from `src/` and `help/`
- [x] 2.3 Rewrite `puzzle-command-homes.test.ts` from subset to partition across the three panels; see it fail with a command planted in both the Bar and the Menu, and with one planted in neither

## 3. The Game controls panel

- [x] 3.1 Build the panel from the keys, the note toggle, the inherited button toggle, mark-all and Reference, in that order, each present by its capability; verify by render tests for Solo, Tracks, Dominosa and Cube that each shows what the spec's scenarios say
- [x] 3.2 Remove mark-all from the Bar and Reference from the Menu; verify the Bar's commands are equal for Solo and Tracks at one size

## 4. The layout

- [x] 4.1 Lay `main` out as one grid whose areas come from the layout settings, replacing `chrome="rail" | "bar"`, the keypad's orientation switch and the reference panel's media query; verify in the browser at the eight sizes in `design.md` that no panel but the Menu scrolls
- [x] 4.2 Move the hint's explanation and the status line under the board at every size; verify in the browser that pressing Hint moves no control
- [x] 4.3 Choose the default layout by window shape (tall, wide, wide and short) and retire `--app-chrome`; verify the boards at 768x1024 and 800x1000 are within a few pixels of each other
- [x] 4.4 Size the Bar to the board column and let it shed trailing entries to the Menu when it does not fit; verify at 320, 360 and 390 CSS pixels with the hint armed that nothing overflows

## 5. Docking

- [x] 5.1 Add the layout settings to the store (one for the device, three per window shape) and a Layout section to Preferences, with the board rearranging behind the dialog as a choice is made; verify each setting in the browser
- [x] 5.2 Enumerate every reachable layout state in a test and assert each lays out with no panel overlapping the board; see it fail with two panels assigned one area
- [x] 5.3 Fall back, without overwriting the stored choice, when the Menu cannot dock; verify by narrowing a wide window with the Menu open and widening it again

## 6. Undo across a Load

- [x] 6.1 Play `Back to last save` and `Open saved…` followed by Undo in the running app; if either does not return the board left, make it, and pin it with a test beside the one for New game

## 7. Finish

- [x] 7.1 Update `help/features.md` and every help page that names the rail, `More…` or a renamed command; `npm run gate` passes
- [x] 7.2 Update `docs/games/input.md` and the README of `src/puzzle/` where they describe the chrome
- [x] 7.3 Re-read every `app-shell` requirement that names the rail's "Your position" group or the More sheet against the code, and amend the delta
- [ ] 7.4 Run the app at desktop, tablet, phone and landscape-phone sizes, by mouse, keyboard and touch, in both color schemes; ask the owner to accept on the deployment
