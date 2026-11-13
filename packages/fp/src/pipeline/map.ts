import { curry } from './curry';

type Dict<T = any> = Record<string, T>;

export interface MapFn {
	<T, R>(fn: (value: T) => R, value: T[]): R[];
	<T, R>(fn: (value: T) => R, value: Dict<T>): Dict<R>;
	<T, R>(fn: (value: T) => R): {
		(value: T[]): R[];
		(value: Dict<T>): Dict<R>;
		(value: any): any;
	};
	(...args: any[]): any;
}

// map :: (A -> B) -> A -> B
export const map: MapFn = curry((fn: Function, value: Array<any> | Object) => {
	if (value instanceof Array) {
		return value.map(i => fn(i));
	} else {
		return Object.keys(value).reduce((pre, key) => {
			pre[key] = fn(value[key]);
			return pre;
		}, {});
	}
});
