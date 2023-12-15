import { AMonad } from './abstract';
import { compose } from '../pipeline';

/**
 * 惰性执行
 */
export class IO extends AMonad {
	static of(value: any) {
		return new IO(value);
	}

	map(fn: Function) {
		const composed = compose(
			fn,
			this.value._isIO ? this.value : () => this.value
		);
		// @ts-ignore
		composed._isIO = true;
		return IO.of(composed);
	}

	toString() {
		return `IO(${this.value()})`;
	}

	valueOf() {
		return this.value();
	}
}
