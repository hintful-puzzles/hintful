# Design: every hint step is a gesture

## D1. The gesture comes from the game, per move; the step still carries its move

The proposal put a gesture on each `HintStep`, with the midend deriving the
move from it. Two things made that the wrong seat for it:

- **A plan is computed without a board on screen.** `hint(state)` runs from
  the state alone, and a gesture is pixels: which point a tap lands on depends
  on the tile size, a scrolled origin (Net's wrapping grid) and `Ui` modes that
  may change between the plan and the step. A step-borne gesture would have
  to be written in board terms and mapped to pixels later anyway.
- **Every hint planner would carry input.** Forty-five plans would each learn
  how their game is clicked, beside the deduction they narrate, where one
  input-side function per game already knows it.

So the gesture is `Game.hintGesture(state, ui, ds, move)`: asked when the step
is played, from the live board and `Ui`, for the step's move. The step keeps
its `move`, which is what the plan reasons with, what `hintKeepTrack` compares
against and what the highlights are drawn from; that also settles the
proposal's two open questions (the highlight's source and a journey's legs)
by leaving both as they are.

**What makes it structural is what the midend no longer does.**
`executeHint` never applies `step.move`. It sends the gesture through
`interpretMove` exactly as the frontend sends a tap, a drag or an on-screen
key, and every move that makes is judged by the game's own `hintKeepTrack`:
off the step throws, and so does a key no on-screen control sends, a move
after the step completed, or a gesture that ends short. So a hint cannot play
a move the pointer does not make, because the only moves it plays are ones
`interpretMove` returned for pointer input. `hint-gesture.test.ts` walks every
hinted game's plans with `executeHint` on every gate preset, so a step the
pointer cannot make fails the gate the day it is written. Net's lock would
have: its step could not be played without a notes-mode press, which is the
route `audit-input-affordances` gave it.

## D2. Replay is the frontend's, including its quirks

- A click is a press and its release at one point; a drag is a press, a drag
  event at each `through` point and at `to`, and a release at `to`.
- A press the game declines gets its release at once, where it was pressed,
  and no drag (`view-interactive.ts` does this, because the midend's contract
  is one release per press). Guess acts only on that release.
- A key is sent at the origin, as `processKey` sends it, and must be one the
  keypad offers (`Midend.requestKeys`, which adds the Marks key to every game
  that takes notes) or the toolbar's mark-all (`M`, when `canMarkAll`).
- `UI_UPDATE`s during the gesture repaint and do not dismiss the hint: the
  hint is the one pressing.

Each move is committed as the player's own; the one that completes the step
is the one played in slow motion, and the plan advances when it settles, as
before. A step the pointer makes in several moves (three pencil strikes, Net's
half turn as two quarter turns) is therefore several moves in the history,
exactly as a player following it by hand would leave.

## D3. Shared shapes, so a game writes only its geometry

- **Target-verb games**: `TargetGeometry` gains `pointAt`, the inverse of
  `pointerTarget`, required of every geometry; `verbGesture` taps a verb at
  targets and `routeGesture` plays a key-only verb's declared pointer route.
  `target-verb.test.ts` holds `pointAt` to address its own target for every
  target a press reaches.
- **Note-taking cells**: `noteEntryGesture` taps the cell (unless the
  highlight is already there, since a repeat tap puts it away), sets the mode
  with the Marks key, presses the symbol's key, and leaves the mode as the
  player had it. `candidateGesture` reads a candidate move through the game's
  `CandidateMoveAdapter`: a fill-all is the mark-all key; a strike the mark-all
  control makes whole on this board (the obvious-clean step, asked of the
  game's own `interpretMove` by `markAllNow`) is one press of it; and any other
  strike is one note toggle per mark. `keepCandidateHintTrack` completes a strike
  made whole, which also lets a player follow that step with the control.
  Border-grid games share `borderHintGesture`.

## D4. The keyboard route stays a guard

A gesture is the pointer's. The keyboard's route to the same moves is held by
the target-verb model's keys-equal-buttons guard for every game in the model,
and by each outside game's own tests; `declare-drag-games-click-half` brings
the drag games into the model. The proposal allowed a replay guard for the
keyboard as well; it would need every game to write a second, cursor-walking
gesture, for a route the audit found intact everywhere but Group, which that
change already closed.

## D5. What a gesture found

Writing a gesture for every hinted game found five places where the pointer
could not follow a hint, each now fixed in the game:

- **Salad**: the circle hint's tidy-up strikes the "might be empty" note, and
  the move dialect read the note pencil-mode X writes as mark `-1` while
  `executeMove` toggles candidate `nums + 1`. No pointer move could complete
  the step. The dialect now reads pencil X as that candidate.
- **Loopy with auto-follow on**: a click extends along the forced corridor, and
  `hintKeepTrack` called the extra lines off the step, so a player with the
  preference on could not follow a line step by hand, and auto-hint would have
  thrown. The corridor is tolerated, derived from the step's own edges as auto
  rule-out already was (`autofollowEdges` moved beside `forcedRuleOuts`).
- **Bridges**: a drag cannot start from an island the player marked done. The
  gesture taps one mark off first, and `hintKeepTrack` treats a done-mark toggle
  as on track, since it changes no span the step decides.
- **Subsets**: a rule-out step needs the cell's inspect icon clicked first, and
  that click dismissed the hint (`uiUpdateClearsHint` was `() => true`), so the
  step could not be followed by hand. A rule-out step now stays up.
- **Untangle**: a drag lands on a pixel, and the hint named points in 1/64 of a
  tile, so at most tile sizes the landing was up to half a pixel off, which on
  about 6% of boards changed the crossings the step counts; with snap-to-grid on
  most targets were unreachable. The hint now proposes only spots where its
  counts hold for every landing the pointer can make at any tile size from 16
  px (`landing.ts`, whose comment gives the soundness argument), and only snap
  cells when snapping is on; `hintKeepTrack` completes a drop inside the
  target's half-pixel box that keeps the crossings the words count. Measured
  once: 400 walks over tile sizes 16 to 130, both snap settings, all solved,
  against 6 in 100 failing before.

Two effects a player can see, both deliberate: auto-hint now leaves the
selection where the taps left it (the last cell a note went into keeps its
highlight, Ascent's played square stays selected), because the hint is played
the way the player would play it; and a step made in several moves is several
entries in the undo history.
