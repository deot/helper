import { AMonad } from './abstract';

/**
 * 惰性执行
 * map/flatMap只做组合，直到valueOf/toString/run才真正执行
 */
export class IO<T = any> extends AMonad<any> {
	static of<T>(value: T) {
		return new IO<T>(value);
	}

	// 为true时value是待执行的函数，由map/flatMap等内部生成
	lazy: boolean;

	constructor(value: any, lazy?: boolean) {
		super(value);
		this.lazy = !!lazy;
	}

	run(): T {
		return this.lazy ? this.value() : this.value;
	}

	map<R>(fn: (value: T) => R): IO<R> {
		return new IO<R>(() => fn(this.run()), true);
	}

	flatMap<R>(fn: (value: T) => R | IO<R>): IO<R> {
		return new IO<R>(() => {
			const result = fn(this.run());
			return result instanceof IO ? result.run() : result;
		}, true);
	}

	join(): IO<any> {
		return new IO(() => {
			const result = this.run();
			return result instanceof IO ? result.run() : result;
		}, true);
	}

	flatten(): IO<any> {
		return new IO(() => {
			let result: any = this.run();
			while (result instanceof AMonad) {
				result = result instanceof IO ? result.run() : result.value;
			}
			return result;
		}, true);
	}

	toString() {
		return `IO(${this.run()})`;
	}

	valueOf(): T {
		return this.run();
	}
}
