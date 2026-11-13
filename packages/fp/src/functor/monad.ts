import { AMonad } from './abstract';

export class Monad<T = any> extends AMonad<T> {
	static of<T>(value: T) {
		return new Monad<T>(value);
	}

	map<R>(fn: (value: T) => R): Monad<R> {
		return Monad.of(fn(this.value));
	}

	// 返回一个当前结构的文本描述
	toString() {
		return `Monad(${this.value})`;
	}
}
