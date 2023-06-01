export const def = (
	target: object, 
	key: PropertyKey, 
	value: any, 
	options: PropertyDescriptor
) => {
	Object.defineProperty(target, key, {
		value,
		enumerable: false,
		writable: true,
		configurable: true,
		...options
	});
};