import { IS_SERVER } from '@deot/helper-shared';

export const el = (v: string | HTMLElement) => {
	if (IS_SERVER) return;

	let target: any;
	if (typeof v === 'object') {
		target = v;
	} else if (typeof v === 'string') {
		target = document.querySelector(v);
	}

	if (!target) {
		throw new Error('DOM: el缺失');
	}

	return target;
};