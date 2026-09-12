## MODIFIED Requirements

### Requirement: Guess descriptions are obfuscated solution bitmaps

The Guess `newDesc` SHALL draw a random color sequence (each peg uniformly from
`1..ncolors`, redrawing on a repeat when `allowMultiple` is false), encode it as
a byte-per-peg bitmap, apply the upstream `obfuscate_bitmap` SHA-1 masking, and
hex-encode the result. `validateDesc` SHALL reject a desc of wrong length or one whose
de-obfuscated bytes fall outside `1..ncolors`. `newState` SHALL recover the
solution by hex-decoding and de-obfuscating the desc.

#### Scenario: A description round-trips through obfuscation

- **WHEN** a solution sequence is obfuscated and hex-encoded to a desc, then that
  desc is hex-decoded and de-obfuscated by `newState`
- **THEN** the recovered solution equals the original sequence

#### Scenario: A corrupted description is rejected

- **WHEN** `validateDesc` is given a desc of the wrong length, or one that
  de-obfuscates to a color outside `1..ncolors`
- **THEN** it returns a non-null error string
