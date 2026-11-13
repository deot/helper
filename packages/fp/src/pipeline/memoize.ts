type AnyFn = (...args: any[]) => any;

export type Memoized<F extends AnyFn> = F & { cache: Map<any, ReturnType<F>> };

/**
 * 缓存函数结果，默认以第一个实参作为键
 * 无形参（fn.length === 0）的函数会被原样返回，不创建缓存
 * @param func ~
 * @param resolver 自定义键
 * @returns ~
 */
export const memoize = <F extends AnyFn>(func: F, resolver?: (...args: Parameters<F>) => any): Memoized<F> => {
	if (func.length === 0) {
		return func as Memoized<F>;
	}

	const memoized = function (this: any, ...args: any[]) {
		const key = resolver ? resolver.apply(this, args as Parameters<F>) : args[0];

		if (!memoized.cache.has(key)) {
			memoized.cache.set(key, func.apply(this, args));
		}

		return memoized.cache.get(key);
	};

	memoized.cache = new Map();

	return memoized as Memoized<F>;
};
