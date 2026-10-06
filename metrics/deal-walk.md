# Deal walk

Each line is one ladder: a menu's largest size at one tier, then 1.5, 2, 3,
4, 6 and 8 times it, ending at the first rung that is slow or fails. A game
without tiers starts from its smallest size. A time is the mean of a
cell's deals in seconds, then its slowest; `quick` is every deal under a
tenth of a second. `npm run deal-walk` writes this, and
`scripts/deal-walk.ts` says how to read it.

## abcd

- `2x2n4` to `7x7n4` quick · `11x11n4` refused · `14x14n4` refused · `21x21n4` refused · `28x28n4` refused · `42x42n4` refused · `56x56n4` refused
- `2x2n4R` to `8x8n4R` quick · `10x10n4R` refused · `15x15n4R` refused · `20x20n4R` refused · `30x30n4R` refused · `40x40n4R` refused
- `2x2n5D` to `6x6n5D` quick · `9x9n5D` 0.2 s, slowest 0.3 · `12x12n5D` refused · `18x18n5D` refused · `24x24n5D` refused · `36x36n5D` refused · `48x48n5D` refused
- `2x2n3` to `7x7n3` quick · `11x11n3` 1 s, slowest 4 · `14x14n3` refused · `21x21n3` refused · `28x28n3` refused · `42x42n3` refused · `56x56n3` refused

Refused with:
- 4 letters have no ABCD puzzle on a board this big; keep the area under 82 squares, or use fewer letters.
- 5 letters have no ABCD puzzle on a board this big; keep the area under 110 squares, or use fewer letters.
- 3 letters have no ABCD puzzle on a board this big; keep the area under 130 squares, or use fewer letters.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## ascent

- `8x10mRde` quick · `12x15mRde` 0.3 s, slowest 0.6 · `16x20mRde` 2 s, slowest 3 · `24x30mRde` 25 s, slowest 25
- `8x10mRdn` quick · `12x15mRdn` 0.4 s, slowest 0.5 · `16x20mRdn` 3 s, slowest 3 · `24x30mRdn` 34 s, slowest 34
- `8x10mRdt` quick · `12x15mRdt` 0.7 s, slowest 0.9 · `16x20mRdt` 5 s, slowest 5 · `24x30mRdt` 53 s, slowest 53
- `8x10mRdh` quick · `12x15mRdh` 1 s, slowest 2 · `16x20mRdh` 8 s, slowest 9 · `24x30mRdh` **no answer in 60 s**
- `6x8mCde` quick · `9x12mCde` 0.1 s, slowest 0.1 · `12x16mCde` 0.6 s, slowest 0.8 · `18x24mCde` 7 s, slowest 8 · `24x32mCde` **no answer in 60 s**
- `6x8mCdn` quick · `9x12mCdn` 0.2 s, slowest 0.2 · `12x16mCdn` 0.8 s, slowest 0.9 · `18x24mCdn` 11 s, slowest 11
- `6x8mCdt` quick · `9x12mCdt` 0.2 s, slowest 0.2 · `12x16mCdt` 1 s, slowest 2 · `18x24mCdt` 29 s, slowest 29
- `6x8mCdh` quick · `9x12mCdh` 0.5 s, slowest 0.5 · `12x16mCdh` 2 s, slowest 3 · `18x24mCdh` 33 s, slowest 33
- `7x7mHde` quick · `11x11mHde` quick · `14x14mHde` refused · `21x21mHde` 4 s, slowest 5 · `28x28mHde` refused · `42x42mHde` refused · `50x50mHde` refused
- `7x7mHdn` quick · `11x11mHdn` 0.1 s, slowest 0.2 · `14x14mHdn` refused · `21x21mHdn` 5 s, slowest 5 · `28x28mHdn` refused · `42x42mHdn` refused · `50x50mHdn` refused
- `7x7mHdt` quick · `11x11mHdt` 0.1 s, slowest 0.1 · `14x14mHdt` refused · `21x21mHdt` 6 s, slowest 7 · `28x28mHdt` refused · `42x42mHdt` refused · `50x50mHdt` refused
- `7x7mHdh` quick · `11x11mHdh` 0.2 s, slowest 0.3 · `14x14mHdh` refused · `21x21mHdh` 12 s, slowest 12
- `5x5mEEde` refused · `8x8mEEde` refused · `10x10mEEde` refused · `15x15mEEde` refused · `20x20mEEde` refused · `30x30mEEde` refused · `40x40mEEde` refused
- `5x5mEEdn` quick · `8x8mEEdn` quick · `10x10mEEdn` 0.0 s, slowest 0.1 · `15x15mEEdn` 0.2 s, slowest 0.5 · `20x20mEEdn` 0.6 s, slowest 1 · `30x30mEEdn` 3 s, slowest 7 · `40x40mEEdn` refused
- `5x5mEEdt` quick · `8x8mEEdt` quick · `10x10mEEdt` 0.1 s, slowest 0.2 · `15x15mEEdt` 0.4 s, slowest 0.6 · `20x20mEEdt` 1 s, slowest 3 · `30x30mEEdt` 20 s, slowest 20
- `5x5mEEdh` quick · `8x8mEEdh` 0.1 s, slowest 0.4 · `10x10mEEdh` 0.2 s, slowest 0.3 · `15x15mEEdh` 3 s, slowest 6 · `20x20mEEdh` 4 s, slowest 8 · `30x30mEEdh` **no answer in 60 s**

Refused with:
- Height must be an odd number.
- Width times height must be less than 1000.
- Difficulty for Edges mode must be at least Normal.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## blackbox

- `w2h2m3M3` refused · `w3h3m3M3` to `w40h40m3M3` quick
- `w2h2m5M5` refused · `w3h3m5M5` refused · `w4h4m5M5` to `w40h40m5M5` quick · `w60h60m5M5` 0.1 s, slowest 0.1 · `w80h80m5M5` 0.3 s, slowest 0.4
- `w2h2m3M6` refused · `w3h3m3M6` refused · `w4h4m3M6` refused · `w5h5m3M6` to `w48h48m3M6` quick · `w64h64m3M6` 0.2 s, slowest 0.3
- `w2h2m4M10` refused · `w3h3m4M10` refused · `w4h4m4M10` refused · `w5h5m4M10` refused · `w6h6m4M10` to `w9h9m4M10` quick · `w10h10m4M10` 0.2 s, slowest 0.3 · `w15h15m4M10` refused · `w20h20m4M10` refused · `w30h30m4M10` refused · `w40h40m4M10` refused · `w60h60m4M10` refused · `w80h80m4M10` refused

Refused with:
- A board this size can be dealt with at most 1 ball.
- There must be fewer balls than squares.
- A board this size can be dealt with at most 3 balls.
- A board this size can be dealt with at most 5 balls.
- A board this size can be dealt with at most 8 balls.
- A board this size can be dealt with at most 6 balls.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## boats

