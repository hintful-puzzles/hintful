# one-pointer-for-mouse-and-touch

**Owner-requested (2026-09-30)**; split out of `afford-every-hint-action` as
its first part.

## Why

Net's hint asks the player to lock a square, and a touch player cannot: the
lock is the middle button, Shift-click or `S`. The owner's rule is that every
action is reachable by **keyboard alone**, by **mouse alone** (left and right
buttons, clicks and drags, no key held) and by **touch alone** (tap, long
press, drag), with no combinations.

The owner also wants the mouse and touch to be the same. Players move between
them, and they should not have to learn quirks when they do. The frontend
already maps a tap to a left click, a long press to a right click and a drag to
a drag, and a press held and then dragged arrives as a right-drag. What still
separates them:

- **The middle button**, and the frontend's remaps that fake it: Shift-click
  becomes middle and Ctrl-click swaps the buttons (`view-interactive.ts`, after
  upstream's `emcclib.js`). Many touchpads send no middle button at all, and a
  combination only works for a player with a hand on each device.
- **`MOD_STYLUS`**: Loopy and Pattern (`wantsStylusModifier`) make a tap
  cycle through three states where a mouse button toggles between two. That
  was upstream's workaround for a finger with no second button. Now that a
  long press is the second button, it only means a player learns two control
  schemes for one game.

With both removed, one pointer vocabulary serves both inputs: **primary
press, secondary press, and a drag with either**. "Touch alone" then follows
from "mouse alone" instead of being a third column to keep in sync.

## What changes

- **The frontend** sends only the left and right buttons. It ignores the middle
  button, carries no held key onto a press, and never sets `MOD_STYLUS`.
  The `swapMouseButtons` preference stays: it swaps the two buttons, whichever
  input produces them.
- **The engine** loses `MIDDLE_BUTTON`/`MIDDLE_DRAG`/`MIDDLE_RELEASE`,
  `MOD_STYLUS` and `Game.wantsStylusModifier`. Because the constants are gone,
  a game cannot bind the middle button at all, rather than a check catching one
  that did.
- **The target-verb model** loses its `middle` slot. A verb that only a key
  reaches is a `keyOnly` verb, and that includes an erase verb (Loopy,
  Subsets, Unruly: Backspace and Delete clear), whose state the two pointer
  verbs already reach by cycling.
- **Each game with a middle-button or stylus behavior** (taken by reference:
  Ascent, Boats, Loopy, Mines, Net, Pattern, Pearl, Salad, Sticks, Subsets,
  Unruly) keeps every action it had, reached as `design.md` sets out game by
  game. Two games change a control: **Net's lock** gains a tap in Marks mode,
  and **Pattern's** buttons cycle a square black, white, gray, as its Enter and
  Space keys (and its old touch input) already did.
- **Help** (`help/features.md`, the game pages, the Controls paragraphs built
  from verb declarations) and the specs stop mentioning the middle button, the
  Shift-click and Ctrl-click remaps, and touch-only cycles.

## Not in this change

The audit of every action against each input (`audit-input-affordances`) and
the structural guarantee for hint actions (`afford-every-hint-action`). Keyed
modifiers (Shift+arrow, Ctrl+arrow) are keyboard gestures and stay. Whether the
actions they perform need a pointer route is a question for the audit.

## Impact

Player-visible: the middle button and the Shift-click and Ctrl-click remaps
stop working; touch in Loopy behaves like the mouse; Pattern's mouse cycles
like its keyboard and touch; Net's lock gains a Marks-mode tap; Mines previews
a chord when pressing a number that has all its flags; `help/features.md` drops
its advice to Ctrl-drag for a right-drag, which Chrome delivers directly. No
save or ID format changes: no move encoding reads a button.
