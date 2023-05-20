import { AMonad } from './abstract';

const right = (value: any) => {
	return new Either(value);
};

const left = (value: any) => {
	return new Either(value, true);
};

const try$ = (fn: Function) => {
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
export class Either extends AMonad {
	static of = try$;

	static try = try$;

	static ok = right;

	static right = right;

	static left = left;

	static error = left;

	isLeft: boolean;

	isRight: boolean;

	constructor(value: any, isError?: boolean) {
		super(value);
		this.isLeft = !!isError;
		this.isRight = !isError;
	}

	map(fn: Function) {
		return this.isLeft 
			? Either.left(this.value) 
			: Either.right(fn(this.value));
	}
	
	toString() {
		return `Either.${this.isLeft ? 'Left' : 'Right'} (${this.value})`;
	}
}