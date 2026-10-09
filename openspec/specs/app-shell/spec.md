# app-shell Specification

## Purpose
The app's chrome around the puzzles: the puzzle screen's panels and commands,
its keyboard and focus handling, the press-and-release stream it delivers to a
game, the board and params it restores and reports, and the home screen's
navigation.

## Requirements

### Requirement: Pressing a control gives the keyboard back to the board

The puzzle screen SHALL return keyboard focus to `puzzle-view-interactive`
after a control has been pressed with a pointer. This SHALL cover both routes a control can take: the
command bus (every `data-command` control), and a pointer click anywhere in
the chrome, since a control can be both a `data-command` and a menu trigger.

#### Scenario: Enter reaches the board after a menu command

- **WHEN** the player picks a command from a menu and then presses Enter
- **THEN** the key reaches the puzzle, and does not reopen the menu

#### Scenario: The cursor keys reach the board after a click on a command

- **WHEN** the player clicks a control in the command surface (undo, hint,
  check & save, …) and then presses a cursor key
- **THEN** the key reaches the puzzle

### Requirement: A dialog a command opens returns focus to the board

A command that opens a dialog SHALL need no exception to the return of focus:
the dialog takes focus when it opens, and SHALL return it to the board, not to
the control that opened it, when it closes.

#### Scenario: A dialog opened from a control is closed

- **WHEN** the player clicks a control that opens a dialog, closes the dialog
  and presses a cursor key
- **THEN** the key reaches the puzzle

### Requirement: Focus is not taken from a player who is using the keyboard

Returning focus to the board SHALL NOT override a player who is navigating by
keyboard, in either of two cases. A click that opens a menu SHALL leave focus
alone, because the open menu needs it for its own arrow-key navigation. A
control activated from the keyboard, which arrives as a click with a `detail`
of 0, SHALL also leave focus alone, because that player is moving through the
tab order and would lose their place.

#### Scenario: A menu opened with the mouse can still be driven with the keyboard

- **WHEN** the player clicks a dropdown's trigger button
- **THEN** the menu opens with focus inside it, and the cursor keys navigate it

#### Scenario: Tabbing to a button and pressing Enter keeps the tab position

- **WHEN** the player tabs to a control in the command surface and activates it
  with Enter
- **THEN** focus stays on that control

### Requirement: Dismissing a menu returns focus to its trigger

Dismissing a menu with Escape or a click-away SHALL return focus to the menu's
trigger, and not to the board.

#### Scenario: A menu is dismissed with Escape

- **WHEN** the player opens a menu and presses Escape without choosing
- **THEN** the menu closes and focus is on the menu's trigger

### Requirement: Every press delivered to a puzzle is followed by exactly one release

The interactive puzzle view SHALL deliver a release (or cancel) event to the
puzzle for every press it has delivered, exactly once, in every game and
whatever the timing of the asynchronous round-trip that carries the press to
the engine. A pointer release that occurs while its press is still in flight
SHALL be retained and delivered once the press has been acknowledged, not
discarded. A press the puzzle declines SHALL be followed by an immediate
release.

#### Scenario: A click completed before the press is acknowledged still releases

- **WHEN** the player presses and releases a pointer faster than the press
  reaches the puzzle engine
- **THEN** the puzzle receives the press and then the release
- **AND** any state the puzzle shows only while a press is held (a drag
  highlight, a lifted piece, a drag preview) is cleared without waiting for a
  later, unrelated input

#### Scenario: A release is never delivered twice

- **WHEN** a pointer release arrives after the press has already been
  acknowledged
- **THEN** the puzzle receives exactly one release for that press

### Requirement: A puzzle page reopens on the board it was last showing

Opening a puzzle SHALL show the board that puzzle last dealt, and not a new
one, whenever nothing more specific applies. The order of preference SHALL be:
a game ID supplied in the URL, then the most recent autosave, then the last
board this puzzle dealt, then a new game.

#### Scenario: An untouched board survives a reload

- **WHEN** a puzzle is opened, no move is made, and the page is reloaded
- **THEN** the same board is shown, and no autosave record exists for that puzzle

#### Scenario: A started game still restores from its autosave

- **WHEN** a puzzle is opened, moves are made, and the page is reloaded
- **THEN** the board and the moves are restored from the autosave, not re-dealt
  from the recorded game ID

### Requirement: The last dealt board is remembered in the settings, not as an autosave

The last dealt board SHALL be recorded as a game ID in the puzzle's settings
record, and SHALL NOT be recorded as an autosave. The autosave table is what
the home screen reads to badge a puzzle as having a game in progress, and a
row written for a board the player has not touched would badge every puzzle
they have merely opened.

#### Scenario: Browsing puzzles does not badge them as in progress

- **WHEN** a puzzle is opened and left without a move
- **THEN** the home screen does not show that puzzle as having a game in progress

### Requirement: The remembered board is its full game ID, difficulty included

The recorded game ID SHALL be the board's one game ID, which carries the full
params encoding, difficulty included, so that re-dealing a remembered board
restores the tier the player chose.

#### Scenario: A reopened board keeps the difficulty it was dealt at

- **WHEN** a tiered puzzle is dealt at a non-default difficulty, no move is made,
  and the page is reloaded
- **THEN** the same board is shown **and** the puzzle still reports that
  difficulty, so the next new game is dealt at it
- **AND** the type control names that difficulty and not the default one

### Requirement: A remembered board this build cannot deal is dropped quietly

A recorded game ID that this build can no longer deal SHALL be discarded and
replaced by a new game, without interrupting the player: they did not ask for
that board, so its loss is not a decision to put in front of them. A game ID
supplied in the URL SHALL still report its failure.

#### Scenario: A remembered board this build cannot deal is dropped quietly

