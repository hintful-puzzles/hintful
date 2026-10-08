## Context

See `proposal.md` for the motivation. This file records what was measured, what
the owner decided and when, and how the pieces fit, so that the session that
implements it starts from the repo and not from a conversation.

The drawn direction is on a Claude Design canvas,
<https://claude.ai/artifact/8WQvEBNuEGFV4BfdxN5BxD>: desktop at 1440x900 and
1280x720, a phone upright with and without the Menu open, a landscape phone
playing Tracks, and the Layout preferences. It amends the recorded direction
"B · Index" (`openspec/changes/archive/2026-09-07-design-front-page-and-chrome/design.md`
§4): the tokens, type and spacing stand; §4.3 to §4.5 (the rail and the phone
bar) are replaced by this file.

### What was measured (Chrome, Solo, dark scheme, 2026-10-08)

| Viewport | Layout today | Rail content / height | Board edge |
| --- | --- | --- | --- |
| 1440x900 | rail | 900 / 900 | 736px |
| 1280x720 | rail | 757 / 720, and 849 with a hint showing | 554px |
| 1280x600 | rail | 743 / 600 | 546px |
| 1000x373 | rail | 743 / 373 | 322px |
| 844x390 | rail | 743 / 390, Hint below the fold | 340px |
| 800x1000 | rail | fits | 420px |
| 768x1024 | bar | n/a | 736px |
| 390x844 | bar and sheet | sheet: 1106px of rows in 675px | 372px |

Re-measure before designing against any of these; the rail's content height
depends on the game.

### What is wrong today

1. **Two overflow mechanisms, one hiding the other.** The rail scrolls
   (`overflow-y: auto`) and also has a `More…` dropdown; below 757px of height
   the row that falls off first is `More…`.
2. **The groups sort by three different principles.** "Your position" by
   object, "Help me play" by purpose, an unnamed footer by position on screen,
   `More…` by rarity. Saving is in four places: `Check & save` in Your
   position, `Check without saving` in Help me play, `Save checkpoint` in the
   timeline dropdown, `Save game` and `Load game` in `More…`.
3. **The phone's sheet is the rail verbatim**, so it opens on what the bar
   already shows, with keyboard-shortcut labels on a touch device.
4. **The layout is chosen on width alone** (`--app-chrome`, one breakpoint at
   48rem), which gives a landscape phone the desktop rail and makes 32px of
   window width cost 43% of the board between 768px and 800px.

### The owner's decisions (all 2026-10-08)

- "Menu on the left, bar on the bottom, buttons on the right, for all form
  factors", with the panels movable "like Google Dev Tools' Dock side", and,
  once that exists, a default that may depend on the viewport.
- The phone's Menu may omit what the Bar shows.
- `Fill marks` moves from the Bar to the Game controls. This reverses the
  owner's own placement of 2026-09-24, on the argument that it keeps the Bar
  identical in every game.
- Fixed dock positions; no free dragging. The constrained set of settings in
  "Docking is constrained so that a collision cannot be expressed" was put to
  the owner in place of a free side per panel, and accepted.
- "I'd prefer to avoid anything game-specific going into the menu, as people
  wouldn't know to search there": `Reference` sits with the game's controls.
- The renames `Start over`, `Save as…`, `Open saved…`. `Auto-solve for me` and
  `Check & save` keep their names.
- Undo across a Restart is kept, and Undo across a Load is wanted.
- The tap switch is to be available to everyone on every platform.
- Nonograms Katana's settings were offered as inspiration for the depth of
  customization (a toolbar side per orientation, a left-handed switch, a
  customizable bar). The owner does not want the customizable bar now.

Reached with a UX consultant over four rounds, and declined: the game's name as
the trigger for the puzzle switcher (no label says what it does); merging the
quick-save with the timeline's checkpoints (it changes what stored data means);
exclusive play "modes" such as Hardcore or Backtracking (they are not
exclusive, and a mode is state a player must track).

## Goals / Non-Goals

**Goals:**

