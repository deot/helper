export type RAF = (callback: FrameRequestCallback) => number;
export type CAF = (rafId: number) => void;

export const rAF: RAF = (typeof window !== 'undefined' && window.requestAnimationFrame) || ((fn: Function) => setTimeout(fn, 16));
export const cAF: CAF = (typeof window !== 'undefined' && window.cancelAnimationFrame) || ((id: number) => clearTimeout(id));

// @deprecated
export const raf = rAF;
// @deprecated
export const caf = cAF;