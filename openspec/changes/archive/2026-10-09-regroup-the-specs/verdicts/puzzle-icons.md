# Verdicts: puzzle-icons

## keep `puzzle-icons`: The d8 suffix stays in the icon filenames

Not the owner's: it is internal form, and the tree answers it. The names are
read by reference in four places that would all move together
(`src/components/catalog-card.ts`, `src/puzzle/icon-capture.ts`,
`vite.config.ts` and `scripts/new-game-port.sh`), and the catalog imports the
files through Vite, so no player holds a path to one. A rename is therefore
possible, and it buys a player nothing while touching two files a puzzle. The
requirement is what tells a session that the odd suffix is known and is to be
left (`icon-capture.ts` calls it a legacy), and its second sentence is live
guidance for every new icon: a PNG24 still takes the suffix.

## keep `puzzle-icons`: Nothing under src/assets is generated

The wider rule is one a session is held to: adding a build step that writes
into `src/` and ignoring its output is the move it refuses, and `.gitignore`
agrees today (every ignored path is outside `src/`, and its comment on the
icons says nothing generates into that directory). The overlap with
"Per-puzzle thumbnail icons are committed PNGs" is one clause about the icons;
this requirement is about the whole of `src/assets/` and `src/`.

## keep `puzzle-icons`: The capture bar re-rolls the board and captures both icons

The crop is a decision and not an accident of the code: it is what a committed
icon is a picture of (the largest centered square of the board, scaled, and
not the board squashed or letterboxed), so it decides how every non-square
puzzle's icon looks. `src/puzzle/icon-capture.ts` does exactly this, and
nothing else says it was meant. The rest is what a control does.