- `6x6f3de,3,2,1` to `48x48f3de,3,2,1` quick
- `6x6f3dn,3,2,1` quick · `9x9f3dn,3,2,1` 0.2 s, slowest 0.6 · `12x12f3dn,3,2,1` 0.7 s, slowest 2 · `18x18f3dn,3,2,1` 16 s, slowest 16
- `6x6f3dt,3,2,1` to `12x12f3dt,3,2,1` quick · `18x18f3dt,3,2,1` 0.1 s, slowest 0.1 · `24x24f3dt,3,2,1` 0.3 s, slowest 0.6 · `36x36f3dt,3,2,1` 4 s, slowest 8 · `48x48f3dt,3,2,1` 6 s, slowest 8
- `6x6f3dh,3,2,1` quick · `9x9f3dh,3,2,1` quick · `12x12f3dh,3,2,1` 0.1 s, slowest 0.1 · `18x18f3dh,3,2,1` 0.1 s, slowest 0.2 · `24x24f3dh,3,2,1` 0.3 s, slowest 0.7 · `36x36f3dh,3,2,1` 1 s, slowest 2 · `48x48f3dh,3,2,1` 4 s, slowest 8
- `10x10f4de,4,3,2,1` to `30x30f4de,4,3,2,1` quick · `40x40f4de,4,3,2,1` 0.1 s, slowest 0.1 · `60x60f4de,4,3,2,1` 0.3 s, slowest 0.3 · `80x80f4de,4,3,2,1` 0.5 s, slowest 0.6
- `10x10f4dn,4,3,2,1` quick · `15x15f4dn,4,3,2,1` 1 s, slowest 3 · `20x20f4dn,4,3,2,1` 4 s, slowest 7 · `30x30f4dn,4,3,2,1` 26 s, slowest 26
- `10x10f4dt,4,3,2,1` quick · `15x15f4dt,4,3,2,1` 0.1 s, slowest 0.3 · `20x20f4dt,4,3,2,1` 0.3 s, slowest 0.6 · `30x30f4dt,4,3,2,1` 1 s, slowest 3 · `40x40f4dt,4,3,2,1` 7 s, slowest 9 · `60x60f4dt,4,3,2,1` 9 s, slowest 10 · `80x80f4dt,4,3,2,1` 5 s, slowest 5, **no answer in 60 s**
- `10x10f4dh,4,3,2,1` quick · `15x15f4dh,4,3,2,1` 0.2 s, slowest 0.2 · `20x20f4dh,4,3,2,1` 0.3 s, slowest 0.7 · `30x30f4dh,4,3,2,1` 1 s, slowest 2 · `40x40f4dh,4,3,2,1` 3 s, slowest 5 · `60x60f4dh,4,3,2,1` 4 s, slowest 5 · `80x80f4dh,4,3,2,1` 7 s, slowest 9

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## bricks

- `8x10de` 0.1 s, slowest 0.2 · `12x15de` 2 s, slowest 2 · `16x20de` 9 s, slowest 9 · `24x30de` **no answer in 60 s**
- `8x10dn` 0.5 s, slowest 1 · `12x15dn` 6 s, slowest 9 · `16x20dn` **no answer in 60 s**

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## bridges

- `15x15i30e10m2d0` quick · `23x23i30e10m2d0` quick · `30x30i30e10m2d0` 0.1 s, slowest 0.2 · `45x45i30e10m2d0` 1 s, slowest 4 · `60x60i30e10m2d0` 17 s, slowest 17
- `15x15i30e10m2d1` quick · `23x23i30e10m2d1` quick · `30x30i30e10m2d1` 0.1 s, slowest 0.2 · `45x45i30e10m2d1` 0.8 s, slowest 2 · `60x60i30e10m2d1` 19 s, slowest 19
- `15x15i30e10m2d2` quick · `23x23i30e10m2d2` 0.1 s, slowest 0.2 · `30x30i30e10m2d2` 0.3 s, slowest 0.5 · `45x45i30e10m2d2` 5 s, slowest 10 · `60x60i30e10m2d2` 7 s, slowest 13
- `10x10i30e10m2Ld0` to `20x20i30e10m2Ld0` quick · `30x30i30e10m2Ld0` 0.1 s, slowest 0.1 · `40x40i30e10m2Ld0` 1 s, slowest 2 · `60x60i30e10m2Ld0` 35 s, slowest 35
- `10x10i30e10m2Ld1` to `30x30i30e10m2Ld1` quick · `40x40i30e10m2Ld1` 0.3 s, slowest 0.9 · `60x60i30e10m2Ld1` 3 s, slowest 7 · `80x80i30e10m2Ld1` 19 s, slowest 19
- `10x10i30e10m2Ld2` to `20x20i30e10m2Ld2` quick · `30x30i30e10m2Ld2` 0.1 s, slowest 0.1 · `40x40i30e10m2Ld2` 0.4 s, slowest 1 · `60x60i30e10m2Ld2` 5 s, slowest 7 · `80x80i30e10m2Ld2` **no answer in 60 s**

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## clusters

- `10x10de` 0.2 s, slowest 0.6 · `15x15de` 2 s, slowest 3 · `20x20de` 7 s, slowest 14
- `10x10dt` 1 s, slowest 3 · `15x15dt` 25 s, slowest 25

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## crossing

- `2x2` refused · `3x3` refused · `4x4` to `12x12` quick · `13x13` 0.1 s, slowest 0.3 · `20x20` refused · `26x26` refused · `39x39` refused · `52x52` refused · `78x78` refused · `104x104` refused
- `2x2S` refused · `3x3S` refused · `4x4S` to `13x13S` quick · `14x14S` 0.2 s, slowest 0.4 · `15x15S` 0.7 s, slowest 2 · `23x23S` refused · `30x30S` refused · `45x45S` refused · `60x60S` refused · `90x90S` refused · `120x120S` refused

Refused with:
- Width or height must be at least 4.
- Width times height must be at most 225; larger boards cannot be generated.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## cube

- `c0x4` refused · `c1x4` refused · `c2x4` to `c32x4` quick
- `t0x2` refused · `t1x2` to `t8x2` quick
- `o0x2` refused · `o1x2` to `o16x2` quick
- `i0x3` refused · `i1x3` to `i24x3` quick

Refused with:
- Both grid dimensions must be greater than one.
- The grid is too small to place the solid on an empty square.
- The grid is too small to place all the blue faces.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## dominosa

- `9tdt` quick · `14tdt` 0.3 s, slowest 0.7 · `18tdt` 6 s, slowest 9 · `27tdt` **no answer in 60 s**
- `9tdb` quick · `14tdb` 0.3 s, slowest 0.6 · `18tdb` 0.5 s, slowest 2 · `27tdb` **no answer in 60 s**
- `9tdh` 0.6 s, slowest 1 · `14tdh` **no answer in 60 s**
- `9tde` 5 s, slowest 12

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## fifteen

- `2x2` to `40x40` quick

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## filling

- `1x1` to `12x12` quick · `13x13` 0.1 s, slowest 0.1 · `13x14` 0.1 s, slowest 0.1 · `13x15` 0.1 s, slowest 0.2 · `13x16` 0.1 s, slowest 0.2 · `13x17` 0.2 s, slowest 0.2 · `20x26` 3 s, slowest 4, gave up on 3 of 4 · `26x34` 6 s, slowest 6, gave up on 2 of 2 · `39x51` 11 s, slowest 11, gave up on 1 of 1

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## flip

- `1x1c` to `40x40c` quick
- `1x1r` to `15x15r` quick · `20x20r` 0.4 s, slowest 0.8 · `30x30r` 21 s, slowest 21

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## flood

- `1x1c6m5` refused · `2x2c6m5` to `18x18c6m5` quick · `24x24c6m5` 0.1 s, slowest 0.1 · `36x36c6m5` 0.4 s, slowest 0.4 · `48x48c6m5` 0.8 s, slowest 0.9 · `72x72c6m5` 3 s, slowest 3 · `96x96c6m5` 7 s, slowest 7
- `1x1c6m2` refused · `2x2c6m2` to `16x16c6m2` quick · `24x24c6m2` 0.1 s, slowest 0.1 · `32x32c6m2` 0.2 s, slowest 0.3 · `48x48c6m2` 0.9 s, slowest 0.9 · `64x64c6m2` 2 s, slowest 2 · `96x96c6m2` 7 s, slowest 7 · `128x128c6m2` 17 s, slowest 17
- `1x1c6m0` refused · `2x2c6m0` to `16x16c6m0` quick · `24x24c6m0` 0.1 s, slowest 0.1 · `32x32c6m0` 0.3 s, slowest 0.3 · `48x48c6m0` 0.9 s, slowest 1 · `64x64c6m0` 2 s, slowest 2 · `96x96c6m0` 7 s, slowest 7 · `128x128c6m0` 16 s, slowest 16
- `1x1c3m0` refused · `2x2c3m0` to `72x72c3m0` quick · `96x96c3m0` 0.2 s, slowest 0.2
- `1x1c4m0` refused · `2x2c4m0` to `36x36c4m0` quick · `48x48c4m0` 0.1 s, slowest 0.1 · `72x72c4m0` 0.4 s, slowest 0.5 · `96x96c4m0` 1 s, slowest 1

