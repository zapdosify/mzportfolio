// EMBERDEEP character layer: the page side of the game-to-page handoff.
//
// The game (scripts/portfolio/web_bridge.gd, in an iframe on the same origin)
// posts `emberdeep:exit` when Ilva walks off the landing's open edge. This layer
// draws the same sheet frame at the same place over the page and keeps her
// walking with the keys that were already held. Walking her back onto the floor
// across its open front edges, Escape, or the "return" button hands her back
// (`emberdeep:return`).
// The touch controls drive whichever side owns her.
//
// Ported unchanged from the game repo's web/portfolio/site/character-layer.js —
// only types were added. The message contract is documented in that repo's
// web/portfolio/README.md; change the two sides together or not at all.
// Its class names (`ilva-*`) are styled globally in character-layer.css.

type Facing = "E" | "SE" | "S" | "SW" | "W" | "NW" | "N" | "NE";
type SheetKind = "walk" | "idle" | "run";
type Point = { x: number; y: number };

interface Sheet {
  file: string;
  frames: number;
  frame_width: number;
  frame_height: number;
  figure_px: number;
  offset: [number, number];
}

interface Manifest {
  idle_fps: number;
  stride_per_height: number;
  run_stride_factor: number;
  facings: Record<string, Partial<Record<SheetKind, Sheet>>>;
}

interface ExitMessage {
  type: "emberdeep:exit";
  facing: Facing;
  sheet: SheetKind;
  frame: number;
  frame_size: [number, number];
  figure_px: number;
  box: [number, number, number, number];
  foot: [number, number];
  input: [number, number];
  held: string[];
  touch: boolean;
  running: boolean;
  heights_per_second: number;
  run_multiplier: number;
  phase?: number;
  vertical_scale: number;
  floor?: [number, number][];
}

/** The part of the site's smooth-scroll engine the layer uses. */
export interface ScrollEngine {
  scrollTo(target: number, options: { immediate: boolean }): void;
}

export type LayerState = "idle" | "loading" | "game" | "outside";

export interface CharacterLayerOptions {
  /** the game's iframe (same origin) */
  iframe: HTMLIFrameElement;
  /** folder with manifest.json and the sheets */
  spriteBase: string;
  returnButton?: HTMLElement | null;
  /** live region for short announcements */
  status?: HTMLElement | null;
  onState?: (state: LayerState) => void;
  /** site smooth-scroll, if any */
  lenis?: ScrollEngine | null;
}

const FACINGS: Facing[] = ["E", "SE", "S", "SW", "W", "NW", "N", "NE"];
const HYSTERESIS = (12 * Math.PI) / 180;
const SETTLE = 0.14;
const KEYMAP: Record<string, string> = {
  ArrowLeft: "move_left", KeyA: "move_left",
  ArrowRight: "move_right", KeyD: "move_right",
  ArrowUp: "move_up", KeyW: "move_up",
  ArrowDown: "move_down", KeyS: "move_down",
};

