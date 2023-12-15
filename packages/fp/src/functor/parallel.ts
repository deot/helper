import { ATask } from './abstract';
import { Task } from './task';

type Func = () => Promise<any>;
type Source = Task | Func | (Func | Task)[];

export class Parallel extends ATask {
	static of(task: Source, concurrency?: number, options?: any) {
		return new Parallel(task, concurrency, options);
	}

	original: Source;

	task: Source;

	isStart = false;

	target: any = null;

	_target: any = null;

	tasks: Array<Promise<any> | Task> = [];

	// 同一时间并发数量
	concurrency: number;

	options: any;

	constructor(task: Source, concurrency?: number, options?: any) {
		super();

		this.options = {
			skipError: true, // 报错扔继续任务，默认true
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
			if (this.target) {
				this.process();
			}
		}
		return this.concurrency;
	}

	process() {
		while (
			this.tasks.length < this.concurrency
				&& (
					typeof this.task === 'function'
						|| this.task instanceof Task
						|| (this.task instanceof Array && this.task.length)
				)
		) {
			let leaf!: Promise<any> | Task;

			if (this.task instanceof Array) {
				const item = this.task.pop();
				/* istanbul ignore else -- @preserve */
				if (typeof item === 'function') {
					leaf = item();
				} else if (item instanceof Task) {
					leaf = item.restart();
				}
			} else if (this.task instanceof Task) {
				leaf = this.task.restart() as Task;
			} else {
				leaf = this.task();
			}

			this.tasks.push(leaf);

			Promise.resolve()
				.then(() => (leaf instanceof Task ? leaf.value : leaf))
				.then((x: any) => this.suspend(x, this.canceler))
				.then((x: any) => this.suspend(x, this.pasuer))
				.then((x: any) => {
					this.tasks = this.tasks.filter(i => i !== leaf);
					return x;
				})
				.then(this.onFulfilled)
				.catch(this.onRejected);
		}

		if (
			this.task instanceof Array
				&& !this.task.length
				&& this.tasks.length === 0
		) {
			this._target.resolve();
			this.target = null;
			this.tasks = [];
		}
	}

	onFulfilled = (e: any) => {
		/* istanbul ignore if -- @preserve */
		if (!this.target) return;

		this.emit('fulfilled', e);
		this.process();
	};

	onRejected = (e: any) => {
		/* istanbul ignore if -- @preserve */
		if (!this.target) return;

		this.emit('rejected', e);

		// 允许继续执行, 这个时候要调用stop来停止程序
		if (this.options.skipError) {
			this.process();
		} else {
			this._target.reject(e);
			this.target = null;
			this.tasks = [];
		}
	};

	/**
	 * 立即执行
	 * 返回一个Promise
	 * 	then：执行结束（包含主动取消）
	 * 	catch：异常时会中止程序（如果设置了skipError: faalse）
	 * @returns ~
	 */
	start(): Promise<any> {
		if (this.target) return this.target;
		this.target = new Promise((resolve: any, reject: any) => {
			this._target = {
				reject,
				resolve
			};
			this.process();
		});
		return this.target;
	}

	/**
	 * 取消
	 * 取消那一刻开始不在有fulfilled/rejected事件
	 * 不需要清理fulfilled/rejected的注册事件
	 * 	如果用户是主动取消又重新开始, 可以*.off('fulfilled/rejected')处理
	 *
	 * 主动取消，不在执行start后then/catch
	 */
	async cancel() {
		if (!this.target) return;
		const tasks = this.tasks;

		this.setCancelStatus(true);

		this.target = null;
		this.tasks = [];

		if (!tasks.some(i => i instanceof Task)) {
			await Promise.allSettled(tasks);
		} else {
			tasks.forEach(i => (i as Task).cancel());
		}
	}

	/**
	 * 暂停执行
	 * 暂停那一刻开始不在有fulfilled/rejected事件
	 */
	async pasue() {
		const tasks = this.tasks;
		this.setPasueStatus(true);

		if (!tasks.some(i => i instanceof Task)) {
			await Promise.allSettled(tasks);
		} else {
			tasks.forEach(i => (i as Task).pasue());
		}
	}

	/**
	 * 恢复执行，之前未结束的，在停止过程中已结束，恢复后会立即执行fulfilled/rejected事件
	 */
	resume() {
		this.setPasueStatus(false);

		const tasks = this.tasks;
		if (tasks.some(i => i instanceof Task)) {
			tasks.forEach(i => (i as Task).resume());
		}
	}

	async restart() {
		await this.cancel();
		this.setCancelStatus(false);

		if (this.original instanceof Array) {
			this.task = [...this.original];
		}

		return this.start();
	}
}