Refused with:
- Grid must contain at least two squares.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## galaxies

- `15x15dn` quick · `23x23dn` 1 s, slowest 3 · `30x30dn` 19 s, slowest 19, gave up on 1 of 1
- `15x15du` 0.1 s, slowest 0.2 · `23x23du` 6 s, slowest 18

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## group

- `12dt` quick · `18dt` quick · `24dt` 0.3 s, slowest 0.3 · `26dt` 0.4 s, slowest 0.4
- `12dn` quick · `18dn` 0.3 s, slowest 0.3 · `24dn` 2 s, slowest 2 · `26dn` 4 s, slowest 4
- `12dh` 0.9 s, slowest 2 · `18dh` 47 s, slowest 47
- `12dx` 13 s, slowest 13
- `12du` **no answer in 60 s**
- `8dti` refused · `12dti` refused · `16dti` refused · `24dti` refused · `26dti` refused
- `8dni` quick · `12dni` quick · `16dni` 0.2 s, slowest 0.2 · `24dni` 3 s, slowest 3 · `26dni` 5 s, slowest 5
- `8dhi` quick · `12dhi` 0.1 s, slowest 0.3 · `16dhi` 2 s, slowest 3 · `24dhi` **no answer in 60 s**
- `8dxi` 0.3 s, slowest 0.6 · `12dxi` 43 s, slowest 43
- `8dui` quick · `12dui` **no answer in 60 s**

Refused with:
- Easy puzzles must have an identity.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## guess

- `c6p2g10Bm` to `c6p32g10Bm` quick
- `c8p2g12Bm` to `c8p40g12Bm` quick
- `c6p2g10BM` to `c6p6g10BM` quick · `c6p8g10BM` refused · `c6p12g10BM` refused · `c6p16g10BM` refused · `c6p24g10BM` refused · `c6p32g10BM` refused

Refused with:
- Disallowing multiple colors requires at least as many colors as pegs.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## inertia

- `2x2` refused · `3x3` to `32x40` quick · `48x60` 0.3 s, slowest 0.6 · `64x80` 1 s, slowest 1 · `96x120` 3 s, slowest 3 · `128x160` 8 s, slowest 8

Refused with:
- Grid area must be at least six squares.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## keen

- `9de` 0.2 s, slowest 0.4
- `9dn` 0.2 s, slowest 0.5
- `9dh` quick
- `9dx` 0.6 s, slowest 1
- `9du` 0.1 s, slowest 0.2
- `6dem` quick · `9dem` quick
- `6dnm` quick · `9dnm` 2 s, slowest 4
- `6dhm` 0.1 s, slowest 0.1 · `9dhm` 17 s, slowest 30
- `6dxm` 0.7 s, slowest 1 · `9dxm` refused
- `6dum` 0.8 s, slowest 2 · `9dum` refused

Refused with:
- Hard 9x9 puzzles with multiplication only are too rare to deal.
- Unreasonable 9x9 puzzles with multiplication only are too rare to deal.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## lightup

- `7x7b20s4d0` to `14x14b20s4d0` quick · `21x21b20s4d0` 0.1 s, slowest 0.2 · `28x28b20s4d0` 0.3 s, slowest 0.3 · `42x42b20s4d0` 1 s, slowest 2 · `56x56b20s4d0` 3 s, slowest 3
- `7x7b20s4d1` quick · `11x11b20s4d1` quick · `14x14b20s4d1` 0.2 s, slowest 0.4 · `21x21b20s4d1` 0.7 s, slowest 0.7 · `28x28b20s4d1` 2 s, slowest 3 · `42x42b20s4d1` 10 s, slowest 10
- `7x7b20s4d2` 0.1 s, slowest 0.1 · `11x11b20s4d2` 0.2 s, slowest 0.3 · `14x14b20s4d2` 1 s, slowest 1 · `21x21b20s4d2` 3 s, slowest 5 · `28x28b20s4d2` 9 s, slowest 9 · `42x42b20s4d2` 34 s, slowest 34
- `14x14b20s2d0` quick · `21x21b20s2d0` 0.1 s, slowest 0.1 · `28x28b20s2d0` 0.3 s, slowest 0.5 · `42x42b20s2d0` 1 s, slowest 1 · `56x56b20s2d0` 3 s, slowest 4 · `84x84b20s2d0` 13 s, slowest 13
- `14x14b20s2d1` 0.1 s, slowest 0.2 · `21x21b20s2d1` 1 s, slowest 1 · `28x28b20s2d1` 3 s, slowest 3 · `42x42b20s2d1` 16 s, slowest 16
- `14x14b20s2d2` 1 s, slowest 1 · `21x21b20s2d2` 3 s, slowest 4 · `28x28b20s2d2` 10 s, slowest 10

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## loopy

