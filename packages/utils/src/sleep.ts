import { range } from './random';

export const sleep = (
	wait?: number | { min: number; max: number },
	immediate?: (timer: ReturnType<typeof global.setTimeout>, duration: number, done: Function) => any
) => {
	let duration: number;
	if (typeof wait === 'object') {
		duration = range(wait.min, wait.max);
	} else {
		duration = wait || 0;
	}

	return new Promise((r) => {
		const timer = setTimeout(r, duration);

		immediate && immediate(timer, duration, r);
	});
};
