export const flattenDecodeURIComponent = (value: string) => {
	let need = true;
	let safeCount = 1;
	let parseValue = value;
	while (need) {
		/* istanbul ignore next */
		if (safeCount > 1000) {
			console.log(value);
			throw new Error(value);
		}
		try {
			let next = decodeURIComponent(parseValue);
			if (parseValue === next) {
				need = false;
			}
			parseValue = next;
		} catch {
			need = false;
		}
		safeCount++;
	}
	return parseValue;
};
