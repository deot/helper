// 氛围随机：均匀
export const range = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

// 加权随机：概率，用户传入的权重
export const probs = (weights: number[]) => {
	const sum = weights.reduce((pre, cur) => pre + (!cur || cur <= 0 ? 0 : cur), 0);
	if (!sum) {
		throw new Error('不可能得到索引值');
	}
	const probs$ = weights.map(i => i / sum);
	let index = 0;
	let r = Math.random();
	// 如果 r 小于 0，我可以选择，否则尝试下一个。
	while (r > 0) {
		r -= probs$[index];
		index++;
	}
	index--;
	return index;
};
