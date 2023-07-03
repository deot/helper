import { IS_SERVER } from '@deot/helper-shared';

interface LoadScriptOptions {
	async?: boolean; 
}
export const script = (src: string, options?: LoadScriptOptions) => {
	if (IS_SERVER) return;
	
	if (script.cache.has(src)) {
		return script.cache.get(src);
	}

	let target = new Promise((resolve, reject) => {
		const el = document.createElement('script');
		const isNeedSync = options?.async === false;
		if (!isNeedSync) {
			el.src = src;
			el.onload = () => resolve(1);
			el.onerror = (e) => {
				script.cache.delete(src);
				reject(e);
			};
		} else {
			let xhr = new XMLHttpRequest();
			xhr.open('GET', src, false); // Deprecation
			xhr.send();
			el.innerHTML = xhr.responseText;
		}
		
		document.getElementsByTagName("head")[0].appendChild(el);
		isNeedSync && resolve(1);
	});

	script.cache.set(src, target);
	return target;
};

script.cache = new Map();