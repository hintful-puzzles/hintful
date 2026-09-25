## 1. Confirmation

- [x] 1.1 `checkAndSave` sets `justSaved(puzzleId)` for 1.5 s and calls `announce(...)`; no success toast
- [x] 1.2 `announce()` in `dialogs/toast.ts`: visually hidden polite live region
- [x] 1.3 Side panel row and phone bar button read "Saved" with the check icon while `justSaved`

## 2. A regular button

- [x] 2.1 Delete the side panel's `bordered` emphasis and the phone bar's `outlined` variant

## 3. Verification

- [x] 3.1 `puzzle-screen.test.ts`: a clean save shows no toast or modal, flashes only its own puzzle, announces the check, and clears; seen failing with the flash removed
- [x] 3.2 Chromium: phone bar at 412px and desktop side panel, before, during and after the flash; nothing announced into the toast region, no dialog

## 4. Spec

- [x] 4.1 `quick-save` delta: the toast requirement and the stale-label requirement replaced