- `10x10t0de` quick · `15x15t0de` 0.1 s, slowest 0.1 · `20x20t0de` 0.4 s, slowest 0.5 · `30x30t0de` 5 s, slowest 6 · `40x40t0de` 15 s, slowest 15
- `10x10t0dn` quick · `15x15t0dn` 0.3 s, slowest 0.4 · `20x20t0dn` 1 s, slowest 1 · `30x30t0dn` 13 s, slowest 13
- `10x10t0dt` 0.1 s, slowest 0.1 · `15x15t0dt` 0.5 s, slowest 0.7 · `20x20t0dt` 2 s, slowest 3 · `30x30t0dt` 18 s, slowest 18
- `10x10t0dh` quick · `15x15t0dh` 0.7 s, slowest 0.9 · `20x20t0dh` 3 s, slowest 5 · `30x30t0dh` 24 s, slowest 24
- `9x14t1de` quick · `14x21t1de` 0.4 s, slowest 0.4 · `18x28t1de` 1 s, slowest 2 · `27x42t1de` 8 s, slowest 9 · `36x56t1de` 41 s, slowest 41
- `9x14t1dn` 0.2 s, slowest 0.3 · `14x21t1dn` 1 s, slowest 1 · `18x28t1dn` 4 s, slowest 5 · `27x42t1dn` 28 s, slowest 28
- `9x14t1dt` 0.2 s, slowest 0.4 · `14x21t1dt` 1 s, slowest 2 · `18x28t1dt` 5 s, slowest 5 · `27x42t1dt` 38 s, slowest 38
- `9x14t1dh` 0.5 s, slowest 0.7 · `14x21t1dh` 4 s, slowest 5 · `18x28t1dh` 16 s, slowest 16
- `7x7t3de` quick · `11x11t3de` 0.2 s, slowest 0.2 · `14x14t3de` 0.5 s, slowest 0.7 · `21x21t3de` 6 s, slowest 6 · `28x28t3de` 23 s, slowest 23
- `7x7t3dn` quick · `11x11t3dn` 0.6 s, slowest 0.7 · `14x14t3dn` 2 s, slowest 2 · `21x21t3dn` 14 s, slowest 14
- `7x7t3dt` 0.1 s, slowest 0.1 · `11x11t3dt` 0.9 s, slowest 1 · `14x14t3dt` 3 s, slowest 3 · `21x21t3dt` 25 s, slowest 25
- `7x7t3dh` 0.1 s, slowest 0.2 · `11x11t3dh` 1 s, slowest 2 · `14x14t3dh` 5 s, slowest 6 · `21x21t3dh` 34 s, slowest 34
- `9x9t4de` quick · `14x14t4de` 0.5 s, slowest 0.6 · `18x18t4de` 2 s, slowest 3 · `27x27t4de` 19 s, slowest 19
- `9x9t4dn` 0.1 s, slowest 0.1 · `14x14t4dn` 1 s, slowest 2 · `18x18t4dn` 6 s, slowest 6 · `27x27t4dn` 39 s, slowest 39
- `9x9t4dt` 0.2 s, slowest 0.4 · `14x14t4dt` 2 s, slowest 3 · `18x18t4dt` 11 s, slowest 12
- `9x9t4dh` 0.3 s, slowest 0.4 · `14x14t4dh` 3 s, slowest 4 · `18x18t4dh` 14 s, slowest 14
- `4x6t7de` quick · `6x9t7de` 0.3 s, slowest 0.4 · `8x12t7de` 2 s, slowest 2 · `12x18t7de` 11 s, slowest 11
- `4x6t7dn` 0.1 s, slowest 0.2 · `6x9t7dn` 0.7 s, slowest 0.8 · `8x12t7dn` 3 s, slowest 4 · `12x18t7dn` 35 s, slowest 35
- `4x6t7dt` 0.2 s, slowest 0.2 · `6x9t7dt` 1 s, slowest 1 · `8x12t7dt` 5 s, slowest 6 · `12x18t7dt` 41 s, slowest 41
- `4x6t7dh` 0.2 s, slowest 0.3 · `6x9t7dh` 2 s, slowest 3 · `8x12t7dh` 9 s, slowest 10 · `12x18t7dh` 57 s, slowest 57
- `10x10t11de` quick · `15x15t11de` quick · `20x20t11de` 0.2 s, slowest 0.3 · `30x30t11de` 1 s, slowest 2 · `40x40t11de` 7 s, slowest 8 · `60x60t11de` **no answer in 60 s**
- `10x10t11dn` quick · `15x15t11dn` 0.1 s, slowest 0.1 · `20x20t11dn` 0.5 s, slowest 0.6 · `30x30t11dn` 4 s, slowest 5 · `40x40t11dn` 14 s, slowest 14
- `10x10t11dt` quick · `15x15t11dt` 0.2 s, slowest 0.2 · `20x20t11dt` 0.7 s, slowest 0.9 · `30x30t11dt` 10 s, slowest 10
- `10x10t11dh` quick · `15x15t11dh` 0.3 s, slowest 0.4 · `20x20t11dh` 1 s, slowest 2 · `30x30t11dh` 12 s, slowest 12
- `10x10t12de` quick · `15x15t12de` quick · `20x20t12de` 0.1 s, slowest 0.2 · `30x30t12de` 1 s, slowest 2 · `40x40t12de` 3 s, slowest 4 · `60x60t12de` 28 s, slowest 28
- `10x10t12dn` quick · `15x15t12dn` quick · `20x20t12dn` 0.2 s, slowest 0.3 · `30x30t12dn` 3 s, slowest 3 · `40x40t12dn` 8 s, slowest 9 · `60x60t12dn` **no answer in 60 s**
- `10x10t12dt` quick · `15x15t12dt` 0.1 s, slowest 0.2 · `20x20t12dt` 0.4 s, slowest 0.6 · `30x30t12dt` 4 s, slowest 4 · `40x40t12dt` 17 s, slowest 17
- `10x10t12dh` quick · `15x15t12dh` 0.2 s, slowest 0.2 · `20x20t12dh` 0.7 s, slowest 1 · `30x30t12dh` 7 s, slowest 9 · `40x40t12dh` 37 s, slowest 37
- `10x10t2de` quick · `15x15t2de` 0.2 s, slowest 0.2 · `20x20t2de` 0.9 s, slowest 1 · `30x30t2de` 7 s, slowest 7 · `40x40t2de` 39 s, slowest 39
- `10x10t2dn` quick · `15x15t2dn` 0.4 s, slowest 0.6 · `20x20t2dn` 2 s, slowest 2 · `30x30t2dn` 19 s, slowest 19
- `10x10t2dt` 0.2 s, slowest 0.2 · `15x15t2dt` 1 s, slowest 2 · `20x20t2dt` 6 s, slowest 7 · `30x30t2dt` 46 s, slowest 46
- `10x10t2dh` 0.2 s, slowest 0.3 · `15x15t2dh` 1 s, slowest 2 · `20x20t2dh` 7 s, slowest 7 · `30x30t2dh` 54 s, slowest 54
- `4x5t5de` quick · `6x8t5de` 0.2 s, slowest 0.3 · `8x10t5de` 0.5 s, slowest 0.7 · `12x15t5de` 6 s, slowest 8 · `16x20t5de` 27 s, slowest 27
- `4x5t5dn` quick · `6x8t5dn` 0.4 s, slowest 0.5 · `8x10t5dn` 2 s, slowest 2 · `12x15t5dn` 15 s, slowest 15
- `4x5t5dt` quick · `6x8t5dt` 0.6 s, slowest 0.7 · `8x10t5dt` 2 s, slowest 3 · `12x15t5dt` 21 s, slowest 21
- `4x5t5dh` quick · `6x8t5dh` 0.9 s, slowest 1 · `8x10t5dh` 3 s, slowest 4 · `12x15t5dh` 33 s, slowest 33
- `3x6t14de` quick · `5x9t14de` quick · `6x12t14de` 0.1 s, slowest 0.2 · `9x18t14de` 0.9 s, slowest 1 · `12x24t14de` 6 s, slowest 8 · `18x36t14de` **no answer in 60 s**
- `3x6t14dn` quick · `5x9t14dn` 0.1 s, slowest 0.1 · `6x12t14dn` 0.2 s, slowest 0.3 · `9x18t14dn` 2 s, slowest 3 · `12x24t14dn` 12 s, slowest 12
- `3x6t14dt` quick · `5x9t14dt` 0.1 s, slowest 0.1 · `6x12t14dt` 0.3 s, slowest 0.4 · `9x18t14dt` 2 s, slowest 3 · `12x24t14dt` 10 s, slowest 13
- `3x6t14dh` quick · `5x9t14dh` 0.2 s, slowest 0.3 · `6x12t14dh` 0.6 s, slowest 0.6 · `9x18t14dh` 5 s, slowest 5 · `12x24t14dh` 16 s, slowest 16
- `7x7t6de` quick · `11x11t6de` 0.2 s, slowest 0.2 · `14x14t6de` 0.9 s, slowest 1 · `21x21t6de` 8 s, slowest 9 · `28x28t6de` 31 s, slowest 31
- `7x7t6dn` quick · `11x11t6dn` 0.4 s, slowest 0.5 · `14x14t6dn` 2 s, slowest 2 · `21x21t6dn` 18 s, slowest 18
- `7x7t6dt` 0.1 s, slowest 0.2 · `11x11t6dt` 1 s, slowest 2 · `14x14t6dt` 5 s, slowest 5 · `21x21t6dt` 41 s, slowest 41
- `7x7t6dh` 0.2 s, slowest 0.4 · `11x11t6dh` 2 s, slowest 2 · `14x14t6dh` 11 s, slowest 11
- `5x5t8de` quick · `8x8t8de` 0.5 s, slowest 0.6 · `10x10t8de` 2 s, slowest 2 · `15x15t8de` 18 s, slowest 18
- `5x5t8dn` quick · `8x8t8dn` 1 s, slowest 2 · `10x10t8dn` 4 s, slowest 5 · `15x15t8dn` 40 s, slowest 40
- `5x5t8dt` 0.2 s, slowest 0.2 · `8x8t8dt` 2 s, slowest 2 · `10x10t8dt` 9 s, slowest 9 · `15x15t8dt` 49 s, slowest 49
- `5x5t8dh` 0.2 s, slowest 0.2 · `8x8t8dh` 3 s, slowest 3 · `10x10t8dh` 11 s, slowest 11
- `3x6t9de` quick · `5x9t9de` 0.2 s, slowest 0.3 · `6x12t9de` 2 s, slowest 5 · `9x18t9de` 30 s, slowest 30, gave up on 1 of 1
- `3x6t9dn` quick · `5x9t9dn` 0.1 s, slowest 0.2 · `6x12t9dn` 0.5 s, slowest 0.6 · `9x18t9dn` 7 s, slowest 7 · `12x24t9dn` 37 s, slowest 37
- `3x6t9dt` quick · `5x9t9dt` 0.2 s, slowest 0.2 · `6x12t9dt` 0.7 s, slowest 0.8 · `9x18t9dt` 6 s, slowest 7 · `12x24t9dt` 26 s, slowest 26
- `3x6t9dh` quick · `5x9t9dh` 0.4 s, slowest 0.6 · `6x12t9dh` 1 s, slowest 1 · `9x18t9dh` 12 s, slowest 12
- `3x6t10de` quick · `5x9t10de` 0.3 s, slowest 0.3 · `6x12t10de` 0.8 s, slowest 0.9 · `9x18t10de` 10 s, slowest 10
- `3x6t10dn` quick · `5x9t10dn` 0.6 s, slowest 0.8 · `6x12t10dn` 2 s, slowest 3 · `9x18t10dn` 23 s, slowest 23
- `3x6t10dt` 0.1 s, slowest 0.1 · `5x9t10dt` 1 s, slowest 1 · `6x12t10dt` 5 s, slowest 5 · `9x18t10dt` 55 s, slowest 55
- `3x6t10dh` 0.1 s, slowest 0.2 · `5x9t10dh` 2 s, slowest 3 · `6x12t10dh` 6 s, slowest 6 · `9x18t10dh` **no answer in 60 s**
- `3x5t13de` quick · `5x8t13de` 0.5 s, slowest 0.6 · `6x10t13de` 2 s, slowest 2 · `9x15t13de` 18 s, slowest 18
- `3x5t13dn` quick · `5x8t13dn` 1 s, slowest 2 · `6x10t13dn` 4 s, slowest 6 · `9x15t13dn` 36 s, slowest 36
- `3x5t13dt` 0.1 s, slowest 0.2 · `5x8t13dt` 3 s, slowest 3 · `6x10t13dt` 8 s, slowest 9 · `9x15t13dt` 60 s, slowest 60
- `3x5t13dh` 0.1 s, slowest 0.2 · `5x8t13dh` 3 s, slowest 4 · `6x10t13dh` 9 s, slowest 10
- `4x5t15de` quick · `6x8t15de` 0.2 s, slowest 0.2 · `8x10t15de` 6 s, slowest 14
- `4x5t15dn` quick · `6x8t15dn` 0.3 s, slowest 0.3 · `8x10t15dn` 5 s, slowest 6 · `12x15t15dn` **no answer in 60 s**
- `4x5t15dt` quick · `6x8t15dt` 0.5 s, slowest 0.5 · `8x10t15dt` 2 s, slowest 4 · `12x15t15dt` **no answer in 60 s**
- `4x5t15dh` quick · `6x8t15dh` 0.9 s, slowest 1 · `8x10t15dh` 3 s, slowest 4 · `12x15t15dh` **no answer in 60 s**
- `9x11t16de` quick · `14x17t16de` quick · `18x22t16de` 0.2 s, slowest 0.3 · `27x33t16de` 2 s, slowest 2 · `36x44t16de` 10 s, slowest 10
- `9x11t16dn` quick · `14x17t16dn` 0.1 s, slowest 0.2 · `18x22t16dn` 0.6 s, slowest 0.8 · `27x33t16dn` 4 s, slowest 5 · `36x44t16dn` 33 s, slowest 33
- `9x11t16dt` quick · `14x17t16dt` 0.4 s, slowest 0.6 · `18x22t16dt` 2 s, slowest 3 · `27x33t16dt` 9 s, slowest 9 · `36x44t16dt` 50 s, slowest 50
- `9x11t16dh` quick · `14x17t16dh` 0.4 s, slowest 0.6 · `18x22t16dh` 1 s, slowest 1 · `27x33t16dh` 16 s, slowest 16
- `10x10t17de` quick · `15x15t17de` quick · `20x20t17de` 0.2 s, slowest 0.3 · `30x30t17de` 2 s, slowest 3 · `40x40t17de` 10 s, slowest 11
- `10x10t17dn` quick · `15x15t17dn` 0.1 s, slowest 0.1 · `20x20t17dn` 0.4 s, slowest 0.6 · `30x30t17dn` 5 s, slowest 6 · `40x40t17dn` 24 s, slowest 24
- `10x10t17dt` quick · `15x15t17dt` 0.3 s, slowest 0.3 · `20x20t17dt` 1 s, slowest 2 · `30x30t17dt` 9 s, slowest 10 · `40x40t17dt` **no answer in 60 s**
- `10x10t17dh` 0.1 s, slowest 0.2 · `15x15t17dh` 0.5 s, slowest 0.8 · `20x20t17dh` 1 s, slowest 2 · `30x30t17dh` 12 s, slowest 14

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## magnets

