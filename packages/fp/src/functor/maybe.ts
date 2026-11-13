import { AMonad } from './abstract';

/**
 * 这里不区分Just类和Nothing类，由toString处理
 */
export class Maybe<T = any> extends AMonad<T> {
	static of<T>(value: T) {
		return new Maybe<T>(value);
	}

	map<R>(fn: (value: NonNullable<T>) => R): Maybe<R> {
		return this.isNothing()
			? Maybe.of(this.value as any)
			: Maybe.of(fn(this.value as NonNullable<T>));
	}

	toString() {
		return this.isNothing() ? `Maybe.Nothing` : `Maybe.Just(${this.value})`;
	}

	// 定义一个判断是不是null或者undefined的函数，返回true/false
	isNothing() {
		return this.value === null || this.value === undefined;
	}

	isJust() {
		return !this.isNothing();
	}

	valueOf(other?: any): any {
		return typeof other !== 'undefined' && this.isNothing()
			? other
			: this.value;
	}
}
