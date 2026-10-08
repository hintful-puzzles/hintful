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
- Fixed dock positions; no free dragging.
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
  game: the keys, then the modes (the tap switch, Note), then the game's own
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
too, between the Menu and the board. Nothing docks to the top, where the
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

**Fit**: a Menu that cannot dock without squeezing the board opens over it (a
sheet when tall). The stored choice is kept, not overwritten.

The layout is one grid on the puzzle screen's `main`, whose areas the settings
choose. It replaces `chrome="rail" | "bar"`, the keypad's `orientation` switch
and the reference panel's own media query with one mechanism.

### Undo across a Load

`Midend.loadGame` already keeps the board it replaces, through the same
`keep()` that New game uses. Whether `Back to last save` and `Open saved…`
reach Undo in the running app has been read in the code and not played. It is
a task of this change to play it, and to make it true if it is not.

## What follows this change

Each is a change of its own, on the owner's word, and neither is filed.

- **The tap switch.** A two-part switch in the Game controls naming the game's
  own two actions (`Track | No track`, `Digit | Note`), on for everyone, kept
  for the session and reset on leaving the puzzle. The games that use
  `targetVerbs` already declare `primary` and `secondary` with a sentence each;
  a short name beside the sentence is the same kind of declaration. The other
  games need the two names declared as well. Until then the inherited
  left-button and right-button toggle keeps its preference and moves into the
  Game controls panel. `Game.ignoresSecondaryButton` already says which games
  have no secondary action.
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

## Open Questions

- Whether Preferences › Layout shows only the current window shape's settings
  (as drawn) or all three.
- Whether the Bar on a wide window shows key hints as a second line under each
  caption (as drawn) or leaves them to the Menu and the help.
