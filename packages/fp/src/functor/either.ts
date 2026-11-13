import { AMonad } from './abstract';

const right = <R>(value: R) => {
	return new Either<never, R>(value);
};

const left = <L>(value: L) => {
	return new Either<L, never>(value, true);
};

const try$ = <R>(fn: () => R): Either<any, R> => {
	try {
		return right(fn());
	} catch (e) {
		return left(e);
	}
};

/**
 * 说明
 * try/of
 * ok/right = Right类
 * error/left = Left类
 */
export class Either<L = any, R = any> extends AMonad<L | R> {
	static of = try$;

	static try = try$;

	static ok = right;

	static right = right;

	static left = left;

	static error = left;

	isLeft: boolean;

	isRight: boolean;

	constructor(value: L | R, isError?: boolean) {
		super(value);
		this.isLeft = !!isError;
		this.isRight = !isError;
	}

	map<R2>(fn: (value: R) => R2): Either<L, R2> {
		return this.isLeft
			? Either.left(this.value as L)
			: Either.right(fn(this.value as R));
	}

	// Left的值不参与展平
	join(): any {
		return this.isLeft ? this : super.join();
	}

	toString() {
		return `Either.${this.isLeft ? 'Left' : 'Right'}(${this.value})`;
	}
}
