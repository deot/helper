import { curry } from './curry';

export const filter = curry((fn: Function, value: Array<any> | Object) => {
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
