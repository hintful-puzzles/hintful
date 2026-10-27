# Clusters

You're given a grid, with several dotted pieces on lighter squares. Your objective is to fill every empty space with one of two pieces, a {{pair:0}} square or a {{pair:1}} disc, while following these rules:

1. Tiles which are adjacent to 1 other tile of the same color are denoted with a dot. All of these tiles are given.
2. All other tiles must be adjacent to 2 or more tiles of the same color.

## Controls

{{controls}}

Drag from a square to paint every square you pass over the color the press gave the first one. Hold Shift while moving the cursor to paint the squares it passes over {{pair:1}}, Ctrl to paint them {{pair:0}}, or both to clear them.

## Where the puzzle comes from

This puzzle type was invented by Inaba Naoki under the name *クラスター*, or literally *Kurasuta*, which Google Translate names 'Cluster'. The original puzzles are available here: http://www.inabapuzzle.com/honkaku/kura.html

## Hints

**Hint** explains the next step rather than simply making it. Each step decides the color of one square, by showing that the other color would break a rule. It reasons from the dots and the squares you have colored, so it carries on from wherever you are.

{{hint-marks}}

On Normal boards one color can lead further before it fails. The hint then supposes the ringed square were that color, and outlines the squares it would force, each holding a small piece of the color it would take.

The rules a step shows breaking are the ones the puzzle states: a dot touches exactly one square of its own color, and every other square touches at least two. A square whose neighbors are all the other color, or that can only ever match one of them, can't be that color.

If a square you colored is the wrong color, the hint asks you to fix the highlighted mistakes first, and the square's background turns red, as it does for **Check & save**, whether or not it breaks a rule yet. The red frame is a different mark: it is drawn as you play, round a square or dot whose rule is broken, and that one may itself be right.

## Clusters parameters

{{parameters}}

Normal needs a board with room for the deeper reasoning, so it is not offered on very small grids.

