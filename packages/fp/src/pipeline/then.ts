import { curry } from './curry';

export interface ThenFn {
	<T, R>(f: (value: T) => R | PromiseLike<R>, thenable: PromiseLike<T>): PromiseLike<R>;
	<T, R>(f: (value: T) => R | PromiseLike<R>): (thenable: PromiseLike<T>) => PromiseLike<R>;
	(...args: any[]): any;
}

// then :: f -> Thenable -> Thenable

export const then$: ThenFn = curry(function (f: any, thenable: any) {
	return thenable.then(f);
});
