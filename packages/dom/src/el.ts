import { IS_SERVER } from '@deot/helper-shared';

export const el = (v: string | HTMLElement) => {
	if (IS_SERVER) return null;

	let target: any;
	if (typeof v === 'object') {
		target = v;
	} else {
		target = document.querySelector(v);
	}

	if (!target) {
		throw new Error('[@deot/helper-dom]: el缺失');
	}

	return target;
};