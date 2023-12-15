import { curry } from './curry';

type Multiply = (arg1: number, arg2: number) => number;
export const multiply: Multiply = curry((arg1: number, arg2: number) => {
	let m = 0;
	const s1 = arg1.toString();
	const s2 = arg2.toString();
	try {
		m += s1.split('.')[1].length;
	} catch (e) { /* empty */ }
	try {
		m += s2.split('.')[1].length;
	} catch (e) { /* empty */ }

	return (Number(s1.replace('.', '')) * Number(s2.replace('.', ''))) / (10 ** m);
});
