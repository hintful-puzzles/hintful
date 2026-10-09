# Ledger: app-shell

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Pressing a control gives the keyboard back to the board

| Rule | Where it went |
| --- | --- |
| Focus returns to `puzzle-view-interactive` after a control is pressed with a pointer | spec: Pressing a control gives the keyboard back to the board |
| Both routes are covered, the command bus and a pointer click anywhere in the chrome | spec: Pressing a control gives the keyboard back to the board |
| Focus is handed over asynchronously, after the dropdown and the button focus themselves | spec: Pressing a control gives the keyboard back to the board |
| The board is the primary surface and every control a one-shot action on the puzzle | reason |
| Only a real event's composed path tells a command from a menu trigger | reason |
| A command that opens a dialog needs no exception, and the dialog returns focus to the board | spec: A dialog a command opens returns focus to the board |
| The stray-key redirect fires only when nothing is focused, so one click would leave the board deaf | reason; held: src/screens/puzzle-screen.ts "so without this a single click leaves" |
| Scenario: Enter reaches the board after a menu command | spec: Pressing a control gives the keyboard back to the board |
| Scenario: the cursor keys reach the board after a toolbar click | spec: Pressing a control gives the keyboard back to the board |
| The scenario's title keeps the word toolbar because a delta cannot rename a scenario | history |

## Focus is not taken from a player who is using the keyboard

| Rule | Where it went |
| --- | --- |
| Returning focus does not override a keyboard player, in either of two cases | spec: Focus is not taken from a player who is using the keyboard |
| A click that opens a menu leaves focus alone | spec: Focus is not taken from a player who is using the keyboard |
| A control activated from the keyboard, a click with a `detail` of 0, leaves focus alone | spec: Focus is not taken from a player who is using the keyboard |
| Dismissing a menu with Escape or a click-away returns focus to its trigger | spec: Dismissing a menu returns focus to its trigger |
| Returning focus to the trigger is the conventional behavior for a dismissal | reason |
| Scenarios: a menu opened with the mouse, and tabbing to a button | spec: Focus is not taken from a player who is using the keyboard |

## Every press delivered to a puzzle is followed by exactly one release

| Rule | Where it went |
| --- | --- |
| One release or cancel for every press, exactly once, whatever the timing of the round-trip | spec: Every press delivered to a puzzle is followed by exactly one release |
| A release that arrives while its press is in flight is retained and delivered | spec: Every press delivered to a puzzle is followed by exactly one release |
| A press the puzzle declines is followed by an immediate release | spec: Every press delivered to a puzzle is followed by exactly one release |
| The guarantee is independent of any particular game | spec: Every press delivered to a puzzle is followed by exactly one release |
| It is a property of the input layer above the engine | reason |
| Scenarios: a click completed early still releases, and a release is never delivered twice | spec: Every press delivered to a puzzle is followed by exactly one release |

## A puzzle page reopens on the board it was last showing

| Rule | Where it went |
| --- | --- |
| Opening a puzzle shows the board last dealt, in the order URL id, autosave, last board, new game | spec: A puzzle page reopens on the board it was last showing |
| The last dealt board is a game ID in the settings record and never an autosave | spec: The last dealt board is remembered in the settings, not as an autosave |
| The recorded ID is the board's one game ID with the full params, difficulty included | spec: The remembered board is its full game ID, difficulty included |
| The midend checks that the board solves at the recorded tier and raises one recorded too low | spec engine-difficulty: A pinned tier is kept or raised and never lowered |
| A recorded ID this build cannot deal is discarded for a new game with no alert | spec: A remembered board this build cannot deal is dropped quietly |
| A game ID in the URL still reports its failure | spec: A remembered board this build cannot deal is dropped quietly |
| Scenarios: an untouched board survives a reload, and a started game restores from its autosave | spec: A puzzle page reopens on the board it was last showing |
| Scenario: a reopened board keeps its difficulty | spec: The remembered board is its full game ID, difficulty included |
| Scenario: browsing puzzles does not badge them | spec: The last dealt board is remembered in the settings, not as an autosave |
| Scenario: a remembered board this build cannot deal is dropped quietly | spec: A remembered board this build cannot deal is dropped quietly |

