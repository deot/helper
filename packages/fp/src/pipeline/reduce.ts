import { curry } from './curry';

type Reducer<T, R> = (pre: R, cur: T, index: number, source: T[]) => R;

export interface ReduceFn {
	<T, R>(fn: Reducer<T, R>, initialValue: R, value: T[]): R;
	<T, R>(fn: Reducer<T, R>, initialValue: R): (value: T[]) => R;
	<T, R>(fn: Reducer<T, R>): {
		(initialValue: R, value: T[]): R;
		(initialValue: R): (value: T[]) => R;
	};
	(...args: any[]): any;
}

export const reduce: ReduceFn = curry((fn: any, initialValue: any, value: Array<any>) => {
	return value.reduce(fn, initialValue);
});