- One overflow mechanism: the Menu, and nothing else, may scroll.
- The same three panels at every size, differing only in where they dock.
- A Bar whose slots never change between games.
- A layout a player can change, with every viewport rule expressed as a default.

**Non-Goals:**

- A bar whose contents a player chooses.
- Free drag-and-drop of panels.
- The tap switch's per-game action names, and the Aids preferences. See
  "What follows this change".
- Any change to the board, the palette or a game's rendering.

## Decisions

### One ordered list, cut once

Every command is one entry in one ordered list:

| # | Group | Rows |
| --- | --- | --- |
| 0 | Bar (no label) | Undo · Redo · Hint · Check & save · Back to last save · New game |
| 1 | Help | How to play *game* · Auto-solve for me · Show solution… |
| 2 | Board | Move *n* of *m* (the timeline, holding Save checkpoint) · Start over · Check without saving |
| 3 | Share & files | Share · Open a shared game · Copy image · Save as… · Open saved… |
| 4 | App | Switch puzzle… · Preferences · About |

The Bar shows as many leading entries as fit, never fewer than the first four,
then a `Menu` button. The Menu holds the rest: a **suffix** of the list, never
a selection from it. That is the property that makes its contents predictable,
and it is why the list is ordered so that the Bar's entries come first.

One component draws both from the list, as `rail.ts` does today, so order and
wording cannot drift between them.

*Alternative considered:* a text rail on the desktop that docks whole groups as
height allows (up to five states by height). Declined by the owner on sight in
favor of the phone's shape at every size.

### Three panels, one rule each

- **Bar**: the same in every game. A game with no hint is the one exception,
  and it is a draft (`docs/doctrine.md`).
- **Game controls**: everything the game in play brings. In this order in every
  game: the keys, then the Note mode, then the game's own
  commands (Fill or Update marks, Reference). A game that brings none of them
  has no panel, and the board takes the room.
- **Menu**: the same in every game.

A capability hook decides each entry of the Game controls panel, as it decides
the rail's rows today, so no game is listed anywhere.

### The hint's words sit under the board

At board-column width, above the Bar when the Bar is at the bottom. A game's
status line sits directly under the board. Neither is in a panel, so no panel's
height changes when a hint is shown. The cost is board height while a hint is
showing, most felt in a wide, short window.

### Docking is constrained so that a collision cannot be expressed

| Setting | Values | Kept |
| --- | --- | --- |
| Game controls on the | Right · Left | once, for the device |
| Bar | Bottom · Side | per window shape |
| Game controls | Side · Under the board | per window shape |
| Keep the Menu open when there is room | on · off | per window shape |

The Menu takes the side opposite the Game controls. A side Bar takes that side
too, at the window's edge, with the Menu between it and the board (first built
the other way round; see "Decided while building"). Nothing docks to the top, where the
readout row is. "Game controls on the Left" is the left-handed switch.

*Alternative considered:* a free side for each of the three panels, which is
what was first drawn. It allows all three on one side, and needs rules to
resolve what it should never have allowed.

**Window shapes**: tall (portrait); wide (landscape, at least about 34rem
high); wide and short (landscape below that). Two orientations are not enough,
because a desktop and a landscape phone are both landscape and want different
defaults. Crossing a boundary switches at once to that shape's stored layout or
its default, and leaves the other shapes' choices alone.

**Defaults**: wide, the Menu open on the left, the Bar at the bottom, the Game
controls on the right. Tall, the Menu a sheet, the Bar at the bottom, the Game
controls under the board. Wide and short, the Bar on the side and the Game
controls opposite.

**Fit**: a Menu that cannot dock without squeezing the board is opened over it
by the Menu button (a sheet when tall). The stored choice is kept, not
overwritten.

The layout is one grid on the puzzle screen's `main`, whose areas the settings
choose (`src/puzzle/layout.ts`). It replaces `chrome="rail" | "bar"`, the
keypad's `orientation` switch and the reference panel's own media query with
one mechanism.

### Undo across a Load

`Midend.loadGame` already keeps the board it replaces, through the same
`keep()` that New game uses. It was played: see "Undo across a Load, as
played".

