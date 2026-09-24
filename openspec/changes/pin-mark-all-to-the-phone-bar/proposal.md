# pin-mark-all-to-the-phone-bar

**Status: scaffolded, not started.** Owner request from the device pass
(`test-touch-on-a-real-device`, 2026-09-24), playing Solo on a phone: *"I want
the 'Update all pencil marks' button to always be there on the bottom toolbar,
in every game that has it, seeing how useful it is."*

## Why

On a phone the command is two taps away, inside the More sheet
(`puzzle-rail` in its `sheet` variant). In a game that has it, it is one of the
most-used actions. It is the command that turns a board of placed digits into
a board of candidates to reason from.

## The constraint to design around

`renderPhoneChrome` in `src/screens/puzzle-screen.ts` documents the phone bar as
**"a persistent bar of exactly five"**: Undo, Redo, Hint, Check & save, More.
Check & save holds its slot by an earlier owner request (2026-09-07: *"I am very
interested in it being in a highly accessible quick-access position"*), and
`src/screens/puzzle-command-homes.test.ts` holds where each command lives. A
sixth button at 412 CSS px competes with Hint, which is deliberately the wide,
accented one.

Options for design, with a screenshot of each at 412 px for the owner to
choose from:

1. A sixth slot, shown only when `canMarkAll`, with icon-and-short-label
   buttons ("Marks") so six fit.
2. The same slot, sharing Redo's position when `canMarkAll` (Redo moves into
   More).
3. Beside the keypad, not in the bar. The keypad is where a pencil-marks game
   is played from, and it already carries the pencil toggle.

Population: the games with `canMarkAll` (the flag is held equal to the game's
behavior; see `docs/games/testing.md` § "How a cross-game guard finds its
population"). Do not use a list.
