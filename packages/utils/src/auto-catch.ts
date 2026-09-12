export const autoCatch = async (impl: any, options: Record<string, any> = {}) => {
	const { onError = console.error } = options;

	try {
		let target = impl;
		typeof target === 'function' && (target = target());
		const e = await target;
		return e;
	} catch (e) {
		onError(e);
	}
};
