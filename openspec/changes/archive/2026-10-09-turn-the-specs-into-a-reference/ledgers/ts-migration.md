# Ledger: ts-migration

Base: bb004490

Where every rule of the capability went when it was rewritten in the reference
form. `scripts/checks/spec-ledger.mjs` checks this file.

## Migration proceeds top-down, product-value first

| Rule | Where it went |
| --- | --- |
| The midend and a clean `Game` interface are built before any game is ported | spec: Migration proceeds top-down, product-value first |
| Games are ported by user-facing priority, simplest first, then the owner's, then the rest | spec: Migration proceeds top-down, product-value first |
| The migration is not ordered bottom-up by library-dependency depth | spec: Migration proceeds top-down, product-value first |
| Delivering user-visible capability early takes precedence over what a port unblocks | spec: Migration proceeds top-down, product-value first |
| Leaf libraries are ported lazily and idiomatically when a game needs them, not as bridged seams with characterization corpora | spec: A leaf library is ported when a game needs it |
| Scenario: a game port pulls in only the leaf libs it needs | spec: A leaf library is ported when a game needs it |
| Scenario: the midend precedes game ports | spec: Migration proceeds top-down, product-value first |
| The first implementation change is named by its change id | history |

## Clean TS save format; future game IDs stay stable

| Rule | Where it went |
| --- | --- |
| The project uses a clean TypeScript-native save format | spec: Clean TS save format, and future game IDs stay stable |
| Compatibility with the C-serialization save format and with earlier shared game IDs is not required | spec: Clean TS save format, and future game IDs stay stable |
| Game IDs remain stable and shareable | spec: Clean TS save format, and future game IDs stay stable |
| The stream the random generator produces for a seed is held fixed | spec: Clean TS save format, and future game IDs stay stable |
| The generator is the file `random.ts` | untrue: the module is the directory `src/engine/random/`, whose `index.ts` holds the generator and whose `random.test.ts` holds the stream to a recorded fixture, so the requirement names the engine's random number generator |
| A seed reproduces its board across builds | untrue: a seed deals whatever the current generator deals for it and generators change (`app-shell`, "The app hands out boards, never seeds" and "A seed ID still deals a game", and `docs/doctrine.md` § "Upstream"). What stays stable is the `params:desc` ID the app hands out, which the requirement now states |
| The requirement's title held a semicolon | reason |
| Scenario: an old C-format save is not required to load | spec: Clean TS save format, and future game IDs stay stable |
| Scenario: a shared game ID reproduces its board on another build | spec: Clean TS save format, and future game IDs stay stable |

## Narratable-deduction generation policy

| Rule | Where it went |
| --- | --- |
| Every board a logic game generates below `Unreasonable` is solvable by the techniques its hint teaches | spec: Narratable-deduction generation policy |
| A hint does not fall back to a generic unexplained step | spec: Narratable-deduction generation policy; spec engine-hints: A hint step always names a technique, with no un-narrated fallback |
| The solver and the hint are two projections of one deduction engine, recorder off and recorder on | spec: The solver and the hint are two projections of one deduction engine |
| The generator accepts a board only when the techniques fully solve it, and no separate uniqueness pass is required | spec: The solver and the hint are two projections of one deduction engine |
| The grade is the highest tier reached, never a technique's position in the ladder | spec: The solver and the hint are two projections of one deduction engine |
| A game narrates every deduction it accepts or rejects the board at generation, chosen per game against a measured cost | spec: A game narrates every deduction it accepts, or rejects the board at generation |
| A rejecting gate is adopted only after its rejection rate is measured | spec: A rejecting generation gate is measured before it is adopted |
| A game's tiers are re-graded after "solvable" becomes "narratably solvable" | spec: A rejecting generation gate is measured before it is adopted |
| A gate is allowed to change which boards a game generates, and a byte-match differential against the C reference is allowed to be retired for it, each stated as what is not required | spec: A rejecting generation gate is measured before it is adopted |
| Boards are expendable and C is a reference, not a byte-oracle | spec: Upstream's C is a readable reference, not a byte-oracle |
| An explicitly named `Unreasonable` tier is the one exception: guessing, a backtracking oracle for uniqueness, a non-deductive hint | spec: An Unreasonable tier is the one exemption from the narratable policy |
| Movement and objective games are out of scope | spec: An Unreasonable tier is the one exemption from the narratable policy |
| Scenario: a generated board is solvable by the taught techniques | spec: Narratable-deduction generation policy |
| Scenario: a costly rejection gate is measured before adoption | spec: A rejecting generation gate is measured before it is adopted |
| Scenario: Unreasonable is exempt | spec: An Unreasonable tier is the one exemption from the narratable policy |

