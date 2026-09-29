# derive-target-verb-input — design

Measured 2026-09-29 at `025fca8f` on an idle machine (load average ~3.5, 40%
memory free). Every figure is history the moment it is written.

## Task 0: does Enter do what a left-click does?

**The instrument.** For every registered game, one board (the input probe's
fixed seed), and two sets of boards per input:

- **By pointer:** from the opening position, a press-and-release of the button
  at every point on a quarter-tile lattice across the canvas. Each distinct board
  that results is one member.
- **By key:** every cursor position the arrow keys reach, found by a
  breadth-first walk over `(Ui, board)`, and the key pressed at each. Each
  distinct board is one member.

Comparing the sets asks "does Enter at the cursor do what a left-click at a
target does?" without the instrument knowing where any target is drawn, which
is what let it run over 57 games unaided. The first cut keyed a result on the
**move** and reported Palisade as disagreeing (80 clicks against 40 keys): a
click and a select on the same edge build the two cells' edits in opposite
orders. Keyed on the resulting **state**, Palisade agrees exactly. The second
cut hashed a state holding a cyclic grid as `[object Object]`, which read Loopy
as a single board; a digest that writes a revisited object as `~` fixed it
(220 and 220). Both were instrument errors caught before any conclusion was
drawn from them.

**The finding.** 23 games agree exactly on both halves — Enter reaches exactly
the boards a left-click reaches, and Space exactly those of a right-click:

> blackbox, boats, bricks, clusters, dominosa, lightup, loopy, mines, mosaic,
> netslide, palisade, pattern, range, separate, singles, sixteen, slant, spokes,
> sticks, tents, tracks, twiddle, unruly

Flood agrees on the left half and has no right verb at all (both sets empty).
**The falsifier (fewer than about 20) does not fire.** The derivation is real.

Of the survey's 17 members, the ones that do not agree exactly, and why:

| Game | What differs | Reading |
| --- | --- | --- |
| Magnets | left-click reaches 52 boards, Enter 30 | the 22 extra are clicks on a **clue**, which marks it done; the cursor never leaves the grid, so a keyboard player cannot mark a clue at all. An input-parity gap the model's geometry would close (a gutter target). |
| Subsets | Enter reaches 92, left-click 44 | the keyboard walks down into the **tally band** and rules a set out in one press; a pointer needs two (inspect, then tally). Not a derivation failure: the band is a second target kind. |
| Flip | Space reaches 25, right-click 0 | Space is Enter's verb, because Flip has no right verb. This is the convention the model adopts. |
| Net | Space reaches the middle-click boards, not the right-click ones | Space **locks** (the middle verb); rotate-clockwise is `d`. A game-supplied key map the model does not express yet. |

Galaxies shows the Flip shape too (Space ≡ Enter, right-click a separate gesture).

## The second falsifier: resolve-on-release

Measured on the same boards: whether a click commits on the **press** or only on
the **release**, and whether a one-tile left-drag reaches a board that neither
click alone nor the pair of clicks reaches.

Of the 17 members, **14 commit on the press and have no drag at all**. Three
touch the release: Mines (the press depresses, the release opens), Black Box and
Loopy. Three of seventeen is under the third the falsifier sets, so **the model
need not own resolve-on-release** for its members, and does not.

The measurement also corrects the proposal's "eight click-plus-drag games"
among the members: none of the 17 shows a drag reaching a new board. The
click-plus-drag games are the ones *outside* the member list that agree on
Enter anyway — Boats, Bricks, Clusters, Pattern, Spokes, Sticks, Tents, Tracks
and Galaxies commit on release and have drags that reach new boards. They can
declare their click half later, with the drag as an arm of their own; that is
where resolve-on-release would matter, and it is for the sweep to measure.

## The shape

`engine/target-verb.ts`. A game declares:

- a **geometry**: `pointerTarget(state, ds, p)`, `cursorTarget(state, ui)`,
  `parkCursor(ui, target)`, `moveCursor(state, ui, button)` and a `noun`;
- a **verb** per button — `primary` (left, Enter), `secondary` (right, Space),
  `middle` — each `{ does, keys?, apply(state, target) }`, where `apply` returns
  the game's own `Move` or `null`.

`interpretTargetVerbs` owns what the collection had written a dozen ways and
could not explain in terms of any puzzle:

- a press parks the cursor, hidden, on what it pressed (Light Up and Unruly did
  not park; Range and the border grid did);
- the first select on a hidden cursor only shows it (Range returned `null`, a
  dead key; Singles acted on the hidden square; Light Up and Magnets revealed);
- a press that applies nothing repaints only if it hid a shown cursor;
- Enter applies `primary`, Space `secondary` or, without one, `primary` (Flip's
  convention, measured above); a verb's `keys` apply it too.

`squareGrid({ size, border, wrap? })` is the common geometry. `size` is an
accessor rather than a `{ w, h }` constraint because Unruly's state names its
dimensions `w2`/`h2`.

**`interpretMove` stays required and stays the game's.** A declaring game ends
it with `return interpretTargetVerbs(targetVerbs, …)` and puts any arm of its
own above that line. Considered and declined: making `interpretMove` optional
when `targetVerbs` is present and having the midend dispatch. Forty-nine test
files call `game.interpretMove` directly, and a callback shape for the override
would be a second convention for what a plain `if` above one line already says.
The two are held together behaviorally instead (below).

**Verb semantics are functions, never flags.** Light Up's mutual refusal of
bulb and dot, Range's three-state cycle, Singles' "either button clears" and
Unruly's two opposite cycles are each a line of `apply`.

## Two consumers, one declaration

- **The help.** `controlsMarkdown` writes the Controls paragraph — the click
  sentence per verb, the long press, and what Enter, Space and each verb key do —
  and `vite-plugins/controls.ts` replaces `{{controls}}` with it. A declaring
  game's page without the placeholder, or another page with one, fails the
  build, and `help-coverage.test.ts` says so first. What the page writes after
  it is only what the game does beyond its verbs (Range's Shift-arrows, Unruly's
  digits, Singles' click outside the grid).
- **The guard.** `target-verb.test.ts` runs Task 0's instrument, kept as
  `boardsReached` in `testing/input-probe.ts`, over every declaring game, and
  asserts exactly what the paragraph claims: Enter's boards equal the
  left-click's, Space's those of its verb's button, each verb key those of its
  button (on a board primed with one click, so an emptying verb has something to
  empty). Proven red twice before trusting it: Space rewired to Enter's verb in
  Light Up, and Delete swallowed in Unruly. The instrument first painted a frame
  per read and cost 20 s for four games; it now reads the state and `Ui` from
  the game's own constructors and moves, and costs about 1 s.

## Behavior that changes for players

Decided rather than asked, because in each case one answer is plainly better
and no puzzle explains the other:

- **Range and Unruly:** Enter or Space on a hidden cursor now shows it. It did
  nothing before.
- **Singles:** Enter or Space on a hidden cursor now only shows it; it used to
  act on a square the player could not see.
- **Light Up, Unruly and Singles:** a click parks the hidden cursor on the
  clicked square, so the next arrow carries on from there.
- **Light Up:** a click off the grid no longer hides the cursor.
- **Singles:** a middle-click in the grid no longer hides the cursor.

## Net is not a member yet

The proposal pulls Net's hint in after the pilot, and tells the change to
re-check Net's membership first. Measured, Net is not expressible in the model
as built: its Space applies the **middle** verb (lock), and its clockwise
rotation is a key of its own. Extending the model for that is sweep work, and a
hint written against a model Net does not use yet would test nothing about the
model. So Net's hint moves with Net into `sweep-target-verb-input`, scaffolded
by this change with the measured misfits above as its task 0.