## Escape reaches the puzzle when there is no gesture to cancel

| Rule | Where it went |
| --- | --- |
| Escape is button `27` whenever no pointer gesture is in flight | spec: Escape reaches the puzzle when there is no gesture to cancel |
| With a pointer down Escape abandons the gesture and does not also arrive as a keypress | spec: Escape reaches the puzzle when there is no gesture to cancel |
| The delivery does not suppress the browser's default handling | spec: Delivering Escape leaves the browser's own handling alone |
| Games' `interpretMove` already tests `button === 27` | spec: Escape reaches the puzzle when there is no gesture to cancel |
| Escape was once swallowed unconditionally, and the dead arm had shipped in two games | history |
| A cancel arm that tests 8 also tests 127 | spec: A cancel arm that tests 8 also tests 127 |
| Scenarios: Escape with no pointer down, and with a pointer down | spec: Escape reaches the puzzle when there is no gesture to cancel |

## The params a puzzle reports are the full params of the board on screen

| Rule | Where it went |
| --- | --- |
| The reported params are the full encoding of the board on screen, read from its game ID | spec: The params a puzzle reports are the full params of the board on screen |
| Scenarios: a board with no seed, and a re-deal | spec: The params a puzzle reports are the full params of the board on screen |

## A summary check asserts the rendered word, not merely that a token was replaced

| Rule | Where it went |
| --- | --- |
| The guard compares rendered text against the declaring source | spec: A summary check asserts the rendered word, not merely that a token was replaced |
| The guard also asserts that no `{field}` placeholder survives, and both checks are kept | untrue: no summary template is left to hold a placeholder, since `describeParams` in `src/engine/param-label.ts` composes the label from the game's `paramConfig`, and the guard in `src/engine/params-declared.test.ts` asserts that each tier's label contains the declared tier name |
| The placeholder check stayed green while the wrong word was substituted | history |
| Scenario: a substituted-but-wrong word is caught | spec: A summary check asserts the rendered word, not merely that a token was replaced |

## The chrome follows a recorded design direction of this project's own

| Rule | Where it went |
| --- | --- |
| The chrome follows a direction chosen by the owner and recorded here, not the inherited layout | spec: The chrome follows a recorded design direction of this project's own |
| The surfaces named are the app bar and the toolbar | untrue: the puzzle screen has a readout row and three panels and no app bar or toolbar (`src/screens/puzzle-screen.ts`), so the requirement names those |
| The recorded direction is specific enough to implement from, and a change to the chrome cites it | spec: The chrome follows a recorded design direction of this project's own |
| The direction is chosen on sight from drawn alternatives before any implementation | spec: A design direction is chosen on sight, before any code |
| Scenario: a redesign is proposed | spec: The chrome follows a recorded design direction of this project's own; spec: A design direction is chosen on sight, before any code |

## Checking a board never costs a player their checkpoint

| Rule | Where it went |
| --- | --- |
| The combined check-and-save stays in the most reachable tier | spec: Checking a board never costs a player their checkpoint |
| It verifies first and refuses to save over a mistake or a dead end | spec: Checking a board never costs a player their checkpoint |
| Where a game can check, a quieter command checks without writing a checkpoint | spec: Checking a board never costs a player their checkpoint |
| The quick-save slot is one per puzzle, so a check overwrites a deliberate save | spec: Checking a board never costs a player their checkpoint |
| The combined command is what most players want, and the player it fails saved before a speculative branch | reason |
| The quieter command appears only where the game reports it can check, derived from the game | spec: Check without saving is offered only where the game can check |
| Scenarios: checking without saving preserves a checkpoint, and checking a dead end | spec: Checking a board never costs a player their checkpoint |
| Scenario: a game that cannot find mistakes | spec: Check without saving is offered only where the game can check |

## Undo and redo have keyboard shortcuts