function facingFor(angle: number, current: Facing | null): Facing {
  // Sector i is centred on i * 45 degrees (screen space, y down: 45 = SE).
  const index = ((Math.round(angle / (Math.PI / 4)) % 8) + 8) % 8;
  const candidate = FACINGS[index];
  if (!current || candidate === current) return candidate;
  const centre = FACINGS.indexOf(current) * (Math.PI / 4);
  const gap = Math.abs(((angle - centre + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI);
  return gap > Math.PI / 8 + HYSTERESIS ? candidate : current;
}

export class CharacterLayer {
  iframe: HTMLIFrameElement;
  spriteBase: string;
  returnButton: HTMLElement | null;
  statusRegion: HTMLElement | null;
  onState: (state: LayerState) => void;
  lenis: ScrollEngine | null;
  state: LayerState = "idle";
  manifest: Manifest | null = null;
  held = new Set<string>();
  touch = { x: 0, y: 0, run: false, active: false };
  shift = false;
  velocity: Point = { x: 0, y: 0 };

  layer!: HTMLDivElement;
  actor!: HTMLDivElement;
  sprite!: HTMLDivElement;
  prompt!: HTMLDivElement;

  private _raf = 0;
  private _last = 0;
  private _hideTimer: ReturnType<typeof setTimeout> | undefined;
  private _lastTouchSent = "";
  private _manifestLoad: Promise<Manifest> | null = null;

  private exit!: ExitMessage;
  private heightFraction = 0;
  private facing: Facing = "SE";
  private kind: SheetKind = "walk";
  private phase = 0;
  private idleClock = 0;
  private settle = 0;
  private frameIndex = 0;
  private pos: Point = { x: 0, y: 0 };
  private correction: Point = { x: 0, y: 0 };
  private armed = false;
  private verticalScale = 1;
  private target: HTMLElement | null = null;

  constructor(options: CharacterLayerOptions) {
    this.iframe = options.iframe;
    this.spriteBase = options.spriteBase.replace(/\/$/, "");
    this.returnButton = options.returnButton || null;
    this.statusRegion = options.status || null;
    this.onState = options.onState || (() => {});
    this.lenis = options.lenis || null;
    this._frame = this._frame.bind(this);
    this._onMessage = this._onMessage.bind(this);
    this._onKey = this._onKey.bind(this);
    this._onPageKeyUp = this._onPageKeyUp.bind(this);
    this._onReturnClick = this._onReturnClick.bind(this);
    window.addEventListener("message", this._onMessage);
    // A key held while she walked back in may be let go before the game has
    // focus; the release is forwarded so she never walks on by herself.
    window.addEventListener("keyup", this._onPageKeyUp);
    this._build();
  }

  destroy() {
    window.removeEventListener("message", this._onMessage);
    window.removeEventListener("keyup", this._onPageKeyUp);
    // The site reuses one return button across remounts; the prototype never
    // had to let go of it.
    this.returnButton?.removeEventListener("click", this._onReturnClick);
    cancelAnimationFrame(this._raf);
    clearTimeout(this._hideTimer);
    if (this.target) this.target.classList.remove("is-ilva-target");
    this.layer.remove();
  }

  async preload(): Promise<Manifest> {
    if (this.manifest) return this.manifest;
    // One fetch even when `ready` and `exit` arrive back to back.
    this._manifestLoad ??= fetch(`${this.spriteBase}/manifest.json`).then((r) => r.json());
    this.manifest = await this._manifestLoad;
    for (const facing of Object.values(this.manifest.facings)) {
      for (const sheet of Object.values(facing)) {
        if (!sheet) continue;
        const image = new Image();
        image.src = `${this.spriteBase}/${sheet.file}`;
      }
    }
    return this.manifest;
  }

  // --- DOM ---------------------------------------------------------------

  private _build() {
    this.layer = document.createElement("div");
    this.layer.className = "ilva-layer";
    this.layer.setAttribute("aria-hidden", "true");
    this.actor = document.createElement("div");
    this.actor.className = "ilva-actor";
    this.actor.tabIndex = -1;
    this.actor.setAttribute("role", "application");
    this.actor.setAttribute("aria-label", "Ilva, walking on the page. Arrow keys or WASD to walk, Shift to run, E to use, Escape to send her back to the inn.");
    this.sprite = document.createElement("div");
    this.sprite.className = "ilva-sprite";
    this.prompt = document.createElement("div");
    this.prompt.className = "ilva-prompt";
    this.actor.append(this.sprite, this.prompt);
    this.layer.append(this.actor);
    document.body.append(this.layer);
    this.actor.addEventListener("keydown", this._onKey);
    this.actor.addEventListener("keyup", this._onKey);
    this.actor.addEventListener("blur", () => {
      // Keys no longer reach her: she stops rather than walking on for ever.
      this.held.clear();
      this.shift = false;
      if (this.state === "outside") this.actor.classList.add("is-waiting");
    });
    this.actor.addEventListener("focus", () => this.actor.classList.remove("is-waiting"));
    this.sprite.addEventListener("pointerdown", (event) => {
      event.preventDefault();
      this.actor.focus({ preventScroll: true });
    });
    if (this.returnButton) {
      this.returnButton.addEventListener("click", this._onReturnClick);
    }
  }

  private _onReturnClick() {
    this.sendBack(null);
  }

  private _setState(state: LayerState) {
    this.state = state;
    // The other side has not seen the joystick yet.
    this._lastTouchSent = "";
    this.layer.dataset.state = state;
    this.layer.setAttribute("aria-hidden", state === "outside" ? "false" : "true");
    if (this.returnButton) this.returnButton.hidden = state !== "outside";
    this.onState(state);
  }

  private _announce(text: string) {
    if (this.statusRegion) this.statusRegion.textContent = text;
  }

  // --- messages ----------------------------------------------------------

  private _post(message: Record<string, unknown>) {
    const target = this.iframe && this.iframe.contentWindow;
    if (target) target.postMessage(JSON.stringify(message), window.location.origin);
  }

  private _onMessage(event: MessageEvent) {
    if (event.origin !== window.location.origin) return;
    if (!this.iframe || event.source !== this.iframe.contentWindow) return;
    let message: { type?: string };
    try {
      message = JSON.parse(event.data);
    } catch {
      return;
    }
    switch (message.type) {
      case "emberdeep:progress":
      case "emberdeep:booting":
        if (this.state === "idle") this._setState("loading");
        break;
      case "emberdeep:started":
      case "emberdeep:ready":
        if (this.state !== "outside") this._setState("game");
        this.preload();
        break;
      case "emberdeep:exit":
        this._receive(message as ExitMessage);
        break;
      case "emberdeep:returned":
        this._hide();
        break;
      default:
        break;
    }
  }

  // --- game -> page --------------------------------------------------------

  private async _receive(exit: ExitMessage) {
    await this.preload();
    const rect = this.iframe.getBoundingClientRect();
    const boxHeight = (exit.box[3] - exit.box[1]) * rect.height;
    // Body heights on screen, as a fraction of the game's height, so she keeps
    // the game's scale if the page is resized while she is out.
    this.heightFraction = (boxHeight * exit.figure_px) / exit.frame_size[1] / rect.height;
    this.exit = exit;
    this.facing = exit.facing;
    this.kind = exit.sheet;
    this.phase = exit.phase || 0;
    this.idleClock = 0;
    this.settle = 0;
    this.frameIndex = exit.frame;
    this.pos = {
      x: rect.left + window.scrollX + exit.foot[0] * rect.width,
      y: rect.top + window.scrollY + exit.foot[1] * rect.height,
    };
    // Where the game drew the frame, against where the sheet anchor puts it:
    // kept for the whole walk so the first page frame lands exactly on the last
    // game frame.
    const sheet = this._sheet();
    const texel = this._texel(sheet);
    const drawnLeft = rect.left + window.scrollX + exit.box[0] * rect.width;
    const drawnTop = rect.top + window.scrollY + exit.box[1] * rect.height;
    const anchor = this._anchor(sheet);
    this.correction = {
      x: drawnLeft - (this.pos.x - anchor.x * texel),
      y: drawnTop - (this.pos.y - anchor.y * texel),
    };
    const speed = exit.heights_per_second;
    this.velocity = {
      x: exit.input[0] * speed,
      y: exit.input[1] * speed * exit.vertical_scale,
    };
    this.held = new Set(exit.touch ? [] : exit.held);
    this.shift = exit.running && !exit.touch;
    this.armed = false;
    this.verticalScale = exit.vertical_scale;
    this._setState("outside");
    this._draw();
    this.actor.focus({ preventScroll: true });
    this._announce("Ilva stepped out of the inn and onto the page. Escape sends her back.");
    this._last = performance.now();
    cancelAnimationFrame(this._raf);
    this._raf = requestAnimationFrame(this._frame);
  }

  private _sheet(): Sheet {
    const facings = this.manifest!.facings;
    const facing = facings[this.facing] || facings.SE;
    return (facing[this.kind] || facing.walk)!;
  }

  private _unit() {
    return this.heightFraction * this.iframe.getBoundingClientRect().height;
  }

  private _texel(sheet: Sheet) {
    return this._unit() / sheet.figure_px;
  }

  private _anchor(sheet: Sheet): Point {
    return {
      x: sheet.frame_width / 2 + sheet.offset[0],
      y: sheet.frame_height / 2 + sheet.offset[1],
    };
  }

  // --- the walk ----------------------------------------------------------

  private _input() {
    let x = 0;
    let y = 0;
    if (this.touch.active) {
      x = this.touch.x;
      y = this.touch.y;
    } else {
      x = (this.held.has("move_right") ? 1 : 0) - (this.held.has("move_left") ? 1 : 0);
      y = (this.held.has("move_down") ? 1 : 0) - (this.held.has("move_up") ? 1 : 0);
    }
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    return { x, y, running: this.touch.active ? this.touch.run : this.shift };
  }

  private _frame(now: number) {
    if (this.state !== "outside") return;
    const delta = Math.min(0.05, (now - this._last) / 1000);
    this._last = now;
    const exit = this.exit;
    const unit = this._unit();
    const input = this._input();
    const top = exit.heights_per_second * (input.running ? exit.run_multiplier : 1);
    // The game's vertical speed is foreshortened; the flat page eases to full
    // speed over her first second outside.
    this.verticalScale = Math.min(1, this.verticalScale + delta * (1 - exit.vertical_scale));
    const target = { x: input.x * top, y: input.y * top * this.verticalScale };
    const accel = (Math.hypot(target.x, target.y) > 0.01 ? 9 : 12) * exit.heights_per_second;
    const dx = target.x - this.velocity.x;
    const dy = target.y - this.velocity.y;
    const gap = Math.hypot(dx, dy);
    const step = Math.min(gap, accel * delta);
    if (gap > 0) {
      this.velocity.x += (dx / gap) * step;
      this.velocity.y += (dy / gap) * step;
    }
    const before = { x: this.pos.x, y: this.pos.y };
    this.pos.x += this.velocity.x * unit * delta;
    this.pos.y += this.velocity.y * unit * delta;
    // The page is her floor: its edges are walls.
    const doc = document.documentElement;
    const margin = unit * 0.25;
    this.pos.x = Math.min(Math.max(this.pos.x, margin), doc.scrollWidth - margin);
    this.pos.y = Math.min(Math.max(this.pos.y, unit * 0.9), doc.scrollHeight - 2);
    const moved = Math.hypot(this.pos.x - before.x, this.pos.y - before.y) / unit;
    const steering = Math.hypot(input.x, input.y) > 0.05;
    if (steering) {
      this.facing = facingFor(Math.atan2(input.y, input.x), this.facing);
    }
    const moving = steering && moved > 0.0001;
    const manifest = this.manifest!;
    const runSheet = moving && input.running && manifest.facings[this.facing].run;
    if (moving) {
      const cycle = manifest.stride_per_height * (runSheet ? manifest.run_stride_factor : 1);
      this.phase = (this.phase + moved / cycle) % 1;
      this.settle = SETTLE;
      this.idleClock = 0;
      this.kind = runSheet ? "run" : "walk";
    } else {
      this.settle = Math.max(0, this.settle - delta);
      if (this.settle <= 0) {
        this.kind = "idle";
        this.idleClock += delta * manifest.idle_fps;
      }
    }
    const sheet = this._sheet();
    if (this.kind === "idle") {
      this.frameIndex = Math.floor(this.idleClock) % sheet.frames;
    } else if (moving) {
      this.frameIndex = Math.min(sheet.frames - 1, Math.floor(this.phase * sheet.frames));
    }
    this.frameIndex = Math.min(this.frameIndex, sheet.frames - 1);
    const contact = this.exit.floor && this.exit.floor.length === 4 ? this._floorContact(before) : null;
    if (contact === "wall") {
      this.pos = before;
      this.velocity = { x: 0, y: 0 };
    }
    this._follow();
    this._draw();
    this._interactables();
    if (contact === "enter") {
      this.sendBack(this._canvasPoint());
      return;
    }
    this._raf = requestAnimationFrame(this._frame);
  }

  private _draw() {
    const sheet = this._sheet();
    const texel = this._texel(sheet);
    const anchor = this._anchor(sheet);
    const width = sheet.frame_width * texel;
    const height = sheet.frame_height * texel;
    const left = this.pos.x - anchor.x * texel + this.correction.x;
    const topEdge = this.pos.y - anchor.y * texel + this.correction.y;
    const style = this.sprite.style;
    style.width = `${width}px`;
    style.height = `${height}px`;
    style.backgroundImage = `url("${this.spriteBase}/${sheet.file}")`;
    style.backgroundSize = `${sheet.frames * width}px ${height}px`;
    style.backgroundPosition = `${-this.frameIndex * width}px 0px`;
    this.actor.style.transform = `translate3d(${left}px, ${topEdge}px, 0)`;
    this.actor.style.setProperty("--ilva-foot-x", `${this.pos.x - left}px`);
    this.actor.style.setProperty("--ilva-foot-y", `${this.pos.y - topEdge}px`);
  }

  // Keep her in view: walking towards the viewport's edge scrolls the page.
  private _follow() {
    const band = window.innerHeight * 0.18;
    const unit = this._unit();
    const screenY = this.pos.y - window.scrollY;
    let scrollBy = 0;
    if (screenY > window.innerHeight - band && this.velocity.y > 0) {
      scrollBy = screenY - (window.innerHeight - band);
    } else if (screenY - unit < band && this.velocity.y < 0) {
      scrollBy = screenY - unit - band;
    }
    if (Math.abs(scrollBy) < 0.5) return;
    const target = Math.max(0, window.scrollY + scrollBy);
    if (this.lenis) {
      this.lenis.scrollTo(target, { immediate: true });
    } else {
      window.scrollTo(window.scrollX, target);
    }
  }

  // --- page -> game ------------------------------------------------------

  private _toPage([x, y]: [number, number]): Point {
    const rect = this.iframe.getBoundingClientRect();
    return { x: rect.left + window.scrollX + x * rect.width, y: rect.top + window.scrollY + y * rect.height };
  }

  private _canvasPoint(): [number, number] {
    const rect = this.iframe.getBoundingClientRect();
    return [
      (this.pos.x - window.scrollX - rect.left) / rect.width,
      (this.pos.y - window.scrollY - rect.top) / rect.height,
    ];
  }

  // The room's floor on the page: corners back, east, front, west (web_bridge.gd FLOOR).
  private _floorOnPage(): Point[] {
    return this.exit.floor!.map((corner) => this._toPage(corner));
  }

  static _inside(point: Point, polygon: Point[]) {
    let inside = false;
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
      const a = polygon[i];
      const b = polygon[j];
      if ((a.y > point.y) !== (b.y > point.y) && point.x < ((b.x - a.x) * (point.y - a.y)) / (b.y - a.y) + a.x) {
        inside = !inside;
      }
    }
    return inside;
  }

  static _segmentDistance(p: Point, a: Point, b: Point) {
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * abx + (p.y - a.y) * aby) / (abx * abx + aby * aby)));
    return Math.hypot(p.x - (a.x + t * abx), p.y - (a.y + t * aby));
  }

  // Stepping onto the floor across an open front edge (east or south) hands her
  // back; the back walls stop her. Returns 'enter', 'wall' or null.
  private _floorContact(before: Point): "enter" | "wall" | null {
    const floor = this._floorOnPage();
    const inside = CharacterLayer._inside(this.pos, floor);
    const unit = this._unit();
    if (!this.armed) {
      // She must first get clear of the edge she came out of.
      const gap = Math.min(...floor.map((a, i) => CharacterLayer._segmentDistance(this.pos, a, floor[(i + 1) % 4])));
      if (!inside && gap > unit * 0.3) this.armed = true;
      return null;
    }
    if (!inside || CharacterLayer._inside(before, floor)) return null;
    const edges = floor.map((a, i) => CharacterLayer._segmentDistance(before, a, floor[(i + 1) % 4]));
    const crossed = edges.indexOf(Math.min(...edges));
    // 1: east edge (the landing's open side), 2: the front edge.
    return crossed === 1 || crossed === 2 ? "enter" : "wall";
  }

  /** Hand her back to the game. `foot` is a canvas fraction, or null for her exit spot. */
  sendBack(foot: [number, number] | null) {
    if (this.state !== "outside") return;
    cancelAnimationFrame(this._raf);
    const held = this.touch.active ? [] : [...this.held];
    this._post({ type: "emberdeep:return", foot, facing: this.facing, held });
    this.layer.classList.add("is-returning");
    // The game answers `emberdeep:returned`; hide anyway if it never does.
    clearTimeout(this._hideTimer);
    this._hideTimer = setTimeout(() => this._hide(), 600);
    this.iframe.focus({ preventScroll: true });
    if (this.iframe.contentWindow) this.iframe.contentWindow.focus();
    this._announce("Ilva is back in the inn.");
    this._setState("game");
  }

  private _hide() {
    clearTimeout(this._hideTimer);
    this.layer.classList.remove("is-returning");
    this.prompt.textContent = "";
    this.actor.style.transform = "translate3d(-9999px, -9999px, 0)";
    // Nothing she was standing on stays lit once she has gone.
    if (this.target) {
      this.target.classList.remove("is-ilva-target");
      this.target = null;
    }
  }

  // --- page elements she can use (data-ilva-interact="label") ------------

  private _interactables() {
    const x = this.pos.x - window.scrollX;
    const y = this.pos.y - window.scrollY;
    let found: HTMLElement | null = null;
    if (x >= 0 && y >= 0 && x < window.innerWidth && y < window.innerHeight) {
      this.layer.style.visibility = "hidden";
      const hits = document.elementsFromPoint(x, y - this._unit() * 0.3);
      this.layer.style.visibility = "";
      for (const hit of hits) {
        found = hit.closest<HTMLElement>("[data-ilva-interact]");
        if (found) break;
      }
    }
    if (found !== this.target) {
      if (this.target) this.target.classList.remove("is-ilva-target");
      this.target = found;
      if (found) found.classList.add("is-ilva-target");
      this.prompt.textContent = found ? `E · ${found.dataset.ilvaInteract}` : "";
    }
  }

  // --- input -------------------------------------------------------------

  private _onKey(event: KeyboardEvent) {
    if (this.state !== "outside") return;
    const down = event.type === "keydown";
    if (event.key === "Shift") {
      this.shift = down;
      return;
    }
    const action = KEYMAP[event.code];
    // The site's own key handlers (menus, lightbox) must not see her keys.
    if (action || ["Escape", "KeyE", "Space"].includes(event.code)) event.stopPropagation();
    if (action) {
      event.preventDefault();
      if (down) this.held.add(action);
      else this.held.delete(action);
      return;
    }
    if (!down) return;
    if (event.code === "Escape") {
      event.preventDefault();
      this.sendBack(null);
    } else if (event.code === "KeyE") {
      event.preventDefault();
      this.use();
    } else if (event.code === "Space") {
      // Space would scroll the page under her; it jumps only in the inn.
      event.preventDefault();
    }
  }

  private _onPageKeyUp(event: KeyboardEvent) {
    if (this.state !== "game") return;
    const action = KEYMAP[event.code];
    if (action) this._post({ type: "emberdeep:release", action });
  }

  use() {
    if (this.state === "outside" && this.target) this.target.click();
  }

  /** Touch joystick: x, y in -1..1 (screen), run toggle. */
  setTouchInput(x: number, y: number, run: boolean) {
    this.touch = { x, y, run, active: Math.hypot(x, y) > 0.05 };
    if (this.state === "game") {
      const message = JSON.stringify([x.toFixed(2), y.toFixed(2), run]);
      if (message === this._lastTouchSent) return;
      this._lastTouchSent = message;
      this._post({ type: "emberdeep:input", x, y, run });
    }
  }

  /** Touch buttons: interact, jump, crouch. */
  press(action: string, down: boolean) {
    if (this.state === "game") {
      this._post({ type: "emberdeep:press", action, down });
    } else if (this.state === "outside" && action === "interact" && down) {
      this.use();
    }
  }
}

