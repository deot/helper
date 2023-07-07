// 中间4位 * 号加密
export const asterisk = (value: string, from?: number, length?: number) => {
	from = from || 3;
	length = length || 4;
	let repeat = length;
	let content = value.substring(0, from);

	while (repeat) {
		content += '*';
		repeat--;
	}

	content += value.substring(from + length);
	return content;
};
