export abstract class APointed {
	value: any;

	constructor(value: any) {
		this.value = value;
	}

	abstract map(fn: Function): any;

	abstract toString(): any;

	// 需要注意的是：AMonad('a') + 'b' = 'ab'
	// 有valueOf会先调用, 没有则调toString
	// String时会优先调用toString
	valueOf() {
		return this.value;
	}
}