import { IS_SERVER } from '@deot/helper-shared';

export type Raf = (callback: FrameRequestCallback) => number

export const raf: Raf = (!IS_SERVER && window.requestAnimationFrame) || ((fn: Function) => setTimeout(fn, 16));