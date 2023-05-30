import { debounce } from './debounce';

interface Options {
	leading?: boolean;
	trailing?: boolean;
}

export const throttle = (original: Function, wait: number, options: Options) => {
	const { leading, trailing } = options || {};
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