- **WHEN** a puzzle is opened whose recorded game ID no longer validates
- **THEN** a new game is dealt, the recorded ID is cleared, and no alert is shown

#### Scenario: An id in the URL that cannot be dealt

- **WHEN** a puzzle is opened by a URL whose game ID does not validate
- **THEN** a warning says the id was ignored

### Requirement: Escape reaches the puzzle when there is no gesture to cancel

Escape SHALL be delivered to the running puzzle as button `27` whenever no
pointer gesture is in flight, which is what a game's `interpretMove` tests to
put a piece back down. When a pointer is down, Escape SHALL instead cancel
that gesture, as a canceled pointer does (`engine-input`, "A canceled press
leaves the game as it was before the press"), and SHALL NOT also arrive as a
keypress, so a game never sees one Escape as two events.

#### Scenario: Escape with no pointer down reaches the puzzle

- **WHEN** the player presses Escape while no pointer gesture is in flight
- **THEN** the puzzle receives button `27`

#### Scenario: Escape with a pointer down cancels the gesture only

- **WHEN** the player presses Escape while a pointer is down
- **THEN** the puzzle receives a cancel of the press, and no drag or release
- **AND** it does not additionally receive button `27`

### Requirement: Delivering Escape leaves the browser's own handling alone

The delivery of Escape to the puzzle as button `27` SHALL NOT suppress the
browser's default handling, so that Escape composes with the reference
spotlight and with any dialog above the board.

#### Scenario: Escape with a reference spotlight showing

- **WHEN** the player presses Escape at the board, with no pointer down, while
  a reference item is spotlit on it
- **THEN** the spotlight is cleared, and the puzzle receives button `27`

### Requirement: The params a puzzle reports are the full params of the board on screen

The params a puzzle reports for display SHALL be the **full** encoding of the
board currently on screen, difficulty included. They label the type control,
describe the type in the share dialog, and key the keypad and view re-renders,
and every one of those is wrong if the difficulty is missing. They SHALL be read
from the board's game ID, which carries the full encoding.

#### Scenario: A board with no seed still reports its difficulty

- **WHEN** a board is restored from a descriptive game ID
- **THEN** the params it reports carry the difficulty the board was dealt at

#### Scenario: The reported params follow a re-deal

- **WHEN** a new board is dealt at a different difficulty
- **THEN** the params reported change with it and do not keep the first value
  seen

### Requirement: The chrome follows a recorded design direction of this project's own

The app's chrome (the front page, the puzzle screen's readout row, panels,
keypad and dialogs, and the design tokens they are built on) SHALL follow a
design direction chosen by the owner and recorded in this project, and not the
layout inherited from `puzzles-web` with the shell. The recorded direction
SHALL be specific enough to implement from (palette tokens, type scale,
spacing, radius, and the layout of each surface), and a change that alters the
chrome SHALL cite it.

#### Scenario: A redesign is proposed

- **WHEN** a change proposes to alter the look or layout of the chrome
- **THEN** it cites the recorded design direction it implements or amends

### Requirement: A design direction is chosen on sight, before any code

The design direction SHALL be chosen by the owner on sight, from drawn
alternatives, before any implementation begins: a visual direction is a
decision the owner makes by looking, and code written ahead of it is work
spent on a guess.

#### Scenario: A redesign is proposed where no direction is recorded

- **WHEN** a change proposes to alter the look or layout of the chrome and no
  direction is yet recorded for it
- **THEN** it produces one first, chosen by the owner from drawn alternatives,
  and lands no code until then

### Requirement: Checking a board never costs a player their checkpoint

The combined check-and-save command SHALL remain in the chrome's most
reachable tier, SHALL verify first, and SHALL refuse to save over a mistake or
a dead end, so that a saved checkpoint is a known-good one. Where a game can
check (`canCheck`: it implements `findMistakes` or has a hint), the puzzle
screen SHALL also offer a quieter command that runs the same check and reports
the result without writing a checkpoint: the quick-save slot is one per
puzzle, and the combined command overwrites it.

#### Scenario: Checking without saving preserves an earlier checkpoint

- **GIVEN** a checkpoint saved at an earlier position
- **WHEN** the player runs the check-without-saving command at a later position
- **THEN** the mistakes are highlighted and the count reported
- **AND** returning to the checkpoint still restores the earlier position

#### Scenario: Checking a dead end without saving

- **WHEN** the player runs the check-without-saving command on a position the
  hint calls a dead end
- **THEN** the hint's sentence is reported in a toast and what it names is
  marked, and nothing is saved

### Requirement: Check without saving is offered only where the game can check

The check-without-saving command SHALL appear only where the game reports that
it can check, derived from the game and not from a list of games. Elsewhere it
SHALL be absent, not present and disabled.

#### Scenario: A game that cannot find mistakes

- **WHEN** the game neither implements `findMistakes` nor has a hint
- **THEN** the check-without-saving command is absent, not present and
  disabled

### Requirement: Undo and redo have keyboard shortcuts

The app SHALL bind `Ctrl/Cmd+Z` to undo and `Ctrl/Cmd+Shift+Z` and `Ctrl+Y` to
redo, in every game, and `Ctrl/Cmd+S` SHALL stay bound to the combined
check-and-save. A control whose command has a chord SHALL show the first one,
where "The Bar does not draw a command's key" puts it.

#### Scenario: Undo from the keyboard

- **WHEN** a player presses `Ctrl/Cmd+Z` with moves to undo
- **THEN** the last move is undone

#### Scenario: Check & save shows its key

- **WHEN** a player hovers the Bar's Check & save slot
- **THEN** its tooltip names `Ctrl/Cmd+S`

### Requirement: A bare letter is an app command only when the game declines it

