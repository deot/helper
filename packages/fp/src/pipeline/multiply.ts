import { curry } from './curry';
import type { Curried } from './curry';
import { toDecimal } from './internal/decimal';

export const multiply: Curried<[arg1: number, arg2: number], number> = curry((arg1: number, arg2: number) => {
	const d1 = toDecimal(arg1);
	const d2 = toDecimal(arg2);
	return (d1.int * d2.int) / (10 ** (d1.scale + d2.scale));
});
