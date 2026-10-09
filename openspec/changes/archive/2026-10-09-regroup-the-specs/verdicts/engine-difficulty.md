# Verdicts: engine-difficulty

## keep `engine-difficulty`: Shared generation machinery is argued from economy

Not settled by anything having been built: `src/engine/` holds no shared generate-and-strip loop (searched the directory listing and `git grep -iE "generate-and-strip|strip loop|shared generat" -- docs src/engine`), every game still writes its own, and the doctrine that the framework should own what several games write makes the proposal likely to come again. No guide states the rule (same search over `docs/`), so `process` has no home to name. It is a refusal that still binds, and it also holds a rule about the guard: the tier-binding sweep asserts on-tier boards whatever loop dealt them, and is run again and not quoted.

## keep `engine-difficulty`: A game overrides the scale only by declaring why

No game overrides the scale, and the doubt is right that the only mechanism is writing the array. The requirement is still read at two places that point a session to it: the doc comment of `tierNames` in `src/engine/difficulty.ts` ("Override by writing the array instead, and say why in the change") and the failure message of "names its tiers from the collection's scale" in `src/engine/difficulty-contract.test.ts`. What it decides is the form a future exemption takes, a declaration by the game and never a roster in the guard, which is the answer a session facing that failure needs. Saying instead that the scale admits no override would change the rule, not prune it.

## keep `engine-params`: A preset title that names a difficulty names its own tier

`describeParams` does not make it redundant, because a leaf can still carry a declared title ("A preset keeps a declared title only for a name no field says"; Guess's "Standard" and "Super" in `src/games/guess/state.ts`, Flood's `named` in `src/games/flood/state.ts`). That requirement holds a declared title to differing from the composed label and from its siblings; nothing in it or in "One describer labels every params set" stops a declared title from using another tier's word. The guard "never names a tier in a preset title that is not that preset's tier" in `src/engine/difficulty-contract.test.ts` holds exactly this, and this requirement is its reason, with the decision that it is a prohibition and so needs no exemption list.

## keep `engine-difficulty`: Unreasonable is declared and never issued by position

The sentence that the tier-name guard is not evidence a tier searches stays. Its only other home is the comment on the guard in `src/engine/difficulty-contract.test.ts`; `docs/games/solver-and-generator.md` and `docs/games/mechanics.md` § "Difficulty is a declared contract" say how to call `tierNames` and do not say what a pass of the guard fails to show (searched both for "shape of the list", "mechanically", "cannot tell"). A session that reads a green guard as proof that a tier named Unreasonable searches, or that one not so named does not, would be wrong in a way a player sees.
