# add-the-tap-switch

**Status: scaffolded, ready to start (2026-10-08).** Filed on the owner's word
the same day, on the deployment of
`rebuild-the-puzzle-screen-as-three-panels`: "I still can't see the tap-swap
button - did you not get to it yet?" That change left it out by name and
recorded its shape in its `design.md` § "What follows this change". Nothing
here waits for an answer.

## Why

A game with two actions on a square gives the second to the right mouse
button. On a touch screen that is a long press or a two-finger tap, which is
slow for a player who wants to place twenty of the second kind in a row: every
`No track` in Tracks, every flag in Mines.

The app has a control for this and almost no player has seen it. It is the
inherited left-button and right-button toggle, it is off until a player finds
`Show toggle` under Preferences › Mouse buttons, and it is labeled `Left` and
`Right`, which names a mouse a phone does not have and says nothing about what
a tap will do.

## What Changes

- **A two-part switch in the Game controls names the game's own two actions**
  (`Track | No track`, `Digit | Note`), and the part that is lit is what a tap
  does. It replaces the `Left | Right` toggle.
- **It is shown to everyone**, in every game that has a second action
  (`Game.ignoresSecondaryButton` already says which have none). The
  `Show toggle` preference is retired: a preference key goes, which is the
  owner's call and is asked before it is removed.
- **It is kept for the visit** and reset on leaving the puzzle, so a player
  never opens a game to find a tap doing the unexpected thing.
- **Each game declares the two short names.** The games on `targetVerbs`
  already declare `primary` and `secondary` with a sentence each; the name is
  a field beside the sentence. The other games with a second action declare
  the pair in whatever the engine consumes for them. Measured on 2026-10-08:
  57 games, 7 with `ignoresSecondaryButton`, 27 on `targetVerbs`
  (`git grep -l targetVerbs -- 'src/games/*/*.ts'`). Re-measure before
  designing against these.
- **The switch shows the mode the board is in.** The note toggle (the keypad's
  `Marks` key) has no pressed state today because the app is not told the
  game's pencil mode. Where a game's second action *is* its note mode, the
  switch and that key must not be two controls for one thing: the design
  decides which stays.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: the Game controls requirement names the switch in place of the
  button toggle, and who sees it.
- `ts-engine`: a game with a second action declares a short name for each.

## Impact

- `src/puzzle/components/game-controls.ts` (the toggle), `src/engine/game.ts`
  and `src/engine/target-verb.ts` (the declaration), every game with a second
  action (two names each), `src/dialogs/settings-dialog.ts` and
  `src/store/settings.ts` (the retired preference), `help/features.md`.
- Player-visible in every such game: a new control in the Game controls panel,
  whose height is already tight in a short landscape window. Check it in
  Chrome at the sizes `docs/games/input.md` § "The puzzle screen's three
  panels" lists.
