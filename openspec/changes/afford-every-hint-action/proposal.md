# afford-every-hint-action

**Status: scaffolded, not started (2026-09-30).** Owner-requested.

## Why

Net's new hint (`add-net-hint`) tells the player to lock a square, and a touch
player cannot lock one: a tap rotates anticlockwise, a long press clockwise, and
the lock is the middle button, Shift-click or `S`. Found in playtest
(2026-09-30). The hint bar's rule 6 says a hint relies only on marks the player
can make, and nothing in the engine checked *how* the player makes them. A
hint that asks for an action one of the three inputs cannot perform is a hint
that player cannot follow, and today the collection finds that out by
accident.

Owner, 2026-09-30: the engine must make it **impossible**, not merely tested
against, to create a hint that uses an action not afforded by **each** of
three inputs used **alone**:

- **keyboard only** — keys, with no pointer;
- **mouse only** — left and right buttons, clicks and drags, with no key held.
  A mouse action is a right-click rather than a press held still in one place
  (owner, 2026-09-30: long presses are for touch, where there is no right
  button); drags are fine;
- **touch only** — tap, long press and drag, one finger.

**No combinations.** Every action must be reachable by each input on its own:
no Shift-click, Ctrl-click or any other key held with a mouse press, and no
middle button.

And, in the same change: **remove the middle mouse button, and every
keyboard+mouse combination, as affordances entirely.** In 2026 the middle button
is not a common control and many touchpads do not send one, and a combination
is an affordance only a player with both hands on both devices has.

## What changes

### 1. Audit every affordance

For every registered game, list each action (each distinct kind of move and
each UI-state change a hint could ask for) and how it is reached by
**keyboard only**, **mouse only** and **touch only** (tap, long press, drag;
no key held with the mouse, no second finger). Record the gaps. Known already: Net's lock on touch. Take the
population from the registry and measure, don't reason from source: the
instruments exist (`testing/input-probe.ts`'s `boardsReached`, the
input-parity sweeps). A game whose touch input the probe cannot drive is itself
a finding.

### 2. The engine guarantees it, structurally

A hint step's moves are to be **constructed only from afforded actions**, so
an unafforded one cannot be expressed, rather than checked for after the fact.
The direction to design against, not a settled design:

- **Actions are declared with their affordances.** The target-verb model is
  most of the way there: a verb already names its button and its keys. Extend
  it so every verb states how each input reaches it, and so the model refuses a
  declaration where touch (or keyboard, or mouse) has no route to a verb.
- **A hint's moves come only from declared actions.** Net's hint already builds
  its moves through `targetVerbs` (`add-net-hint` design D5); make that the
  only way — e.g. a hint step carries the action it performs (a verb and a
  target), and the midend derives the move, so a hint cannot hand back a raw
  move at all. Games outside the model (drag games, candidate games, sliding
  games) need the same shape for their actions: that is most of the work, and
  where `declare-drag-games-click-half` and this change should be designed
  together.
- **Where a structural guarantee is not reachable for a game yet**, a guard
  replays every hint step of the cross-game hint walk through each input's own
  gestures, used alone (mouse: left and right clicks and drags, no key held,
  no press held still; keyboard: keys only; touch: tap, long press and drag) and fails if one cannot make the step's move. State for each such game
  why it is not structural yet; the list is to shrink to empty.

### 3. Remove the middle mouse button and every mouse+key combination

- The frontend stops producing `MIDDLE_BUTTON`/`MIDDLE_DRAG`/`MIDDLE_RELEASE`
  (`view-interactive.ts` maps the auxiliary button and **Shift-click** to it
  today), and stops remapping a press by a held key at all: Ctrl-click (which
  swaps the buttons there today) and Shift-click both go. A pointer press
  carries no keyboard modifier into a game.
- Find every game that reads a modifier on a pointer press or drag (`MOD_SHFT`
  / `MOD_CTRL` on a `*_BUTTON`/`*_DRAG`/`*_RELEASE`), by the shape of the test
  and not by name, and give each such action a route every input has alone.
  Modifiers on **keys** (Shift+arrow, Ctrl+arrow) are keyboard-only and not in
  scope — but each action they perform still needs a mouse-only and a
  touch-only route under part 2 (Net's Ctrl+arrow moves the source, and
  Shift+arrow scrolls a wrapping grid: neither has a pointer route today).
- The target-verb model loses its `middle` slot; `controlsMarkdown` stops
  saying "Middle-click it (or Shift-click it)".
- Every game with a middle-button action gets a route every input has.
  Measured by name 2026-09-30 (re-take it by reference and by probe before
  trusting it): Ascent, Boats, Clusters, Loopy, Mines, Net, Netslide, Pattern,
  Pearl, Salad, Sticks, Subsets, Unruly. Known cases: Net's lock; Mines' chord
  (it also previews the 3×3 while held); Loopy's and Subsets' "clear" (also on
  Backspace, which touch lacks); Unruly's middle verb.
- The replacements are player-visible controls, and the owner decides them.
  Present each game's proposed control with the alternatives: an on-screen key
  (the Marks-key pattern), a mode, a gesture. Don't pick silently.
- Help pages and specs that mention the middle button or Shift-click follow.

## Hints to pull in

None. This change constrains every hint; it checks itself against the hinted
games, Net first, since Net's lock is the case that found it.
