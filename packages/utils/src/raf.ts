export type Raf = (callback: FrameRequestCallback) => number;
export type Caf = (rafId: number) => void;

export const raf: Raf = (typeof window !== 'undefined' && window.requestAnimationFrame) || ((fn: Function) => setTimeout(fn, 16));
export const caf: Caf = (typeof window !== 'undefined' && window.cancelAnimationFrame) || ((rafIf: number) => clearTimeout(rafIf));
