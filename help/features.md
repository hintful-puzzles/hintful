# Features every puzzle shares

The puzzles differ; the app around them is the same. This page covers what
every puzzle gets from it: hints that explain, checking your work, saving and
checkpoints, and playing by touch, mouse or keyboard on any size of screen.

Simon Tatham’s manual for the original collection describes his desktop
builds, and much of its [common features][sgt-common] chapter applies here
too. Where the two disagree, this page describes the app you are using.

## On-screen keyboard {#virtual-keyboard}

Puzzles you solve by typing, such as Solo and Keen, show an on-screen keypad
so they can be played by touch.

If you have a real keyboard and would rather have the screen space, turn the
keypad off in the
<command-link command="settings:appearance">preferences</command-link>.

## Right-clicking on a touch screen {#right-mouse}

Many puzzles use both mouse buttons. When a puzzle’s help says “right-click”
and you are playing by touch, you have four ways to do it:

* **Tap again.** In many puzzles a click cycles a square through all of its
  states, so tapping again reaches what a right-click would, and then clears it.

* **Long press.** Holding a finger down counts as a right-click. To right-drag,
  keep holding and move.

* **Two-finger tap.** A second finger, anywhere on the screen, turns a touch
  into a right-click. The fingers need not land together: put the first where
  you want to click, then tap and release the second. To right-drag, lift the
  second finger and move the first.

* **The ::mouse-left-button|left-click::/::mouse-right-button|right-click::
  toggle.** A button at the end of the bar that decides what a plain tap
  means: it reads *Left* or *Right*, and pressing it swaps the two. It goes
  back to *Left* when you leave the puzzle, and a puzzle with nothing on the
  right button has no toggle. You can hide it in the
  <command-link command="settings:mouse">preferences</command-link>. Set to
  right-click, it also inverts the long press and the two-finger tap to mean
  *left*-click, and it swaps the buttons of a mouse or trackpad the same way.

Tapping again is always available where a puzzle supports it. The others can be
tuned or turned off in the
<command-link command="settings:mouse">preferences</command-link>, along with
the hold time and the audio feedback.

**In puzzles that have no use for a right-click, these gestures are switched
off** — Cube, Fifteen, Filling, Flip, Flood, Pegs and Sokoban. There, holding
your finger still simply presses; you can rest a finger on a peg while you decide
where to jump it, and the drag still works when you move.

## A mouse and a finger play the same way {#one-pointer}

Every puzzle uses two buttons and nothing else: a click or a tap is the left
button, and a right-click or a long press is the right. Dragging works with
either. So a puzzle plays the same whether you use a mouse, a trackpad or a
touch screen, and nothing needs the middle button or a key held down while you
click. Where a puzzle has more to do than two buttons can hold, there is a mode
you turn on or a key on the on-screen keypad for it.

## Hints {#hints}

Many puzzles here have a ::hint:: **Next hint** button, high in the panel
beside the board (or in the bar along the bottom, on a phone). It doesn't simply reveal a move. It shows you the next move *and
explains why that move is forced*, so that what you take away is a technique you
can use again by yourself rather than one square you didn't work out.

Every puzzle is meant to have one. A puzzle still waiting for its hint, or for
another of the features on this page, is marked **Draft** on the home screen.
It plays just the same; hold the pointer over the label to see what's still to
come. When a puzzle has no such thing by its nature, such as mistakes to check
in a sliding-tile puzzle, its own help page says why under *Not in this game*.

Hint works in two beats:

* **Press once to see it.** The board marks what the hint is talking about and
  the explanation appears directly under the button. Nothing has been played — the move
  is still yours to make, and you're free to make a different one.

* **Press again to play it.** A second press, with nothing done in between,
  plays that one step in slow motion and stops there. Ask again for the next.

Anything you do in between — a move of your own, undo, redo — puts the hint back
to the first beat, so a second press always *shows* before it plays.

::play:: **Auto Hint**, beside the Hint button, does this continuously at about
a second a step, waiting for each move's animation in the puzzles that have one.
::pause:: pauses it, and it stops by itself when the puzzle is solved or when
the hint runs out of things to say.

### What the marks mean {#hint-marks}

A hint marks the board, and the marks mean the same things in every puzzle, so
they're worth learning once.

