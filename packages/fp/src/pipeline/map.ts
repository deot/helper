import { curry } from './curry';

// map :: (A -> B) -> A -> B
export const map = curry((fn: Function, value: Array<any> | Object) => {
	if (value instanceof Array) {
		return value.map((i) => fn(i));
	} else {
		return Object.keys(value).reduce((pre, key) => {
			pre[key] = fn(value[key]);
			return pre;
		}, {});
	}
});