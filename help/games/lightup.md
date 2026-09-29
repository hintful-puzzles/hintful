# Light Up

Place light bulbs in the grid so as to light up all the blank
squares. A light illuminates its own square and all the squares in
the same row or column unless blocked by walls (black squares).
Lights may not illuminate each other. Each numbered square must be
orthogonally adjacent to exactly the given number of lights.

## Controls

{{controls}}

A square holding a dot takes no light until you remove the dot (right-click it again), and a square holding a light takes no dot.

## Hints

**Hint** explains the next step rather than simply making it. Each step either puts a bulb in a square or, when a square "can't hold a bulb", marks it with a dot. The hint reasons from the numbers and your own bulbs and dots, so it carries on from wherever you are, as long as none of them is wrong; if one is, it asks you to fix the highlighted mistakes first. A *dark* square, in its words, is a blank square no bulb lights yet; a *free* one is a blank square with neither a bulb nor a dot.

{{hint-marks}}

A few ideas are worth learning by name:

* **A clue that is full**, or a 0, rules out bulbs in its other free neighbors; **a clue with just enough room** needs a bulb in every free neighbor it has left.
* **Only one way to light it.** A dark square that nothing else can light must get its light from the one square that still can, perhaps itself.
* On harder boards: **a bulb that would spoil every option**. When some square has to be lit, or some clue has to get a bulb, from one of a few outlined squares, a square whose bulb would leave each of them lit or beside a full clue can't hold a bulb.

On an Unreasonable board the hint may stop and say that nothing further follows by deduction.

## Light Up parameters

{{parameters}}
