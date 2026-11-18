## 1. Wordtrail (edges kind, on Palisade's wall model)

- [ ] 1.1 Scaffold from the `edges` skeleton, first verdict; its description from `candidates/wordtrail.description.yaml`, blocked squares added
- [ ] 1.2 Generator: lay answers' words as paths on a grid with blocked squares, and keep a board only when its division is unique against the guess list; bounded retries, the deal walk's census, sizes probed at both ends
- [ ] 1.3 Moves and input: a word drawn by drag through orthogonal neighbors, a keyboard path, removing a word; findMistakes
- [ ] 1.4 Rendering: letters, blocked squares, drawn words, the length list with found words
- [ ] 1.5 Hint and tiers: its own rungs (a letter with one way on, a pocket no listed length fits, a word that fits one place), the three inherited techniques; checked sound
- [ ] 1.6 Help page, spec, icons; play it in the app, hints at every stage, a fresh subagent's read

## 2. Close

- [ ] 2.1 `npm run test:hint-sweeps` if shared code changed; push
- [ ] 2.2 The owner's acceptance in the running app; archive
