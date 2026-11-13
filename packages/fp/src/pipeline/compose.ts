type Fn<A extends any[] = any[], R = any> = (...args: A) => R;

// 第一个执行的函数可以接受多个值，后面的仅传递一个值
export interface Compose {
	(): <T>(arg: T) => T;
	<F extends Fn>(f: F): F;
	<A extends any[], T1, R>(f2: (a: T1) => R, f1: Fn<A, T1>): Fn<A, R>;
	<A extends any[], T1, T2, R>(f3: (a: T2) => R, f2: (a: T1) => T2, f1: Fn<A, T1>): Fn<A, R>;
	<A extends any[], T1, T2, T3, R>(
		f4: (a: T3) => R,
		f3: (a: T2) => T3,
		f2: (a: T1) => T2,
		f1: Fn<A, T1>
	): Fn<A, R>;
	<A extends any[], T1, T2, T3, T4, R>(
		f5: (a: T4) => R,
		f4: (a: T3) => T4,
		f3: (a: T2) => T3,
		f2: (a: T1) => T2,
		f1: Fn<A, T1>
	): Fn<A, R>;
	<A extends any[], T1, T2, T3, T4, T5, R>(
		f6: (a: T5) => R,
		f5: (a: T4) => T5,
		f4: (a: T3) => T4,
		f3: (a: T2) => T3,
		f2: (a: T1) => T2,
		f1: Fn<A, T1>
	): Fn<A, R>;
	(...funcs: Function[]): Fn;
}

export interface Pipe {
	(): <T>(arg: T) => T;
	<F extends Fn>(f: F): F;
	<A extends any[], T1, R>(f1: Fn<A, T1>, f2: (a: T1) => R): Fn<A, R>;
	<A extends any[], T1, T2, R>(f1: Fn<A, T1>, f2: (a: T1) => T2, f3: (a: T2) => R): Fn<A, R>;
	<A extends any[], T1, T2, T3, R>(
		f1: Fn<A, T1>,
		f2: (a: T1) => T2,
		f3: (a: T2) => T3,
		f4: (a: T3) => R
	): Fn<A, R>;
	<A extends any[], T1, T2, T3, T4, R>(
		f1: Fn<A, T1>,
		f2: (a: T1) => T2,
		f3: (a: T2) => T3,
		f4: (a: T3) => T4,
		f5: (a: T4) => R
	): Fn<A, R>;
	<A extends any[], T1, T2, T3, T4, T5, R>(
		f1: Fn<A, T1>,
		f2: (a: T1) => T2,
		f3: (a: T2) => T3,
		f4: (a: T3) => T4,
		f5: (a: T4) => T5,
		f6: (a: T5) => R
	): Fn<A, R>;
	(...funcs: Function[]): Fn;
}

type Key = 'reduce' | 'reduceRight';
const factory = (key: Key) => (...funcs: Function[]): Function => {
	if (funcs.length === 0) {
		return (arg: any) => arg;
	}
	if (funcs.length === 1) {
		return funcs[0];
	}

	return funcs[key]((a, b) => {
		return function (this: any, ...args: any) {
			return a.call(this, b.apply(this, args));
		};
	});
};

/**
 * 函数组合
 * compose :: (B -> C) -> (A -> B) -> (A -> C)
 * 中间件的应用
 *
 * 参考：https://raw.githubusercontent.com/reduxjs/redux/master/src/compose.ts
 * 增加对this的支持
 * @param {Function[]} funcs ~
 * @returns {Function} ~
 */
export const compose = factory('reduce') as Compose;

/**
 * 函数管道
 * @param {Function[]} funcs ~
 * @returns {Function} ~
 */
export const pipe = factory('reduceRight') as Pipe;
