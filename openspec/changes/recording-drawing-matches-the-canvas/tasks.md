## 1. Refuse what the canvas refuses

- [x] 1.1 List what each canvas drawing method refuses or treats as "none".
- [x] 1.2 Move it into one helper both drawings call.
- [x] 1.3 See a test fail on a planted `-1` outline; fix every game or
      fixture the stricter check finds. (No game drew an absent color; one
      midend fixture did. 242 sub-pixel rects left the record, and 981
      `color#-1` fill labels became `none`.)

## 2. Snapshots key a color by what it paints

- [ ] 2.1 Change the serialized form of a recorded op to drop the index.
- [ ] 2.2 Re-baseline in a commit of its own; check the diff's shape.
- [ ] 2.3 Remove a color from a scratch copy of a game and see only the
      frames that used it change.

## 3. Record

- [ ] 3.1 `docs/testing.md` § "Render scenarios"; `testing` spec delta.
