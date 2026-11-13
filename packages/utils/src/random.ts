// 范围随机：均匀
export const range = (min: number, max: number) => {
	return Math.floor(Math.random() * (max - min + 1) + min);
};

// 加权随机：概率，用户传入的权重
export const probs = (weights: number[]) => {
	// 非正数、NaN 一律视为 0，求和与抽取使用同一份权重
	const weights$ = weights.map(i => (i > 0 ? i : 0));
	const sum = weights$.reduce((pre, cur) => pre + cur, 0);
	if (!sum) {
		throw new Error('不可能得到索引值');
	}

	let r = Math.random() * sum;
	let last = -1;
	for (let i = 0; i < weights$.length; i++) {
		if (!weights$[i]) continue;
		last = i;
		r -= weights$[i];
		if (r < 0) return i;
	}

	// 浮点累加误差兜底：落在最后一个有效权重上
	return last;
};