Single-letter shortcuts SHALL be offered only behind a preference, and SHALL
NOT fire for a game that consumes that letter as input. That SHALL be derived
from the game's own behavior, not any declaration about it: the key is
offered to the game first and becomes an app command only if the game declines
it, which the midend reports by returning false exactly when `interpretMove`
returned null. No game SHALL have to declare anything, one that consumes a
letter it never puts on a keypad included.

#### Scenario: A game that takes letter input

- **WHEN** single-letter shortcuts are enabled
- **AND** the game consumes that letter as input
- **THEN** the letter reaches the game and does not trigger the app command
- **AND** the game declared nothing to bring that about

### Requirement: The key shown on a control is the key that is bound

The key shown on a control SHALL be asserted equal to the key that is bound,
so that a shortcut label cannot become decorative.

#### Scenario: The shown key is the bound key

- **WHEN** a control displays a keyboard shortcut
- **THEN** a test asserts that pressing exactly that key invokes exactly that
  command

### Requirement: Every bare shortcut letter is swept against every game

The suite SHALL sweep each bare letter in the shortcut table against every
registered game, on a fresh board and with the keyboard cursor revealed, and
SHALL fail on a game that consumes one: that shortcut does nothing in that
game, silently, while every test of the table stays green. A game that keeps
its own meaning for a letter SHALL be on a ledger whose entry says why a
player is not worse off, and the ledger SHALL be asserted exactly equal to the
set found.

#### Scenario: A game that swallows a shortcut letter is caught

- **WHEN** a registered game consumes a bare shortcut letter on a fresh board or
  with its cursor revealed
- **THEN** the sweep fails and names the letter and the command it cost, unless
  that game is on the ledger

#### Scenario: A game on the ledger stops claiming its letter

- **WHEN** a game on the ledger no longer consumes any bare shortcut letter
- **THEN** the sweep fails until its entry is deleted

### Requirement: The chrome offers the hint and never urges it

No control in the chrome SHALL be styled to recommend taking a hint. The hint
SHALL be as reachable as any other command (same surface, same label, the same
two beats of show-then-apply) and SHALL NOT be given an emphasis that sets it
above the commands beside it: whether to take a hint is the player's call. The
hint's own amber is unaffected: the explanation is the hint speaking, as
loudly as it likes once asked, and the button is the chrome offering, which it
SHALL do plainly.

#### Scenario: A player opens a puzzle they have not asked for help with

- **WHEN** the puzzle screen renders its command surface
- **THEN** no control is emphasized for being the hint

### Requirement: A preference exists only while something reads it

A setting SHALL NOT be offered to a player unless the state it controls changes
something the player can observe. Where the condition a setting reveals or hides
can no longer occur, the setting and every surface built on it SHALL be removed
together and not left as an inert control: a control that cannot change what a
player sees still costs them the attention to read it and decide.

#### Scenario: The condition a setting gates can no longer arise

- **WHEN** nothing in the shipped product can put a player in the state a
  preference exists to control
- **THEN** the preference is removed, together with the filters, badges and
  dialogs that read it

### Requirement: The home screen's navigation has no layer it does not need

The home screen's header SHALL present its destinations directly and not
behind a menu, unless the number of destinations makes a menu the shorter path.
A page's own title SHALL NOT be a menu trigger. About SHALL have no menu row:
the footer links to it in prose and names what is inside it.

#### Scenario: A menu is left holding what a player could reach directly

- **WHEN** a navigation menu's contents shrink to what fits beside it
- **THEN** the menu is removed and its destinations are presented directly

### Requirement: Custom type… SHALL open its dialog from every Type menu, titled by name

Choosing "Custom type…" from a Type menu SHALL open the game's Custom dialog
wherever that menu is drawn, a component's own shadow root included, and the
dialog SHALL be titled with the game's display name, never its id. The name
belongs to the catalog, and the engine knows a game only by its id, so the
engine's form description SHALL carry no title.

#### Scenario: Custom type… opens from a menu inside a shadow root

- **WHEN** a player chooses Custom type… from Type chips drawn inside a
  component's shadow root
- **THEN** the Custom dialog opens, with no error

#### Scenario: The dialog is titled by the game's name

- **WHEN** the Custom dialog opens for Abcd
- **THEN** its title is "Custom ABCD", not "abcd"

### Requirement: Every puzzle belongs to exactly one family, and the home screen narrows by it

Each catalog entry SHALL name exactly one family from the catalog's list of
families, and the home screen SHALL offer one chip per family that narrows the
list to that family's puzzles. A family is a value that the chips, the search
box and the quick-switch consume, not a manifest: work that takes a family as
its population SHALL read it through `puzzlesInFamily` and SHALL NOT type a
list. Where code can vouch for a family, a test SHALL hold the tag to the code.

#### Scenario: A family chip narrows the list, and pressing it again releases it
- **WHEN** a player presses the "Shading" chip on the home screen
- **THEN** the list shows exactly the puzzles whose family is Shading, still
  subject to the search box and the All / Favorites / In progress filter
- **AND** pressing the same chip again shows every family

#### Scenario: A family's name finds its puzzles
- **WHEN** a player types a family's label into the home screen's search box
  or the quick-switch
- **THEN** every puzzle in that family matches, whether or not the family's
  name appears in the puzzle's objective

#### Scenario: The taxonomy stays well-formed
- **WHEN** the catalog is checked
- **THEN** every puzzle is in exactly one family, no family has fewer than two
  puzzles, and no two families share a label

#### Scenario: A family the code can vouch for agrees with the code
- **WHEN** a game imports the shared Latin hint vocabulary
- **THEN** its family is Latin squares
- **AND** every game whose family is Latin squares uses the shared Latin engine

