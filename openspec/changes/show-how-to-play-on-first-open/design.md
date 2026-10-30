# Design

A UX / technical-writer consultant, briefed with the proposal's facts and the
pages but not this session's conclusions, recommended the card, the seen
record and the checklist below. It found a clear winner on both of the
proposal's questions for the owner, so neither was put to them at first. On
seeing the card, the owner answered the second themselves: every existing
player sees each game's card once (2026-10-30, below).

## What a first open shows: a card of the rules

A card, not the drawer. The drawer opens on the rules and runs straight into
Controls, which are long and mostly about mouse and keyboard; on a phone it
covers the board with them. What a newcomer cannot learn by trying the board is
the goal and the constraints, and that is the page's unheaded rules section.
So the card is:

- headed by the game's name;
- the page's rules, as the help page renders them;
- **Play**, which closes it and has the focus, and **Full rules and
  controls**, which opens the How to play drawer.

It is a `wa-dialog` with `light-dismiss` (the reading rule in
`dialog-dismissal.test.ts`), so it closes on Play, the close button, Escape and a
tap outside, and the native modal's backdrop takes the dismissing tap, so the
board never sees it. On a narrow window it sits at the bottom and grows to
fit the rules; on a wide one it is centered. What is left of the board shows,
dimmed, behind it. It was first capped at half the window, to keep more board
in view, but on a phone the board was mostly covered anyway and the rules
scrolled; the owner asked for it bigger (2026-10-30). The rules are what the
player came to read, so the card fits them, and the word budget below keeps
them short enough to fit without scrolling on a 360×640 phone.

**Its words are the page's rules, with no second copy.** The catalog's
`objective` is too thin to play from ("Find the fleet in the grid.") and
repeats the card the player just tapped; a new `summary` field would be a
second hand-kept copy of the rules. So the rules section becomes the
newcomer's summary by rule: it is held to a word budget, and detail past it
moves under a heading of its own, which serves the full page too.

**The card reads the rendered page**, `/help/<id>`, which the service worker
precaches, and takes what lies between its title and its first `h2`: the
renderer writes the rules there and nothing else. Offline is then the help
page's own guarantee, and no rules are bundled into a game's chunk. A page
that cannot be fetched shows no card, and the game plays as before.

`{{modifiers}}` lists stay in the card as the page has them: each line says
what a setting adds and the page says the Type menu names it, which reads
correctly on a plain board and on a shared variant alike.

## What records the first open

A new optional `PuzzleSettings.introduced`, and nothing else: a record
written before it reads as unset, so **every existing player sees each game's
card once**, on its next open (the owner's decision, 2026-10-30, on trying
the card). The consultant had recommended counting a remembered board
(`lastGameId`) as met too, so that players who know a game were not shown up
to 61 cards; the owner preferred that they meet the card, and the help
it leads to, once like everyone else. `lastGameId` alone was never an option:
it is cleared when a remembered board will not load, which would bring the
card back at the moment something has just gone wrong.

It is written when the card is shown, not when it is dismissed: "never again
unasked" outranks "might have missed it". Only `clearPuzzleSettings` or a
reset of the preferences, both explicit, brings it back. It is never counted
or displayed, so it is not a progression feature. The settings backup
carries it with the rest of the record.

**When it fires**: on the puzzle screen's load, whenever the card has not
been shown, whether the board came from a shared link, a restored game in
progress, a type in the URL or a fresh deal. A shared link's recipient is the
likeliest newcomer of all, and the card shows over the shared board; for an
existing player it shows once over the game they had going.

## The review's checklist

The checklist lives in `docs/help-pages.md` § "A page stands alone for a
newcomer". The checks it adds are in `src/help-coverage.test.ts`:

- the rules name no other cataloged game, and nor do the Controls;
- the rules are within the word budget: 90 words as the card shows them,
  the generated lists of modes and settings included. Measured on a 360×640
  phone, every card over about 90 shown words scrolled, and the generated
  lists were most of what overflowed (Ascent's four modes put it 307px
  over), so the budget counts them and their words were cut in the game's
  code where they are declared;
- no first-person author voice outside `origins`;
- no link in the rules.

## Touch: one generated line, not a placeholder per page

The largest finding: 19 pages tell a player to click or right-click and say
nothing of touch, while players are often on phones. `help/features.md`
§ "Right-clicking on a touch screen" explains the gestures, and nothing
pointed to it. The fix is the engine's: the renderer writes `{{touch}}` as the
first paragraph of every Controls section, as it writes `{{parameters}}`, and
a build transform expands it from what the game declares: whether it ignores
the secondary button (`ignoresSecondaryButton`), and whether it has an
on-screen keypad (`requestKeys`). Because the renderer writes the
placeholder, no page can omit it, and a page writes none of its own.
`controlsMarkdown`'s "(on a touch screen, a long press)" is then a second
statement and goes.

**No generated Latin entry scheme.** The proposal named one for the five
pages that say "the same control scheme as Solo". Each of those pages
restates the scheme itself, with keys that differ by game (Seismic clears
with Delete and 0, Salad has X and O), and the touch line now covers what
none of them said. So the Solo sentence is deleted, and a placeholder would
only have to carry those differences as parameters.

## Rewording adopted text

"Adopting or relocating a help page changes no words" binds an adoption, as
its scenario says ("**WHEN** a help page is moved into a game's
description"); a later fix to adopted words is this project's to make
(`help-pages.md` § "Owned by this project"). Splitting an over-budget rules
section moves paragraphs under a heading and changes no words; the Group and
Mines asides are reworded, and their credits are untouched.
