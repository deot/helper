// 与Pointed多了flatMap，处理xx.of(xx.of(xx.of('组合的情况')))
export abstract class AMonad {
	value: any;

	constructor(value: any) {
		this.value = value;
	}

	abstract toString(): any;

	abstract map(fn: Function): any;

	// this.join().map()会导致不同Monadic混用时this出现问题
	flatMap(fn: Function): any {
		const v = this.join();

		this.value = v.value;
		return this.map(fn);
	}

	join(): any {
		if (!(this.value instanceof AMonad)) {
			return this;
		}
		return this.value.join();
	}

	// 需要注意的是：AMonad('a') + 'b' = 'ab'
	// 有valueOf会先调用, 没有则调toString
	// String时会优先调用toString
	valueOf() {
		return this.value;
	}
}