## The C engine is fully retired once every game is ported

| Rule | Where it went |
| --- | --- |
| The C/WASM engine is removed entirely once the last game is ported and registered at parity, with its sources, adapter, build, dispatch path and flag machinery | spec: The C engine is fully retired once every game is ported |
| Retirement is the terminal state the per-game hybrid was migrating toward | history |
| The game catalog and the in-app manual are generated without the C toolchain | spec: The catalog and the manual are built without the C toolchain |
| The catalog's metadata is a committed TypeScript source | spec: The catalog and the manual are built without the C toolchain |
| The metadata existed only in the CMake files being deleted | history |
| `puzzles/` does not survive, and no C source and no build system remain in the working tree | spec: `puzzles/` does not survive the migration |
| No C source at all remains in the working tree | untrue: two reading references are in the tree under `openspec/changes/add-numgame-ts-port/reference/` and `openspec/changes/add-path-ts-port/reference/`, as this requirement's own last paragraph allows, so the rule now states that exception |
| What retirement left `puzzles/` holding, and that each part then went where its role says | history |
| The served help sources live under `help/`, as an input to this project's build | spec: The served help sources live under `help/` |
| The help sources are the halibut manual source and the per-puzzle overview fragments | untrue: `help/` holds no halibut source. Every page is this project's markdown, site pages at its top and one page a game in `help/games/` (`docs/help-pages.md` § "One directory, owned by this project") |
| The relocation changed no URL and no word of the content | history |
| The upstream MIT notices live in `licenses/`, byte-identical to what each upstream ships | spec: The upstream MIT notices live in `licenses/`, byte-identical |
| They cover the whole of `src/engine/`, `src/games/` and the served help sources, and the names are this project's while the bytes are not | spec: The upstream MIT notices live in `licenses/`, byte-identical |
| A C reading reference lives with the change that reads it and carries a README of provenance, license and that it cannot be compiled or run | spec: A C source kept as a reading reference lives with its change |
| The reference is archived with the work that consumed it, and deleted with its change when unneeded | spec: A C source kept as a reading reference lives with its change |
| Scenario: `puzzles/` does not survive the migration | spec: `puzzles/` does not survive the migration |
| Scenario: a reading reference is kept with its change | spec: A C source kept as a reading reference lives with its change |
| Scenario: no game runs on C after retirement | spec: The C engine is fully retired once every game is ported |
| Scenario: the catalog and manual survive the toolchain removal | spec: The catalog and the manual are built without the C toolchain |

## Game work is accepted by exercising it, not by a green suite

| Rule | Where it went |
| --- | --- |
| Acceptance requires the actual behavior to be exercised, rendering, animation and input, for a new game, a rendering or input change, an animation and a hint | spec: Game work is accepted by exercising it, not by a green suite |
| The one who exercises it is the owner | untrue: the session runs the app itself and the owner's acceptance is asked in three named cases only (`docs/work-management.md` § "What the owner accepts", and `AGENTS.md` "Run the app before calling game-facing or UI work done"), so the requirement says the behavior is exercised and does not say by whom |
| A passing automated suite alone is not done | spec: Game work is accepted by exercising it, not by a green suite |
| This is the durable half of the retired per-game hybrid requirement | history |
| Flip shipped with a green suite and did not render, then took three more iterations | history |
| A suite that asserts only state transitions is compatible with a game that draws nothing | spec: Game work is accepted by exercising it, not by a green suite |
| A shortfall is not dismissed as cosmetic or out of scope, nor deferred without explicit owner agreement | spec: Game work is accepted by exercising it, not by a green suite |
| Under the hybrid this was enforced by withholding registration, and there is no such fallback now | history |
| Scenario: a green suite is not sufficient | spec: Game work is accepted by exercising it, not by a green suite |
| Scenario: a parity shortfall is not deferred silently | spec: Game work is accepted by exercising it, not by a green suite |

## A shared abstraction states its actual scope, not an aspirational one

| Rule | Where it went |
| --- | --- |
| A shared module's documentation describes the scope it actually has, an overclaim is corrected, and the non-fits are named in the module with their reasons | spec: A shared abstraction states its actual scope, not an aspirational one |
| An abstraction's stated scope is part of its API | spec: A shared abstraction states its actual scope, not an aspirational one |
| The fixpoint module's old header, and the two handoffs that asserted Loopy fits | history; guide: docs/games/solver-and-generator.md § "Where the fixpoint does not fit" |
| Five call sites out of forty-odd solvers | figure |
| Scenario: a game is considered for a shared abstraction, and resemblance is not fit until the differential says so | spec: A shared abstraction states its actual scope, not an aspirational one |
| Scenario: an audit finds the majority do not fit, and the unexamined are recorded as unaudited | spec: A shared abstraction states its actual scope, not an aspirational one |

