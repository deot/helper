/**
 * https://www.30secondsofcode.org/js/s/append-function-arguments/
 */
import { mergeArgs } from './internal/merge-args';

export const partial = (fn: (...args: any[]) => any, ...partialArgs: any[]) => {
	return function (this: any, ...nextArgs: any[]) {
		return fn.apply(this, mergeArgs(partialArgs, nextArgs, partial));
	};
};

partial.placeholder = partial;