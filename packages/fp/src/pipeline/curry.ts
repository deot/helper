/**
 * https://www.30secondsofcode.org/js/s/curry/
 */
import { mergeArgs } from './internal/merge-args';


export const curry = (fn: (...args: any[]) => any) => {
	return function curried(this: any, ...args: any[]) {
		if (args.length >= fn.length && !args.includes(curry)) {
			return fn.apply(this, args);
		} else {
			return function (this: any, ...nextArgs: any[]) {
				const mergedArgs = mergeArgs(args, nextArgs, curry);
				return curried.apply(this, mergedArgs);
			};
		}
	};
};

curry.placeholder = curry;
