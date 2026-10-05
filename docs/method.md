# Method: make the check check the thing

How to trust a check, a measurement or a bulk edit in this repository. It
applies to the engine, the games, the app shell and the scripts alike.
[`test-strength.md`](./test-strength.md) is the companion for assessing tests;
its §7 catalogs instruments that measured the wrong unit, and its numbers
should not be quoted without reading it.

## A guard measures the thing it claims to guard

A guard that measures a neighbor of its subject passes, so nobody looks. Ask
what would have to break for the assertion to fail. If the answer names
something other than the behavior you care about, rewrite it.

Shapes to search for:

- `x.length` compared with the value that sized `x`.
- A getter compared with its own field.
- A total compared with the sum it was computed from.
- A string match standing in for a resolved reference, such as a dead-link
  check that greps for one spelling of a path.
- A count taken from one list while the loop skips members missing from
  another.
- A hash of output whose order is not stable.

## See a guard fail before trusting it

Break the thing deliberately, watch the guard go red, restore. A guard nobody
has seen fail is a guard nobody has seen work.

Plant the defect again before leaning on an old guard. A guard that was red
once can stop reaching its case as the code around it moves, and it keeps
passing.

## Count what the check looked at

An unmatched `import.meta.glob` yields `{}`, an empty directory yields no
iterations, and a filter can exclude everything. Every assertion downstream
then passes over nothing. Count the inputs and assert the count.

## A sweep that finds zero owes a power argument

Counting inputs answers "did I look at anything?". A sweep that reports none
also has to answer "did I look at enough?": say how many it would have taken
to see one. A rung that fires on one board in sixty is missed by 36 boards
more than a third of the time.

Widen until a positive appears, or argue the absence from the code. Once a
firing case is found, pin it as the input the code consumes, such as a desc.
Never pin a seed: a seed reaches the case only through a generator that is
free to stop producing it.

## Verify a bulk edit by the shape of its diff

A green suite does not show that a bulk edit did only what was meant. Assert
that every changed line in the whole diff is the one intended kind of change,
then read the exceptions. For a pure move the shape is: every removed line
appears verbatim in the destination, and nothing was added.

## Check the instrument before the finding

Check a measurement against something outside the tool that produced it,
before reasoning from it.

The same goes for a dependency. What the installed version of a tool does is
not what the tool does. When you find yourself building a workaround layer,
overriding generated content, or writing a guard for a guard, check the
version first.

## A scan that keys on a name

A scan that matches a name finds only the things that were named that way,
and reports a census of the whole collection with the others silently absent.
The errors run both ways: it can miss members and convict innocent ones.

- **Key on the shape**: `{ ok: false, error: <literal> }` wherever it
  appears, a `?` on an interface member. Accept the superset that gives you
  and classify what it catches. Narrowing the scan is the error.
- **When the population is small enough to read, read it.**
- **The key can be the syntax after the name.** A search for `latinSolver(`
  misses `latinSolver<Ctx>(`.
- **A search for a constant's name is blind to a copy that spells out its
  value.** When you change what a constant means, search for what it said.
- **A spec scenario can key on a name too.** "No file contains a duplicate
  `parseLeadingInt`" holds over copies called something else. Write the
  scenario against the shape.
- **Take a symbol's population by reference.**
  `npm run refs -- <file> <Name | Type.member>` builds the whole program
  before answering. It does not see a renamed copy, a typed-out value, or
  source read through a `?raw` glob.
- **Who references a member is not who implements it.** The references to
  `Game.hint` include tests that name hintless games. The population is the
  implementations.

## Our own code keys on a reference, a type or an id

A regex over a sentence the code itself wrote is a name-keyed scan aimed at
our own output: a rewording empties it without a sound. When a check reads
prose to learn a fact, give the producer a field for the fact, as
`HintStep.rung` does ([`games/hints.md`](./games/hints.md) § "Name the rung a
step speaks"). A regex stays right where the wording is the thing under test.

## A count written in prose is a census nobody re-runs

Write the query, not its answer. "The games that call
`latinSolver`" cannot go stale; "the eleven latin-family games" does. Where a
number is the point, assert it in a test so it fails when it drifts.
`AGENTS.md` holds no census of the tree at all.

A fact about the code goes stale the same way. Date a claim about the code
when you write it into a change, and re-verify a constraint that says "don't
bother looking" before obeying it: that phrasing is the one that stops anyone
noticing it has expired.

## Measure a proposal's number before designing against it

A number a proposal argues from is a claim. Take it yourself, against the
whole population and not the one file that suggested it, and check which side
of the figure is which. Walk a proposal's deliverable list item by item
against what is already on disk.

## Retire a dead instruction

When an instruction has gone stale, fixing the one part you noticed leaves
every other line equally dead, and the result looks maintained. Delete the
recipe and keep the fact that is still true.

Before accepting a generated file as source because its generator is gone,
check what the generator asserted about its output. Those assertions may be
the only statement of an invariant.

## Assert the bounds of an optimized artifact

An objective never complains about what it traded away. Whatever a search was
not told to preserve is what it spends, so assert the bounds on its result.
