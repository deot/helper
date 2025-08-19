/* eslint-disable @typescript-eslint/no-unused-vars */
export const flatten = (value: any, parser?: ((x: any) => any), exit?: ((x: any) => boolean)) => {
	let need = true;
	let safeCount = 1;
	let parseValue = value;
	while (need) {
		if (safeCount > 1000) {
			throw new Error(value);
		}
		try {
			const next = (parser || decodeURIComponent)(parseValue);
			if (parseValue === next || (typeof exit === 'function' && exit(next))) {
				need = false;
			}
			parseValue = next;
		} catch (_) {
			need = false;
		}
		safeCount++;
	}
	return parseValue;
};
