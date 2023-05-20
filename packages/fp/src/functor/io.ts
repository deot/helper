import { AMonad } from './abstract';
import { compose } from '../pipeline';

/**
 * 惰性执行
 */
export class IO extends AMonad {
	static of(value: any) {
		return new IO(() => value);
	}

	map(fn: Function) {
		return new IO(compose(fn, this.value));
	}

	toString() {
		return `IO(${this.value()})`;
	}

	valueOf() {
		return this.value();
	}
}