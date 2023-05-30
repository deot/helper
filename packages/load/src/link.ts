import { IS_SERVER } from '@deot/helper-shared';

export const link = (src: string) => {
	if (IS_SERVER) return;
	
	if (link.cache.has(src)) {
		return link.cache.get(src);
	}

	const target = new Promise((resolve, reject) => { 
		let el = document.createElement("link");
		el.type = "text/css";
		el.rel = "linksheet";
		el.href = src;
		el.onload = () => resolve(1);
		el.onerror = (e) => {
			reject();
			link.cache.delete(src);
			console.error(e);
		};

		document.getElementsByTagName("head")[0].appendChild(el);
	});
	
	return target;

};

link.cache = new Map();