import { AMonad } from './abstract';

const UNCOMPLETE = Symbol('UNCOMPLETE');
/**
 * 串行任务，这里是最基本的Task，不含setTimeout取消，事件机制
 * 其实map也可以用Generator*来设计
 * 扩展参考Serial
 */
export class Task extends AMonad {
	static of(value: any) {
		return new Task(value);
	}

	result: any;

	constructor(value: any) {
		super(value);

		this.result = UNCOMPLETE;
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

	isComplete() {
		return this.result !== UNCOMPLETE;
	}

	toString() {
		return `Task(${this.result})`;
	}

	valueOf() {
		return this.result;
	}
}