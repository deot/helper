import { AMonad } from './abstract';

const TASK_UNCOMPLETE = Symbol('TASK_UNCOMPLETE');
/**
 * 任务
 * TODO:
 * 1. fn里可能存在setTimeout
 * 2. catch处理
 * 3. 事件机制
 */
export class Task extends AMonad {
	static of(value: any) {
		return new Task(Promise.resolve(value));
	}

	result: any;

	constructor(value: any) {
		super(value);

		this.result = TASK_UNCOMPLETE;
	}

	map(fn: Function) {
		return new Task(
			this.value
				.then((x: any) => fn(x))
		);
	}

	async run() {
		const v = await this.value;

		this.result = v;
	}

	isComplete() {
		return this.result !== TASK_UNCOMPLETE;
	}

	toString() {
		return `Task(${this.result})`;
	}

	valueOf() {
		return this.result;
	}

	// TODO: 事件机制
	listen() {}
}