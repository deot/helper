import { curry } from '../pipeline';

/**
 * alt（OR-组合子）
 * alt 组合子能够在提供函数响应的默认行为时执行简单的条件逻辑
 */

export const alternation = curry((fn1: Function, fn2: Function) => {
	return (x: any) => {
		return fn1(x) || fn2(x);
	};
});
