import { ATask } from './abstract-task';
import { Task } from './task';

type Source<T = any> = Task<T> | (() => T | PromiseLike<T>);

const noop = () => {};

/**
 * 轮询任务：执行 -> 等待interval -> 再次执行
 * - 每一轮结束会触发`fulfilled/rejected`事件
 * - 取消后不再有事件，`start/restart`可重新开始
 */
export class Job<T = any> extends ATask {
	static of<T = any>(task: Source<T>, interval?: number) {
		return new Job<T>(task, interval);
	}

	original: Source<T>;

	// 当前正在执行的任务（Task每一轮都会restart出新的实例）
	task: Source<T>;

	interval: number;

	isStart = false;

	// 每次start/cancel都会递增，旧的循环发现不一致后退出
	_run = 0;

	_used = false;

	_timer: ReturnType<typeof setTimeout> | null = null;

	_wake: Function = noop;

	constructor(task: Source<T>, interval?: number) {
		super();

		this.task = task;
		this.original = task;

		this.interval = interval || 0;

		if (this.task instanceof Task && this.task.isStart) {
			this.start();
		}
	}

	private sleep(ms: number) {
		return new Promise<void>((resolve) => {
			this._wake = resolve;
			this._timer = setTimeout(resolve, ms);
		});
	}

	private async loop(run: number) {
		const alive = () => run === this._run;

		let leaf: any = this.original;
		// 已被消费过或已取消的Task需要重新生成
		if (leaf instanceof Task && (this._used || leaf.isCancel)) {
			leaf = leaf.restart();
		}
		this._used = true;

		while (alive()) {
			this.task = leaf;

			try {
				const x = await (leaf instanceof Task ? leaf.toPromise() : leaf());
				if (!alive()) return;
				this.emit('fulfilled', x);
			} catch (e) {
				if (!alive()) return;
				this.emit('rejected', e);
			}

			// 监听器内可能已经取消或重启
			if (!alive()) return;
			await this.sleep(this.interval);
			if (!alive()) return;

			await this.pauser;
			if (!alive()) return;

			// Task可以更加细粒度的中断
			if (leaf instanceof Task) {
				leaf = leaf.restart();
			}
		}
	}

	// 立即执行
	start() {
		if (this.isStart) return this;
		this.isStart = true;
		this.setCancelStatus(false);

		this.loop(++this._run);
		return this;
	}

	// 暂停执行
	pause() {
		if (this.task instanceof Task) {
			this.task.pause();
		}
		this.setPauseStatus(true);
		return this;
	}

	// 恢复执行
	resume() {
		if (this.task instanceof Task) {
			this.task.resume();
		}
		this.setPauseStatus(false);
		return this;
	}

	// 取消执行，之后不再有fulfilled/rejected事件
	cancel() {
		this._run++;
		this.isStart = false;
		this.setCancelStatus(true);

		// 让等待中的循环立即醒来并退出
		if (this._timer) {
			clearTimeout(this._timer);
			this._timer = null;
		}
		this._wake();
		this._wake = noop;
		this.setPauseStatus(false);

		if (this.task instanceof Task) {
			this.task.cancel();
		}
		return this;
	}

	restart() {
		this.cancel();
		return this.start();
	}
}
