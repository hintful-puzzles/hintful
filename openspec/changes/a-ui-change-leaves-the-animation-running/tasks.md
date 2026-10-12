## 1. Reproduce

- [x] 1.1 In the app, Ascent solved by hand: which last moves lose the highlight
- [x] 1.2 Which games arm an animation and clear it within one gesture

## 2. The engine

- [x] 2.1 Midend tests, seen to fail first: the win flash plays on through a `UI_UPDATE`, a hover and a change of reference, and a move's animation keeps its time under a `UI_UPDATE`
- [x] 2.2 `Midend`: `uiUpdated`, `processHover` and `selectReference` no longer clear the animation

## 3. Specs and docs

- [x] 3.1 Delta for `engine-drawing`
- [x] 3.2 `docs/games/rendering.md` § "Animation and flash"

## 4. In the app

- [x] 4.1 Ascent: the highlight plays where the last move is a tap, and where it is a one-digit or a two-digit typed number committed by a tap
- [x] 4.2 Black Box and Tracks, which the probe named: read, not driven. Tracks has no `animLength` and Black Box's is nonzero only for a laser fired from the keyboard cursor, so the probe's pointer gestures armed an animation of no length and nothing a player sees changes there
- [x] 4.3 Twiddle and Fifteen: a move made from the keyboard, the cursor moved 40 ms into its animation. The move plays on with the cursor in its new place, the board settles clean, and the console is quiet

## 5. Acceptance

- [ ] 5.1 The owner reported the missing win animation by name, and it is theirs to accept in the deployed app
