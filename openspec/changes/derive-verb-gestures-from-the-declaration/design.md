# derive-verb-gestures-from-the-declaration — design

Started 2026-09-30 at `e38a7857`. Every figure is history the moment it is
written.

## Task 0: Mosaic fits the model as it stands

Mosaic's press applies its move at once (a toggle, forward on the left button
and backward on the right, which its move calls `double`), and its drag paints
the pressed square's new mark along a line. `CURSOR_SELECT2` already sends
`double`, so Space already does what the right button does. It is the model's
own press shape — closer than the nine drag games, whose press waits for the
release — so its press arm records the drag anchor and hands the press to
`interpretTargetVerbs`. No model change.

## The derived click: judged by the midend's own judge

The proposal left open whether a derived gesture needs the game to split a
multi-target move into per-target results. It does not, because the midend
already has an exact judge of "does this move belong to this step":
`hintKeepTrack`. The midend plays a gesture and throws on any move it calls
`"off"`, and on any move after one it calls `"completed"`. So the engine
derives a step's clicks by simulation against that judge (`verbClicks` in
`target-verb.ts`):

- the game names the step's **targets**, in order — the one fact about the
  puzzle, and one every hand-written `hintGesture` already computed;
- for each target, the engine tries each button's verb, pressed up to four
  times, applying each press's move and asking `hintKeepTrack`; a press judged
  `"off"` abandons that button, and the fewest presses wins, the left button
  on a tie;
- a press judged `"completed"` ends the gesture.

It cannot disagree with what the buttons do, because it applies the verbs the
guard holds to the buttons, and aims with `pointAt`, which the guard holds to
`pointerTarget`. It needs no table of "which value is which button", which is
what every hand-written gesture re-derived (Pattern's
`clickBlack(v) === value`, Clusters' `cycleFill(…) === fill`, Bricks' three
cases, `borderHintGesture`'s bit test) — and what Loopy's local
`fewestPresses` and `borderHintGesture` were two partial copies of.

Two things the simulation must not do: change the player's `Ui` (a verb may
count a death in it, as Mines' does), so it runs on a copy; and change the
step, since `hintKeepTrack` may shrink `step.move` in place (Pattern's does),
so it judges against a copy of the move.

**The contract change:** `Game.hintGesture` receives the step as a fifth
argument. Only the midend calls it, and `hintKeepTrack` needs the step, not
just its move — Palisade's compares against the step's highlights.

## The arm helpers

`pressTarget(verbs, ui, target)` is the model's press for an arm that owns its
own press (park the cursor, hide it); `buttonVerb(verbs, button)` is the verb a
button applies, for a press or a release code, which was the model's private
`pointerVerb`.

## One click a target, not the fewest presses

The first draft searched each target for the fewest presses of one button,
after Loopy's `fewestPresses`. That cannot be decided from the judge: the
midend refuses any move `hintKeepTrack` calls off the step, so a cycle can pass
through an intermediate value only if keep-track calls it on the step, and an
on-track verdict does not say whether *this* target is done. Every one of the
twelve hand-written gestures clicked each target once, so one click it is;
Loopy's notes, which do press a target several times over values the step
accepts, keep their own gesture.

## What the conversions found

- **Loopy's `set` steps** once skipped an edge an earlier click's automatic
  rule-out had already settled; `verbClicks` cannot skip one (it would click
  it, and keep-track would refuse). Measured over every leaf preset at six
  seeds: 2,904 multi-edge `set` steps among 21,169, and no later edge was ever
  settled mid-step, which puts the rate below about 0.1% (95%). Should it
  happen, `verbClicks` throws and the hint walk names the step.
- **Boats and Clusters** carried a `dragButton` field only to pick the
  release's verb; the release code already says which button, since the
  frontend sends the release of the button that pressed. Both fields are gone,
  and two Boats tests that sent a right press with a left release (which the
  frontend never sends) now send the right one.
- **Spokes'** hint step is a click on the spoke's rim dot, where it was a
  hub-to-hub drag: the click is the verb, and both make the same move.
- **Palisade and Separate** lose `borderHintGesture`, the copy that re-derived
  the button from an edit's bits; `borderStepEdge` names the step's edge.

## Mosaic's hint

Mosaic's two rules are the whole of its solver (`solveCell`), and generation
keeps a board only when they solve it, so the hint narrates exactly them: a
number that has all its black squares whitens the rest of its block, and a
number with only as many non-white squares as it needs blackens them. The
block is outlined as one area, the decided squares ringed. The plan is taken
by worklist (after a firing, only the numbers whose blocks it touched), and
the mistake check's solution is solved once per board.

**`hint-resume.test.ts`'s cap was a false claim.** It said 800 moves was "far
above any honest plan length"; a 50×50 Mosaic plan is 1,343 to 1,373 steps
(three seeds, 2026-09-30). The cap is now twice the game's own first plan,
never below 800, and a planted no-op step still fails it. Before the worklist
and the cached solution, that one walk took 489 s; after, the Mosaic case
runs in a few seconds.

## Behavior that changes for players

- **Mosaic:** a Hint that explains; Enter and Space follow the target-verb
  model (a click parks the cursor, and the first select on a hidden cursor
  shows it where it last was, rather than jumping to the top-left square).
- **Everything else:** no change to what a player's input does. Hint steps are
  played by the same clicks as before, now found rather than hand-computed.
