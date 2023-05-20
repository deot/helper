import { APointed } from './abstract';
/**
 * Pointed 函子和 Monad 函子有不同的设计目的和方法。
 * Pointed 函子用于提升普通值到函子的上下文，
 * 而 Monad 函子不仅具有提升值的能力，还提供了扁平化操作的能力。
 * Monad 函子是 Pointed 函子的扩展。
 */
export class Pointed extends APointed {
	static of(value: any) {
		return new Pointed(value);
	}

	map(fn: Function) {
		return Pointed.of(fn(this.value));
	}

	// 返回一个当前结构的文本描述
	toString() {
		return `Pointed(${this.value})`;
	}
}
