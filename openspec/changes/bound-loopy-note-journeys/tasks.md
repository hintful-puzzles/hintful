# bound-loopy-note-journeys — tasks

Read `order-hints-from-the-frontier/findings.md` § 6.1 (the replay and its leg
counts) and § "Which note sentences survive being deferred" first.

## 1. Decide whether a long journey is a defect

- [ ] 1.1 Walk hint 112 of the 10×10 Hard replay (seed
      `frontier-squares-10x10-hard-replay-a`) in the running app with the owner, a
      leg per press and under Auto-Hint. The question is whether it reads as a long
      chain or as a wall, and a leg count cannot answer it.
- [ ] 1.2 If it needs bounding: cap a journey, or spread a note back across the
      firings between its discovery and its use. Either way, say what the player
      sees instead, and guard the bound in `loopy-hint.test.ts`.

## 2. Widen the note placement

- [ ] 2.1 An expiring note placed at the **latest** position its explanation still
      describes. Gated on 1.1, because it concentrates notes onto their consumers
      harder.
- [ ] 2.2 Widen the `ts-engine` requirement "A note a hint asks for is placed beside
      the step that uses it" to match, and re-measure the rate the guard in
      `loopy-hint.test.ts` holds.
