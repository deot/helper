export type RAF = (callback: FrameRequestCallback) => number;
export type CAF = (rafId: number) => void;

export const rAF: RAF = (typeof window !== 'undefined' && window.requestAnimationFrame) || ((fn: Function) => setTimeout(fn, 16));
export const cAF: CAF = (typeof window !== 'undefined' && window.cancelAnimationFrame) || ((id: number) => clearTimeout(id));

/**
 * @deprecated 使用 `rAF`
 */
export const raf = rAF;

/**
 * @deprecated 使用 `cAF`
 */
export const caf = cAF;
