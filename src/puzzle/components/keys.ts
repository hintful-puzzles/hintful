import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { KeyLabel, KeyStatus } from "../../engine/contract/types.ts";
import { PENCIL_MODE_BUTTON } from "../../engine/input/pointer.ts";
import { cssColorToOKLCH } from "../../utils/color.ts";
import { cssStackedButton, cssWATweaks } from "../../utils/css.ts";
import { puzzleContext } from "../contexts.ts";
import type { Puzzle } from "../puzzle.ts";

// Components
import "@awesome.me/webawesome/dist/components/button/button.js";
import "@awesome.me/webawesome/dist/components/icon/icon.js";

interface LabelIcons {
  [label: string]: string;
}

/**
 * Stop a key press moving focus off the board.
 *
 * The board listens for `keydown` on **itself** (`view-interactive.ts`), so
 * whatever holds focus decides whether a physical key reaches the game. A
 * `mousedown` focuses the button it lands on, which left every keypad game in
 * the collection deaf to the keyboard from the first on-screen key a player
 * clicked until they clicked the board again — panel and keyboard are the same
 * input, and using one should not switch the other off.
 *
 * `mousedown` rather than `pointerdown`: iOS Safari generates a click from a
 * prevented `pointerdown` anyway, and a touch press is already answered on
 * `touchstart` by {@link PuzzleKeys.handleButtonPress}. Preventing the default
 * here suppresses the focus, not the click.
 */
function keepFocusOnTheBoard(event: MouseEvent): void {
  event.preventDefault();
}

/**
 * The Web Awesome tokens that paint a key in `fill`, with a readable label on
 * top of it.
 *
 * The ink is chosen from the fill's own lightness rather than fixed: a palette
 * is authored per color scheme, and a fill light enough to take black text in
 * one scheme is not in the other. The same value borders the key, because a
 * default `wa-button` draws a transparent border and a pale fill against a
 * pale panel would otherwise have no edge at all.
 */
function swatchProperties(fill: string): string {
  const ink = cssColorToOKLCH(fill)[0] > 0.6 ? "black" : "white";
  return `--wa-color-fill-loud: ${fill}; --wa-color-on-loud: ${ink}; --swatch-edge: ${ink};`;
}

/** Whether a keypad declares its keys' rows (`KeyLabel.row`), and is drawn as
 * a keyboard. */
export function isKeyboard(keys: readonly KeyLabel[]): boolean {
  return keys.some((key) => key.row !== undefined);
}

/** A keyboard's keys, a list a row, in the order each row's keys were given. */
function keyboardRows(keys: readonly KeyLabel[]): KeyLabel[][] {
  const rows: KeyLabel[][] = [];
  for (const key of keys) {
    const row = key.row ?? 0;
    rows[row] = [...(rows[row] ?? []), key];
  }
  return rows;
}

/**
 * A virtual keyboard for the puzzle: the keys it is given, drawn as buttons
 * that send each key's code to the game. Which keys a game has, and when they
 * change, is `game-controls.ts`'s to know.
 */
@customElement("puzzle-keys")
export class PuzzleKeys extends SignalWatcher(LitElement) {
  @consume({ context: puzzleContext, subscribe: true })
  @state()
  private puzzle?: Puzzle;

  // Maps KeyLabel.label to wa-icon name
  static defaultLabelIcons: LabelIcons = {
    Clear: "key-clear",
    Marks: "key-marks",
    Hints: "key-hints",
  };

  @property({ type: Object })
  labelIcons: LabelIcons = PuzzleKeys.defaultLabelIcons;

  @property({ attribute: false })
  keys: readonly KeyLabel[] = [];

  /**
   * Lay the keys out as a grid of this many columns. `null` leaves them in
   * rows that wrap to the width they are given.
   */
  @property({ type: Number })
  columns: number | null = null;

  /** Write each key's label beside its icon: for a key that is a mode and not
   * a character, which a player has to be able to read. */
  @property({ type: Boolean, reflect: true })
  labeled = false;

