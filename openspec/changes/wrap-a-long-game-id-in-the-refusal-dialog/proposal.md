# wrap-a-long-game-id-in-the-refusal-dialog

**Status: filed 2026-10-11 by the session that archived
`open-and-check-the-boards-the-spec-census-found-mishandled`, which met it
while running the app. What it says of the code was true that day; re-check
before relying on it.**

## Why

A shared link whose game ID is refused shows "Ignoring invalid id in URL"
with the message `id=<the ID>: <the reason>`
(`src/screens/puzzle-screen.ts`, the `showAlert` after `newGameFromId`). A
long ID with no space in it does not wrap: at a 1280 px window a Solo killer
ID ran out of the dialog's right edge and was cut off there, with the reason
on the lines below it. Reproduce with
`/solo?id=3x3ka:zzzc,___a__a__a_________________aaa_a__aa__________a____aaaaaba_aba__aaa_aa_a__a_aaaba_a_aa_a__a_a___aaa__,a14_8_8a5_12_11d19c5_10_7_11_8_12a14_11f10c12_4a15b9a12a6_17a17a9_10a13a14a12e14a8a6_10a11f11a15a`,
which is refused for a cage with no sum. On a phone every ID of any length
is longer than the dialog is wide.

The reason is what the player needs, and it comes last, after a string they
cannot read.

## What the engine could do so that no game has this

It is the shell's, and one place: every game's refusal goes through this
alert. Two things to decide by running the app at a phone's width and a
desktop's:

- whether the ID is shown at all, shortened (its params and the first and
  last few characters), or wrapped anywhere (`overflow-wrap: anywhere`);
- the reason first, the ID after it.

`showAlert` is shared, so check its other callers for a long unbroken
string of their own (a file name, a save's error) before styling this one
alone.

## What Changes

- The refused-ID alert shows its reason whole at every width, and an ID of
  any length stays inside the dialog.
