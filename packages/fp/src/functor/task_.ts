import { AMonad } from './abstract';

/**
 * 最基本的Task
 */
export class Task extends AMonad {
	static of(value: any) {
		return new Task(value);
	}

	result: any;

	constructor(value: any) {
		super(value);

		this.result = undefined;
	}

	map(fn: Function) {
		let v = this.value;
		v = v && v.then 
			? v
			: Promise.resolve(v);
		return Task.of(
			v.then((x: any) => fn(x))
		);
	}

	async run() {
		const v = await this.value;

		this.result = v;

		return this;
	}

	toString() {
		return `Task(${this.result})`;
	}

	valueOf() {
		return this.result;
	}
}