| Rule | Where it went |
| --- | --- |
| `Ctrl/Cmd+Z` undoes, and `Ctrl/Cmd+Shift+Z` and `Ctrl+Y` redo, in every game | spec: Undo and redo have keyboard shortcuts |
| Each binding is shown on its control | untrue: `shortcutLabel` in `src/puzzle/shortcuts.ts` gives a control its command's first chord only, so redo shows one of its two, and the Bar carries it in the slot's tooltip (`src/puzzle/components/bar.ts`) |
| `Ctrl/Cmd+S` stays bound to check-and-save and appears on its control | spec: Undo and redo have keyboard shortcuts |
| The collection shipped with no keyboard undo, and upstream bound `u`, `r` and `n` behind a preference | history |
| Single-letter shortcuts are permitted, and only behind a preference, which the requirement states without `MAY` as offered only behind a preference | spec: A bare letter is an app command only when the game declines it |
| Deriving it is stronger than reading a game's declared key labels | reason |
| A letter does not fire for a game that consumes it, derived from the game declining the key | spec: A bare letter is an app command only when the game declines it |
| No game has to declare anything, one that never offers the letter on a keypad included | spec: A bare letter is an app command only when the game declines it |
| The key shown on a control is asserted equal to the key bound | spec: The key shown on a control is the key that is bound |
| Scenario: undo from the keyboard | spec: Undo and redo have keyboard shortcuts |
| Scenario: a game that takes letter input | spec: A bare letter is an app command only when the game declines it |
| Scenario: the shown key is the bound key | spec: The key shown on a control is the key that is bound |

## The chrome does not overflow at a phone width

| Rule | Where it went |
| --- | --- |
| The chrome lays out without horizontal overflow at 390 CSS pixels | spec: The chrome does not overflow at a phone width |
| The inherited header was a non-wrapping row whose type menu truncated to one character | history |
| The row above the board carries readouts only | spec: The readouts are one row, and the chips give way first |
| The Bar sheds entries to the Menu and does not squeeze them | spec: Only the Menu scrolls |
| Scenario: a narrow viewport | spec: The chrome does not overflow at a phone width |

## Every bare shortcut letter is swept against every game

| Rule | Where it went |
| --- | --- |
| The suite sweeps each bare letter against every registered game and fails on one that consumes it, unless it is on a ledger with a reason | spec: Every bare shortcut letter is swept against every game |
| The derivation does not notice a game that swallows a letter, and every other test stays green | spec: Every bare shortcut letter is swept against every game |
| Ascent consumed `u`, `r`, `n` and `h` while the shortcut suite passed | history |
| The sweep asks on a fresh board and with the cursor revealed | spec: The sweep asks on a fresh board and with the cursor revealed |
| The ledger is asserted exactly equal to the set found | spec: The sweep asks on a fresh board and with the cursor revealed |
| A ledger entry records a collision and not a defect, as Tents keeps `n` whenever its cursor is visible | spec: A ledger entry records a collision, not a defect |
| Guess and Pearl bind `h` to their own hint and are on the ledger | untrue: the sweep's ledger in `src/puzzle/shortcuts.test.ts` holds Tents alone and is asserted equal to the set found, so neither game consumes `h` |
| Scenario: a game that swallows a shortcut letter is caught | spec: Every bare shortcut letter is swept against every game |
| Scenario: a recorded collision keeps the game's meaning | spec: A ledger entry records a collision, not a defect |

## The chrome offers the hint and never urges it

| Rule | Where it went |
| --- | --- |
| No control is styled to recommend a hint, and the hint is as reachable as any command with no emphasis above its neighbors | spec: The chrome offers the hint and never urges it |
| The hint's own amber is unaffected: the explanation speaks and the button offers | spec: The chrome offers the hint and never urges it |
| Whether to take a hint is the player's call | spec: The chrome offers the hint and never urges it |
| The hint was once the one filled control on the screen | history |
| Explained hints are a fact about the fork and not an instruction to a player, and the chrome leaves room to solve unaided | reason |
| Scenario: a player opens a puzzle they have not asked for help with | spec: The chrome offers the hint and never urges it |

## A preference exists only while something reads it

| Rule | Where it went |
| --- | --- |
| A setting is offered only while what it controls changes something a player can observe | spec: A preference exists only while something reads it |
| A setting whose condition cannot occur is removed with every surface built on it | spec: A preference exists only while something reads it |
| An inert control still costs the attention to read it | spec: A preference exists only while something reads it |
| Show experimental puzzles and its four surfaces over a flag no puzzle set, and the share dialog's dead exclusion | history |
| Scenario: the condition a setting gates can no longer arise | spec: A preference exists only while something reads it |