  protected override render() {
    if (this.keys.length === 0) {
      return nothing;
    }

    const keyboard = isKeyboard(this.keys);
    const groups = (keyboard ? keyboardRows(this.keys) : this.keyGroups())
      .filter((keys) => keys.length > 0)
      .map(
        (keys) => html`
          <div
              part="group"
              style=${keyboard || this.columns === null ? nothing : `--columns: ${this.columns}`}
            >${keys.map(this.renderVirtualKey)}</div>`,
      );
    const layout = keyboard ? "keyboard" : this.columns === null ? "rows" : "grid";

    // Activate virtual keys on touchstart for better responsiveness in rapid "typing".
    // But also handle click for keyboard activation (if a virtual key somehow gets focus).
    return html`
      <div
          part="base"
          class=${layout}
          @click=${this.handleButtonPress}
          @mousedown=${keepFocusOnTheBoard}
          @touchstart=${this.handleButtonPress}
        >${groups}</div>
    `;
  }

  /** Without rows, more than five keys divide into two equal groups, for
   * better wrapping. */
  private keyGroups(): KeyLabel[][] {
    const split =
      this.columns === null && this.keys.length > 5
        ? Math.floor(this.keys.length / 2)
        : this.keys.length;
    return [this.keys.slice(0, split), this.keys.slice(split)];
  }

  private renderVirtualKey = (key: KeyLabel) => {
    const label = key.label;
    const icon = this.labelIcons[label];
    const status = this.statusOf(key);
    const look = status === null || status.look === "faint" ? null : status;
    const fill =
      look?.look === "fill" ? this.paletteColor(look.swatch) : this.swatchFill(key);
    const disc = look?.look === "disc" ? this.paletteColor(look.swatch) : null;
    const mode = this.modeIn(key);
    const classes = classMap({
      single: !this.labeled && (icon || label.length === 1),
      stacked: this.labeled && Boolean(icon),
      wide: label.length > 1,
      swatch: fill !== null,
      faint: status?.look === "faint",
      "mode-on": mode === true,
    });
    const text = !icon
      ? label
      : this.labeled
        ? html`<span class="stack">
            <wa-icon name=${icon}></wa-icon><span>${label}</span>
          </span>`
        : html`<wa-icon name=${icon} label=${label}></wa-icon>`;
    const content =
      disc === null
        ? text
        : html`<span class="disc" style=${swatchProperties(disc)}>${text}</span>`;
    // The state is part of the key's name, not an `aria-pressed`: `wa-button`
    // draws its own `<button>` and passes no `aria-pressed` on to it.
    const spoken = mode === null ? status?.spoken : mode ? "on" : "off";
    const state =
      spoken === undefined ? nothing : html`<span class="spoken">${spoken}</span>`;
    // Exclude virtual keys from keyboard navigation
    // (they're not helpful for a keyboard user).
    return html`
      <wa-button
          class=${classes}
          style=${fill === null ? nothing : swatchProperties(fill)}
          data-button=${key.button}
          tabindex="-1"
        >${content}${state}</wa-button>
    `;
  };

  /** What the board has shown of this key's value, or `null`: read off the
   * game's own `keyStatus` through the `Puzzle`, never kept here. */
  private statusOf(key: KeyLabel): KeyStatus | null {
    return this.puzzle?.keyStatus.find((s) => s.button === key.button) ?? null;
  }

  private paletteColor(index: number): string | null {
    return this.puzzle?.palette[index] ?? null;
  }

  /**
   * The CSS color a key with a `swatch` is painted in, or `null` for an
   * ordinary key.
   *
   * Read off `puzzle.palette` — the very array the canvas is painted from —
   * so a key cannot drift from the board when the color scheme flips. Before
   * the first palette arrives the key renders plain rather than guessing.
   */
  private swatchFill(key: KeyLabel): string | null {
    if (key.swatch === undefined) return null;
    return this.puzzle?.palette[key.swatch] ?? null;
  }

  /**
   * Whether the mode a key toggles is on, or `null` for a key that types.
   *
   * Read off the game's own `Ui` through `puzzle.pencilMode`, never kept here:
   * a right press, the P shortcut and Right-click mode flip the mode without
   * this key, and a copy would show the mode as the key last left it.
   */
  private modeIn(key: KeyLabel): boolean | null {
    if (key.button !== PENCIL_MODE_BUTTON) return null;
    return this.puzzle?.pencilMode ?? false;
  }

