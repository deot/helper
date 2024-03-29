import { curry } from './curry';

type Add = (arg1: number, arg2: number) => number;
export const add: Add = curry((arg1, arg2) => {
	let r1: number;
	let r2: number;
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
	const c = Math.abs(r1 - r2);
	const m = 10 ** Math.max(r1, r2);
	if (c > 0) {
		const cm = 10 ** c;
		if (r1 > r2) {
			arg1 = Number(arg1.toString().replace('.', ''));
			arg2 = Number(arg2.toString().replace('.', '')) * cm;
		} else {
			arg1 = Number(arg1.toString().replace('.', '')) * cm;
			arg2 = Number(arg2.toString().replace('.', ''));
		}
	} else {
		arg1 = Number(arg1.toString().replace('.', ''));
		arg2 = Number(arg2.toString().replace('.', ''));
	}
	return (arg1 + arg2) / m;
});
