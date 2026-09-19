# declare-region-relations

## Why

Solo's hint threw on about one fresh Killer board in six because one region
provider served two relations: the regions that must **hold every digit** (what
the placement classifier needs) and the regions a digit **may not repeat in**
(what every notes cull needs). A Killer cage has only the second property.
`8057720b` fixed it by giving Solo two functions, `regionsOf` and
`noRepeatRegionsOf`, and the `ts-engine` requirement "A cell's regions are one
definition per relation" now states the rule.

A rule that every game must remember to apply by writing two functions correctly
is the shape `AGENTS.md` asks to move into the framework. The engine could let a
game declare each kind of region once, with which of the two properties it has,
and derive both lists for the classifier and the culls, so a region with only
one property cannot be handed to the wrong consumer.

## What changes

- A game declares its regions with their properties (holds every value; forbids
  repeats). The engine derives the classifier's list and the culls' list, and
  every consumer (classifier, duplicate cull, obvious clean, Mark-all,
  auto-pencil) reads the derived one.
- Keen's cages are declared as neither, which is the case the current
  requirement's scenario pins.

## What this does not do

- Not a change for any game but Solo today: only Solo Killer has a region with
  one property. The case for doing it is the next such game, not a defect.
