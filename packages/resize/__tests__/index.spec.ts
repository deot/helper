import { Utils } from '@deot/dev-test';
import { Resize } from '@deot/helper-resize';
import ResizeObserver from 'resize-observer-polyfill';

// 记录所有观察器及其回调、正在观察的元素：按元素找到观察它的观察器，也可直接调用回调模拟一次派发
const observers: Observer[] = [];
class Observer extends ResizeObserver {
	callback: (entries: any[]) => void;
	targets = new Set<Element>();

	constructor(callback: any) {
		super(callback);
		this.callback = callback;
		observers.push(this);
	}

	observe(el: Element) {
		this.targets.add(el);
		super.observe(el);
	}

	unobserve(el: Element) {
		this.targets.delete(el);
		super.unobserve(el);
	}

	disconnect() {
		this.targets.clear();
		super.disconnect();
	}
}
const observersOf = (el: Element) => observers.filter(observer => observer.targets.has(el));

describe('resize.ts', () => {
	Object.defineProperty(globalThis, 'ResizeObserver', { value: Observer });

	// resize-observer-polyfill fake
	Object.defineProperties(HTMLElement.prototype, {
		clientWidth: {
			get() { return parseFloat(this.style.width) || 0; }
		},
		clientHeight: {
			get() { return parseFloat(this.style.height) || 0; }
		}
	});

	const el = document.createElement('div');

	el.style.width = '100px';
	el.style.height = '100px';
	el.innerHTML = 'any';

	document.body.appendChild(el);

	// 用例内创建的元素：结束后移除两种模式下的监听并从文档中删除
	const shared = { shared: true };
	const created: HTMLElement[] = [];
	const create = () => {
		const target = document.createElement('div');
		target.style.width = '100px';
		target.style.height = '100px';
		document.body.appendChild(target);
		created.push(target);
		return target;
	};
	// 改变宽度并等待观察器回调
	const resize = async (...targets: HTMLElement[]) => {
		targets.forEach((target) => {
			target.style.width = `${parseFloat(target.style.width) + 10}px`;
		});
		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(50);
	};

	afterEach(() => {
		created.splice(0).forEach((target) => {
			Resize.off(target);
			Resize.off(target, undefined, shared);
			target.remove();
		});
	});

	it('on', async () => {
		expect.assertions(1);
		const handler = () => {
			// any
		};
		Resize.on(el, handler);
		const off = Resize.of(el).on(() => {
			expect(1).toBe(1);
		});

		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);

		Resize.off(el, handler);
		off();
		Resize.off(el);

		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('resize'));
		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);
	});

	it('off ignores unregistered listeners', async () => {
		const target = document.createElement('div');
		target.style.width = '100px';
		target.style.height = '100px';
		document.body.appendChild(target);

		const a = vi.fn();
		const b = vi.fn();
		const offA = Resize.on(target, a);
		Resize.on(target, b);

		// 同一元素的实例共享listeners：移除未注册的监听器、重复调用取消函数，都不能误删其他调用方的监听器
		Resize.off(target, () => {});
		offA();
		offA();

		target.style.width = '200px';
		window.dispatchEvent(new Event('resize'));
		await Utils.sleep(40);
		Resize.off(target);
		target.remove();

		expect(b).toHaveBeenCalled();
	});

	it('listens again after every listener was removed', async () => {
		const target = create();
		const a = vi.fn();
		const b = vi.fn();
		Resize.on(target, a);
		await Utils.sleep(50);
		expect(a).toHaveBeenCalledTimes(1);

		// 省略监听器清空后，同一元素重新注册仍要能收到回调，且之前的监听器不再保留
		Resize.off(target);
		Resize.on(target, b);
		await resize(target);
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalled();
	});

	describe('shared', () => {
		// 最近一次调用收到的 entries 对应的元素
		const targetsOf = (fn: any) => fn.mock.lastCall[0].map((entry: any) => entry.target);
		// 直接调用共用观察器的回调模拟一次派发：entries 只需要 target；首个元素须只被共用模式监听
		const dispatch = (...targets: Element[]) => {
			const [observer] = observersOf(targets[0]);
			observer.callback(targets.map(target => ({ target })));
		};

		it('merges the elements resized together into one call', async () => {
			const targets = [create(), create(), create()];
			const fn = vi.fn();
			const plain = vi.fn();
			targets.forEach(target => Resize.on(target, fn, shared));
			targets.forEach(target => Resize.on(target, plain));
			await Utils.sleep(50);

			// 首次监听：三个元素合并为一次回调，参数为各自的 entry
			expect(fn).toHaveBeenCalledTimes(1);
			expect(targetsOf(fn)).toEqual(targets);
			// 默认模式不变：每个元素各回调一次，不带参数
			expect(plain).toHaveBeenCalledTimes(3);
			expect(plain.mock.calls.every(args => args.length === 0)).toBe(true);

			await resize(targets[0], targets[2]);
			expect(fn).toHaveBeenCalledTimes(2);
			expect(targetsOf(fn)).toEqual([targets[0], targets[2]]);
			expect(plain).toHaveBeenCalledTimes(5);
		});

		it('observes every shared element with a single observer', () => {
			const targets = [create(), create()];
			const fn = vi.fn();
			targets.forEach(target => Resize.on(target, fn, shared));
			Resize.on(targets[0], vi.fn());

			expect(observersOf(targets[1])).toHaveLength(1);
			const [observer] = observersOf(targets[1]);
			// 同一元素上两种模式各有各的观察器
			expect(observersOf(targets[0])).toHaveLength(2);
			expect(observersOf(targets[0])).toContain(observer);
			// 之后注册的元素仍由同一个观察器监听
			const later = create();
			Resize.on(later, vi.fn(), shared);
			expect(observersOf(later)).toEqual([observer]);
		});

		it('passes each listener only the entries of its own elements', async () => {
			const [a, b, c] = [create(), create(), create()];
			const left = vi.fn();
			const right = vi.fn();
			Resize.on(a, left, shared);
			Resize.on(b, left, shared);
			Resize.on(b, right, shared);
			Resize.on(c, right, shared);
			await Utils.sleep(50);

			expect(left).toHaveBeenCalledTimes(1);
			expect(targetsOf(left)).toEqual([a, b]);
			expect(right).toHaveBeenCalledTimes(1);
			expect(targetsOf(right)).toEqual([b, c]);

			await resize(c);
			expect(left).toHaveBeenCalledTimes(1);
			expect(right).toHaveBeenCalledTimes(2);
			expect(targetsOf(right)).toEqual([c]);
		});

		it('ignores a listener registered twice on the same element', async () => {
			const target = create();
			const fn = vi.fn();
			Resize.on(target, fn, shared);
			Resize.on(target, fn, shared);
			await Utils.sleep(50);

			expect(fn).toHaveBeenCalledTimes(1);
			expect(targetsOf(fn)).toEqual([target]);

			Resize.off(target, fn, shared);
			await resize(target);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('off', async () => {
			const [a, b] = [create(), create()];
			const first = vi.fn();
			const second = vi.fn();
			const offFirst = Resize.on(a, first, shared);
			Resize.on(a, second, shared);
			Resize.on(b, first, shared);
			Resize.on(b, second, shared);
			await Utils.sleep(50);
			first.mockClear();
			second.mockClear();

			// 未注册的监听器、未监听的元素都直接忽略；重复调用取消函数也一样
			Resize.off(a, () => {}, shared);
			Resize.off(document.createElement('div'), first, shared);
			offFirst();
			offFirst();

			await resize(a, b);
			expect(targetsOf(first)).toEqual([b]);
			expect(targetsOf(second)).toEqual([a, b]);
			expect(observersOf(a)).toHaveLength(1);

			// 省略监听器时删除该元素在共用模式下的全部监听；元素上没有监听后停止观察
			Resize.off(b, undefined, shared);
			expect(observersOf(b)).toHaveLength(0);
			Resize.off(a, second, shared);
			expect(observersOf(a)).toHaveLength(0);

			first.mockClear();
			second.mockClear();
			await resize(a, b);
			expect(first).not.toHaveBeenCalled();
			expect(second).not.toHaveBeenCalled();
		});

		it('keeps the two modes independent', async () => {
			const target = create();
			const plain = vi.fn();
			const fn = vi.fn();
			Resize.on(target, plain);
			Resize.on(target, fn, shared);
			await Utils.sleep(50);
			expect(plain).toHaveBeenCalledTimes(1);
			expect(fn).toHaveBeenCalledTimes(1);

			// 共用模式的 off 不影响默认模式的监听
			Resize.off(target, plain, shared);
			Resize.off(target, undefined, shared);
			await resize(target);
			expect(plain).toHaveBeenCalledTimes(2);
			expect(fn).toHaveBeenCalledTimes(1);

			// 默认模式的 off 不影响共用模式的监听
			Resize.on(target, fn, shared);
			await Utils.sleep(50);
			fn.mockClear();
			Resize.off(target, fn);
			Resize.off(target);
			await resize(target);
			expect(plain).toHaveBeenCalledTimes(2);
			expect(fn).toHaveBeenCalledTimes(1);
		});

		it('keeps calling the other listeners when one throws', () => {
			const [a, b] = [create(), create()];
			const error = new Error('first');
			const bad = vi.fn(() => {
				throw error;
			});
			const worse = vi.fn(() => {
				throw new Error('second');
			});
			const good = vi.fn();
			Resize.on(a, bad, shared);
			Resize.on(a, worse, shared);
			Resize.on(b, good, shared);

			// 其余监听照常执行，结束后抛出第一个错误
			expect(() => dispatch(a, b)).toThrow(error);
			expect(worse).toHaveBeenCalledTimes(1);
			expect(targetsOf(good)).toEqual([b]);
		});

		it('skips the listeners removed during the dispatch', () => {
			const [a, b, c] = [create(), create(), create()];
			const removed = vi.fn();
			const kept = vi.fn();
			const first = vi.fn(() => {
				Resize.off(b, removed, shared);
				Resize.off(c, removed, shared);
			});
			Resize.on(a, first, shared);
			Resize.on(b, removed, shared);
			Resize.on(b, kept, shared);
			Resize.on(c, removed, shared);

			// 没有监听的元素（如刚被 off）出现在 entries 里时直接忽略
			dispatch(a, b, c, document.createElement('div'));
			expect(first).toHaveBeenCalledTimes(1);
			expect(removed).not.toHaveBeenCalled();
			expect(targetsOf(kept)).toEqual([b]);
		});
	});
});
