import { curry } from './curry';
import type { Curried } from './curry';
import { align } from './internal/decimal';

export const divide: Curried<[arg1: number, arg2: number], number> = curry((arg1: number, arg2: number) => {
	// 对齐成整数后再相除，arg * 10 ** n 这样的浮点乘法本身会丢精度
	const { int1, int2 } = align(arg1, arg2);
	return int1 / int2;
});
