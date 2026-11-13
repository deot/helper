import { curry } from './curry';

type Dict<T = any> = Record<string, T>;

export interface FilterFn {
	<T>(fn: (value: T) => any, value: T[]): T[];
	<T>(fn: (value: T) => any, value: Dict<T>): Dict<T>;
	<T>(fn: (value: T) => any): {
		(value: T[]): T[];
		(value: Dict<T>): Dict<T>;
		(value: any): any;
	};
	(...args: any[]): any;
}

export const filter: FilterFn = curry((fn: Function, value: Array<any> | Object) => {
	if (value instanceof Array) {
		return value.filter(i => fn(i));
	} else {
		return Object.keys(value).reduce((pre, key) => {
			if (fn(value[key])) {
				pre[key] = value[key];
			}
			return pre;
		}, {});
	}
});
