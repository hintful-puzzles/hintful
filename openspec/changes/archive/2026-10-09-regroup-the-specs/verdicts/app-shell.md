# Verdicts: app-shell

## keep `app-shell`: The chrome follows a recorded design direction of this project's own

It is the rule a change to the chrome is checked against, and it holds a
refusal that still binds: the chrome is not `puzzles-web`'s layout. A session
restyling a panel reads `app-shell`, not a guide about how work is tracked.
The direction it speaks of is findable from the code it governs: the head of
`src/css/theme.css` names it (`design-front-page-and-chrome`, `design.md` §4.1
and §4.2), and so do `src/css/fonts.css` and `src/css/home-screen.css`.

## cut `app-shell`: A design direction is chosen on sight, before any code

process: it says who decides and in what order the work is done, and nothing about what the chrome is. No guide stated it (searched `docs/` and `AGENTS.md` for "design direction", "drawn alternatives" and "on sight"; `docs/doctrine.md` and `docs/work-management.md` have neither), so the `guide` entry below puts it in `docs/work-management.md` § "What the owner accepts", where a session reads what waits for the owner.

## guide `docs/work-management.md` § "What the owner accepts"

A new visual direction for the chrome is the first of the three and is never
a call to make alone: the owner chooses it on sight, from drawn alternatives,
before any implementation begins. A visual direction is a decision made by
looking, and code written ahead of it is work spent on a guess. This is about
a direction (a palette, a type scale, the layout of a surface) where none is
recorded for the surface being changed; a change inside the recorded direction
cites it and goes ahead (`app-shell`, "The chrome follows a recorded design
direction of this project's own"; the head of `src/css/theme.css` names the
one in force).

## keep `app-shell`: The key shown on a control is the key that is bound