* **A ring, drawn around the contents of a square, is what the hint is acting
  on** — the square, edge or line that the deduction forces. It is drawn *around*
  what's there rather than over it, so anything you've already written stays
  readable underneath.

* **An outline around a row, region or area is the evidence** — what the hint is
  reasoning *from*, as opposed to what it concludes. Where a puzzle's evidence is
  squares that are empty by nature, this is a soft shade rather than an outline,
  since there's nothing there to read through it.

* **Small numbers in the corners of squares give the order** the steps fall in,
  when a hint walks a chain of consequences. They're numbers rather than arrows
  on purpose: they tell you which order to read the chain in, and stop short of
  claiming that each square is the one that forces the next.

Some puzzles need to point at two kinds of evidence at once — a filled square
and an empty one, say — and mark them differently from each other. The
explanation always names what it's pointing at, so you never have to go by
color alone.

### How a hint uses pencil marks {#hint-notes}

In puzzles with pencil marks, you choose how a hint writes them, under
**Hints pencil in** in the puzzle's preferences:

* **Only as needed.** A square with no marks counts as holding
  everything its row, column or region hasn't ruled out yet, which is how many
  players solve before they write anything down. A hint writes a square's marks
  only when its next deduction crosses one out or reasons from it, and tells
  you why those are the ones to write. Much of a sudoku then needs no marks at
  all. In Map, a region with no dots counts as any color its neighbors don't
  show.

* **Every candidate first.** The hint starts by filling in every square's marks,
  as the ::mark-all:: button does, clears the ones the board already rules out,
  and reasons from the marks from then on.

Each puzzle starts on whichever suits it better: puzzles that mostly fall to
squares with one possibility left, such as Solo and Seismic, start on the first;
puzzles where nearly every square ends up needing marks, such as Keen and Towers,
start on the second. The hints teach the same deductions either way.

### When there's no hint to give {#hint-refusals}

Three quite different things stop a hint, and they call for different responses,
so it's worth knowing which one you're looking at.

