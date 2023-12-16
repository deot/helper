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

	const r1 = Number(arg1.toString().replace('.', ''));
	const r2 = Number(arg2.toString().replace('.', ''));
	return (r1 / r2) * (10 ** (t2 - t1));
});