## The home screen's navigation has no layer it does not need

| Rule | Where it went |
| --- | --- |
| The header presents its destinations directly unless a menu is the shorter path | spec: The home screen's navigation has no layer it does not need |
| A page's own title is not a menu trigger | spec: The home screen's navigation has no layer it does not need |
| About has no menu row, since the footer links to it and names what is inside | spec: The home screen's navigation has no layer it does not need |
| The Options dropdown of three items, and the Show intro message checkbox | history |
| Scenario: a menu left holding what a player could reach directly | spec: The home screen's navigation has no layer it does not need |

## Custom type… SHALL open its dialog from every Type menu, titled by name

| Rule | Where it went |
| --- | --- |
| Custom type… opens the Custom dialog wherever the menu is drawn, a shadow root included | spec: Custom type… SHALL open its dialog from every Type menu, titled by name |
| The dialog is titled with the game's display name and never its id | spec: Custom type… SHALL open its dialog from every Type menu, titled by name |
| The name belongs to the catalog, so the engine's form description carries no title | spec: Custom type… SHALL open its dialog from every Type menu, titled by name |
| The error a menu in a shadow root once raised, and the dialog that read "abcd" | history |
| Scenarios: the dialog opens from a shadow root, and is titled by the game's name | spec: Custom type… SHALL open its dialog from every Type menu, titled by name |

## Every puzzle belongs to exactly one family, and the home screen narrows by it

| Rule | Where it went |
| --- | --- |
| Each catalog entry names exactly one family, and the home screen offers a chip per family | spec: Every puzzle belongs to exactly one family, and the home screen narrows by it |
| A family is a consumed value, read through `puzzlesInFamily` and never typed as a list | spec: Every puzzle belongs to exactly one family, and the home screen narrows by it |
| Where code can vouch for a family, a test holds the tag to the code | spec: Every puzzle belongs to exactly one family, and the home screen narrows by it |
| A family is what a player browses by and what maintenance work names a group by | reason |
| The four scenarios | spec: Every puzzle belongs to exactly one family, and the home screen narrows by it |

## From a puzzle, the quick-switch opens on the rest of that puzzle's family

| Rule | Where it went |
| --- | --- |
| With nothing typed, the quick-switch lists the family's other puzzles first, then every puzzle | spec: From a puzzle, the quick-switch opens on the rest of that puzzle's family |
| Once anything is typed the search answers and the grouping is dropped | spec: From a puzzle, the quick-switch opens on the rest of that puzzle's family |
| Opening the switcher from a game is when a player asks what else is like it | reason |
| Both scenarios | spec: From a puzzle, the quick-switch opens on the rest of that puzzle's family |

## The on-screen key panel never takes keyboard focus

| Rule | Where it went |
| --- | --- |
| A press on an on-screen key moves no focus, by suppression and not by handing focus back | spec: The on-screen key panel never takes keyboard focus |
| The panel is an input surface, and panel and keyboard do not switch each other off | spec: The on-screen key panel never takes keyboard focus |
| One press left the keyboard dead, and the focus-return rule did not reach a panel with no `data-command` | history |
| The suppression is on the press and not the pointer event | spec: The key panel suppresses focus on the press, not the pointer event |
| No behavioral tier can observe it, and the guard says it is a proxy and where the consequence was seen | spec: The key panel's guard says that it is a proxy |
| Scenario: a physical key reaches the board after an on-screen key | spec: The on-screen key panel never takes keyboard focus |

## A new board is dealt to fit the space it is drawn in

| Rule | Where it went |
| --- | --- |
| The view reports the space available, before any `maxScale` cap, whenever it measures and when first given a `Puzzle` | spec: A new board is dealt to fit the space it is drawn in |
| Every new game passes that area to the engine's deal, and a board on screen is not turned | spec: A new board is dealt to fit the space it is drawn in |
| A chosen size is not an orientation: it is dealt turned to fit and remembered as chosen | spec: A chosen size is a size and not an orientation |
| Scenario: the measured area reaches the deal | spec: A new board is dealt to fit the space it is drawn in |

