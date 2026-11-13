import { curry } from './curry';

export interface CatchFn {
	<T, R>(f: (reason: any) => R | PromiseLike<R>, promise: Promise<T>): Promise<T | R>;
	<R>(f: (reason: any) => R | PromiseLike<R>): <T>(promise: Promise<T>) => Promise<T | R>;
	(...args: any[]): any;
}

// catchP :: f -> Promise -> Promise
export const catch$: CatchFn = curry(function (f: any, promise: any) {
	return promise.catch(f);
});
