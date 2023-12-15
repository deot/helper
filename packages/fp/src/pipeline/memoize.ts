export const memoize = (func: Function, reslover?: Function) => {
	if (func.length === 0 || func.length > 1) {
		return func;
	}

	const memoized = function (this: any, ...args: any[]) {
		const key = reslover ? reslover.apply(this, args) : args[0];

		if (!memoized.cache.has(key)) {
			memoized.cache.set(key, func.apply(this, args));
		}

		return memoized.cache.get(key);
	};

	memoized.cache = new Map();

	return memoized;
};
