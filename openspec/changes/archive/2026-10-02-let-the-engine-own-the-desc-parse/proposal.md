# let-the-engine-own-the-desc-parse

**Status: implemented 2026-10-02, in the derived shape `design.md` argues for
rather than the typed one sketched below.**

## Why

`read-descs-through-one-cursor` left every game reading its description once,
through one `parseDesc(p, desc): DescParse<T>`. It also left every game
writing the same two lines around it:

```ts
validateDesc: (p, desc) => descVerdict(parseDesc(p, desc)),
newState: (p, desc) => build(descValue(parseDesc(p, desc))),
```

That is a consistent idiom, which AGENTS.md § "Convention over configuration"
says is not the finish line: the framework owning it is. A game that declared
only `parseDesc` (and, where its parse value is not yet a state, how to build
one) would let the engine derive `validateDesc`, and could not get the pair
wrong. It would also parse a pasted ID **once at runtime** rather than twice:
the midend calls `validateDesc` and then `newState` on the same desc
(`midend.ts`, `newGameFromId`), and a parse result could pass from one to the
other.

## What it might look like

`Game` gains `parseDesc(p, desc): DescParse<D>` and `newState` takes the parsed
value, or the parse returns the state outright where it already builds one.
`validateDesc` leaves the contract, derived by the engine. Mines' privDesc and
`supersededDesc` path and Loopy's grid-desc prefix are the cases to check
first, because both read a desc the midend does not route through
`newGameFromId`.

## Task 0

Read every game's `newState` (not a grep) and sort it: (a) `newState` is
`descValue(parseDesc(…))` and nothing else, (b) it builds a state from the
parse value with no other input, (c) it needs something the parse cannot give
(params-only fields are fine; name anything else). Count the callers of
`validateDesc` and `newState` outside the midend — tests above all, which
would need repointing — with `npm run refs`, not grep.

**Falsifier:** if the contract change costs every game a signature change and
removes no more than the two lines it replaces, record the no-go with the
counts and archive; the idiom is already uniform and enforced by the
near-miss test's generator check.

## Hints to pull in

None: this changes how a board is loaded, not what a hint says.
