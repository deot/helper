import { instance } from './instance';

export const plainObject = (v?: any): v is Record<PropertyKey, any> => {
	if (!instance(v, 'Object')) {
		return false;
	}
	const prototype = Object.getPrototypeOf(v); // v.__proto__

	return (
		prototype === null
		|| prototype === Object.prototype
		|| Object.getPrototypeOf(prototype) === null
	) && !(Symbol.toStringTag in v) && !(Symbol.iterator in v);
};
