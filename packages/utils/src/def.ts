export const def = <T = object>(
	target: T,
	key: PropertyKey,
	value?: any,
	options?: PropertyDescriptor
): T => {
	return Object.defineProperty<T>(target, key, {
		value,
		enumerable: false,
		writable: true,
		configurable: true,
		...options
	});
};
