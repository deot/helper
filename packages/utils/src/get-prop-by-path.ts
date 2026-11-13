import { hasOwn } from './has-own';

interface ObjectKeyValue {
	o: object;
	k: PropertyKey;
	v: any;
}

const INVALID_PATH = '无效路径!';

const isObject = (o: any) => o !== null && (typeof o === 'object' || typeof o === 'function');

// 阻止经由原型链拿到 Object.prototype / Function.prototype 等对象（调用方通常会写回 o[k]）
const isUnsafeKey = (o: any, key: string) => {
	if (key === '__proto__') return true;
	if (key !== 'constructor' && key !== 'prototype') return false;

	return typeof o === 'function' || !hasOwn(o, key);
};

/**
 * 查找对应的值
 *
 * {a: {b: {c: 1}}}, a.b.c -> { o, k, v }
 * @param target ~
 * @param path ~
 * @returns ~
 */
export const getPropByPath = (target: object, path: string): ObjectKeyValue => {
	let o: any = target;
	path = path.replace(/\[(\w+)\]/g, '.$1');
	path = path.replace(/^\./, '');

	const keyArr = path.split('.');
	let i = 0;

	for (let len = keyArr.length; i < len - 1; ++i) {
		const key = keyArr[i];
		if (!isObject(o) || !(key in o) || isUnsafeKey(o, key)) {
			throw new Error(INVALID_PATH);
		}
		o = o[key];
	}

	const k = keyArr[i];
	if (o == null || k === '__proto__') {
		throw new Error(INVALID_PATH);
	}

	return {
		o,
		k,
		v: o[k]
	};
};
