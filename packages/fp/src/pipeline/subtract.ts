import { curry } from './curry';

type Subtract = (arg1: number, arg2: number) => number;
export const subtract: Subtract = curry((arg1, arg2) => {
	let r1: number;
	let r2: number;
	const m: number;
	const n: number;

	try {
		r1 = arg1.toString().split('.')[1].length;
	} catch (e) {
		r1 = 0;
	}
	try {
		r2 = arg2.toString().split('.')[1].length;
	} catch (e) {
		r2 = 0;
	}
	m = 10 ** Math.max(r1, r2);
	n = (r1 >= r2) ? r1 : r2;
	return +((arg1 * m - arg2 * m) / m).toFixed(n);
});
