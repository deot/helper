type ResizeSharedListener = (entries: ResizeObserverEntry[]) => any;

/**
 * 多个元素共用一个 ResizeObserver 监听尺寸变化；仅供内部使用，对外经 Resize 的 { shared: true } 进入
 *
 * Resize 默认每个元素一个 ResizeObserver，浏览器逐个回调并在每次回调之间清空微任务；
 * 这里全局只有一个 ResizeObserver，同一轮里所有元素的变化由一次回调带回
 */
export class ResizeShared {
	static listeners = new WeakMap<Element, Set<ResizeSharedListener>>();

	static ro: ResizeObserver | null = null;

	static handleResize = (entries: ResizeObserverEntry[]) => {
		// 按监听函数归并，保持首次出现的顺序
		const batches = new Map<ResizeSharedListener, ResizeObserverEntry[]>();
		entries.forEach((entry) => {
			ResizeShared.listeners.get(entry.target)?.forEach((fn) => {
				const batch = batches.get(fn);
				batch ? batch.push(entry) : batches.set(fn, [entry]);
			});
		});

		// 互不相干的调用方共用这一次回调：某个监听函数抛错不影响其余，结束后抛出第一个错误
		const errors: unknown[] = [];
		batches.forEach((batch, fn) => {
			// 派发过程中被 off 的不再回调
			const active = batch.filter(entry => ResizeShared.listeners.get(entry.target)?.has(fn));
			if (!active.length) return;
			try {
				fn(active);
			} catch (e) {
				errors.push(e);
			}
		});
		if (errors.length) throw errors[0];
	};

	/**
	 * 注册监听；元素首次注册时开始观察
	 * @param el ~
	 * @param fn ~
	 * @returns off
	 */
	static on(el: Element, fn: ResizeSharedListener): () => void {
		if (typeof ResizeObserver === 'undefined') return () => {};

		let listeners = ResizeShared.listeners.get(el);
		if (!listeners) {
			listeners = new Set();
			ResizeShared.listeners.set(el, listeners);

			ResizeShared.ro = ResizeShared.ro || new ResizeObserver(ResizeShared.handleResize);
			ResizeShared.ro.observe(el);
		}

		listeners.add(fn);

		return () => ResizeShared.off(el, fn);
	}

	/**
	 * 删除监听；元素上没有监听后停止观察
	 * @param el ~
	 * @param fn 省略时删除该元素的全部监听
	 */
	static off(el: Element, fn?: ResizeSharedListener): void {
		const listeners = ResizeShared.listeners.get(el);
		if (!listeners) return;

		fn ? listeners.delete(fn) : listeners.clear();
		if (!listeners.size) {
			ResizeShared.listeners.delete(el);
			ResizeShared.ro!.unobserve(el);
		}
	}
}
