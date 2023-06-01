import { AMonad } from './abstract';

export class Monad extends AMonad {
	static of(value: any) {
		return new Monad(value);
	}

	map(fn: Function) {
		return Monad.of(fn(this.value));
	}

	// 返回一个当前结构的文本描述
	toString() {
		return `Monad(${this.value})`;
	}
}
