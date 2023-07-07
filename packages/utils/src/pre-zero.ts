// 小于10的数字前面加0
export const preZero = (num: number): string => {
	if (num < 10 && num > 0) {
		return "0" + num;
	} else if (num <= 0) {
		return '00';
	}
	return '' + num;
};