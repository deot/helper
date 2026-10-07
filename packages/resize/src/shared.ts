type ResizeSharedListener = (entries: ResizeObserverEntry[]) => any;

type ResizeSharedObserver = {
	ro: ResizeObserver;
	// 正在监听的元素：disconnect 据此逐个删除
	els: Set<Element>;
};

/**
 * 以同一个监听函数注册的元素共用一个 ResizeObserver；仅供内部使用，对外经 Resize 的 { shared: true } 进入
 *
 * Resize 默认每个元素一个 ResizeObserver，浏览器逐个回调并在每次回调之间清空微任务；
 * 这里每个监听函数一个 ResizeObserver，同一轮里它监听的所有元素的变化由一次回调带回。
 *
 * 观察器跟着监听函数走，而不是全局只有一个：全局的观察器始终存活，部分浏览器（如 Firefox）里它会一直留住被观察的元素，
 * 调用方漏掉 off 时，已移出文档的元素连同监听函数永远不会被回收。
 * 按监听函数建立后，监听函数与它监听的元素都没有外部引用时，观察器随它们一起被回收；
 * 监听函数还在用的期间，没有 off 的元素一直被这里引用着
 */
export class ResizeShared {
	/**
	 * 元素 -> 监听函数
	 *
	 * 被监听的元素还活着，监听函数（及其观察器）就不会被回收：内联的监听函数不需要调用方另外持有
	 */
	static listeners = new WeakMap<Element, Set<ResizeSharedListener>>();

	/**
	 * 监听函数 -> 它的观察器
	 *
	 * 不再观察任何元素时也留着：监听的元素整批更换（先全部 off 再 on）时不必重建，监听函数被回收时一并回收
	 */
	static observers = new WeakMap<ResizeSharedListener, ResizeSharedObserver>();

	/**
	 * 监听函数的观察器，没有时创建
	 * @param fn ~
	 * @returns ~
	 */
	static observerOf(fn: ResizeSharedListener) {
		let observer = ResizeShared.observers.get(fn);
		if (!observer) {
			const ro = new ResizeObserver((entries) => {
				// 回调之前被 off 的元素可能仍在 entries 里：只带回仍由该监听函数监听的元素
				const active = entries.filter(entry => ResizeShared.listeners.get(entry.target)?.has(fn));
				active.length && fn(active);
			});
			observer = { ro, els: new Set() };
			ResizeShared.observers.set(fn, observer);
		}
		return observer;
	}

	/**
	 * 注册监听；监听函数在该元素上首次注册时开始观察
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
		}

		if (!listeners.has(fn)) {
			listeners.add(fn);

			const observer = ResizeShared.observerOf(fn);
			observer.els.add(el);
			observer.ro.observe(el);
		}

		return () => ResizeShared.off(el, fn);
	}

	/**
	 * 删除监听；监听函数不再监听该元素后停止观察
	 * @param el ~
	 * @param fn 省略时删除该元素的全部监听
	 */
	static off(el: Element, fn?: ResizeSharedListener): void {
		const listeners = ResizeShared.listeners.get(el);
		if (!listeners) return;

		(fn ? [fn] : [...listeners]).forEach((listener) => {
			if (!listeners.delete(listener)) return;

			const observer = ResizeShared.observers.get(listener)!;
			observer.els.delete(el);
			observer.ro.unobserve(el);
		});

		if (!listeners.size) ResizeShared.listeners.delete(el);
	}

	/**
	 * 删除监听函数在所有元素上的监听
	 * @param fn ~
	 */
	static disconnect(fn: ResizeSharedListener): void {
		ResizeShared.observers.get(fn)?.els.forEach(el => ResizeShared.off(el, fn));
	}
}
