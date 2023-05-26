import { ATask } from './abstract';
import { Task } from './task';

type Source = Task | (() => Promise<any>);

export class Job extends ATask {
	static of(task: Source, interval?: number) {
		return new Job(task, interval);
	}

	original: Source;

	task: Source;

	interval: number;

	isStart: boolean;

	constructor(task: Source, interval?: number) {
		super();

		this.task = task;
		this.original = task;

		this.interval = interval || 0;
		this.isStart = false;

		if (this.task instanceof Task && this.task.isStart) {
			this.start();
		}
	}

	process(leaf?: any) {
		leaf = leaf || this.original;
		if (this.task !== leaf) {
			this.task = leaf;
		}

		let interrupter = (v: any) => Promise.resolve(v)
			.then((x: any) => this.suspend(x, new Promise((_) => { setTimeout(_, this.interval); })))
			.then((x: any) => this.suspend(x, this.canceler))
			.then((x: any) => this.suspend(x, this.pasuer));

		// Task可以更加细粒度的中断
		return this.original instanceof Task
			? Promise.resolve()
				.then(() => (leaf.isCancel ? Promise.resolve() : leaf.value))
				.then((x: any) => interrupter(x))
				.then(() => leaf.restart())
				.then(v => this.process(v))
			: Promise.resolve()
				.then(() => (this.original as Function)())
				.then((x: any) => interrupter(x))
				.then(v => this.process(v));
	}

	// 立即执行，先父后子
	start() {
		if (this.isStart) return;
		this.isStart = true;

		if (
			this.original instanceof Task 
			&& !this.original.isStart
		) {
			this.original.start();
		}
		
		this.process();
	}

	// 暂停执行
	pasue() {
		if (this.task instanceof Task) {
			this.task.pasue();
		}
		this.setPasueStatus(true);
	}

	// 恢复执行
	resume() {
		if (this.task instanceof Task) {
			this.task.resume();
		}
		this.setPasueStatus(false);
	}

	// 取消执行 先子后父
	cancel() {
		if (this.task instanceof Task) {
			this.task.cancel();
		}
		this.setCancelStatus(true);
	}

	restart() {
		if (this.task instanceof Task) {
			this.task.pasue();
			this.task.cancel();
		}
		
		this.setCancelStatus(false);
		
		this.isStart = false;
		this.process();
	}
}