- `9x10de` quick · `14x15de` 0.8 s, slowest 2 · `18x20de` 40 s, slowest 40, gave up on 1 of 1
- `9x10dt` quick · `14x15dt` 3 s, slowest 4 · `18x20dt` 41 s, slowest 41, gave up on 1 of 1
- `9x10deS` quick · `14x15deS` 5 s, slowest 11
- `9x10dtS` quick · `14x15dtS` 3 s, slowest 7 · `18x20dtS` 22 s, slowest 22

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## map

- `15x20n30de` to `120x160n30de` quick
- `15x20n30dn` to `120x160n30dn` quick
- `15x20n30dh` quick · `23x30n30dh` quick · `30x40n30dh` 0.1 s, slowest 0.2 · `45x60n30dh` 0.1 s, slowest 0.2 · `60x80n30dh` 0.2 s, slowest 0.2 · `90x120n30dh` 0.2 s, slowest 0.4 · `120x160n30dh` 1 s, slowest 3
- `15x20n30du` to `45x60n30du` quick · `60x80n30du` 0.1 s, slowest 0.1 · `90x120n30du` quick · `120x160n30du` 0.5 s, slowest 0.7
- `25x30n75de` to `150x180n75de` quick · `200x240n75de` 0.1 s, slowest 0.1
- `25x30n75dn` to `100x120n75dn` quick · `150x180n75dn` 0.1 s, slowest 0.1 · `200x240n75dn` 0.1 s, slowest 0.1
- `25x30n75dh` to `50x60n75dh` quick · `75x90n75dh` 0.1 s, slowest 0.1 · `100x120n75dh` 0.2 s, slowest 0.4 · `150x180n75dh` 0.2 s, slowest 0.3 · `200x240n75dh` 0.4 s, slowest 0.8
- `25x30n75du` to `100x120n75du` quick · `150x180n75du` 0.1 s, slowest 0.1 · `200x240n75du` 0.4 s, slowest 0.9

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## mathrax

- `9de` quick
- `9dn` 0.1 s, slowest 0.1
- `9dt` 0.1 s, slowest 0.2
- `9dr` 1 s, slowest 1, **no answer in 60 s**

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## mines

