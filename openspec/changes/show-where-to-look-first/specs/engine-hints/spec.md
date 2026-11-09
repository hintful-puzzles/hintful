## REMOVED Requirements

### Requirement: The toolbar Hint button alternates show and apply

**Reason**: The Hint control has three beats, not two: where to look comes
before the whole step.

**Migration**: "The toolbar Hint button walks where to look, why, and apply"
carries the rule, with Auto-Hint unchanged.

### Requirement: A Hint press applies only while armed

**Reason**: The armed-to-apply flag is a beat of three.

**Migration**: "A Hint press does the beat it is on" carries the rule,
refusals included.

### Requirement: Any other action disarms the apply

**Reason**: An action between presses now returns the control to where to
look, not only from the apply.

**Migration**: "Any other action returns the Hint control to where to look".

## MODIFIED Requirements

### Requirement: A hint asked while an executed step animates shows the next step

When `midend.hint()` is called while the move of a step `executeHint` played
is still animating, the midend SHALL first settle that step, as its landing
would, and then display the step after it. The landing SHALL NOT hide the step
so displayed, so the Hint control never offers to explain or apply a step that
is not shown.

#### Scenario: Two quick presses

- **WHEN** a player presses Apply the hint and presses Hint again while the
  applied move is still animating
- **THEN** where to look for the next step is shown, it is still shown once
  the move lands, and pressing the control again explains that step

### Requirement: A Hint press in flight is dropped, and a slow one says it is thinking

While a Hint press is being answered by the worker, a further press SHALL be
dropped, not queued; nothing else in the app queues behind a hint either. The
rhythm of the beats SHALL be exactly as it would be had the dropped presses
never happened: during a show nothing is armed yet, and during an explain or
an apply the beat moved on the way in. A show whose answer lands after
Auto-Hint has started SHALL NOT arm the next beat behind it: Auto-Hint owns
the plan from the moment it starts.

#### Scenario: Presses during a slow hint are dropped, and the rhythm survives

- **WHEN** the player presses Hint three times while the first press is still
  being answered
- **THEN** exactly one request reaches the worker, and the press after it
  lands takes the beat after the one that press showed

## ADDED Requirements

### Requirement: The toolbar Hint button walks where to look, why, and apply

The app shell's Hint control SHALL walk three beats over one hint step: show
where to look for it, then explain it, then apply it, built on
`midend.hint(true)`, `explainHint()` and `executeHint(true)`, without changing
any game's `hint()`. Applying SHALL be terminal: it SHALL NOT go on to the next
hint. Auto-Hint SHALL remain the way to play the whole remaining plan
unattended, each step shown whole.

#### Scenario: Three presses look, explain and apply

- **WHEN** the player presses Hint three times on a hinted game with no
  active plan, with no other interaction between presses
- **THEN** the first press shows where to look, the second shows the step's
  words and every mark, and the third applies that one step in slow motion,
  hides the plan, and shows a "Hint applied" confirmation

#### Scenario: A journey's later leg is shown whole at once

- **WHEN** the player presses Hint on a step that continues the journey the
  step before it began (`continuesPrevious`), or on a step whose words name no
  mark
- **THEN** the press shows the whole step and the next press applies it

### Requirement: The Hint control's label says its next beat

The Hint control's label SHALL say what its next press does: "Hint", then
"Explain the hint", then "Apply the hint", and "Thinking…" while a press is
still being answered. The keyboard's H SHALL be the same command, walking the
same beats.

#### Scenario: The label follows the beats

- **WHEN** the player presses Hint and the step is shown at where to look
- **THEN** the control reads "Explain the hint", and after the next press
  "Apply the hint"

### Requirement: A hint's first beat shows one mark, chosen by the engine

Where to look SHALL draw one mark of the step's own words
(`Narration.whereToLook`): the outline naming the fewest elements, or where
the words name no outline the fewest-element stripes, or else the ring, or
else the strike, with a ring on the step's move only where nothing else is
named. The status line SHALL say "Look here." and offer no reference to point
at. No game SHALL write anything for it: the midend draws the narrowed words
through the game's own renderer.

#### Scenario: Every hinted game shows one mark first

- **WHEN** a hint is shown at where to look in any game with a `hint()`
- **THEN** its drawn words name one mark, the frame differs from the board
  with no hint, and explaining shows the step's own words and every mark

### Requirement: A Hint press does the beat it is on

The orchestrating `Puzzle` SHALL keep the Hint control's beat: show, explain
or apply. A press on show SHALL run `midend.hint(true)` via the surface and,
if the show returns no refusal, move to explain where the midend shows where
to look, or to apply where it shows the whole step. A press on explain SHALL
show the whole step and move to apply. A press on apply SHALL return to show
and apply exactly the current step via `executeHint(true)`.

#### Scenario: Explaining moves to apply

- **WHEN** a Hint press on explain shows the whole step
- **THEN** the next press applies that step

### Requirement: A refused hint stays on where to look

A refused hint (mistakes present, already solved, nothing deducible) SHALL
show its banner and overlay and SHALL leave the beat on show, except a refusal
with a way forward, which moves it to apply.

#### Scenario: A refused hint does not arm the apply

- **WHEN** a Hint press is refused (for example, the board has mistakes)
- **THEN** the refusal banner and overlay are shown, and the next Hint press
  is still on the show path (it does not apply a step)

### Requirement: Any other action returns the Hint control to where to look

The beat SHALL return to show on any user action between two Hint presses: a
move (key or pointer), undo, redo, solve, restart, new game, checkpoint load,
loading a saved game, deletion, or starting Auto-Hint.

#### Scenario: An intervening action re-arms the show

- **WHEN** the player presses Hint (showing where to look, or the whole
  step), then performs any other action (e.g. a move or undo), then presses
  Hint again
- **THEN** the next press shows where to look for the now-relevant step and
  does not explain or apply a stale one
