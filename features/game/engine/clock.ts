export type ClockState = {
  whiteMs: number;
  blackMs: number;
  activeColor: "white" | "black" | null;
  running: boolean;
};

export type ClockConfig = {
  initialSeconds: number;
  incrementSeconds: number;
};

export class GameClock {
  private whiteMs: number;
  private blackMs: number;
  private activeColor: "white" | "black" | null = null;
  private running = false;
  private lastTick = 0;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private onTimeout: ((color: "white" | "black") => void) | null = null;

  constructor(config: ClockConfig | null) {
    const initial = (config?.initialSeconds ?? 0) * 1000;
    this.whiteMs = initial;
    this.blackMs = initial;
  }

  setOnTimeout(handler: (color: "white" | "black") => void): void {
    this.onTimeout = handler;
  }

  start(color: "white" | "black"): void {
    this.activeColor = color;
    this.running = true;
    this.lastTick = Date.now();
    this.ensureInterval();
  }

  switchTurn(nextColor: "white" | "black", incrementSeconds = 0): void {
    this.tick();
    this.activeColor = nextColor;
    if (incrementSeconds > 0) {
      if (nextColor === "white") {
        this.whiteMs += incrementSeconds * 1000;
      } else {
        this.blackMs += incrementSeconds * 1000;
      }
    }
    this.lastTick = Date.now();
  }

  pause(): void {
    this.tick();
    this.running = false;
  }

  resume(): void {
    if (!this.activeColor) return;
    this.running = true;
    this.lastTick = Date.now();
  }

  getState(): ClockState {
    return {
      whiteMs: this.whiteMs,
      blackMs: this.blackMs,
      activeColor: this.activeColor,
      running: this.running,
    };
  }

  destroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  private ensureInterval(): void {
    if (this.intervalId) return;
    this.intervalId = setInterval(() => this.tick(), 100);
  }

  private tick(): void {
    if (!this.running || !this.activeColor) return;

    const now = Date.now();
    const elapsed = now - this.lastTick;
    this.lastTick = now;

    if (this.activeColor === "white") {
      this.whiteMs = Math.max(0, this.whiteMs - elapsed);
      if (this.whiteMs === 0) {
        this.running = false;
        this.onTimeout?.("white");
      }
    } else {
      this.blackMs = Math.max(0, this.blackMs - elapsed);
      if (this.blackMs === 0) {
        this.running = false;
        this.onTimeout?.("black");
      }
    }
  }
}

export function formatClock(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}
