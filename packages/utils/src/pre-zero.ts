// 小于10的数字前面加0，负数保留符号：-5 -> '-05'
export const preZero = (num: number): string => {
	if (num < 0) {
		return '-' + preZero(-num);
	}

	return num < 10 ? '0' + num : '' + num;
};
