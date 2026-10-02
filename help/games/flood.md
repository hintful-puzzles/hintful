# Flood

Try to get the whole grid to be the same color within the given
number of moves, by repeatedly flood-filling the top left corner in
different colors.

## Controls

{{controls}}

## Hints

**Hint** names the next color to fill with — *"Fill with orange: it joins
the dotted squares to your region"*.

{{hint-marks}}

Nothing in Flood is forced by logic, so
the hint plays a few fills ahead and picks the one that looks best; it
does not promise the shortest way to finish. The move limit is set by
the same planner playing from the start, plus the extra moves the game
allows, so following the hint from the first move finishes in time.

## Flood parameters

{{parameters}}