### Requirement: From a puzzle, the quick-switch opens on the rest of that puzzle's family

When the quick-switch is opened from a puzzle and nothing has been typed, it
SHALL list the other puzzles of the current puzzle's family first, under a
heading naming the family, followed by every puzzle. Once anything is typed,
the search SHALL answer instead, and the grouping SHALL be dropped.

#### Scenario: Opening the switcher on a Latin square
- **WHEN** a player opens the quick-switch while playing Solo, with nothing
  typed
- **THEN** the list begins with the other Latin squares under "More Latin
  squares", followed by every puzzle under "All puzzles", each puzzle listed
  once
- **AND** Solo is marked as the puzzle being played

#### Scenario: Typing drops the grouping
- **WHEN** the player types into the quick-switch
- **THEN** the list shows only the matching puzzles, without family headings

### Requirement: The on-screen key panel never takes keyboard focus

A press on an on-screen key SHALL NOT move keyboard focus. The panel SHALL
suppress the focus a pointer press would otherwise give the key it lands on,
and SHALL NOT hand focus back afterwards as a command control does. The panel
is an input surface, not a control: panel and keyboard are two spellings of
the same keypress, and using one SHALL NOT switch the other off.

#### Scenario: A physical key reaches the board straight after an on-screen key

- **WHEN** the player clicks a key on the on-screen panel and then presses a key
  on the keyboard
- **THEN** the keypress reaches the puzzle, with no click on the board in
  between

#### Scenario: A mouse press on an on-screen key

- **WHEN** a mouse press lands on an on-screen key
- **THEN** the key is not focused, and the click that follows still types it

### Requirement: A new board is dealt to fit the space it is drawn in

The puzzle view SHALL report the space available to the board, measured before
any `maxScale` cap, to its `Puzzle` whenever it measures, and when it is first
given a `Puzzle`, so that the first board can fit as well. Every new game the
app deals SHALL pass that area to the engine's deal, which chooses which way
round a board that can turn is dealt. A board already on screen SHALL NOT be
turned when the space changes shape: the next new game fits the new shape.

#### Scenario: The measured area reaches the deal

- **WHEN** the view has measured a wide area and a new Magnets game is dealt from its 5×6 preset
- **THEN** the board on screen is 6×5

### Requirement: A chosen size is a size and not an orientation

The size a player chose, whether a preset or a remembered or custom size, is a
size and not an orientation: it SHALL be dealt turned to fit on a screen held
the other way round, and SHALL be remembered as chosen.

#### Scenario: A chosen size on a screen held the other way round

- **WHEN** a player who chose Magnets' 5×6 preset deals a new game in a wide
  area
- **THEN** the board is dealt 6×5, and the remembered type is still the 5×6
  preset

### Requirement: A board dealt turned keeps its preset's name

The type header SHALL name a board dealt turned on its side by the title of the
preset it was dealt from, found by matching the board's params either as they
are or turned back. The title names the kind of board chosen, and the preset
SHALL stay checked in the menu. The Custom dialog SHALL show the size the board
was dealt at.

#### Scenario: A turned board reads as its preset

- **WHEN** Magnets' "5x6 Normal" preset has been dealt as 6×5
- **THEN** the type header reads "5x6 Normal"

#### Scenario: A size no preset turns into is not given a preset's name

- **WHEN** the board's params match no preset either way round
- **THEN** the header names no preset

### Requirement: The solve timer has its own place in the chrome

While a game's timer is on, the app SHALL show the elapsed time at the end of
the readout row above the board, at every window size. It SHALL be absent, not
blank, while the timer is off. The solved message SHALL state the time, and
SHALL say beside it when help was taken on the board. The app SHALL pause the
timer while the page is hidden.

#### Scenario: The timer is off

- **WHEN** a game's timer is off
- **THEN** no timer element takes space in the readout row

#### Scenario: A helped solve

- **WHEN** a player who used a hint solves a board with the timer on
- **THEN** the solved message reads "Finished in M:SS, with help" and not "Solved in M:SS"

### Requirement: The readouts are one row, and the chips give way first

The puzzle screen SHALL hold the back link, the game's name, the type chips
and, while it is on, the timer, on one row above the board at every window
size, which SHALL NOT overflow at 320 CSS px. The row SHALL hold readouts and
the ways to another puzzle, and no command on the board. When the row is short
of space, the chips SHALL be clipped before the game's name, and no chip SHALL
draw outside its own box.

#### Scenario: A long preset title on a narrow phone

- **WHEN** a game whose preset title is "Size 9 Hexagon Hard" is open at 320 px with the timer on
- **THEN** the row does not overflow, the name is shown whole, and the chip is clipped with an ellipsis and does not run under the timer

### Requirement: The move counter is not in the readout row

The move counter SHALL NOT appear in the readout row: it is the timeline's
control, in the Menu's Board group.

#### Scenario: The readout row with moves made

- **WHEN** a player has made moves and the readout row is drawn
- **THEN** the row shows no move counter, and the Menu's Board group does

### Requirement: The game's name opens the quick-switch

The game's name in the readout row SHALL be a button inside the page's heading
that opens the quick-switch, the same one the Menu's `Switch puzzle…` row
opens, and SHALL show a mark that says it opens something.

#### Scenario: The name opens the quick-switch

- **WHEN** the player taps or clicks the game's name above the board
- **THEN** the quick-switch opens, as it does from the Menu's `Switch puzzle…` row

### Requirement: The back link shows its words where the window is wide

The readout row's back link SHALL show its words where the window is wide, and
its icon alone elsewhere, with the words as its accessible name.

#### Scenario: The back link on a phone

- **WHEN** the puzzle screen renders in a narrow window
- **THEN** the back link shows its icon alone, and its accessible name is
  "All puzzles"

