import { curry } from './curry';

type Divide = (arg1: number, arg2: number) => number;
export const divide: Divide = curry((arg1: number, arg2: number) => {
	let t1 = 0;
	let t2 = 0;
	try {
		t1 = arg1.toString().split('.')[1].length;
	} catch (e) { /* empty */ }
	try {
		t2 = arg2.toString().split('.')[1].length;
	} catch (e) { /* empty */ }

	const scalar = 10 ** Math.max(t1, t2);
	const r1 = arg1 * scalar;
	const r2 = arg2 * scalar;

	return r1 / r2;
});
