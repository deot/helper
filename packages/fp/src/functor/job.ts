import { ATask } from './abstract';
import { Task } from './task';

export class Job extends ATask {
	static of(task: Task, interval?: number) {
		return new Job(task, interval);
	}

	original: Task;

	task: Task;

	interval: number;

	isStart: boolean;

	constructor(task: Task, interval?: number) {
		super();
		this.task = task;
		this.original = task;

		this.interval = interval || 0;
		this.isStart = false;

		if (task.isStart) {
			this.start();
		}
	}

	process(leaf?: any) {
		leaf = leaf || this.original;
		if (this.task !== leaf) {
			this.task = leaf;
		}
		return Promise.resolve()
			.then(() => (leaf.isCancel ? Promise.resolve() : leaf.value))
			.then((x: any) => this.suspend(x, new Promise((_) => { setTimeout(_, this.interval); })))
			.then((x) => this.suspend(x, this.canceler))
			.then((x: any) => this.suspend(x, this.pasuer))
			.then(() => leaf.restart())
			.then(v => this.process(v));
	}

	// 立即执行，先父后子
	start() {
		if (this.isStart) return;
		this.isStart = true;

		if (!this.original.isStart) {
			this.original.start();
		}
		
		this.process();
	}

	// 暂停执行
	pasue() {
		this.task.pasue();
		this.setPasueStatus(true);
	}

	// 恢复执行
	resume() {
		this.task.resume();
		this.setPasueStatus(false);
	}

	// 取消执行 先子后父
	cancel() {
		this.task.cancel();
		this.setCancelStatus(true);
	}

	restart() {
		this.task.pasue();
		this.task.cancel();
		this.setCancelStatus(false);
		
		this.isStart = false;
		this.process();
	}
}