## A shared declarative helper is adopted by every game it fits

| Rule | Where it went |
| --- | --- |
| Every game a declarative-table helper fits uses it, and one that does not has its reason recorded | spec: A shared declarative helper is adopted by every game it fits |
| The helpers are `dimensionParamConfig()` and the pencil-mark preference set | spec: A shared declarative helper is adopted by every game it fits |
| The pencil-mark preference set is for latin-family games | untrue: `src/engine/pencil-prefs.ts` is "the `GamePref` declarations every pencil-mark game shares", and Map, Undead, Seismic, ABCD and Crossing declare from it, so the requirement says the shared pencil-mark preference declarations |
| A partially adopted helper is worse than none | reason |
| 33 games used the helper while 11 hand-wrote the table, and four games duplicated the wording | figure |
| A game's params fields are not renamed to fit a helper: the helper is widened or the game keeps its own table with the reason | spec: A game's params fields are not renamed to fit a helper |
| Adopting a helper is a no-op: no differential or render snapshot moves | spec: A shared declarative helper is adopted by every game it fits |
| The tables are consumed by the Custom-params and preferences dialogs alone | untrue: `paramConfig` is also what the engine builds the preset titles, the bounds check, the help's Parameters section, the tier accessors and the params codec from (`docs/games/mechanics.md` § "Params are declared once, on `paramConfig`", `src/engine/params-codec.ts`), so the requirement keeps the no-op rule without that reason |
| A per-game label states only what holds on every board the game deals, and names the relation where the fact varies | spec: A per-game label states only what holds on every board |
| Scenario: a new port declares its params config | spec: A shared declarative helper is adopted by every game it fits |
| Scenario: a helper does not fit a game | spec: A game's params fields are not renamed to fit a helper |
| Scenario: a dialog-only change is verified in a browser | spec: A shared declarative helper is adopted by every game it fits |
| The change that made that scenario necessary, by its id | history |
| Scenario: a helper is parameterized by a player-visible string, a required argument and never a default | spec: A per-game label states only what holds on every board |
| Scenario: a label enumerates a structure that varies within the game | spec: A per-game label states only what holds on every board |
| Nothing in the suite reads a preference's words | reason |
| Scenario: a get/set round-trip does not establish which field an item drives | spec: A shared declarative helper is adopted by every game it fits |

## A difficulty tier binds the board it generates

| Rule | Where it went |
| --- | --- |
| No board above the easiest tier is solvable at the tier below, and the gate tests both directions | spec: A difficulty tier binds the board it generates |
| An unbinding setting is a player-visible defect, since the player chose the tier | spec: A difficulty tier binds the board it generates |
| Upstream generators commonly test only the upper bound or nothing | history |
| A corrected gate retires the differential or re-founds it on unique solvability at exactly the stated difficulty | spec: A corrected tier gate retires or re-founds the game's differential |
| Reproducing upstream's boards is not a goal | spec: A corrected tier gate retires or re-founds the game's differential |
| The gate's cost is measured by the worst case over repeated seeds, and the retry bound exceeds it by a margin | spec: The tier gate's cost is measured by its worst case |
| Scenario: a board generated above the easiest tier needs that tier | spec: A difficulty tier binds the board it generates |
| Scenario: a game that cannot grade says so in its specification | spec: A difficulty tier binds the board it generates |

## An unbindable tier is refused, not silently downgraded

| Rule | Where it went |
| --- | --- |
| A game refuses to generate where no board requires the tier, through parameter validation, for generation only | spec: An unbindable tier is refused, not silently downgraded |
| Substituting a neighboring tier gives the player another difficulty without telling them | spec: An unbindable tier is refused, not silently downgraded |
| Refusing is what the collection already does for a configuration with no puzzles | reason |
| A generator does not itself settle for a lower tier | spec: A generator never settles for a lower tier |
| A refusal claiming absence rests on a recorded count of tries | spec: A refusal that claims absence rests on a count |
| A rare tier is not refused where retrying deals it promptly | spec: A rare tier is dealt by retrying |
| Where the retry takes seconds the pair should still be dealt, with a bound sized to the measured rate | spec: A rare tier is dealt by retrying |
| A pair is refused where the first wait is too long or no board was found to size a bound to, and then says too rare and not absent | spec: A tier too rare to deal says so |
| Games that still cap or downgrade are recorded as known deviations and converge | spec: A generator never settles for a lower tier |
| Scenario: a size that cannot support a tier refuses it | spec: An unbindable tier is refused, not silently downgraded |
| Scenario: a rare tier that deals promptly is dealt | spec: A rare tier is dealt by retrying |
| Scenario: a rare tier that takes seconds is dealt with a bound sized to it | spec: A rare tier is dealt by retrying |
| That scenario's ten seconds a board | figure |
| Scenario: a tier too rare to deal says so | spec: A tier too rare to deal says so |
| Scenario: a generator asked for an absent tier does not deal another | spec: A generator never settles for a lower tier |

