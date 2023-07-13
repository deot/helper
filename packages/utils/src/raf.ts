export type Raf = (callback: FrameRequestCallback) => number

export const raf: Raf = (typeof window !== "undefined" && window.requestAnimationFrame) || ((fn: Function) => setTimeout(fn, 16));