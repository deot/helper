export abstract class APointed<T = any> {
	value: T;

	constructor(value: T) {
		this.value = value;
	}

	abstract map(fn: (value: any) => any): any;

	abstract toString(): string;

	// 需要注意的是：AMonad('a') + 'b' = 'ab'
	// 有valueOf会先调用, 没有则调toString
	// String时会优先调用toString
	valueOf(): any {
		return this.value;
	}
}
