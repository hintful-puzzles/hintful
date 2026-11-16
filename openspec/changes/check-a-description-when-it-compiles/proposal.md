# check-a-description-when-it-compiles

Filed 2026-11-16 from a review of the `add-norinori` session's transcript;
the owner agreed to it the same day.

## What the work found

Norinori's description compiled the first time it was written. Its hint
wording then took seven rounds, about 35 minutes, from 04:35 to 05:10, and
35 edits. Each rule a sentence breaks is checked only where a sentence is
rendered, by a different instrument, each run taking 20 s to 167 s:

- A place word that is not a mark ("there") throws from
  `engine/hint-words.ts` at render. It crashed `hint-scan`.
- Retired phrases ("rule out") are checked in `hint-retired-phrases.test.ts`.
- A reference that names no mark ("the open one") is a hint-test defect.
- A sentence over 120 characters is found by `hint-quality.test.ts` on the
  boards it walks. The way out is a `LONG_NARRATIONS` entry in an engine test,
  keyed by a dealt board's desc. Getting that desc took a scratch test.

The describe compiler already parses every clause
(`engine/stated-clauses.ts`), and applies none of these.

Two more, from the same session:

- **A slow form compiles silently.** `{e in cells where … e in adj4(d)}`
  compiled to a scan of the whole board for each shaded square, 22% of the
  deal's own time. `set(q over d in D, q in adj4(d))` says the same thing
  locally.
- **The soundness report line said `sound` where `soundness.json` recorded
  `held`**, meaning sampled answers only. The agent read
  `describe/soundness.ts` to reconcile the two.

## What this change does

- `npm run describe` lints each wording's literal words against the rules
  the render applies: place words, retired phrases and references that name
  no mark. It reports every one, with its technique and wording, in one run.
  The rule stays one copy: the compiler and the render read the same lists.
- It bounds a wording's worst-case length, taking the longest form of each
  `{if}`, `{n:}` and `{fit:}` and the longest a slot can print. A wording
  that may run past the line says why in the description (`long:` with its
  reason). `LONG_NARRATIONS` reads that for described games, so its reason
  sits beside the sentence and needs no desc.
- The compiler warns on a set comprehension over the whole grid whose
  condition ties its element to a cell's neighbors, and names the local
  form. Alternatively it rewrites the comprehension itself; settle which in
  the design.
- The soundness report line says `held` and how many queries were
  exhaustive.

## Before it starts

- Re-check each claim at HEAD. The review read the transcript; the code may
  have moved.
- See each new check fail on a planted wording before trusting it, and run
  it over every description: a rule that suddenly fails 60 descriptions is a
  rule written wrong, or a finding to raise.
