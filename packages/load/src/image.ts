import { IS_SERVER } from './_constants';

// TODO: 增加maxTries
export const image = (src: string) => {
	if (IS_SERVER) return;
	
	if (image.cache.has(src)) {
		return image.cache.get(src);
	}

	let target = new Promise((resolve, reject) => {
		let el = new Image();
		el.src = src;
		el.onload = () => {
			let value = {
				source: src,
				width: el.naturalWidth,
				height: el.naturalHeight,
			};
			resolve(value);
		};

		el.onerror = (e) => {
			image.cache.delete(src);
			reject(e);
		};
	});

	image.cache.set(src, target);
	return target;
};

image.placeholder = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQYV2P48OP/fwAJqgPnYfITggAAAABJRU5ErkJggg==';
image.cache = new Map();