* **There's a mistake on the board.** A hint won't reason from a position that
  already contradicts the clues, because everything it deduced from there would
  be wrong too. It refuses, and highlights the squares that clash — the same
  highlighting [Checking your work](#checking) uses. Fix those, then ask again.

* **Deduction has run out.** Nothing further *follows* from what's on the board.
  The puzzle is still solvable; there just isn't a next step that can be
  explained, which is what an [Unreasonable](#difficulty) puzzle is for. Save
  your position, try something, and come back if it doesn't work out — or take
  the answer from ::show-solution:: *Show solution…*, at the foot of the
  *Help me play* group.

* **The hint can't see that far.** In the two puzzles where a hint plans a route
  home rather than teaching a technique — *Sixteen* and *Netslide* — it works by
  searching ahead a limited number of moves. From a badly tangled position the
  way home is longer than it can search, and the honest answer is that it didn't
  find one. This is *not* a claim that no move would help: play a few moves of
  your own and ask again, or take the answer from *Show solution…*.

The hint says which of these has happened. It never guesses on your behalf and
then presents the guess as a deduction: a guess that happens to come off is not
a technique, and teaching you one would be the point. *Guess*, where guessing is
the game, is the one place a hint suggests one — after pointing out everything
the rows prove, and saying what it counted about the guess rather than claiming
it is forced.

Not every puzzle has a *Next hint* button. A puzzle has one where it's solved by
reasoning *and* the game can put that reasoning into words. Where the challenge
is dexterity, search or luck instead, there's no technique to teach and no
button to press.

## Checking your work {#checking}

Where a puzzle has a single provable answer, this app can tell you whether what
you've entered so far contradicts it.

::check-and-save:: **Check & save** — on the bar of commands by the board, and
on <kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>S</kbd> — checks the board and
then saves your position if it's sound. If it isn't, it tells you how many squares are
wrong, highlights them, and **doesn't save**; the position you saved earlier is
left exactly as it was, so a check you fail can never cost you the one you
passed. Return to that saved position at any time with
::back-to-last-save:: **Back to last save**: it is **Load**, beside Check & save,
where the bar has the room for it, and in the *Menu* where it has not.

The check also asks the puzzle's [hint](#hints) whether there is any way on from
here. A position can be past saving without a single square being wrong: a peg
in *Pegs* that nothing can reach again, a gem in *Inertia* the ball can never get
back to, or entries that contradict each other with none of them provably wrong.
When the hint would ask you to undo, the check says why in the hint's own words,
marks what it is about where it can, and **doesn't save**, so your saved position
is always one you can still finish from. In the puzzles whose hint works by
searching ahead, a position can be further from the finish than the search can
see. The check can't settle that either way, so it saves, and tells you it
couldn't tell.

In a puzzle that can't check itself the button reads the same and simply saves —
one name for the save in every puzzle.

There is also a quieter ::check-only:: **Check without saving**, low in the
*Help me play* group. It runs the same check and reports it exactly as above but
writes nothing, which is what you want when you already saved a position you
mean to keep: the save slot holds one position per puzzle, so checking-and-saving
would replace it.

Two things worth knowing about what the highlighting claims:

* It marks what is **wrong**, never what is **missing**. An unfinished board is
  not a mistaken one, and squares you haven't filled in yet are never
  highlighted.
* The marks are a snapshot, not a running check. They last until your next move,
  which clears them — so they always describe the board you asked about.

There is one saved position per puzzle. It's separate from the numbered
[checkpoints](#checkpoints) in the history panel, which are a different feature:
those live in your move history and you can hold several at once.

## Difficulty {#difficulty}

Many puzzles offer a range of difficulty levels in the ::puzzle-type:: type
menu. Nearly all of those levels promise the same thing, and one of them
promises something different.

On every level *except* one named **Unreasonable**, the puzzle can be finished
by reasoning alone. You may not spot the next step, and it may be a hard step to
spot, but there is always one there to be found, and you never need to try
something out to see whether it works.

**Unreasonable** withdraws exactly that promise. Such a board may reach a
position where no further step follows from what you can see, and the only way
on is to pick one of the possibilities, play it out, and be ready to take it
back. That's not a flaw in the board; it's what the name is telling you in
advance. It's also the only name that's allowed to mean it — if a level is
called something else, it doesn't require this of you.

Three things make trying-and-taking-back cheap:

* ::undo:: **Undo**, for stepping back a move at a time.
* **[Save your position](#checking)** before you commit to a line, and
  *Back to last save* to get back to it.
* **[Checkpoints](#checkpoints)**, when you want to hold more than one position
  at once, or to mark the spot and keep playing.

The [hint](#hints) knows about all this. On an Unreasonable board it will tell
you when deduction has run out rather than making a choice for you and calling
it a deduction.

## Boards that take a while to find {#slow-deals}

Most boards are dealt at once. A large *Custom type…* size, or a rare
combination of size and difficulty, can take seconds or minutes to find. After
a second the app says *Looking for a board…*, and the board you were on stays
where it is: you can go on playing it, hints and all, until the new one
arrives. When a page opens with no board yet, the commands that act on one
(Hint, Check & save and the rest) are grayed out until it is there.

**Stop** beside those words ends the search. You keep the board you have,
and the type menu goes back to its type. Nothing is lost by stopping, and
asking for the same type again starts a fresh search.

Once a board of a type has been found the app looks for the next one while
you play, so the wait is mostly the first board's.

## Boards that fit your screen {#board-shape}

Boards that aren't square come taller than they are wide, to suit a phone held
upright. When you start a new game on a screen that's wider than it is tall, such
as a desktop or a tablet on its side, a board that plays the same either way
round is dealt turned, so it fills the space with bigger squares. The
::puzzle-type:: type menu still names the type you chose, and *Custom type…*
shows the board's size as it was dealt.

Turning your device never changes a game you're in the middle of: the next new
game fits the new shape. A few boards are always dealt the way you chose them,
because turned they would be a different puzzle: Same Game and Bricks, where
things fall downward; Slide, whose exit is always on the right; and the grid
types in Loopy and Ascent that become a different grid on their side. Square
boards, like every Latin square, are the same either way round.

## Filling in all the pencil marks {#mark-all}

In puzzles where you write small pencil marks into a square to keep track of
what could go there, the ::mark-all:: button writes them for you: every square
that has no marks yet gets everything that could still go in it. That gives you
a full set to eliminate down from instead of a blank grid to fill in by hand.

**It never undoes your own thinking.** A square you have already narrowed by
hand is left alone — the button only fills in squares that are empty of marks.
And pressing it a second time doesn't start over: in most of these puzzles it
crosses out the candidates that the board has since ruled out, so repeated
presses narrow rather than reset.

It is ::mark-all:: **Fill marks** (or **Update marks** once there are some to
narrow), with the puzzle's own controls beside its number keys. On a keyboard
it is also the <kbd>M</kbd> key.

It's a move like any other, so ::undo:: undoes it.

## Writing notes on the board {#pencil-mode}

Many puzzles let you note what you are still working out — the numbers that could
go in a square, or in Loopy the corners and pairs of edges you have worked
something out about. Those notes go in through a **notes mode**, which is the same
in every puzzle that has one:

* **The Marks key** on the on-screen keypad turns the mode on and off. It is the
  only way in that never clashes with the puzzle's own controls, so it is there in
  every puzzle with notes.
* **The <kbd>P</kbd> key** does the same from a real keyboard, unless the puzzle
  itself uses <kbd>P</kbd> to type with.
* **In the number puzzles** you can also right-click a square (or touch and hold
  it) and then type, and <kbd>Enter</kbd> switches the mode while the keyboard
  cursor is showing.

While the mode is on, a small pencil shows on the board, so you can always see
which kind of mark you are about to make. Notes are ordinary moves: ::undo::
undoes them, and they are saved with your position.

## The reference panel {#reference}

Some puzzles are about placing a known set of pieces, where the question you
keep asking is *which ones haven't I placed yet*. Those get a ::reference::
reference panel: a checklist of the whole set, marking off each piece you've
placed and flagging any you've placed more than once.

Picking an item in the panel highlights where on the board it could still go.
Closing the panel deliberately **keeps** that highlight, because on a small
screen the natural order is to pick your piece, close the panel to see the board
properly, and then place it. Press <kbd>Esc</kbd>, or pick the same item again,
to clear it.

## Seeing what is joined to what {#hover-connected}

In a puzzle where you are building up one continuous path, the question you keep
asking is *which of these pieces are already joined together* — and once the
board has a dozen fragments on it, the honest answer is that you trace them with
your eye.

Where a puzzle can answer that, **resting the mouse pointer on part of what you
have drawn lights up everything connected to it**. Loopy does this: hover any
line and the whole run of lines it belongs to is highlighted, so you can see at a
glance whether the two ends you are about to join are already the same piece —
which, in Loopy, is the difference between finishing the loop and closing a
small one by mistake.

Nothing depends on it: it shows you something the board already contains, faster
than tracing. It is a mouse feature, since a touch screen has no notion of
hovering — a finger is either pressing or absent — so on a phone or tablet you
will not see it.

## Taking back Start over or a New game {#undo-reach}

::undo:: Undo reaches past the two commands that put your work away.

**Start over is a move like any other.** It steps to the board as it started and
keeps everything you played behind that step. Undo straight afterwards and your
moves are back; ::redo:: redo starts over again. Undo further and you walk back
through the moves themselves. The ::history:: history panel shows where you
started over. Starting over on a board you have played nothing on does nothing. (In
Mines the board "as it started" is the one just after your first square
opened, so you needn't remember where you began.)

**The board you just left is kept, one board back.** When a new board replaces
the one you were on, whether by *New game*, a choice in the ::puzzle-type::
type menu, a shared game or a loaded one, the old board waits behind the new
one's first position. Undo there, with no move of the new board left to take
back, brings the old one back as you left it: its moves, its
[checkpoints](#checkpoints) and its time. Redo, from the old board's last move,
returns you to the new board. The history panel offers both as *Previous board*
and *Next board*.

Only one board is kept each way, and only until you make a move: your first
move on a board lets go of the other one, and from then on undo and redo mean
what they always have. Closing or reloading the app lets go of it too.

## Checkpoints {#checkpoints}

A checkpoint marks a position in your move history so you can come back to it:
a shortcut for a long run of Undo. They earn their keep on an
[Unreasonable](#difficulty) board, where you may have to try a line and take it
back.

You can hold several checkpoints at once. If you want a single position to
return to, and the board checked before it is kept, that is the separate
[saved position](#checking).

To set one, open the ::history:: history panel (beside undo and redo) and
choose *Save checkpoint*, then carry on. If the line doesn’t work out, pick the
checkpoint in the panel to rewind to it.

Back at a checkpoint, ::undo:: undo and ::redo:: redo still walk the history
around it. Your first new move, though, discards everything after that point,
later checkpoints included; if you change your mind before making one, *Last
move* in the panel redoes all the way to the end. A checkpoint you no longer
want goes with its ::checkpoint-remove:: delete button.

::experimental:: Checkpoints are experimental and may change shape.

## Timing your solve {#timer}

Every puzzle times you, with a ::timer:: clock beside the move count. If you
would rather not see it, turn off *Show timer* in that puzzle’s
<command-link command="settings:puzzle">preferences</command-link>. Each puzzle
remembers its own choice.

The clock starts with your first move, not when the board is dealt, and it
stops while the app is out of sight. Once you have solved the board, the time
is final: undoing afterwards will not restart it. If you lose (in Mines, say),
the clock waits while the board stays lost and carries on if you undo.
Starting over does not reset the clock or stop it: the time is how long
you have spent on that board.

When you solve the board, the time appears in the message that congratulates
you. If the app helped on that board, the message says so beside the time. A
hint counts as help, and so does the solver, and so does a
[check](#checking) that found something: a mistake, or a position there is no
way on from. A check that finds nothing wrong does not count, so saving a sound
board is always free.

## Autosave {#autosave}

Each puzzle keeps your game in progress and resumes it when you come back,
whether you closed the tab, wandered off, or hit a bug. Starting a new game, or
choosing another variation or difficulty in the ::puzzle-type:: type menu,
replaces it. Until you move on the new board, [undo](#undo-reach) brings the
old game back.

On the home screen, a puzzle with a game in progress wears a
::game-in-progress:: triangle on its icon.

To discard every game in progress, open the
<command-link command="settings:data">preferences</command-link> and choose
*Clear data… Delete games in progress.*

## Sharing a game {#sharing}

*::share:: Share* in the *Menu* (or
<command-link command="share:link">here</command-link>) offers:

* **This specific game**: a link to the game you are playing, as it was dealt.
  The link carries the board itself, so it opens the same game after the app
  is updated. It doesn’t carry your progress; for that,
  [export a save file](#saved-games) or copy as text. Opening a link to a
  board you are already playing on this device picks up where you left off.

* **This puzzle type**: a link to the current ::puzzle-type:: type, meaning the
  size, difficulty and any other options. Opening it deals a new random game
  of that type, which makes it the way to pass on a custom type.

* **Copy as text**: the board as plain characters, for pasting into a forum
  post or a message. Use a fixed-width font (“format as code”). Not every
  puzzle can do this, and some of the renderings take a little imagination.

* **Game ID**: the game itself, without the link around it, for any
  compatible app. Simon Tatham’s manual explains the format under
  [*Specifying games with the game ID*][sgt-gameid]. This app shares no random
  seeds: a seed only tells a generator what to deal, and some puzzles here
  generate differently from the original, and from earlier versions of this
  app.

To open a game someone sent you, open its link, or paste the link into
<command-link command="enter-gameid">*Open a shared game*</command-link> in
the *Menu*, which is the way in from the installed app. Any puzzle’s link works
from any puzzle, and so does a link to a game on Simon Tatham’s website,
though a link there by random seed may deal a different board here; a bare
game ID opens a game of the puzzle you are on.

For puzzles that exist on Simon Tatham’s website, the share dialog also links
the same game there, by its game ID, which is handy for comparing behavior
when something looks wrong.

## Saving, loading, exporting and importing {#saved-games}

*::save-game:: Save as…* in the *Menu* keeps the whole game, undo history and
[checkpoints](#checkpoints) included, and *::load-game:: Open saved…* brings it
back.
Saved games stay on your device, in your browser’s storage.

*Export…* in the save dialog writes a file you can move to another app that
plays the collection, or attach to a bug report; *Import…* in the load dialog
reads one in. (Exported files leave checkpoints behind for now.)

To delete every saved game, open the
<command-link command="settings:data">preferences</command-link> and choose
*Clear data… Delete saved games.*

Your games and settings stay in your own browser, on your device. The
<command-link command="about:privacy">privacy note</command-link> sets out what
the app does and does not keep.

[sgt-common]: https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/common.html#common
[sgt-gameid]: https://www.chiark.greenend.org.uk/~sgtatham/puzzles/doc/common.html#common-id
