# Verdicts: sixteen

## cut `sixteen`: The boards a tangle guard names are even permutations

particular: it is a rule about which boards one test may list, and the only thing that would consult it is someone adding a board to that list. The comment above the list in `src/games/sixteen/sixteen.test.ts` ("Every board here is an *even* permutation, and that is load-bearing") says it where that person is reading, and `docs/games/hints.md` § "Sliding-permutation games" gives the parity fact itself. It constrains nothing the game does.

## cut `sixteen`: Sixteen's hint SHALL refuse only by saying its search ran out

collection: `engine-hints`, "A hint that plans by searching SHALL refuse honestly past its reach", says the same of every searching hint (the single constant, and never the refusal that claims no move helps, because an empty bounded search is a fact about the search), and "The search refusal names what still works" holds the scenario's second half. Sixteen has no departure: `src/games/sixteen/index.ts` returns `SEARCH_OUT_OF_REACH` on an empty plan and nothing else.

## keep `sixteen`: The tangle count is priced only past what the exact searches unwind

`engine-hints`, "A sharpened measure is checked against every gate that reads
it", is the general rule and this is Sixteen's instance of it with Sixteen's
own number: two tangles, because the deep search reaches nine moves and a
swapped pair is about four and a half. A session simplifying the measure to
price every tangle would check against this and its scenario. The constant's
comment explains the number; it does not make it a requirement.

## keep `sixteen`: A tangled board is not answered by searching further

A design that was turned down and would be proposed again is on the prune
brief's list of what stays. `docs/games/hints.md` § "Recompute-stable plans"
("The tangle term, and what generalizes from it") tells why, and the spec is
what a change giving the planner more reach is checked against. None of the
nine words fits: it is not how work is done but what Sixteen's hint may not
do.

## keep `sixteen`: Sixteen's hint SHALL finish the swapped-pair endgames

The reason the cut "The swapped-pair guard names its boards and asserts the
plan length" carried is not lost to a test comment. This requirement's body
says such a board "lies one move past what a search that stores every board it
visits can afford", and that the reach must cover nine moves, which is why
both scenarios ask for a plan of more than eight: a shorter one would not show
the deep search ran. Nothing needs restoring.