- `1x1n10` refused · `2x2n10` refused · `3x3n10` refused · `4x4n10` refused · `5x5n10` to `72x72n10` quick
- `1x1n35` refused · `2x2n35` refused · `3x3n35` refused · `4x4n35` refused · `5x5n35` refused · `6x6n35` refused · `7x7n35` to `72x72n35` quick
- `1x1n40` refused · `2x2n40` refused · `3x3n40` refused · `4x4n40` refused · `5x5n40` refused · `6x6n40` refused · `7x7n40` to `128x128n40` quick
- `1x1n99` refused · `2x2n99` refused · `3x3n99` refused · `4x4n99` refused · `5x5n99` refused · `6x6n99` refused · `7x7n99` refused · `8x8n99` refused · `9x9n99` refused · `10x10n99` refused · `11x11n99` to `128x240n99` quick
- `1x1n170` refused · `2x2n170` refused · `3x3n170` refused · `4x4n170` refused · `5x5n170` refused · `6x6n170` refused · `7x7n170` refused · `8x8n170` refused · `9x9n170` refused · `10x10n170` refused · `11x11n170` refused · `12x12n170` refused · `13x13n170` refused · `14x14n170` to `128x240n170` quick

Refused with:
- Width and height must both be greater than two.
- There must be at least 9 more squares than mines.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## mosaic

- `3x3` to `23x23` quick · `24x24` 0.1 s, slowest 0.1 · `25x25` 0.1 s, slowest 0.2 · `38x38` 0.9 s, slowest 1 · `50x50` 4 s, slowest 5 · `75x75` 37 s, slowest 37
- `3x3h0` to `100x100h0` quick · `150x150h0` refused · `200x200h0` refused · `300x300h0` refused · `400x400h0` refused

Refused with:
- Width times height must be at most 10000.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## net

- `1x1` refused · `2x2` to `11x13` quick · `17x20` 0.2 s, slowest 0.2 · `22x26` 0.7 s, slowest 0.7 · `33x39` 4 s, slowest 4 · `44x52` 13 s, slowest 13
- `1x1w` refused · `2x2w` refused · `3x3w` to `14x14w` quick · `21x21w` 0.4 s, slowest 0.4 · `28x28w` 1 s, slowest 1 · `42x42w` 7 s, slowest 7 · `56x56w` 24 s, slowest 24

Refused with:
- At least one of width and height must be greater than one.
- No wrapping puzzle with a width or height of 2 can have a unique solution.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## netslide

- `2x2b1` to `40x40b1` quick
- `2x2` to `40x40` quick
- `2x2w` to `40x40w` quick

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## palisade

- `1x1n5` refused · `2x2n5` refused · `3x3n5` refused · `4x4n5` refused · `5x5n5` quick · `8x8n5` refused · `10x10n5` 0.2 s, slowest 0.4 · `15x15n5` **no answer in 60 s**
- `1x1n6` refused · `2x2n6` refused · `3x3n6` refused · `4x4n6` refused · `5x5n6` refused · `6x6n6` to `6x8n6` quick · `9x12n6` 0.2 s, slowest 0.2 · `12x16n6` 2 s, slowest 3 · `18x24n6` **no answer in 60 s**
- `1x1n8` refused · `2x2n8` refused · `3x3n8` refused · `4x4n8` quick · `5x5n8` refused · `6x6n8` refused · `7x7n8` refused · `8x8n8` quick · `8x9n8` quick · `8x10n8` 0.1 s, slowest 0.1 · `12x15n8` refused · `16x20n8` 4 s, slowest 5 · `24x30n8` **no answer in 60 s**
- `1x1n10` refused · `2x2n10` refused · `3x3n10` refused · `4x4n10` refused · `5x5n10` refused · `6x6n10` refused · `7x7n10` refused · `8x8n10` refused · `9x9n10` refused · `10x10n10` 0.1 s, slowest 0.1 · `11x11n10` refused · `12x12n10` refused · `12x13n10` refused · `12x14n10` refused · `12x15n10` 0.5 s, slowest 0.7 · `18x23n10` refused · `24x30n10` **no answer in 60 s**

Refused with:
- Region size must divide grid area.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## pattern

- `1x1` to `30x30` quick · `45x45` 7 s, slowest 11

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## pearl

- `10x10de` 3 s, slowest 5 · `15x15de` **no answer in 60 s**
- `10x10dt` 4 s, slowest 7 · `15x15dt` **no answer in 60 s**

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## pegs

- `1x1cross` refused · `2x2cross` refused · `3x3cross` refused · `4x4cross` refused · `5x5cross` refused · `6x6cross` refused · `7x7cross` quick · `8x8cross` refused · `9x9cross` quick · `14x14cross` refused · `18x18cross` refused · `27x27cross` refused · `36x36cross` refused · `54x54cross` refused · `72x72cross` refused
- `1x1octagon` refused · `2x2octagon` refused · `3x3octagon` refused · `4x4octagon` refused · `5x5octagon` refused · `6x6octagon` refused · `7x7octagon` quick · `11x11octagon` refused · `14x14octagon` refused · `21x21octagon` refused · `28x28octagon` refused · `42x42octagon` refused · `56x56octagon` refused
- `1x1random` refused · `2x2random` refused · `3x3random` refused · `4x4random` to `36x36random` quick · `54x54random` 0.1 s, slowest 0.2 · `72x72random` 0.9 s, slowest 2

Refused with:
- Width and height must both be greater than three.
- This board type needs each side to be 5, 7 or 9, and not both 5.
- This board type is only supported at 7×7.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## range

- `1x1` refused · `2x2` refused · `3x3` to `11x16` quick · `17x24` 0.7 s, slowest 0.8 · `22x32` 3 s, slowest 3 · `33x48` 27 s, slowest 27

Refused with:
- Width or height must be at least 3.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## rect

- `1x1` refused · `2x2` to `19x19` quick · `29x29` 0.1 s, slowest 0.1 · `38x38` 0.4 s, slowest 0.5 · `57x57` 2 s, slowest 2 · `76x76` 9 s, slowest 9 · `114x114` 44 s, slowest 44

Refused with:
- Grid area must be greater than one.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## rome

- `10x10de` quick · `15x15de` 0.3 s, slowest 0.3 · `20x20de` 0.8 s, slowest 0.9 · `30x30de` 5 s, slowest 5 · `40x40de` 22 s, slowest 22
- `10x10dn` quick · `15x15dn` 0.3 s, slowest 0.4 · `20x20dn` 1 s, slowest 1 · `30x30dn` 11 s, slowest 11
- `10x10dt` quick · `15x15dt` 0.4 s, slowest 0.5 · `20x20dt` 2 s, slowest 2 · `30x30dt` 12 s, slowest 12

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## salad

- `5n3Lde` to `10n3Lde` quick · `15n3Lde` 0.2 s, slowest 0.2 · `20n3Lde` 0.9 s, slowest 1 · `30n3Lde` 8 s, slowest 9 · `40n3Lde` 54 s, slowest 54
- `5n3Ldx` quick · `8n3Ldx` 1 s, slowest 4 · `10n3Ldx` 3 s, slowest 4 · `15n3Ldx` **no answer in 60 s**
- `7n4Lde` quick · `11n4Lde` quick · `14n4Lde` 0.2 s, slowest 0.2 · `21n4Lde` 1 s, slowest 1 · `28n4Lde` 7 s, slowest 7 · `42n4Lde` **no answer in 60 s**
- `7n4Ldx` 0.3 s, slowest 0.6 · `11n4Ldx` 11 s, slowest 16
- `8n5Lde` quick · `12n5Lde` quick · `16n5Lde` 0.3 s, slowest 0.3 · `24n5Lde` 3 s, slowest 3 · `32n5Lde` 15 s, slowest 15
- `8n5Ldx` 0.7 s, slowest 1 · `12n5Ldx` 34 s, slowest 34
- `6n3Bde` to `24n3Bde` quick · `36n3Bde` 0.4 s, slowest 0.6 · `48n3Bde` 2 s, slowest 2
- `6n3Bdx` 2 s, slowest 4 · `9n3Bdx` 2 s, slowest 4 · `12n3Bdx` **no answer in 60 s**
- `7n4Bde` to `14n4Bde` quick · `21n4Bde` 0.1 s, slowest 0.1 · `28n4Bde` 0.3 s, slowest 0.3 · `42n4Bde` 2 s, slowest 3 · `56n4Bde` 12 s, slowest 12
- `7n4Bdx` 0.9 s, slowest 2 · `11n4Bdx` 36 s, slowest 36
- `8n5Bde` to `16n5Bde` quick · `24n5Bde` 0.2 s, slowest 0.2 · `32n5Bde` 1 s, slowest 1 · `48n5Bde` 8 s, slowest 9 · `64n5Bde` 28 s, slowest 28
- `8n5Bdx` 1 s, slowest 2 · `12n5Bdx` 16 s, slowest 16

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## samegame

