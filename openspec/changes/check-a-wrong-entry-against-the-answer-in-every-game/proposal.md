# check-a-wrong-entry-against-the-answer-in-every-game

**Status: filed 2026-10-11 by the session that archived
`open-and-check-the-boards-the-spec-census-found-mishandled`, whose sweep
found these. What it says of the code was true that day; re-check before
relying on it.**

## Why

Check & save is an answer check in every game (owner, 2026-10-02), and
`docs/games/solver-and-generator.md` § "The solvable-game contract" has
`findMistakes` return every player cell that contradicts the one answer. Two
games return only what breaks a rule, as Subsets did until that change:

- **Bricks.** `findMistakes` (`src/games/bricks/solver.ts`) runs
  `bricksValidate` alone. The hint (`src/games/bricks/index.ts`, `hint`)
  re-solves, compares every shaded or ruled-out cell with the answer, and
  answers `CONTRADICTION_UNLOCALIZED` without saying which cell.
- **Clusters.** `findMistakes` (`src/games/clusters/index.ts`) is
  `findErrors`. The hint's plan comes back `INVALID` and it answers the same.
  A given carries `F_SINGLE` and a player's tile does not, so the answer is
  `solveGame` on the givens alone.

A player meets it by placing one wrong tile that breaks no rule yet and
pressing Check & save or Hint: "Not saved. These entries contradict each
other, so one of them must be wrong. Undo, or clear the ones you are unsure
of." No cell is marked.

## How it was measured

One sweep, kept below so the guard can start from it. For each of the 43
games with `findMistakes`, `solve` and `hint`: deal the first gate preset,
make 300 random single inputs (a click of either button at a random point,
half the time followed by a digit or letter key), and keep the positions
whose moves, played on the solved board, leave it unsolved: an entry the
answer contradicts. 3,084 such positions. A position is a finding where
`findMistakes` returns nothing and `hintFinishes` says the hint cannot then
finish the board.

- Bricks: 102 against the answer, 31 flagged, 71 findings, every one
  `dead-end` from `Midend.check()`. First: `{"kind":"paint","cells":[{"index":33,"to":"unshade"}]}`.
- Clusters: 97 against the answer, 9 flagged, 88 findings, every one
  `dead-end`. First: `{"kind":"paint","cells":[{"index":47,"fill":2}]}`.
- Subsets with its fix taken out: 37 against the answer, none flagged. With
  it: 37 of 37 flagged. This is the instrument's known positive.
- No finding in the other 40. **The sweep made no wrong entry in Ascent,
  Boats, Bridges, Guess or Signpost** (their moves are drags, or need a
  cursor first), and Mines' `solve` refuses a board not laid out, so it says
  nothing of those six. The guard has to reach them or say it does not.
- "Finishes anyway" positions (Net 195, Dominosa 117, Rect 108, and others)
  are moves that are not entries: a turn, a line the hint takes back. They
  are why the test asks the hint and not the answer alone.

```ts
// src/scratch-mistake-sweep.test.ts, run with `npx vitest run <file>`; it
// throws its report. `spy` wraps the game to hear the moves the midend made.
for (const [id, game] of REGISTERED_GAMES) {
  if (!game.findMistakes || !game.solve || !game.hint) continue;
  const params = gatePresets(id, game)[0].params;
  const desc = dealt(game, params).desc;
  const s0 = game.newState(params, desc);
  const sol = game.solve(s0, s0);
  if (!sol.ok) continue;
  const solved = game.executeMove(s0, sol.move);
  let current: unknown = s0;
  let made: unknown[] = [];
  const spy: AnyGame = {
    ...game,
    newState: (...a) => ((made = []), (current = game.newState(...a))),
    executeMove: (s, m) => (made.push(m), (current = game.executeMove(s, m))),
  };
  const rs = randomNew(`mistake-sweep-${id}`);
  for (let t = 0; t < 300; t++) {
    const m = new Midend(spy);
    m.newGameFromId(`${game.encodeParams(params, true)}:${desc}`);
    const size = m.size({ w: 600, h: 600 });
    const x = randomUpto(rs, size.w);
    const y = randomUpto(rs, size.h);
    const right = randomUpto(rs, 3) === 0;
    m.processInput(x, y, right ? RIGHT_BUTTON : LEFT_BUTTON);
    m.processInput(x, y, right ? RIGHT_RELEASE : LEFT_RELEASE);
    if (randomUpto(rs, 2) === 0) {
      const keys = "123456789abcd";
      m.processInput(0, 0, keys.charCodeAt(randomUpto(rs, keys.length)));
    }
    if (made.length === 0) continue;
    let onSolved: unknown = solved;
    let contradicts: boolean;
    try {
      for (const mv of made) onSolved = game.executeMove(onSolved, mv);
      contradicts = game.status(onSolved) !== "solved";
    } catch {
      contradicts = true;
    }
    if (!contradicts || game.findMistakes(current).length > 0) continue;
    if (!hintFinishes(game, current)) report(id, made, m.check());
  }
}
```

## What the engine could do so that no game has this

- **The guard is the engine's.** The sweep above, as a test whose population
  is the games with `findMistakes`, `solve` and a hint: an entry the answer
  contradicts, from which the hint cannot finish, is in `findMistakes`. It
  costs about 8 s at 300 inputs a game; find the count that still names all
  three known positives and say what it leaves unseen. See it fail on each of
  Bricks, Clusters and Subsets before trusting it.
- **Ask whether the comparison can be the engine's too.** Each game diffs its
  own state against its own answer, and the three shapes differ (a letter
  slot, a shaded cell, a colored tile). If a helper reads "the player's cells"
  and "the answer's" off a game without a second description of the board,
  write it; if it would need one, record that it was declined and why.
- **`CONTRADICTION_UNLOCALIZED` after this.** Once `findMistakes` compares
  with the answer, a hint that re-solves and refuses is a second copy the
  midend never reaches (it asks `findMistakes` first). Bridges and Loopy are
  the other two games `docs/games/hints.md` lists as giving the refusal: read
  whether theirs is the same shortfall the sweep could not reach (Bridges
  made no wrong entry) or a board with truly no cell to name.

## What Changes

- Bricks' and Clusters' `findMistakes` return an entry the answer
  contradicts, and each draws it: Bricks has only rule marks today (a bar, a
  gravity diamond), and Clusters draws live errors from `findErrors` and
  ignores the Check & save overlay it is handed. The mark is a decision to
  make by running the app; Subsets draws the wrong letter in the mistake
  color.
- Their hints lose the comparison they made for themselves.
- The cross-game guard.
- `docs/games/solver-and-generator.md` § "Self-validating games run their
  rule checker" and `docs/games/hints.md` (the list of games that say
  `CONTRADICTION_UNLOCALIZED`) say what is then true.
