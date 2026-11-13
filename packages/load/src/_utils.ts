export type LoadAttrs = Record<string, string | boolean | undefined>;

type Executor<T> = (
	resolve: (value: T) => void,
	reject: (cause?: unknown) => void
) => void;

export const createError = (type: string, src: string, cause?: unknown) => {
	return new Error(`[@deot/helper-load]: ${type} 加载失败: ${src}`, { cause });
};

export const applyAttrs = (el: Element, attrs?: LoadAttrs) => {
	if (!attrs) return;

	Object.keys(attrs).forEach((key) => {
		const value = attrs[key];
		if (value === false || typeof value === 'undefined') return;

		el.setAttribute(key, value === true ? '' : value);
	});
};

/**
 * 按 src 去重；失败时清理缓存，并统一 reject 为 Error（原始原因挂在 cause 上）
 * @param cache 以 src 为 key 的缓存
 * @param type 资源类型，用于错误信息
 * @param src 资源地址
 * @param executor 实际的加载逻辑，同步抛错等同于 reject
 * @returns 加载结果
 */
export const load = <T>(
	cache: Map<string, Promise<T>>,
	type: string,
	src: string,
	executor: Executor<T>
): Promise<T> => {
	const cached = cache.get(src);
	if (cached) return cached;

	let isSync = true;
	let isFailed = false;

	const target: Promise<T> = new Promise<T>((resolve, reject) => {
		const fail = (cause?: unknown) => {
			isFailed = true;
			// 同步失败时还未写入缓存；异步失败时只清理属于自己的记录
			if (!isSync && cache.get(src) === target) {
				cache.delete(src);
			}
			reject(createError(type, src, cause));
		};

		if (!src) return fail();

		try {
			executor(resolve, fail);
		} catch (e) {
			fail(e);
		}
	});

	isSync = false;
	!isFailed && cache.set(src, target);

	return target;
};
