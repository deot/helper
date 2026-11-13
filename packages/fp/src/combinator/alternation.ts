import { curry } from '../pipeline';

export interface AlternationFn {
	<T, R1, R2>(fn1: (x: T) => R1, fn2: (x: T) => R2): (x: T) => R1 | R2;
	<T, R1>(fn1: (x: T) => R1): <R2>(fn2: (x: T) => R2) => (x: T) => R1 | R2;
	(...args: any[]): any;
}

/**
 * alt（OR-组合子）
 * alt 组合子能够在提供函数响应的默认行为时执行简单的条件逻辑
 */

export const alternation: AlternationFn = curry((fn1: Function, fn2: Function) => {
	return (x: any) => {
		return fn1(x) || fn2(x);
	};
});