### Requirement: A menu inside the Menu stays open until a choice is made in it

A menu trigger inside the Menu SHALL NOT also be a command, because a command
chosen from a Menu that is over the board closes it and takes the menu with it. A choice made
in such a menu SHALL close a Menu that is over the board, as a command chosen from it does.

#### Scenario: Jumping to a checkpoint from the sheet

- **WHEN** the player opens the Menu on a phone, taps the move counter, and picks a checkpoint
- **THEN** the timeline stays open until the pick, and the pick closes the sheet

### Requirement: A page a deploy left stale recovers instead of going blank

When a file the page needs cannot be loaded, whether a lazily imported chunk or the puzzle
worker's script, the app SHALL reload once, and SHALL report the error if a reload in the last
thirty seconds did not help. A puzzle worker that fails to start SHALL NOT leave the board
waiting indefinitely: a script that could not be loaded SHALL be treated as a stale page, and
an error thrown by the worker's own code during startup SHALL be reported.

#### Scenario: The worker's script is gone after a deploy

- **WHEN** a page from the previous build opens a puzzle and its worker script answers 404
- **THEN** the page reloads once and does not show a blank board

#### Scenario: Reloading did not help

- **WHEN** the worker's script is still missing after that reload
- **THEN** the crash dialog reports it, and the board does not stay blank

### Requirement: A remembered board type that no longer loads is replaced with a warning

When the board type remembered for a game is rejected, the app SHALL forget it, deal the
first preset unless a restored game brings its own type, and SHALL show a warning toast
saying the last board type could not be restored.

#### Scenario: A remembered type from an older version

- **WHEN** the remembered type for a game fails to validate on load
- **THEN** the board is dealt, and a warning toast says the last board type could not be restored

### Requirement: The catalog labels a draft, and the help gives a section's reason

The home screen SHALL label each draft game's row "Draft", beside its name, and
the label SHALL say which features are still to come, by the names a player
knows them by. A draft SHALL stay listed and playable: the label says the game
is not yet complete and hides nothing. Which games are drafts SHALL be
computed from the registered games when the app is built, and SHALL NOT be a
field of the committed catalog.

#### Scenario: A hintless game is labeled

- **WHEN** the home screen lists a game that has no hint
- **THEN** its row carries a "Draft" label saying that Hints are still to come

#### Scenario: A complete game is not labeled

- **WHEN** the home screen lists Palisade
- **THEN** its row carries no draft label

#### Scenario: A draft gains its missing section

- **WHEN** a draft game implements the last section it lacked and the app is
  built
- **THEN** its row carries no draft label, and the committed catalog is
  unchanged

### Requirement: A help page lists what is not in the game, with the game's reason

A game's help page SHALL list, in a generated "Not in this game" section above
its parameters, every contract section the game declares not applicable, with
the game's reason. A page author SHALL write nothing for it.

#### Scenario: A reason reaches the help page

- **WHEN** Fifteen's help page is built
- **THEN** it has a "Not in this game" section, above "Fifteen parameters",
  naming Checking for mistakes with Fifteen's reason

### Requirement: The app hands out boards, never seeds

Everything the app shows a player as naming a game, or lets them copy or
share, SHALL name the board itself as its game ID (`params:desc`, full params),
never a random seed. A seed names a board only through a generator, and this
project's generators change, so a seed handed out today can name a different
board tomorrow. The same ID SHALL serve showing, sharing, saving and reopening
the board.

#### Scenario: The link to this specific game

- **WHEN** the Share dialog is shown for a board dealt by New Game
- **THEN** its "This specific game" link carries the board's game ID
- **AND** the dialog shows no random seed

#### Scenario: Links to Simon Tatham's site

- **WHEN** the Share dialog is shown for a puzzle Simon Tatham's site carries
- **THEN** it links that site by the board's game ID and by its puzzle type, and by nothing else

#### Scenario: A puzzle upstream does not carry

- **WHEN** the Share dialog is shown for a puzzle outside Simon Tatham's collection
- **THEN** it offers no link to Simon Tatham's site

### Requirement: A seed ID still deals a game

A `#seed` ID arriving from a link, a paste or another collection SHALL still
deal a game, the one the current generator deals for it.

#### Scenario: A seed ID still opens

- **WHEN** a player opens a `params#seed` ID
- **THEN** the app deals the board the current generator deals for that seed

### Requirement: A command that acts on the board waits for the first board

A puzzle page holds its engine before it holds a board: the first board is
dealt, or reopened from an id or a save, after the page has its controls. A
command that reads or acts on the board in play (a hint, Auto-solve, Show
solution, a check, a save, undo, redo, restart, a key or a press sent to the
game, the board as text) SHALL NOT be sent to the engine until the first board
exists. Sent earlier, it SHALL wait and be answered about the board that
arrives.

#### Scenario: Hint is pressed by key before the first board

- **GIVEN** a page that has its controls and is still dealing its first board
- **WHEN** the player presses the hint's key
- **THEN** no error is shown
- **AND** the hint is given once the board is there

#### Scenario: The board arrives from a save

- **WHEN** the first board is a restored autosave and not a deal
- **THEN** the commands that waited are answered about it

### Requirement: The controls of board commands are unavailable until the first board

Until the first board exists, the chrome SHALL draw unavailable the controls
of the commands that read or act on the board in play. A command that needs no
board (New game, the type menu, loading a game, opening a shared one, the
puzzle switcher, preferences, help) SHALL be offered throughout.

#### Scenario: The controls while the first board is dealt

- **GIVEN** a page that has its controls and is still dealing its first board
- **THEN** Hint, Auto-solve, Show solution, Check & save, Start over, Save as…,
  Fill marks, Share and Copy image are drawn unavailable
