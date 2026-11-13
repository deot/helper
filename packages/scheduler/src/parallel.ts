import { ATask } from './abstract-task';
import { CancelError } from './cancel-error';
import { Task } from './task';

type Func<T = any> = () => T | PromiseLike<T>;
type Item<T = any> = Task<T> | Func<T>;
type Source<T = any> = Item<T> | Item<T>[];

export interface ParallelOptions {
	// 报错仍继续任务，默认true
	skipError?: boolean;
}

const noop = () => {};

/**
 * 并发任务
 * - 数组：按输入顺序取任务，全部结束后`start()`返回与输入同序的结果（同Promise.allSettled）
 * - 单个函数/Task：常驻任务池，不会自行结束，直到取消
 */
export class Parallel<T = any> extends ATask {
	static of<T = any>(task: Source<T>, concurrency?: number, options?: ParallelOptions) {
		return new Parallel<T>(task, concurrency, options);
	}

	original: Source<T>;

	task: Source<T>;

	isStart = false;

	target: Promise<PromiseSettledResult<T>[]> | null = null;

	_target: { resolve: Function; reject: Function } | null = null;

	// 正在执行的任务
	tasks: Array<Promise<any> | Task<any>> = [];

	// 数组任务的结果，与输入同序
	results: PromiseSettledResult<T>[] = [];

	// 同一时间并发数量
	concurrency: number;

	options: ParallelOptions;

	// 每次start/cancel都会递增，旧一轮的在途任务发现不一致后被忽略
	_run = 0;

	// 数组任务的游标
	_index = 0;

	// restart()返回的Promise，取消时需要一并标记为已处理
	_waiters: Promise<any>[] = [];

	constructor(task: Source<T>, concurrency?: number, options?: ParallelOptions) {
		super();

		this.options = {
			skipError: true,
			...options
		};

		this.task = task;
		this.original = task instanceof Array ? [...task] : task;

		this.concurrency = concurrency || 1;
	}

	setConcurrency(value: number) {
		/* istanbul ignore else -- @preserve */
		if (typeof value === 'number' && value > 0) {
			this.concurrency = value;
			this.process();
		}
		return this.concurrency;
	}

	process() {
		// 未开始或暂停期间不启动新任务
		if (!this.target || this.isPause) return;

		const run = this._run;
		const source = this.original;

		while (
			this.tasks.length < this.concurrency
			&& (!(source instanceof Array) || this._index < source.length)
		) {
			const index = this._index++;
			const item = source instanceof Array ? source[index] : source;

			let leaf: Promise<any> | Task<any>;
			if (item instanceof Task) {
				leaf = item.restart();
			} else {
				try {
					leaf = Promise.resolve(item());
				} catch (e) {
					leaf = Promise.reject(e);
				}
			}

			this.tasks.push(leaf);

			Promise.resolve(leaf instanceof Task ? leaf.toPromise() : leaf).then(
				(value: T) => this.settle(run, leaf, index, { status: 'fulfilled', value }),
				(reason: any) => this.settle(run, leaf, index, { status: 'rejected', reason })
			);
		}

		if (
			source instanceof Array
			&& this._index >= source.length
			&& this.tasks.length === 0
		) {
			const { resolve } = this._target!;
			this.clear();
			this._waiters = [];
			resolve(this.results);
		}
	}

	private clear() {
		this.target = null;
		this._target = null;
		this.tasks = [];
		this.isStart = false;
	}

	private async settle(run: number, leaf: Promise<any> | Task<any>, index: number, result: PromiseSettledResult<T>) {
		// 暂停期间已结束的任务，恢复后再触发事件
		while (run === this._run && this.isPause) {
			await this.pauser;
		}
		if (run !== this._run) return;

		this.tasks = this.tasks.filter(i => i !== leaf);
		if (this.original instanceof Array) {
			this.results[index] = result;
		}

		const failed = result.status === 'rejected';
		try {
			if (failed) {
				this.emit('rejected', result.reason);
			} else {
				this.emit('fulfilled', result.value);
			}
		} finally {
			// 监听器内可能已经取消或重启，此时不再推进这一轮
			if (run === this._run) {
				// skipError允许继续执行, 这个时候要调用cancel来停止程序
				if (!failed || this.options.skipError) {
					this.process();
				} else {
					const { reject } = this._target!;
					this._run++;
					this.clear();
					this._waiters = [];
					reject(result.reason);
				}
			}
		}
	}

	/**
	 * 立即执行
	 * 返回一个Promise
	 * 	then：数组任务全部结束，值为与输入同序的结果
	 * 	catch：主动取消（CancelError），或异常时中止（设置了skipError: false）
	 * @returns ~
	 */
	start(): Promise<PromiseSettledResult<T>[]> {
		if (this.target) return this.target;

		this._run++;
		this._index = 0;
		this.results = [];
		this.isStart = true;
		this.setCancelStatus(false);

		this.target = new Promise((resolve: any, reject: any) => {
			this._target = {
				reject,
				resolve
			};
		});

		const target = this.target;
		this.process();
		return target;
	}

	/**
	 * 取消
	 * 取消那一刻开始不在有fulfilled/rejected事件
	 * 不需要清理fulfilled/rejected的注册事件
	 * 	如果用户是主动取消又重新开始, 可以*.off('fulfilled/rejected')处理
	 *
	 * start()返回的Promise会以CancelError结束
	 * 函数任务无法中断，这里会等待在途的函数执行结束
	 */
	async cancel() {
		if (!this.target) return;

		const tasks = this.tasks;
		const target = this.target;
		const { reject } = this._target!;

		this._run++;
		this.setCancelStatus(true);
		this.clear();

		// 让暂停中等待的任务醒来并退出
		this.setPauseStatus(false);

		// 主动取消属于预期行为，不应该产生unhandledRejection
		this._waiters.concat(target).forEach(i => i.catch(noop));
		this._waiters = [];
		reject(new CancelError());

		const pending: Promise<any>[] = [];
		tasks.forEach((i) => {
			if (i instanceof Task) {
				i.cancel();
			} else {
				pending.push(i);
			}
		});

		await Promise.allSettled(pending);
	}

	/**
	 * 暂停执行
	 * 暂停那一刻开始不在有fulfilled/rejected事件
	 * 函数任务无法中断，这里会等待在途的函数执行结束
	 */
	async pause() {
		this.setPauseStatus(true);

		const pending: Promise<any>[] = [];
		this.tasks.forEach((i) => {
			if (i instanceof Task) {
				i.pause();
			} else {
				pending.push(i);
			}
		});

		await Promise.allSettled(pending);
	}

	/**
	 * 恢复执行，之前未结束的，在停止过程中已结束，恢复后会立即执行fulfilled/rejected事件
	 * @returns ~
	 */
	resume() {
		this.setPauseStatus(false);

		this.tasks.forEach((i) => {
			if (i instanceof Task) {
				i.resume();
			}
		});

		// 暂停期间如果调大了并发数，这里补齐
		this.process();
		return this;
	}

	restart(): Promise<PromiseSettledResult<T>[]> {
		const target = this.cancel().then(() => this.start());

		this._waiters.push(target);
		return target;
	}
}
