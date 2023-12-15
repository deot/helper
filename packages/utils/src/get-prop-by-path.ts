interface ObjectKeyValue {
	o: object;
	k: PropertyKey;
	v: any;
}

/**
 * 查找对应的值
 *
 * {a: {b: {c: 1}}}, a.b.c -> { o, k, v }
 * @param target ~
 * @param path ~
 * @returns ~
 */
export const getPropByPath = (target: object, path: string): ObjectKeyValue => {
	let o = target;
	path = path.replace(/\[(\w+)\]/g, '.$1');
	path = path.replace(/^\./, '');

	const keyArr = path.split('.');
	let i = 0;

	for (let len = keyArr.length; i < len - 1; ++i) {
		const key = keyArr[i];
		try {
			if (key in o) {
				o = o[key];
			} else {
				throw new Error();
			}
		} catch {
			throw new Error('无效路径!');
		}
	}

	return {
		o,
		k: keyArr[i],
		v: o[keyArr[i]]
	};
};