- **AND** New game and Open saved… are not

### Requirement: Undo reaches back across a Restart and a replaced board

Start over and New game are the two commands that put a player's work away,
and the app SHALL let Undo take either back, as `ts-engine` keeps a restart as
a step of the history and the board a new one replaces, one deep.

#### Scenario: Restart, then Undo

- **WHEN** a player makes moves, chooses Start over and presses Undo
- **THEN** the moves are back, and the timeline shows the restart ahead

#### Scenario: A move on the new board

- **WHEN** a player moves on the new board and undoes that move
- **THEN** Undo is unavailable

### Requirement: A loaded save keeps the board it replaces

A loaded save replaces the board as a New game does, by `Back to last save` or
`Open saved…`, and the board left SHALL be kept the same way: it lies beyond
the loaded save's first position, past the save's own moves, and the timeline
SHALL offer it at once as *Previous board*.

#### Scenario: Back to last save, then Undo past the save's first move

- **WHEN** a player saves at move 2, plays to move 4, chooses Back to last save
  and presses Undo three times
- **THEN** the first two presses take back the save's own two moves
- **AND** the third brings back the board left, at move 4, and the app says so

### Requirement: A board's checkpoints leave and return with it

A board's checkpoints are move numbers on that board. They SHALL leave with
the board when it is replaced, so that a new board starts with none, and SHALL
return with it when Undo or Redo brings it back. The app SHALL follow the
board by the number the engine gives it and not by its id, which two boards
can share and one board can change.

#### Scenario: New game, then Undo

- **WHEN** a player makes moves, sets a checkpoint, chooses New game and
  presses Undo before moving
- **THEN** the old board is back with its moves, its checkpoint and its time

### Requirement: The app says when Undo has brought back a board

When an Undo brings back a board, the app SHALL say so where a hint's words
go, since the whole board has changed under a control that usually takes back
one move, and SHALL take the words down when Redo returns.

#### Scenario: Undo brings back the board a New game replaced

- **WHEN** a player chooses New game and presses Undo before moving
- **THEN** the app says the board is back and that Redo returns

### Requirement: The timeline names a restart and the boards kept either side

The timeline SHALL name each restart at its move, and SHALL offer the board
kept before the first move as *Previous board* and the board kept after the
last as *Next board*. The help SHALL describe taking back both Start over and
New game (`help/features.md`, "Taking back Start over or a New game").

#### Scenario: The timeline after an Undo across a New game

- **WHEN** a player chooses New game, presses Undo and opens the timeline
- **THEN** it offers *Next board* after the last move

### Requirement: The puzzle screen is three panels, and every command is in exactly one

The puzzle screen SHALL present its controls as three panels, at every window
size: a **Bar**, a **Menu**, and a **Game controls** panel where the game has
any. A command a panel offers SHALL be in exactly one place across the three.
Only the readout row above
the board and the notification that ends a game SHALL repeat a panel's
command. The way out of a deal still being looked for SHALL be beside the
words that say so, under the board, and nowhere else.

#### Scenario: A command is offered twice

- **WHEN** a command in the puzzle screen's command map is reachable from more
  than one place across the three panels and the words under the board
- **THEN** a test fails, naming the command and both places

#### Scenario: A command has no home

- **WHEN** a command in the command map is reachable from nowhere in the three
  panels, and the guard's ledger gives no reason for it
- **THEN** a test fails, naming the command

#### Scenario: A command that is deliberately in no panel

- **WHEN** a command is reached another way, as Change type is from the type
  shown in the readout row and the Marks shortcut is from the key panel
- **THEN** the guard's ledger names it with its reason, and fails when the
  command gains a control in a panel or leaves the command map

#### Scenario: A game with no controls of its own

- **WHEN** a game has no reference panel, no Mark-all and no on-screen keys
- **THEN** no Game controls panel is drawn, and the Bar and the Menu are as on
  any other game

#### Scenario: Share on a solved board

- **WHEN** a player solves a board and the notification appears over it
- **THEN** Share is offered there, and the Menu's Share row is still the one
  place the panels offer it

### Requirement: The Bar and the Menu are one ordered list, cut once

The Bar and the Menu SHALL be drawn from one ordered list of commands. The Bar
SHALL show the leading entries of that list and a button that opens the Menu,
and the Menu SHALL hold every entry the Bar does not show, in the list's
order: its contents are a suffix of the list and never a selection from it.
The first four entries SHALL be on the Bar at every size: Undo, Redo, Hint and
Check & save, or in a game with no hint Undo, Redo, Check & save and Back to
last save.

#### Scenario: The Menu on a phone

- **WHEN** a player on a phone opens the Menu
- **THEN** it does not contain Undo, Redo, Hint or Check & save
- **AND** its first rows are the entries of the list that follow the last one
  the Bar shows

#### Scenario: A game with no hint

- **WHEN** a player on a phone opens the Menu of a game that has no hint
- **THEN** it does not contain Back to last save, which is the Bar's fourth
  entry there

### Requirement: Every control in a panel carries a visible label

Every control in a panel SHALL carry a visible text label, not an icon alone.
The on-screen keys that type a character are an input surface and not
controls ("The on-screen key panel never takes keyboard focus"): the character
is what they carry.

#### Scenario: A control carries no label

- **WHEN** a panel renders a control
- **THEN** it carries a visible text label, not an icon alone

### Requirement: A slot draws its icon above its caption

A control in the Bar or the Game controls SHALL draw its icon above its
caption, the same shape for every one of them, Hint included. A command's
caption SHALL name an action, and a mode's caption SHALL name the mode.

#### Scenario: The Hint slot beside its neighbors

- **WHEN** the Bar is drawn for a game with a hint
- **THEN** the Hint slot is an icon above a caption, as Undo and Check & save
  are