## What follows this change

A change of its own, on the owner's word, and not filed.

The tap switch was the other thing listed here: a two-part switch naming each
game's own two actions. The owner withdrew it on the deployment (2026-10-08):
"no need to use words, here, I'm very happy with a shared toggle". What was
built in its place is under "Decided while building", "The button toggle is
one slot on the Bar".

- **Aids preferences.** Four independent switches (Hints, Checking, Pencil-mark
  filling, Move timeline), where off means absent everywhere. Not modes, and
  not presets.

## Risks / Trade-offs

- [The board loses height on a laptop: a readout row and a bottom Bar cost
  about 100px at 1280x720] → the owner chose this on sight; `Bar: Side` is the
  way out, and it is one setting.
- [A Bar stretched across a wide desktop leaves Hint floating in a void, the
  defect the 768px bar has today] → the Bar is the board column's width,
  centered.
- [A Game controls panel holding one switch looks stranded on a wide desktop] →
  the column shrinks to its content and sits beside the Bar; a predictable
  place is worth more than a tidy one. To be judged in the running app.
- [The phone's Menu still scrolls: its rows do not fit a 675px sheet] → it is
  the one scroll, inside the thing called Menu, with the rarest rows last.
- [Stored layout choices multiply the states to test] → the constrained table
  above has a finite set of states, and the guard enumerates them.
- [`Fill marks` moves about 50px up on a phone, away from where a player's
  thumb has learned it] → accepted by the owner.

## Decided while building (2026-10-08)

Each is an implementation decision, with its reason. The two that were open
questions are first.

- **Preferences › Layout shows the current window shape's settings only**, as
  drawn. A choice is judged by watching the board rearrange behind the dialog,
  and only the current shape can show that.
- **The Bar draws no key; a Menu row writes one where a keyboard is likely**
  (a pointer that is fine and can hover). The owner, on the deployment
  (2026-10-08): the keys sat under the caption in every slot but Hint's, and
  are better hidden "except maybe when the user hovers". A slot's tooltip
  carries the key and the command's full name.
- **The icon is above the caption in every Bar slot and every Game control**
  (owner, on the deployment). Hint is drawn as its neighbors are, a little
  wider so the armed caption holds one line.
- **A bottom Bar's Menu button is at the end nearest the Menu** (owner, on the
  deployment: it was on the right and opened a Menu on the left). It is first
  with the Game controls on the right, and last for a left-handed layout.
- **A bottom Bar is the board column's width, and a side column of Game
  controls runs the full height beside it.** The drawings show the Bar passing
  under the Game controls; "Risks" below says the Bar is the board column's
  width, and that is what was built, because it centers Hint under the board
  and gives the keys the height at 1280x600.
- **The Bar's length is computed from its own size**, by the slot sizes its
  stylesheet uses, and the screen hands the one number to the Bar and the Menu.
  It is 4 on a phone, 5 at a height of 373px with the Bar on the side, and 6
  elsewhere measured. Opening the reference panel on a 1280px window takes it
  to 4, which is the mechanism working.
- **`Back to last save` is captioned `Load` on the Bar**, and keeps its full
  name in the Menu and in the slot's tooltip. It was `Last save`, as the
  landscape drawing has it; the owner, on the deployment: a caption "has to be
  the name of an action". It is the one caption that differs, declared beside
  the label on the same entry.
- **The Menu button and the Menu's close button are for the visit.** They do
  not write `Keep the Menu open`. Crossing into another window shape, or
  losing the room to dock, drops the visit's choice.
- **A Menu that cannot dock is closed, not opened over the board.** Narrowing a
  window must not put a modal sheet over a game in play. The Menu button then
  opens it over the board: a sheet when tall, a drawer on the Menu's side when
  wide.
- **The Menu docks when what is left is at least 0.9 of the board area's
  height in width** (`menuFits`). At 1280x720 and 1024x768 it docks; at
  800x720 it does not (measured in Chrome, 2026-10-08).