## A board dealt turned keeps its preset's name

| Rule | Where it went |
| --- | --- |
| A turned board is named by its preset's title, matched as dealt or turned back, and the preset stays checked | spec: A board dealt turned keeps its preset's name |
| The Custom dialog shows the size the board was dealt at | spec: A board dealt turned keeps its preset's name |
| Both scenarios | spec: A board dealt turned keeps its preset's name |

## The solve timer has its own place in the chrome

| Rule | Where it went |
| --- | --- |
| The elapsed time is at the end of the readout row while the timer is on, and absent while it is off | spec: The solve timer has its own place in the chrome |
| The solved message states the time and says when help was taken, and the timer pauses while the page is hidden | spec: The solve timer has its own place in the chrome |
| Both scenarios | spec: The solve timer has its own place in the chrome |

## The readouts are one row, and the chips give way first

| Rule | Where it went |
| --- | --- |
| The back link, the name, the chips and the timer are one row that does not overflow at 320 CSS px | spec: The readouts are one row, and the chips give way first |
| The row holds readouts and the ways to another puzzle, and no command on the board | spec: The readouts are one row, and the chips give way first |
| The chips are clipped before the name, and no chip draws outside its box | spec: The readouts are one row, and the chips give way first |
| The game's name is a button in the heading that opens the quick-switch and shows a mark | spec: The game's name opens the quick-switch |
| The move counter is not in the row: it is the timeline's control in the Menu's Board group | spec: The move counter is not in the readout row |
| The back link shows its words where the window is wide and its icon alone elsewhere | spec: The back link shows its words where the window is wide |
| Scenario: a long preset title on a narrow phone | spec: The readouts are one row, and the chips give way first |
| Scenario: the name opens the quick-switch | spec: The game's name opens the quick-switch |

## A menu inside the Menu stays open until a choice is made in it

| Rule | Where it went |
| --- | --- |
| A menu trigger inside the Menu is not also a command, and a choice in it closes a Menu over the board | spec: A menu inside the Menu stays open until a choice is made in it |
| Scenario: jumping to a checkpoint from the sheet | spec: A menu inside the Menu stays open until a choice is made in it |

## A page a deploy left stale recovers instead of going blank

| Rule | Where it went |
| --- | --- |
| A file that cannot be loaded reloads the page once, and is reported if a reload in the last thirty seconds did not help | spec: A page a deploy left stale recovers instead of going blank |
| A worker that fails to start does not leave the board waiting | spec: A page a deploy left stale recovers instead of going blank |
| Both scenarios | spec: A page a deploy left stale recovers instead of going blank |

## A remembered board type that no longer loads is replaced with a warning

| Rule | Where it went |
| --- | --- |
| A rejected remembered type is forgotten, the first preset is dealt, and a warning toast says so | spec: A remembered board type that no longer loads is replaced with a warning |
| Scenario: a remembered type from an older version | spec: A remembered board type that no longer loads is replaced with a warning |

## The catalog labels a draft, and the help gives a section's reason

| Rule | Where it went |
| --- | --- |
| A draft's row is labeled "Draft" with the features still to come, and stays listed and playable | spec: The catalog labels a draft, and the help gives a section's reason |
| The drafts are computed at build time (`virtual:draft-puzzles`) and are not a catalog field | spec: The drafts are computed at build time, not kept in the catalog |
| A help page lists, in a generated "Not in this game" section, what the game declares not applicable | spec: A help page lists what is not in the game, with the game's reason |
| Scenario: Net has no hint and no mistake check, and its label names both | untrue: Net implements `findMistakes` (`src/games/net/index.ts`), so the scenario is written for any game with no hint |
| Scenario: a complete game is not labeled | spec: The catalog labels a draft, and the help gives a section's reason |
| Scenario: a reason reaches the help page | spec: A help page lists what is not in the game, with the game's reason |

## The app hands out boards, never seeds

