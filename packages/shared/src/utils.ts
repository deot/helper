import type { Options } from './global.types';

export class Utils {
	static autoCatch = async (impl: any, options: Options = {}) => { 
		const { onError = console.error } = options;

		let target = impl;
		typeof target === 'function' && (target = target());

		try {
			const e = await target;
			return e;
		} catch (e) {
			onError(e);
		}
	};
}