## A tier probe runs on state uncontaminated by earlier candidates

| Rule | Where it went |
| --- | --- |
| The probe runs on solver state initialized for the candidate alone and leaves none behind | spec: A tier probe runs on state uncontaminated by earlier candidates |
| A probe on a shared or retained scratch answers about the leftover position and makes the boards depend on the gate's side effects | spec: A tier probe runs on state uncontaminated by earlier candidates |
| Observed in two games independently | figure |
| Scenario: the probe's verdict is about the puzzle | spec: A tier probe runs on state uncontaminated by earlier candidates |

## Encoded params are byte-stable, and the guard is derived

| Rule | Where it went |
| --- | --- |
| The params encoding is held byte-stable by an assertion, over a corpus derived from each game's declarations | spec: Encoded params are byte-stable, and the guard is derived |
| The policy existed unenforced, and the differentials cover descs and not params | history |
| Encode and decode are mutual inverses over the corpus, a property with no exemption roster | spec: Encode and decode are mutual inverses over the corpus |
| Encode and decode are inverses in both directions, record for record | untrue: `src/engine/params-stability.test.ts` asserts that encoding, decoding and encoding again gives the same string, and does not compare the params records, since a record can carry a field the codec does not round-trip. The requirement says the comparison is through the encoded string |
| It held for all 57 games on the day it was written | figure |
| The recorded encodings do not move, and re-baselining goes to the owner beforehand with the cost stated | spec: The recorded params encodings do not move |
| The corpus is each game's presets, each tier through its own `paramConfig` item, and a perturbation per field, with a vacuity guard on games and cases | spec: The params corpus is derived and guarded against vacuity |
| Every field of the default params is perturbed | untrue: `src/engine/testing/params-corpus.ts` bumps a number and flips a boolean, skips the fields the difficulty item writes and any field of another type, and adds the default params as a case, so the requirement states that |
| A perturbed params object is often invalid, deliberately | spec: The params corpus is derived and guarded against vacuity |
| A field that is the length of another is not perturbed alone, by the record's shape and not a roster | spec: A field that is the length of another field is not perturbed alone |
| Scenario: a changed encoding is reported before it ships | spec: Encoded params are byte-stable, and the guard is derived |
| Scenario: a codec that stops being invertible is reported | spec: Encode and decode are mutual inverses over the corpus |
| Scenario: the guard cannot pass over an empty corpus | spec: The params corpus is derived and guarded against vacuity |

## Upstream's C is a readable reference, not a byte-oracle

| Rule | Where it went |
| --- | --- |
| Upstream's C is a readable reference and not a fidelity oracle, and no game is required to match it byte for byte | spec: Upstream's C is a readable reference, not a byte-oracle |
| A game is done when it plays correctly and passes behavioral tests | spec: Upstream's C is a readable reference, not a byte-oracle |
| The project does not track upstream | spec: Upstream's C is a readable reference, not a byte-oracle |
| Scenario: a ported game is accepted without a golden corpus | spec: Upstream's C is a readable reference, not a byte-oracle |
| Scenario: deliberate divergence from upstream is allowed | spec: Upstream's C is a readable reference, not a byte-oracle |

## Touch acceptance happens on a device, and a synthesized pointer is not one

| Rule | Where it went |
| --- | --- |
| Work whose correctness is how it feels under a finger is accepted on a real device against a deployed build | spec: Touch acceptance happens on a device, and a synthesized pointer is not one |
| The in-process tiers and a synthetic-pointer browser pass are not offered as that acceptance | spec: Touch acceptance happens on a device, and a synthesized pointer is not one |
| A synthesized touch pointer exercises the frontend's decision and says nothing about a hand | spec: Touch acceptance happens on a device, and a synthesized pointer is not one |
| The seven-game long-press defect was demonstrated and its repair confirmed that way | history |
| A change archived with device acceptance carried forward records the deferral and names the change that discharges it | spec: Device acceptance carried forward is carried explicitly |
| A browser pass is not written up so that it reads as a device pass | spec: Device acceptance carried forward is carried explicitly |
| Scenario: a touch fix is accepted | spec: Touch acceptance happens on a device, and a synthesized pointer is not one |
| Scenario: a browser pass is not written up as a device pass | spec: Device acceptance carried forward is carried explicitly |

