## Why

The puzzle screen's command surface has two overflow mechanisms, one of which
hides the other, and its phone and desktop forms are different shapes that hold
the same list. Measured in Chrome on 2026-10-08 with Solo open: the desktop
rail needs 743px of height (849px while a hint's explanation shows), so at
1280x720 it scrolls and the first row to leave the screen is `More…` itself;
the phone's `More` sheet holds 1106px of rows in a 675px sheet and its first
nine rows repeat six commands already on the bar. The owner asked for the
information architecture to be rethought (2026-10-08) and chose the direction
below on sight, from drawn alternatives.

## What Changes

- The puzzle screen becomes **three panels, each with one rule**: a **Bar** of
  commands that are the same in every game, a **Game controls** panel holding
  everything specific to the game in play, and a **Menu** holding the rest.
- **BREAKING (control placement)**: the desktop rail is removed. A desktop gets
  the same three panels as a phone: by default the Menu on the left, the Bar
  along the bottom and the Game controls on the right.
- **BREAKING (control placement)**: the phone's Menu sheet no longer repeats the
  Bar. The Bar and the Menu partition one ordered list; a command is in one or
  the other.
- **BREAKING (control placement)**: `Fill / Update marks` leaves the Bar for
  the Game controls panel, beside the Note toggle. `Reference` joins it there.
  Nothing specific to a game is in the Menu.
- The Menu is regrouped by scope (Help, Board, Share & files, App), and three
  rows are renamed: `Restart this puzzle` to `Start over`, `Save game` to
  `Save as…`, `Load game` to `Open saved…`.
- The hint's explanation and a game's status line sit under the board at every
  size, so no panel changes height when a hint is shown.
- **A player can choose where the panels dock**, from fixed positions in
  Preferences, kept separately for each window shape. The default depends on
  the window shape, as a board's orientation already does.
- The window shape, not the width alone, chooses the default layout.

Not in this change, and recorded in `design.md` as what follows it: the tap
switch that swaps a press's primary and secondary action, named with each
game's own two actions and on for everyone; and the Aids preferences that let a
player remove the help they do not use.

## Capabilities

### New Capabilities

None.

### Modified Capabilities

- `app-shell`: the command surface's requirements. "Every puzzle command has
  exactly one home" and "Mark-all holds a slot in the phone bar in every game
  that has it" are replaced by requirements for the three panels, the partition
  between Bar and Menu, where the hint's words sit, and panel docking.

## Impact

- **Code**: `src/puzzle/components/rail.ts` (replaced by a bar and a menu drawn
  from one ordered list), `src/screens/puzzle-screen.ts` (layout, phone chrome,
  the command map), `src/puzzle/components/keys.ts` and the mouse-button toggle
  (the Game controls panel), `src/components/reference-panel.ts` (its docking
  joins the same mechanism), `src/css/common.css` (`--app-chrome` and the
  breakpoints), `src/dialogs/settings-dialog.ts` and `src/store/settings.ts`
  (a Layout section and its stored choices),
  `src/screens/puzzle-command-homes.test.ts` (subset becomes partition).
- **Player data**: new preference keys for the layout. No existing key changes
  meaning and no save or game-ID format is touched.
- **Help**: `help/features.md` and any page that names the rail, `More…`,
  `Restart this puzzle`, `Save game` or `Load game`.
- **Specs**: `app-shell`, including the requirements that name the rail's
  "Your position" group in passing (the timer's place, the phone's top bar, the
  More sheet's menus), which are re-read against the code before archiving.
