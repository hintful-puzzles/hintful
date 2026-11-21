## 1. The contract

- [ ] 1.1 Define the frame type in `contract/game.ts`; the midend builds it
      once a redraw. Decide whether `prev`/`dir`/`animTime` group as an
      animation object, and record why.

## 2. Migrate

- [ ] 2.1 Move every renderer, the shared ones and the skeletons; verify
      by the diff's shape (signature and reads only). Typecheck and the
      render, warm-repaint and first-frame guards; no snapshot moves.
- [ ] 2.2 Run the app on a game of each kind: a move, an animation, a hint,
      the win flash.

## 3. Finish

- [ ] 3.1 `docs/rendering.md` and the capability surface say it. Commit,
      push, archive.
