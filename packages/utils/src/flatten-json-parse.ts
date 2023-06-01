/**
 * 格式转换
 * '1' -> 1
 * '{}' -> {}
 * '9007199254740992' -> '9007199254740992'
 * '9007199254740991' -> 9007199254740991 
 * @param {[string]} value 输入
 * @returns {any} ~
 */
export const flattenJSONParse = (value: string | null): any => {
	if (value === null) return null;
	
	let regex = /^\d+$/;
	// 数字字符串长度超过17，JSON.parse()会将后面的数组变成0
	if (
		regex.test(value) 
		&& value.length >= 16 
		&& +value > Number.MAX_SAFE_INTEGER
	) {
		return value;
	}

	let need = true;
	let safeCount = 1;
	let parseValue: any = value;
	while (need) {
		/* istanbul ignore next */
		if (safeCount > 1000) {
			throw new Error(value);
		}
		try {
			let next = JSON.parse(parseValue);
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
