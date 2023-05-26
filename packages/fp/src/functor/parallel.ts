import { ATask } from './abstract';
import { Task } from './task';

type Source = (() => Promise<any>);

export class Parallel extends ATask {
	static of(task: Source, concurrency?: number) {
		return new Parallel(task, concurrency);
	}

	original: Source;

	task: Source;

	isStart: boolean;

	target: any;

	_target: any;

	tasks: Array<any>;

	// 同一时间并发数量
	concurrency: number;

	// 报错扔继续任务，默认true
	infinite: boolean;

	constructor(task: Source, concurrency?: number) {
		super();

		this.task = task;
		this.original = task;

		this.concurrency = concurrency || 0;
		this.infinite = true;
		this.isStart = false;

		if (this.task instanceof Task && this.task.isStart) {
			this.start();
		}

		this.target = null;
		this._target = null;

		this.tasks = [];
	}


	process() {
		while (this.tasks.length < this.concurrency) {
			let leaf = this.task();
			this.tasks.push(leaf);

			Promise.resolve()
				.then(() => leaf)
				.then((x: any) => this.suspend(x, this.canceler))
				.then((x: any) => this.suspend(x, this.pasuer))
				.then((x: any) => {
					this.tasks = this.tasks.filter(i => i !== leaf);
					return x;
				})
				.then(this.onFulfilled)
				.catch(this.onRejected);
		}
	}

	onFulfilled = (e: any) => {
		if (!this.target) return;

		this.emit('fulfilled', e);
		this.process();
	};

	onRejected = (e: any) => {
		if (!this.target) return;

		this.emit('rejected', e);

		// 允许继续执行, 这个时候要调用stop来停止程序
		if (this.infinite) {
			this.process();
		} else {
			this._target.reject(e || new Error('Unknown error'));
			this.target = null;
			this._target = null;
			this.tasks = [];
		}
	};

	// 立即执行
	start() {
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
	 */
	async cancel() {
		if (!this.target) return;
		let tasks = this.tasks;
		this._target.resolve();

		this.setCancelStatus(true);
		this.target = null;
		this.tasks = [];

		this.off('fulfilled');
		this.off('rejected');

		// 已经在栈中的任务
		await Promise.allSettled(tasks);
	}

	/**
	 * 暂停执行
	 * 暂停那一刻开始不在有fulfilled/rejected事件
	 */
	async pasue() {
		let tasks = this.tasks;
		this.setPasueStatus(true);

		// 已经在栈中的任务
		await Promise.allSettled(tasks);
	}

	/**
	 * 恢复执行，之前未结束的，在停止过程中已结束，恢复后会立即执行fulfilled/rejected事件
	 */
	resume() {
		this.setPasueStatus(false);
	}
}