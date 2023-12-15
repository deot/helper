export const reverse = (v: any[] | string) => {
	/* istanbul ignore else -- @preserve */
	if (typeof v === 'string') {
		return v.split('').reverse().join('');
	} else if (v instanceof Array) {
		return v.slice().reverse();
	}

	return v;
};
