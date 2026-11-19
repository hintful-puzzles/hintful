## Decisions

**The skeleton is a small game that plays,** as the other two are
(`src/skeleton/README.md`): a hidden code of a few symbols, guessed in rows,
each row scored. It is Guess cut down to what every game of the kind
shares, written on `code-rows.ts` and the engine helpers Guess and Wordguess
both use, so a porter starts from the shared way.

**What it leaves out is a decision to record.** No solver ladder and no
soundness entry, because the answer is the desc. A hint, because every
game has one: the skeleton's is the smallest that teaches (a symbol ruled
out by a scored row), in the description language, so the porter extends
it rather than writing one from nothing.

**The kinds table.** Add the row; check each "Every game" section still
applies to this kind, and say which do not. Wordtrail-shaped games (paths
through letters) fit the `edges` skeleton with directed lines; the session
said its copied tests were built around a loop board and were rewritten
whole. Whether `edges` needs a word-path variant is a question for this
change to answer with the Wordtrail diff in hand, not to assume.

**Catalog wording.** `new-game.sh` writes the kind's own family and a
placeholder description; the first verdict already lists what is owed, so a
placeholder is caught.

## Risks

- A third skeleton is a third thing to keep compiling against `Game`. It is
  source and the gate holds it, as the other two are.
