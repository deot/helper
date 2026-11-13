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

	it('shares the state with an instance created before any listener', async () => {
		const target = create();
		// 先创建实例、之后才有监听：它与静态方法、之后创建的实例仍是同一份状态
		const early = Resize.of(target);
		const a = vi.fn();
		const b = vi.fn();
		Resize.on(target, a);
		early.on(b);

		expect(observersOf(target)).toHaveLength(1);
		expect(early.listeners).toBe(Resize.of(target).listeners);
		expect(early.ro).toBe(Resize.of(target).ro);
		// 状态不挂在元素上
		expect('__rz__' in target).toBe(false);
		await Utils.sleep(50);
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(1);

		// 静态 off 能删掉静态 on 注册的监听，不受先创建的实例影响
		Resize.off(target, a);
		await resize(target);
		expect(a).toHaveBeenCalledTimes(1);
		expect(b).toHaveBeenCalledTimes(2);

		// 省略监听器时连同实例注册的一起清空，并停止观察
		Resize.off(target);
		expect(observersOf(target)).toHaveLength(0);
		await resize(target);
		expect(b).toHaveBeenCalledTimes(2);
	});

	it('shares the state between instances created before any listener', async () => {
		const target = create();
		const [first, second] = [Resize.of(target), Resize.of(target)];
		const a = vi.fn();
		const b = vi.fn();
		first.on(a);
		second.on(b);

		expect(first.listeners).toBe(second.listeners);
		expect(observersOf(target)).toHaveLength(1);

		// 任一实例都能删掉另一个实例注册的监听
		second.off(a);
		await Utils.sleep(50);
		expect(a).not.toHaveBeenCalled();
		expect(b).toHaveBeenCalledTimes(1);

		first.off();
		expect(observersOf(target)).toHaveLength(0);
	});

	it('calls the listeners after one that removes itself', async () => {
		const target = create();
		const calls: string[] = [];
		const off = Resize.on(target, () => {
			calls.push('a');
			off();
		});
		Resize.on(target, () => calls.push('b'));
		// 回调内注册的监听下一轮才执行
		const late = vi.fn();
		const offOnce = Resize.on(target, () => {
			offOnce();
			Resize.on(target, late);
		});
		await Utils.sleep(50);
		expect(calls).toEqual(['a', 'b']);
		expect(late).not.toHaveBeenCalled();

		await resize(target);
		expect(calls).toEqual(['a', 'b', 'b']);
		expect(late).toHaveBeenCalledTimes(1);
	});

	it('does not call a listener removed earlier in the same callback', async () => {
		const target = create();
		const removed = vi.fn();
		const kept = vi.fn();
		Resize.on(target, () => Resize.off(target, removed));
		Resize.on(target, removed);
		Resize.on(target, kept);
		await Utils.sleep(50);

		expect(removed).not.toHaveBeenCalled();
		expect(kept).toHaveBeenCalledTimes(1);
	});

	it('ignores a listener registered twice on the same element', async () => {
		const target = create();
		const fn = vi.fn();
		Resize.on(target, fn);
		Resize.of(target).on(fn);
		await Utils.sleep(50);

		expect(fn).toHaveBeenCalledTimes(1);
		expect(Resize.of(target).listeners).toHaveLength(1);

		// 重复注册只算一次：off 一次即删除并停止观察
		Resize.off(target, fn);
		expect(observersOf(target)).toHaveLength(0);
		await resize(target);
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('exposes the state of an element through Resize.of', () => {
		const target = create();
		// 直接调用 handleResize 模拟一次派发：entries 只需要 target
		const dispatch = () => Resize.of(target).handleResize([{ target }] as any);

		// 未监听：没有监听函数与观察器，派发是空操作
		expect(Resize.of(target).listeners).toHaveLength(0);
		expect(Resize.of(target).ro).toBe(null);
		dispatch();

		const fn = vi.fn();
		Resize.on(target, fn);
		expect(Resize.of(target).listeners).toEqual([fn]);
		expect(observersOf(target)).toEqual([Resize.of(target).ro]);
		dispatch();
		expect(fn).toHaveBeenCalledTimes(1);
	});

	it('calls the remaining listeners after one that throws', () => {
		const target = create();
		const dispatch = () => Resize.of(target).handleResize([{ target }] as any);
		const [first, second] = [new Error('first'), new Error('second')];
		const good = vi.fn();
		const offFirst = Resize.on(target, () => {
			throw first;
		});
		Resize.on(target, good);
		Resize.on(target, () => {
			throw second;
		});

		// 派发期间记下定时器回调，不真正执行
		const timers: (() => void)[] = [];
		const spy = vi.spyOn(globalThis, 'setTimeout').mockImplementation(((fn: any) => timers.push(fn)) as any);
		let thrown: unknown;
		try {
			dispatch();
		} catch (e) {
			thrown = e;
		}

		// 后面的监听函数照常执行；第一个错误原样抛出，其余的各自经定时器抛出
		expect(thrown).toBe(first);
		expect(good).toHaveBeenCalledTimes(1);
		expect(timers).toHaveLength(1);
		expect(timers[0]).toThrow(second);

		// 只有一个出错时不用定时器
		offFirst();
		timers.length = 0;
		expect(dispatch).toThrow(second);
		expect(good).toHaveBeenCalledTimes(2);
		expect(timers).toHaveLength(0);

		spy.mockRestore();
		// 观察器的首次回调之前删除：不让抛错的监听函数在用例之外执行
		Resize.off(target);
	});

	it('observes svg elements', () => {
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		document.body.appendChild(svg);
		const off = Resize.on(svg, vi.fn());

		expect(observersOf(svg)).toHaveLength(1);
		off();
		expect(observersOf(svg)).toHaveLength(0);
		svg.remove();
	});

	describe('shared', () => {
		// 最近一次调用收到的 entries 对应的元素
		const targetsOf = (fn: any) => fn.mock.lastCall[0].map((entry: any) => entry.target);
		// 直接调用观察器的回调模拟一次派发：entries 只需要 target
		const dispatch = (observer: Observer, ...targets: Element[]) => {
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

		it('observes the elements of a listener with one observer of its own', () => {
			const targets = [create(), create()];
			const fn = vi.fn();
			targets.forEach(target => Resize.on(target, fn, shared));
			Resize.on(targets[0], vi.fn());

			expect(observersOf(targets[1])).toHaveLength(1);
			const [observer] = observersOf(targets[1]);
			// 同一元素上两种模式各有各的观察器
			expect(observersOf(targets[0])).toHaveLength(2);
			expect(observersOf(targets[0])).toContain(observer);
			// 同一个监听函数之后注册的元素仍由它的观察器监听
			const later = create();
			Resize.on(later, fn, shared);
			expect(observersOf(later)).toEqual([observer]);
			// 另一个监听函数有自己的观察器，即使监听的是同一个元素
			Resize.on(later, vi.fn(), shared);
			expect(observersOf(later)).toHaveLength(2);
		});

		it('keeps the observer of a listener after its last element was removed', async () => {
			const [a, b] = [create(), create()];
			const fn = vi.fn();
			Resize.on(a, fn, shared);
			Resize.on(b, fn, shared);
			const [observer] = observersOf(a);

			Resize.off(a, fn, shared);
			expect(observersOf(b)).toEqual([observer]);
			Resize.off(b, fn, shared);
			expect(observer.targets.size).toBe(0);

			// 再次注册时沿用原来的观察器（不必重建），照常收到回调
			Resize.on(a, fn, shared);
			expect(observersOf(a)).toEqual([observer]);
			await Utils.sleep(50);
			expect(fn).toHaveBeenCalledTimes(1);
			expect(targetsOf(fn)).toEqual([a]);
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

		it('disconnect', async () => {
			const [a, b] = [create(), create()];
			const fn = vi.fn();
			const other = vi.fn();
			const plain = vi.fn();
			Resize.on(a, fn, shared);
			Resize.on(b, fn, shared);
			Resize.on(b, other, shared);
			Resize.on(a, plain);
			await Utils.sleep(50);
			[fn, other, plain].forEach(mock => mock.mockClear());
			const observer = observers.find(item => item.targets.has(a) && item.targets.has(b))!;

			// 一次删除该监听函数在所有元素上的监听；同一元素上的其它监听函数、默认模式的监听不受影响
			Resize.disconnect(fn);
			expect(observer.targets.size).toBe(0);
			await resize(a, b);
			expect(fn).not.toHaveBeenCalled();
			expect(targetsOf(other)).toEqual([b]);
			expect(plain).toHaveBeenCalledTimes(1);

			// 没有在监听的函数直接忽略；之后重新注册照常收到回调
			Resize.disconnect(fn);
			Resize.disconnect(() => {});
			Resize.on(a, fn, shared);
			await Utils.sleep(50);
			expect(targetsOf(fn)).toEqual([a]);
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

		it('calls each listener from its own observer, so one that throws does not stop the others', () => {
			const [a, b] = [create(), create()];
			const error = new Error('bad');
			const bad = vi.fn(() => {
				throw error;
			});
			const good = vi.fn();
			Resize.on(a, bad, shared);
			Resize.on(a, good, shared);
			Resize.on(b, good, shared);

			// 浏览器逐个调用各观察器的回调：抛错只影响抛错的那个监听函数自己
			const [first, second] = observersOf(a);
			expect(() => dispatch(first, a)).toThrow(error);
			dispatch(second, a, b);
			expect(targetsOf(good)).toEqual([a, b]);
		});

		it('leaves out the elements removed before the callback', () => {
			const [a, b, c] = [create(), create(), create()];
			const fn = vi.fn();
			Resize.on(a, fn, shared);
			Resize.on(b, fn, shared);
			Resize.on(c, fn, shared);
			// b 上还有别的监听函数
			Resize.on(b, vi.fn(), shared);
			const [observer] = observersOf(a);

			// 浏览器收集好变化的元素之后、回调之前被 off 的元素（以及从未监听的元素）不带回
			Resize.off(b, fn, shared);
			dispatch(observer, a, b, c, document.createElement('div'));
			expect(targetsOf(fn)).toEqual([a, c]);

			// 一个都不剩时不回调
			fn.mockClear();
			Resize.off(a, fn, shared);
			Resize.off(c, fn, shared);
			dispatch(observer, a, b, c);
			expect(fn).not.toHaveBeenCalled();
		});
	});
});
