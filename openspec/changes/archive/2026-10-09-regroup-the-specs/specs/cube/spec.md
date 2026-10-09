## REMOVED Requirements

### Requirement: Cube has a status bar and neither a solver nor a text format

**Reason**: type: which hooks the game object carries is what `cubeGame` in
`src/games/cube/index.ts` says, and the scenario only inspects it. The "SHALL
NOT provide `solve`" and "no hint" are not decisions: `ts-engine`, "A game's
contract sections are implemented, not applicable, or absent, and an absent one
makes it a draft", makes Cube a draft for exactly those absences, "A
not-applicable reason is a fact about the puzzle" forbids a hint ever being not
applicable, and `openspec/changes/hintless-games-in-reserve/proposal.md` names
Cube among the games still owed a hint. The mistake-check half is the declared
`notApplicable.findMistakes` sentence, which the help page shows. That
completion is reported in the status bar is kept by "Cube has no win flash".
