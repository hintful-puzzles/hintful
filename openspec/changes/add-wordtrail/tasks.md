## 1. Wordtrail (edges kind, on Palisade's wall model)

- [x] 1.1 Scaffold from the `edges` skeleton, first verdict; its description from `candidates/wordtrail.description.yaml`, blocked squares added
- [x] 1.2 Generator: lay answers' words as paths on a grid with blocked squares, and keep a board only when its division is unique against the guess list; bounded retries, the deal walk's census, sizes probed at both ends (2026-11-19, 24 seeds a cell: every preset at both tiers and 8×8 deal in a few tries and well under a second; 3×3 Normal is the tail, at most 1031 tries in 0.1 s)
- [x] 1.3 Moves and input: a word drawn by drag through orthogonal neighbors, a keyboard path, removing a word; findMistakes
- [x] 1.4 Rendering: letters, blocked squares, drawn words, the length list with found words
- [x] 1.5 Hint and tiers: its own rungs (a letter with one way on, the words through a letter, the only words of a length), checked sound; the inherited techniques proved unsound where a word runs beside itself, and the pocket rung not built (`design.md` § "The ladder as built")
- [x] 1.6 Help page, spec, icons; play it in the app, hints at every stage, a fresh subagent's read (played by mouse, keyboard and touch, light and dark, desktop and phone; the read found "neighbor left to join" ambiguous, now "just one neighbor it can still join", and asked that a step name its word, filed as `say-a-supplied-word`)

## 2. Close

- [x] 2.1 `npm run test:hint-sweeps` if shared code changed (628 passed); push
- [ ] 2.2 The owner's acceptance in the running app; archive
