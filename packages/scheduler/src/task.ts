import { CancelError } from './cancel-error';

export interface TaskContext {
	// 注册取消时的清理逻辑（如clearTimeout），已取消时会立即执行
	onCancel: (hook: () => void) => void;
	// 运行环境支持AbortController时可用（部分小程序环境没有）
	readonly signal?: AbortSignal;
}

type DeriveType = 'map' | 'flatMap';

const noop = () => {};
const isThenable = (v: any): v is Promise<any> => !!v && typeof v.then === 'function';

/**
 * 串行任务，支持暂停、取消、重启
 * - 取消后等待者会收到`CancelError`
 * - `map`的回调第二个参数提供`onCancel/signal`用于清理
 */
export class Task<T = any> {
	static of<T = any>(v: T | PromiseLike<T>, parent?: Task<any> | null): Task<Awaited<T>> {
		return new Task<Awaited<T>>(v, parent);
	}

	// 根节点为原始值，派生节点为Promise
	value: any;

	result: any = '';

	cancelHooks: Function[] = [];

	// 已取消
	isCancel = false;

	// 已完成
	isComplete = false;

	isStart: boolean;

	isPause = false;

	parent: Task<any> | null;

	child: Task<any> | null = null;

	// 当前节点是如何由父节点派生的，restart时沿 根 -> 当前节点 重放
	record: [DeriveType, Function] | null = null;

	ready: Promise<any>;

	_ready: Function = noop;

	pauser: Promise<any> = Promise.resolve();

	_pauser: Function = noop;

	_cancel: (e: any) => void = noop;

	constructor(value: any, parent?: Task<any> | null) {
		this.value = value;
		this.parent = parent || null;
		this.isStart = parent?.isStart || false;

		// 如果已经开始了, ready可以直接执行
		this.ready = this.isStart
			? Promise.resolve()
			: new Promise((resolve) => {
					this._ready = resolve;
				});
	}

	/**
	 * @deprecated 拼写错误，使用`pauser`
	 * @returns ~
	 */
	get pasuer() {
		return this.pauser;
	}

	private derive(type: DeriveType, fn: Function): Task<any> {
		let controller: AbortController | undefined;
		let cancel!: (e: any) => void;

		const canceler = new Promise<never>((_, reject) => {
			cancel = reject;
		});

		const context: TaskContext = {
			onCancel: (hook) => {
				if (leaf.isCancel) {
					hook();
				} else {
					leaf.cancelHooks.push(hook);
				}
			},
			get signal() {
				if (!controller && typeof AbortController !== 'undefined') {
					const current = new AbortController();
					controller = current;
					context.onCancel(() => current.abort());
				}
				return controller?.signal;
			}
		};

		// 嵌套的Task展平为其结果，外层取消时一并取消
		const unwrap = async (x: any) => {
			while (x instanceof Task) {
				const inner = x;
				context.onCancel(() => inner.cancel());
				x = await inner.toPromise();
			}
			return x;
		};

		const work = this.ready
			.then(() => this.value)
			.then((x: any) => this.pauser.then(() => x))
			.then((x: any) => {
				if (leaf.isCancel) return;
				return type === 'flatMap'
					? unwrap(x).then(v => fn(v, context)).then(unwrap)
					: fn(x, context);
			});

		const leaf: Task<any> = new Task(
			Promise.race([canceler, work]).then(
				(result) => {
					leaf.isComplete = true;
					leaf.result = result;
					return result;
				},
				(error) => {
					if (!leaf.isCancel) {
						leaf.isComplete = true;
					}
					throw error;
				}
			),
			this
		);

		leaf._cancel = cancel;
		leaf.record = [type, fn];

		this.child = leaf;
		return leaf;
	}

	map<R = any>(fn: (value: T, context: TaskContext) => R | PromiseLike<R>): Task<Awaited<R>> {
		return this.derive('map', fn);
	}

	// 与map的区别：值或fn的返回值是Task时，会展平为它的结果
	flatMap<R = any>(fn: (value: any, context: TaskContext) => R | PromiseLike<R> | Task<R>): Task<Awaited<R>> {
		return this.derive('flatMap', fn);
	}

	reduce<R = any>(
		collection: any[] | ((value: T) => (PromiseLike<any[]> | any[])),
		done: (pre: any, cur: any, index: number, source: any[]) => any
	): Task<R> {
		return this.map(async (v: any) => {
			// 不能覆盖collection，restart时需要重新求值
			const source = typeof collection === 'function'
				? await collection(v)
				: collection;

			return source.reduce((pre: Promise<any>, cur: any, index: number, array: any[]) => {
				return pre.then((v$: any) => done(v$, cur, index, array));
			}, Promise.resolve(v));
		});
	}

	// 立即执行，先父后子
	start() {
		if (this.isStart) return this;
		this.isStart = true;
		this.parent?.start();
		this._ready();

		return this;
	}

	// 暂停执行（已经在执行的函数不会被打断，在下一个节点前等待）
	pause() {
		this.parent?.pause();
		if (!this.isPause) {
			this.isPause = true;
			this.pauser = new Promise((resolve) => {
				this._pauser = resolve;
			});
		}

		return this;
	}

	/**
	 * @deprecated 拼写错误，使用`pause`
	 * @returns ~
	 */
	pasue() {
		return this.pause();
	}

	// 恢复执行
	resume() {
		if (this.isPause) {
			this.isPause = false;
			this._pauser();
			this._pauser = noop;
		}
		this.parent?.resume();

		return this;
	}

	// 取消执行 先子后父，等待者会收到CancelError
	cancel() {
		if (this.isCancel || this.isComplete) return this;
		this.isCancel = true;

		// 主动取消属于预期行为，不应该产生unhandledRejection
		if (this.parent && isThenable(this.value)) {
			this.value.catch(noop);
		}
		this._cancel(new CancelError());

		const hooks = this.cancelHooks;
		this.cancelHooks = [];

		try {
			hooks.forEach(fn => fn());
		} finally {
			this.parent?.cancel();
		}

		return this;
	}

	end() {
		return this.cancel();
	}

	immediate() {
		return this.start();
	}

	// 取消当前链路，并以相同的步骤重新生成一条新的链路（从根到当前节点）
	restart(v?: any): Task<T> {
		this.cancel();

		const records: Array<[DeriveType, Function]> = [];

		let root: Task<any> = this;
		while (root.parent) {
			records.unshift(root.record!);
			root = root.parent;
		}

		let next: Task<any> = new Task(typeof v !== 'undefined' ? v : root.value);
		records.forEach(([type, fn]) => {
			next = next[type](fn as any);
		});

		return next.start();
	}

	toPromise(): Promise<T> {
		if (!this.isStart) {
			this.start();
		}

		return this.parent ? this.value : Promise.resolve(this.value);
	}

	toString() {
		return `Task(${this.result})`;
	}

	valueOf() {
		return this.result;
	}
}