/**
 * On-screen joystick and buttons for touch screens. Returns a cleanup that
 * removes every listener it added — the prototype page never unmounted, the
 * site's project page does.
 */
export function mountTouchControls(root: HTMLElement, layer: CharacterLayer): () => void {
  const stick = root.querySelector<HTMLElement>("[data-touch-stick]")!;
  const knob = root.querySelector<HTMLElement>("[data-touch-knob]")!;
  const offs: (() => void)[] = [];
  const on = <K extends keyof HTMLElementEventMap>(
    el: HTMLElement,
    type: K,
    fn: (event: HTMLElementEventMap[K]) => void,
  ) => {
    el.addEventListener(type, fn);
    offs.push(() => el.removeEventListener(type, fn));
  };
  let run = false;
  let pointer: number | null = null;
  const update = (event: PointerEvent) => {
    const rect = stick.getBoundingClientRect();
    const radius = rect.width / 2;
    let x = (event.clientX - rect.left - radius) / radius;
    let y = (event.clientY - rect.top - radius) / radius;
    const length = Math.hypot(x, y);
    if (length > 1) {
      x /= length;
      y /= length;
    }
    knob.style.transform = `translate(${x * radius * 0.6}px, ${y * radius * 0.6}px)`;
    layer.setTouchInput(x, y, run);
  };
  on(stick, "pointerdown", (event) => {
    pointer = event.pointerId;
    stick.setPointerCapture(pointer);
    update(event);
  });
  on(stick, "pointermove", (event) => {
    if (event.pointerId === pointer) update(event);
  });
  const release = (event: PointerEvent) => {
    if (event.pointerId !== pointer) return;
    pointer = null;
    knob.style.transform = "";
    layer.setTouchInput(0, 0, run);
  };
  on(stick, "pointerup", release);
  on(stick, "pointercancel", release);
  for (const button of root.querySelectorAll<HTMLElement>("[data-touch-press]")) {
    const action = button.dataset.touchPress!;
    on(button, "pointerdown", (event) => {
      event.preventDefault();
      button.setPointerCapture(event.pointerId);
      layer.press(action, true);
    });
    const up = () => layer.press(action, false);
    on(button, "pointerup", up);
    on(button, "pointercancel", up);
  }
  const runButton = root.querySelector<HTMLElement>("[data-touch-run]");
  if (runButton) {
    on(runButton, "click", () => {
      run = !run;
      runButton.setAttribute("aria-pressed", String(run));
      layer.setTouchInput(layer.touch.x, layer.touch.y, run);
    });
  }
  return () => {
    for (const off of offs) off();
  };
}
