/**
 * Every position a breadth-first search has reached, each packed by the game
 * into a fixed number of 32-bit words, in the order it reached them, with an
 * open-addressed index for "have I seen this position?" and the parent link
 * that reads a line back out.
 *
 * A search that stores its positions as objects keyed by a string pays for the
 * string and the object at every node: measured on Sixteen 5×5, about 2 µs a
 * board, where a search that crosses the endgame visits two million. Here a
 * position is a run of words in one shared pool, addressed by index, and a
 * successor is packed into one buffer the caller reuses, so a search allocates
 * nothing per position.
 *
 * Positions are appended level by level, so a level's frontier is the
 * contiguous index range the level before it appended, and the store needs no
 * frontier array.
 *
 * `parent`, `move` and `depth` are public for the caller's line
 * reconstruction. `move` is whatever the caller numbers its moves by, `-1` at
 * the root.
 *
 * Memory: a position costs `words` + 3 words in the pools, plus up to two slots
 * in the index.
 */
export class PositionStore {
  count = 0;
  parent: Int32Array;
  move: Int32Array;
  depth: Int32Array;
  private positions: Int32Array;
  private capacity = 1 << 12;
  /** Slot → position index + 1; 0 means empty. Linear probing, grown at half full. */
  private table = new Int32Array(1 << 13);
  private mask = this.table.length - 1;

  constructor(readonly words: number) {
    this.positions = new Int32Array(this.capacity * words);
    this.parent = new Int32Array(this.capacity);
    this.move = new Int32Array(this.capacity);
    this.depth = new Int32Array(this.capacity);
  }

  /** The position stored with the words of `packed`, or -1. `hash` is
   * {@link hashWords} of them. */
  find(packed: Int32Array, hash: number): number {
    const words = this.words;
    for (let slot = hash & this.mask; ; slot = (slot + 1) & this.mask) {
      const entry = this.table[slot];
      if (entry === 0) return -1;
      const base = (entry - 1) * words;
      let same = true;
      for (let k = 0; k < words; k++) {
        if (this.positions[base + k] !== packed[k]) {
          same = false;
          break;
        }
      }
      if (same) return entry - 1;
    }
  }

  /** Append the position `packed` holds, and return its index. */
  add(
    packed: Int32Array,
    hash: number,
    parent: number,
    move: number,
    depth: number,
  ): number {
    if (this.count === this.capacity) this.growPools();
    if (this.count * 2 >= this.table.length) this.growTable();

    const words = this.words;
    const index = this.count++;
    const base = index * words;
    for (let k = 0; k < words; k++) this.positions[base + k] = packed[k];
    this.parent[index] = parent;
    this.move[index] = move;
    this.depth[index] = depth;
    this.insert(hash, index);
    return index;
  }

  /** Copy position `index`'s words into `out`. */
  read(index: number, out: Int32Array): void {
    const base = index * this.words;
    for (let k = 0; k < this.words; k++) out[k] = this.positions[base + k];
  }

  /** The moves from the root to position `index`, in the order they are made. */
  lineTo(index: number): number[] {
    const line: number[] = [];
    for (let i = index; i >= 0 && this.move[i] >= 0; i = this.parent[i]) {
      line.push(this.move[i]);
    }
    return line.reverse();
  }

  private insert(hash: number, index: number): void {
    let slot = hash & this.mask;
    while (this.table[slot] !== 0) slot = (slot + 1) & this.mask;
    this.table[slot] = index + 1;
  }

  private growPools(): void {
    this.capacity *= 2;
    const positions = new Int32Array(this.capacity * this.words);
    positions.set(this.positions);
    this.positions = positions;
    this.parent = grown(this.parent, this.capacity);
    this.move = grown(this.move, this.capacity);
    this.depth = grown(this.depth, this.capacity);
  }

  private growTable(): void {
    this.table = new Int32Array(this.table.length * 2);
    this.mask = this.table.length - 1;
    const words = this.words;
    for (let i = 0; i < this.count; i++) {
      this.insert(hashWords(this.positions, i * words, words), i);
    }
  }
}

/** FNV-1a over `count` words of `words` from `offset`, unsigned. */
export function hashWords(words: Int32Array, offset: number, count: number): number {
  let hash = 0x811c9dc5;
  for (let k = 0; k < count; k++) {
    hash ^= words[offset + k];
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

function grown(from: Int32Array, length: number): Int32Array {
  const to = new Int32Array(length);
  to.set(from);
  return to;
}
