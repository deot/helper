import { range } from "./random";

export const sleep = (
	wait: number | { min: number; max: number }, 
	immediate?: (timer: ReturnType<typeof global.setTimeout>, duration: number, done: Function) => any
) => {
	let duration: number;
	if (typeof wait === 'object') {
		duration = range(wait.min, wait.max);
	} else {
		duration = wait;
	}

	return new Promise(r => {
		let timer = setTimeout(r, duration || 0);

		immediate && immediate(timer, duration, r);
	});
};