- **The Bar holds still when the Menu opens** (the owner, on the deployment,
  2026-10-08: "a click on the same position would open and close the menu").
  A bottom Bar runs under a docked Menu, and a side Bar is at the window's
  edge with the Menu inside it, so the Menu's column never pushes the Bar.
  The cost is the Bar's height off a docked Menu, which scrolls a little
  sooner. A Menu over the board stops at the Bar, and its backdrop is clear
  over the Bar but still covers it: a press on an uncovered, inert Bar was
  delivered to the document's root in Chrome, not to the dialog, so a
  backdrop that stopped short would not have closed anything. The Bar's other
  slots are dimmed while the Menu is over the board, because a modal Menu
  takes the first press to close.
- **A rule sets the Menu button apart** from the Bar's commands.
- **The note toggle is the keypad's `Marks` key, drawn after the keys with its
  label.** It is a mode and not a character, so it is held to "every control
  carries a label". It has no pressed state, because the app is not told the
  game's pencil mode.
- **The button toggle is one slot on the Bar, shown by default** (the owner,
  on the deployment, 2026-10-08: "just one toggle button on the bottom bar,
  always visible by default. In general, as I see it, only game-specific
  inputs should be on the panel, whereas all common functions like this should
  be on the bottom bar"). It was first built as a two-part `Left | Right`
  control in the Game controls, behind the inherited preference, which was off.
  The preference stays and its default is now on. The caption is the button a
  press is sent as now, `Left` or `Right`. The slot is at the end of the Bar
  away from the Menu button, with a rule of its own, and is not in the command
  list: it is a mode, and the Menu has no row for it. It is absent in a game
  with `ignoresSecondaryButton`, which has nothing to swap to, and a swap is
  dropped on leaving the puzzle. It costs the Bar a slot: at 320px `Check &
  save` wraps to two lines to keep the armed hint's caption on two, and a side
  Bar in a 390px-high window sheds `New game` to the Menu.
- **The reference panel is a region of the grid**: beside the board, beyond
  the Game controls, in a landscape window, and under the board in a tall one.
  A short landscape window now gets it beside the board, where it took 45% of
  the height before.
- **The timeline names a restart `Started over`**, and the solved-or-lost
  popup's button and the help say `Start over`, with the row.
- **`--app-chrome`, `--app-orientation` and the `chrome` and `orientation`
  attributes are retired.** `--app-size` stays: the home screen reads it.

### Measured after (Chrome, Solo 2x3, 2026-10-08)

| Viewport | Shape | Bar length | Board edge, before → after |
| --- | --- | --- | --- |
| 1440x900 | wide | 6 | 736 → 686 |
| 1280x720 | wide | 6 | 554 → 504 |
| 1280x600 | wide | 6 | 546 → 442 |
| 1000x373 | short | 5 | 322 → 304 |
| 844x390 | short | 6 | 340 → 322 |
| 800x1000 | tall | 6 | 420 → 764 |
| 768x1024 | tall | 6 | 736 → 736 |
| 390x844 | tall | 4 | 372 → 372 |

At every size, and at 360x740 and 320x568, the Bar and the Game controls
report no scroll in either direction. Pressing Hint left the rectangle of
every control where it was at 1280x720, 390x844, 844x390, 360x740 and 320x568
(33, 16, 18, 16 and 16 controls compared).

The board loses 50px at 1280x720 and 104px at 1280x600, as "Risks" expected.
`Bar: Side` gives back the Bar's 64px.

### Undo across a Load, as played

`Back to last save` and `Open saved…` were each played in Chrome with Undo
after. The board left is kept and does come back, by the engine's rule
(`ts-engine`, "The board a new one replaces is kept, one deep"): it lies
beyond the loaded save's **first** position. A save loaded at move 2 takes
three presses of Undo to return the board left; the timeline offers it in one,
as *Previous board*. `replaced-board.test.ts` already pins a save beside a deal
and an id, and `help/features.md` already says "a loaded one".

Whether one press of Undo straight after a Load should return the board left
is the owner's to say. It would give Undo two meanings at one position, which
the engine's rule exists to prevent, and it is put to the owner with this
change.
