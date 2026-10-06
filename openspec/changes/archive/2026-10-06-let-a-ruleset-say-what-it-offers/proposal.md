# let-a-ruleset-say-what-it-offers

Found while splitting Ascent's dialog in `declare-ascent-and-flip-rulesets`,
and agreed with the owner as a follow-up.

## Why

A ruleset is a different puzzle, so it often does not take every setting the
game has. The Custom dialog showed every field whatever the ruleset, and the
mismatch was found after OK was pressed, as a refusal.

Ascent was the worst case. Its `validateParams` had four refusals keyed on
Edges: Edges on any grid but the Rectangle, with symmetrical clues, below
Normal, and on 2x2. **The first existed only because of how the split was
built.** Ascent keeps one `mode`, in which Edges is a fifth value beside four
grids. Edges with the Hexagon chosen has no value to be, so
`MODE_EDGES_OFF_GRID` was added: a mode that only a dialog's working copy
held, there to be refused.

## What was measured (2026-10-06)

**Every `validateParams` refusal that tests the game's ruleset**, in the five
games that call `rulesetItem`, read in full:

| Game | Refusal | Shape |
| --- | --- | --- |
| Ascent | Edges off the Rectangle | ruleset leaves one choice of a field |
| Ascent | Edges with symmetrical clues | ruleset fixes a checkbox |
| Ascent | Edges below Normal | ruleset leaves some choices of a field |
| Ascent | Edges on 2x2 | ruleset and two typed numbers |
| Seismic | area over 64, or 100 for Tectonic | ruleset and two typed numbers |
| Unequal | Adjacent under size 5 from Tricky up | ruleset, a typed number and a tier |
| Salad | two symbols at Normal, by ruleset and size | ruleset, two typed numbers and a tier |
| Flip | none | |

Three of the seven are "this ruleset leaves field F these values", and all
three are Ascent's. The other four bind a typed number.

**The same for modifiers**, in the nine games that call `modifierItem`: two
refusals have the first shape (Group's hidden identity leaves out Easy;
Bridges' one bridge a line leaves out Tricky), and the rest bind a typed
number (ABCD, Guess, Net, Solo, Unruly, and Group's 3x3).

**The dialog** is built from `ConfigDescription`, which held a flat list of
fields, and `PuzzleConfigForm` (`src/puzzle/components/config.ts`) rendered it
once and re-rendered on nothing.

## What was decided

- **A ruleset declares `only`**: by a field's keyword, the choice indices it
  offers or the one value of a checkbox. It is data on the ruleset and not a
  predicate on params, so the page can work out what to show with no trip to
  the worker, and the help can say it.
- **Three readers, one declaration**: the refusal in `paramsError`, the
  dialog through `ConfigDescription.narrowing`, and a sentence in the field's
  help entry. Ascent had written each of the three by hand.
- **The refusal holds a deal, not a board already written.** Ascent's two
  were generation-only, and a `:desc` ID arrives with its board in hand.
- **The form keeps what the player set** and derives what it shows, so
  choosing Edges and going back returns the grid and the tier they had.
- **The midend also checks the values as submitted.** With one `mode`, Edges
  and Hexagon reach no params value, so the draft alone would pass the pair as
  Edges on the Rectangle without a word.
- **Disabled, not hidden** (the owner, 2026-10-06): a narrowed control stays
  where it is, grayed, at the value the ruleset gives it. The form keeps its
  height, and the grayed value says what Edges is played on.
- **A limit on a typed number is declined.** A text box cannot show a bound
  before OK is pressed, so the dialog has no second copy of it for a
  declaration to remove, and the four refusals of that shape are conjunctions
  a per-field bound could not state. They stay in `validateParams`.
- **Modifiers are a change of their own**, `let-a-modifier-say-what-it-leaves`.
  The dialog's side is already a list of deciding fields. What is not settled
  is theirs alone: which of two coupled fields gives way, and that Group's
  refusal holds a written board where Bridges' does not.

## What shows it worked

Choosing Edges in Ascent's Custom dialog leaves no way to ask for a Hexagon,
`MODE_EDGES_OFF_GRID` is gone, three of the four Edges refusals are no longer
written in `ascent/index.ts`, and a game ID that names Edges at Easy is
refused with a sentence. Seen in the app at desktop and phone width.

## Hints to pull in

None.
