import { consume } from "@lit/context";
import { SignalWatcher } from "@lit-labs/signals";
import { css, html, LitElement, nothing } from "lit";
import { customElement, eventOptions, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import type { KeyLabel } from "../../engine/types.ts";
import { cssColorToOKLCH } from "../../utils/color.ts";
import { cssWATweaks } from "../../utils/css.ts";
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

    // If >5 keys, divide into two equal groups for better wrapping
    const split =
      this.columns === null && this.keys.length > 5
        ? Math.floor(this.keys.length / 2)
        : this.keys.length;
    const keyGroups = [this.keys.slice(0, split), this.keys.slice(split)];
    const groups = keyGroups
      .filter((keys) => keys.length > 0)
      .map(
        (keys) => html`
          <div
              part="group"
              style=${this.columns === null ? nothing : `--columns: ${this.columns}`}
            >${keys.map(this.renderVirtualKey)}</div>`,
      );

    // Activate virtual keys on touchstart for better responsiveness in rapid "typing".
    // But also handle click for keyboard activation (if a virtual key somehow gets focus).
    return html`
      <div
          part="base"
          class=${this.columns === null ? "rows" : "grid"}
          @click=${this.handleButtonPress}
          @mousedown=${keepFocusOnTheBoard}
          @touchstart=${this.handleButtonPress}
        >${groups}</div>
    `;
  }

  private renderVirtualKey = (key: KeyLabel) => {
    const label = key.label;
    const icon = this.labelIcons[label];
    const fill = this.swatchFill(key);
    const classes = classMap({
      single: !this.labeled && (icon || label.length === 1),
      swatch: fill !== null,
    });
    const content = !icon
      ? label
      : this.labeled
        ? html`<wa-icon slot="start" name=${icon}></wa-icon>${label}`
        : html`<wa-icon name=${icon} label=${label}></wa-icon>`;
    // Exclude virtual keys from keyboard navigation
    // (they're not helpful for a keyboard user).
    return html`
      <wa-button
          class=${classes}
          style=${fill === null ? nothing : swatchProperties(fill)}
          data-button=${key.button}
          tabindex="-1"
        >${content}</wa-button>
    `;
  };

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

      .swatch::part(base) {
        /* A default wa-button's border is transparent; a key painted in a pale
         * board color needs an edge to read as a key. */
        border-color: var(--swatch-edge);
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
