export interface ReverseFn {
	(v: string): string;
	<T>(v: T[]): T[];
	<T>(v: T): T;
}

export const reverse = ((v: any) => {
	/* istanbul ignore else -- @preserve */
	if (typeof v === 'string') {
		return v.split('').reverse().join('');
	} else if (v instanceof Array) {
		return v.slice().reverse();
	}

	return v;
}) as ReverseFn;
