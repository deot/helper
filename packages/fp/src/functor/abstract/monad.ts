// 与Pointed多了flatMap，处理fn返回的也是Monad的情况
export abstract class AMonad<T = any> {
	value: T;

	constructor(value: T) {
		this.value = value;
	}

	abstract toString(): string;

	abstract map(fn: (value: any) => any): any;

	// 标准的chain：先map，再展平一层
	flatMap(fn: (value: any) => any): any {
		return this.map(fn).join();
	}

	// 展平一层，不修改当前实例
	join(): any {
		return this.value instanceof AMonad ? this.value : this;
	}

	// 展平所有层级，处理xx.of(xx.of(xx.of('组合的情况')))
	// 不同Monadic混用时，返回的是最内层的那个实例
	flatten(): any {
		let current: AMonad = this;
		while (current.value instanceof AMonad) {
			current = current.value;
		}
		return current;
	}

	// 需要注意的是：AMonad('a') + 'b' = 'ab'
	// 有valueOf会先调用, 没有则调toString
	// String时会优先调用toString
	valueOf(): any {
		return this.value;
	}
}