### Requirement: The Bar does not draw a command's key

The Bar SHALL NOT draw the key that runs a command: a slot's tooltip SHALL
carry it, with the command's full name. A Menu row SHALL write the key beside
the command only where a keyboard is likely: a pointer that is fine and can
hover.

#### Scenario: The Menu on a touch screen

- **WHEN** the Menu is drawn where the pointer is coarse or cannot hover
- **THEN** no row shows a key

### Requirement: The Menu button is beside what it opens

A bottom Bar's Menu button SHALL be at the end of the Bar nearest the side the
Menu opens on, so that the button is beside what it opens. A rule SHALL set
the Menu button apart from the Bar's commands: it opens a panel, and they act
on the board.

#### Scenario: The Menu button, by handedness

- **WHEN** the Bar is along the bottom and the Game controls are on the right
- **THEN** the Menu button is the Bar's first slot, on the left
- **AND** with the Game controls on the left, it is the last, on the right

### Requirement: Opening the Menu moves no slot of the Bar

Opening or closing the Menu SHALL move no slot of the Bar, in any layout, and
the Menu SHALL NOT cover the Bar, so that the Menu button which opened the
Menu is in view under the pointer, and a press there closes it.

#### Scenario: The same press opens and closes the Menu

- **WHEN** a player presses the Bar's Menu button, and presses the same point
  again without moving
- **THEN** the Menu opens and then closes, whether it docks beside the board,
  opens as a sheet or opens as a drawer
- **AND** every slot of the Bar is where it was throughout

### Requirement: The Bar is the same in every game, and a game's own controls are together

The Bar SHALL hold only commands every game has, so that a command keeps its
slot from one game to the next. A game with no hint has no Hint slot; no
command's slot SHALL otherwise depend on the game.

#### Scenario: The same slots in two games

- **WHEN** the Bar is drawn at one window size for Solo and for Tracks
- **THEN** it has the same commands in the same order

### Requirement: The Bar carries the button toggle

The Bar SHALL carry the button toggle: one slot, at the end away from the Menu
button and set apart by a rule, which while it is on sends a press on the
board as the right mouse button and a long press as the left. Every game
shares it, so it SHALL be on the Bar and not in the Game controls. It SHALL be
shown by default, and a player can turn it off in Preferences. It SHALL be
absent in a game that ignores the secondary button. A swap SHALL NOT outlast
the puzzle it was made in.

#### Scenario: A run of second actions by tapping

- **WHEN** a player in Tracks presses the Bar's `Right click` slot
- **THEN** no slot of the Bar has moved, and a tap on the board does what a
  right click does
- **AND** in a game that ignores the secondary button the Bar has no such
  slot

### Requirement: The button toggle is a mode that is on or off

The button toggle SHALL be a mode that is on or off: its caption and icon
SHALL name the mode and SHALL NOT change with its state, and being on SHALL be
shown by the slot being filled and reported as a pressed button.

#### Scenario: The toggle is turned on

- **WHEN** a player presses the Bar's `Right click` slot
- **THEN** the slot is filled and reported as pressed, and its caption is
  unchanged

### Requirement: Everything that depends on the game is in the Game controls

Everything that depends on the game in play SHALL be in the Game controls
panel and nowhere else, in this order in every game: its keys, the note
toggle, and its own commands (Fill or Update marks, Reference). Each SHALL be
present by what the game is, so that no game is listed: the keys and the note
toggle by the keys the game asks for, mark-all by `canMarkAll`, Reference by a
`reference` hook. A player does not know to look in a menu for something only
one game has.

#### Scenario: A game with mark-all

- **WHEN** the screen renders for a game whose `canMarkAll` is true
- **THEN** the Game controls panel contains the mark-all command
- **AND** neither the Bar nor the Menu does

#### Scenario: A game with a reference

- **WHEN** the screen renders for Dominosa
- **THEN** the Reference toggle is in the Game controls panel and not in the
  Menu

### Requirement: The Menu holds nothing that depends on the game

The Menu SHALL hold nothing that depends on the game, apart from the game's
name in the help row and the commands a game cannot run at all, which SHALL be
absent. A game that brings no keys, no note toggle and no commands of its own
SHALL have no Game controls panel, and the board takes the room.

#### Scenario: A game with nothing of its own

- **WHEN** the screen renders for a game with no keys, no mark-all and no
  reference
- **THEN** no Game controls panel is drawn

### Requirement: Only the Menu scrolls

No panel other than the Menu SHALL scroll, and the Menu SHALL be the screen's
only overflow: there is no second menu of commands inside it and no scrolling
column beside it. The Bar SHALL fit its window by showing fewer of the list's
leading entries, the rest moving to the head of the Menu. Game controls beside
the board SHALL fit their height by laying the keys out in more columns. The
timeline is in the Menu and opens a list of its own: it is a list of moves and
not of commands.

#### Scenario: A short desktop window

- **WHEN** the puzzle screen renders at 1280 by 600 CSS pixels
- **THEN** the Bar and the Game controls panel are wholly visible without
  scrolling
- **AND** every command not on the Bar is in the Menu

#### Scenario: The Bar at a phone width

- **WHEN** the puzzle screen renders at 360 CSS pixels wide with the hint
  reading "Apply the hint"
- **THEN** the Bar does not overflow horizontally, and no caption runs over a
  neighboring button

### Requirement: A hint's words sit under the board

The hint's explanation, and the status line of a game that prints one, SHALL be
shown under the board at every window size, and in no panel. Showing or
clearing a hint SHALL NOT move any control in a panel, and neither SHALL the
Hint control's own caption changing to say what the next press does.

#### Scenario: A hint is shown on a desktop

