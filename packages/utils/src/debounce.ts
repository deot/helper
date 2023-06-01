interface Options {
	leading?: boolean;
	trailing?: boolean;
	throttle?: boolean;
}
// leading: 指定在延迟开始前调用。
// trailing: 指定在延迟结束后调用。
export const debounce = (original: Function, wait: number, options: Options) => {
	const { leading, trailing, throttle } = options || {};
	let timer: ReturnType<typeof global.setTimeout> | null;
	let invoke: Function | null;

	let cancel = () => {
		timer && clearTimeout(timer);
		timer = null;
	};

	let start = () => {
		timer = setTimeout(() => {
			timer = null;
			trailing && invoke && invoke();
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