- `1x1c3s2` refused · `2x2c3s2` to `10x15c3s2` quick · `15x23c3s2` 0.8 s, slowest 2 · `20x30c3s2` 15 s, slowest 15, gave up on 1 of 1
- `1x1c4s2` refused · `2x2c4s2` to `60x80c4s2` quick · `90x120c4s2` 0.2 s, slowest 0.2 · `120x160c4s2` 1 s, slowest 2

Refused with:
- Grid area must be greater than one.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## seismic

- `8x8de` 0.3 s, slowest 0.6 · `12x12de` refused · `16x16de` refused · `24x24de` refused · `32x32de` refused · `48x48de` refused · `64x64de` refused
- `8x8dh` 1 s, slowest 2 · `12x12dh` refused · `16x16dh` refused · `24x24dh` refused · `32x32dh` refused · `48x48dh` refused · `64x64dh` refused
- `8x8Tde` 0.3 s, slowest 0.5 · `12x12Tde` refused · `16x16Tde` refused · `24x24Tde` refused · `32x32Tde` refused · `48x48Tde` refused · `64x64Tde` refused
- `8x8Tdh` 0.6 s, slowest 1 · `12x12Tdh` refused · `16x16Tdh` refused · `24x24Tdh` refused · `32x32Tdh` refused · `48x48Tdh` refused · `64x64Tdh` refused

Refused with:
- Width times height must be at most 64 in Seismic mode; the generator cannot reliably build a larger board.
- Width times height must be at most 100 in Tectonic mode; the generator cannot reliably build a larger board.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## separate

- `1x1n4` refused · `2x2n4` refused · `3x3n4` refused · `4x4n4` quick · `5x5n4` refused · `6x6n4` quick · `9x9n4` refused · `12x12n4` 39 s, slowest 39, gave up on 1 of 1
- `1x1n5` refused · `2x2n5` refused · `3x3n5` refused · `4x4n5` refused · `5x5n5` quick · `8x8n5` refused · `10x10n5` 21 s, slowest 21, gave up on 1 of 1
- `1x1n6` refused · `2x2n6` refused · `3x3n6` refused · `4x4n6` refused · `5x5n6` refused · `6x6n6` 0.6 s, slowest 2 · `9x9n6` refused · `12x12n6` 43 s, slowest 43, gave up on 1 of 1

Refused with:
- Number of letters must divide the grid area.
- Number of letters must be less than the grid area.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## signpost

- `1x1c` refused · `2x2c` to `11x11c` quick · `14x14c` 0.2 s, slowest 0.2 · `21x21c` 3 s, slowest 4 · `28x28c` 10 s, slowest 10, gave up on 1 of 1
- `1x1` refused · `2x2` to `10x10` quick · `15x15` 0.3 s, slowest 0.3 · `20x20` 1 s, slowest 2 · `30x30` 12 s, slowest 12, gave up on 1 of 1

Refused with:
- Width and height cannot both be one.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## singles

- `12x12de` 0.1 s, slowest 0.4 · `18x18de` 6 s, slowest 9 · `24x24de` 3 s, slowest 3, **no answer in 60 s**
- `12x12dk` 0.1 s, slowest 0.1 · `18x18dk` 0.2 s, slowest 0.4 · `24x24dk` 1 s, slowest 1 · `36x36dk` 11 s, slowest 11

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## sixteen

- `2x2` to `40x40` quick

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## slant

- `10x12de` quick · `15x18de` 0.1 s, slowest 0.1 · `20x24de` 0.2 s, slowest 0.2 · `30x36de` 2 s, slowest 2 · `40x48de` 10 s, slowest 12
- `10x12dh` quick · `15x18dh` 0.1 s, slowest 0.1 · `20x24dh` 0.6 s, slowest 0.6 · `30x36dh` 4 s, slowest 4 · `40x48dh` 16 s, slowest 16

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## slide

- `5x4m25` to `6x6m25` quick · `6x7m25` 0.3 s, slowest 0.5 · `9x11m25` refused · `12x14m25` refused · `18x21m25` refused · `24x28m25` refused · `36x42m25` refused · `48x56m25` refused
- `5x4u` to `6x6u` quick · `6x7u` 0.2 s, slowest 0.4 · `6x8u` 3 s, slowest 5 · `9x12u` refused · `12x16u` refused · `18x24u` refused · `24x32u` refused · `36x48u` refused · `48x64u` refused

Refused with:
- Width times height must be at most 48; the solver runs out of memory beyond that.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## sokoban

- `4x4` to `15x15` quick · `16x16` 0.1 s, slowest 0.1 · `16x17` quick · `16x18` 0.1 s, slowest 0.2 · `16x19` 0.1 s, slowest 0.2 · `16x20` 0.1 s, slowest 0.2 · `24x30` 1 s, slowest 3 · `32x40` refused · `48x60` refused · `64x80` refused · `96x120` refused · `128x160` refused

Refused with:
- Width times height must be at most 1200 to deal a level; a larger one takes too long to find.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 1 games at once; at its start, load 3.1, 0.7 GB free, swap total = 9216.00M  used = 8256.94M  free = 959.06M  (encrypted).

## solo

- `3x3` quick · `5x5` 2 s, slowest 5 · `6x6` refused · `9x9` refused · `12x12` refused · `18x18` refused · `24x24` refused
- `3x3db` quick · `5x5db` 2 s, slowest 3 · `6x6db` refused · `9x9db` refused · `12x12db` refused · `18x18db` refused · `24x24db` refused
- `3x3di` quick · `5x5di` 2 s, slowest 3 · `6x6di` refused · `9x9di` refused · `12x12di` refused · `18x18di` refused · `24x24di` refused
- `3x3da` 0.1 s, slowest 0.2 · `5x5da` 33 s, slowest 33
- `3x3de` quick · `5x5de` **no answer in 60 s**
- `3x3du` 0.2 s, slowest 0.3 · `5x5du` **no answer in 60 s**
- `3x3x` quick · `5x5x` 4 s, slowest 10
- `3x3xdb` quick · `5x5xdb` 1 s, slowest 4 · `6x6xdb` refused · `9x9xdb` refused · `12x12xdb` refused · `18x18xdb` refused · `24x24xdb` refused
- `3x3xdi` quick · `5x5xdi` 11 s, slowest 11
- `3x3xda` quick · `5x5xda` **no answer in 60 s**
- `3x3xde` quick · `5x5xde` **no answer in 60 s**
- `3x3xdu` quick · `5x5xdu` **no answer in 60 s**
- `9j` quick · `14x2` 2 s, slowest 5 · `18x2` refused · `27x3` refused · `36x4` refused · `54x6` refused · `72x8` refused
- `9jdb` quick · `14x2db` 6 s, slowest 12
- `9jdi` quick · `14x2di` 5 s, slowest 7 · `18x2di` refused · `27x3di` refused · `36x4di` refused · `54x6di` refused · `72x8di` refused
- `9jda` 0.1 s, slowest 0.1 · `14x2da` 60 s, slowest 60
- `9jde` quick · `14x2de` **no answer in 60 s**
- `9jdu` 0.1 s, slowest 0.2 · `14x2du` **no answer in 60 s**
- `3x3ka` quick · `5x5ka` refused · `6x6ka` refused · `9x9ka` refused · `12x12ka` refused · `18x18ka` refused · `24x24ka` refused
- `3x3kadb` quick · `5x5kadb` refused · `6x6kadb` refused · `9x9kadb` refused · `12x12kadb` refused · `18x18kadb` refused · `24x24kadb` refused
- `3x3kadi` quick · `5x5kadi` refused · `6x6kadi` refused · `9x9kadi` refused · `12x12kadi` refused · `18x18kadi` refused · `24x24kadi` refused
- `3x3kada` quick · `5x5kada` refused · `6x6kada` refused · `9x9kada` refused · `12x12kada` refused · `18x18kada` refused · `24x24kada` refused
- `3x3kade` 9 s, slowest 18
- `3x3kadu` 0.1 s, slowest 0.4 · `5x5kadu` refused · `6x6kadu` refused · `9x9kadu` refused · `12x12kadu` refused · `18x18kadu` refused · `24x24kadu` refused