- **WHEN** a player presses Hint in a wide window
- **THEN** the explanation appears under the board
- **AND** every control in the Bar, the Game controls and the Menu is where it
  was before the press

### Requirement: A player can choose where the panels dock

The app SHALL let a player choose, in Preferences, which side the Game controls
are on, whether the Bar is along the bottom or on a side, whether the Game
controls are on a side or under the board, and whether the Menu stays open when
there is room. The Menu SHALL take the side opposite the Game controls, so that
no choice can put all three panels on one side.

#### Scenario: A left-handed player

- **WHEN** a player sets the Game controls to the left
- **THEN** the Game controls are on the left and the Menu on the right, in
  every window shape

### Requirement: Layout choices are kept for each window shape

The side the Game controls are on SHALL be kept once for the device. The other
layout choices SHALL be kept separately for each window shape (tall; wide;
wide and short), so that a layout chosen on a wide screen does not follow a
player to a tall one. Where a player has made no choice, the default SHALL
depend on the window shape.

#### Scenario: The default in a wide window

- **WHEN** a player who has changed nothing opens a puzzle in a wide window
- **THEN** the Menu is open on the left, the Bar is along the bottom and the
  Game controls are on the right

#### Scenario: The default in a tall window

- **WHEN** a player who has changed nothing opens a puzzle on an upright phone
- **THEN** the Bar is along the bottom, the Game controls are under the board,
  and the Menu opens as a sheet

#### Scenario: A choice made in one shape

- **WHEN** a player moves the Bar to the side in a wide window, and later opens
  the app in a tall one
- **THEN** the tall window shows its own layout, and the wide window's choice
  is still in force when they return to it

### Requirement: A layout choice the window cannot honor falls back and is kept

A layout choice that cannot be honored in the current window SHALL fall back
without being overwritten: a Menu that cannot dock without squeezing the board
is closed, and the Bar's Menu button opens it over the board, as a sheet in a
tall window and a drawer on the Menu's side in a wide one, in either case
clear of the Bar.

#### Scenario: A window narrowed until the Menu cannot dock

- **WHEN** a wide window with the Menu docked is narrowed until the Menu would
  squeeze the board, and then widened again
- **THEN** the Menu leaves the layout while it cannot dock, and is docked open
  again when it can

### Requirement: A command closes a Menu that is over the board

A command chosen from a Menu that is over the board SHALL close it; a docked
Menu SHALL stay. Closing or opening the Menu from the Bar is for the visit and
SHALL NOT change the stored choice.

#### Scenario: A command chosen from the sheet

- **WHEN** a player on a phone opens the Menu and chooses Start over
- **THEN** the sheet closes
- **AND** the same choice from a docked Menu leaves it open

### Requirement: The window's shape chooses the layout

The window's shape SHALL choose the layout, and not its width alone: tall is
portrait, and a landscape window is wide, or wide and short below 34rem of
height. Where a panel docks SHALL be decided in one place, from the player's
layout choices and that shape, and no panel SHALL carry a rule of its own
about the window's size.

#### Scenario: Two tall windows of different widths

- **WHEN** the puzzle screen renders at 768 by 1024 and at 800 by 1000 CSS
  pixels
- **THEN** both are tall, and the board is the window's width in each, less
  the same margin

### Requirement: The reference panel is a region of the same layout

The reference panel, where a game has one and it is open, SHALL be a region of
the puzzle screen's layout: beside the board, beyond the Game controls, in a
landscape window, and under the board in a tall one.

#### Scenario: The reference is opened on an upright phone

- **WHEN** a player opens Dominosa's reference in a tall window
- **THEN** the reference panel is under the board

### Requirement: The family chips give way to a search

While the home screen's search box holds text, the home screen SHALL show no
family chip other than the pressed one, and SHALL show every family chip again
once the box is empty. A family's label is in what the search matches, so
nothing is out of reach while the chips are away. The pressed chip stays
because it is still narrowing the list, and a narrowing with no control on
screen cannot be undone.

#### Scenario: Typing lifts the list to the box

- **WHEN** a player with no family chip pressed types "solo" into the home
  screen's search box
- **THEN** no family chip is shown, and the list follows the search box and
  the All / Favorites / In progress filter directly

#### Scenario: The pressed chip stays beside a search, and can be released

- **WHEN** a player presses the "Shading" chip and then types into the search
  box
- **THEN** the "Shading" chip is the only family chip shown, still pressed,
  and the list is narrowed by both
- **AND** pressing it releases the family, removes the chip, and leaves the
  focus in the search box

#### Scenario: Clearing the box brings the chips back

- **WHEN** the player empties the search box
- **THEN** every family chip is shown again

### Requirement: The notification that ends a game offers what comes next

When a game ends, and unless the player has switched it off in the
preferences, a notification over the board SHALL offer New game. On a solved
board it SHALL also offer Share, Change type and the way back to all puzzles,
and on a lost board Start over and, where a move can be taken back, Undo. It
SHALL offer no command that has no home elsewhere on the screen.

#### Scenario: A board finished by Solve

- **WHEN** Solve finishes a board
- **THEN** the notification offers New game, Share, Change type and the way
  back to all puzzles, as it does on a board the player solved

### Requirement: A canceled pointer cancels its press

When the browser cancels a pointer whose press a puzzle claimed, the
interactive puzzle view SHALL tell the puzzle the press is canceled, once, and
SHALL NOT send a drag or a release for it at any position. A cancel that
arrives while its press is still in flight SHALL be retained and delivered once
the press has been acknowledged.

#### Scenario: A touch is taken over mid-press

- **WHEN** a finger is down on the board and the browser reports
  `pointercancel` for it
- **THEN** the puzzle receives the press and then its cancel, and nothing else