  @eventOptions({ passive: false })
  private async handleButtonPress(event: PointerEvent | TouchEvent) {
    // Delegated listener for both touchstart and click events.
    // (On touch devices, preventDefault on touchstart will avoid a later click event.
    // This must be installed on touchstart rather than pointerdown, because it's
    // impossible on iOS Safari to prevent a pointerdown from generating a click.)
    if (!(event.target instanceof HTMLElement)) {
      return;
    }
    const target = event.target.closest("[data-button]");
    const dataButton = target?.getAttribute("data-button") ?? null;
    if (dataButton !== null) {
      event.preventDefault();
      const button = Number.parseInt(dataButton, 10);
      if (!Number.isNaN(button)) {
        await this.puzzle?.processKey(button);
      } else if (!import.meta.env.PROD) {
        throw new Error(`Invalid data-button="${dataButton}"`);
      }
    }
  }

  static override styles = [
    cssWATweaks,
    cssStackedButton,
    css`
      :host {
        display: contents;
      }
      
      [part~="base"] {
        --gap: var(--wa-space-s);

        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: var(--gap);
      }
  
      [part~="group"] {
        display: flex;
        gap: var(--gap);
      }

      /* A labeled key fills the width it is given, as a button beside it
       * does. */
      :host([labeled]) [part~="base"],
      :host([labeled]) [part~="group"] {
        display: grid;
        justify-content: stretch;
      }
      :host([labeled]) wa-button {
        width: 100%;
      }

      .grid [part~="group"] {
        display: grid;
        grid-template-columns: repeat(var(--columns), auto);
        justify-content: center;
      }
  
      .single {
        /* Make all single-char buttons the same width, for uniform layout.
         * (This cheats the horizontal padding just a bit.) */
        width: var(--wa-form-control-height);
      }

      /* A keyboard: a line a row, never wrapped, ten keys of the usual size
       * wide where there is room (a side column takes its content's width),
       * and shrinking with the width where there is not, so a phone fits ten
       * to a row. */
      .keyboard {
        --gap: var(--wa-space-2xs);
        --key: var(--wa-form-control-height);

        flex-direction: column;
        flex-wrap: nowrap;
        align-items: stretch;
        width: calc(10 * var(--key) + 9 * var(--gap));
        max-width: 100%;
      }
      .keyboard [part~="group"] {
        justify-content: center;
      }
      .keyboard wa-button {
        flex: 1 1 0;
        min-width: 0;
        max-width: var(--key);
      }
      .keyboard wa-button::part(base) {
        padding-inline: 0;
      }
      .keyboard .single {
        width: auto;
      }
      .keyboard .wide {
        flex-grow: 1.5;
        max-width: calc(1.5 * var(--key));
      }
      /* The label alone: a key's height is in ems of its own font. */
      .keyboard .wide::part(label) {
        font-size: var(--wa-font-size-xs);
      }

      /* A value the board has scored somewhere in it: a disc behind the
       * label, as the board draws one. */
      .disc {
        display: inline-grid;
        place-items: center;
        width: 1.6em;
        height: 1.6em;
        border-radius: 50%;
        background-color: var(--wa-color-fill-loud);
        color: var(--wa-color-on-loud);
      }

      /* A value the board has shown is not there: faint, as the board's ink
       * for it is. */
      .faint::part(label) {
        opacity: 0.35;
      }

      .swatch::part(base) {
        /* A default wa-button's border is transparent; a key painted in a pale
         * board color needs an edge to read as a key. */
        border-color: var(--swatch-edge);
      }

      /* A mode in force changes what every tap on the board does, so it is
       * filled as the bar's Right-click mode is. */
      .mode-on::part(base) {
        background-color: var(--wa-color-brand-fill-loud);
        border-color: var(--wa-color-brand-fill-loud);
        color: var(--wa-color-brand-on-loud);
      }

      /* Read out and not drawn: the fill shows the same thing. */
      .spoken {
        position: absolute;
        width: 1px;
        height: 1px;
        overflow: hidden;
        clip-path: inset(50%);
        white-space: nowrap;
      }
      
      wa-button {
        /* Disable double-tap to zoom on keys that might be tapped quickly.
         * (Ineffective in iOS Safari; see preventDoubleTapZoomOnButtons.) */
        touch-action: pinch-zoom;
      }
    `,
  ];
}

declare global {
  interface HTMLElementTagNameMap {
    "puzzle-keys": PuzzleKeys;
  }
}