Refused with:
- Columns times rows of sub-blocks must be at most 31.
- Killer puzzle dimensions must be smaller than 10.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## spokes

- `6x6de` quick · `9x9de` 0.2 s, slowest 0.3 · `12x12de` 1 s, slowest 1 · `18x18de` 13 s, slowest 13
- `6x6dt` 1 s, slowest 1 · `9x9dt` 37 s, slowest 37
- `6x6dh` 11 s, slowest 11

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## sticks

- `2x2b20s2` to `7x7b20s2` quick · `8x8b20s2` 0.1 s, slowest 0.2 · `9x9b20s2` 0.2 s, slowest 0.2 · `10x10b20s2` 0.4 s, slowest 0.4 · `15x15b20s2` **no answer in 60 s**

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## subsets

No size field.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## tents

- `15x15de` 0.1 s, slowest 0.1 · `23x23de` **no answer in 60 s**
- `15x15dt` 0.1 s, slowest 0.3 · `23x23dt` 25 s, slowest 45

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## towers

- `6de` quick · `9de` quick
- `6dh` quick · `9dh` 0.7 s, slowest 1
- `6dx` quick · `9dx` 2 s, slowest 3
- `6du` quick · `9du` 7 s, slowest 12

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## tracks

- `15x15de` quick · `23x23de` 0.3 s, slowest 0.6 · `30x30de` 1 s, slowest 2 · `45x45de` 2 s, slowest 2, gave up on 4 of 4 · `60x60de` 3 s, slowest 3, gave up on 4 of 4 · `90x90de` 5 s, slowest 5, gave up on 2 of 2 · `120x120de` 8 s, slowest 8, gave up on 2 of 2
- `15x15dt` 0.1 s, slowest 0.1 · `23x23dt` 0.6 s, slowest 0.8 · `30x30dt` 2 s, slowest 3, gave up on 2 of 4 · `45x45dt` 9 s, slowest 16, gave up on 1 of 2
- `15x15dh` 0.2 s, slowest 0.4 · `23x23dh` 1 s, slowest 1 · `30x30dh` 4 s, slowest 5 · `45x45dh` 2 s, slowest 2, gave up on 4 of 4 · `60x60dh` 3 s, slowest 3, gave up on 4 of 4 · `90x90dh` 5 s, slowest 5, gave up on 2 of 2 · `120x120dh` 8 s, slowest 8, gave up on 2 of 2

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## twiddle

- `1x1n2r` refused · `2x2n2r` to `24x24n2r` quick
- `1x1n2` refused · `2x2n2` to `32x32n2` quick
- `1x1n2o` refused · `2x2n2o` to `24x24n2o` quick
- `1x1n3` refused · `2x2n3` refused · `3x3n3` to `40x40n3` quick
- `1x1n4` refused · `2x2n4` refused · `3x3n4` refused · `4x4n4` to `48x48n4` quick

Refused with:
- Width must be at least the rotating block size.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## undead

- `7x7de` quick · `11x11de` refused · `14x14de` refused · `21x21de` refused · `28x28de` refused · `42x42de` refused · `56x56de` refused
- `7x7dn` quick · `11x11dn` refused · `14x14dn` refused · `21x21dn` refused · `28x28dn` refused · `42x42dn` refused · `56x56dn` refused
- `7x7dt` 0.1 s, slowest 0.3 · `11x11dt` refused · `14x14dt` refused · `21x21dt` refused · `28x28dt` refused · `42x42dt` refused · `56x56dt` refused

Refused with:
- Width times height must be at most 54.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## unequal

- `7dt` quick · `11dt` quick · `14dt` 0.1 s, slowest 0.1 · `21dt` 0.9 s, slowest 0.9 · `28dt` 5 s, slowest 6 · `31dt` 9 s, slowest 10
- `7de` quick · `11de` quick · `14de` 0.3 s, slowest 0.4 · `21de` 4 s, slowest 5 · `28de` 23 s, slowest 23
- `7dk` quick · `11dk` 0.6 s, slowest 0.7 · `14dk` 32 s, slowest 32
- `7dx` quick · `11dx` 1 s, slowest 2 · `14dx` 14 s, slowest 14
- `7dr` quick · `11dr` **no answer in 60 s**
- `7adt` to `14adt` quick · `21adt` 0.2 s, slowest 0.2 · `28adt` 0.8 s, slowest 0.8 · `31adt` 1 s, slowest 2
- `7ade` to `14ade` quick · `21ade` 0.6 s, slowest 0.6 · `28ade` 3 s, slowest 3 · `31ade` 5 s, slowest 5
- `7adk` quick · `11adk` 0.1 s, slowest 0.1 · `14adk` 2 s, slowest 2 · `21adk` **no answer in 60 s**
- `7adx` 0.1 s, slowest 0.2 · `11adx` 0.7 s, slowest 2 · `14adx` 4 s, slowest 5 · `21adx` **no answer in 60 s**
- `7adr` quick · `11adr` **no answer in 60 s**

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## unruly

- `14x14dt` quick · `21x21dt` refused · `28x28dt` 14 s, slowest 14
- `14x14de` quick · `21x21de` refused · `28x28de` 28 s, slowest 28
- `14x14dn` quick · `21x21dn` refused · `28x28dn` 24 s, slowest 24
- `8x8udt` quick · `12x12udt` quick · `16x16udt` 0.1 s, slowest 0.1 · `24x24udt` 2 s, slowest 3 · `32x32udt` **no answer in 60 s**
- `8x8ude` quick · `12x12ude` quick · `16x16ude` 0.1 s, slowest 0.1 · `24x24ude` 2 s, slowest 4 · `32x32ude` **no answer in 60 s**
- `8x8udn` quick · `12x12udn` quick · `16x16udn` 0.2 s, slowest 0.2 · `24x24udn` 4 s, slowest 6 · `32x32udn` 23 s, slowest 23

Refused with:
- Width and height must both be even.

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).

## untangle

- `4` to `75` quick · `100` 0.1 s, slowest 0.1 · `150` 0.2 s, slowest 0.4 · `200` 0.6 s, slowest 0.7

Dealt 2026-10-06: up to 4 deals a cell, a ladder ended by a deal over 10 s, a deal killed at 60 s, a 2048 MB heap, 3 games at once; at its start, load 3.2, 0.5 GB free, swap total = 10240.00M  used = 8740.31M  free = 1499.69M  (encrypted).
