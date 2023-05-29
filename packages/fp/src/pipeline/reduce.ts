import { curry } from './curry';

export const reduce = curry((fn: any, initialValue: any, value: Array<any>) => {
	return value.reduce(fn, initialValue);
});