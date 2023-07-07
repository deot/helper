export const flattenDecodeURIComponent = (value: string) => {
	let need = true;
	let safeCount = 1;
	let parseValue = value;
	while (need) {
		if (safeCount > 1000) {
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
