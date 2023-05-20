import { AMonad } from './abstract';

/**
 * 这里不区分Just类和Nothing类，由toString处理
 */
export class Maybe extends AMonad {
	static of(value: any) {
		return new Maybe(value);
	}

	map(fn: Function) {
		return this.isNothing() 
			? Maybe.of(this.value) 
			: Maybe.of(fn(this.value));
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

	valueOf(other?: any) {
		return typeof other !== 'undefined' && this.isNothing() 
			? other 
			: this.value;
	}
}