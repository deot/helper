/**
 * https://www.30secondsofcode.org/js/s/curry/
 */
import { mergeArgs } from './internal/merge-args';

type AnyFn = (...args: any[]) => any;

/**
 * 柯里化后的函数类型
 * - 按顺序传参时逐步收窄：Curried<[a, b], R> -> (a) => (b) => R
 * - 使用占位符或参数不匹配时退回宽松签名
 */
export interface Curried<P extends any[], R> {
	<A extends Partial<P>>(...args: A): Curry extends A[number]
		? any
		: P extends [...{ [K in keyof A]: any }, ...infer Rest]
			? (Rest extends [] ? R : Curried<Rest, R>)
			: never;
	(...args: any[]): any;
}

export interface Curry {
	<F extends AnyFn>(fn: F): Curried<Parameters<F>, ReturnType<F>>;
	placeholder: Curry;
}

export const curry = ((fn: AnyFn) => {
	return function curried(this: any, ...args: any[]) {
		if (args.length >= fn.length && !args.includes(curry)) {
			return fn.apply(this, args);
		} else {
			return function (this: any, ...nextArgs: any[]) {
				const mergedArgs = mergeArgs(args, nextArgs, curry);
				return curried.apply(this, mergedArgs);
			};
		}
	};
}) as Curry;

curry.placeholder = curry;
