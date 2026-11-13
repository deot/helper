import { curry } from '../pipeline';

export interface ForkFn {
	<T, A, B, R>(join: (a: A, b: B) => R, func1: (x: T) => A, func2: (x: T) => B): (x: T) => R;
	(...args: any[]): any;
}

/**
 * fork（join）组合子
 * 该组合子需要以3个函数作为参数，即以一个join函数和两个fork函数来处理提供的输入。
 * 两个分叉函数的结果最终传递到的接收两个参数的join 函数中
 */

export const fork: ForkFn = curry((join: Function, func1: Function, func2: Function) => {
	return (x: any) => join(func1(x), func2(x));
});
