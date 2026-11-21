## 1. The contract

- [x] 1.1 Define the frame type in `contract/game.ts`; the midend builds it
      once a redraw. Decide whether `prev`/`dir`/`animTime` group as an
      animation object, and record why. (Flat: `animTime` runs on through a
      flash after `prev` is dropped, and `dir` outlives both, so a nullable
      group would change what games see. Recorded on `Frame`.)

## 2. Migrate

- [x] 2.1 Move every renderer, the shared ones and the skeletons; verify
      by the diff's shape (signature and reads only). Typecheck and the
      render, warm-repaint and first-frame guards; no snapshot moves.
      (A TypeScript-API codemod rewrote the implementations, by an eighth
      parameter typed `Flash`, and the callers of `redraw`. Bridges, Untangle
      and Magnets lost the adapters that respread the frame positionally.)
- [x] 2.2 Run the app on a game of each kind: a move, an animation, a hint,
      the win flash. (Fifteen: a move, undo, a hint's slow-motion slide, the
      win wave; Magnets, Bridges, Untangle: a hint. It found Untangle's
      where-to-look beat painting nothing, identical on HEAD: its early-out
      keyed on two marks the narrowed step lacks. Fixed by keying on the
      step, and `repaint-differential` now shows the look beat, as the app
      does, which convicts the old Untangle and no other game.)

## 3. Finish

- [x] 3.1 `docs/rendering.md` and the capability surface say it. Commit,
      push, archive. (No spec names the signature; no delta.)