| Rule | Where it went |
| --- | --- |
| Everything shown, copied or shared names the board by its game ID and never a seed | spec: The app hands out boards, never seeds |
| A seed names a board only through a generator, and the generators change | spec: The app hands out boards, never seeds |
| The generators change both against upstream and between versions of this app | reason |
| The same ID serves showing, sharing, saving and reopening | spec: The app hands out boards, never seeds |
| The game-ID notification carries the one game ID and no seed | spec: The game-ID notification carries no seed |
| A `#seed` ID from elsewhere still deals a game | spec: A seed ID still deals a game |
| Scenarios: the link to this specific game, links to Simon Tatham's site, a puzzle upstream does not carry | spec: The app hands out boards, never seeds |
| Scenario: the notification carries no seed | spec: The game-ID notification carries no seed |
| Scenario: a seed ID still opens | spec: A seed ID still deals a game |

## A command that acts on the board waits for the first board

| Rule | Where it went |
| --- | --- |
| A command that reads or acts on the board is not sent until the first board exists, and waits | spec: A command that acts on the board waits for the first board |
| The board-reading methods are a type of their own, `BoardSurface`, reached only through the wait | spec: The engine's board methods are reached only through the wait |
| Until the first board the controls of those commands are unavailable, and the others are offered | spec: The controls of board commands are unavailable until the first board |
| Scenarios: hint pressed by key, and the board arrives from a save | spec: A command that acts on the board waits for the first board |
| Scenario: the controls while the first board is dealt | spec: The controls of board commands are unavailable until the first board |

## Undo reaches back across a Restart and a replaced board

| Rule | Where it went |
| --- | --- |
| Undo takes back Start over and New game, and the controls need nothing of their own | spec: Undo reaches back across a Restart and a replaced board |
| A loaded save keeps the board it replaces, offered at once as Previous board | spec: A loaded save keeps the board it replaces |
| Checkpoints leave and return with their board, followed by the engine's number and not its id | spec: A board's checkpoints leave and return with it |
| The app says when Undo brings back a board, and takes the words down on Redo | spec: The app says when Undo has brought back a board |
| The timeline names each restart and offers Previous board and Next board | spec: The timeline names a restart and the boards kept either side |
| The help describes both | spec: The timeline names a restart and the boards kept either side |
| Scenarios: Restart then Undo, and a move on the new board | spec: Undo reaches back across a Restart and a replaced board |
| Scenario: New game, then Undo | spec: A board's checkpoints leave and return with it; spec: The app says when Undo has brought back a board |
| Scenario: Back to last save, then Undo | spec: A loaded save keeps the board it replaces |

## The puzzle screen is three panels, and every command is in exactly one

| Rule | Where it went |
| --- | --- |
| Three panels at every size, each command in exactly one place, and the way out of a deal under the board | spec: The puzzle screen is three panels, and every command is in exactly one |
| Two surfaces to learn is the defect the rule prevents | spec: The puzzle screen is three panels, and every command is in exactly one |
| A desktop rail and a phone bar were one list drawn as two shapes | history |
| The Bar and the Menu are one ordered list, the Menu a suffix, the first four always on the Bar | spec: The Bar and the Menu are one ordered list, cut once |
| Every control carries a visible label, and the on-screen keys carry their character | spec: Every control in a panel carries a visible label |
| A slot draws its icon above its caption, and a caption names an action or a mode | spec: A slot draws its icon above its caption |
| The Bar draws no key, and a Menu row writes one only where a keyboard is likely | spec: The Bar does not draw a command's key |
| The Menu button is at the end nearest the Menu, set apart by a rule | spec: The Menu button is beside what it opens |
| Opening the Menu moves no slot of the Bar and does not cover it | spec: Opening the Menu moves no slot of the Bar |
| Scenario: the same press opens and closes the Menu | spec: Opening the Menu moves no slot of the Bar |
| Scenario: the Menu button, by handedness | spec: The Menu button is beside what it opens |
| Scenarios: a command offered twice, and a command with no home | spec: The puzzle screen is three panels, and every command is in exactly one |
| Scenario: the Menu on a phone | spec: The Bar and the Menu are one ordered list, cut once |
| Scenario: a control carries no label | spec: Every control in a panel carries a visible label |

