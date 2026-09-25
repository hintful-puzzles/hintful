# quiet-the-check-and-save-confirmation

Owner, 2026-09-25, after the phone-bar change shipped: *"I'd suggest removing
the big Check & Save success toast, and that large rectangle around it. It
shouldn't be that special. Let's make it just a regular button, and do a
minimal success indication when good, and only show a popup if the check
failed."*

## What changes

- **No success toast.** A clean save sets a short-lived reactive flag in
  `quick-save-actions.ts` (`justSaved(puzzleId)`, 1.5 s). The flag is keyed by
  puzzle, so a save cannot flash on another puzzle's page. Both surfaces read
  it: the desktop side panel row and the phone bar button show a check mark and
  "Saved", then return to "Check & save". Cmd/Ctrl+S flashes the same row.
- **Still announced.** A screen reader does not reliably speak a label change on
  a control, so the outcome goes through a new visually hidden polite live
  region (`announce()` in `dialogs/toast.ts`): "No mistakes. Saved.", or
  "Saved." where no check ran.
- **Just a regular button.** The side panel's `bordered` row emphasis and the
  phone bar's `outlined` variant are deleted. Check & save was their only user.
- **Failure unchanged.** A refused save is still the "Not saved" modal.
- **Also corrected:** the `quick-save` spec claimed that the label reads
  "Quick-save" in a game without mistake-checking. It has not. The app and
  its help use one name everywhere.

## Left as they are, deliberately

- **Quick-load's success toast.** The request named Check & save.
- **Check without saving's toasts.** On a phone that command lives in the More
  sheet, which closes on the press, so a flash on its row would never be seen.
  The toast is its only visible result.
- **The phone bar reflows while "Saved" shows.** "Saved" is narrower than
  "Check & save", so the hint widens for 1.5 s. Measured in Chromium at 412px:
  nothing overflows. Pinning the width would take a hidden-caption trick for a
  shift that only happens straight after a press.
