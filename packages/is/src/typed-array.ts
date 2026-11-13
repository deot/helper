import { instance } from './instance';

export type TypedArray
	= | Int8Array
		| Uint8Array
		| Uint8ClampedArray
		| Int16Array
		| Uint16Array
		| Int32Array
		| Uint32Array
		| Float32Array
		| Float64Array
		| BigInt64Array
		| BigUint64Array;

const TypedArrayConstructor: Function | false = typeof Uint8Array !== 'undefined' && Object.getPrototypeOf(Uint8Array);

export const typedArray = (v?: any): v is TypedArray => {
	return !!TypedArrayConstructor && instance(v, TypedArrayConstructor);
};