## A device pass records a verdict per item, not an overall impression

| Rule | Where it went |
| --- | --- |
| A device pass enumerates what it checked with a verdict each, as a sweep and not a summary | spec: A device pass records a verdict per item, not an overall impression |
| The input-mode audit's 57 games by 3 modes | figure |
| An unenumerated pass spends the scarcest instrument without a record | reason |
| A finding tells "not delivered" from "delivered and feels wrong" | spec: A device pass records a verdict per item, not an overall impression |
| Scenario: a device pass is recorded | spec: A device pass records a verdict per item, not an overall impression |

## A difficulty-capped solver is monotone in its cap at every tier

| Rule | Where it went |
| --- | --- |
| A capped solver is monotone in its cap, asserted for every game declaring a contract by one cross-game guard | spec: A difficulty-capped solver is monotone in its cap at every tier |
| Boats solved at a lower cap what it failed at a higher one, which broke Check & Save | history; guide: docs/games/solver-and-generator.md § "Cap-monotonicity, and the game that broke it" |
| A solver found non-monotone is repaired, and the contract offers no way to declare it so | spec: A non-monotone solver is repaired, never declared |
| Every technique is sound and a higher cap only adds some | spec: A non-monotone solver is repaired, never declared |
| Boats declared itself non-monotone while the cause went unlooked for | history; guide: docs/games/solver-and-generator.md § "Cap-monotonicity, and the game that broke it" |
| The guard asserts every declared tier generates or is refused with a reason | spec: The cross-game guard holds every offered tier to generating or a refusal; spec engine-difficulty: An offered tier generates, or is refused with a reason |
| The guard asserts a game's declared tier list matches the choices its form offers | untrue: no game declares a tier list. `DifficultyContract` holds `solveAtCap` alone and `difficultyTiers` reads the tiers off the form's difficulty item (`src/engine/difficulty.ts`), so there is one list and the guard walks it. The requirement states that, and `engine-difficulty` "A game's tiers are read from its difficulty item" holds the rest |
| The guard samples enough boards per tier to catch its defect, the size established by seeing it fire | spec: The monotonicity guard samples enough boards to catch its defect |
| The size is established by removing a known exemption | untrue: the contract has no exemption to remove (`DifficultyContract` in `src/engine/difficulty.ts` has one member), so the requirement asks that the guard be seen to fire on a solver known to be non-monotone |
| One board per tier missed Boats, non-monotone on 7 of 8 of its easiest boards | figure; held: src/engine/difficulty-contract.test.ts "the number was measured rather than guessed" |
| A guard that has never been shown to fail is not known to work | spec: The monotonicity guard samples enough boards to catch its defect |
| Sampling is where a cross-game guard silently becomes decorative | reason |
| The property is a statement about what a tier means, part of what replaced the byte-match oracle | spec: A difficulty-capped solver is monotone in its cap at every tier; history |
| Scenario: a capped run succeeds where an uncapped run fails | spec: A difficulty-capped solver is monotone in its cap at every tier |
| Scenario: a game declares itself non-monotone | spec: A non-monotone solver is repaired, never declared |
| Scenario: a solver is converted to the shared deduction runner | spec: A difficulty-capped solver is monotone in its cap at every tier |

## A generator that runs out of tries is answered, not thrown

| Rule | Where it went |
| --- | --- |
| An exhausted retry bound is reported to the caller as a sentence, and the board in play and its parameters stay | spec: A generator that runs out of tries is answered, not thrown |
| A run-out is an answer about the parameters and not a fault | spec: A generator that runs out of tries is answered, not thrown |
| A game whose parameters are a list has corners no refusal could name | reason |
| The sentence claims neither rarity nor absence | spec: A generator that runs out of tries is answered, not thrown |
| Parameter validation remains where a counted absence is reported, and any other error propagates | spec: Only an exhausted retry bound is answered |
| The app shows the sentence wherever a deal was asked for, and deals the first preset where no board is in play | spec: The app shows the sentence wherever a deal was asked for |
| Scenario: a deal that finds no board keeps the one in play | spec: A generator that runs out of tries is answered, not thrown |
| Scenario: a seed that finds no board is refused like any other id | spec: A generator that runs out of tries is answered, not thrown |
| Scenario: a fault is not mistaken for an answer | spec: Only an exhausted retry bound is answered |
