export const reverse = (v: Array<any> | String) => {
	if (typeof v === 'string') {
		return v.split('').reverse().join('');
	} else if (v instanceof Array) {
		return v.slice().reverse();
	}

	return v;
};