## The Bar is the same in every game, and a game's own controls are together

| Rule | Where it went |
| --- | --- |
| The Bar holds only commands every game has, and only the Hint slot depends on the game | spec: The Bar is the same in every game, and a game's own controls are together |
| The Bar carries the button toggle, shown by default, absent where the secondary button is ignored, and not outlasting its puzzle | spec: The Bar carries the button toggle |
| A game that ignores the secondary button has nothing to swap to | reason |
| The toggle is a mode whose caption and icon do not change, shown filled and reported pressed | spec: The button toggle is a mode that is on or off |
| What depends on the game is in the Game controls, in one order, each present by what the game is | spec: Everything that depends on the game is in the Game controls |
| A player does not know to look in a menu for something only one game has | spec: Everything that depends on the game is in the Game controls |
| The Menu holds nothing that depends on the game, and a game with nothing has no Game controls panel | spec: The Menu holds nothing that depends on the game |
| Scenario: the same slots in two games | spec: The Bar is the same in every game, and a game's own controls are together |
| Scenarios: a game with mark-all, and a game with a reference | spec: Everything that depends on the game is in the Game controls |
| Scenario: a game with nothing of its own | spec: The Menu holds nothing that depends on the game |
| Scenario: a run of second actions by tapping | spec: The Bar carries the button toggle; spec: The button toggle is a mode that is on or off |

## Only the Menu scrolls

| Rule | Where it went |
| --- | --- |
| Only the Menu scrolls, the Bar sheds entries, and the Game controls add columns | spec: Only the Menu scrolls |
| The timeline is in the Menu and opens a list of moves of its own | spec: Only the Menu scrolls |
| Both scenarios | spec: Only the Menu scrolls |

## A hint's words sit under the board

| Rule | Where it went |
| --- | --- |
| The hint's explanation and the status line are under the board and in no panel, and move no control | spec: A hint's words sit under the board |
| Scenario: a hint is shown on a desktop | spec: A hint's words sit under the board |

## A player can choose where the panels dock

| Rule | Where it went |
| --- | --- |
| A player chooses the side of the Game controls, where the Bar and the Game controls dock, and whether the Menu stays open | spec: A player can choose where the panels dock |
| The Menu takes the side opposite the Game controls | spec: A player can choose where the panels dock |
| The side is kept once for the device, the rest per window shape, with a default per shape | spec: Layout choices are kept for each window shape |
| A choice the window cannot honor falls back without being overwritten, the Menu opening over the board clear of the Bar | spec: A layout choice the window cannot honor falls back and is kept |
| A command chosen from a Menu over the board closes it, and a docked Menu stays | spec: A command closes a Menu that is over the board |
| Closing or opening the Menu from the Bar does not change the stored choice | spec: A command closes a Menu that is over the board |
| The window's shape chooses the layout: tall is portrait, and landscape is wide or short | spec: The window's shape chooses the layout |
| A landscape window is short below about 34rem of height | untrue: `SHORT_BELOW_REM` in `src/puzzle/layout.ts` is exactly 34, so the requirement says 34rem |
| The reference panel is a region of the same layout | spec: The reference panel is a region of the same layout |
| Where a panel docks is decided in one place, and no panel has a rule about the window's size | spec: Where a panel docks is decided in one place |
| Scenario: a window narrowed until the Menu cannot dock | spec: A layout choice the window cannot honor falls back and is kept |
| Scenario: two window sizes either side of the old breakpoint | spec: The window's shape chooses the layout |
| Scenarios: the defaults in a wide and a tall window, and a choice made in one shape | spec: Layout choices are kept for each window shape |
| Scenario: a left-handed player | spec: A player can choose where the panels dock |

## The family chips give way to a search

| Rule | Where it went |
| --- | --- |
| While the search box holds text only the pressed chip is shown, and every chip returns when it is empty | spec: The family chips give way to a search |
| A family's label is in what the search matches, and the pressed chip stays because it still narrows | spec: The family chips give way to a search |
| On a phone the chips wrap to several rows between the box and the results | reason; held: src/puzzle/catalog-search.ts "standing between the box and its results" |
| The three scenarios | spec: The family chips give way to a search |
