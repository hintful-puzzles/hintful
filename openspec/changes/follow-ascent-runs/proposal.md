# follow-ascent-runs

## Why

Owner playtest on a phone, 2026-09-27, two findings:

1. **A forced run is one thought.** Once 22 is forced between 21 and 25, a
   player writes 22, 23, 24 down together; the hint asked for three hints.
2. **"Only the run 44 to 47 … can reach this square, and of those only 44 can"
   hid both of its reasons**: why not 42 (it would have to touch 41 too), and
   why not 45 (the square is 4 steps from 48). The owner chose, from three
   sketches, to name the one close rival and give the count, and framed it as
   "44 must go there, or it would leave a gap".

## What changes

- **Run journeys.** After a step places a number in a run, the plan asks the
  same techniques about that run alone, none harder than the one that began it
  (the placing rungs take a hint-only `focus`). When that fills the run, the
  placements are one journey, each leg with its own sentence. The plan's length
  cap never splits one. 39% of placements on the presets now arrive as legs.
- **"Only 44 can fill this square: 42 would have to touch 41 too, and 4 steps
  from 48 is too far for 45 up."** Used when exactly one other run comes within
  two steps (or none does: "no other run comes close"), straight reach rules out
  every other number, and the sentence fits in 120 characters; about half of
  these steps. The rival's ends and the counted ends are outlined. Otherwise the
  striped run stays.
