import { instance } from "./instance";

const TypedArray = typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array);

export const typedArray = (v?: any) => !!(TypedArray && instance(v, TypedArray));