The rule under it is one a player sees: a key drawn on a control works. It is
the reason for the label test in `src/puzzle/shortcuts.test.ts` ("the label
names a key that is bound"), which reads the key back out of the rendered
label and presses it, and a test is not a home for the reason. A session
adding a shortcut or changing `shortcutLabel` checks against it.

## keep `app-shell`: Every bare shortcut letter is swept against every game

A rule a guard exists to hold, and the exact-equality clause is the part with
a consequence of its own: it is what makes a ledger entry die when its game
stops claiming the letter (the requirement's second scenario), and what lets
the sweep in `src/puzzle/shortcuts.test.ts` be "sufficient, not exhaustive"
without convicting wrongly. The ledger has an entry today (Tents, `n`), so a
session porting a game that binds a letter is held to it.

## keep `app-shell`: A preference exists only while something reads it

`docs/doctrine.md` does not state it: its only mention of a preference is
preference keys as a compatibility matter under "Nothing is sacred". The rule
is about what a player is shown (no inert control), and the session it binds
is one adding or retiring a setting in the chrome, which reads `app-shell`.

## keep `app-shell`: The remembered board is its full game ID, difficulty included

It is a promise about a stored field: `PuzzleSettings.lastGameId`
(`src/store/db.ts`), written from `puzzle.currentGameId` in
`src/screens/puzzle-screen.ts`. "The app hands out boards, never seeds" is
about what a player is shown and can copy; this is about what the settings
record holds and that reopening restores the chosen tier, which is the
scenario a player would notice broken. A save field is never cut.

## keep `app-shell`: The app hands out boards, never seeds

Named only as the overlap of the requirement above. It stands as it is; the
two say different things, as that entry gives.

## keep `app-shell`: Only the Menu scrolls

Named as what now covers the Game controls panel at a phone width. It stands
unchanged. What it does not cover is in the note on the cut phone-width
requirement below; it is already at its length bound, so the residue cannot be
folded into it.

## reword `app-shell`: The app shell shows a non-blocking, responsive reference panel

It was stale against "Everything that depends on the game is in the Game
controls", which puts Reference in the Game controls panel and nowhere else,
and against the code: the control is drawn by
`src/puzzle/components/game-controls.ts` (`data-command="toggle-reference"`,
its only control), while Hint is on the Bar (`src/puzzle/command-list.ts`).
The "same toolbar button group as Hint" and the scenario's "next to Hint" are
replaced by a pointer to the requirement that places the control. Nothing else
changed: shown only when `hasReference` is true, a disclosure and not a modal,
non-blocking in both layouts, both scenarios kept.

### Requirement: The app shell shows a non-blocking, responsive reference panel

The app shell SHALL render a reference control only when `hasReference` is
true, where "Everything that depends on the game is in the Game controls"
puts it. Activating it SHALL toggle a `<reference-panel>` open and closed like
a disclosure, not a one-shot modal. The panel SHALL be non-blocking and SHALL
keep the board visible and interactive while open, in both of its layouts.

#### Scenario: The control appears only for a reference-bearing game

- **WHEN** the active game reports `hasReference` true
- **THEN** a reference toggle is shown in the Game controls panel; for a game
  reporting false, no such control is shown

#### Scenario: The panel keeps the board interactive and updates live

- **WHEN** the panel is open and the player places or removes a piece on the
  board
- **THEN** the board input is unaffected by the panel, and the panel's
  checklist status reflects the new board without being reopened

## keep `app-shell`: The board spotlight persists when the reference panel is closed

It belongs here and is not stale. Each clause is what the code does:
`toggleReference` in `src/screens/puzzle-screen.ts` closes the panel without
clearing the spotlight; the screen's key handler clears it on Escape through
the open panel's `clearSelection` or, with the panel closed, by
`selectReference(null)`, and does not close the panel; `handleItem` in
`src/components/reference-panel.ts` deselects on a second click; Dominosa's
`interpretMove` clears `ui.highlightPair` on any board tap.

## keep `app-shell`: The reference panel is a region of the same layout

It is the current statement and agrees with `gridLayout` in
`src/puzzle/layout.ts`: a column after the Game controls column when the shape
is not tall, and a row under the words and above the Game controls when it is.
The stale wording was in the requirement reworded above, not here.

## guide `docs/games/testing.md` § "The test tiers"

**A pointer press focuses nothing in `happy-dom`.** It does not focus an
element on `mousedown`, so a Tier 3 test cannot observe where keyboard focus
lands after a press, and a test of "this press does not take focus from the
board" passes whether or not the code is right. Assert the cause the code
controls (that the `mousedown` default was prevented, say), write in the test
that it is a proxy, and look at the consequence in Chrome:
`document.activeElement` after the press, and a physical key reaching the game
straight after. `src/puzzle/components/keys.test.ts` is the worked case.

## note the cut "The chrome does not overflow at a phone width" left a residue no requirement holds

The pruning cut it as `duplicate` of "The readouts are one row, and the chips
give way first" (the readout row at 320 px) and "Only the Menu scrolls" (the
Bar at 360 px, no caption over a neighbor). Those two do cover the readout row
and the Bar, at narrower widths than the 390 px the cut requirement named.
What they do not cover is the Game controls panel under the board in a tall
phone window: the cut scenario said that at 390 CSS pixels "no chrome element
overlaps another, and no control's label is truncated to fewer characters than
it needs", and "Only the Menu scrolls" speaks only of Game controls beside the
board fitting their height. No test holds the residue either: no file under
`src/` renders the puzzle screen at 390 px (searched the test files for 320,
360 and 390; the hits are layout arithmetic and games' own numbers). A player
would notice it broken, so the cut was not a true duplicate for this part.
This brief gives no form that adds a requirement and "Only the Menu scrolls"
is at its length bound, so it is raised here with a recommendation: restore it
in `app-shell` as a requirement titled "The Game controls do not overflow at a
phone width", saying that at 390 CSS pixels wide the Game controls panel SHALL
lay out without horizontal overflow, with no control overlapping another and
no caption truncated, with the cut requirement's scenario narrowed to that
panel. I did not run the app at that width.

## note a stale comment in `src/screens/puzzle-screen.ts`

The comment on `toggleReference` says "the toolbar reference button and the
game menu both route here". There is one control with
`data-command="toggle-reference"`, in
`src/puzzle/components/game-controls.ts`; neither a toolbar button nor a Menu
row exists.
