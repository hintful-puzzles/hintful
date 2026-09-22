# own-the-select-or-drag-gesture — design

## 1. The repeat-tap answer: the highlight goes away, everywhere

The owner allowed either answer so long as every member agrees. **A repeat tap
puts the highlight away**, which is what the eleven click-select members already
do; Rome and Map come to it.

Chosen on the two tests the proposal set:

- **The engine is simplest.** The rule already exists, in
  `pressNoteTakingCell`'s deselect branch, and the sticky mode leans on it: with
  sticky pencil mode on, a repeat left press is the *only* way to put the
  highlight away with the pointer. Adopting "re-select everywhere" would have to
  replace that gesture with something, and the proposal flags exactly that cost.
- **The rule is easiest to state.** With this answer the whole change collapses
  to one sentence — *a tap is a press* — and the two paths can be made
  provably one function. "Re-select everywhere" is a second rule that only drag
  games would have needed.

It is also the answer that changes nothing a player of the other eleven games
can see, so it needs no acceptance checkpoint for them.

## 2. Why the rules have to run at the release, and what that forces

A press that may become a drag **cannot** run the selection rules, and the
reason is the sticky toggle rather than anything about the highlight: with
sticky pencil mode on, the right button's press arm *toggles the mode*. Rome's
and Map's right button also starts a mark drag. If the press ran the arm, every
right-drag would flip pencil mode on the way in — which the `ts-engine`
requirement forbids in as many words ("the drags themselves keep the buttons
they already had").

So the rules run at the release. And that forces the rest:

- The release has to know **whether the tap landed on what was already
  selected** (the repeat-tap rule) and has to be able to **leave the highlight
  exactly where it was** (the sticky carve-out). Both are facts about the
  selection *before the press*.
- Therefore **the press must not move the selection at all.** Today's press
  hides the highlight and, in Rome, walks the cursor onto the grabbed square;
  by the release both facts are gone, which is the single cause of both
  player-visible differences in the proposal.

That is the whole design, and it is a subtraction:

> **A press that may become a drag commits to nothing. The selection changes
> when the gesture resolves.**

The press-time record the proposal expected ("probably in the mechanic's `Ui`
fields") turns out not to be needed — its own alternative, "it may turn out not
to need state at all", is what happened. Nothing is added to any `Ui`.

A consequence worth naming: until the gesture resolves, the highlight stays
where it was, so a drag now plays out with the previous selection still showing.
That is honest — the selection genuinely has not changed yet — and it removes a
flicker, because today a tap on the selected cell blinks the highlight off at
the press and back on at the release.

## 3. The shape: two arms, named for the two ways a gesture ends

Both live in `engine/note-taking-cell.ts`, beside the press arm they share a
rule with. The internals are refactored so the sharing is literal rather than
parallel: `applyNoteTakingPress` takes "is the highlight already on this
selection?" as an argument, `pressNoteTakingCell` answers it with
`highlightIsOn`, and `tapNoteTakingCell` answers it with what the game says.

```ts
tapNoteTakingCell(ui, releaseButton, tap: TapTarget, cell): NoteTakingPress | null
dragEnteredNoteTakingCell(ui, x, y): void
```

- **`tapNoteTakingCell`** — the release committed nothing, so the gesture was a
  tap, and a tap is a press. It maps the release button to the press button the
  gesture used (the line both games had copied) and runs the same rules.
- **`dragEnteredNoteTakingCell`** — the release committed a move, so the gesture
  was a drag: an entry made with the pointer. The highlight goes to the thing
  the player acted on and then away, which is `pressNoteTakingCell`'s
  standardization 1 and `releaseHighlightAfterEntry`'s rule stated for a
  gesture instead of a keystroke. Without it, taking the hide out of the press
  would leave a drag with a stale highlight showing — so this is what keeps
  today's drag behavior rather than a new one.

### Selection identity: a convention with a first-class override

`TapTarget` is `{ x, y, onSelection? }`. `x`/`y` are where the highlight goes,
in the game's own cell coordinates. `onSelection` is the one genuine difference
between members — *what* is selected:

- **Left out**, the cell is the selection and the engine answers for itself with
  `highlightIsOn`. Rome, and any future drag game whose selection is a cell,
  writes nothing.
- **Supplied**, the game's selection is not a cell. Map passes
  `ui.cursor.visible && regionFromUiCursor(map, ui) === r`.

That is the shape `AGENTS.md` § "Convention over configuration" asks for: one
obvious way, an override that is first-class, and Map is not a special case in
the engine — it answers one question in its own vocabulary and gets every rule.

**It also fixes a latent defect in Map.** Today Map hands the arm the *tile*
under the finger, so two taps on different tiles of one region read as two
different selections. With the region as the answer they read as the repeat tap
they are.

### Alternatives declined

- **A press/release pair with the pre-press selection recorded in the `Ui`**
  (the proposal's expectation). It needs the pre-press cursor position, its
  visibility and, for Map, `curLastmove` — the whole selection, snapshotted —
  so that the sticky carve-out can put it back. That is a hand-maintained
  snapshot of somebody else's fields, which `AGENTS.md` § "Nothing is sacred"
  names as the smell. Not moving the selection in the first place needs none of
  it.
- **A selection *key* the game supplies at both ends**, compared by the engine.
  Strictly more machinery than one boolean for exactly one member's benefit, and
  it forces every cell game to encode `y * w + x` for a question the engine can
  already answer.
- **A single driver the game hands its drag callbacks to.** Rome's drag reads a
  direction off the square under the pointer and Map's carries a color and a
  pencil mask to an arbitrary region; there is no shared drag to drive, only a
  shared *beginning and end*. Two arms are the honest amount.

## 4. What this costs Rome: the cursor stops doubling as the grab

Rome's `Ui` said so out loud — *"Highlighted square — the keyboard cursor, **and
the grabbed square during a mouse drag**"* — and that conflation is why its
press had to move the cursor. The grab becomes `ui.mx` / `ui.my` beside the
`mmode` / `mdir` the drag already had, and the renderer reads the grab from
there rather than from the cursor. Map needs no new field: its drag already
carries its own origin.

## 5. How a drag is recognized: left alone, and it stayed different

The proposal left this open, to be unified "only if the games agree once written
side by side". They do not, and the difference is about the puzzles:

- **Rome** resolves a gesture by *direction*: back on the grabbed square means
  "no direction", so a drag out and back is a deliberate cancel and taps the
  grabbed square.
- **Map** resolves it by *effect*: a drop that changes nothing is a tap, and it
  taps the region it was released over — because dragging a blank region's
  nothing onto another blank region is not distinguishable from tapping the
  second one.

So each game still decides when its gesture committed; the engine owns what
happens in both cases. That is why `tapNoteTakingCell` takes the target rather
than deriving it.

## 6. The guard

`src/engine/select-or-drag.test.ts`, over the population derived from the
`Ui` fields, driving each game's own `interpretMove` through a real `Midend` —
press and release — so a drag game cannot pass by answering a direct call it
never receives. Two rules, both universal over the members:

1. **A tap that selects, repeated, puts the highlight away.**
2. **With sticky pencil mode on, a right tap never hides a showing highlight.**
   The unqualified form of the proposal's sentence, and it needs no search for a
   cell that can take no mark: every other path through the sticky branch ends
   with the highlight shown, so hiding it is only ever the carve-out failing to
   leave it alone. The carve-out is still exercised deliberately — the test
   counts the taps that took it, per member, so a sweep that never reached it
   fails rather than reports health.
