import { IS_SERVER } from './_constants';
import { load } from './_utils';

export interface LoadImageOptions {
	// 总尝试次数，默认 1（不重试）
	maxTries?: number;
	crossOrigin?: '' | 'anonymous' | 'use-credentials';
}

export interface LoadImageResult {
	source: string;
	width: number;
	height: number;
}

export const image = (src: string, options?: LoadImageOptions): Promise<LoadImageResult> | undefined => {
	if (IS_SERVER) return;

	const { maxTries = 1, crossOrigin } = options || {};

	return load(image.cache, 'image', src, (resolve, reject) => {
		const run = (tries: number) => {
			const el = new Image();
			if (typeof crossOrigin === 'string') {
				el.crossOrigin = crossOrigin;
			}

			el.onload = () => {
				resolve({
					source: src,
					width: el.naturalWidth,
					height: el.naturalHeight,
				});
			};

			el.onerror = (e) => {
				if (tries < maxTries) {
					run(tries + 1);
				} else {
					reject(e);
				}
			};

			el.src = src;
		};

		run(1);
	});
};

image.placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';
image.cache = new Map<string, Promise<LoadImageResult>>();
