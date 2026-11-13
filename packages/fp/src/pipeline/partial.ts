/**
 * https://www.30secondsofcode.org/js/s/append-function-arguments/
 */
import { mergeArgs } from './internal/merge-args';

type AnyFn = (...args: any[]) => any;

export interface Partial$ {
	<F extends AnyFn>(fn: F, ...partialArgs: any[]): (...args: any[]) => ReturnType<F>;
	placeholder: Partial$;
}

export const partial = ((fn: AnyFn, ...partialArgs: any[]) => {
	return function (this: any, ...nextArgs: any[]) {
		return fn.apply(this, mergeArgs(partialArgs, nextArgs, partial));
	};
}) as Partial$;

partial.placeholder = partial;
