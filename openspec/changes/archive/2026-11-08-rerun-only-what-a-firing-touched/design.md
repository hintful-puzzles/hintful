# Design

## The rule that keeps every verdict

A binding is a technique's run at one element of its first binder. Whether
it concludes anything depends only on the marks it reads, so a binding that
found nothing finds nothing again until one of those marks changes. The
fixpoint still restarts from the easiest technique after every firing, and
each technique still visits its elements in their order. Only the bindings
that would find nothing are not evaluated, so the firings, their order and
the marks are those of a run that skips nothing.

A run in place (`fire === null`) can place at one element and change what a
later element in the same pass reads. A run that skips must then visit that
later element in the same pass, as the full run would. So the elements still
to visit are a set scanned in order, and a fact adds to it the elements past
the current one that read the fact's element.

## The footprint

The compiler walks a technique's statement from its first binder `x in S`:

- a later binder ranging over a geometry function of a bound element
  (`edges(f)`, `angles(f)`, `faces(e)`, `ends(e)`, `apex(a)`, a cell's
  neighbors), and a definition whose body is local, keep it local;
- a mark read (`known`, `value`, `cand`, the angle mark) at an element bound
  that way adds a path to the footprint;
- anything else, a read of connectivity or a loop, of the pair classes, a
  quantifier over a whole sort, a fill over a set the marks decide, makes
  the technique whole.

A path is a list of geometry steps from the first binder's element to a
marked element. At the ladder's build the runtime evaluates each path
forward for every element of `S`, which reads no marks, and inverts the
result: for each marked element, the first-binder elements whose bindings
read it.

## The runtime

`CellMarks` keeps, per local technique, the set of first-binder elements
to visit, all of them at the start. Every fact (`strikeAt`, `placeAt`, a
corner, a relation) adds to each local technique's set the elements its
inverse footprint names. A compiled local technique iterates its set in
element order instead of all of `S`, and a binding that found nothing
leaves the set. A whole technique iterates all of `S`.

The hint's walk (`ladderWalk`) takes one firing a call and asks each
technique for its firings; it uses the same sets, since a binding that
found nothing offers nothing.

## The check

A test runs every described game's ladder on dealt boards twice, skipping
and not, and compares every firing and the marks after it. Planting a
footprint that leaves out one read must fail it.
