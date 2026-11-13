export const buffer = (v?: any): boolean => {
	const constructor = v?.constructor;
	return typeof constructor?.isBuffer === 'function' && !!constructor.isBuffer(v);
};
