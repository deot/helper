import { curry } from './curry';
import type { Curried } from './curry';
import { align } from './internal/decimal';

export const subtract: Curried<[arg1: number, arg2: number], number> = curry((arg1: number, arg2: number) => {
	const { int1, int2, scale } = align(arg1, arg2);
	return (int1 - int2) / (10 ** scale);
});
