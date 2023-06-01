import { AMonad } from './abstract';

/**
 * 串行任务，增加cancel等
 * TODO: 提供cleanup, 清理setTimeout取消需要清理
 */
export class Task extends AMonad {
	static of(v: any, parent?: any) {
		return new Task(v, parent);
	}

	result: any;

	cancelHooks: Array<Function>;

	// 已取消
	isCancel: boolean;

	// 已完成
	isComplete: boolean;

	isStart: boolean;

	parent: Task | null;

	child: Task | null;

	record: [string, Function] | null;

	ready: Promise<any>;

	_ready: Function;

	pasuer: Promise<any>;

	_pasuer: Function;

	constructor(value: any, parent?: any) {
		super(value);

		this.result = '';
		this.cancelHooks = [];

		this.parent = parent;
		this.child = null;
		this.record = null;


		this.isCancel = false;
		this.isComplete = false;
		this.isStart = parent?.isStart || false;

		/* istanbul ignore next */
		this._ready = () => {};

		// 如果已经开始了, ready可以直接执行
		this.ready = this.isStart 
			? Promise.resolve()
			: new Promise((resolve) => {
				this._ready = resolve;
			});

		/* istanbul ignore next */
		this._pasuer = () => {};
		this.pasuer = Promise.resolve();
	}

	map(this: any, fn: Function) {
		if (!this.record) {
			this.record = ['map', fn];
		}
		const leaf = Task.of(
			this.ready
				.then(() => this.value)
				.then((x: any) => this.pasuer.then(() => x))
				.then((x: any) => {
					return new Promise((resolve, reject) => {
						let error: any;
						let result: any;
						if (leaf.isCancel) return;
						(async () => {
							try {
								result = await Promise.race([
									new Promise((_, $reject) => {
										leaf.cancelHooks.push($reject);
									}),
									fn(x)
								]);
							} catch (e) {
								error = e;
							} finally {
								if (!leaf.isCancel) {
									leaf.isComplete = true;
									if (!error) {
										leaf.result = result;
										resolve(result);
									} else {
										reject(error);
									}
								}
							}
						})();
					});
				}),
			this
		);

		this.child = leaf;
		return leaf;
	}

	flatMap(fn: Function) {
		this.record = ['flatMap', fn];
	    return super.flatMap(fn);
	}

	reduce(collection: any[] | ((...args: any[]) => (Promise<any[]> | any[])), done: Function) {
		return this.map(async (v: any) => {
			if (typeof collection === 'function') {
				collection = await collection(v);
			}

			return collection.reduce((pre, cur, index, source) => {
				return pre.then((v$: any) => done(v$, cur, index, source));
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

	// 暂停执行
	pasue() {
		this.parent?.pasue();
		this.pasuer = new Promise((resolve) => {
			this._pasuer = resolve;
		});

		return this;
	}

	// 恢复执行
	resume() {
		this._pasuer();
		this.parent?.resume();

		return this;
	}

	// 取消执行 先子后父
	cancel() {
		if (this.isCancel || this.isComplete) return this;
		this.isCancel = true;
		this.cancelHooks.forEach(fn => fn());
		
		this.parent?.cancel();
		return this;
	}

	end() {
		return this.cancel();
	}

	immediate() {
		return this.start();
	}

	restart(this: any, v?: any) {
		this.cancel();

		// eslint-disable-next-line
		let next = this;
		let parent = next.parent || next;
		while (parent && parent.parent) {
			parent = parent.parent;
		}

		next = Task.of(v || parent.value);
		let child = parent;

		while (child && child.child) {
			const [key, fn] = child.record;
			if (key) {
				next = next[key](fn);	
			}
			
			child = child.child;
		}

		if (!next.isStart) {
			next.start();
		}

		return next;
	}

	toPromise() {
		if (!this.isStart) {
			this.start();
		}

		return this.value;
	}

	toString() {
		return `Task(${this.result})`;
	}

	valueOf() {
		return this.result;
	}
}