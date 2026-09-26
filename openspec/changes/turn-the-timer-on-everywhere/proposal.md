# turn-the-timer-on-everywhere

## Why

Owner, 2026-09-26, after trying `make-the-timer-an-engine-feature` on a phone:
*"seeing how unobtrusive it is in the bar, I'd suggest we turn it on by
default."* The timer is a small readout beside the move count, so a player who
doesn't want it can switch it off, while a player who would want it would not
know to look for it in the preferences.

## What changes

- `show-timer` defaults on in every game.
- `Game.isTimed` is deleted. Its only remaining job was supplying that default,
  and a declaration no mechanism consumes is a manifest (AGENTS.md, "Convention
  over configuration"); `contract-surface.test.ts` refuses a `Game` field
  nothing reads. Every game drops its `isTimed:` line, and twenty requirements
  across nineteen game specs drop the "`isTimed = …`" clause from their
  capability-flag sentence.
- The help page's "Timing your solve" says the timer is on unless switched off.

## Player-visible

Yes: every puzzle now shows the time beside the move count. A player's stored
`show-timer` choice is kept, so only players who never set it see the change.
The owner asked for it.
