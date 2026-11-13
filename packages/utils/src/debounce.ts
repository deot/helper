export interface DebounceOptions {
	/**
	 * 指定在延迟开始前调用
	 */
	leading?: boolean;

	/**
	 * 指定在延迟结束后调用
	 */
	trailing?: boolean;

	/**
	 * 内部节流模式开关
	 */
	throttle?: boolean;
}

// 兼容以 `Function` 声明的入参：无法推断时参数退化为 any[]
type Args<T> = T extends (...args: infer A) => any ? A : any[];

export interface Debounced<T extends Function = Function> {
	(this: ThisParameterType<T>, ...args: Args<T>): void;

	/**
	 * 丢弃等待中的调用
	 */
	cancel: () => void;

	/**
	 * 立即执行等待中的尾沿调用
	 */
	flush: () => void;
}

export const debounce = <T extends Function>(original: T, wait?: number, options?: DebounceOptions): Debounced<T> => {
	const { leading, trailing = true, throttle } = options || {};
	let timer: ReturnType<typeof setTimeout> | null;
	let invoke: Function | null;

	const cancel = () => {
		timer && clearTimeout(timer);
		timer = null;
	};

	const start = () => {
		timer = setTimeout(() => {
			timer = null;
			if (trailing && invoke) {
				invoke();
				// 节流：尾沿执行后继续占用一个时间窗，避免紧随其后的调用立即触发首沿
				throttle && start();
			}
		}, wait);
	};
	const fn = function (this: any, ...args: any[]) {
		invoke = () => {
			original.apply(this, args);
			invoke = null;
		};
		if (!wait && throttle) return invoke();
		if (!timer) {
			leading && invoke();
			start();
		} else if (!throttle) {
			cancel();
			start();
		}
	};

	fn.cancel = () => {
		cancel();
		invoke = null;
	};
	fn.flush = () => {
		cancel();
		trailing && invoke && invoke();
	};

	return fn;
};
