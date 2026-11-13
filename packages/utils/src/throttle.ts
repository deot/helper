import { debounce } from './debounce';
import type { Debounced } from './debounce';

export interface ThrottleOptions {
	leading?: boolean;
	trailing?: boolean;
}

export const throttle = <T extends Function>(original: T, wait?: number, options?: ThrottleOptions): Debounced<T> => {
	const { leading = true, trailing = true } = options || {};
	return debounce(
		original,
		wait,
		{
			leading,
			trailing,
			throttle: true
		}
	);
};
